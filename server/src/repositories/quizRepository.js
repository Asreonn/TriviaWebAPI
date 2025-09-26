import mongoose from 'mongoose';
import { Quiz } from '../models/Quiz.js';

const buildMatchStage = (filters = {}) => {
    const match = { status: 'approved' };

    if (filters.category) {
        match.category = filters.category.toLowerCase();
    }

    if (filters.difficulty) {
        match.difficulty = filters.difficulty.toLowerCase();
    }

    if (filters.type) {
        match.type = filters.type;
    }

    if (filters.author) {
        match.author = new RegExp(filters.author, 'i');
    }

    return match;
};

export const QuizRepository = {
    create: (quizData) => Quiz.create(quizData),

    findById: (id) => Quiz.findById(id),

    updateStatus: (id, status, reviewData = {}) =>
        Quiz.findByIdAndUpdate(
            id,
            {
                status,
                review: {
                    ...reviewData,
                    decision: status,
                    reviewedAt: new Date(),
                },
            },
            { new: true }
        ),

    findPending: (page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        return Quiz.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    },

    countPending: () => Quiz.countDocuments({ status: 'pending' }),

    getStats: async () => {
        const [statusCounts, difficultyCounts, categoryCounts, total] = await Promise.all([
            Quiz.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Quiz.aggregate([
                { $group: { _id: '$difficulty', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Quiz.aggregate([
                { $match: { status: 'approved' } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Quiz.countDocuments(),
        ]);

        const statusMap = statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        return {
            counts: {
                pending: statusMap.pending ?? 0,
                approved: statusMap.approved ?? 0,
                rejected: statusMap.rejected ?? 0,
                draft: statusMap.draft ?? 0,
                total,
            },
            byDifficulty: difficultyCounts,
            byCategory: categoryCounts,
        };
    },

    findRandomApproved: async (filters) => {
        const matchStage = buildMatchStage(filters);
        const [quiz] = await Quiz.aggregate([
            { $match: matchStage },
            { $sample: { size: 1 } },
        ]);

        return quiz ? Quiz.hydrate(quiz) : null;
    },

    incrementServedMetrics: (id) =>
        Quiz.findByIdAndUpdate(
            id,
            {
                $inc: { 'metadata.servedCount': 1 },
                $set: { 'metadata.lastServedAt': new Date() },
            },
            { new: true }
        ),

    getAvailableFilters: async () => {
        const [categories, authors, difficulties, types] = await Promise.all([
            Quiz.distinct('category', { status: 'approved' }),
            Quiz.distinct('author', { status: 'approved' }),
            Quiz.distinct('difficulty', { status: 'approved' }),
            Quiz.distinct('type', { status: 'approved' }),
        ]);

        return { categories, authors, difficulties, types };
    },

    bulkApprove: (ids, reviewData) =>
        Quiz.updateMany(
            { _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } },
            {
                $set: {
                    status: 'approved',
                    review: {
                        ...reviewData,
                        decision: 'approved',
                        reviewedAt: new Date(),
                    },
                },
            }
        ),
};

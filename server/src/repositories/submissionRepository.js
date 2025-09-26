import { Submission } from '../models/Submission.js';

export const SubmissionRepository = {
    create: (submission) => Submission.create(submission),

    updateStatus: (id, status, review) =>
        Submission.findByIdAndUpdate(
            id,
            {
                status,
                review: {
                    ...review,
                    decision: status,
                    reviewedAt: new Date(),
                },
            },
            { new: true }
        ),

    findByQuizId: (quizId) => Submission.findOne({ quizId }),

    getStats: async () => {
        const [pending, total] = await Promise.all([
            Submission.countDocuments({ status: 'pending' }),
            Submission.countDocuments(),
        ]);

        return { pending, total };
    },
};

import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
        },
        type: {
            type: String,
            enum: ['multiple', 'boolean'],
            default: 'multiple',
        },
        category: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        answers: {
            type: [String],
            default: undefined,
            validate: {
                validator: function (value) {
                    if (this.type === 'boolean') {
                        return !value || value.length === 0;
                    }
                    return Array.isArray(value) && value.length >= 2 && value.length <= 6;
                },
                message: 'Multiple choice questions must include between 2 and 6 answers',
            },
        },
        correctAnswer: {
            type: Number,
            min: 0,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['kolay', 'orta', 'zor'],
            default: 'kolay',
            index: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['draft', 'pending', 'approved', 'rejected', 'archived'],
            default: 'pending',
            index: true,
        },
        submission: {
            submittedBy: {
                type: String,
                trim: true,
                default: null,
            },
            submittedAt: {
                type: Date,
                default: Date.now,
            },
        },
        review: {
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Admin',
            },
            reviewedAt: {
                type: Date,
            },
            decision: {
                type: String,
                enum: ['approved', 'rejected'],
            },
            reason: String,
        },
        metadata: {
            servedCount: {
                type: Number,
                default: 0,
            },
            lastServedAt: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

quizSchema.index({ status: 1, category: 1, difficulty: 1 });
quizSchema.index({ 'review.reviewedAt': -1 });

export const Quiz = mongoose.model('Quiz', quizSchema);

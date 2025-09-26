import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
    {
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
            index: true,
        },
        submittedBy: {
            type: String,
            trim: true,
            required: true,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        metadata: {
            userAgent: String,
            ipAddress: String,
        },
        review: {
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Admin',
            },
            reviewedAt: Date,
            decision: {
                type: String,
                enum: ['approved', 'rejected'],
            },
            reason: String,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

submissionSchema.index({ status: 1, submittedAt: -1 });

export const Submission = mongoose.model('Submission', submissionSchema);

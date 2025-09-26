import mongoose from 'mongoose';
import os from 'os';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const healthCheck = asyncHandler((req, res) => {
    const response = new ApiResponse({
        message: 'Healthy',
        data: {
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage().rss,
            cpuLoad: os.loadavg()[0],
            mongoState: mongoose.connection.readyState,
        },
        traceId: req.traceId,
    });

    res.status(200).json(response);
});

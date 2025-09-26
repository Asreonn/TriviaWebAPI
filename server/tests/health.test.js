import request from 'supertest';
import { app } from '../src/app.js';

describe('Health endpoints', () => {
    it('returns healthy status', async () => {
        const response = await request(app).get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            success: true,
            message: 'Healthy',
        });
        expect(response.body.data).toHaveProperty('uptime');
        expect(response.headers).toHaveProperty('x-trace-id');
    });
});

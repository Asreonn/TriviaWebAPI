import request from 'supertest';
import { clearTestDatabase, connectTestDatabase, disconnectTestDatabase } from './helpers/db.js';

let app;
let Quiz;

beforeAll(async () => {
    await connectTestDatabase();
    ({ app } = await import('../src/app.js'));
    ({ Quiz } = await import('../src/models/Quiz.js'));
});

afterEach(async () => {
    await clearTestDatabase();
});

afterAll(async () => {
    await disconnectTestDatabase();
});

describe('Quiz submission flow', () => {
    it('rejects invalid quiz payload', async () => {
        const response = await request(app).post('/api/quizzes').send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('accepts a valid quiz submission and stores it as pending', async () => {
        const payload = {
            question: 'Dünyanın uydusunun adı nedir?',
            type: 'multiple',
            category: 'Bilim',
            answers: ['Ay', 'Mars', 'Venüs', 'Jüpiter'],
            correctAnswer: 0,
            author: 'Test Kullanıcısı',
            difficulty: 'kolay',
        };

        const response = await request(app).post('/api/quizzes').send(payload);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.quiz.status).toBe('pending');
        expect(response.body.data.quiz.category).toBe('bilim');

        const stored = await Quiz.findOne({ question: payload.question });
        expect(stored).toBeTruthy();
        expect(stored.status).toBe('pending');
        expect(stored.category).toBe('bilim');
    });
});

describe('Random quiz retrieval', () => {
    it('returns an approved quiz matching filters', async () => {
        const quiz = await Quiz.create({
            question: 'Türkiye nin başkenti neresidir?',
            type: 'multiple',
            category: 'geografi',
            answers: ['Ankara', 'İstanbul', 'İzmir', 'Bursa'],
            correctAnswer: 0,
            author: 'Admin',
            difficulty: 'kolay',
            status: 'approved',
        });

        const response = await request(app)
            .get('/api/quizzes/random')
            .query({ category: 'geografi' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.quiz.id).toBe(quiz.id);
        expect(response.body.data.filters.categories).toContain('geografi');
    });

    it('responds gracefully when no quiz matches filters', async () => {
        const response = await request(app)
            .get('/api/quizzes/random')
            .query({ category: 'mitoloji' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.quiz).toBeNull();
    });
});

import request from 'supertest';
import { clearTestDatabase, connectTestDatabase, disconnectTestDatabase } from './helpers/db.js';

let app;
let Admin;
let Quiz;
let hashPassword;

const basePermissions = [
    'view_stats',
    'view_pending_quizzes',
    'approve_quizzes',
    'reject_quizzes',
];

beforeAll(async () => {
    await connectTestDatabase();
    ({ app } = await import('../src/app.js'));
    ({ Admin } = await import('../src/models/Admin.js'));
    ({ Quiz } = await import('../src/models/Quiz.js'));
    ({ hashPassword } = await import('../src/services/authService.js'));
});

afterEach(async () => {
    await clearTestDatabase();
});

afterAll(async () => {
    await disconnectTestDatabase();
});

const createAdmin = async ({ username = 'admin', password = 'StrongPass1!', permissions = basePermissions } = {}) => {
    const passwordHash = await hashPassword(password);
    const admin = await Admin.create({
        username,
        passwordHash,
        displayName: 'Test Admin',
        permissions,
        roles: ['admin'],
    });
    return { admin, password };
};

describe('Admin authentication', () => {
    it('allows a valid administrator to log in', async () => {
        const credentials = await createAdmin({ username: 'moderator', password: 'Moderator42!' });

        const response = await request(app).post('/api/admin/login').send({
            username: 'moderator',
            password: credentials.password,
        });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.admin.username).toBe('moderator');
        expect(response.body.data.token).toBeTruthy();
        expect(response.body.data.refreshToken).toBeTruthy();
    });

    it('rejects incorrect credentials', async () => {
        await createAdmin({ username: 'reviewer', password: 'Reviewer55!' });

        const response = await request(app).post('/api/admin/login').send({
            username: 'reviewer',
            password: 'WrongPassword',
        });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe('Admin quiz review workflow', () => {
    const loginAndGetToken = async () => {
        await createAdmin({ username: 'approver', password: 'Approve77!' });
        const response = await request(app).post('/api/admin/login').send({
            username: 'approver',
            password: 'Approve77!',
        });
        return response.body.data.token;
    };

    it('lists pending quizzes for authorized admin', async () => {
        const token = await loginAndGetToken();

        await Quiz.create({
            question: 'Test sorusu nedir?',
            type: 'multiple',
            category: 'genel',
            answers: ['Cevap 1', 'Cevap 2'],
            correctAnswer: 0,
            author: 'Kullanıcı',
            difficulty: 'kolay',
            status: 'pending',
        });

        const response = await request(app)
            .get('/api/admin/quizzes/pending')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.quizzes).toHaveLength(1);
        expect(response.body.data.pagination.total).toBe(1);
    });

    it('approves a pending quiz', async () => {
        const token = await loginAndGetToken();

        const quiz = await Quiz.create({
            question: 'Onaylanacak soru?',
            type: 'multiple',
            category: 'genel',
            answers: ['Evet', 'Hayır'],
            correctAnswer: 0,
            author: 'Katılımcı',
            difficulty: 'orta',
            status: 'pending',
        });

        const response = await request(app)
            .post(`/api/admin/quizzes/${quiz.id}/approve`)
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const updated = await Quiz.findById(quiz.id);
        expect(updated.status).toBe('approved');
    });

    it('rejects a pending quiz with reason', async () => {
        const token = await loginAndGetToken();

        const quiz = await Quiz.create({
            question: 'Reddedilecek soru?',
            type: 'multiple',
            category: 'genel',
            answers: ['Seçenek 1', 'Seçenek 2'],
            correctAnswer: 1,
            author: 'Katılımcı',
            difficulty: 'zor',
            status: 'pending',
        });

        const response = await request(app)
            .post(`/api/admin/quizzes/${quiz.id}/reject`)
            .set('Authorization', `Bearer ${token}`)
            .send({ reason: 'Soru yeterince açık değil' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const updated = await Quiz.findById(quiz.id);
        expect(updated.status).toBe('rejected');
        expect(updated.review.reason).toBe('Soru yeterince açık değil');
    });
});

process.env.NODE_ENV = 'test';

jest.mock('../src/models/User', () => {
  const users = [];

  const User = {
    findOne: jest.fn(async ({ email }) => users.find((user) => user.email === email) || null),
    create: jest.fn(async (payload) => {
      const user = {
        ...payload,
        _id: `user-${users.length + 1}`,
        role: payload.role || 'student',
        toPublicJSON() {
          const { password, ...rest } = this;
          return rest;
        },
        async matchPassword(candidate) {
          return candidate === this.password;
        },
      };
      users.push(user);
      return user;
    }),
    findById: jest.fn(async (id) => users.find((user) => user._id === id) || null),
  };

  return User;
});

jest.mock('../src/middleware/auth', () => {
  const generateToken = (user) => `mock-token-${user.email}`;

  const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    req.user = {
      _id: 'user-1',
      email: 'student1@example.com',
      name: 'Student One',
      role: 'student',
      toPublicJSON() {
        return {
          _id: this._id,
          email: this.email,
          name: this.name,
          role: this.role,
        };
      },
    };
    return next();
  };

  const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have access to this resource' });
    }
    return next();
  };

  return { generateToken, protect, authorize };
});

const request = require('supertest');
const app = require('../src/app');

describe('Authentication and authorization flow', () => {
  it('registers a new student account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Student One',
        email: 'student1@example.com',
        password: 'Password123',
        role: 'admin',
        hostel: 'Main Hostel',
        block: 'A',
        roomNumber: '101',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('student');
    expect(res.body.token).toBeTruthy();
  });

  it('logs in and returns current user for protected route', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'student1@example.com',
      password: 'Password123',
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.user.email).toBe('student1@example.com');

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer mock-token-student1@example.com');

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user.email).toBe('student1@example.com');
  });

  it('rejects a protected request without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('rejects invalid registration data', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'S',
      email: 'not-an-email',
      password: 'short',
      hostel: '',
      block: '',
      roomNumber: '',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('prevents a student from accessing administrator APIs', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', 'Bearer mock-token-student1@example.com');

    expect(res.statusCode).toBe(403);
  });
});

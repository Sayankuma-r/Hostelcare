process.env.NODE_ENV = 'test';

jest.mock('../src/models/Feedback', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('../src/models/Complaint', () => ({
  findById: jest.fn(),
}));

jest.mock('../src/middleware/auth', () => {
  const protect = (req, res, next) => {
    req.user = {
      _id: '111111111111111111111111',
      role: req.headers.authorization === 'Bearer admin-token'
        ? 'admin'
        : req.headers.authorization === 'Bearer staff-token'
          ? 'staff'
          : 'student',
    };
    return next();
  };
  const authorize = (...roles) => (req, res, next) => (
    roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ success: false, message: 'You do not have access to this resource' })
  );
  return { protect, authorize };
});

const request = require('supertest');
const Feedback = require('../src/models/Feedback');
const Complaint = require('../src/models/Complaint');
const app = require('../src/app');

const complaintId = '222222222222222222222222';
const validPayload = { complaintId, rating: 5, comment: 'The repair was completed quickly.' };

const buildQuery = (result) => {
  const query = {
    populate: jest.fn(() => query),
    sort: jest.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
};

describe('Feedback workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Complaint.findById.mockResolvedValue({
      _id: complaintId,
      studentId: '111111111111111111111111',
      status: 'CLOSED',
    });
    Feedback.findOne.mockResolvedValue(null);
    Feedback.create.mockImplementation(async (feedback) => ({ _id: 'feedback-1', ...feedback }));
  });

  it('accepts one valid feedback submission for the student’s resolved complaint', async () => {
    const response = await request(app)
      .post('/api/feedback')
      .send(validPayload);

    expect(response.statusCode).toBe(201);
    expect(Feedback.create).toHaveBeenCalledWith({
      complaintId,
      studentId: '111111111111111111111111',
      rating: 5,
      comment: 'The repair was completed quickly.',
    });
  });

  it('rejects feedback for complaints that are not resolved', async () => {
    Complaint.findById.mockResolvedValue({
      _id: complaintId,
      studentId: '111111111111111111111111',
      status: 'IN_PROGRESS',
    });

    const response = await request(app).post('/api/feedback').send(validPayload);

    expect(response.statusCode).toBe(400);
    expect(Feedback.create).not.toHaveBeenCalled();
  });

  it('prevents a student from reviewing another student complaint', async () => {
    Complaint.findById.mockResolvedValue({
      _id: complaintId,
      studentId: '333333333333333333333333',
      status: 'CLOSED',
    });

    const response = await request(app).post('/api/feedback').send(validPayload);

    expect(response.statusCode).toBe(403);
    expect(Feedback.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate feedback', async () => {
    Feedback.findOne.mockResolvedValue({ _id: 'feedback-existing' });

    const response = await request(app).post('/api/feedback').send(validPayload);

    expect(response.statusCode).toBe(409);
    expect(Feedback.create).not.toHaveBeenCalled();
  });

  it('allows admins to read feedback and blocks staff access', async () => {
    Feedback.find.mockReturnValue(buildQuery([]));

    const adminResponse = await request(app)
      .get('/api/feedback')
      .set('Authorization', 'Bearer admin-token');
    const staffResponse = await request(app)
      .get('/api/feedback')
      .set('Authorization', 'Bearer staff-token');

    expect(adminResponse.statusCode).toBe(200);
    expect(Feedback.find).toHaveBeenCalledWith({});
    expect(staffResponse.statusCode).toBe(403);
  });
});

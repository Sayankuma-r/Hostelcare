process.env.NODE_ENV = 'test';

jest.mock('../src/models/Complaint', () => ({
  aggregate: jest.fn(async () => []),
  countDocuments: jest.fn(async () => 0),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  find: jest.fn(async () => []),
}));

jest.mock('../src/models/Notification', () => ({
  create: jest.fn(),
}));

jest.mock('../src/middleware/auth', () => {
  const protect = (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    req.user = { _id: 'student-1', name: 'Student One', role: 'student' };
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
const fs = require('fs/promises');
const path = require('path');
const Complaint = require('../src/models/Complaint');
const app = require('../src/app');

const buildQuery = (result) => {
  const query = {
    sort: jest.fn(() => query),
    skip: jest.fn(() => query),
    limit: jest.fn(() => query),
    populate: jest.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
};

const complaintPayload = {
  title: 'Broken shower in room',
  description: 'The shower has been leaking since yesterday morning.',
  category: 'Plumbing',
  priority: 'High',
  hostel: 'Main Hostel',
  block: 'B',
  roomNumber: '204',
};

describe('Student complaint workflow', () => {
  let savedComplaint;

  beforeEach(() => {
    jest.clearAllMocks();
    savedComplaint = {
      _id: 'complaint-1',
      complaintId: 'HC-20261112-AB123',
      studentId: 'student-1',
      ...complaintPayload,
      status: 'SUBMITTED',
      imageUrl: '',
    };
    Complaint.create.mockImplementation(async (payload) => {
      savedComplaint = { ...savedComplaint, ...payload };
      return savedComplaint;
    });
    Complaint.findById.mockImplementation(() => buildQuery(savedComplaint));
    Complaint.find.mockReturnValue(buildQuery([]));
    Complaint.aggregate.mockResolvedValue([]);
  });

  it('creates a student complaint with an initial status history entry', async () => {
    const response = await request(app)
      .post('/api/complaints')
      .set('Authorization', 'Bearer test-token')
      .field(complaintPayload);

    expect(response.statusCode).toBe(201);
    expect(response.body.complaint.status).toBe('SUBMITTED');
    expect(Complaint.create).toHaveBeenCalledWith(expect.objectContaining({
      studentId: 'student-1',
      status: 'SUBMITTED',
      statusHistory: [expect.objectContaining({ from: 'NEW', to: 'SUBMITTED' })],
    }));
  });

  it('rejects invalid complaint fields before writing data', async () => {
    const response = await request(app)
      .post('/api/complaints')
      .set('Authorization', 'Bearer test-token')
      .field({ ...complaintPayload, title: 'bad', category: 'Unknown' });

    expect(response.statusCode).toBe(400);
    expect(Complaint.create).not.toHaveBeenCalled();
  });

  it('rejects unsupported image types', async () => {
    const response = await request(app)
      .post('/api/complaints')
      .set('Authorization', 'Bearer test-token')
      .field(complaintPayload)
      .attach('image', Buffer.from('not an image'), { filename: 'malware.txt', contentType: 'text/plain' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/JPEG, PNG, or WebP/);
    expect(Complaint.create).not.toHaveBeenCalled();
  });

  it('accepts a supported image and returns its upload path', async () => {
    const response = await request(app)
      .post('/api/complaints')
      .set('Authorization', 'Bearer test-token')
      .field(complaintPayload)
      .attach('image', Buffer.from([137, 80, 78, 71]), { filename: 'leak.png', contentType: 'image/png' });

    expect(response.statusCode).toBe(201);
    expect(response.body.complaint.imageUrl).toMatch(/^\/uploads\/[a-f0-9]{32}\.png$/);

    const filename = response.body.complaint.imageUrl.split('/').pop();
    await fs.unlink(path.join(__dirname, '..', 'uploads', filename));
  });

  it('returns dashboard counts derived from stored student complaints', async () => {
    Complaint.aggregate.mockResolvedValue([
      { _id: 'SUBMITTED', count: 2 },
      { _id: 'IN_PROGRESS', count: 1 },
      { _id: 'CLOSED', count: 3 },
    ]);

    const response = await request(app)
      .get('/api/complaints/dashboard')
      .set('Authorization', 'Bearer test-token');

    expect(response.statusCode).toBe(200);
    expect(response.body.stats).toEqual({ total: 6, pending: 2, inProgress: 1, resolved: 3 });
  });

  it('prevents a student from viewing another student complaint', async () => {
    Complaint.findById.mockReturnValue(buildQuery({
      ...savedComplaint,
      studentId: { _id: 'student-2' },
      assignedTo: { _id: 'staff-2' },
    }));

    const response = await request(app)
      .get('/api/complaints/complaint-1')
      .set('Authorization', 'Bearer test-token');

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/not allowed to view/i);
  });

  it('prevents a student from changing a complaint to a staff workflow status', async () => {
    savedComplaint.save = jest.fn();

    const response = await request(app)
      .patch('/api/complaints/complaint-1/status')
      .set('Authorization', 'Bearer test-token')
      .send({ status: 'IN_PROGRESS' });

    expect(response.statusCode).toBe(400);
    expect(savedComplaint.save).not.toHaveBeenCalled();
  });
});

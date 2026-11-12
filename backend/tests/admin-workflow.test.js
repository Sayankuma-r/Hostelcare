process.env.NODE_ENV = 'test';

jest.mock('../src/models/Complaint', () => ({
  aggregate: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  collection: { name: 'users' },
  countDocuments: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('../src/models/Notification', () => ({
  create: jest.fn(async (notification) => notification),
}));

jest.mock('../src/middleware/auth', () => {
  const protect = (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    req.user = { _id: 'admin-1', name: 'Warden', role: 'admin' };
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
const Complaint = require('../src/models/Complaint');
const User = require('../src/models/User');
const app = require('../src/app');

const buildQuery = (result) => {
  const query = {
    sort: jest.fn(() => query),
    skip: jest.fn(() => query),
    limit: jest.fn(() => query),
    select: jest.fn(() => query),
    populate: jest.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
};

describe('Administrator dashboard and assignment workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.countDocuments.mockResolvedValue(0);
    User.find.mockReturnValue(buildQuery([]));
    User.findOne.mockResolvedValue(null);
    User.findById.mockResolvedValue(null);
    Complaint.countDocuments.mockResolvedValue(0);
    Complaint.find.mockReturnValue(buildQuery([]));
    Complaint.aggregate.mockResolvedValue([]);
    Complaint.findById.mockResolvedValue(null);
  });

  it('returns dashboard analytics derived from database counts and aggregates', async () => {
    User.countDocuments.mockResolvedValue(7);
    Complaint.countDocuments.mockImplementation(async (filter) => {
      if (filter.status?.$in?.includes('SUBMITTED')) return 2;
      if (filter.status?.$in?.includes('RESOLVED')) return 4;
      if (filter.status === 'ASSIGNED') return 3;
      if (filter.status === 'IN_PROGRESS') return 1;
      return 10;
    });
    Complaint.aggregate.mockImplementation(async (pipeline) => {
      if (pipeline[0]?.$group?._id === '$category') return [{ _id: 'Plumbing', count: 3 }];
      if (pipeline[0]?.$group?._id === '$status') return [{ _id: 'SUBMITTED', count: 2 }];
      if (pipeline[0]?.$group?._id?.month) return [{ _id: { month: 11, year: 2026 }, count: 4 }];
      if (pipeline[0]?.$match?.assignedTo) return [{ _id: 'staff-1', name: 'Staff One', assignedCount: 4, resolvedCount: 3, resolutionRate: 75 }];
      return [];
    });

    const response = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', 'Bearer admin-token');

    expect(response.statusCode).toBe(200);
    expect(response.body.stats).toEqual({
      totalStudents: 7,
      totalComplaints: 10,
      pendingComplaints: 2,
      assignedComplaints: 3,
      inProgressComplaints: 1,
      resolvedComplaints: 4,
    });
    expect(response.body.staffPerformance[0].resolutionRate).toBe(75);
  });

  it('creates staff accounts with a staff role and never returns their password', async () => {
    User.create.mockImplementation(async (user) => ({
      ...user,
      toPublicJSON() {
        const { password, ...publicUser } = this;
        return publicUser;
      },
    }));

    const response = await request(app)
      .post('/api/admin/staff')
      .set('Authorization', 'Bearer admin-token')
      .send({ name: 'Staff One', email: 'STAFF@example.com', password: 'StrongPass123', phone: '5550100' });

    expect(response.statusCode).toBe(201);
    expect(response.body.user.role).toBe('staff');
    expect(response.body.user.email).toBe('staff@example.com');
    expect(response.body.user.password).toBeUndefined();
  });

  it('assigns a submitted complaint to a verified staff user', async () => {
    const complaint = {
      _id: 'complaint-1',
      complaintId: 'HC-1',
      studentId: 'student-1',
      assignedTo: null,
      status: 'SUBMITTED',
      statusHistory: [],
      save: jest.fn(async function save() { return this; }),
    };
    const staff = { _id: 'staff-1', role: 'staff', name: 'Staff One' };
    Complaint.findById.mockResolvedValue(complaint);
    User.findById.mockResolvedValue(staff);

    const response = await request(app)
      .patch('/api/complaints/complaint-1/assign')
      .set('Authorization', 'Bearer admin-token')
      .send({ staffId: 'staff-1' });

    expect(response.statusCode).toBe(200);
    expect(complaint.assignedTo).toBe('staff-1');
    expect(complaint.status).toBe('ASSIGNED');
    expect(complaint.statusHistory[0].to).toBe('ASSIGNED');
  });

  it('rejects invalid complaint priority values', async () => {
    const response = await request(app)
      .patch('/api/complaints/complaint-1/priority')
      .set('Authorization', 'Bearer admin-token')
      .send({ priority: 'Critical' });

    expect(response.statusCode).toBe(400);
    expect(Complaint.findById).not.toHaveBeenCalled();
  });
});

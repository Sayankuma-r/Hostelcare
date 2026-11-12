process.env.NODE_ENV = 'test';

jest.mock('../src/models/Complaint', () => ({
  aggregate: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../src/models/User', () => ({}));
jest.mock('../src/models/Notification', () => ({
  create: jest.fn(async (notification) => notification),
}));

jest.mock('../src/middleware/auth', () => {
  const protect = (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    req.user = { _id: 'staff-1', name: 'Staff One', role: 'staff' };
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

const makeComplaint = (status = 'ASSIGNED', assignedTo = 'staff-1') => ({
  _id: 'complaint-1',
  complaintId: 'HC-1',
  title: 'Water leak',
  status,
  assignedTo,
  studentId: 'student-1',
  statusHistory: [],
  save: jest.fn(async function save() { return this; }),
});

describe('Maintenance staff workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Complaint.countDocuments.mockImplementation(async (filter) => {
      if (filter.status === 'ASSIGNED') return 2;
      if (filter.status === 'IN_PROGRESS') return 1;
      if (filter.status?.$in) return 4;
      return 7;
    });
    Complaint.find.mockReturnValue(buildQuery([]));
    Complaint.findById.mockResolvedValue(makeComplaint());
  });

  it('returns counts limited to work assigned to the signed-in staff member', async () => {
    const response = await request(app)
      .get('/api/staff/dashboard')
      .set('Authorization', 'Bearer staff-token');

    expect(response.statusCode).toBe(200);
    expect(response.body.stats).toEqual({
      totalAssignedTasks: 7,
      pendingTasks: 2,
      inProgressTasks: 1,
      completedTasks: 4,
    });
    expect(Complaint.countDocuments).toHaveBeenCalledWith({ assignedTo: 'staff-1' });
  });

  it('uses the staff identity in assignment-list filters', async () => {
    const response = await request(app)
      .get('/api/staff/complaints?status=ASSIGNED&page=2')
      .set('Authorization', 'Bearer staff-token');

    expect(response.statusCode).toBe(200);
    expect(Complaint.countDocuments).toHaveBeenCalledWith({ assignedTo: 'staff-1', status: 'ASSIGNED' });
    expect(Complaint.find).toHaveBeenCalledWith({ assignedTo: 'staff-1', status: 'ASSIGNED' });
  });

  it('allows assigned staff to start work and resolve with notes', async () => {
    const assigned = makeComplaint('ASSIGNED');
    Complaint.findById.mockResolvedValue(assigned);
    const startResponse = await request(app)
      .patch('/api/complaints/complaint-1/status')
      .set('Authorization', 'Bearer staff-token')
      .send({ status: 'IN_PROGRESS', remarks: 'Work accepted' });

    expect(startResponse.statusCode).toBe(200);
    expect(assigned.status).toBe('IN_PROGRESS');

    const inProgress = makeComplaint('IN_PROGRESS');
    Complaint.findById.mockResolvedValue(inProgress);
    const resolveResponse = await request(app)
      .patch('/api/complaints/complaint-1/status')
      .set('Authorization', 'Bearer staff-token')
      .send({ status: 'RESOLVED', remarks: 'Replaced the damaged pipe and tested it.' });

    expect(resolveResponse.statusCode).toBe(200);
    expect(inProgress.status).toBe('RESOLVED');
    expect(inProgress.resolutionNote).toBe('Replaced the damaged pipe and tested it.');
  });

  it('prevents staff from updating a complaint assigned to someone else', async () => {
    const unassigned = makeComplaint('ASSIGNED', 'staff-2');
    Complaint.findById.mockResolvedValue(unassigned);

    const response = await request(app)
      .patch('/api/complaints/complaint-1/status')
      .set('Authorization', 'Bearer staff-token')
      .send({ status: 'IN_PROGRESS' });

    expect(response.statusCode).toBe(403);
    expect(unassigned.save).not.toHaveBeenCalled();
  });

  it('requires resolution notes before staff can mark work resolved', async () => {
    const inProgress = makeComplaint('IN_PROGRESS');
    Complaint.findById.mockResolvedValue(inProgress);

    const response = await request(app)
      .patch('/api/complaints/complaint-1/status')
      .set('Authorization', 'Bearer staff-token')
      .send({ status: 'RESOLVED', remarks: 'done' });

    expect(response.statusCode).toBe(400);
    expect(inProgress.save).not.toHaveBeenCalled();
  });
});

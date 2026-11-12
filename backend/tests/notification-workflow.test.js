process.env.NODE_ENV = 'test';

jest.mock('../src/models/Notification', () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  updateMany: jest.fn(),
}));

jest.mock('../src/middleware/auth', () => {
  const protect = (req, res, next) => {
    req.user = { _id: '111111111111111111111111', role: 'student' };
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
const Notification = require('../src/models/Notification');
const app = require('../src/app');

const buildQuery = (result) => {
  const query = {
    sort: jest.fn(() => query),
    limit: jest.fn(() => query),
    populate: jest.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
};

describe('Notification workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists only the signed-in user notifications and unread count', async () => {
    Notification.find.mockReturnValue(buildQuery([{ _id: 'notification-1' }]));
    Notification.countDocuments.mockResolvedValue(1);

    const response = await request(app).get('/api/notifications');

    expect(response.statusCode).toBe(200);
    expect(response.body.unreadCount).toBe(1);
    expect(Notification.find).toHaveBeenCalledWith({ userId: '111111111111111111111111' });
    expect(Notification.countDocuments).toHaveBeenCalledWith({
      userId: '111111111111111111111111',
      isRead: false,
    });
  });

  it('does not mark another user notification as read', async () => {
    Notification.findOne.mockResolvedValue(null);

    const response = await request(app)
      .patch('/api/notifications/222222222222222222222222/read');

    expect(response.statusCode).toBe(404);
    expect(Notification.findOne).toHaveBeenCalledWith({
      _id: '222222222222222222222222',
      userId: '111111111111111111111111',
    });
  });

  it('marks all and only the signed-in user unread notifications as read', async () => {
    Notification.updateMany.mockResolvedValue({ modifiedCount: 2 });

    const response = await request(app).patch('/api/notifications/read-all');

    expect(response.statusCode).toBe(200);
    expect(response.body.updatedCount).toBe(2);
    expect(Notification.updateMany).toHaveBeenCalledWith(
      { userId: '111111111111111111111111', isRead: false },
      { $set: { isRead: true } }
    );
  });

  it('rejects malformed notification IDs', async () => {
    const response = await request(app).patch('/api/notifications/not-an-id/read');

    expect(response.statusCode).toBe(400);
    expect(Notification.findOne).not.toHaveBeenCalled();
  });
});

process.env.NODE_ENV = 'test';

jest.mock('../src/models/Announcement', () => ({
  countDocuments: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock('../src/models/Notification', () => ({
  insertMany: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  find: jest.fn(),
}));

jest.mock('../src/middleware/auth', () => {
  const protect = (req, res, next) => {
    if (!req.headers.authorization) return res.status(401).json({ success: false, message: 'Authentication required' });
    req.user = {
      _id: '111111111111111111111111',
      role: req.headers['x-role'] || 'student',
      hostel: 'Main Hostel',
      block: 'B',
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
const Announcement = require('../src/models/Announcement');
const Notification = require('../src/models/Notification');
const User = require('../src/models/User');
const app = require('../src/app');

const buildQuery = (result) => {
  const query = {
    sort: jest.fn(() => query),
    limit: jest.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
};

const payload = {
  title: 'Water supply interruption',
  content: 'Water supply will be interrupted tomorrow morning for scheduled maintenance.',
  category: 'Water',
  priority: 'High',
  audience: ['student', 'staff'],
};

describe('Announcement workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists only published announcements relevant to the signed-in user and shows unread state', async () => {
    const announcement = {
      _id: 'announcement-1',
      title: payload.title,
      readBy: [],
      toObject() {
        return { ...this };
      },
    };
    Announcement.find.mockReturnValue(buildQuery([announcement]));
    Announcement.countDocuments.mockResolvedValue(1);

    const response = await request(app)
      .get('/api/announcements')
      .set('Authorization', 'Bearer student-token');

    expect(response.statusCode).toBe(200);
    expect(response.body.unreadCount).toBe(1);
    expect(response.body.announcements[0]).toEqual(expect.objectContaining({ isRead: false }));
    expect(response.body.announcements[0].readBy).toBeUndefined();
    expect(Announcement.find).toHaveBeenCalledWith(expect.objectContaining({
      status: 'Published',
      audience: 'student',
      hostel: { $in: ['', 'Main Hostel'] },
      block: { $in: ['', 'B'] },
    }));
  });

  it('does not disclose draft or out-of-audience announcement details', async () => {
    Announcement.findOne.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/announcements/222222222222222222222222')
      .set('Authorization', 'Bearer student-token');

    expect(response.statusCode).toBe(404);
    expect(Announcement.findOne).toHaveBeenCalledWith(expect.objectContaining({
      _id: '222222222222222222222222',
      status: 'Published',
      audience: 'student',
    }));
  });

  it('marks read only after confirming the announcement is in the user audience', async () => {
    Announcement.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'announcement-1' }),
    });
    Announcement.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const response = await request(app)
      .patch('/api/announcements/222222222222222222222222/read')
      .set('Authorization', 'Bearer student-token');

    expect(response.statusCode).toBe(200);
    expect(Announcement.updateOne).toHaveBeenCalledWith(
      { _id: 'announcement-1' },
      { $addToSet: { readBy: '111111111111111111111111' } }
    );
  });

  it('restricts publishing to admins and notifies the announcement audience for important notices', async () => {
    const denied = await request(app)
      .post('/api/announcements')
      .set('Authorization', 'Bearer student-token')
      .send({ ...payload, status: 'Published' });
    expect(denied.statusCode).toBe(403);
    expect(Announcement.create).not.toHaveBeenCalled();

    const announcement = {
      _id: 'announcement-1',
      ...payload,
      status: 'Published',
      createdBy: 'admin-1',
      toObject() {
        return { ...this };
      },
    };
    Announcement.create.mockResolvedValue(announcement);
    User.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ _id: 'student-1' }, { _id: 'staff-1' }]),
    });
    Notification.insertMany.mockResolvedValue([]);

    const response = await request(app)
      .post('/api/announcements')
      .set('Authorization', 'Bearer admin-token')
      .set('x-role', 'admin')
      .send({ ...payload, status: 'Published' });

    expect(response.statusCode).toBe(201);
    expect(User.find).toHaveBeenCalledWith({ role: { $in: ['student', 'staff'] } });
    expect(Notification.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({ userId: 'student-1', announcementId: 'announcement-1' }),
      expect.objectContaining({ userId: 'staff-1', announcementId: 'announcement-1' }),
    ]);
  });
});

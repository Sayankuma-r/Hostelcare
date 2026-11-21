jest.mock('../src/config/db', () => jest.fn().mockResolvedValue());
jest.mock('../src/models/User', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock('mongoose', () => ({
  disconnect: jest.fn().mockResolvedValue(),
}));

const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const mongoose = require('mongoose');
const seedAdmin = require('../src/utils/seed');

describe('admin account seeding', () => {
  const originalEnvironment = {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_NAME: process.env.ADMIN_NAME,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_EMAIL = 'warden@example.test';
    process.env.ADMIN_PASSWORD = 'a-strong-test-password';
    process.env.ADMIN_NAME = 'Test Warden';
  });

  afterAll(() => {
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('promotes the configured existing account instead of reporting it already exists', async () => {
    const account = { role: 'student', password: 'old-password', save: jest.fn().mockResolvedValue() };
    User.findOne.mockResolvedValue(account);

    await seedAdmin();

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'warden@example.test' });
    expect(account.role).toBe('admin');
    expect(account.password).toBe('a-strong-test-password');
    expect(account.save).toHaveBeenCalledTimes(1);
    expect(User.create).not.toHaveBeenCalled();
    expect(mongoose.disconnect).toHaveBeenCalledTimes(1);
  });

  it('creates a new administrator using the configured credentials', async () => {
    User.findOne.mockResolvedValue(null);

    await seedAdmin();

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Warden',
      email: 'warden@example.test',
      password: 'a-strong-test-password',
      role: 'admin',
    }));
    expect(mongoose.disconnect).toHaveBeenCalledTimes(1);
  });
});

process.env.JWT_SECRET = 'test-secret-with-more-than-32-characters';

jest.mock('../src/models/User', () => ({
  findById: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const { authorize, generateToken, protect } = require('../src/middleware/auth');

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe('Authentication middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects missing and invalid bearer tokens', async () => {
    const response = createResponse();
    const next = jest.fn();

    await protect({ headers: {} }, response, next);
    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();

    const invalidResponse = createResponse();
    await protect({ headers: { authorization: 'Bearer invalid' } }, invalidResponse, next);
    expect(invalidResponse.status).toHaveBeenCalledWith(401);
  });

  it('loads the current user from the database for a valid token', async () => {
    const user = { _id: 'user-id', role: 'staff' };
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const next = jest.fn();
    const request = {
      headers: { authorization: `Bearer ${generateToken({ _id: 'user-id' })}` },
    };

    await protect(request, createResponse(), next);

    expect(User.findById).toHaveBeenCalledWith('user-id');
    expect(request.user).toBe(user);
    expect(next).toHaveBeenCalledWith();
  });

  it('passes database failures to the error handler', async () => {
    const error = new Error('Database unavailable');
    User.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(error) });
    const next = jest.fn();
    const token = jwt.sign({ id: 'user-id' }, process.env.JWT_SECRET);

    await protect({ headers: { authorization: `Bearer ${token}` } }, createResponse(), next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('denies roles not listed by the route', () => {
    const response = createResponse();
    const next = jest.fn();

    authorize('admin')({ user: { role: 'student' } }, response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

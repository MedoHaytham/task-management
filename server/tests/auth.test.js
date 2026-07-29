const request = require('supertest');
const app = require('../app');
const User = require('../models/users');
const { connectTestDB, closeTestDB, clearTestDB } = require('./dbHandler');

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Auth', () => {
  it('hashes the password on signup and never returns it in the response', async () => {
    const res = await request(app).post('/api/v1/users/signup').send({
      name: 'Ahmed',
      email: 'ahmed@test.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.password).toBeUndefined();

    // Directly check the database — password must not be stored in plain text
    const userInDb = await User.findOne({ email: 'ahmed@test.com' }).select(
      '+password'
    );
    expect(userInDb.password).not.toBe('password123');
  });

  it('rejects signup when the email is already registered', async () => {
    await request(app).post('/api/v1/users/signup').send({
      name: 'Ahmed',
      email: 'dup@test.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    const res = await request(app).post('/api/v1/users/signup').send({
      name: 'Someone Else',
      email: 'dup@test.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    expect(res.statusCode).toBe(400);
  });

  it('rejects login with a wrong password using a generic error message', async () => {
    await request(app).post('/api/v1/users/signup').send({
      name: 'Sara',
      email: 'sara@test.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    const res = await request(app).post('/api/v1/users/login').send({
      email: 'sara@test.com',
      password: 'wrong-password',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Invalid email or password/i);
  });

  it('rejects access to a protected route with no token at all', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.statusCode).toBe(401);
  });
});

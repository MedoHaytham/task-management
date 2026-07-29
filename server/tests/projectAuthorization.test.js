const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./dbHandler');

let ownerAgent;
let memberAgent;
let outsiderAgent;
let projectId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

// Each test gets a fresh owner + member + outsider + a project the
// member was explicitly added to. This mirrors the real access pattern
// the app relies on (owner/member vs a user with no relation at all).
beforeEach(async () => {
  await clearTestDB();

  ownerAgent = request.agent(app);
  memberAgent = request.agent(app);
  outsiderAgent = request.agent(app);

  await ownerAgent.post('/api/v1/users/signup').send({
    name: 'Owner',
    email: 'owner@test.com',
    password: 'password123',
    passwordConfirm: 'password123',
  });

  const memberSignup = await memberAgent.post('/api/v1/users/signup').send({
    name: 'Member',
    email: 'member@test.com',
    password: 'password123',
    passwordConfirm: 'password123',
  });

  await outsiderAgent.post('/api/v1/users/signup').send({
    name: 'Outsider',
    email: 'outsider@test.com',
    password: 'password123',
    passwordConfirm: 'password123',
  });

  const projectRes = await ownerAgent.post('/api/v1/projects').send({
    name: 'Test Project',
    description: 'A project for testing',
  });
  projectId = projectRes.body.data.data._id;

  await ownerAgent.post(`/api/v1/projects/${projectId}/members`).send({
    userId: memberSignup.body.data.user._id,
  });
});

describe('Project access control', () => {
  it('allows the owner to access their own project', async () => {
    const res = await ownerAgent.get(`/api/v1/projects/${projectId}`);
    expect(res.statusCode).toBe(200);
  });

  it('allows an added member to access the project', async () => {
    const res = await memberAgent.get(`/api/v1/projects/${projectId}`);
    expect(res.statusCode).toBe(200);
  });

  it('blocks a user with no relation to the project (404/403 boundary)', async () => {
    const res = await outsiderAgent.get(`/api/v1/projects/${projectId}`);
    expect(res.statusCode).toBe(403);
  });

  it('blocks a non-owner member from adding new project members', async () => {
    const res = await memberAgent
      .post(`/api/v1/projects/${projectId}/members`)
      .send({ userId: '507f1f77bcf86cd799439011' });

    expect(res.statusCode).toBe(403);
  });

  it('blocks a non-owner member from updating the project', async () => {
    const res = await memberAgent
      .patch(`/api/v1/projects/${projectId}`)
      .send({ name: 'Renamed by a non-owner' });

    expect(res.statusCode).toBe(403);
  });
});

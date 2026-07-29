const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./dbHandler');

let ownerAgent;
let projectId;
let memberId;
let outsiderId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  ownerAgent = request.agent(app);
  const memberAgent = request.agent(app);
  const outsiderAgent = request.agent(app);

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

  const outsiderSignup = await outsiderAgent
    .post('/api/v1/users/signup')
    .send({
      name: 'Outsider',
      email: 'outsider@test.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });

  memberId = memberSignup.body.data.user._id;
  outsiderId = outsiderSignup.body.data.user._id;

  const projectRes = await ownerAgent
    .post('/api/v1/projects')
    .send({ name: 'Test Project' });
  projectId = projectRes.body.data.data._id;

  await ownerAgent
    .post(`/api/v1/projects/${projectId}/members`)
    .send({ userId: memberId });
});

describe('Task creation and assignee validation', () => {
  it('creates a task with a default status of "To Do"', async () => {
    const res = await ownerAgent
      .post(`/api/v1/projects/${projectId}/tasks`)
      .send({ title: 'Fix login bug' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.data.status).toBe('To Do');
  });

  it('allows assigning a task to a valid project member', async () => {
    const res = await ownerAgent
      .post(`/api/v1/projects/${projectId}/tasks`)
      .send({ title: 'Fix login bug', assignee: memberId });

    expect(res.statusCode).toBe(201);
  });

  it('rejects assigning a task to a user who is not a project member', async () => {
    const res = await ownerAgent
      .post(`/api/v1/projects/${projectId}/tasks`)
      .send({ title: 'Fix login bug', assignee: outsiderId });

    expect(res.statusCode).toBe(400);
  });

  it('filters tasks by status via the query string', async () => {
    await ownerAgent
      .post(`/api/v1/projects/${projectId}/tasks`)
      .send({ title: 'Task A', status: 'Done' });
    await ownerAgent
      .post(`/api/v1/projects/${projectId}/tasks`)
      .send({ title: 'Task B', status: 'To Do' });

    const res = await ownerAgent.get(
      `/api/v1/projects/${projectId}/tasks?status=Done`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data.data[0].title).toBe('Task A');
  });
});

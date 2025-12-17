// tests/tasks.routes.test.js --------------------------------------------
const request = require('supertest');
const app = require('../index');
const { initMongo, closeMongo, clearDb } = require('./setup');

let server, agent;

beforeAll(async () => {
  await initMongo();
  server = app.listen();
  agent = request.agent(server);
});

afterAll(async () => {
  await closeMongo();
  server && server.close();
});

/*afterEach(async () => {
  await clearDb();
});*/

/* … payloads and test cases stay exactly as previously shown … */

/* ------------------------------------------------------------------ */
/*  Sample payloads – adapt fields to match your validation rules   */
/* ------------------------------------------------------------------ */
const listPayload = { title: 'My First List' };          // will be created first
const taskPayload = {
  title: 'Buy milk',
  description: '2% or almond',
  // listId will be filled after we create a list
  status: 'todo',               // whatever enum your model expects
};

describe('Task routes (CRUD)', () => {
  let listId;
  let taskId;

  // --------------------------------------------------------------
  // 1️⃣ Create a list first – tasks belong to a list
  // --------------------------------------------------------------
  it('POST /api/lists – creates a list for the user', async () => {
    const res = await agent
      .post('/api/lists')
      .send(listPayload)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    listId = res.body._id;
  });

  // --------------------------------------------------------------
  // 2️⃣ Create a task linked to that list
  // --------------------------------------------------------------
  it('POST /api/tasks – creates a new task', async () => {
    const payload = { ...taskPayload, listId };
    const res = await agent
      .post('/api/tasks')
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(taskPayload.title);
    expect(res.body.listId).toBe(listId);
    taskId = res.body._id;
  });

  // --------------------------------------------------------------
  // 3️⃣ Get all tasks (optionally filtered)
  // --------------------------------------------------------------
  it('GET /api/tasks – returns an array containing our task', async () => {
    const res = await agent
      .get('/api/tasks')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find(t => t._id === taskId);
    expect(found).toBeTruthy();
  });

  // --------------------------------------------------------------
  // 4️⃣ Get a single task by ID
  // --------------------------------------------------------------
  it('GET /api/tasks/:id – fetches the created task', async () => {
    const res = await agent
      .get(`/api/tasks/${taskId}`)
      .expect(200);

    expect(res.body).toHaveProperty('_id', taskId);
    expect(res.body.title).toBe(taskPayload.title);
  });

  // --------------------------------------------------------------
  // 5️⃣ Update the task (e.g., change status)
  // --------------------------------------------------------------
  it('PATCH /api/tasks/:id – updates the task status', async () => {
    const newStatus = 'done';
    const res = await agent
      .patch(`/api/tasks/${taskId}`)
      .send({ status: newStatus })
      .expect(200);

    expect(res.body).toHaveProperty('_id', taskId);
    expect(res.body.status).toBe(newStatus);
  });

  // --------------------------------------------------------------
  // 6️⃣ Delete the task
  // --------------------------------------------------------------
  it('DELETE /api/tasks/:id – removes the task', async () => {
    await agent
      .delete(`/api/tasks/${taskId}`)
      .expect(204);

    // Verify it truly disappeared
    await agent
      .get(`/api/tasks/${taskId}`)
      .expect(404);
  });
});
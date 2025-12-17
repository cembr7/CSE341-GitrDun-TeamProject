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

const listPayload = {
  title: 'Work',
  // add any extra fields required by your validation schema
};

describe('List routes (CRUD)', () => {
  let listId;

  it('POST /api/lists – creates a list', async () => {
    const res = await agent
      .post('/api/lists')
      .send(listPayload)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(listPayload.title);
    listId = res.body._id;
  });

  it('GET /api/lists – returns an array with at least one list', async () => {
    // Ensure there is at least one list (the one we just created)
    const res = await agent
      .get('/api/lists')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find(l => l._id === listId);
    expect(found).toBeTruthy();
  });

  it('GET /api/lists/:id – fetches the created list', async () => {
    const res = await agent
      .get(`/api/lists/${listId}`)
      .expect(200);

    expect(res.body).toHaveProperty('_id', listId);
    expect(res.body.title).toBe(listPayload.title);
  });

  it('PATCH /api/lists/:id – updates the list title', async () => {
    const newTitle = 'Personal';
    const res = await agent
      .patch(`/api/lists/${listId}`)
      .send({ title: newTitle })
      .expect(200);

    expect(res.body).toHaveProperty('_id', listId);
    expect(res.body.title).toBe(newTitle);
  });

  it('DELETE /api/lists/:id – removes the list', async () => {
    await agent
      .delete(`/api/lists/${listId}`)
      .expect(204);

    // Confirm deletion
    await agent
      .get(`/api/lists/${listId}`)
      .expect(404);
  });
});
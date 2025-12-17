// tests/access.routes.test.js
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

/* Uncomment if you want a fresh DB after each test
afterEach(async () => {
  await clearDb();
});
*/

const grantPayload = {
  listId: 'dummy-list-id',
  userId: 'dummy-recipient-id',
  role:  'viewer',
};

describe('Access routes (CRUD‑style)', () => {
  let grantId;

  it('POST /api/access – creates a new access grant', async () => {
    const res = await agent
      .post('/api/access')
      .send(grantPayload)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.listId).toBe(grantPayload.listId);
    expect(res.body.userId).toBe(grantPayload.userId);
    expect(res.body.role).toBe(grantPayload.role);

    grantId = res.body._id;
  });

  it('GET /api/access – returns an array containing the created grant', async () => {
    const res = await agent
      .get('/api/access')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find(g => g._id === grantId);
    expect(found).toBeTruthy();
    expect(found.role).toBe(grantPayload.role);
  });

  it('PATCH /api/access/:id – updates the role of the grant', async () => {
    const newRole = 'editor';
    const res = await agent
      .patch(`/api/access/${grantId}`)
      .send({ role: newRole })
      .expect(200);

    expect(res.body).toHaveProperty('_id', grantId);
    expect(res.body.role).toBe(newRole);
  });

  it('DELETE /api/access/:id – revokes the access grant', async () => {
    await agent
      .delete(`/api/access/${grantId}`)
      .expect(204);

    // Verify it’s gone
    const afterDelete = await agent
      .get('/api/access')
      .expect(200);

    const stillThere = afterDelete.body.find(g => g._id === grantId);
    expect(stillThere).toBeUndefined();
  });
});


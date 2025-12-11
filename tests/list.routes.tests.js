// __tests__/list.routes.test.js
const request = require('supertest');
const app = require('../app');

describe('List Routes (Inbox + Status Boards)', () => {
  let itemId;

  const inboxItem = {
    title: 'Buy milk',           // adjust field names to match your actual model!
    description: '2% fat',
    dueDate: '2025-12-20',
    priority: 'high'
    // userId will be added by auth middleware later
  };

  it('POST /list - create inbox item', async () => {
    const res = await request(app)
      .post('/list')                     // ← correct path
      .send(inboxItem)
      .expect(201);

    expect(res.body.title).toBe(inboxItem.title);
    expect(res.body.status).toBe('inbox'); // or whatever default you use
    itemId = res.body._id;
  });

  it('GET /list - get all inbox items', async () => {
    await request(app).post('/list').send({
      title: 'Walk dog', priority: 'medium'
    });

    const res = await request(app)
      .get('/list')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /list/:id - get single item', async () => {
    const res = await request(app)
      .get(`/list/${itemId}`)
      .expect(200);
    expect(res.body.title).toBe(inboxItem.title);
  });

  it('PATCH /list/:id - partially update item', async () => {
    const res = await request(app)
      .patch(`/list/${itemId}`)          // ← PATCH, not PUT
      .send({ priority: 'low', title: 'Buy almond milk' })
      .expect(200);

    expect(res.body.priority).toBe('low');
    expect(res.body.title).toBe('Buy almond milk');
  });

  // Example of status lanes (optional – add more if you want)
  it('GET /list/doing - returns empty or items', async () => {
    const res = await request(app).get('/list/doing').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('DELETE /list/:id - delete item', async () => {
    await request(app)
      .delete(`/list/${itemId}`)
      .expect(204);                      // or 200 if your controller sends body

    await request(app)
      .get(`/list/${itemId}`)
      .expect(404);
  });
});
describe('Task Routes', () => {
  let userId, listId, taskId;

  beforeAll(async () => {
    const userRes = await request(app).post('/api/users').send({
      name: 'Task User', email: 'task@test.com', password: '123'
    });
    userId = userRes.body._id;

    const listRes = await request(app).post('/api/lists').send({
      taskTitle: 'Work', taskDueDate: '2025-12-25', taskPriority: 'medium', userId
    });
    listId = listRes.body._id;
  });

  const taskData = {
    title: 'Finish testing',
    listLabel: listId,
    dueDate: '2025-12-20',
    priority: 'high',
    progress: 'in-progress',
    repeat: 'weekly',
    frequency: 1,
    notes: 'Use Jest',
    userId
  };

  it('POST /api/tasks - create task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send(taskData)
      .expect(201);

    expect(res.body.title).toBe(taskData.title);
    taskId = res.body._id;
  });

  it('GET /api/tasks - get all tasks', async () => {
    const res = await request(app).get('/api/tasks').expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/tasks/:id - get task by id', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`).expect(200);
    expect(res.body.notes).toBe(taskData.notes);
  });

  it('PUT /api/tasks/:id - update task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ progress: 'completed', notes: 'Done!' })
      .expect(200);

    expect(res.body.progress).toBe('completed');
  });

  it('DELETE /api/tasks/:id - delete task', async () => {
    await request(app).delete(`/api/tasks/${taskId}`).expect(200);
    await request(app).get(`/api/tasks/${taskId}`).expect(404);
  });
});
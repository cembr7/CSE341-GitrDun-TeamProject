describe('Done Routes', () => {
  let taskId, doneId;

  beforeAll(async () => {
    // Create user → list → task
    const userRes = await request(app).post('/api/users').send({
      name: 'DoneUser', email: 'done@test.com', password: '123' });
    const listRes = await request(app).post('/api/lists').send({
      taskTitle: 'Done List', taskDueDate: '2025-12-31', taskPriority: 'low', userId: userRes.body._id
    });

    const taskRes = await request(app).post('/api/tasks').send({
      title: 'Completed Task',
      listLabel: listRes.body._id,
      dueDate: '2025-12-10',
      priority: 'medium',
      progress: 'completed',
      userId: userRes.body._id
    });
    taskId = taskRes.body._id;
  });

  it('POST /api/done - mark task as done', async () => {
    const res = await request(app)
      .post('/api/done')
      .send({ taskID: taskId })
      .expect(201);

    expect(res.body.taskID).toBe(taskId);
    doneId = res.body._id;
  });

  it('GET /api/done - get all completed tasks', async () => {
    const res = await request(app).get('/api/done').expect(200);
    expect(res.body.some(d => d.taskID === taskId)).toBe(true);
  });

  it('DELETE /api/done/:id - remove from done', async () => {
    await request(app).delete(`/api/done/${doneId}`).expect(200);
    await request(app).get(`/api/done/${doneId}`).expect(404);
  });
});
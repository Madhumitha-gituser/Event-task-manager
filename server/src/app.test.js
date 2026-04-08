import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { resetEventsStoreForTests } from './routes/events.js';

const app = createApp();

beforeEach(() => {
  resetEventsStoreForTests();
});

describe('API', () => {
  it('logs in and returns token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'abc@vemanait.edu.in',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user?.name).toBeTruthy();
  });

  it('creates event, participant, task, updates status', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: 'abc@vemanait.edu.in',
      password: 'password123',
    });
    const token = login.body.token;

    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Event',
        type: 'Workshop',
        description: 'Desc',
        date: '2026-06-01',
        time: '09:00',
        venue: 'Hall',
        organizer: 'Org',
        max_participants: 50,
        registration_link: null,
      });
    expect(created.status).toBe(201);
    const eventId = created.body.event.id;
    expect(created.body.event.activityLog?.length).toBeGreaterThan(0);

    const part = await request(app)
      .post(`/api/events/${eventId}/participants`)
      .set('Authorization', `Bearer ${token}`)
      .send({ usn: '1MS22CS001', name: 'Test Student' });
    expect(part.status).toBe(201);
    const pid = part.body.event.participants[0].id;

    const taskRes = await request(app)
      .post(`/api/events/${eventId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        taskName: 'Setup stage',
        assignedToParticipantId: pid,
        deadline: '2026-06-15',
        deadlineTime: '14:00',
        priority: 'High',
        notes: 'Bring cables',
      });
    expect(taskRes.status).toBe(201);
    const taskId = taskRes.body.event.tasks[0].id;

    const patch = await request(app)
      .patch(`/api/events/${eventId}/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Completed' });
    expect(patch.status).toBe(200);
    expect(patch.body.event.tasks[0].status).toBe('Completed');

    const bulk = await request(app)
      .patch(`/api/events/${eventId}/tasks/bulk`)
      .set('Authorization', `Bearer ${token}`)
      .send({ taskIds: [taskId], status: 'Pending' });
    expect(bulk.status).toBe(200);
    expect(bulk.body.event.tasks[0].status).toBe('Pending');
  });
});

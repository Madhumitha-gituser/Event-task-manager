import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createEventSchema,
  participantSchema,
  createTaskSchema,
  taskStatusSchema,
  bulkTasksSchema,
  parseBody,
} from '../validation/eventSchemas.js';

const router = express.Router();

const events = [];
let eventIdCounter = 1;
let participantIdCounter = 1;
let taskIdCounter = 1;
let activityIdCounter = 1;

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
const VALID_STATUSES = ['Pending', 'Completed'];

export function resetEventsStoreForTests() {
  events.length = 0;
  eventIdCounter = 1;
  participantIdCounter = 1;
  taskIdCounter = 1;
  activityIdCounter = 1;
}

function actorName(user) {
  return user?.name || user?.email || 'Someone';
}

function appendActivity(event, user, summary) {
  if (!event.activityLog) event.activityLog = [];
  event.activityLog.unshift({
    id: activityIdCounter++,
    at: new Date().toISOString(),
    userId: user?.id,
    userName: actorName(user),
    summary,
  });
  if (event.activityLog.length > 120) {
    event.activityLog.length = 120;
  }
}

function normalizeTask(t) {
  if (!t) return null;
  return {
    ...t,
    notes: t.notes ?? '',
    deadlineTime: t.deadlineTime ?? null,
    reminderAt: t.reminderAt ?? null,
    attachmentUrl: t.attachmentUrl ?? null,
  };
}

function normalizeEvent(event) {
  if (!event) return null;
  return {
    ...event,
    participants: Array.isArray(event.participants) ? event.participants : [],
    tasks: Array.isArray(event.tasks) ? event.tasks.map(normalizeTask) : [],
    activityLog: Array.isArray(event.activityLog) ? event.activityLog : [],
  };
}

function findEventById(rawId) {
  const id = Number(rawId);
  if (Number.isNaN(id)) return null;
  return events.find((e) => Number(e.id) === id) ?? null;
}

router.post('/', authMiddleware, (req, res) => {
  const body = parseBody(createEventSchema, req.body, res);
  if (!body) return;

  const newEvent = {
    id: eventIdCounter++,
    category: body.category || 'Others',
    title: body.title,
    type: body.type,
    description: body.description,
    date: body.date,
    time: body.time,
    venue: body.venue,
    organizer: body.organizer,
    max_participants: body.max_participants,
    registration_link: body.registration_link || null,
    created_by: req.user.id,
    created_at: new Date(),
    participants: [],
    tasks: [],
    activityLog: [],
  };

  appendActivity(newEvent, req.user, `${actorName(req.user)} created event "${newEvent.title}"`);
  events.push(newEvent);

  res.status(201).json({
    message: 'Event created successfully',
    event: normalizeEvent(newEvent),
  });
});

router.get('/', (req, res) => {
  res.json({
    count: events.length,
    events: events.map((e) => normalizeEvent(e)),
  });
});

router.get('/:id', authMiddleware, (req, res) => {
  const event = findEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found', code: 'NOT_FOUND' });
  }
  res.json({ event: normalizeEvent(event) });
});

router.post('/:id/participants', authMiddleware, (req, res) => {
  const event = findEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found', code: 'NOT_FOUND' });
  }

  const body = parseBody(participantSchema, req.body, res);
  if (!body) return;

  if (!event.participants) event.participants = [];

  const participant = {
    id: participantIdCounter++,
    usn: body.usn,
    name: body.name,
  };
  event.participants.push(participant);

  appendActivity(
    event,
    req.user,
    `${actorName(req.user)} added participant ${participant.name} (${participant.usn})`
  );

  res.status(201).json({
    message: 'Participant added',
    event: normalizeEvent(event),
  });
});

router.post('/:id/tasks', authMiddleware, (req, res) => {
  const event = findEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found', code: 'NOT_FOUND' });
  }

  const body = parseBody(createTaskSchema, req.body, res);
  if (!body) return;

  if (!VALID_PRIORITIES.includes(body.priority)) {
    return res.status(400).json({ error: 'Priority must be Low, Medium, or High', code: 'INVALID_PRIORITY' });
  }

  const participants = event.participants || [];
  const participant = participants.find((p) => p.id === body.assignedToParticipantId);
  if (!participant) {
    return res.status(400).json({ error: 'Participant not found for this event', code: 'PARTICIPANT_NOT_FOUND' });
  }

  if (!event.tasks) event.tasks = [];

  let attachmentUrl = body.attachmentUrl;
  if (attachmentUrl === '' || attachmentUrl === undefined) attachmentUrl = null;
  if (attachmentUrl) {
    try {
      // eslint-disable-next-line no-new
      new URL(attachmentUrl);
    } catch {
      return res.status(400).json({ error: 'Attachment must be a valid URL', code: 'INVALID_URL' });
    }
  }

  const reminderAt =
    body.reminderAt && String(body.reminderAt).trim() !== '' ? String(body.reminderAt).trim() : null;
  const deadlineTime =
    body.deadlineTime && String(body.deadlineTime).trim() !== '' ? String(body.deadlineTime).trim() : null;
  const notes = body.notes != null ? String(body.notes) : '';

  const task = {
    id: taskIdCounter++,
    taskName: body.taskName,
    assignedToParticipantId: participant.id,
    assignedToUSN: participant.usn,
    assignedToName: participant.name,
    deadline: body.deadline.trim(),
    deadlineTime,
    priority: body.priority,
    status: 'Pending',
    notes,
    reminderAt,
    attachmentUrl,
  };
  event.tasks.push(task);

  appendActivity(
    event,
    req.user,
    `${actorName(req.user)} assigned task "${task.taskName}" to ${participant.name}`
  );

  res.status(201).json({
    message: 'Task assigned',
    event: normalizeEvent(event),
  });
});

router.patch('/:eventId/tasks/bulk', authMiddleware, (req, res) => {
  const event = findEventById(req.params.eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found', code: 'NOT_FOUND' });
  }

  const body = parseBody(bulkTasksSchema, req.body, res);
  if (!body) return;

  const tasks = event.tasks || [];
  const idSet = new Set(body.taskIds);
  const toUpdate = tasks.filter((t) => idSet.has(t.id));
  if (toUpdate.length !== body.taskIds.length) {
    return res.status(400).json({ error: 'One or more task ids are invalid for this event', code: 'INVALID_TASK_IDS' });
  }

  let newAssignee = null;
  if (body.assignedToParticipantId !== undefined) {
    const participants = event.participants || [];
    newAssignee = participants.find((p) => p.id === body.assignedToParticipantId);
    if (!newAssignee) {
      return res.status(400).json({ error: 'Participant not found for this event', code: 'PARTICIPANT_NOT_FOUND' });
    }
  }

  const parts = [];
  for (const task of toUpdate) {
    if (body.status !== undefined) {
      task.status = body.status;
    }
    if (newAssignee) {
      task.assignedToParticipantId = newAssignee.id;
      task.assignedToUSN = newAssignee.usn;
      task.assignedToName = newAssignee.name;
    }
  }

  if (body.status !== undefined) parts.push(`status → ${body.status}`);
  if (newAssignee) parts.push(`reassigned to ${newAssignee.name}`);
  appendActivity(
    event,
    req.user,
    `${actorName(req.user)} bulk-updated ${toUpdate.length} task(s): ${parts.join(', ')}`
  );

  res.json({
    message: 'Tasks updated',
    event: normalizeEvent(event),
  });
});

router.patch('/:eventId/tasks/:taskId/status', authMiddleware, (req, res) => {
  const event = findEventById(req.params.eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found', code: 'NOT_FOUND' });
  }

  const taskId = Number(req.params.taskId);
  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task id', code: 'INVALID_ID' });
  }

  const body = parseBody(taskStatusSchema, req.body, res);
  if (!body) return;

  const tasks = event.tasks || [];
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found', code: 'TASK_NOT_FOUND' });
  }

  const prev = task.status;
  task.status = body.status;

  appendActivity(
    event,
    req.user,
    `${actorName(req.user)} marked "${task.taskName}" ${prev} → ${body.status}`
  );

  res.json({
    message: 'Task status updated',
    event: normalizeEvent(event),
  });
});

router.delete('/:eventId/tasks/:taskId', authMiddleware, (req, res) => {
  const event = findEventById(req.params.eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found', code: 'NOT_FOUND' });
  }
  const taskId = Number(req.params.taskId);
  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task id', code: 'INVALID_ID' });
  }
  const tasks = event.tasks || [];
  const idx = tasks.findIndex((t) => Number(t.id) === taskId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Task not found', code: 'TASK_NOT_FOUND' });
  }
  const [removed] = tasks.splice(idx, 1);
  appendActivity(event, req.user, `${actorName(req.user)} removed task "${removed.taskName}"`);
  res.json({ message: 'Task deleted', event: normalizeEvent(event) });
});

router.delete('/:eventId/participants/:participantId', authMiddleware, (req, res) => {
  const event = findEventById(req.params.eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found', code: 'NOT_FOUND' });
  }
  const participantId = Number(req.params.participantId);
  if (Number.isNaN(participantId)) {
    return res.status(400).json({ error: 'Invalid participant id', code: 'INVALID_ID' });
  }
  const participants = event.participants || [];
  const participant = participants.find((p) => Number(p.id) === participantId);
  if (!participant) {
    return res.status(404).json({ error: 'Participant not found', code: 'NOT_FOUND' });
  }
  const assigned = (event.tasks || []).some((t) => Number(t.assignedToParticipantId) === participantId);
  if (assigned) {
    return res.status(400).json({
      error: 'Reassign or delete this participant’s tasks before removing them',
      code: 'PARTICIPANT_HAS_TASKS',
    });
  }
  event.participants = participants.filter((p) => Number(p.id) !== participantId);
  appendActivity(
    event,
    req.user,
    `${actorName(req.user)} removed participant ${participant.name} (${participant.usn})`
  );
  res.json({ message: 'Participant removed', event: normalizeEvent(event) });
});

router.delete('/:id/activity/:activityEntryId', authMiddleware, (req, res) => {
  const event = findEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found', code: 'NOT_FOUND' });
  }
  const entryId = Number(req.params.activityEntryId);
  if (Number.isNaN(entryId)) {
    return res.status(400).json({ error: 'Invalid activity id', code: 'INVALID_ID' });
  }
  const log = event.activityLog || [];
  const before = log.length;
  event.activityLog = log.filter((a) => Number(a.id) !== entryId);
  if (event.activityLog.length === before) {
    return res.status(404).json({ error: 'Activity entry not found', code: 'NOT_FOUND' });
  }
  res.json({ message: 'Activity entry removed', event: normalizeEvent(event) });
});

router.delete('/:id/activity', authMiddleware, (req, res) => {
  const event = findEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found', code: 'NOT_FOUND' });
  }
  event.activityLog = [];
  res.json({ message: 'Activity log cleared', event: normalizeEvent(event) });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid event id', code: 'INVALID_ID' });
  }
  const idx = events.findIndex((e) => Number(e.id) === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Event not found', code: 'NOT_FOUND' });
  }
  events.splice(idx, 1);
  res.json({ message: 'Event deleted' });
});

export default router;

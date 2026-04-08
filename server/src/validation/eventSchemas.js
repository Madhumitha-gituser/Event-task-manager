import { z } from 'zod';

const priority = z.enum(['Low', 'Medium', 'High']);
const status = z.enum(['Pending', 'Completed']);

export const createEventSchema = z.object({
  category: z.string().optional(),
  title: z.string().min(1, 'Title required'),
  type: z.string().min(1, 'Type required'),
  description: z.string().min(1, 'Description required'),
  date: z.string().min(1, 'Date required'),
  time: z.string().min(1, 'Time required'),
  venue: z.string().min(1, 'Venue required'),
  organizer: z.string().min(1, 'Organizer required'),
  max_participants: z.coerce.number().int().positive(),
  registration_link: z.union([z.string().url(), z.null(), z.literal('')]).optional(),
});

export const participantSchema = z.object({
  usn: z.string().trim().min(1, 'USN required'),
  name: z.string().trim().min(1, 'Name required'),
});

export const createTaskSchema = z.object({
  taskName: z.string().trim().min(1, 'Task name required'),
  assignedToParticipantId: z.coerce.number().int().positive(),
  deadline: z.string().trim().min(1, 'Deadline required'),
  deadlineTime: z
    .preprocess((v) => (v === '' || v == null ? null : v), z.string().trim().nullable().optional()),
  priority,
  notes: z.preprocess((v) => (v == null ? '' : String(v)), z.string().max(5000)),
  reminderAt: z.preprocess((v) => (v === '' || v == null ? null : v), z.string().nullable().optional()),
  attachmentUrl: z.preprocess((v) => (v === '' || v == null ? null : v), z.string().url().nullable().optional()),
});

export const taskStatusSchema = z.object({
  status,
});

export const bulkTasksSchema = z
  .object({
    taskIds: z.array(z.coerce.number().int().positive()).min(1, 'Select at least one task'),
    status: status.optional(),
    assignedToParticipantId: z.coerce.number().int().positive().optional(),
  })
  .refine((d) => d.status !== undefined || d.assignedToParticipantId !== undefined, {
    message: 'Provide status and/or assignedToParticipantId',
  });

export function parseBody(schema, body, res) {
  const r = schema.safeParse(body);
  if (!r.success) {
    const issues = r.error?.issues ?? r.error?.errors ?? [];
    const msg = issues.map((e) => e.message).join('; ') || 'Invalid request body';
    res.status(400).json({ error: msg, code: 'VALIDATION_ERROR' });
    return null;
  }
  return r.data;
}

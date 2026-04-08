import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  fetchEventById,
  addParticipant,
  addTask,
  updateTaskStatus,
  bulkUpdateTasks,
  deleteTask,
  deleteParticipant,
  deleteActivityEntry,
  clearActivityLog,
  deleteEvent,
} from '../services/eventsApi';
import { useToast } from '../context/ToastContext';
import EventDetailsHeader from '../components/eventDetails/EventDetailsHeader';
import EventInformationSection from '../components/eventDetails/EventInformationSection';
import ParticipantsSection from '../components/eventDetails/ParticipantsSection';
import TaskAssignmentSection from '../components/eventDetails/TaskAssignmentSection';
import AssignedTasksPanel from '../components/eventDetails/AssignedTasksPanel';
import EventDangerZone from '../components/eventDetails/EventDangerZone';
import './EventDetails.css';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const backTo = location.state?.from || '/view-events';

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [participantForm, setParticipantForm] = useState({ usn: '', name: '' });
  const [participantSubmitting, setParticipantSubmitting] = useState(false);

  const [taskForm, setTaskForm] = useState({
    taskName: '',
    notes: '',
    assignedToParticipantId: '',
    deadline: '',
    deadlineTime: '',
    priority: '',
    reminderAt: '',
    attachmentUrl: '',
  });
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [bulkWorking, setBulkWorking] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState(() => new Set());
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [removingParticipantId, setRemovingParticipantId] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  const loadEvent = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await fetchEventById(id);
      setEvent(data.event);
    } catch (err) {
      setError(err.message || 'Failed to load event');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    setError('');
    setParticipantSubmitting(true);
    try {
      const data = await addParticipant(id, {
        usn: participantForm.usn,
        name: participantForm.name,
      });
      setEvent(data.event);
      setParticipantForm({ usn: '', name: '' });
      toast.success('Participant added');
    } catch (err) {
      const msg = err.message || 'Failed to add participant';
      setError(msg);
      toast.error(msg);
    } finally {
      setParticipantSubmitting(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setError('');
    if (!taskForm.assignedToParticipantId) {
      const msg = 'Select a participant to assign this task.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!taskForm.priority) {
      const msg = 'Select a priority for this task.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setTaskSubmitting(true);
    try {
      const payload = {
        taskName: taskForm.taskName,
        assignedToParticipantId: Number(taskForm.assignedToParticipantId),
        deadline: taskForm.deadline,
        priority: taskForm.priority,
        notes: taskForm.notes || '',
        deadlineTime: taskForm.deadlineTime || null,
        reminderAt: taskForm.reminderAt || null,
        attachmentUrl: taskForm.attachmentUrl?.trim() || null,
      };
      const data = await addTask(id, payload);
      setEvent(data.event);
      setTaskForm({
        taskName: '',
        notes: '',
        assignedToParticipantId: '',
        deadline: '',
        deadlineTime: '',
        priority: '',
        reminderAt: '',
        attachmentUrl: '',
      });
      toast.success('Task assigned');
    } catch (err) {
      const msg = err.message || 'Failed to assign task';
      setError(msg);
      toast.error(msg);
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const next = task.status === 'Completed' ? 'Pending' : 'Completed';
    setError('');
    const snapshot = event;
    setEvent((ev) => ({
      ...ev,
      tasks: (ev.tasks || []).map((t) => (t.id === task.id ? { ...t, status: next } : t)),
    }));
    setStatusUpdatingId(task.id);
    try {
      const data = await updateTaskStatus(id, task.id, next);
      setEvent(data.event);
      toast.success('Task updated');
    } catch (err) {
      if (snapshot) setEvent(snapshot);
      const msg = err.message || 'Failed to update task';
      setError(msg);
      toast.error(msg);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const runBulk = async (body) => {
    const taskIds = [...selectedTaskIds];
    if (taskIds.length === 0) return;
    setBulkWorking(true);
    setError('');
    try {
      const data = await bulkUpdateTasks(id, { taskIds, ...body });
      setEvent(data.event);
      setSelectedTaskIds(new Set());
      toast.success('Tasks updated');
    } catch (err) {
      const msg = err.message || 'Bulk update failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkComplete = () => runBulk({ status: 'Completed' });

  const handleBulkReassign = (participantId) => {
    if (!participantId || Number.isNaN(participantId)) {
      toast.error('Choose a participant to reassign');
      return;
    }
    runBulk({ assignedToParticipantId: participantId });
  };

  const handleDeleteTask = async (task) => {
    if (
      !window.confirm(
        `Remove task "${task.taskName}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setError('');
    setDeletingTaskId(task.id);
    try {
      const data = await deleteTask(id, task.id);
      setEvent(data.event);
      setSelectedTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
      toast.success('Task removed');
    } catch (err) {
      const msg = err.message || 'Failed to remove task';
      setError(msg);
      toast.error(msg);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleRemoveParticipant = async (p) => {
    if (
      !window.confirm(
        `Remove ${p.name} (${p.usn})? You must delete or reassign their tasks first if any exist.`
      )
    ) {
      return;
    }
    setError('');
    setRemovingParticipantId(p.id);
    try {
      const data = await deleteParticipant(id, p.id);
      setEvent(data.event);
      toast.success('Participant removed');
    } catch (err) {
      const msg = err.message || 'Failed to remove participant';
      setError(msg);
      toast.error(msg);
    } finally {
      setRemovingParticipantId(null);
    }
  };

  const handleDeleteEvent = async () => {
    if (
      !window.confirm(
        `Delete "${event.title}" and everything under it (participants, tasks, activity)? This cannot be undone.`
      )
    ) {
      return;
    }
    setError('');
    setDeletingEvent(true);
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      navigate(backTo);
    } catch (err) {
      const msg = err.message || 'Failed to delete event';
      setError(msg);
      toast.error(msg);
      setDeletingEvent(false);
    }
  };

  const participants = event?.participants ?? [];
  const tasks = event?.tasks ?? [];
  const noParticipants = participants.length === 0;

  return (
    <div className="event-details">
      <main className="event-details-main">
        {loading ? (
          <div className="event-details-loading" role="status">
            Loading event…
          </div>
        ) : !event ? (
          <div className="event-details-empty">
            {error ? <p className="event-details-empty-message">{error}</p> : <p>Event could not be loaded.</p>}
            <button type="button" className="event-details-back" onClick={() => navigate(backTo)}>
              ← Back to events
            </button>
          </div>
        ) : (
          <>
            <EventDetailsHeader
              title={event.title}
              category={event.category}
              date={event.date}
              time={event.time}
              onBack={() => navigate(backTo)}
            />

            {error && <div className="event-details-error">{error}</div>}

            <EventInformationSection event={event} />

            <ParticipantsSection
              participants={participants}
              form={participantForm}
              onFormChange={setParticipantForm}
              onSubmit={handleAddParticipant}
              submitting={participantSubmitting}
              onRemoveParticipant={handleRemoveParticipant}
              removingParticipantId={removingParticipantId}
            />

            <TaskAssignmentSection
              participants={participants}
              form={taskForm}
              onFormChange={setTaskForm}
              onSubmit={handleAddTask}
              submitting={taskSubmitting}
              noParticipants={noParticipants}
            />

            <AssignedTasksPanel
              tasks={tasks}
              participants={participants}
              eventId={event.id}
              selectedIds={selectedTaskIds}
              onSelectedChange={setSelectedTaskIds}
              onToggleStatus={handleToggleStatus}
              onBulkComplete={handleBulkComplete}
              onBulkReassign={handleBulkReassign}
              statusUpdatingId={statusUpdatingId}
              bulkWorking={bulkWorking}
              onDeleteTask={handleDeleteTask}
              deletingTaskId={deletingTaskId}
            />

            <p className="event-details-hint event-details-activity-hint">
              Activity for this event (and all others) lives under{' '}
              <button type="button" className="event-details-link-btn" onClick={() => navigate('/activity-logs')}>
                Activity logs
              </button>{' '}
              in the sidebar.
            </p>

            <EventDangerZone onDeleteEvent={handleDeleteEvent} deleting={deletingEvent} />
          </>
        )}
      </main>
    </div>
  );
}

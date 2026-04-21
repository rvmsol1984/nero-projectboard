const express = require('express');
const router = express.Router();
const atClient = require('../middleware/autotask');

router.post('/phases', async (req, res) => {
  const { projectID, title } = req.body;
  if (!projectID || !title) return res.status(400).json({ error: 'projectID and title required' });
  try {
    const { data } = await atClient.post(`/Projects/${projectID}/Phases`, {
      projectID: parseInt(projectID),
      title,
    });
    res.json({ id: data.itemId, title, projectID });
  } catch (err) {
    console.error('[phases] POST error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to create phase' });
  }
});

router.post('/', async (req, res) => {
  const { projectID, phaseID, title, assigneeID, dueDate } = req.body;
  if (!projectID || !title) return res.status(400).json({ error: 'projectID and title required' });
  try {
    const { data } = await atClient.post(`/Projects/${parseInt(projectID)}/Tasks`, {
      projectID: parseInt(projectID),
      phaseID: phaseID ? parseInt(phaseID) : undefined,
      title,
      assignedResourceID: assigneeID ? parseInt(assigneeID) : undefined,
      dueDateTime: dueDate || undefined,
      status: 1,
      taskType: 1,
    });
    res.json({ id: data.itemId, title, projectID, phaseID });
  } catch (err) {
    console.error('[tasks] POST error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to create task' });
  }
});

router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const [tasksRes, phasesRes] = await Promise.all([
      atClient.get('/Tasks/query', {
        params: { search: JSON.stringify({ filter: [{ field: 'projectID', op: 'eq', value: parseInt(projectId) }] }) },
      }),
      atClient.get('/Phases/query', {
        params: { search: JSON.stringify({ filter: [{ field: 'projectID', op: 'eq', value: parseInt(projectId) }] }) },
      }),
    ]);

    const phaseMap = {};
    (phasesRes.data.items || []).forEach(p => { phaseMap[p.id] = p.title; });

    const tasks = (tasksRes.data.items || []).map(t => ({
      id: t.id,
      title: t.title,
      status: mapTaskStatus(t.status),
      assignee: t.assignedResourceID,
      priority: mapTaskPriority(t.priority),
      dueDate: t.dueDateTime,
      phase: phaseMap[t.phaseID] || (t.phaseID ? `Phase ${t.phaseID}` : 'General'),
      phaseID: t.phaseID || null,
      hours: t.hoursWorked || 0,
      estimatedHours: t.estimatedHours || 0,
    }));

    const phases = (phasesRes.data.items || []).map(p => ({
      id: p.id,
      title: p.title,
      projectID: p.projectID,
    }));

    res.json({ tasks, phases });
  } catch (err) {
    console.error('[tasks] GET error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to fetch tasks from Autotask' });
  }
});

router.patch('/update', async (req, res) => {
  const { id, projectID, assigneeID, dueDate, status } = req.body;
  if (!id || !projectID) return res.status(400).json({ error: 'id and projectID required' });
  try {
    const payload = { id: parseInt(id), projectID: parseInt(projectID) };
    if (assigneeID !== undefined) payload.assignedResourceID = assigneeID ? parseInt(assigneeID) : null;
    if (dueDate !== undefined) payload.dueDateTime = dueDate || null;
    if (status !== undefined) payload.status = reverseMapTaskStatus(status);
    await atClient.patch(`/Projects/${parseInt(projectID)}/Tasks`, payload);
    res.json({ success: true });
  } catch (err) {
    console.error('[tasks] update error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to update task' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  try {
    const taskRes = await atClient.get('/Tasks/query', {
      params: { search: JSON.stringify({ filter: [{ field: 'id', op: 'eq', value: parseInt(id) }] }) },
    });
    const task = taskRes.data.items?.[0];
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await atClient.patch(`/Projects/${task.projectID}/Tasks`, {
      id: parseInt(id),
      projectID: task.projectID,
      status: reverseMapTaskStatus(status),
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[tasks] PUT error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to update task' });
  }
});

function mapTaskStatus(id) {
  return { 1: 'New', 2: 'In Progress', 5: 'Complete', 8: 'On Hold' }[id] || 'New';
}
function reverseMapTaskStatus(label) {
  return { 'New': 1, 'In Progress': 2, 'Complete': 5, 'On Hold': 8 }[label] || 1;
}
function mapTaskPriority(val) {
  return { 1: 'High', 2: 'Medium', 3: 'Low' }[val] || 'Medium';
}

module.exports = router;

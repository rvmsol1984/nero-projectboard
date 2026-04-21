const express = require('express');
const router = express.Router();
const atClient = require('../middleware/autotask');

async function getPhaseNames(projectId) {
  try {
    const { data } = await atClient.get('/Phases/query', {
      params: {
        search: JSON.stringify({
          filter: [{ field: 'projectID', op: 'eq', value: parseInt(projectId) }],
        }),
      },
    });
    const map = {};
    (data.items || []).forEach(p => {
      map[p.id] = p.description || p.title || p.name || `Phase ${p.id}`;
    });
    return map;
  } catch {
    return {};
  }
}

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
    const { data } = await atClient.post('/Tasks', {
      projectID: parseInt(projectID),
      phaseID: phaseID ? parseInt(phaseID) : undefined,
      title,
      assignedResourceID: assigneeID ? parseInt(assigneeID) : undefined,
      dueDateTime: dueDate || undefined,
      status: 1,
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
    const [{ data }, phaseMap] = await Promise.all([
      atClient.get('/Tasks/query', {
        params: {
          search: JSON.stringify({
            filter: [{ field: 'projectID', op: 'eq', value: parseInt(projectId) }],
          }),
        },
      }),
      getPhaseNames(projectId),
    ]);

    const tasks = (data.items || []).map(t => ({
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

    res.json(tasks);
  } catch (err) {
    console.error('[tasks] GET error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to fetch tasks from Autotask' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  try {
    await atClient.put(`/Tasks/${id}`, {
      id: parseInt(id),
      status: reverseMapTaskStatus(status),
    });
    res.json({ ok: true });
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

const express = require('express');
const router = express.Router();
const atClient = require('../middleware/autotask');

router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const { data } = await atClient.get('/Tasks/query', {
      params: {
        search: JSON.stringify({
          filter: [{ field: 'projectID', op: 'eq', value: parseInt(projectId) }],
        }),
      },
    });

    const tasks = (data.items || []).map(t => ({
      id: t.id,
      title: t.title,
      status: mapTaskStatus(t.status),
      assignee: t.assignedResourceID,
      priority: mapTaskPriority(t.priority),
      dueDate: t.dueDateTime,
      phase: t.phaseID ? String(t.phaseID) : 'General',
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
    await atClient.patch(`/Tasks/${id}`, {
      id: parseInt(id),
      status: reverseMapTaskStatus(status),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[tasks] PATCH error:', err.response?.data || err.message);
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

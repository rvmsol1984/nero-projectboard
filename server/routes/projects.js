const express = require('express');
const router = express.Router();
const atClient = require('../middleware/autotask');

router.get('/', async (req, res) => {
  try {
    const { data } = await atClient.get('/Projects/query', {
      params: {
        search: JSON.stringify({
          filter: [{ field: 'status', op: 'notEqual', value: 6 }],
        }),
      },
    });

    const projects = (data.items || []).map(p => ({
      id: p.id,
      name: p.projectName,
      client: p.companyName || String(p.companyID),
      status: mapStatus(p.status),
      priority: mapPriority(p.priority),
      assignee: String(p.projectLeadResourceID || ''),
      dueDate: p.endDateTime,
      tasksTotal: p.estimatedHours || 0,
      tasksDone: p.completedPercentage || 0,
      description: p.description || '',
      tags: [],
    }));

    res.json(projects);
  } catch (err) {
    console.error('[projects] GET error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to fetch projects from Autotask' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  try {
    await atClient.patch(`/Projects/${id}`, {
      id: parseInt(id),
      status: reverseMapStatus(status),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[projects] PATCH error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to update project' });
  }
});

function mapStatus(id) {
  return { 1: 'New', 2: 'In Progress', 3: 'On Hold', 5: 'Complete' }[id] || 'New';
}
function reverseMapStatus(label) {
  return { 'New': 1, 'In Progress': 2, 'On Hold': 3, 'Complete': 5 }[label] || 1;
}
function mapPriority(val) {
  return { 1: 'High', 2: 'Medium', 3: 'Low' }[val] || 'Medium';
}

module.exports = router;

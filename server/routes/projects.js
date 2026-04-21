const express = require('express');
const router = express.Router();
const atClient = require('../middleware/autotask');

let companyMap = {};
let resourceMap = {};
let cacheExpiry = 0;

async function refreshLookups() {
  const now = Date.now();
  if (now < cacheExpiry) return;
  try {
    const [companiesRes, resourcesRes] = await Promise.all([
      atClient.get('/Companies/query', {
        params: { search: JSON.stringify({ filter: [{ field: 'id', op: 'gt', value: 0 }] }) },
      }),
      atClient.get('/Resources/query', {
        params: { search: JSON.stringify({ filter: [{ field: 'id', op: 'gt', value: 0 }] }) },
      }),
    ]);
    const cm = {};
    (companiesRes.data.items || []).forEach(c => { cm[c.id] = c.companyName; });
    companyMap = cm;
    const rm = {};
    (resourcesRes.data.items || []).forEach(r => { rm[r.id] = r.firstName + ' ' + r.lastName; });
    resourceMap = rm;
    cacheExpiry = now + 10 * 60 * 1000;
  } catch (err) {
    console.error('[lookups] refresh error:', err.message);
  }
}

router.get('/companies/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  try {
    const { data } = await atClient.get('/Companies/query', {
      params: {
        search: JSON.stringify({
          filter: [{ field: 'companyName', op: 'contains', value: q }],
        }),
      },
    });
    res.json((data.items || []).slice(0, 10).map(c => ({ id: c.id, name: c.companyName })));
  } catch (err) {
    console.error('[companies/search] error:', err.message);
    res.status(502).json({ error: 'Failed to search companies' });
  }
});

router.get('/resources/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  try {
    const { data } = await atClient.get('/Resources/query', {
      params: {
        search: JSON.stringify({
          filter: [{ field: 'firstName', op: 'contains', value: q }],
        }),
      },
    });
    res.json((data.items || []).slice(0, 10).map(r => ({ id: r.id, name: r.firstName + ' ' + r.lastName })));
  } catch (err) {
    console.error('[resources/search] error:', err.message);
    res.status(502).json({ error: 'Failed to search resources' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [{ data }] = await Promise.all([
      atClient.get('/Projects/query', {
        params: {
          search: JSON.stringify({
            filter: [{ field: 'status', op: 'notEqual', value: 6 }],
          }),
        },
      }),
      refreshLookups(),
    ]);

    const projects = (data.items || []).map(p => ({
      id: p.id,
      name: p.projectName,
      client: companyMap[p.companyID] || (p.companyID === 0 ? 'NERO Consulting' : `Client #${p.companyID}`),
      status: mapStatus(p.status),
      priority: mapPriority(p.priority),
      assignee: resourceMap[p.projectLeadResourceID] || String(p.projectLeadResourceID || ''),
      dueDate: p.endDateTime,
      tasksTotal: 100,
      tasksDone: p.completedPercentage || 0,
      description: p.description || '',
      tags: [],
    })).sort((a, b) => b.id - a.id);

    res.json(projects);
  } catch (err) {
    console.error('[projects] GET error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to fetch projects from Autotask' });
  }
});

router.post('/', async (req, res) => {
  const { name, companyID, assigneeID, startDate, endDate, description, projectType } = req.body;
  const isInternal = projectType === 'internal';
  if (!name || (!companyID && !isInternal)) return res.status(400).json({ error: 'name and companyID required' });
  try {
    const { data } = await atClient.post('/Projects', {
      projectName: name,
      companyID: isInternal ? 0 : parseInt(companyID),
      projectLeadResourceID: assigneeID ? parseInt(assigneeID) : undefined,
      startDateTime: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDateTime: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      description: description || '',
      status: 1,
      estimatedHours: 0,
      projectType: isInternal ? 4 : 5,
    });
    res.json({ id: data.itemId, ...req.body });
  } catch (err) {
    console.error('[projects] POST error:', JSON.stringify(err.response?.data) || err.message);
    res.status(502).json({ error: 'Failed to create project' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  try {
    await atClient.put(`/Projects/${id}`, {
      id: parseInt(id),
      status: reverseMapStatus(status),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[projects] PUT error:', err.response?.data || err.message);
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

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getProjects:         ()           => request('GET',   '/projects'),
  updateProjectStatus: (id, status) => request('PATCH', `/projects/${id}`, { status }),
  getTasksForProject:  (projectId)  => request('GET',   `/tasks/${projectId}`),
  updateTaskStatus:    (id, status) => request('PATCH', `/tasks/${id}`, { status }),
  health:              ()           => request('GET',   '/health'),
};

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
  updateProject:       (body)       => request('PATCH', '/projects/update', body),
  createProject:       (body)       => request('POST',  '/projects', body),
  searchCompanies:     (q)          => request('GET',   `/projects/companies/search?q=${encodeURIComponent(q)}`),
  searchResources:     (q)          => request('GET',   `/projects/resources/search?q=${encodeURIComponent(q)}`),
  getResources:        ()           => request('GET',   '/projects/resources'),
  getTasksForProject:  (projectId)  => request('GET',   `/tasks/${projectId}`),
  updateTask:          (body)       => request('PATCH', '/tasks/update', body),
  updateTaskStatus:    (id, status) => request('PATCH', `/tasks/${id}`, { status }),
  createTask:          (body)       => request('POST',  '/tasks', body),
  createPhase:         (body)       => request('POST',  '/tasks/phases', body),
  health:              ()           => request('GET',   '/health'),
};

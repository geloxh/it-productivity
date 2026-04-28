const BASE = '/api/v1/dashboard'
const get = (path) => fetch(`${BASE}${path}`, { credentials: 'include' }).then(r => r.json())

export const dashboardApi = {
    getOverview: () => get('/overview'),
    getAssets: () => get('/assets'),
    getTickets: () => get('/tickets'),
    getProjects: () => get('/projects'),
    getTasks: () => get('/tasks'),
    getTimeSeries: () => get('/timeseries'),
    getWidgets: () => get('/widgets'),
    getHealth: () => fetch('/api/v1/health', { credentials: 'include' }).then(r => r.json()).catch(() => ({ ok: false }))
}
const BASE = '/api/dashboard'
const get = (path) => fetch(`${BASE}${path}`, { credentials: 'include' }).then(r => r.json())

export const dashboardApi = {
    getOverview: () => get('/overview'),
}
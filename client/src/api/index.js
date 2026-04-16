const BASE = 'api/v1'
const ALLOWED = /^\/[a-zA-Z0-9\-/_]+$/

const req = ( method, path, body ) => fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    ...(body && { body: JSON.stringify(body) })
}).then(r => r.json())

export const api = {
    get: (path) => req('GET', path),
    post: (path, body) => req('POST', path, body),
    put: (path, body) => req('PUT', path, body),
    delete: (path) => req('DELETE', path),
}
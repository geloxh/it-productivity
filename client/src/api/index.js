const BASE = 'api/v1'
const ALLOWED = /^\/[a-zA-Z0-9\-/_]+$/

const req = (method, path, body) => {
    if (!ALLOWED.test(path)) throw new Error('Invalid API path.')
        return fetch(`${BASE}${path}`, {
            method,
            credentials: 'include',
            headers: body ? { 'Content-Type': 'application/json' } : {},
            ...(body && { body: JSON.stringify(body) })
    }).then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error ?? 'Request failed.')
        return data
    })
}

export const api = {
    get: (path) => req('GET', path),
    post: (path, body) => req('POST', path, body),
    put: (path, body) => req('PUT', path, body),
    patch: (path, body) => req('PATCH', path, body), 
    delete: (path) => req('DELETE', path),
}

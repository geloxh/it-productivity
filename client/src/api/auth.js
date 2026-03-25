const BASE = '/api/auth'

export const authApi = {
  register: (data) => fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  }).then(r => r.json()),

  login: (data) => fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  }).then(r => r.json()),

  logout: () => fetch(`${BASE}/logout`, {
    method: 'POST',
    credentials: 'include'
  }).then(r => r.json()),

  me: () => fetch(`${BASE}/me`, {
    credentials: 'include'
  }).then(r => r.json())
}
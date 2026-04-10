const BASE = '/api/auth'

const parseJson = async (r) => {
  const text = await r.text()
  return text ? JSON.parse(text) : {}
}

export const authApi = {
  register: (data) => fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  }).then(parseJson),

  login: (data) => fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  }).then(parseJson),

  logout: () => fetch(`${BASE}/logout`, {
    method: 'POST',
    credentials: 'include'
  }).then(parseJson),

  me: () => fetch(`${BASE}/me`, {
    credentials: 'include'
  }).then(parseJson)
}
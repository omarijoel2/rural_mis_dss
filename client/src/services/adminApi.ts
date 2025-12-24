const API_BASE = '/api/v1/admin';

// Users
export async function listUsers() {
  const res = await fetch(`${API_BASE}/users`); return res.json();
}
export async function getUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`); return res.json();
}
export async function createUser(data) {
  const res = await fetch(`${API_BASE}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json();
}
export async function updateUser(id, data) {
  const res = await fetch(`${API_BASE}/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json();
}
export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' }); return res.json();
}

// Roles
export async function listRoles() {
  const res = await fetch(`${API_BASE}/roles`); return res.json();
}
export async function getRole(id) {
  const res = await fetch(`${API_BASE}/roles/${id}`); return res.json();
}
export async function createRole(data) {
  const res = await fetch(`${API_BASE}/roles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json();
}
export async function updateRole(id, data) {
  const res = await fetch(`${API_BASE}/roles/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json();
}
export async function deleteRole(id) {
  const res = await fetch(`${API_BASE}/roles/${id}`, { method: 'DELETE' }); return res.json();
}

// Permissions
export async function listPermissions() {
  const res = await fetch(`${API_BASE}/permissions`); return res.json();
}
export async function getPermission(id) {
  const res = await fetch(`${API_BASE}/permissions/${id}`); return res.json();
}
export async function createPermission(data) {
  const res = await fetch(`${API_BASE}/permissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json();
}
export async function updatePermission(id, data) {
  const res = await fetch(`${API_BASE}/permissions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json();
}
export async function deletePermission(id) {
  const res = await fetch(`${API_BASE}/permissions/${id}`, { method: 'DELETE' }); return res.json();
}

// Settings
export async function listSettings() {
  const res = await fetch(`${API_BASE}/settings`); return res.json();
}
export async function getSetting(id) {
  const res = await fetch(`${API_BASE}/settings/${id}`); return res.json();
}
export async function createSetting(data) {
  const res = await fetch(`${API_BASE}/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json();
}
export async function updateSetting(id, data) {
  const res = await fetch(`${API_BASE}/settings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json();
}
export async function deleteSetting(id) {
  const res = await fetch(`${API_BASE}/settings/${id}`, { method: 'DELETE' }); return res.json();
}

// Audit logs
export async function listAuditLogs() {
  const res = await fetch(`${API_BASE}/audit`); return res.json();
}
export async function getAuditLog(id) {
  const res = await fetch(`${API_BASE}/audit/${id}`); return res.json();
}
export async function deleteAuditLog(id) {
  const res = await fetch(`${API_BASE}/audit/${id}`, { method: 'DELETE' }); return res.json();
}

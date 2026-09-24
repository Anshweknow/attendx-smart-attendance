const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => { onUnauthorized = handler; };
export class ApiError extends Error { constructor(message, status) { super(message); this.status = status; } }
export async function api(path, options = {}) {
  const token = options.token || localStorage.getItem('attendx_token');
  try {
    const response = await fetch(`${baseUrl}/api${path}`, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      const error = new ApiError(payload.message || 'We could not complete that request.', response.status);
      if (response.status === 401 && onUnauthorized) onUnauthorized(error.message);
      throw error;
    }
    return payload.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unable to reach AttendX. Check your connection and try again.', 0);
  }
}
export const get = (path) => api(path);
export const post = (path, data) => api(path, { method: 'POST', body: JSON.stringify(data) });
export const put = (path, data) => api(path, { method: 'PUT', body: JSON.stringify(data) });
export const del = (path) => api(path, { method: 'DELETE' });

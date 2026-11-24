import axios from 'axios';
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((c) => { const t = localStorage.getItem('sph_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401 && !e.config.url.startsWith('/auth/login')) { localStorage.removeItem('sph_token'); window.location.href = '/login?expired=1'; }
  return Promise.reject(e);
});
export const errMsg = (e) => e.response?.data?.errors?.map((x) => `${x.path}: ${x.message}`).join(', ') || e.response?.data?.message || e.message;
export async function downloadDoc(doc) {
  const r = await api.get(`/documents/${doc._id}/download`, { responseType: 'blob' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(r.data); a.download = doc.originalName; a.click(); URL.revokeObjectURL(a.href);
}
export default api;

import Notification from '../models/Notification.js';
export function notify(userIds, type, title, message, link) {
  const ids = [...new Set(userIds.filter(Boolean).map((u) => String(u._id || u)))];
  if (!ids.length) return Promise.resolve();
  return Notification.insertMany(ids.map((user) => ({ user, type, title, message, link }))).catch(() => {});
}

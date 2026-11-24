import AuditLog from '../models/AuditLog.js';
export const audit = (actor, action, target, meta) => AuditLog.create({ actor: actor?._id, action, target, meta }).catch(() => {});

const same = (a, b) => a && b && String(a._id || a) === String(b._id || b);
export const isMember = (u, p) => same(p.owner, u) || p.team.some(m => same(m.user, u));
export const canView = (u, p) => u.role === 'admin' || isMember(u, p) || (u.role === 'teacher' && same(p.teacher, u));
export const canEdit = (u, p) => u.role === 'admin' || (u.role === 'student' && isMember(u, p));
export const isAssignedTeacher = (u, p) => u.role === 'teacher' && same(p.teacher, u);

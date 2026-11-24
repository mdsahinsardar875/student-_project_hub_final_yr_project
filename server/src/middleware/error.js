import { ZodError } from 'zod';
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found' });
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) return res.status(400).json({ success: false, message: 'Validation failed', errors: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })) });
  if (err.name === 'MulterError') return res.status(400).json({ success: false, message: err.message });
  if (err.message === 'File type not allowed') return res.status(400).json({ success: false, message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid id' });
  if (err.code === 11000) return res.status(409).json({ success: false, message: 'Duplicate value: record already exists' });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ success: false, message: status === 500 ? 'Internal server error' : err.message });
}

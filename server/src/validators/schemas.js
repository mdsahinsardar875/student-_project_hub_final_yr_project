import { z } from 'zod';
const pw = z.string().min(8, 'Min 8 characters').regex(/[A-Za-z]/, 'Needs a letter').regex(/\d/, 'Needs a digit');
export const registerSchema = z.object({
  role: z.enum(['student', 'teacher']),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: pw,
  department: z.string().min(1),
  rollNumber: z.string().optional(),
  employeeId: z.string().optional(),
}).refine(d => d.role !== 'student' || !!d.rollNumber, { message: 'Roll number required for students', path: ['rollNumber'] });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1), role: z.enum(['student', 'teacher', 'admin']).optional() });
export const resetSchema = z.object({ token: z.string().min(10), password: pw });
export const projectSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(800),
  department: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(['academic', 'research']).default('academic'),
  teamSize: z.coerce.number().int().min(1).max(10).optional(),
  expectedSubmissionDate: z.coerce.date().optional(),
  teacher: z.string().optional(),
  teamEmails: z.array(z.string()).max(9).optional(),
  milestones: z.array(z.object({ title: z.string().min(1), description: z.string().optional(), dueDate: z.coerce.date().optional() })).max(15).optional(),
});
export const projectUpdateSchema = projectSchema.partial().omit({ teamEmails: true, teacher: true });
export const memberSchema = z.object({ identifier: z.string().min(2), role: z.string().default('Member'), responsibility: z.string().optional() });
export const progressSchema = z.object({ percent: z.coerce.number().min(0).max(100), note: z.string().max(500).optional(), milestoneId: z.string().optional(), milestoneStatus: z.enum(['not_started', 'in_progress', 'completed']).optional() });
export const submissionSchema = z.object({ note: z.string().max(1000).optional(), documentIds: z.array(z.string()).min(1, 'Attach at least one document') });
export const reviewSchema = z.object({ decision: z.enum(['approve', 'request_revision', 'needs_review']), comment: z.string().max(2000).optional() });
export const evaluationSchema = z.object({
  criteria: z.array(z.object({ name: z.string().min(1), max: z.coerce.number().min(0), obtained: z.coerce.number().min(0) })).min(1),
  remarks: z.string().max(2000).optional(),
  publish: z.boolean().optional(),
}).refine(d => d.criteria.every(c => c.obtained <= c.max), { message: 'Marks obtained cannot exceed max marks' });

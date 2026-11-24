export const DEPARTMENTS = ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'];
export const CATEGORIES = ['Web Application', 'Mobile Application', 'Machine Learning / AI', 'IoT / Embedded', 'Data Science', 'Other'];
export const DEFAULT_MILESTONES = ['Requirement Analysis', 'Design & UI Development', 'Implementation', 'Testing & Bug Fixing', 'Final Submission'];
export const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–';

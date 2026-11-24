import { Link } from 'react-router-dom';
const Page = ({ code, title, text }) => <div className="grid min-h-screen place-items-center p-4"><div className="glass max-w-lg p-10 text-center"><div className="text-6xl font-extrabold text-lav">{code}</div><h1 className="mt-2 text-2xl font-bold">{title}</h1><p className="mt-2 text-sm text-slate-400">{text}</p><Link to="/" className="btn-primary mt-6">Back to Home</Link></div></div>;
export const NotFound = () => <Page code="404" title="Page Not Found" text="The page you're looking for doesn't exist or may have been moved." />;
export const Forbidden = () => <Page code="403" title="Access Denied" text="Your account role doesn't have permission to view this page." />;

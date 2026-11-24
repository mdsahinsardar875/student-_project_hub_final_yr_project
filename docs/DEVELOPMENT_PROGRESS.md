# Development Progress (honest status)

## Environment limits in this session
- Node 22 available; **npm registry unreachable** → dependencies not installed.
- Therefore **not run**: backend server, automated tests, React build, browser, visual comparison.
- Only check performed: `node --check` syntax pass on all backend files (passed). Client JSX was **not** compiled.

## Done (written, unverified)
- Mongoose models: User, Project (team, milestones), ProjectDocument (versions), Submission (reviews), Evaluation (history, publish), ProgressUpdate, AuditLog
- JWT auth, role guards, bcrypt hashing, login rate limit, Helmet, CORS, Zod validation, central error handler, upload type/size limits, password reset (dev token, no mail), admin creation script from env (no hardcoded password)
- ~35 REST endpoints (auth, projects, team, progress, documents, submissions, evaluations, admin)
- Supertest workflow test (`server/tests/workflow.test.js`, 9 cases: register, role rules, project, upload/download + bad type, progress, submit, revision→approve, access denial, evaluation visibility, admin guard)
- React client: login, register, forgot-password, 404/403, student dashboard/projects/4-step create/details (docs, progress, team, submissions, feedback, results), teacher dashboard/projects/reviews/review+evaluate, admin dashboard/users/projects/audit

## Added in round 2 (written, unverified)
Settings/profile + change password, announcements (create/schedule/draft/archive), support tickets (user + admin reply/status), calendar, global search, help/FAQ, about, privacy/terms, teacher students + reports (charts), admin evaluations oversight + reports. +3 backend test groups.

## Added in round 3 (written, unverified)
Notification centre + unread bell (auto-created on submission, review, evaluation publish, task assignment, announcements, ticket replies), real login sessions (list/revoke/log out other devices; revoked tokens rejected), team chat (polling), task board with completion %, file manager (cross-project, folders by category, upload/download/delete), final project summary page with checklist, progress chart, print-to-PDF report and certificate, system status (real DB ping, memory, CPU, storage), backup & database (JSON snapshot create/list/download/delete; restore via `scripts/restoreBackup.js`), audit & activity logs with filters, CSV export, trend chart, login success/failure counts. Failed logins are now audited. +5 backend test groups.

## Not done
- Two-factor authentication and email verification codes (need an email/authenticator service)
- Real PDF generation (print-to-PDF used instead), emailed notifications, real-time chat (uses 5 s polling)
- In-app backup restore (CLI only, deliberately), audit policy toggles/"compliance status" (the design's toggles have no real rules behind them)
- Teacher/student star ratings on feedback, task-allocation per member view, system maintenance-mode and 500-page flows
- Pixel-faithful styling; VISUAL_VERIFICATION_REPORT; academic docs/ER/DFD; Docker Compose; browser/responsive tests
- Nothing has been executed: install, run tests, then fix first-run errors

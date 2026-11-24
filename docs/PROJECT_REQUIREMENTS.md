# Synopsis Objectives → Modules
(The synopsis PDF was not uploaded; objectives are taken from the text of your master prompt.)

| # | Objective | Backend | Frontend | Status |
|---|---|---|---|---|
| 1 | Centralised platform | Express API, MongoDB, roles | React app, 3 role shells | 🟡 core built |
| 2 | Create/update project details | `POST/PATCH /projects` | CreateProject, ProjectDetails (edit UI not built; API ready) | 🟡 |
| 3 | Project & document submissions | `/projects/:id/documents`, `/submissions` | ProjectDetails | ✅ code written |
| 4 | Teachers monitor projects | `GET /projects` (assigned), claim | teacher/Projects, ReviewProject | ✅ code written |
| 5 | Evaluation, marks, feedback | `/submissions/:id/review`, `PUT /projects/:id/evaluation` | ReviewProject, ProjectDetails | ✅ code written |
| 6 | Digital records & progress | ProgressUpdate, Submission, Evaluation history, AuditLog | ProjectDetails | ✅ code written |

"Code written" ≠ verified: nothing has been executed (see DEVELOPMENT_PROGRESS.md).

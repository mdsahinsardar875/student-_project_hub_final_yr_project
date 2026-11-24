# Image-to-Page Mapping

Source: `Page_05___My_Projects.pdf` — **61 pages, each a design image** (no separate JPG files or `admin page` folder were uploaded; PDF page order is used instead of filenames).
Status key: ✅ implemented (functional, unverified in browser) · 🟡 partial · ⬜ not built · 📝 note

## Student / public
| PDF p. | Screen | Role | Route | Component | Status |
|---|---|---|---|---|---|
| 6 | Landing page | public | `/` | `public/Landing` | 🟡 hero + 3 feature cards + CTA; no product mock-up, no "How it works" section |
| 3 | Log In (Student/Teacher/Admin tabs) | all | `/login` | `public/Login` | ✅ (Google button omitted: marked "Optional") |
| 4 | Create Account | public | `/register` | `public/Register` | ✅ |
| 7 | Registration states contact sheet (~40 thumbnails: validation, success, "Registration Submitted") | public | — | — | 📝 states of p.4; covered by inline validation + redirect on success, no separate success screen |
| 5 | Student Dashboard | student | `/student` | `student/Dashboard` | 🟡 stats + current projects; no chart, deadlines, feedback or submissions widgets |
| 1 | My Projects | student | `/student/projects` | `student/MyProjects` | 🟡 tabs, search, cards; no grid/list toggle, sort, summary donut, timeline |
| 2, 61, 60, 59 | Create Project steps 1–4 | student | `/student/create` | `student/CreateProject` | ✅ one component, 4 steps |
| 58 | Project Details | student | `/student/projects/:id` | `student/ProjectDetails` | 🟡 |
| 56 | Team Management | student | (inside Project Details) | `ProjectDetails` | 🟡 add/remove only; role edit API exists, no UI; no task allocation |
| 55 | Project Submissions | student | (inside Project Details) | `ProjectDetails` | 🟡 upload, versions, submit, history |
| 57 | Progress Tracker | student | (inside Project Details) | `ProjectDetails` | 🟡 progress updates + milestones, no charts |
| 54 | Teacher Feedback & Review | student | (inside Project Details) | `ProjectDetails` | 🟡 teacher comments shown; no ratings/suggested-improvements checklist |
| 53 | Evaluation & Results | student | (inside Project Details) | `ProjectDetails` | 🟡 marks, grade, remarks; no certificate/PDF/re-evaluation |
| 52 | Student Settings & Profile | student | — | — | ⬜ (API `PATCH /auth/profile`, `/auth/change-password` exist) |

## Teacher
| PDF p. | Screen | Route | Component | Status |
|---|---|---|---|---|
| 51 | Teacher Dashboard | `/teacher` | `teacher/Dashboard` | 🟡 stats + pending list |
| 50 | Project Management | `/teacher/projects` | `teacher/Projects` | 🟡 |
| 49 | Review & Feedback | `/teacher/reviews`, `/teacher/projects/:id` | `Reviews`, `ReviewProject` | ✅ approve / request revision / further review |
| 48 | Project Evaluation | `/teacher/projects/:id` | `ReviewProject` | ✅ criteria, marks, grade, remarks, publish |
| 47 | Student Management | — | — | ⬜ |
| 46 | Teacher Announcements | — | — | ⬜ |
| 45 | Teacher Reports & Analytics | — | — | ⬜ |
| 44 | Teacher Settings | — | — | ⬜ |

## Admin (neon-style set; sidebars on pp. 8–28 say "Admin Panel" but their content is mostly student-facing — see Observations)
| PDF p. | Screen | Status |
|---|---|---|
| 43 | Admin Dashboard | 🟡 counts only (`/admin`) |
| 42 | Users Management | 🟡 list/filter/search/activate (`/admin/users`); no add/edit/import |
| 41 | Projects Management | 🟡 list + assign teacher (`/admin/projects`) |
| 36 | Activity Logs & Security | 🟡 audit list (`/admin/audit`) |
| 29 | Admin Login & Access Recovery | 🟡 admin tab on `/login` + forgot-password; no 2FA/verification code |
| 40, 39, 38, 37, 35, 34, 33, 32, 31, 30 | Evaluations Mgmt, Announcements, Reports, System Settings, Backup, Notifications, Support Tickets, Audit & Compliance, Account Settings, Logout/Sessions | ⬜ |
| 8–28 | Project Completion, Final Summary, Completion & Evaluation, Review & Approval, Submission History, File Manager, Team Collaboration, Milestones & Tasks, Calendar, Global Search, Notifications Center, System Status, Privacy/Terms, About, Ticket Tracking, Contact & Feedback, Help Center, Session Expired, 500, 404, 403 | ⬜ except 404/403 (`public/ErrorPages`) and session-expired (redirect to `/login?expired=1` with message) 🟡 |

## Observations needing your decision
1. **Two visual styles:** pp. 1–6, 61 are flat dark UI; pp. 8–60 are glowing neon. Implementation currently uses one shared theme.
2. **p. 37 System Settings is garbled** (corrupted placeholder text) — unusable as a reference.
3. **pp. 8–28 mix roles:** "Admin Panel" sidebar around student-facing pages (e.g. "Your project has been completed"). Needs a decision on who sees them.
4. **Designs contain names/photos** (e.g. "Dr. A. K. Sharma", stock photos, fictional data). Per your rules none were copied.
5. **Admin-only features outside the synopsis** (Backup & Database, Compliance, System Status) have no real backing in this stack unless built deliberately.

## Round 3 status updates
Now implemented (🟡 functional, not pixel-matched): pp. 18/34 Notifications, 13 File Manager, 14 Team Collaboration (`projects/:id/chat`), 15 Milestones & Tasks (`projects/:id/tasks`), 9/10/8 Final Summary / Completion / Success (`projects/:id/report`, with certificate), 12 Submission History (project page), 19 System Status, 35 Backup & Database, 32/36 Audit & Activity Logs, 30 Sessions, 16 Calendar, 17 Search, 22/23/33 Support, 24 Help, 20 Privacy, 21 About, 39/46 Announcements, 40 Admin Evaluations, 38/45 Reports, 47 Teacher Students, 31/44/52 Settings & Profile.
Still ⬜: 2FA/verification (p. 29), 26 maintenance page, 11 admin-wide review queue (teacher review covers it), 37 (garbled reference).

# Smart Student Information & Academic Management System
# Agentic AI-Powered Academic Management Platform

A genuinely integrated Agentic AI platform where autonomous agents observe events, evaluate academic invariants, plan tasks, execute permitted backend operations, enforce human safety authorizations, and coordinate across all 8 user roles.

---

## 🏛️ System Architecture

### 1. Central Orchestrator & 12 Specialized Agents
The system connects all campus stakeholders through a centralized orchestration engine (`orchestrator.ts`) coordinating 12 specialized agents:

1. **Student Personal Assistant Agent (`agent_student_pa`)**: Context-aware student copilot. Answers attendance queries, explains internal marks, monitors approaching assignment deadlines, and parses natural language reminder commands (e.g. *"Remind me to complete my DBMS assignment tomorrow at 6 PM"*).
2. **Academic Coordination Agent (`agent_academic_coord`)**: Synthesizes cross-cutting class metrics for Class In-charges and HODs, identifies pending faculty sessions, unverified marks, and calculates student shortage risks.
3. **Assignment Management Agent (`agent_assignment`)**: Validates assignment specifications, distributes student notifications, monitors submissions, and identifies missing students to send automated reminders.
4. **Attendance Monitoring Agent (`agent_attendance`)**: Validates period records, detects missing or duplicate roll calls, calculates subject and overall attendance percentages, flags shortage (&lt;75%), and alerts students and Class In-charges.
5. **Marks and Performance Agent (`agent_marks`)**: Collects Mid-1, Mid-2, and assessment scores, executes the deterministic college formula `(0.8 × Best Mid + 0.2 × Other Mid scaled to 15) + Assignment (10) + Attendance (5) = Max 30`, flags academic attention cases, and prepares verification snapshots.
6. **Timetable Management Agent (`agent_timetable`)**: Manages schedule slot matrices, detects conflict invariants, maintains versioning, publishes approved timetable PDFs, and broadcasts updates.
7. **Library Management Agent (`agent_library`)**: Scans active book loans, detects approaching return deadlines, computes overdue fines deterministically at Rs. 5/day, and manages library clearance records.
8. **Certificate Processing Agent (`agent_certificate`)**: Extracts verified student academic records, prepares formal certificate drafts (Bonafide, Transfer, Conduct), enqueues Level 3 human authorization, and renders official signed PDFs upon approval.
9. **No-Dues Coordination Agent (`agent_no_dues`)**: Orchestrates multi-department clearance across Library, Accounts, Laboratories, and Hostel, aggregates dues, and routes for officer authorization.
10. **Administrative Request Agent (`agent_admin_request`)**: Classifies incoming student support tickets via NLP, routes to responsible offices (Academics, Accounts, Examinations, Administration), and tracks SLA deadlines.
11. **Reporting and Analytics Agent (`agent_reporting`)**: Synthesizes department compliance rates, faculty submission punctuality, and semester academic performance into structured executive reports for HOD.
12. **System Monitoring Agent (`agent_monitoring`)**: Telemetry watchdog monitoring agent task queues, computing execution latencies, auto-retrying failed tasks, and escalating unrecoverable errors to Super Admin.

---

## 🛡️ 3-Tier Agent Autonomy & Safety Architecture

- **LEVEL 1: FULL AUTOMATION**
  - Independent notifications & reminders
  - Deterministic attendance percentage calculations
  - Scheduled library loan due date checks & fine assessments
  - Natural language reminder parsing
  - Ticket categorization & SLA deadline assignment
- **LEVEL 2: AUTOMATION WITH REVIEW**
  - Preparing formal certificate drafts
  - Internal marks calculation snapshots
  - Multi-department no-dues clearance summaries
  - AI evaluation feedback suggestions
- **LEVEL 3: HUMAN AUTHORIZATION REQUIRED (No Autonomous Execution)**
  - Publishing official internal marks to students
  - Issuing official Bonafide and academic certificates
  - Authorizing financial transactions or updating ledger balances
  - Granting final institutional No-Dues clearance

---

## 👥 The 8 User Roles & Demo Credentials

Use the **Instant 1-Click Role Switcher** on the login page or enter credentials:

| Role | Username | Password | Full Name | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student1` | `password123` | Aarav Sharma | B.Tech CSE III Year (Roll: 21CSE042) |
| **Faculty** | `faculty1` | `password123` | Dr. K. S. Rao | Associate Professor (DBMS & OS) |
| **Class In-charge**| `classincharge1` | `password123` | Dr. Ramesh Chandra | Class In-charge (CSE-3A Coordination Center) |
| **HOD** | `hod_cse` | `password123` | Dr. V. N. Murthy | Head of Department (CSE) |
| **Office Admin** | `officeadmin1` | `password123` | Mr. S. K. Gupta | Senior Administrative Officer (Certificates) |
| **Library Admin** | `libadmin1` | `password123` | Mrs. Lakshmi Devi | Chief Librarian (Book Loans & Fines) |
| **Accounts Admin** | `accounts1` | `password123` | Mr. Rajesh Nair | Senior Accounts Officer (Fee Verification) |
| **Super Admin** | `superadmin` | `admin123` | System Administrator | AI Agent Management Center Control Plane |

---

## 🚀 Running the System

### Prerequisites
- Node.js v18+ (tested on Node v24.18.0)
- npm 10+

### Option 1: Start Both Backend and Frontend
In PowerShell:
```powershell
.\run.ps1
```

Or start manually:

**1. Start Backend:**
```powershell
cd backend
npm run dev
```
Backend API will listen at `http://localhost:5000`.

**2. Start Frontend:**
```powershell
cd frontend
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

### Option 2: Run End-to-End Multi-Agent Test Suite
To execute the automated 15-test verification suite covering all multi-agent workflows:
```powershell
cd backend
npx tsx src/test_workflows.ts
```

---

## 🗄️ Database & Supabase Integration
- Full PostgreSQL schema with RLS policies, trigger types, and agent tables located in `supabase/schema.sql`.
- In-memory persistence engine with JSON backup in `backend/data/campus.json`.

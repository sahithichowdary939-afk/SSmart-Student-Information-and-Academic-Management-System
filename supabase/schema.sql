-- ============================================================================
-- SMART STUDENT INFORMATION & ACADEMIC MANAGEMENT SYSTEM
-- AGENTIC AI ARCHITECTURE & RELATIONAL DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CORE AUTH & IDENTITY TABLES
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'student',
    'faculty',
    'class_incharge',
    'hod',
    'office_admin',
    'library_admin',
    'accounts_admin',
    'super_admin'
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hod_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    year INT NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(department_id, year, semester, section, academic_year)
);

CREATE TABLE IF NOT EXISTS student_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    class_id UUID REFERENCES classes(id),
    current_year INT NOT NULL,
    semester INT NOT NULL,
    blood_group VARCHAR(10),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    address TEXT,
    cgpa NUMERIC(4, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    designation VARCHAR(100) NOT NULL,
    qualification VARCHAR(255),
    cabin_location VARCHAR(100),
    specialization TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_incharges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, academic_year)
);

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id),
    class_id UUID REFERENCES classes(id),
    faculty_user_id UUID REFERENCES users(id),
    semester INT NOT NULL,
    credits INT DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. ACADEMIC MODULE TABLES (ATTENDANCE, ASSIGNMENTS, MARKS, TIMETABLE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_user_id UUID REFERENCES users(id),
    session_date DATE NOT NULL,
    session_period INT NOT NULL,
    topic VARCHAR(255),
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'verified', 'flagged'
    verified_by_incharge BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, subject_id, session_date, session_period)
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- 'present', 'absent', 'late'
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, student_user_id)
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    max_marks INT DEFAULT 10,
    status VARCHAR(50) DEFAULT 'published', -- 'draft', 'published', 'closed'
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    marks_obtained NUMERIC(5, 2),
    feedback TEXT,
    ai_suggested_feedback TEXT,
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'graded', 'late', 'missing'
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMPTZ,
    UNIQUE(assignment_id, student_user_id)
);

CREATE TABLE IF NOT EXISTS internal_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    mid1_marks NUMERIC(5, 2) DEFAULT 0,
    mid2_marks NUMERIC(5, 2) DEFAULT 0,
    assignment_marks NUMERIC(5, 2) DEFAULT 0,
    attendance_marks NUMERIC(5, 2) DEFAULT 0,
    consolidated_marks NUMERIC(5, 2) DEFAULT 0,
    max_marks NUMERIC(5, 2) DEFAULT 30,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted_by_faculty', 'verified_by_incharge', 'published_to_students'
    published_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_user_id, subject_id)
);

CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    version INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'approved', 'archived'
    approved_by UUID REFERENCES users(id),
    pdf_url TEXT,
    effective_from DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_id UUID REFERENCES timetables(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', ...
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id UUID REFERENCES subjects(id),
    faculty_user_id UUID REFERENCES users(id),
    room_number VARCHAR(50),
    UNIQUE(timetable_id, day_of_week, period_number)
);

-- ============================================================================
-- 3. ADMINISTRATIVE, LIBRARY & FINANCIAL TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS library_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isbn VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    shelf_location VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(50) DEFAULT 'issued', -- 'issued', 'returned', 'overdue'
    fine_amount NUMERIC(8, 2) DEFAULT 0.0,
    fine_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(50) NOT NULL,
    tuition_fee NUMERIC(10, 2) DEFAULT 0,
    library_fee NUMERIC(10, 2) DEFAULT 0,
    lab_fee NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    pending_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'paid', 'partial', 'pending', 'overdue'
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_fee_id UUID REFERENCES student_fees(id) ON DELETE CASCADE,
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL, -- 'online', 'bank_transfer', 'cheque', 'cash'
    reference_number VARCHAR(100) UNIQUE,
    verified_by UUID REFERENCES users(id),
    receipt_number VARCHAR(100) UNIQUE,
    payment_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificate_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    certificate_type VARCHAR(100) NOT NULL, -- 'bonafide', 'transfer', 'conduct', 'course_completion'
    purpose TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'applied', -- 'applied', 'under_review', 'draft_generated', 'approved', 'rejected', 'issued'
    draft_content JSONB,
    pdf_url TEXT,
    approved_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    issued_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS no_dues_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'initiated', -- 'initiated', 'in_progress', 'clearances_completed', 'approved', 'rejected', 'certificate_issued'
    final_approved_by UUID REFERENCES users(id),
    certificate_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS no_dues_clearances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES no_dues_requests(id) ON DELETE CASCADE,
    department VARCHAR(50) NOT NULL, -- 'library', 'accounts', 'laboratory', 'hostel'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'cleared', 'dues_found'
    dues_details JSONB,
    cleared_by_agent_or_officer VARCHAR(100),
    clearance_timestamp TIMESTAMPTZ,
    UNIQUE(request_id, department)
);

CREATE TABLE IF NOT EXISTS administrative_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    assigned_office VARCHAR(100), -- 'academics', 'accounts', 'examinations', 'administration'
    assigned_user_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'in_review', 'resolved', 'escalated'
    resolution_notes TEXT,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    remind_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'triggered', 'acknowledged'
    created_via_nl BOOLEAN DEFAULT FALSE,
    original_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generated_by_agent_id VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id),
    class_id UUID REFERENCES classes(id),
    report_type VARCHAR(100) NOT NULL, -- 'department_summary', 'attendance_shortage', 'marks_analysis', 'faculty_submission_audit'
    report_title VARCHAR(255) NOT NULL,
    report_data JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. AGENTIC AI & AUTONOMOUS WORKFLOW ARCHITECTURE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_agents (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role_category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    autonomy_level INT DEFAULT 1, -- 1: Full, 2: Review, 3: Human Auth
    is_active BOOLEAN DEFAULT TRUE,
    current_status VARCHAR(50) DEFAULT 'idle', -- 'idle', 'running', 'paused', 'error'
    current_task_id UUID,
    total_successful_tasks INT DEFAULT 0,
    total_failed_tasks INT DEFAULT 0,
    total_pending_tasks INT DEFAULT 0,
    average_execution_time_ms INT DEFAULT 0,
    last_execution_at TIMESTAMPTZ,
    capabilities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    initiated_by_user_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Created', -- 'Created', 'Running', 'Waiting', 'Awaiting Approval', 'Completed', 'Failed', 'Escalated'
    payload JSONB DEFAULT '{}'::jsonb,
    context_data JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES agent_workflows(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    agent_id VARCHAR(100) REFERENCES ai_agents(id),
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'skipped'
    input_data JSONB,
    output_data JSONB,
    error_details TEXT,
    execution_time_ms INT DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS workflow_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES agent_workflows(id) ON DELETE CASCADE,
    step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
    required_role user_role NOT NULL,
    assigned_user_id UUID REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL, -- 'publish_marks', 'correct_attendance', 'issue_certificate', 'approve_financial', 'finalize_no_dues'
    description TEXT NOT NULL,
    data_snapshot JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewer_user_id UUID REFERENCES users(id),
    reviewer_comments TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    decided_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) REFERENCES ai_agents(id),
    workflow_id UUID REFERENCES agent_workflows(id) ON DELETE SET NULL,
    task_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    input_payload JSONB NOT NULL,
    output_result JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'escalated'
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    error_message TEXT,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_tool_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES agent_tasks(id) ON DELETE CASCADE,
    agent_id VARCHAR(100) REFERENCES ai_agents(id),
    tool_name VARCHAR(100) NOT NULL,
    arguments JSONB NOT NULL,
    response JSONB,
    status VARCHAR(50) DEFAULT 'success', -- 'success', 'error'
    execution_time_ms INT DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) REFERENCES ai_agents(id),
    task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
    trigger_event VARCHAR(100) NOT NULL,
    log_level VARCHAR(20) DEFAULT 'info', -- 'info', 'warn', 'error', 'audit'
    action_performed TEXT NOT NULL,
    input_reference TEXT,
    execution_result TEXT,
    approval_reference_id UUID REFERENCES workflow_approvals(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_agent_id VARCHAR(100) REFERENCES ai_agents(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) REFERENCES ai_agents(id),
    context_key VARCHAR(255) NOT NULL,
    context_value JSONB NOT NULL,
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, context_key)
);

CREATE TABLE IF NOT EXISTS agent_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) REFERENCES ai_agents(id) UNIQUE,
    execution_mode VARCHAR(50) DEFAULT 'auto', -- 'auto', 'dry_run', 'disabled'
    concurrency_limit INT DEFAULT 5,
    timeout_seconds INT DEFAULT 60,
    retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff_ms": 2000}'::jsonb,
    notification_rules JSONB DEFAULT '{"notify_on_failure": true, "escalate_after_retries": 2}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    agent_id VARCHAR(100) REFERENCES ai_agents(id),
    condition_expression JSONB DEFAULT '{}'::jsonb,
    action_type VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escalation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) REFERENCES ai_agents(id),
    task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
    workflow_id UUID REFERENCES agent_workflows(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'high', -- 'medium', 'high', 'critical'
    assigned_role user_role DEFAULT 'super_admin',
    resolution_status VARCHAR(50) DEFAULT 'open', -- 'open', 'acknowledged', 'resolved'
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE no_dues_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_notifications ENABLE ROW LEVEL SECURITY;

-- Students can read only their own profile
CREATE POLICY student_own_profile ON student_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Students can read only their own attendance
CREATE POLICY student_own_attendance ON attendance_records
    FOR SELECT USING (auth.uid() = student_user_id);

-- Students can read only their own marks
CREATE POLICY student_own_marks ON internal_marks
    FOR SELECT USING (auth.uid() = student_user_id AND status = 'published_to_students');

-- Students can read only their own submissions
CREATE POLICY student_own_submissions ON assignment_submissions
    FOR ALL USING (auth.uid() = student_user_id);

-- Faculty can read submissions for their assignments
CREATE POLICY faculty_assignment_submissions ON assignment_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_submissions.assignment_id 
            AND assignments.faculty_user_id = auth.uid()
        )
    );

-- Super admin bypass for audit and management
CREATE POLICY super_admin_all_profiles ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'
        )
    );

-- ============================================================================
-- 6. SYSTEM SEED AGENTS (THE 12 SPECIALIZED AGENTS + ORCHESTRATOR)
-- ============================================================================

INSERT INTO ai_agents (id, name, role_category, description, autonomy_level, is_active, capabilities)
VALUES
('orchestrator', 'System Orchestrator Agent', 'Core Orchestration', 'Coordinates all 12 specialized agents, routes events, enforces safety rules, handles workflow state transitions and retries/escalations.', 1, true, '["workflow_routing", "task_planning", "agent_coordination", "safety_verification", "escalation_management"]'),
('agent_student_pa', 'Student Personal Assistant Agent', 'Student Support', 'Context-aware student copilot. Answers attendance queries, marks explanation, assignment deadlines, and parses natural-language reminder commands.', 1, true, '["query_student_context", "parse_natural_language_reminder", "track_deadlines", "explain_grades"]'),
('agent_academic_coord', 'Academic Coordination Agent', 'Class In-charge & HOD Support', 'Aggregates attendance, assignments, timetable changes and internal marks into actionable daily coordination summaries and detects lagging operations.', 1, true, '["daily_coordination_summary", "detect_pending_submissions", "cross_check_schedules", "identify_academic_risks"]'),
('agent_assignment', 'Assignment Management Agent', 'Faculty & Student Automation', 'Validates assignment specs, distributes notifications, monitors incoming submissions, alerts students on approaching deadlines, and flags missing work.', 1, true, '["validate_assignment", "publish_and_notify", "track_submissions", "identify_missing_students", "generate_feedback_suggestions"]'),
('agent_attendance', 'Attendance Monitoring Agent', 'Attendance Automation', 'Validates session records, detects missing or duplicate entries, calculates subject and overall attendance percentages, flags shortage (<75%), and sends reminders.', 1, true, '["validate_attendance_input", "calculate_attendance_percentage", "detect_shortages", "send_shortage_alerts", "faculty_submission_reminders"]'),
('agent_marks', 'Marks and Performance Agent', 'Academic Assessment', 'Collects assessment scores (Mid-1, Mid-2, Assignments), applies deterministic college internal marks formula, identifies missing marks, flags anomalies and students needing academic attention.', 2, true, '["deterministic_marks_calculation", "detect_marks_anomalies", "identify_academic_attention", "sync_class_incharge"]'),
('agent_timetable', 'Timetable Management Agent', 'Curriculum Scheduling', 'Organizes timetable matrices, tracks schedule updates, versions schedules, drafts PDF timetable representations, and notifies affected students and faculty.', 1, true, '["organize_slots", "version_control_timetables", "generate_timetable_pdf", "notify_schedule_updates"]'),
('agent_library', 'Library Management Agent', 'Library Automation', 'Monitors book return deadlines, calculates overdue fines via college policy rules, issues reminder alerts, and updates library clearance statuses upon return.', 1, true, '["monitor_due_dates", "calculate_fines", "send_due_reminders", "verify_library_clearance"]'),
('agent_certificate', 'Certificate Processing Agent', 'Office Administration', 'Retrieves verified student records, validates application completeness, generates official certificate drafts, routes for officer approval, and produces signed PDFs.', 2, true, '["retrieve_verified_records", "validate_completeness", "generate_certificate_draft", "route_approval", "render_certificate_pdf"]'),
('agent_no_dues', 'No-Dues Coordination Agent', 'Multi-Agent Clearance', 'Orchestrates multi-department clearance: coordinates with Library, Accounts, Laboratory, and Hostel agents, aggregates dues, tracks resolution, and drafts final clearance.', 2, true, '["orchestrate_multi_dept_clearance", "aggregate_dues", "track_clearance_resolution", "prepare_clearance_summary"]'),
('agent_admin_request', 'Administrative Request Agent', 'Office Administration', 'Classifies student administrative requests via NLP, routes to responsible offices (Academics, Accounts, Exams), monitors SLAs, and auto-escalates overdue issues.', 1, true, '["classify_ticket", "route_to_office", "track_sla_deadlines", "escalate_overdue_tickets"]'),
('agent_reporting', 'Reporting and Analytics Agent', 'HOD & Executive Intelligence', 'Synthesizes department analytics, faculty submission compliance, semester trends, attendance histograms, and generates structured executive reports.', 1, true, '["generate_department_report", "faculty_compliance_audit", "attendance_distribution_stats", "semester_trend_analysis"]'),
('agent_monitoring', 'System Monitoring Agent', 'Super Admin & Reliability', 'Monitors agent task queues, detects failed or stalled workflows, computes execution metrics, runs automated health checks, and alerts administrators of failures.', 1, true, '["monitor_agent_health", "detect_stalled_tasks", "retry_idempotent_tasks", "system_telemetry", "trigger_escalation"]')
ON CONFLICT (id) DO NOTHING;

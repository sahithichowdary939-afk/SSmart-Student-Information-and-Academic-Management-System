export type UserRole =
  | 'student'
  | 'faculty'
  | 'class_incharge'
  | 'hod'
  | 'office_admin'
  | 'library_admin'
  | 'accounts_admin'
  | 'super_admin';

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  user_id: string;
  roll_number: string;
  admission_number: string;
  department_id: string;
  class_id: string;
  current_year: number;
  semester: number;
  blood_group?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  address?: string;
  cgpa: number;
}

export interface FacultyProfile {
  user_id: string;
  employee_id: string;
  department_id: string;
  designation: string;
  qualification: string;
  cabin_location?: string;
  specialization?: string;
}

export interface ClassInchargeMapping {
  id: string;
  faculty_user_id: string;
  class_id: string;
  academic_year: string;
  is_active: boolean;
  assigned_at?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hod_user_id?: string;
}

export interface CollegeClass {
  id: string;
  name: string;
  department_id: string;
  year: number;
  semester: number;
  section: string;
  academic_year: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department_id: string;
  class_id: string;
  faculty_user_id: string;
  semester: number;
  credits: number;
}

export interface AttendanceSession {
  id: string;
  class_id: string;
  subject_id: string;
  faculty_user_id: string;
  session_date: string;
  session_period: number;
  topic?: string;
  status: 'submitted' | 'verified' | 'flagged';
  verified_by_incharge: boolean;
  submitted_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_user_id: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  subject_id: string;
  faculty_user_id: string;
  department_id?: string;
  academic_year?: string;
  semester?: number;
  section?: string;
  title: string;
  description?: string;
  due_date: string;
  max_marks: number;
  status: 'draft' | 'published' | 'closed';
  published_at?: string;
  question_paper_pdf_url?: string;
  question_paper_filename?: string;
  created_at?: string;
}

export interface AssignmentQuestionFeedback {
  question_number: number;
  question_title: string;
  marks_awarded: number;
  max_marks: number;
  feedback: string;
  improvement_suggestions?: string;
}

export interface AssignmentAIEvaluation {
  suggested_marks: number;
  max_marks: number;
  question_wise_feedback: AssignmentQuestionFeedback[];
  overall_evaluation: string;
  evaluated_at: string;
  is_fallback?: boolean;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_user_id: string;
  submission_text?: string;
  file_url?: string;
  file_name?: string;
  submitted_at: string;
  marks_obtained?: number;
  feedback?: string;
  ai_suggested_feedback?: string;
  ai_evaluation?: AssignmentAIEvaluation;
  faculty_approved?: boolean;
  faculty_approved_at?: string;
  faculty_remarks?: string;
  status: 'submitted' | 'graded' | 'late' | 'missing';
  graded_by?: string;
  graded_at?: string;
}

export interface FacultyFeedbackRecord {
  id: string;
  student_user_id: string;
  faculty_user_id: string;
  department_id: string;
  subject_id: string;
  academic_year: string;
  semester: number;
  ratings: Record<string, number>;
  average_score: number;
  written_comments?: string;
  created_at: string;
}

export interface InternalMark {
  id: string;
  student_user_id: string;
  subject_id: string;
  class_id: string;
  mid1_marks: number;
  mid2_marks: number;
  assignment_marks: number;
  attendance_marks: number;
  consolidated_marks: number;
  max_marks: number;
  status: 'draft' | 'submitted_by_faculty' | 'verified_by_incharge' | 'published_to_students';
  published_at?: string;
  updated_at: string;
}

export interface TimetableSlot {
  id: string;
  timetable_id: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period_number: number;
  start_time: string;
  end_time: string;
  subject_id: string;
  faculty_user_id: string;
  room_number: string;
}

export interface Timetable {
  id: string;
  class_id: string;
  academic_year: string;
  semester: number;
  version: number;
  status: 'draft' | 'approved' | 'archived';
  approved_by?: string;
  pdf_url?: string;
  effective_from?: string;
  slots: TimetableSlot[];
}

export interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  total_copies: number;
  available_copies: number;
  shelf_location: string;
}

export interface LibraryIssue {
  id: string;
  book_id: string;
  student_user_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: 'issued' | 'returned' | 'overdue';
  fine_amount: number;
  fine_paid: boolean;
}

export interface StudentFee {
  id: string;
  student_user_id: string;
  academic_year: string;
  term: string;
  tuition_fee: number;
  library_fee: number;
  lab_fee: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  due_date: string;
}

export interface FeePayment {
  id: string;
  student_fee_id: string;
  student_user_id: string;
  amount: number;
  payment_mode: 'online' | 'bank_transfer' | 'cheque' | 'cash';
  reference_number: string;
  verified_by?: string;
  receipt_number: string;
  payment_date: string;
}

export type CertificateStatus =
  | 'payment_pending'
  | 'receipt_uploaded'
  | 'under_verification'
  | 'approved'
  | 'rejected'
  | 'certificate_generated'
  | 'draft_generated'
  | 'applied'
  | 'under_review'
  | 'issued';

export interface CertificateApplication {
  id: string;
  student_user_id: string;
  certificate_type: 'bonafide' | 'transfer' | 'conduct' | 'course_completion';
  purpose: string;
  status: CertificateStatus;
  draft_content?: any;
  pdf_url?: string;
  approved_by?: string;
  rejection_reason?: string;
  rejection_remarks?: string;
  applied_at: string;
  issued_at?: string;
  fee_amount?: number;
  payment_status?: 'pending' | 'paid' | 'waived';
  payment_reference?: string;
  payment_date?: string;
  receipt_file_name?: string;
  receipt_url?: string;
  receipt_uploaded_at?: string;
  officer_verified?: boolean;
  officer_verified_at?: string;
  officer_remarks?: string;
}

export interface NoDuesClearance {
  id: string;
  request_id: string;
  department: 'library' | 'accounts' | 'laboratory' | 'hostel';
  status: 'pending' | 'cleared' | 'dues_found';
  dues_details?: any;
  cleared_by_agent_or_officer?: string;
  clearance_timestamp?: string;
}

export interface NoDuesRequest {
  id: string;
  student_user_id: string;
  reason: string;
  status: 'initiated' | 'in_progress' | 'clearances_completed' | 'approved' | 'rejected' | 'certificate_issued';
  final_approved_by?: string;
  certificate_pdf_url?: string;
  created_at: string;
  updated_at: string;
  clearances?: NoDuesClearance[];
}

export interface AdministrativeRequest {
  id: string;
  student_user_id: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_office?: 'academics' | 'accounts' | 'examinations' | 'administration';
  assigned_user_id?: string;
  status: 'submitted' | 'in_review' | 'resolved' | 'escalated';
  resolution_notes?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  remind_at: string;
  status: 'pending' | 'triggered' | 'acknowledged';
  created_via_nl: boolean;
  original_prompt?: string;
  attachment_data?: string;
  created_at: string;
}

export interface StudentNote {
  id: string;
  student_user_id: string;
  title: string;
  content: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentTodo {
  id: string;
  student_user_id: string;
  task: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassAnnouncement {
  id: string;
  faculty_user_id: string;
  faculty_name: string;
  class_id: string;
  title: string;
  message: string;
  priority?: 'normal' | 'important' | 'urgent';
  created_at: string;
}

export interface FeeStructure {
  id: string;
  academic_year: string;
  branch: string;
  year: number;
  category: string;
  tuition_fee: number;
  library_fee: number;
  lab_fee: number;
  total_amount: number;
  created_by: string;
  created_at: string;
}

export interface AcademicReport {
  id: string;
  generated_by_agent_id: string;
  department_id?: string;
  class_id?: string;
  report_type: 'department_summary' | 'attendance_shortage' | 'marks_analysis' | 'faculty_submission_audit';
  report_title: string;
  report_data: any;
  generated_at: string;
}

// ============================================================================
// AGENTIC AI SYSTEM INTERFACES
// ============================================================================

export type AutonomyLevel = 1 | 2 | 3; // 1: Full, 2: Review, 3: Human Auth Required

export interface AIAgent {
  id: string;
  name: string;
  role_category: string;
  description: string;
  autonomy_level: AutonomyLevel;
  is_active: boolean;
  current_status: 'idle' | 'running' | 'paused' | 'error';
  current_task_id?: string;
  total_successful_tasks: number;
  total_failed_tasks: number;
  total_pending_tasks: number;
  average_execution_time_ms: number;
  last_execution_at?: string;
  capabilities: string[];
  updated_at?: string;
}

export type WorkflowStatus =
  | 'Created'
  | 'Running'
  | 'Waiting'
  | 'Awaiting Approval'
  | 'Completed'
  | 'Failed'
  | 'Escalated';

export interface AgentWorkflow {
  id: string;
  workflow_name: string;
  trigger_event: string;
  initiated_by_user_id?: string;
  status: WorkflowStatus;
  payload: any;
  context_data: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
  steps?: WorkflowStep[];
  approvals?: WorkflowApproval[];
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  agent_id: string;
  step_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input_data?: any;
  output_data?: any;
  error_details?: string;
  execution_time_ms: number;
  started_at?: string;
  completed_at?: string;
}

export interface WorkflowApproval {
  id: string;
  workflow_id: string;
  step_id?: string;
  required_role: UserRole;
  assigned_user_id?: string;
  action_type: 'publish_marks' | 'correct_attendance' | 'issue_certificate' | 'approve_financial' | 'finalize_no_dues';
  description: string;
  data_snapshot: any;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_user_id?: string;
  reviewer_comments?: string;
  requested_at: string;
  decided_at?: string;
}

export interface AgentTask {
  id: string;
  agent_id: string;
  workflow_id?: string;
  task_type: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  input_payload: any;
  output_result?: any;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'escalated';
  retry_count: number;
  max_retries: number;
  error_message?: string;
  scheduled_for: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface AgentToolCall {
  id: string;
  task_id: string;
  agent_id: string;
  tool_name: string;
  arguments: any;
  response: any;
  status: 'success' | 'error';
  execution_time_ms: number;
  timestamp: string;
}

export interface AgentExecutionLog {
  id: string;
  agent_id: string;
  task_id?: string;
  trigger_event: string;
  log_level: 'info' | 'warn' | 'error' | 'audit';
  action_performed: string;
  input_reference?: string;
  execution_result: string;
  approval_reference_id?: string;
  metadata?: any;
  timestamp: string;
}

export interface AgentNotification {
  id: string;
  recipient_user_id: string;
  sender_agent_id: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface AgentConfiguration {
  id: string;
  agent_id: string;
  execution_mode: 'auto' | 'dry_run' | 'disabled';
  concurrency_limit: number;
  timeout_seconds: number;
  retry_policy: {
    max_retries: number;
    backoff_ms: number;
  };
  notification_rules: {
    notify_on_failure: boolean;
    escalate_after_retries: number;
  };
  updated_at: string;
}

export interface EscalationRecord {
  id: string;
  agent_id: string;
  task_id?: string;
  workflow_id?: string;
  reason: string;
  severity: 'medium' | 'high' | 'critical';
  assigned_role: UserRole;
  resolution_status: 'open' | 'acknowledged' | 'resolved';
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

// ---------------------------------------------------------------------------
// Expanded Smart Campus AI System Models (20 Agents & Supporting Services)
// ---------------------------------------------------------------------------

export interface HostelRoom {
  id: string;
  block: string;
  room_number: string;
  capacity: number;
  occupied: number;
  student_ids: string[];
  status: 'available' | 'full' | 'maintenance';
}

export interface HostelComplaint {
  id: string;
  student_user_id: string;
  student_name: string;
  room_number: string;
  category: 'electrical' | 'plumbing' | 'furniture' | 'cleanliness' | 'noise' | 'other';
  title: string;
  description: string;
  status: 'submitted' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at?: string;
}

export interface TransportRoute {
  id: string;
  route_number: string;
  route_name: string;
  start_point: string;
  end_point: string;
  driver_name: string;
  driver_phone: string;
  bus_number: string;
  capacity: number;
  enrolled_students: number;
  stops: string[];
  departure_time: string;
  status: 'active' | 'delayed' | 'rerouted';
}

export interface TransportRegistration {
  id: string;
  student_user_id: string;
  student_name: string;
  roll_number: string;
  route_id: string;
  pickup_stop: string;
  pass_status: 'active' | 'expired' | 'pending';
  fee_status: 'paid' | 'pending';
  valid_until: string;
}

export interface FacilityComplaint {
  id: string;
  reporter_user_id: string;
  reporter_name: string;
  reporter_role: string;
  location_type: 'classroom' | 'laboratory' | 'library' | 'hostel' | 'campus_ground';
  location_details: string;
  issue_category: 'electricity' | 'water' | 'equipment' | 'air_conditioning' | 'furniture' | 'network';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  status: 'reported' | 'assigned' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at?: string;
}

export interface ScholarshipItem {
  id: string;
  title: string;
  provider: string;
  amount_inr: number;
  category: 'merit' | 'need_based' | 'sports' | 'special_category';
  eligibility_criteria: {
    min_cgpa: number;
    max_family_income?: number;
    target_departments?: string[];
  };
  deadline: string;
  required_documents: string[];
  application_count: number;
  status: 'open' | 'closed';
}

export interface ScholarshipApplication {
  id: string;
  scholarship_id: string;
  scholarship_title: string;
  student_user_id: string;
  student_name: string;
  roll_number: string;
  cgpa: number;
  annual_income?: number;
  submitted_documents: string[];
  status: 'applied' | 'documents_verified' | 'awarded' | 'rejected';
  applied_at: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  event_type: 'technical' | 'cultural' | 'workshop' | 'seminar' | 'sports';
  organizer: string;
  venue: string;
  event_date: string;
  registration_deadline: string;
  capacity: number;
  registered_count: number;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface EventRegistration {
  id: string;
  event_id: string;
  event_title: string;
  user_id: string;
  user_name: string;
  registered_at: string;
  attended: boolean;
}

export interface StudentFeedback {
  id: string;
  student_user_id?: string; // Optional if anonymous
  is_anonymous: boolean;
  category: 'academics' | 'faculty' | 'infrastructure' | 'hostel' | 'library' | 'canteen' | 'general';
  title: string;
  content: string;
  ai_sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  ai_category_tag: string;
  status: 'submitted' | 'under_review' | 'action_taken' | 'closed';
  created_at: string;
}

export interface ExamSchedule {
  id: string;
  academic_year: string;
  semester: number;
  exam_type: 'mid_term_1' | 'mid_term_2' | 'end_semester' | 'practical';
  subject_code: string;
  subject_name: string;
  exam_date: string;
  start_time: string;
  duration_minutes: number;
  venue: string;
}

export interface HallTicket {
  id: string;
  student_user_id: string;
  student_name: string;
  roll_number: string;
  exam_type: string;
  academic_year: string;
  semester: number;
  is_eligible: boolean;
  ineligibility_reasons?: string[];
  attendance_percentage: number;
  issued_at: string;
  exams: {
    subject_code: string;
    subject_name: string;
    exam_date: string;
    venue: string;
  }[];
}

export interface HelpdeskTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  subject: string;
  query: string;
  ai_suggested_response?: string;
  status: 'open' | 'answered_by_ai' | 'escalated_to_staff' | 'resolved';
  created_at: string;
}

export interface CampusAnalyticsKPIs {
  totalStudents: number;
  totalFaculty: number;
  departmentCounts: Record<string, number>;
  campusAttendanceRate: number;
  assignmentSubmissionRate: number;
  averageCGPA: number;
  activeScholarshipsCount: number;
  openFacilityComplaints: number;
  libraryActiveLoans: number;
  agentTelemetry: {
    totalAgents: number;
    activeAgents: number;
    totalTasksExecuted: number;
    successRate: number;
    avgLatencyMs: number;
  };
}

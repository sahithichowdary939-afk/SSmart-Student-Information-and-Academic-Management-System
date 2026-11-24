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
  role: UserRole;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  profile?: any;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_user_id: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface AttendanceStats {
  studentId: string;
  subjectId?: string;
  classId?: string;
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  percentage: number;
  isShortage: boolean;
  requiredMinimum: number;
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
  question_paper_pdf_url?: string;
  question_paper_filename?: string;
  created_at?: string;
  submission?: any;
  isSubmitted?: boolean;
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
  updated_at: string;
}

export interface AIAgent {
  id: string;
  name: string;
  role_category: string;
  description: string;
  autonomy_level: 1 | 2 | 3;
  is_active: boolean;
  current_status: 'idle' | 'running' | 'paused' | 'error';
  total_successful_tasks: number;
  total_failed_tasks: number;
  total_pending_tasks: number;
  average_execution_time_ms: number;
  last_execution_at?: string;
  capabilities: string[];
}

export interface AgentWorkflow {
  id: string;
  workflow_name: string;
  trigger_event: string;
  initiated_by_user_id?: string;
  status: 'Created' | 'Running' | 'Waiting' | 'Awaiting Approval' | 'Completed' | 'Failed' | 'Escalated';
  payload: any;
  created_at: string;
  updated_at: string;
  steps?: any[];
  approvals?: any[];
}

export interface WorkflowApproval {
  id: string;
  workflow_id: string;
  step_id?: string;
  required_role: UserRole;
  action_type: string;
  description: string;
  data_snapshot: any;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
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
  student_user_id?: string;
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

import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  FacultyProfile,
  ClassInchargeMapping,
  Department,
  CollegeClass,
  Subject,
  AttendanceSession,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  InternalMark,
  Timetable,
  LibraryBook,
  LibraryIssue,
  StudentFee,
  FeePayment,
  CertificateApplication,
  NoDuesRequest,
  NoDuesClearance,
  AdministrativeRequest,
  Reminder,
  AcademicReport,
  AIAgent,
  AgentConfiguration,
  AgentWorkflow,
  AgentTask,
  AgentExecutionLog,
  AgentNotification,
  HostelRoom,
  HostelComplaint,
  TransportRoute,
  TransportRegistration,
  FacilityComplaint,
  ScholarshipItem,
  ScholarshipApplication,
  CampusEvent,
  EventRegistration,
  StudentFeedback,
  ExamSchedule,
  HallTicket,
  HelpdeskTicket,
  FacultyFeedbackRecord
} from '../types/index.js';

const salt = bcrypt.genSaltSync(10);
export const defaultHashedPassword = bcrypt.hashSync('password123', salt);
export const adminHashedPassword = bcrypt.hashSync('admin123', salt);

// Users for all 8 roles
export const initialUsers: User[] = [
  {
    id: 'u-std-1',
    email: 'aarav.sharma@campus.edu',
    username: 'student1',
    password_hash: defaultHashedPassword,
    role: 'student',
    full_name: 'Aarav Sharma',
    phone: '+91 98765 43210',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-std-2',
    email: 'diya.patel@campus.edu',
    username: 'student2',
    password_hash: defaultHashedPassword,
    role: 'student',
    full_name: 'Diya Patel',
    phone: '+91 98765 43211',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-std-3',
    email: 'rohan.verma@campus.edu',
    username: 'student3',
    password_hash: defaultHashedPassword,
    role: 'student',
    full_name: 'Rohan Verma',
    phone: '+91 98765 43212',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-fac-1',
    email: 'ks.rao@campus.edu',
    username: 'faculty1',
    password_hash: defaultHashedPassword,
    role: 'faculty',
    full_name: 'Dr. K. S. Rao',
    phone: '+91 98765 43220',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-fac-2',
    email: 'ananya.sen@campus.edu',
    username: 'faculty2',
    password_hash: defaultHashedPassword,
    role: 'faculty',
    full_name: 'Prof. Ananya Sen',
    phone: '+91 98765 43221',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-incharge-1',
    email: 'ramesh.chandra@campus.edu',
    username: 'classincharge1',
    password_hash: defaultHashedPassword,
    role: 'class_incharge',
    full_name: 'Dr. Ramesh Chandra',
    phone: '+91 98765 43230',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-hod-1',
    email: 'vn.murthy@campus.edu',
    username: 'hod_cse',
    password_hash: defaultHashedPassword,
    role: 'hod',
    full_name: 'Dr. V. N. Murthy',
    phone: '+91 98765 43240',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 200 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-admin-office',
    email: 'sk.gupta@campus.edu',
    username: 'officeadmin1',
    password_hash: defaultHashedPassword,
    role: 'office_admin',
    full_name: 'Mr. S. K. Gupta',
    phone: '+91 98765 43250',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 200 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-admin-lib',
    email: 'lakshmi.devi@campus.edu',
    username: 'libadmin1',
    password_hash: defaultHashedPassword,
    role: 'library_admin',
    full_name: 'Mrs. Lakshmi Devi',
    phone: '+91 98765 43260',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 200 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-admin-acc',
    email: 'rajesh.nair@campus.edu',
    username: 'accounts1',
    password_hash: defaultHashedPassword,
    role: 'accounts_admin',
    full_name: 'Mr. Rajesh Nair',
    phone: '+91 98765 43270',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 200 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-admin-super',
    email: 'admin@campus.edu',
    username: 'superadmin',
    password_hash: adminHashedPassword,
    role: 'super_admin',
    full_name: 'System Super Administrator',
    phone: '+91 98765 43299',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const initialDepartments: Department[] = [
  { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering', hod_user_id: 'u-hod-1' },
  { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication Engineering' },
  { id: 'dept-mech', code: 'MECH', name: 'Mechanical Engineering' }
];

export const initialClasses: CollegeClass[] = [
  { id: 'cls-cse-3a', name: 'CSE - 3rd Year - Section A', department_id: 'dept-cse', year: 3, semester: 5, section: 'A', academic_year: '2026-2027' },
  { id: 'cls-cse-3b', name: 'CSE - 3rd Year - Section B', department_id: 'dept-cse', year: 3, semester: 5, section: 'B', academic_year: '2026-2027' },
  { id: 'cls-ece-3a', name: 'ECE - 3rd Year - Section A', department_id: 'dept-ece', year: 3, semester: 5, section: 'A', academic_year: '2026-2027' }
];

export const initialClassIncharges: ClassInchargeMapping[] = [
  { id: 'incharge-1', faculty_user_id: 'u-incharge-1', class_id: 'cls-cse-3a', academic_year: '2026-2027', is_active: true }
];

export const initialStudentProfiles: StudentProfile[] = [
  {
    user_id: 'u-std-1',
    roll_number: '21CSE042',
    admission_number: 'ADM-2024-042',
    department_id: 'dept-cse',
    class_id: 'cls-cse-3a',
    current_year: 3,
    semester: 5,
    blood_group: 'O+',
    parent_name: 'Suresh Sharma',
    parent_phone: '+91 98765 11111',
    parent_email: 'suresh.sharma@example.com',
    address: '42, Tech Park Enclave, Phase 2, Hyderabad',
    cgpa: 8.85
  },
  {
    user_id: 'u-std-2',
    roll_number: '21CSE043',
    admission_number: 'ADM-2024-043',
    department_id: 'dept-cse',
    class_id: 'cls-cse-3a',
    current_year: 3,
    semester: 5,
    blood_group: 'B+',
    parent_name: 'Bhavesh Patel',
    parent_phone: '+91 98765 22222',
    parent_email: 'b.patel@example.com',
    address: '18, Lakeview Residency, Gachibowli, Hyderabad',
    cgpa: 9.12
  },
  {
    user_id: 'u-std-3',
    roll_number: '21CSE088',
    admission_number: 'ADM-2024-088',
    department_id: 'dept-cse',
    class_id: 'cls-cse-3a',
    current_year: 3,
    semester: 5,
    blood_group: 'A+',
    parent_name: 'Mahesh Verma',
    parent_phone: '+91 98765 33333',
    parent_email: 'm.verma@example.com',
    address: '104, Green Meadows, Madhapur, Hyderabad',
    cgpa: 6.94
  }
];

export const initialFacultyProfiles: FacultyProfile[] = [
  {
    user_id: 'u-fac-1',
    employee_id: 'EMP-CSE-104',
    department_id: 'dept-cse',
    designation: 'Associate Professor',
    qualification: 'Ph.D. in Computer Science',
    cabin_location: 'Cabin 302, Academic Block A',
    specialization: 'Distributed Database Systems & Cloud Storage'
  },
  {
    user_id: 'u-fac-2',
    employee_id: 'EMP-CSE-118',
    department_id: 'dept-cse',
    designation: 'Assistant Professor',
    qualification: 'M.Tech, Ph.D. (Pursuing)',
    cabin_location: 'Cabin 305, Academic Block A',
    specialization: 'Software Defined Networks & Wireless Protocols'
  },
  {
    user_id: 'u-incharge-1',
    employee_id: 'EMP-CSE-101',
    department_id: 'dept-cse',
    designation: 'Senior Assistant Professor & Class In-charge',
    qualification: 'Ph.D. in Information Security',
    cabin_location: 'Cabin 210, Academic Block A',
    specialization: 'Cybersecurity & Cryptography'
  }
];

export const initialSubjects: Subject[] = [
  {
    id: 'sub-dbms',
    code: 'CS501',
    name: 'Database Management Systems',
    department_id: 'dept-cse',
    class_id: 'cls-cse-3a',
    faculty_user_id: 'u-fac-1',
    semester: 5,
    credits: 4
  },
  {
    id: 'sub-cn',
    code: 'CS502',
    name: 'Computer Networks',
    department_id: 'dept-cse',
    class_id: 'cls-cse-3a',
    faculty_user_id: 'u-fac-2',
    semester: 5,
    credits: 4
  },
  {
    id: 'sub-os',
    code: 'CS503',
    name: 'Operating Systems & Concurrency',
    department_id: 'dept-cse',
    class_id: 'cls-cse-3a',
    faculty_user_id: 'u-fac-1',
    semester: 5,
    credits: 3
  },
  {
    id: 'sub-se',
    code: 'CS504',
    name: 'Software Engineering Principles',
    department_id: 'dept-cse',
    class_id: 'cls-cse-3a',
    faculty_user_id: 'u-incharge-1',
    semester: 5,
    credits: 3
  }
];

export const initialAttendanceSessions: AttendanceSession[] = [
  {
    id: 'att-sess-1',
    class_id: 'cls-cse-3a',
    subject_id: 'sub-dbms',
    faculty_user_id: 'u-fac-1',
    session_date: '2026-11-17',
    session_period: 1,
    topic: 'Relational Algebra & Normalization (3NF/BCNF)',
    status: 'verified',
    verified_by_incharge: true,
    submitted_at: '2026-11-17T09:50:00Z'
  },
  {
    id: 'att-sess-2',
    class_id: 'cls-cse-3a',
    subject_id: 'sub-dbms',
    faculty_user_id: 'u-fac-1',
    session_date: '2026-11-18',
    session_period: 2,
    topic: 'ACID Properties and Multi-Version Concurrency Control',
    status: 'verified',
    verified_by_incharge: true,
    submitted_at: '2026-11-18T10:45:00Z'
  },
  {
    id: 'att-sess-3',
    class_id: 'cls-cse-3a',
    subject_id: 'sub-cn',
    faculty_user_id: 'u-fac-2',
    session_date: '2026-11-19',
    session_period: 3,
    topic: 'TCP Congestion Control & Window Flow Mechanisms',
    status: 'verified',
    verified_by_incharge: true,
    submitted_at: '2026-11-19T11:40:00Z'
  },
  {
    id: 'att-sess-4',
    class_id: 'cls-cse-3a',
    subject_id: 'sub-os',
    faculty_user_id: 'u-fac-1',
    session_date: '2026-11-20',
    session_period: 4,
    topic: 'Deadlock Avoidance & Bankers Algorithm',
    status: 'verified',
    verified_by_incharge: true,
    submitted_at: '2026-11-20T12:35:00Z'
  },
  {
    id: 'att-sess-5',
    class_id: 'cls-cse-3a',
    subject_id: 'sub-se',
    faculty_user_id: 'u-incharge-1',
    session_date: '2026-11-21',
    session_period: 2,
    topic: 'Agile Sprint Planning & Microservice Architecture',
    status: 'verified',
    verified_by_incharge: true,
    submitted_at: '2026-11-21T10:45:00Z'
  },
  {
    id: 'att-sess-6',
    class_id: 'cls-cse-3a',
    subject_id: 'sub-dbms',
    faculty_user_id: 'u-fac-1',
    session_date: '2026-11-23',
    session_period: 1,
    topic: 'Distributed Transactions & 2-Phase Commit Protocol',
    status: 'submitted',
    verified_by_incharge: false,
    submitted_at: '2026-11-23T09:55:00Z'
  }
];

export const initialAttendanceRecords: AttendanceRecord[] = [
  // Session 1 (All present)
  { id: 'rec-1-1', session_id: 'att-sess-1', student_user_id: 'u-std-1', status: 'present' },
  { id: 'rec-1-2', session_id: 'att-sess-1', student_user_id: 'u-std-2', status: 'present' },
  { id: 'rec-1-3', session_id: 'att-sess-1', student_user_id: 'u-std-3', status: 'absent' }, // Rohan absent
  // Session 2
  { id: 'rec-2-1', session_id: 'att-sess-2', student_user_id: 'u-std-1', status: 'present' },
  { id: 'rec-2-2', session_id: 'att-sess-2', student_user_id: 'u-std-2', status: 'present' },
  { id: 'rec-2-3', session_id: 'att-sess-2', student_user_id: 'u-std-3', status: 'absent' }, // Rohan absent
  // Session 3
  { id: 'rec-3-1', session_id: 'att-sess-3', student_user_id: 'u-std-1', status: 'present' },
  { id: 'rec-3-2', session_id: 'att-sess-3', student_user_id: 'u-std-2', status: 'present' },
  { id: 'rec-3-3', session_id: 'att-sess-3', student_user_id: 'u-std-3', status: 'present' },
  // Session 4
  { id: 'rec-4-1', session_id: 'att-sess-4', student_user_id: 'u-std-1', status: 'present' },
  { id: 'rec-4-2', session_id: 'att-sess-4', student_user_id: 'u-std-2', status: 'present' },
  { id: 'rec-4-3', session_id: 'att-sess-4', student_user_id: 'u-std-3', status: 'absent' }, // Rohan absent
  // Session 5
  { id: 'rec-5-1', session_id: 'att-sess-5', student_user_id: 'u-std-1', status: 'present' },
  { id: 'rec-5-2', session_id: 'att-sess-5', student_user_id: 'u-std-2', status: 'present' },
  { id: 'rec-5-3', session_id: 'att-sess-5', student_user_id: 'u-std-3', status: 'absent' }, // Rohan absent
  // Session 6
  { id: 'rec-6-1', session_id: 'att-sess-6', student_user_id: 'u-std-1', status: 'present' },
  { id: 'rec-6-2', session_id: 'att-sess-6', student_user_id: 'u-std-2', status: 'present' },
  { id: 'rec-6-3', session_id: 'att-sess-6', student_user_id: 'u-std-3', status: 'absent' }  // Rohan absent (Triggering shortage!)
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asg-1',
    class_id: 'cls-cse-3a',
    subject_id: 'sub-dbms',
    faculty_user_id: 'u-fac-1',
    title: 'Assignment 2: Complex SQL Queries & Indexing Analysis',
    description: 'Implement B-Tree index benchmarks and optimize a 10-table join schema with explain analyze reports.',
    due_date: new Date(Date.now() + 48 * 3600000).toISOString(),
    max_marks: 10,
    status: 'published',
    published_at: new Date(Date.now() - 72 * 3600000).toISOString()
  },
  {
    id: 'asg-2',
    class_id: 'cls-cse-3a',
    subject_id: 'sub-cn',
    faculty_user_id: 'u-fac-2',
    title: 'Packet Tracer Lab 3: Subnetting & OSPF Routing',
    description: 'Configure multi-area OSPF routing on Cisco Packet Tracer and analyze route redistribution tables.',
    due_date: new Date(Date.now() + 96 * 3600000).toISOString(),
    max_marks: 10,
    status: 'published',
    published_at: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    id: 'asg-3',
    class_id: 'cls-cse-3a',
    subject_id: 'sub-os',
    faculty_user_id: 'u-fac-1',
    title: 'Bankers Algorithm C++ Simulation',
    description: 'Implement Bankers algorithm for safe state computation with multi-threaded resource allocation.',
    due_date: new Date(Date.now() - 24 * 3600000).toISOString(),
    max_marks: 10,
    status: 'closed',
    published_at: new Date(Date.now() - 168 * 3600000).toISOString()
  }
];

export const initialAssignmentSubmissions: AssignmentSubmission[] = [
  {
    id: 'subm-1-1',
    assignment_id: 'asg-1',
    student_user_id: 'u-std-1',
    submission_text: 'Attached SQL queries, execution plans, and performance benchmarks for 100k synthetic records.',
    file_url: '/docs/submissions/aarav_dbms_asg2.pdf',
    submitted_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    marks_obtained: undefined,
    ai_suggested_feedback: 'Strong query optimization shown. Proper index selectivity calculations. Recommended score: 9.5/10.',
    status: 'submitted'
  },
  {
    id: 'subm-1-2',
    assignment_id: 'asg-1',
    student_user_id: 'u-std-2',
    submission_text: 'Completed benchmarks using composite indexes and partitioning.',
    file_url: '/docs/submissions/diya_dbms_asg2.pdf',
    submitted_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    marks_obtained: undefined,
    ai_suggested_feedback: 'Exemplary execution plans. Partition pruning verified. Recommended score: 10/10.',
    status: 'submitted'
  },
  // Rohan Verma has not submitted asg-1 (Agent detects missing submission!)
  {
    id: 'subm-3-1',
    assignment_id: 'asg-3',
    student_user_id: 'u-std-1',
    submission_text: 'Source code in C++ with pthread mutex implementation for deadlock prevention.',
    file_url: '/docs/submissions/aarav_os_asg.cpp',
    submitted_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    marks_obtained: 9.0,
    feedback: 'Excellent synchronization mechanics. Well commented.',
    status: 'graded',
    graded_by: 'u-fac-1',
    graded_at: new Date(Date.now() - 20 * 3600000).toISOString()
  }
];

export const initialInternalMarks: InternalMark[] = [
  {
    id: 'mark-1-dbms',
    student_user_id: 'u-std-1',
    subject_id: 'sub-dbms',
    class_id: 'cls-cse-3a',
    mid1_marks: 28.5,
    mid2_marks: 27.0,
    assignment_marks: 9.5,
    attendance_marks: 5.0,
    // Deterministic formula: 0.8 * Best Mid + 0.2 * Other Mid + Assignment + Attendance = 0.8*28.5 + 0.2*27.0 + 9.5 + 5 = 22.8 + 5.4 + 14.5 = 42.7 / scaled to 30 -> 28.2
    consolidated_marks: 28.2,
    max_marks: 30,
    status: 'verified_by_incharge',
    updated_at: new Date().toISOString()
  },
  {
    id: 'mark-2-dbms',
    student_user_id: 'u-std-2',
    subject_id: 'sub-dbms',
    class_id: 'cls-cse-3a',
    mid1_marks: 29.5,
    mid2_marks: 29.0,
    assignment_marks: 10.0,
    attendance_marks: 5.0,
    consolidated_marks: 29.4,
    max_marks: 30,
    status: 'verified_by_incharge',
    updated_at: new Date().toISOString()
  },
  {
    id: 'mark-3-dbms',
    student_user_id: 'u-std-3',
    subject_id: 'sub-dbms',
    class_id: 'cls-cse-3a',
    mid1_marks: 14.0,
    mid2_marks: 12.5,
    assignment_marks: 4.0,
    attendance_marks: 1.5,
    consolidated_marks: 13.7, // Flagged for Academic Attention (<15 / 30)
    max_marks: 30,
    status: 'draft',
    updated_at: new Date().toISOString()
  }
];

export const initialTimetable: Timetable = {
  id: 'tt-cse-3a',
  class_id: 'cls-cse-3a',
  academic_year: '2026-2027',
  semester: 5,
  version: 2,
  status: 'approved',
  approved_by: 'u-incharge-1',
  pdf_url: '/timetables/CSE_3A_Sem5_v2.pdf',
  effective_from: '2026-11-01',
  slots: [
    { id: 'tt-1', timetable_id: 'tt-cse-3a', day_of_week: 'Monday', period_number: 1, start_time: '09:00', end_time: '09:55', subject_id: 'sub-dbms', faculty_user_id: 'u-fac-1', room_number: 'LH-301' },
    { id: 'tt-2', timetable_id: 'tt-cse-3a', day_of_week: 'Monday', period_number: 2, start_time: '09:55', end_time: '10:50', subject_id: 'sub-cn', faculty_user_id: 'u-fac-2', room_number: 'LH-301' },
    { id: 'tt-3', timetable_id: 'tt-cse-3a', day_of_week: 'Monday', period_number: 3, start_time: '11:05', end_time: '12:00', subject_id: 'sub-os', faculty_user_id: 'u-fac-1', room_number: 'LH-301' },
    { id: 'tt-4', timetable_id: 'tt-cse-3a', day_of_week: 'Tuesday', period_number: 1, start_time: '09:00', end_time: '09:55', subject_id: 'sub-se', faculty_user_id: 'u-incharge-1', room_number: 'LH-301' },
    { id: 'tt-5', timetable_id: 'tt-cse-3a', day_of_week: 'Tuesday', period_number: 2, start_time: '09:55', end_time: '10:50', subject_id: 'sub-dbms', faculty_user_id: 'u-fac-1', room_number: 'LH-301' },
    { id: 'tt-6', timetable_id: 'tt-cse-3a', day_of_week: 'Wednesday', period_number: 1, start_time: '09:00', end_time: '09:55', subject_id: 'sub-cn', faculty_user_id: 'u-fac-2', room_number: 'LH-301' },
    { id: 'tt-7', timetable_id: 'tt-cse-3a', day_of_week: 'Wednesday', period_number: 2, start_time: '09:55', end_time: '10:50', subject_id: 'sub-os', faculty_user_id: 'u-fac-1', room_number: 'LH-301' },
    { id: 'tt-8', timetable_id: 'tt-cse-3a', day_of_week: 'Thursday', period_number: 1, start_time: '09:00', end_time: '09:55', subject_id: 'sub-dbms', faculty_user_id: 'u-fac-1', room_number: 'LH-301' },
    { id: 'tt-9', timetable_id: 'tt-cse-3a', day_of_week: 'Friday', period_number: 1, start_time: '09:00', end_time: '09:55', subject_id: 'sub-se', faculty_user_id: 'u-incharge-1', room_number: 'LH-301' }
  ]
};

export const initialLibraryBooks: LibraryBook[] = [
  { id: 'bk-1', isbn: '978-0078022159', title: 'Database System Concepts (7th Ed.)', author: 'Silberschatz, Korth, Sudarshan', category: 'Computer Science', total_copies: 15, available_copies: 12, shelf_location: 'CS-A-12' },
  { id: 'bk-2', isbn: '978-0133594140', title: 'Computer Networks (6th Ed.)', author: 'Andrew S. Tanenbaum', category: 'Networking', total_copies: 12, available_copies: 9, shelf_location: 'CS-B-04' },
  { id: 'bk-3', isbn: '978-0132350884', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', category: 'Software Engineering', total_copies: 8, available_copies: 5, shelf_location: 'CS-C-01' },
  { id: 'bk-4', isbn: '978-0136042594', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', category: 'Artificial Intelligence', total_copies: 10, available_copies: 7, shelf_location: 'AI-A-03' },
  { id: 'bk-5', isbn: '978-0262033848', title: 'Introduction to Algorithms (4th Ed.)', author: 'CLRS', category: 'Algorithms', total_copies: 20, available_copies: 14, shelf_location: 'CS-A-01' }
];

export const initialLibraryIssues: LibraryIssue[] = [
  {
    id: 'issue-1',
    book_id: 'bk-1',
    student_user_id: 'u-std-1',
    issue_date: '2026-11-10',
    due_date: '2026-11-24', // Due tomorrow!
    status: 'issued',
    fine_amount: 0,
    fine_paid: false
  },
  {
    id: 'issue-2',
    book_id: 'bk-2',
    student_user_id: 'u-std-2',
    issue_date: '2026-11-05',
    due_date: '2026-11-19',
    return_date: '2026-11-18',
    status: 'returned',
    fine_amount: 0,
    fine_paid: true
  },
  {
    id: 'issue-3',
    book_id: 'bk-3',
    student_user_id: 'u-std-3',
    issue_date: '2026-10-25',
    due_date: '2026-11-08', // Overdue!
    status: 'overdue',
    fine_amount: 75.0, // 15 days overdue * Rs. 5/day
    fine_paid: false
  }
];

export const initialStudentFees: StudentFee[] = [
  {
    id: 'fee-1',
    student_user_id: 'u-std-1',
    academic_year: '2026-2027',
    term: 'Semester 5',
    tuition_fee: 65000,
    library_fee: 3000,
    lab_fee: 7000,
    total_amount: 75000,
    paid_amount: 75000,
    pending_amount: 0,
    status: 'paid',
    due_date: '2026-09-30'
  },
  {
    id: 'fee-2',
    student_user_id: 'u-std-2',
    academic_year: '2026-2027',
    term: 'Semester 5',
    tuition_fee: 65000,
    library_fee: 3000,
    lab_fee: 7000,
    total_amount: 75000,
    paid_amount: 50000,
    pending_amount: 25000,
    status: 'partial',
    due_date: '2026-11-30'
  },
  {
    id: 'fee-3',
    student_user_id: 'u-std-3',
    academic_year: '2026-2027',
    term: 'Semester 5',
    tuition_fee: 65000,
    library_fee: 3000,
    lab_fee: 7000,
    total_amount: 75000,
    paid_amount: 0,
    pending_amount: 75000,
    status: 'overdue',
    due_date: '2026-10-15'
  }
];

export const initialFeePayments: FeePayment[] = [
  {
    id: 'pay-1',
    student_fee_id: 'fee-1',
    student_user_id: 'u-std-1',
    amount: 75000,
    payment_mode: 'online',
    reference_number: 'TXN-CAMPUS-9910283',
    verified_by: 'u-admin-acc',
    receipt_number: 'REC-2026-1104',
    payment_date: '2026-09-28T14:30:00Z'
  },
  {
    id: 'pay-2',
    student_fee_id: 'fee-2',
    student_user_id: 'u-std-2',
    amount: 50000,
    payment_mode: 'bank_transfer',
    reference_number: 'NEFT-HDFC-882319',
    verified_by: 'u-admin-acc',
    receipt_number: 'REC-2026-1105',
    payment_date: '2026-10-02T11:15:00Z'
  }
];

export const initialCertificates: CertificateApplication[] = [
  {
    id: 'cert-1',
    student_user_id: 'u-std-1',
    certificate_type: 'bonafide',
    purpose: 'Passport Application and Educational Loan verification',
    status: 'draft_generated',
    draft_content: {
      student_name: 'Aarav Sharma',
      roll_number: '21CSE042',
      department: 'Computer Science & Engineering',
      academic_year: '2026-2027',
      current_year: '3rd Year (Semester 5)',
      conduct: 'Exemplary',
      date_of_admission: '15-August-2024'
    },
    applied_at: new Date(Date.now() - 36 * 3600000).toISOString()
  }
];

export const initialNoDuesRequests: NoDuesRequest[] = [
  {
    id: 'nodues-req-1',
    student_user_id: 'u-std-2',
    reason: 'Internship Semester Clearance & NOC',
    status: 'in_progress',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    clearances: [
      {
        id: 'clr-lib-1',
        request_id: 'nodues-req-1',
        department: 'library',
        status: 'cleared',
        dues_details: { zero_books_due: true, overdue_fine: 0 },
        cleared_by_agent_or_officer: 'agent_library',
        clearance_timestamp: new Date(Date.now() - 20 * 3600000).toISOString()
      },
      {
        id: 'clr-acc-1',
        request_id: 'nodues-req-1',
        department: 'accounts',
        status: 'dues_found',
        dues_details: { pending_tuition_balance: 25000, term: 'Semester 5' },
        cleared_by_agent_or_officer: 'agent_no_dues',
        clearance_timestamp: new Date(Date.now() - 19 * 3600000).toISOString()
      },
      {
        id: 'clr-lab-1',
        request_id: 'nodues-req-1',
        department: 'laboratory',
        status: 'cleared',
        dues_details: { hardware_kits_returned: true, breakage_charges: 0 },
        cleared_by_agent_or_officer: 'agent_no_dues',
        clearance_timestamp: new Date(Date.now() - 18 * 3600000).toISOString()
      },
      {
        id: 'clr-hos-1',
        request_id: 'nodues-req-1',
        department: 'hostel',
        status: 'cleared',
        dues_details: { room_clearance: 'Hostel Block B Room 304 Cleared', mess_dues: 0 },
        cleared_by_agent_or_officer: 'agent_no_dues',
        clearance_timestamp: new Date(Date.now() - 18 * 3600000).toISOString()
      }
    ]
  }
];

export const initialAdminRequests: AdministrativeRequest[] = [
  {
    id: 'req-1',
    student_user_id: 'u-std-1',
    category: 'Campus Facilities',
    subject: 'Library WiFi access point intermittent dropouts in 2nd floor reading hall',
    description: 'During peak evening study hours (5 PM - 8 PM), connection drops every 10 minutes.',
    priority: 'medium',
    assigned_office: 'administration',
    status: 'in_review',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const initialReminders: Reminder[] = [
  {
    id: 'rem-1',
    user_id: 'u-std-1',
    title: 'Complete DBMS Assignment 2 Indexing Analysis',
    description: 'B-tree index benchmark graphs and query plans.',
    remind_at: new Date(Date.now() + 18 * 3600000).toISOString(),
    status: 'pending',
    created_via_nl: true,
    original_prompt: 'Remind me to complete my DBMS assignment tomorrow at 6 PM',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

// Seed all 12 AI agents + Orchestrator with operational telemetry
export const initialAIAgents: AIAgent[] = [
  {
    id: 'orchestrator',
    name: 'System Orchestrator Agent',
    role_category: 'Central Orchestration',
    description: 'Coordinates all 12 specialized agents, routes events, enforces safety rules, handles workflow state transitions and retries/escalations.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 184,
    total_failed_tasks: 2,
    total_pending_tasks: 1,
    average_execution_time_ms: 145,
    last_execution_at: new Date(Date.now() - 4 * 60000).toISOString(),
    capabilities: ['workflow_routing', 'task_planning', 'agent_coordination', 'safety_verification', 'escalation_management']
  },
  {
    id: 'agent_student_pa',
    name: 'Student Personal Assistant Agent',
    role_category: 'Student Support',
    description: 'Context-aware student copilot. Answers attendance queries, marks explanation, assignment deadlines, and parses natural-language reminder commands.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 240,
    total_failed_tasks: 1,
    total_pending_tasks: 0,
    average_execution_time_ms: 320,
    last_execution_at: new Date(Date.now() - 12 * 60000).toISOString(),
    capabilities: ['query_student_context', 'parse_natural_language_reminder', 'track_deadlines', 'explain_grades']
  },
  {
    id: 'agent_academic_coord',
    name: 'Academic Coordination Agent',
    role_category: 'Class In-charge & HOD',
    description: 'Aggregates attendance, assignments, timetable changes and internal marks into actionable daily coordination summaries and detects lagging operations.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 98,
    total_failed_tasks: 0,
    total_pending_tasks: 1,
    average_execution_time_ms: 410,
    last_execution_at: new Date(Date.now() - 35 * 60000).toISOString(),
    capabilities: ['daily_coordination_summary', 'detect_pending_submissions', 'cross_check_schedules', 'identify_academic_risks']
  },
  {
    id: 'agent_assignment',
    name: 'Assignment Management Agent',
    role_category: 'Faculty & Student Automation',
    description: 'Validates assignment specs, distributes notifications, monitors incoming submissions, alerts students on approaching deadlines, and flags missing work.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 156,
    total_failed_tasks: 1,
    total_pending_tasks: 0,
    average_execution_time_ms: 285,
    last_execution_at: new Date(Date.now() - 18 * 60000).toISOString(),
    capabilities: ['validate_assignment', 'publish_and_notify', 'track_submissions', 'identify_missing_students', 'generate_feedback_suggestions']
  },
  {
    id: 'agent_attendance',
    name: 'Attendance Monitoring Agent',
    role_category: 'Attendance Automation',
    description: 'Validates session records, detects missing or duplicate entries, calculates subject and overall attendance percentages, flags shortage (<75%), and sends reminders.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 312,
    total_failed_tasks: 3,
    total_pending_tasks: 1,
    average_execution_time_ms: 195,
    last_execution_at: new Date(Date.now() - 8 * 60000).toISOString(),
    capabilities: ['validate_attendance_input', 'calculate_attendance_percentage', 'detect_shortages', 'send_shortage_alerts', 'faculty_submission_reminders']
  },
  {
    id: 'agent_marks',
    name: 'Marks and Performance Agent',
    role_category: 'Academic Assessment',
    description: 'Collects assessment scores (Mid-1, Mid-2, Assignments), applies deterministic college internal marks formula, identifies missing marks, flags anomalies and students needing academic attention.',
    autonomy_level: 2,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 114,
    total_failed_tasks: 0,
    total_pending_tasks: 1,
    average_execution_time_ms: 220,
    last_execution_at: new Date(Date.now() - 25 * 60000).toISOString(),
    capabilities: ['deterministic_marks_calculation', 'detect_marks_anomalies', 'identify_academic_attention', 'sync_class_incharge']
  },
  {
    id: 'agent_timetable',
    name: 'Timetable Management Agent',
    role_category: 'Curriculum Scheduling',
    description: 'Organizes timetable matrices, tracks schedule updates, versions schedules, drafts PDF timetable representations, and notifies affected students and faculty.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 45,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 380,
    last_execution_at: new Date(Date.now() - 85 * 60000).toISOString(),
    capabilities: ['organize_slots', 'version_control_timetables', 'generate_timetable_pdf', 'notify_schedule_updates']
  },
  {
    id: 'agent_library',
    name: 'Library Management Agent',
    role_category: 'Library Automation',
    description: 'Monitors book return deadlines, calculates overdue fines via college policy rules, issues reminder alerts, and updates library clearance statuses upon return.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 189,
    total_failed_tasks: 2,
    total_pending_tasks: 0,
    average_execution_time_ms: 160,
    last_execution_at: new Date(Date.now() - 14 * 60000).toISOString(),
    capabilities: ['monitor_due_dates', 'calculate_fines', 'send_due_reminders', 'verify_library_clearance']
  },
  {
    id: 'agent_certificate',
    name: 'Certificate Processing Agent',
    role_category: 'Office Administration',
    description: 'Retrieves verified student records, validates application completeness, generates official certificate drafts, routes for officer approval, and produces signed PDFs.',
    autonomy_level: 2,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 82,
    total_failed_tasks: 1,
    total_pending_tasks: 1,
    average_execution_time_ms: 450,
    last_execution_at: new Date(Date.now() - 40 * 60000).toISOString(),
    capabilities: ['retrieve_verified_records', 'validate_completeness', 'generate_certificate_draft', 'route_approval', 'render_certificate_pdf']
  },
  {
    id: 'agent_no_dues',
    name: 'No-Dues Coordination Agent',
    role_category: 'Multi-Agent Clearance',
    description: 'Orchestrates multi-department clearance: coordinates with Library, Accounts, Laboratory, and Hostel agents, aggregates dues, tracks resolution, and drafts final clearance.',
    autonomy_level: 2,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 67,
    total_failed_tasks: 0,
    total_pending_tasks: 1,
    average_execution_time_ms: 510,
    last_execution_at: new Date(Date.now() - 50 * 60000).toISOString(),
    capabilities: ['orchestrate_multi_dept_clearance', 'aggregate_dues', 'track_clearance_resolution', 'prepare_clearance_summary']
  },
  {
    id: 'agent_admin_request',
    name: 'Administrative Request Agent',
    role_category: 'Office Administration',
    description: 'Classifies student administrative requests via NLP, routes to responsible offices (Academics, Accounts, Exams), monitors SLAs, and auto-escalates overdue issues.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 94,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 270,
    last_execution_at: new Date(Date.now() - 65 * 60000).toISOString(),
    capabilities: ['classify_ticket', 'route_to_office', 'track_sla_deadlines', 'escalate_overdue_tickets']
  },
  {
    id: 'agent_reporting',
    name: 'Reporting and Analytics Agent',
    role_category: 'HOD & Executive Intelligence',
    description: 'Synthesizes department analytics, faculty submission compliance, semester trends, attendance histograms, and generates structured executive reports.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 120,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 680,
    last_execution_at: new Date(Date.now() - 110 * 60000).toISOString(),
    capabilities: ['generate_department_report', 'faculty_compliance_audit', 'attendance_distribution_stats', 'semester_trend_analysis']
  },
  {
    id: 'agent_monitoring',
    name: 'System Monitoring Agent',
    role_category: 'Super Admin & Reliability',
    description: 'Monitors agent task queues, detects failed or stalled workflows, computes execution metrics, runs automated health checks, and alerts administrators of failures.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 410,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 95,
    last_execution_at: new Date(Date.now() - 2 * 60000).toISOString(),
    capabilities: ['monitor_agent_health', 'detect_stalled_tasks', 'retry_idempotent_tasks', 'system_telemetry', 'trigger_escalation']
  },
  {
    id: 'agent_student_mgmt',
    name: 'Student Management Agent',
    role_category: 'Student Affairs',
    description: 'Automates student onboarding, checks incomplete profile data, manages academic milestones, verifies identity documents, and generates progress cards.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 142,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 210,
    last_execution_at: new Date(Date.now() - 15 * 60000).toISOString(),
    capabilities: ['verify_profile_completeness', 'track_admission_data', 'validate_documents', 'generate_student_summary']
  },
  {
    id: 'agent_exam',
    name: 'Examination Management Agent',
    role_category: 'Examination Cell',
    description: 'Builds examination schedules, audits exam hall eligibility (<75% attendance check), generates verified digital Hall Tickets, and alerts missing mid marks.',
    autonomy_level: 2,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 78,
    total_failed_tasks: 1,
    total_pending_tasks: 1,
    average_execution_time_ms: 340,
    last_execution_at: new Date(Date.now() - 45 * 60000).toISOString(),
    capabilities: ['schedule_examinations', 'verify_exam_eligibility', 'generate_hall_tickets', 'audit_assessment_marks']
  },
  {
    id: 'agent_result_analysis',
    name: 'Result Analysis Agent',
    role_category: 'Academic Analytics',
    description: 'Computes semester CGPA distributions, pass/fail ratios, identifies at-risk students, recommends academic mentoring, and produces class-wise performance audits.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 64,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 520,
    last_execution_at: new Date(Date.now() - 90 * 60000).toISOString(),
    capabilities: ['analyze_grade_distribution', 'identify_at_risk_students', 'generate_performance_trends', 'recommend_remedial_classes']
  },
  {
    id: 'agent_faculty_mgmt',
    name: 'Faculty Management Agent',
    role_category: 'Dean of Faculty',
    description: 'Tracks faculty teaching loads, subject allocations, monitors syllabus pacing across 5 units, ensures timely grading, and generates workload balance reports.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 92,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 260,
    last_execution_at: new Date(Date.now() - 20 * 60000).toISOString(),
    capabilities: ['track_faculty_workload', 'monitor_syllabus_completion', 'alert_grading_delays', 'subject_allocation_audit']
  },
  {
    id: 'agent_class_incharge',
    name: 'Class In-Charge Agent',
    role_category: 'Class Coordination',
    description: 'Assigned class intelligence copilot. Tracks cohort attendance, evaluates submission compliance, manages section broadcasts, and surfaces early intervention alerts.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 118,
    total_failed_tasks: 1,
    total_pending_tasks: 0,
    average_execution_time_ms: 310,
    last_execution_at: new Date(Date.now() - 10 * 60000).toISOString(),
    capabilities: ['monitor_class_students', 'reconcile_attendance_records', 'publish_class_announcements', 'generate_class_report']
  },
  {
    id: 'agent_hod',
    name: 'HOD Management Agent',
    role_category: 'Department Leadership',
    description: 'Executive departmental agent for Head of Department. Monitors department-wide attendance, faculty compliance, approves academic exceptions, and generates accreditation reports.',
    autonomy_level: 2,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 55,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 480,
    last_execution_at: new Date(Date.now() - 60 * 60000).toISOString(),
    capabilities: ['department_kpi_dashboard', 'faculty_compliance_oversight', 'approve_department_requests', 'generate_board_reports']
  },
  {
    id: 'agent_feedback',
    name: 'Student Feedback Agent',
    role_category: 'Student Voice & Quality',
    description: 'Aggregates anonymous and signed student feedback, performs AI sentiment classification, clusters recurring complaints, and tracks administrative resolution.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 88,
    total_failed_tasks: 0,
    total_pending_tasks: 1,
    average_execution_time_ms: 290,
    last_execution_at: new Date(Date.now() - 15 * 60000).toISOString(),
    capabilities: ['sentiment_analysis', 'categorize_complaints', 'identify_recurring_issues', 'track_ticket_resolution']
  },
  {
    id: 'agent_scholarship',
    name: 'Scholarship Management Agent',
    role_category: 'Financial Aid',
    description: 'Maintains scholarship registries, autonomously matches eligible student profiles by CGPA and economic criteria, verifies documents, and sends deadline alerts.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 47,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 330,
    last_execution_at: new Date(Date.now() - 120 * 60000).toISOString(),
    capabilities: ['match_student_eligibility', 'validate_scholarship_docs', 'notify_eligible_students', 'track_aid_disbursements']
  },
  {
    id: 'agent_facility',
    name: 'Campus Facility Management Agent',
    role_category: 'Infrastructure & Maintenance',
    description: 'Monitors smart campus facility complaints (laboratories, classrooms, electrical, plumbing), routes tickets to maintenance staff, and measures resolution SLAs.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 135,
    total_failed_tasks: 1,
    total_pending_tasks: 2,
    average_execution_time_ms: 220,
    last_execution_at: new Date(Date.now() - 5 * 60000).toISOString(),
    capabilities: ['log_maintenance_ticket', 'assign_maintenance_staff', 'monitor_repair_sla', 'generate_facility_report']
  },
  {
    id: 'agent_transport',
    name: 'Transport Management Agent',
    role_category: 'Campus Logistics',
    description: 'Maintains bus fleets, student transport registrations, route maps, alerts riders of schedule adjustments, and logs transport feedback.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 62,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 180,
    last_execution_at: new Date(Date.now() - 30 * 60000).toISOString(),
    capabilities: ['manage_routes_and_stops', 'verify_bus_passes', 'broadcast_route_delays', 'track_transport_complaints']
  },
  {
    id: 'agent_hostel',
    name: 'Hostel Management Agent',
    role_category: 'Residential Life',
    description: 'Coordinates room occupancy, verifies student resident check-ins, tracks maintenance and curfew notices, and manages visitor approvals.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 74,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 240,
    last_execution_at: new Date(Date.now() - 40 * 60000).toISOString(),
    capabilities: ['room_allocation_management', 'log_hostel_complaints', 'track_visitor_requests', 'broadcast_hostel_notices']
  },
  {
    id: 'agent_notification',
    name: 'Campus Notification Agent',
    role_category: 'Communications Dispatch',
    description: 'Omnichannel campus broadcasting engine. Distributes urgent alerts, academic deadlines, fee payment reminders via in-app feeds, email, and configured SMS/WhatsApp.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 450,
    total_failed_tasks: 2,
    total_pending_tasks: 0,
    average_execution_time_ms: 110,
    last_execution_at: new Date(Date.now() - 1 * 60000).toISOString(),
    capabilities: ['dispatch_in_app_notification', 'simulate_sms_whatsapp', 'send_emergency_broadcast', 'schedule_event_reminders']
  },
  {
    id: 'agent_helpdesk',
    name: 'Campus Helpdesk AI Agent',
    role_category: 'Smart Campus Assistant',
    description: '24/7 intelligent campus conversational agent. Delivers verified institutional answers on fees, timetables, syllabus, exams, and escalates complex inquiries to staff.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 380,
    total_failed_tasks: 0,
    total_pending_tasks: 1,
    average_execution_time_ms: 420,
    last_execution_at: new Date(Date.now() - 3 * 60000).toISOString(),
    capabilities: ['verified_knowledge_retrieval', 'answer_student_inquiries', 'explain_academic_regulations', 'create_helpdesk_ticket']
  },
  {
    id: 'agent_events',
    name: 'Campus Event Management Agent',
    role_category: 'Campus Activities',
    description: 'Organizes technical fests, cultural workshops, guest lectures, handles student registrations, checks capacity limits, and issues participant rosters.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 51,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 270,
    last_execution_at: new Date(Date.now() - 75 * 60000).toISOString(),
    capabilities: ['create_campus_event', 'manage_registrations', 'broadcast_event_schedule', 'generate_attendance_roster']
  },
  {
    id: 'agent_analytics',
    name: 'Campus Analytics Agent',
    role_category: 'Executive Intelligence',
    description: 'Synthesizes cross-campus telemetry across all 20 agents: aggregates real-time attendance, grades, workload, fee collections, and generates actionable AI insights.',
    autonomy_level: 1,
    is_active: true,
    current_status: 'idle',
    total_successful_tasks: 195,
    total_failed_tasks: 0,
    total_pending_tasks: 0,
    average_execution_time_ms: 610,
    last_execution_at: new Date(Date.now() - 8 * 60000).toISOString(),
    capabilities: ['synthesize_campus_kpis', 'cross_agent_telemetry', 'predictive_dropout_analysis', 'actionable_recommendations']
  }
];

export const initialAgentConfigs: AgentConfiguration[] = initialAIAgents.map(a => ({
  id: `cfg-${a.id}`,
  agent_id: a.id,
  execution_mode: 'auto',
  concurrency_limit: 5,
  timeout_seconds: 60,
  retry_policy: {
    max_retries: 3,
    backoff_ms: 2000
  },
  notification_rules: {
    notify_on_failure: true,
    escalate_after_retries: 2
  },
  updated_at: new Date().toISOString()
}));

export const initialExecutionLogs: AgentExecutionLog[] = [
  {
    id: 'log-1',
    agent_id: 'agent_attendance',
    trigger_event: 'attendance_session_submitted',
    log_level: 'info',
    action_performed: 'Validated session CS501 period 1. Computed Rohan Verma attendance (16.6% < 75%). Triggered shortage alert.',
    input_reference: 'Session: att-sess-6, Student: u-std-3',
    execution_result: 'Dispatched shortage warning to Student and Class In-charge Dr. Ramesh Chandra.',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString()
  },
  {
    id: 'log-2',
    agent_id: 'agent_assignment',
    trigger_event: 'deadline_monitoring_tick',
    log_level: 'info',
    action_performed: 'Scanned active assignments. Found ASG-1 due in 48 hours. Identified 1 missing student (Rohan Verma).',
    input_reference: 'Assignment: asg-1, Class: cls-cse-3a',
    execution_result: 'Dispatched automated reminder notification to 1 student with pending submission.',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString()
  },
  {
    id: 'log-3',
    agent_id: 'agent_marks',
    trigger_event: 'marks_submitted_by_faculty',
    log_level: 'info',
    action_performed: 'Calculated internal marks using deterministic college formula (0.8*Best + 0.2*Other + Asg + Att).',
    input_reference: 'Class: cls-cse-3a, Subject: CS501',
    execution_result: 'Processed 3 student marks. Flagged Rohan Verma (13.7/30) as requiring academic attention.',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString()
  },
  {
    id: 'log-4',
    agent_id: 'agent_library',
    trigger_event: 'overdue_check_tick',
    log_level: 'warn',
    action_performed: 'Scanned active book loans. Book "Clean Code" overdue by 15 days for student Rohan Verma.',
    input_reference: 'Issue: issue-3, Student: u-std-3',
    execution_result: 'Calculated fine Rs. 75.00 (15 days * Rs. 5/day). Dispatched overdue return notice.',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'log-5',
    agent_id: 'agent_certificate',
    trigger_event: 'certificate_applied',
    log_level: 'info',
    action_performed: 'Retrieved verified academic records for Aarav Sharma (21CSE042). Validated 0 disciplinary flags.',
    input_reference: 'Application: cert-1, Student: u-std-1',
    execution_result: 'Generated official Bonafide draft. Created pending approval task for Office Admin.',
    timestamp: new Date(Date.now() - 40 * 60000).toISOString()
  }
];

export const initialNotifications: AgentNotification[] = [
  {
    id: 'notif-1',
    recipient_user_id: 'u-std-3',
    sender_agent_id: 'agent_attendance',
    title: 'Attendance Shortage Alert (< 75%)',
    message: 'Your current attendance in CS501 Database Management Systems is 16.7%. College regulation requires a minimum of 75% to sit for end-semester exams.',
    priority: 'urgent',
    link_url: '/student/attendance',
    is_read: false,
    created_at: new Date(Date.now() - 8 * 60000).toISOString()
  },
  {
    id: 'notif-2',
    recipient_user_id: 'u-std-1',
    sender_agent_id: 'agent_library',
    title: 'Book Return Reminder: Due in 24 Hours',
    message: 'Your borrowed book "Database System Concepts (7th Ed.)" is due tomorrow, 24-Nov-2026. Please return or renew online to avoid late fines.',
    priority: 'normal',
    link_url: '/student/library',
    is_read: false,
    created_at: new Date(Date.now() - 60 * 60000).toISOString()
  },
  {
    id: 'notif-3',
    recipient_user_id: 'u-incharge-1',
    sender_agent_id: 'agent_academic_coord',
    title: 'Daily Academic Coordination Summary Ready',
    message: 'Daily status: 1 faculty session verified, 1 student flagged for attendance shortage, 1 assignment pending evaluation.',
    priority: 'normal',
    link_url: '/class-incharge/coordination',
    is_read: false,
    created_at: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: 'notif-4',
    recipient_user_id: 'u-admin-office',
    sender_agent_id: 'agent_certificate',
    title: 'Certificate Approval Required (Bonafide)',
    message: 'Aarav Sharma (21CSE042) requested a Bonafide Certificate. Verified records checked and draft generated. Please review and authorize.',
    priority: 'high',
    link_url: '/office-admin/certificates',
    is_read: false,
    created_at: new Date(Date.now() - 40 * 60000).toISOString()
  }
];

// ---------------------------------------------------------------------------
// Seed Data for Expanded Smart Campus Services
// ---------------------------------------------------------------------------

export const initialHostelRooms: HostelRoom[] = [
  { id: 'hr-a101', block: 'Aryabhatta Block A', room_number: '101', capacity: 3, occupied: 2, student_ids: ['u-std-1', 'u-std-2'], status: 'available' },
  { id: 'hr-a102', block: 'Aryabhatta Block A', room_number: '102', capacity: 3, occupied: 3, student_ids: ['u-std-3'], status: 'full' },
  { id: 'hr-b201', block: 'Bhaskara Block B', room_number: '201', capacity: 2, occupied: 0, student_ids: [], status: 'available' }
];

export const initialHostelComplaints: HostelComplaint[] = [
  {
    id: 'hcomp-1',
    student_user_id: 'u-std-1',
    student_name: 'Aarav Sharma',
    room_number: '101',
    category: 'electrical',
    title: 'Ceiling Fan Regulator Malfunctioning',
    description: 'The fan in room 101 runs at max speed only, knob stuck.',
    status: 'in_progress',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

export const initialTransportRoutes: TransportRoute[] = [
  {
    id: 'rt-1',
    route_number: 'Route 101',
    route_name: 'Central Metro Station -> North Campus',
    start_point: 'Central Metro Interchange',
    end_point: 'Main Campus Gate 1',
    driver_name: 'Mr. R. Muthu',
    driver_phone: '+91 98450 11223',
    bus_number: 'KA-04-E-1234',
    capacity: 50,
    enrolled_students: 42,
    stops: ['Central Metro', 'MG Road Circle', 'Indiranagar Flyover', 'Hebbal Hub', 'North Campus'],
    departure_time: '07:45 AM',
    status: 'active'
  },
  {
    id: 'rt-2',
    route_number: 'Route 102',
    route_name: 'Tech City Junction -> West Academic Gate',
    start_point: 'Tech City Gate 2',
    end_point: 'West Academic Gate',
    driver_name: 'Mr. S. Gangadhar',
    driver_phone: '+91 98450 22334',
    bus_number: 'KA-04-E-5678',
    capacity: 50,
    enrolled_students: 38,
    stops: ['Tech City Gate 2', 'Outer Ring Rd', 'Marathahalli Bridge', 'Campus West Gate'],
    departure_time: '08:00 AM',
    status: 'active'
  }
];

export const initialTransportRegistrations: TransportRegistration[] = [
  {
    id: 'treg-1',
    student_user_id: 'u-std-1',
    student_name: 'Aarav Sharma',
    roll_number: '21CSE042',
    route_id: 'rt-1',
    pickup_stop: 'Indiranagar Flyover',
    pass_status: 'active',
    fee_status: 'paid',
    valid_until: '2027-05-31'
  }
];

export const initialFacilityComplaints: FacilityComplaint[] = [
  {
    id: 'fac-comp-1',
    reporter_user_id: 'u-fac-1',
    reporter_name: 'Dr. K. S. Rao',
    reporter_role: 'faculty',
    location_type: 'laboratory',
    location_details: 'Lab Block 3 - DBMS Lab Terminal 18',
    issue_category: 'equipment',
    title: 'Monitor Flickering & LAN Port Loose at Terminal 18',
    description: 'Terminal 18 exhibits video artifacts and disconnects during SQL query executions.',
    severity: 'medium',
    assigned_staff_id: 'u-maintenance-1',
    assigned_staff_name: 'Mr. M. Somesh',
    status: 'in_progress',
    created_at: new Date(Date.now() - 36 * 3600000).toISOString()
  },
  {
    id: 'fac-comp-2',
    reporter_user_id: 'u-std-1',
    reporter_name: 'Aarav Sharma',
    reporter_role: 'student',
    location_type: 'classroom',
    location_details: 'Lecture Hall LH-301',
    issue_category: 'air_conditioning',
    title: 'AC Unit 2 Not Cooling LH-301',
    description: 'The second split AC is blowing ambient air only.',
    severity: 'low',
    assigned_staff_id: 'u-maintenance-1',
    assigned_staff_name: 'Mr. M. Somesh',
    status: 'assigned',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

export const initialScholarships: ScholarshipItem[] = [
  {
    id: 'sch-1',
    title: 'State Merit Scholarship for Technical Education',
    provider: 'Department of Higher Education',
    amount_inr: 50000,
    category: 'merit',
    eligibility_criteria: { min_cgpa: 8.5, target_departments: ['CSE', 'ECE', 'MECH'] },
    deadline: '2026-12-15',
    required_documents: ['10th & 12th Marks Memo', 'Current College Grade Transcript', 'Bank Passbook Copy', 'Aadhar Card'],
    application_count: 24,
    status: 'open'
  },
  {
    id: 'sch-2',
    title: 'Alumni Endowment Financial Aid for Engineering Scholars',
    provider: 'Campus Alumni Foundation',
    amount_inr: 35000,
    category: 'need_based',
    eligibility_criteria: { min_cgpa: 7.5, max_family_income: 300000 },
    deadline: '2026-12-20',
    required_documents: ['Income Certificate', 'Affidavit', 'College ID Card', 'Semester Marksheets'],
    application_count: 18,
    status: 'open'
  }
];

export const initialScholarshipApplications: ScholarshipApplication[] = [
  {
    id: 'sapp-1',
    scholarship_id: 'sch-1',
    scholarship_title: 'State Merit Scholarship for Technical Education',
    student_user_id: 'u-std-1',
    student_name: 'Aarav Sharma',
    roll_number: '21CSE042',
    cgpa: 8.9,
    submitted_documents: ['Grade_Transcript_Sem4.pdf', 'Bank_Passbook.pdf', 'Aadhar_Copy.pdf'],
    status: 'documents_verified',
    applied_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const initialCampusEvents: CampusEvent[] = [
  {
    id: 'ev-1',
    title: 'HACK-CAMPUS 2026: Autonomous AI & Agentic Systems Hackathon',
    event_type: 'technical',
    organizer: 'CSE Department & IEEE Student Branch',
    venue: 'Auditorium Block C & Innovation Lab',
    event_date: '2026-12-05',
    registration_deadline: '2026-12-01',
    capacity: 120,
    registered_count: 86,
    description: '36-hour hackathon focused on autonomous LLM workflows, multi-agent systems, and real-time edge AI.',
    status: 'upcoming'
  },
  {
    id: 'ev-2',
    title: 'National Conference on High Performance Cloud & DB Systems',
    event_type: 'seminar',
    organizer: 'Academic Research Council',
    venue: 'Seminar Hall 2, Block A',
    event_date: '2026-12-10',
    registration_deadline: '2026-12-08',
    capacity: 200,
    registered_count: 145,
    description: 'Keynote lectures by industry leads from Google, Microsoft, and premier research labs.',
    status: 'upcoming'
  }
];

export const initialEventRegistrations: EventRegistration[] = [
  {
    id: 'ereg-1',
    event_id: 'ev-1',
    event_title: 'HACK-CAMPUS 2026: Autonomous AI & Agentic Systems Hackathon',
    user_id: 'u-std-1',
    user_name: 'Aarav Sharma',
    registered_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    attended: false
  }
];

export const initialStudentFeedbacks: StudentFeedback[] = [
  {
    id: 'fb-1',
    student_user_id: 'u-std-1',
    is_anonymous: false,
    category: 'academics',
    title: 'Praise for Practical SQL Indexing Demos in DBMS',
    content: 'The hands-on query plan profiling in CS501 by Dr. K.S. Rao has been extremely clarifying for backend architectures.',
    ai_sentiment: 'positive',
    ai_category_tag: 'Academics - Faculty Excellence',
    status: 'under_review',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'fb-2',
    is_anonymous: true,
    category: 'infrastructure',
    title: 'Canteen Water Cooler Filter Requires Replacement',
    content: 'The cooler on ground floor of Student Center is dispensing water with odd mineral taste.',
    ai_sentiment: 'neutral',
    ai_category_tag: 'Facility - Hygiene & Water',
    status: 'action_taken',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];

export const initialExamSchedules: ExamSchedule[] = [
  {
    id: 'ex-1',
    academic_year: '2026-2027',
    semester: 5,
    exam_type: 'end_semester',
    subject_code: 'CS501',
    subject_name: 'Database Management Systems',
    exam_date: '2026-12-15',
    start_time: '10:00 AM',
    duration_minutes: 180,
    venue: 'Exam Hall A-101'
  },
  {
    id: 'ex-2',
    academic_year: '2026-2027',
    semester: 5,
    exam_type: 'end_semester',
    subject_code: 'CS503',
    subject_name: 'Operating Systems',
    exam_date: '2026-12-18',
    start_time: '10:00 AM',
    duration_minutes: 180,
    venue: 'Exam Hall A-102'
  }
];

export const initialHallTickets: HallTicket[] = [
  {
    id: 'ht-21cse042',
    student_user_id: 'u-std-1',
    student_name: 'Aarav Sharma',
    roll_number: '21CSE042',
    exam_type: 'End-Semester Theory Examinations',
    academic_year: '2026-2027',
    semester: 5,
    is_eligible: true,
    attendance_percentage: 100,
    issued_at: new Date().toISOString(),
    exams: [
      { subject_code: 'CS501', subject_name: 'Database Management Systems', exam_date: '15-Dec-2026 (10:00 AM)', venue: 'Exam Hall A-101' },
      { subject_code: 'CS503', subject_name: 'Operating Systems', exam_date: '18-Dec-2026 (10:00 AM)', venue: 'Exam Hall A-102' }
    ]
  }
];

export const initialHelpdeskTickets: HelpdeskTicket[] = [
  {
    id: 'hdt-1',
    user_id: 'u-std-1',
    user_name: 'Aarav Sharma',
    user_role: 'student',
    subject: 'Procedure for Applying to State Merit Scholarship',
    query: 'What documents are required to complete verification for the State Merit Scholarship?',
    ai_suggested_response: 'State Merit Scholarship requires 10th & 12th marks memos, current CGPA transcript (min 8.5), and bank passbook copy. Applications close on 15-Dec-2026.',
    status: 'answered_by_ai',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString()
  }
];

export const initialFacultyFeedback: FacultyFeedbackRecord[] = [
  {
    id: 'fb-1',
    student_user_id: 'u-std-1',
    faculty_user_id: 'u-fac-1',
    department_id: 'dept-cse',
    subject_id: 'sub-dbms',
    academic_year: '2026-2027',
    semester: 5,
    ratings: {
      q1_clarity: 5,
      q2_syllabus: 5,
      q3_participation: 4,
      q4_doubts: 5,
      q5_effectiveness: 5,
      q6_guidance: 5
    },
    average_score: 4.83,
    written_comments: 'Dr. K. S. Rao explains concepts clearly with real-world database design examples.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'fb-2',
    student_user_id: 'u-std-2',
    faculty_user_id: 'u-fac-2',
    department_id: 'dept-cse',
    subject_id: 'sub-cn',
    academic_year: '2026-2027',
    semester: 5,
    ratings: {
      q1_clarity: 5,
      q2_syllabus: 4,
      q3_participation: 5,
      q4_doubts: 5,
      q5_effectiveness: 5,
      q6_guidance: 5
    },
    average_score: 4.83,
    written_comments: 'Very effective teaching methodology and excellent doubt clearing.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

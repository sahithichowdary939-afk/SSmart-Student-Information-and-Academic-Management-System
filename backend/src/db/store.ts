import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
  WorkflowStep,
  WorkflowApproval,
  AgentTask,
  AgentToolCall,
  AgentExecutionLog,
  AgentNotification,
  EscalationRecord,
  StudentNote,
  StudentTodo,
  ClassAnnouncement,
  FeeStructure,
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

import {
  initialUsers,
  initialDepartments,
  initialClasses,
  initialClassIncharges,
  initialStudentProfiles,
  initialFacultyProfiles,
  initialSubjects,
  initialAttendanceSessions,
  initialAttendanceRecords,
  initialAssignments,
  initialAssignmentSubmissions,
  initialInternalMarks,
  initialTimetable,
  initialLibraryBooks,
  initialLibraryIssues,
  initialStudentFees,
  initialFeePayments,
  initialCertificates,
  initialNoDuesRequests,
  initialAdminRequests,
  initialReminders,
  initialAIAgents,
  initialAgentConfigs,
  initialExecutionLogs,
  initialNotifications,
  initialHostelRooms,
  initialHostelComplaints,
  initialTransportRoutes,
  initialTransportRegistrations,
  initialFacilityComplaints,
  initialScholarships,
  initialScholarshipApplications,
  initialCampusEvents,
  initialEventRegistrations,
  initialStudentFeedbacks,
  initialExamSchedules,
  initialHallTickets,
  initialHelpdeskTickets,
  initialFacultyFeedback
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/campus.json');

export interface DatabaseState {
  users: User[];
  departments: Department[];
  classes: CollegeClass[];
  classIncharges: ClassInchargeMapping[];
  studentProfiles: StudentProfile[];
  facultyProfiles: FacultyProfile[];
  subjects: Subject[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  internalMarks: InternalMark[];
  timetables: Timetable[];
  libraryBooks: LibraryBook[];
  libraryIssues: LibraryIssue[];
  studentFees: StudentFee[];
  feePayments: FeePayment[];
  certificates: CertificateApplication[];
  noDuesRequests: NoDuesRequest[];
  adminRequests: AdministrativeRequest[];
  reminders: Reminder[];
  academicReports: AcademicReport[];
  agents: AIAgent[];
  agentConfigs: AgentConfiguration[];
  workflows: AgentWorkflow[];
  workflowSteps: WorkflowStep[];
  workflowApprovals: WorkflowApproval[];
  tasks: AgentTask[];
  toolCalls: AgentToolCall[];
  executionLogs: AgentExecutionLog[];
  notifications: AgentNotification[];
  escalations: EscalationRecord[];
  notes: StudentNote[];
  todos: StudentTodo[];
  feeStructures: FeeStructure[];
  classAnnouncements: ClassAnnouncement[];
  hostelRooms: HostelRoom[];
  hostelComplaints: HostelComplaint[];
  transportRoutes: TransportRoute[];
  transportRegistrations: TransportRegistration[];
  facilityComplaints: FacilityComplaint[];
  scholarships: ScholarshipItem[];
  scholarshipApplications: ScholarshipApplication[];
  campusEvents: CampusEvent[];
  eventRegistrations: EventRegistration[];
  studentFeedbacks: StudentFeedback[];
  examSchedules: ExamSchedule[];
  hallTickets: HallTicket[];
  helpdeskTickets: HelpdeskTicket[];
  facultyFeedbacks: FacultyFeedbackRecord[];
}

class Store {
  public data: DatabaseState;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        parsed.notes = parsed.notes || [];
        parsed.todos = parsed.todos || [];
        parsed.feeStructures = parsed.feeStructures || [];
        parsed.classAnnouncements = parsed.classAnnouncements || [];
        parsed.hostelRooms = parsed.hostelRooms || initialHostelRooms;
        parsed.hostelComplaints = parsed.hostelComplaints || initialHostelComplaints;
        parsed.transportRoutes = parsed.transportRoutes || initialTransportRoutes;
        parsed.transportRegistrations = parsed.transportRegistrations || initialTransportRegistrations;
        parsed.facilityComplaints = parsed.facilityComplaints || initialFacilityComplaints;
        parsed.scholarships = parsed.scholarships || initialScholarships;
        parsed.scholarshipApplications = parsed.scholarshipApplications || initialScholarshipApplications;
        parsed.campusEvents = parsed.campusEvents || initialCampusEvents;
        parsed.eventRegistrations = parsed.eventRegistrations || initialEventRegistrations;
        parsed.studentFeedbacks = parsed.studentFeedbacks || initialStudentFeedbacks;
        parsed.examSchedules = parsed.examSchedules || initialExamSchedules;
        parsed.hallTickets = parsed.hallTickets || initialHallTickets;
        parsed.helpdeskTickets = parsed.helpdeskTickets || initialHelpdeskTickets;
        parsed.facultyFeedbacks = parsed.facultyFeedbacks || initialFacultyFeedback;
        // Ensure new 20 agents are included
        if (parsed.agents && parsed.agents.length < initialAIAgents.length) {
          const existingIds = new Set(parsed.agents.map((a: any) => a.id));
          const missingAgents = initialAIAgents.filter(a => !existingIds.has(a.id));
          parsed.agents = [...parsed.agents, ...missingAgents];
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to read persisted data file, loading seeds instead.', err);
    }

    const initial: DatabaseState = {
      users: initialUsers,
      departments: initialDepartments,
      classes: initialClasses,
      classIncharges: initialClassIncharges,
      studentProfiles: initialStudentProfiles,
      facultyProfiles: initialFacultyProfiles,
      subjects: initialSubjects,
      attendanceSessions: initialAttendanceSessions,
      attendanceRecords: initialAttendanceRecords,
      assignments: initialAssignments,
      assignmentSubmissions: initialAssignmentSubmissions,
      internalMarks: initialInternalMarks,
      timetables: [initialTimetable],
      libraryBooks: initialLibraryBooks,
      libraryIssues: initialLibraryIssues,
      studentFees: initialStudentFees,
      feePayments: initialFeePayments,
      certificates: initialCertificates,
      noDuesRequests: initialNoDuesRequests,
      adminRequests: initialAdminRequests,
      reminders: initialReminders,
      academicReports: [],
      agents: initialAIAgents,
      agentConfigs: initialAgentConfigs,
      workflows: [],
      workflowSteps: [],
      workflowApprovals: [],
      tasks: [],
      toolCalls: [],
      executionLogs: initialExecutionLogs,
      notifications: initialNotifications,
      escalations: [],
      hostelRooms: initialHostelRooms,
      hostelComplaints: initialHostelComplaints,
      transportRoutes: initialTransportRoutes,
      transportRegistrations: initialTransportRegistrations,
      facilityComplaints: initialFacilityComplaints,
      scholarships: initialScholarships,
      scholarshipApplications: initialScholarshipApplications,
      campusEvents: initialCampusEvents,
      eventRegistrations: initialEventRegistrations,
      studentFeedbacks: initialStudentFeedbacks,
      examSchedules: initialExamSchedules,
      hallTickets: initialHallTickets,
      helpdeskTickets: initialHelpdeskTickets,
      facultyFeedbacks: initialFacultyFeedback,
      notes: [
        {
          id: 'note-1',
          student_user_id: 'usr-student-1',
          title: 'DBMS Indexing Notes',
          content: 'B-Tree vs B+ Tree differences for upcoming internal assessment. Review leaf node links.',
          color: 'blue',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'note-2',
          student_user_id: 'usr-student-1',
          title: 'Computer Networks Project',
          content: 'Implement Socket Programming in Python/C++ for reliable UDP transfer.',
          color: 'emerald',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      todos: [
        {
          id: 'todo-1',
          student_user_id: 'usr-student-1',
          task: 'Complete DBMS Assignment #1 (SQL Subqueries)',
          is_completed: false,
          priority: 'high',
          due_date: '2026-11-28',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'todo-2',
          student_user_id: 'usr-student-1',
          task: 'Return Database System Concepts book to Library',
          is_completed: false,
          priority: 'medium',
          due_date: '2026-12-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      feeStructures: [
        {
          id: 'fee-struct-1',
          academic_year: '2026-2027',
          branch: 'CSE',
          year: 3,
          category: 'Standard Tuition & Laboratory Fee',
          tuition_fee: 65000,
          library_fee: 5000,
          lab_fee: 15000,
          total_amount: 85000,
          created_by: 'usr-accounts-1',
          created_at: new Date().toISOString()
        }
      ],
      classAnnouncements: [
        {
          id: 'ann-1',
          faculty_user_id: 'usr-faculty-1',
          faculty_name: 'Dr. Ramesh Kumar',
          class_id: 'cls-cse-3a',
          title: 'Mid-Term DBMS Review Lab Session',
          message: 'Extra hands-on query optimization session this Thursday at 3 PM in CSE Lab 2.',
          priority: 'important',
          created_at: new Date().toISOString()
        }
      ]
    };

    this.save(initial);
    return initial;
  }

  public save(state: DatabaseState = this.data) {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database state to file:', err);
    }
  }

  public resetToSeeds() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        fs.unlinkSync(DATA_FILE);
      } catch (e) {}
    }
    this.data = this.loadOrInitialize();
    return this.data;
  }
}

export const db = new Store();

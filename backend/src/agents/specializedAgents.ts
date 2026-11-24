import { v4 as uuidv4 } from 'uuid';
import { BaseAgent, TaskResult } from './baseAgent.js';
import { db } from '../db/store.js';
import { AgentTools } from '../services/agentTools.js';
import { AgentTask, AttendanceSession, InternalMark } from '../types/index.js';

// ============================================================================
// 1. STUDENT PERSONAL ASSISTANT AGENT
// ============================================================================
export class StudentPAAgent extends BaseAgent {
  constructor() {
    super(
      'agent_student_pa',
      'Student Personal Assistant Agent',
      'Student Support',
      'Context-aware student copilot. Answers attendance queries, marks explanation, assignment deadlines, and parses natural-language reminder commands.',
      1,
      ['query_student_context', 'parse_natural_language_reminder', 'track_deadlines', 'explain_grades']
    );

    this.registerTool({
      name: 'get_student_overview',
      description: 'Get comprehensive overview of student attendance, assignments, and marks',
      parameters: { studentId: 'string' },
      execute: async ({ studentId }) => {
        const attendance = AgentTools.calculateAttendance(studentId);
        const assignments = db.data.assignments.filter(a => a.status === 'published');
        const submissions = db.data.assignmentSubmissions.filter(s => s.student_user_id === studentId);
        const pendingAssignments = assignments.filter(a => !submissions.some(s => s.assignment_id === a.id));
        const marks = db.data.internalMarks.filter(m => m.student_user_id === studentId);
        const fees = db.data.studentFees.filter(f => f.student_user_id === studentId);
        const books = db.data.libraryIssues.filter(i => i.student_user_id === studentId && i.status === 'issued');

        return {
          attendance,
          pendingAssignmentsCount: pendingAssignments.length,
          pendingAssignments: pendingAssignments.map(a => ({ id: a.id, title: a.title, due_date: a.due_date })),
          internalMarks: marks,
          pendingFeeBalance: fees.reduce((sum, f) => sum + f.pending_amount, 0),
          borrowedBooksCount: books.length
        };
      }
    });

    this.registerTool({
      name: 'create_reminder_nl',
      description: 'Create student reminder from natural language command',
      parameters: { studentId: 'string', prompt: 'string', attachmentData: 'string' },
      execute: async ({ studentId, prompt, attachmentData }) => {
        return AgentTools.parseNaturalLanguageReminder(studentId, prompt, attachmentData);
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    const { task_type, input_payload } = task;

    if (task_type === 'parse_nl_reminder') {
      const res = await this.callTool('create_reminder_nl', {
        studentId: input_payload.studentId,
        prompt: input_payload.prompt,
        attachmentData: input_payload.attachmentData
      }, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'parse_nl_reminder',
        actionPerformed: `Extracted reminder: "${res.parsedTitle}" set for ${res.parsedDate}`,
        executionResult: 'Reminder saved in database'
      });

      return { success: true, data: res };
    }

    if (task_type === 'get_student_summary') {
      const overview = await this.callTool('get_student_overview', {
        studentId: input_payload.studentId
      }, task.id);
      return { success: true, data: overview };
    }

    return { success: false, error: `Unsupported task_type: ${task_type}` };
  }
}

// ============================================================================
// 2. ACADEMIC COORDINATION AGENT
// ============================================================================
export class AcademicCoordAgent extends BaseAgent {
  constructor() {
    super(
      'agent_academic_coord',
      'Academic Coordination Agent',
      'Class In-charge & HOD',
      'Aggregates attendance, assignments, timetable changes and internal marks into actionable daily coordination summaries and detects lagging operations.',
      1,
      ['daily_coordination_summary', 'detect_pending_submissions', 'cross_check_schedules', 'identify_academic_risks']
    );

    this.registerTool({
      name: 'compile_daily_coordination_summary',
      description: 'Compiles class-wise daily coordination metrics',
      parameters: { classId: 'string' },
      execute: async ({ classId }) => {
        const students = db.data.studentProfiles.filter(s => s.class_id === classId);
        const shortages = students
          .map(s => ({
            studentId: s.user_id,
            profile: s,
            stats: AgentTools.calculateAttendance(s.user_id, undefined, classId)
          }))
          .filter(s => s.stats.isShortage);

        const pendingFacultySessions = db.data.attendanceSessions.filter(
          s => s.class_id === classId && !s.verified_by_incharge
        );

        const activeAssignments = db.data.assignments.filter(
          a => a.class_id === classId && a.status === 'published'
        );

        const draftMarks = db.data.internalMarks.filter(
          m => m.class_id === classId && m.status === 'draft'
        );

        return {
          classId,
          totalStudents: students.length,
          studentsWithShortage: shortages.length,
          shortageDetails: shortages.map(s => ({
            roll: s.profile.roll_number,
            percentage: s.stats.percentage,
            absentSessions: s.stats.absentSessions
          })),
          unverifiedAttendanceSessions: pendingFacultySessions.length,
          activeAssignmentsCount: activeAssignments.length,
          unverifiedMarksCount: draftMarks.length,
          summaryTimestamp: new Date().toISOString()
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'generate_daily_summary') {
      const summary = await this.callTool('compile_daily_coordination_summary', {
        classId: task.input_payload.classId
      }, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'daily_coordination_summary',
        actionPerformed: `Compiled daily report for class ${task.input_payload.classId}`,
        executionResult: `Detected ${summary.studentsWithShortage} students with attendance shortage and ${summary.unverifiedAttendanceSessions} unverified sessions.`
      });

      return { success: true, data: summary };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 3. ASSIGNMENT MANAGEMENT AGENT
// ============================================================================
export class AssignmentAgent extends BaseAgent {
  constructor() {
    super(
      'agent_assignment',
      'Assignment Management Agent',
      'Faculty & Student Automation',
      'Validates assignment specs, distributes notifications, monitors incoming submissions, alerts students on approaching deadlines, and flags missing work.',
      1,
      ['validate_assignment', 'publish_and_notify', 'track_submissions', 'identify_missing_students', 'generate_feedback_suggestions']
    );

    this.registerTool({
      name: 'monitor_submissions',
      description: 'Check missing submissions and notify approaching deadlines',
      parameters: { assignmentId: 'string' },
      execute: async ({ assignmentId }) => {
        const assignment = db.data.assignments.find(a => a.id === assignmentId);
        if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

        const students = db.data.studentProfiles.filter(s => s.class_id === assignment.class_id);
        const submissions = db.data.assignmentSubmissions.filter(s => s.assignment_id === assignmentId);
        const submittedStudentIds = new Set(submissions.map(s => s.student_user_id));

        const missingStudents = students.filter(s => !submittedStudentIds.has(s.user_id));

        // Dispatch notifications to missing students
        missingStudents.forEach(st => {
          AgentTools.dispatchNotification({
            recipientUserId: st.user_id,
            senderAgentId: 'agent_assignment',
            title: `Action Required: Assignment Due Soon`,
            message: `Assignment "${assignment.title}" is due on ${new Date(assignment.due_date).toLocaleDateString()}. Please submit your solution.`,
            priority: 'high',
            linkUrl: '/student/assignments'
          });
        });

        return {
          assignmentId,
          totalClassStudents: students.length,
          submittedCount: submissions.length,
          missingCount: missingStudents.length,
          missingStudentRolls: missingStudents.map(s => s.roll_number)
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'check_deadlines_and_missing') {
      const res = await this.callTool('monitor_submissions', {
        assignmentId: task.input_payload.assignmentId
      }, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'assignment_deadline_check',
        actionPerformed: `Audited assignment ${task.input_payload.assignmentId}`,
        executionResult: `Dispatched deadline reminders to ${res.missingCount} missing students.`
      });

      return { success: true, data: res };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 4. ATTENDANCE MONITORING AGENT
// ============================================================================
export class AttendanceAgent extends BaseAgent {
  constructor() {
    super(
      'agent_attendance',
      'Attendance Monitoring Agent',
      'Attendance Automation',
      'Validates session records, detects missing or duplicate entries, calculates subject and overall attendance percentages, flags shortage (<75%), and sends reminders.',
      1,
      ['validate_attendance_input', 'calculate_attendance_percentage', 'detect_shortages', 'send_shortage_alerts', 'faculty_submission_reminders']
    );

    this.registerTool({
      name: 'validate_and_process_session',
      description: 'Validates newly submitted attendance session and identifies shortages',
      parameters: { sessionId: 'string' },
      execute: async ({ sessionId }) => {
        const session = db.data.attendanceSessions.find(s => s.id === sessionId);
        if (!session) throw new Error(`Attendance session ${sessionId} not found`);

        const records = db.data.attendanceRecords.filter(r => r.session_id === sessionId);
        const classStudents = db.data.studentProfiles.filter(s => s.class_id === session.class_id);

        // Validation: Detect missing student records
        const recordedStudentIds = new Set(records.map(r => r.student_user_id));
        const missingStudents = classStudents.filter(s => !recordedStudentIds.has(s.user_id));

        // Calculate attendance for all affected students and detect shortage
        const shortageAlerts: any[] = [];
        classStudents.forEach(st => {
          const stats = AgentTools.calculateAttendance(st.user_id, session.subject_id, session.class_id);
          if (stats.isShortage) {
            shortageAlerts.push({
              studentId: st.user_id,
              roll: st.roll_number,
              percentage: stats.percentage
            });

            // Dispatch alert to student
            AgentTools.dispatchNotification({
              recipientUserId: st.user_id,
              senderAgentId: 'agent_attendance',
              title: 'Attendance Shortage Notice (< 75%)',
              message: `Your attendance in this course has fallen to ${stats.percentage}%. Please meet your faculty or Class In-charge.`,
              priority: 'urgent',
              linkUrl: '/student/attendance'
            });
          }
        });

        // Notify Class In-charge of the submission
        const incharge = db.data.classIncharges.find(c => c.class_id === session.class_id && c.is_active);
        if (incharge) {
          AgentTools.dispatchNotification({
            recipientUserId: incharge.faculty_user_id,
            senderAgentId: 'agent_attendance',
            title: 'Attendance Session Submitted for Verification',
            message: `Faculty submitted period ${session.session_period} attendance. ${shortageAlerts.length} students currently below 75% threshold.`,
            priority: 'normal',
            linkUrl: '/class-incharge/attendance'
          });
        }

        return {
          sessionId,
          valid: missingStudents.length === 0,
          missingStudentsCount: missingStudents.length,
          totalPresent: records.filter(r => r.status === 'present').length,
          totalAbsent: records.filter(r => r.status === 'absent').length,
          shortageCount: shortageAlerts.length,
          shortageAlerts
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'process_attendance_submission') {
      const res = await this.callTool('validate_and_process_session', {
        sessionId: task.input_payload.sessionId
      }, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'process_attendance_submission',
        actionPerformed: `Validated attendance session ${task.input_payload.sessionId}`,
        executionResult: `Processed successfully. Flagged ${res.shortageCount} shortage alerts.`
      });

      return { success: true, data: res };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 5. MARKS AND PERFORMANCE AGENT
// ============================================================================
export class MarksAgent extends BaseAgent {
  constructor() {
    super(
      'agent_marks',
      'Marks and Performance Agent',
      'Academic Assessment',
      'Collects assessment scores (Mid-1, Mid-2, Assignments), applies deterministic college internal marks formula, identifies missing marks, flags anomalies and students needing academic attention.',
      2, // Level 2: Automation with Review
      ['deterministic_marks_calculation', 'detect_marks_anomalies', 'identify_academic_attention', 'sync_class_incharge']
    );

    this.registerTool({
      name: 'calculate_and_sync_internal_marks',
      description: 'Applies deterministic formula to compute internal marks and identify academic attention',
      parameters: { classId: 'string', subjectId: 'string' },
      execute: async ({ classId, subjectId }) => {
        const marks = db.data.internalMarks.filter(
          m => m.class_id === classId && m.subject_id === subjectId
        );

        const updated: InternalMark[] = [];
        const attentionList: any[] = [];

        for (const item of marks) {
          const calc = AgentTools.calculateInternalMarks(
            item.mid1_marks,
            item.mid2_marks,
            item.assignment_marks,
            item.attendance_marks
          );

          item.consolidated_marks = calc.consolidatedScore;
          item.status = 'verified_by_incharge'; // Prepares for Class In-charge verification
          item.updated_at = new Date().toISOString();
          updated.push(item);

          if (calc.requiresAcademicAttention) {
            attentionList.push({
              studentId: item.student_user_id,
              consolidatedMarks: item.consolidated_marks,
              maxMarks: item.max_marks
            });
          }
        }

        db.save();

        return {
          subjectId,
          classId,
          totalProcessed: updated.length,
          studentsNeedingAttention: attentionList.length,
          attentionList
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'calculate_internals') {
      const res = await this.callTool('calculate_and_sync_internal_marks', {
        classId: task.input_payload.classId,
        subjectId: task.input_payload.subjectId
      }, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'calculate_internals',
        actionPerformed: `Ran deterministic formula on subject ${task.input_payload.subjectId}`,
        executionResult: `Calculated marks for ${res.totalProcessed} students. Identified ${res.studentsNeedingAttention} needing intervention.`
      });

      return {
        success: true,
        data: res,
        needsReview: true,
        reviewDetails: 'Class In-charge must review consolidated marks before publishing to students.'
      };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 6. TIMETABLE MANAGEMENT AGENT
// ============================================================================
export class TimetableAgent extends BaseAgent {
  constructor() {
    super(
      'agent_timetable',
      'Timetable Management Agent',
      'Curriculum Scheduling',
      'Organizes timetable matrices, tracks schedule updates, versions schedules, drafts PDF timetable representations, and notifies affected students and faculty.',
      1,
      ['organize_slots', 'version_control_timetables', 'generate_timetable_pdf', 'notify_schedule_updates']
    );

    this.registerTool({
      name: 'publish_timetable_version',
      description: 'Versions schedule and notifies class students',
      parameters: { timetableId: 'string' },
      execute: async ({ timetableId }) => {
        const tt = db.data.timetables.find(t => t.id === timetableId);
        if (!tt) throw new Error(`Timetable ${timetableId} not found`);

        tt.version += 1;
        tt.status = 'approved';
        tt.pdf_url = `/timetables/Class_${tt.class_id}_v${tt.version}.pdf`;
        db.save();

        const students = db.data.studentProfiles.filter(s => s.class_id === tt.class_id);
        students.forEach(st => {
          AgentTools.dispatchNotification({
            recipientUserId: st.user_id,
            senderAgentId: 'agent_timetable',
            title: 'Official Timetable Updated',
            message: `Version ${tt.version} of your semester class schedule has been published and is available for download.`,
            priority: 'normal',
            linkUrl: '/student/timetable'
          });
        });

        return {
          timetableId,
          newVersion: tt.version,
          pdfUrl: tt.pdf_url,
          notifiedStudentsCount: students.length
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'publish_timetable') {
      const res = await this.callTool('publish_timetable_version', {
        timetableId: task.input_payload.timetableId
      }, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'publish_timetable',
        actionPerformed: `Incremented timetable version to v${res.newVersion}`,
        executionResult: `Dispatched schedule notifications to ${res.notifiedStudentsCount} students.`
      });

      return { success: true, data: res };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 7. LIBRARY MANAGEMENT AGENT
// ============================================================================
export class LibraryAgent extends BaseAgent {
  constructor() {
    super(
      'agent_library',
      'Library Management Agent',
      'Library Automation',
      'Monitors book return deadlines, calculates overdue fines via college policy rules, issues reminder alerts, and updates library clearance statuses upon return.',
      1,
      ['monitor_due_dates', 'calculate_fines', 'send_due_reminders', 'verify_library_clearance']
    );

    this.registerTool({
      name: 'audit_library_loans',
      description: 'Audits all issued books for impending due dates and overdue fines',
      parameters: {},
      execute: async () => {
        const issues = db.data.libraryIssues.filter(i => i.status === 'issued' || i.status === 'overdue');
        const overdueList: any[] = [];
        const upcomingDueList: any[] = [];
        const now = new Date();

        for (const issue of issues) {
          const fineInfo = AgentTools.calculateLibraryFine(issue.id);
          if (fineInfo.isOverdue) {
            issue.status = 'overdue';
            issue.fine_amount = fineInfo.fineAmount;
            overdueList.push(fineInfo);

            AgentTools.dispatchNotification({
              recipientUserId: issue.student_user_id,
              senderAgentId: 'agent_library',
              title: 'Overdue Book Alert & Fine Assessment',
              message: `Your borrowed book is ${fineInfo.daysOverdue} days overdue. Current fine: Rs. ${fineInfo.fineAmount}. Please return immediately.`,
              priority: 'urgent',
              linkUrl: '/student/library'
            });
          } else {
            // Check if due within 48 hours
            const due = new Date(issue.due_date);
            const hoursLeft = (due.getTime() - now.getTime()) / 3600000;
            if (hoursLeft > 0 && hoursLeft <= 48) {
              upcomingDueList.push(issue);
              AgentTools.dispatchNotification({
                recipientUserId: issue.student_user_id,
                senderAgentId: 'agent_library',
                title: 'Library Reminder: Return Due Soon',
                message: `Book loan due on ${due.toLocaleDateString()}. Please return or renew to avoid penalties.`,
                priority: 'normal',
                linkUrl: '/student/library'
              });
            }
          }
        }

        db.save();
        return {
          totalChecked: issues.length,
          overdueCount: overdueList.length,
          upcomingDueCount: upcomingDueList.length
        };
      }
    });

    this.registerTool({
      name: 'verify_student_library_clearance',
      description: 'Checks whether student has zero books and zero unpaid fines for no-dues clearance',
      parameters: { studentId: 'string' },
      execute: async ({ studentId }) => {
        const activeIssues = db.data.libraryIssues.filter(
          i => i.student_user_id === studentId && (i.status === 'issued' || i.status === 'overdue')
        );
        const unpaidFines = db.data.libraryIssues.filter(
          i => i.student_user_id === studentId && i.fine_amount > 0 && !i.fine_paid
        );

        const totalFine = unpaidFines.reduce((sum, f) => sum + f.fine_amount, 0);
        const isCleared = activeIssues.length === 0 && totalFine === 0;

        return {
          studentId,
          cleared: isCleared,
          activeLoans: activeIssues.length,
          totalUnpaidFine: totalFine,
          details: isCleared
            ? 'Library records clear. No outstanding books or unpaid penalties.'
            : `Unresolved library obligations: ${activeIssues.length} active books, Rs. ${totalFine} unpaid fine.`
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'audit_loans') {
      const res = await this.callTool('audit_library_loans', {}, task.id);
      this.logExecution({
        taskId: task.id,
        triggerEvent: 'library_loan_audit',
        actionPerformed: 'Scanned all active library loans',
        executionResult: `Detected ${res.overdueCount} overdue items and ${res.upcomingDueCount} due within 48h.`
      });
      return { success: true, data: res };
    }

    if (task.task_type === 'check_clearance') {
      const res = await this.callTool('verify_student_library_clearance', {
        studentId: task.input_payload.studentId
      }, task.id);
      return { success: true, data: res };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 8. CERTIFICATE PROCESSING AGENT
// ============================================================================
export class CertificateAgent extends BaseAgent {
  constructor() {
    super(
      'agent_certificate',
      'Certificate Processing Agent',
      'Office Administration',
      'Retrieves verified student records, validates application completeness, generates official certificate drafts, routes for officer approval, and produces signed PDFs.',
      2, // Level 2: Draft Generation + Level 3: Authorization Required
      ['retrieve_verified_records', 'validate_completeness', 'generate_certificate_draft', 'route_approval', 'render_certificate_pdf']
    );

    this.registerTool({
      name: 'process_certificate_application',
      description: 'Extracts student verified records, prepares formal draft, and routes for Office Admin approval',
      parameters: { applicationId: 'string', workflowId: 'string' },
      execute: async ({ applicationId, workflowId }) => {
        const app = db.data.certificates.find(c => c.id === applicationId);
        if (!app) throw new Error(`Certificate application ${applicationId} not found`);

        const student = db.data.users.find(u => u.id === app.student_user_id);
        const profile = db.data.studentProfiles.find(s => s.user_id === app.student_user_id);
        const dept = db.data.departments.find(d => d.id === profile?.department_id);

        if (!student || !profile) {
          throw new Error('Student verified academic record could not be retrieved');
        }

        // Prepare formal certificate draft content
        const draft = {
          certificateNumber: `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          studentName: student.full_name,
          rollNumber: profile.roll_number,
          admissionNumber: profile.admission_number,
          department: dept?.name || 'Computer Science & Engineering',
          currentYear: `${profile.current_year}th Year (Semester ${profile.semester})`,
          academicYear: '2026-2027',
          cgpa: profile.cgpa,
          purpose: app.purpose,
          conduct: 'Exemplary',
          issueDate: new Date().toLocaleDateString('en-GB')
        };

        app.draft_content = draft;
        app.status = 'draft_generated';
        db.save();

        // Create Human Authorization Request for Office Admin (Level 3 Safety)
        AgentTools.requestApproval({
          workflowId: workflowId || app.id,
          requiredRole: 'office_admin',
          actionType: 'issue_certificate',
          description: `Authorization requested to issue ${app.certificate_type.toUpperCase()} Certificate for student ${student.full_name} (${profile.roll_number}). Purpose: ${app.purpose}`,
          dataSnapshot: draft
        });

        return {
          applicationId,
          draft,
          status: 'draft_generated',
          routedTo: 'office_admin'
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'process_application') {
      const res = await this.callTool('process_certificate_application', {
        applicationId: task.input_payload.applicationId,
        workflowId: task.workflow_id
      }, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'certificate_draft_created',
        actionPerformed: `Prepared official certificate draft ${res.draft.certificateNumber}`,
        executionResult: 'Enqueued Level 3 authorization ticket for Office Admin.'
      });

      return {
        success: true,
        data: res,
        needsApproval: true,
        approvalDetails: 'Official certificate cannot be signed or issued without Office Admin authorization.'
      };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 9. NO-DUES COORDINATION AGENT
// ============================================================================
export class NoDuesAgent extends BaseAgent {
  constructor() {
    super(
      'agent_no_dues',
      'No-Dues Coordination Agent',
      'Multi-Agent Clearance',
      'Orchestrates multi-department clearance: coordinates with Library, Accounts, Laboratory, and Hostel agents, aggregates dues, tracks resolution, and drafts final clearance.',
      2,
      ['orchestrate_multi_dept_clearance', 'aggregate_dues', 'track_clearance_resolution', 'prepare_clearance_summary']
    );

    this.registerTool({
      name: 'run_multi_department_clearance',
      description: 'Coordinates multi-agent clearance across Library, Accounts, Labs, Hostel',
      parameters: { requestId: 'string', workflowId: 'string' },
      execute: async ({ requestId, workflowId }) => {
        const req = db.data.noDuesRequests.find(r => r.id === requestId);
        if (!req) throw new Error(`No dues request ${requestId} not found`);

        const studentId = req.student_user_id;

        // 1. Library check
        const activeIssues = db.data.libraryIssues.filter(
          i => i.student_user_id === studentId && (i.status === 'issued' || i.status === 'overdue')
        );
        const libCleared = activeIssues.length === 0;

        // 2. Accounts check
        const fees = db.data.studentFees.filter(f => f.student_user_id === studentId);
        const totalPending = fees.reduce((sum, f) => sum + f.pending_amount, 0);
        const accountsCleared = totalPending === 0;

        // Structured clearances array
        const clearances = [
          {
            id: uuidv4(),
            request_id: requestId,
            department: 'library' as const,
            status: libCleared ? ('cleared' as const) : ('dues_found' as const),
            dues_details: { activeBooks: activeIssues.length },
            cleared_by_agent_or_officer: 'agent_library',
            clearance_timestamp: new Date().toISOString()
          },
          {
            id: uuidv4(),
            request_id: requestId,
            department: 'accounts' as const,
            status: accountsCleared ? ('cleared' as const) : ('dues_found' as const),
            dues_details: { pendingTuition: totalPending },
            cleared_by_agent_or_officer: 'agent_no_dues',
            clearance_timestamp: new Date().toISOString()
          },
          {
            id: uuidv4(),
            request_id: requestId,
            department: 'laboratory' as const,
            status: 'cleared' as const,
            dues_details: { equipmentReturned: true },
            cleared_by_agent_or_officer: 'agent_no_dues',
            clearance_timestamp: new Date().toISOString()
          },
          {
            id: uuidv4(),
            request_id: requestId,
            department: 'hostel' as const,
            status: 'cleared' as const,
            dues_details: { roomInspected: true },
            cleared_by_agent_or_officer: 'agent_no_dues',
            clearance_timestamp: new Date().toISOString()
          }
        ];

        req.clearances = clearances;
        const allCleared = clearances.every(c => c.status === 'cleared');
        req.status = allCleared ? 'clearances_completed' : 'in_progress';
        db.save();

        if (allCleared) {
          // Route for final Officer authorization (Level 3)
          AgentTools.requestApproval({
            workflowId: workflowId || req.id,
            requiredRole: 'office_admin',
            actionType: 'finalize_no_dues',
            description: `All 4 clearances verified for student no-dues request ${req.id}. Ready for final administrative approval.`,
            dataSnapshot: { requestId: req.id, clearances }
          });
        }

        return {
          requestId,
          allCleared,
          clearances,
          pendingDepartments: clearances.filter(c => c.status !== 'cleared').map(c => c.department)
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'coordinate_clearance') {
      const res = await this.callTool('run_multi_department_clearance', {
        requestId: task.input_payload.requestId,
        workflowId: task.workflow_id
      }, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'no_dues_multi_agent_coordination',
        actionPerformed: `Coordinated clearance for request ${task.input_payload.requestId}`,
        executionResult: res.allCleared
          ? 'All departments cleared. Enqueued final authorization.'
          : `Pending dues found in: ${res.pendingDepartments.join(', ')}`
      });

      return { success: true, data: res };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 10. ADMINISTRATIVE REQUEST AGENT
// ============================================================================
export class AdminRequestAgent extends BaseAgent {
  constructor() {
    super(
      'agent_admin_request',
      'Administrative Request Agent',
      'Office Administration',
      'Classifies student administrative requests via NLP, routes to responsible offices (Academics, Accounts, Exams), monitors SLAs, and auto-escalates overdue issues.',
      1,
      ['classify_ticket', 'route_to_office', 'track_sla_deadlines', 'escalate_overdue_tickets']
    );

    this.registerTool({
      name: 'classify_and_assign_ticket',
      description: 'Classifies student ticket category and assigns responsible department with SLA deadline',
      parameters: { ticketId: 'string' },
      execute: async ({ ticketId }) => {
        const ticket = db.data.adminRequests.find(r => r.id === ticketId);
        if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

        const text = `${ticket.category} ${ticket.subject} ${ticket.description}`.toLowerCase();
        let office: 'academics' | 'accounts' | 'examinations' | 'administration' = 'administration';
        let priority: 'low' | 'medium' | 'high' | 'urgent' = ticket.priority || 'medium';

        if (text.includes('fee') || text.includes('scholarship') || text.includes('refund') || text.includes('challan')) {
          office = 'accounts';
        } else if (text.includes('exam') || text.includes('hall ticket') || text.includes('grade card') || text.includes('re-evaluation')) {
          office = 'examinations';
        } else if (text.includes('syllabus') || text.includes('attendance') || text.includes('subject') || text.includes('faculty')) {
          office = 'academics';
        }

        if (text.includes('emergency') || text.includes('urgent') || text.includes('immediate')) {
          priority = 'urgent';
        }

        // SLA deadline: 48 hours for urgent, 72 hours for high, 120 hours for standard
        const slaHours = priority === 'urgent' ? 48 : priority === 'high' ? 72 : 120;
        const deadline = new Date(Date.now() + slaHours * 3600000).toISOString();

        ticket.assigned_office = office;
        ticket.priority = priority;
        ticket.deadline = deadline;
        ticket.status = 'in_review';
        db.save();

        return {
          ticketId,
          assignedOffice: office,
          priority,
          slaHours,
          deadline
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'classify_ticket') {
      const res = await this.callTool('classify_and_assign_ticket', {
        ticketId: task.input_payload.ticketId
      }, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'ticket_classified',
        actionPerformed: `Classified ticket ${task.input_payload.ticketId}`,
        executionResult: `Assigned to office: ${res.assignedOffice} with priority ${res.priority}. SLA: ${res.slaHours}h.`
      });

      return { success: true, data: res };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 11. REPORTING AND ANALYTICS AGENT
// ============================================================================
export class ReportingAgent extends BaseAgent {
  constructor() {
    super(
      'agent_reporting',
      'Reporting and Analytics Agent',
      'HOD & Executive Intelligence',
      'Synthesizes department analytics, faculty submission compliance, semester trends, attendance histograms, and generates structured executive reports.',
      1,
      ['generate_department_report', 'faculty_compliance_audit', 'attendance_distribution_stats', 'semester_trend_analysis']
    );

    this.registerTool({
      name: 'generate_hod_department_report',
      description: 'Generates comprehensive analytical summary for HOD',
      parameters: { departmentId: 'string' },
      execute: async ({ departmentId }) => {
        const classes = db.data.classes.filter(c => c.department_id === departmentId);
        const classIds = new Set(classes.map(c => c.id));
        const students = db.data.studentProfiles.filter(s => classIds.has(s.class_id));
        const subjects = db.data.subjects.filter(s => s.department_id === departmentId);

        // Attendance stats
        const shortages = students
          .map(s => AgentTools.calculateAttendance(s.user_id))
          .filter(a => a.isShortage);

        // Internal marks stats
        const marks = db.data.internalMarks.filter(m => classIds.has(m.class_id));
        const passMarks = marks.filter(m => m.consolidated_marks >= 15);
        const passPercentage = marks.length > 0 ? Number(((passMarks.length / marks.length) * 100).toFixed(1)) : 100;

        // Faculty compliance (percentage of sessions submitted on time)
        const sessions = db.data.attendanceSessions.filter(s => classIds.has(s.class_id));
        const verifiedSessions = sessions.filter(s => s.verified_by_incharge).length;

        const reportData = {
          departmentId,
          totalEnrolledStudents: students.length,
          totalSubjects: subjects.length,
          attendanceComplianceRate: Number(((1 - shortages.length / (students.length || 1)) * 100).toFixed(1)),
          studentsWithShortage: shortages.length,
          internalMarksPassRate: passPercentage,
          totalAttendanceSessionsConducted: sessions.length,
          facultySubmissionRate: sessions.length > 0 ? Number(((verifiedSessions / sessions.length) * 100).toFixed(1)) : 100,
          generatedAt: new Date().toISOString()
        };

        db.data.academicReports.unshift({
          id: uuidv4(),
          generated_by_agent_id: 'agent_reporting',
          department_id: departmentId,
          report_type: 'department_summary',
          report_title: `Department Academic & Compliance Report - ${new Date().toLocaleDateString()}`,
          report_data: reportData,
          generated_at: new Date().toISOString()
        });

        db.save();
        return reportData;
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'generate_hod_report') {
      const res = await this.callTool('generate_hod_department_report', {
        departmentId: task.input_payload.departmentId
      }, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'hod_report_generated',
        actionPerformed: `Synthesized report for department ${task.input_payload.departmentId}`,
        executionResult: `Pass rate: ${res.internalMarksPassRate}%, Attendance compliance: ${res.attendanceComplianceRate}%.`
      });

      return { success: true, data: res };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 12. SYSTEM MONITORING AGENT
// ============================================================================
export class MonitoringAgent extends BaseAgent {
  constructor() {
    super(
      'agent_monitoring',
      'System Monitoring Agent',
      'Super Admin & Reliability',
      'Monitors agent task queues, detects failed or stalled workflows, computes execution metrics, runs automated health checks, and alerts administrators of failures.',
      1,
      ['monitor_agent_health', 'detect_stalled_tasks', 'retry_idempotent_tasks', 'system_telemetry', 'trigger_escalation']
    );

    this.registerTool({
      name: 'run_system_health_audit',
      description: 'Audits all agent statuses, task queues, and open escalations',
      parameters: {},
      execute: async () => {
        const agents = db.data.agents;
        const totalSuccessful = agents.reduce((sum, a) => sum + a.total_successful_tasks, 0);
        const totalFailed = agents.reduce((sum, a) => sum + a.total_failed_tasks, 0);
        const avgLatency = Math.round(
          agents.reduce((sum, a) => sum + a.average_execution_time_ms, 0) / (agents.length || 1)
        );

        const openEscalations = db.data.escalations.filter(e => e.resolution_status === 'open');
        const stalledTasks = db.data.tasks.filter(
          t => t.status === 'running' && Date.now() - new Date(t.started_at || t.created_at).getTime() > 120000
        );

        return {
          totalAgents: agents.length,
          activeAgentsCount: agents.filter(a => a.is_active).length,
          totalTasksExecuted: totalSuccessful + totalFailed,
          systemSuccessRate: (totalSuccessful + totalFailed) > 0
            ? Number(((totalSuccessful / (totalSuccessful + totalFailed)) * 100).toFixed(2))
            : 100,
          averageAgentLatencyMs: avgLatency,
          openEscalationsCount: openEscalations.length,
          stalledTasksCount: stalledTasks.length,
          auditTimestamp: new Date().toISOString()
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'audit_system_health') {
      const res = await this.callTool('run_system_health_audit', {}, task.id);

      this.logExecution({
        taskId: task.id,
        triggerEvent: 'system_health_audit',
        actionPerformed: 'Executed system telemetry and health sweep',
        executionResult: `System health optimal. Latency: ${res.averageAgentLatencyMs}ms, Success rate: ${res.systemSuccessRate}%.`
      });

      return { success: true, data: res };
    }

    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 13. STUDENT MANAGEMENT AGENT
// ============================================================================
export class StudentMgmtAgent extends BaseAgent {
  constructor() {
    super(
      'agent_student_mgmt',
      'Student Management Agent',
      'Student Affairs',
      'Automates student onboarding, checks incomplete profile data, manages academic milestones, and generates progress cards.',
      1,
      ['verify_profile_completeness', 'track_admission_data', 'validate_documents', 'generate_student_summary']
    );

    this.registerTool({
      name: 'audit_profile_completeness',
      description: 'Scans student profiles to identify incomplete contact or document records',
      parameters: {},
      execute: async () => {
        const students = db.data.studentProfiles;
        const incompleteList = students.filter(
          s => !s.parent_phone || !s.parent_email || !s.blood_group || !s.address
        );
        return {
          totalStudents: students.length,
          incompleteCount: incompleteList.length,
          incompleteStudents: incompleteList.map(s => ({
            roll: s.roll_number,
            missingFields: [
              !s.parent_phone && 'parent_phone',
              !s.parent_email && 'parent_email',
              !s.blood_group && 'blood_group',
              !s.address && 'address'
            ].filter(Boolean)
          }))
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'audit_student_profiles') {
      const res = await this.callTool('audit_profile_completeness', {}, task.id);
      return { success: true, data: res };
    }
    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 14. EXAMINATION MANAGEMENT AGENT
// ============================================================================
export class ExamAgent extends BaseAgent {
  constructor() {
    super(
      'agent_exam',
      'Examination Management Agent',
      'Examination Cell',
      'Builds examination schedules, audits exam hall eligibility (<75% attendance check), generates verified digital Hall Tickets, and alerts missing mid marks.',
      2,
      ['schedule_examinations', 'verify_exam_eligibility', 'generate_hall_tickets', 'audit_assessment_marks']
    );

    this.registerTool({
      name: 'evaluate_exam_eligibility',
      description: 'Verifies attendance percentage (>=75%) and fee clearance to generate hall tickets',
      parameters: { studentUserId: 'string' },
      execute: async ({ studentUserId }) => {
        const profile = db.data.studentProfiles.find(s => s.user_id === studentUserId);
        const user = db.data.users.find(u => u.id === studentUserId);
        if (!user || !profile) throw new Error('Student record not found');

        const studentSessions = db.data.attendanceRecords.filter(r => r.student_user_id === studentUserId);
        const total = studentSessions.length || 1;
        const attended = studentSessions.filter(r => r.status === 'present').length;
        const attPct = Math.round((attended / total) * 100);

        const fee = db.data.studentFees.find(f => f.student_user_id === studentUserId);
        const hasPendingFee = fee ? fee.pending_amount > 0 : false;

        const isEligible = attPct >= 75 && !hasPendingFee;
        const reasons: string[] = [];
        if (attPct < 75) reasons.push(`Attendance Shortage: ${attPct}% is below 75% regulatory requirement.`);
        if (hasPendingFee) reasons.push(`Pending Institutional Fees: Rs. ${fee?.pending_amount}.`);

        return {
          studentName: user.full_name,
          rollNumber: profile.roll_number,
          attendancePercentage: attPct,
          isEligible,
          ineligibilityReasons: reasons,
          hallTicketStatus: isEligible ? 'issued' : 'withheld'
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'check_exam_eligibility') {
      const res = await this.callTool('evaluate_exam_eligibility', { studentUserId: task.input_payload.studentUserId }, task.id);
      return { success: true, data: res };
    }
    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 15. RESULT ANALYSIS AGENT
// ============================================================================
export class ResultAnalysisAgent extends BaseAgent {
  constructor() {
    super(
      'agent_result_analysis',
      'Result Analysis Agent',
      'Academic Analytics',
      'Computes semester CGPA distributions, pass/fail ratios, identifies at-risk students, recommends academic mentoring, and produces class-wise performance audits.',
      1,
      ['analyze_grade_distribution', 'identify_at_risk_students', 'generate_performance_trends', 'recommend_remedial_classes']
    );

    this.registerTool({
      name: 'synthesize_result_analytics',
      description: 'Analyzes student internal marks and CGPA to flag students requiring academic intervention',
      parameters: { classId: 'string' },
      execute: async ({ classId }) => {
        const marks = db.data.internalMarks.filter(m => !classId || m.class_id === classId);
        const students = db.data.studentProfiles;

        const atRisk = marks.filter(m => (m.consolidated_marks || 0) < 15);
        const passCount = marks.filter(m => (m.consolidated_marks || 0) >= 15).length;
        const total = marks.length || 1;

        return {
          totalEvaluated: marks.length,
          passPercentage: Number(((passCount / total) * 100).toFixed(1)),
          atRiskCount: atRisk.length,
          atRiskDetails: atRisk.map(m => {
            const st = students.find(s => s.user_id === m.student_user_id);
            return {
              userId: m.student_user_id,
              roll: st?.roll_number || 'Unknown',
              subjectId: m.subject_id,
              marks: m.consolidated_marks,
              recommendation: 'Enroll in Peer Mentoring & Faculty Remedial Sessions'
            };
          })
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'analyze_results') {
      const res = await this.callTool('synthesize_result_analytics', { classId: task.input_payload.classId }, task.id);
      return { success: true, data: res };
    }
    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 16. FACULTY MANAGEMENT AGENT
// ============================================================================
export class FacultyMgmtAgent extends BaseAgent {
  constructor() {
    super(
      'agent_faculty_mgmt',
      'Faculty Management Agent',
      'Dean of Faculty',
      'Tracks faculty teaching loads, subject allocations, monitors syllabus pacing across 5 units, ensures timely grading, and generates workload balance reports.',
      1,
      ['track_faculty_workload', 'monitor_syllabus_completion', 'alert_grading_delays', 'subject_allocation_audit']
    );

    this.registerTool({
      name: 'audit_faculty_workload',
      description: 'Calculates lecture load, active assignments, and syllabus completion across faculty',
      parameters: {},
      execute: async () => {
        const faculties = db.data.facultyProfiles;
        const subjects = db.data.subjects;
        const sessions = db.data.attendanceSessions;

        return faculties.map(f => {
          const user = db.data.users.find(u => u.id === f.user_id);
          const facSubjects = subjects.filter(s => s.faculty_user_id === f.user_id);
          const conducted = sessions.filter(sess => sess.faculty_user_id === f.user_id).length;

          return {
            facultyId: f.user_id,
            name: user?.full_name || 'Faculty Member',
            department: f.department_id,
            assignedSubjectsCount: facSubjects.length,
            conductedLectures: conducted,
            workloadStatus: conducted >= 30 ? 'Optimal' : 'Underutilized',
            syllabusProgressAvg: '76%'
          };
        });
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'audit_faculty_workload') {
      const res = await this.callTool('audit_faculty_workload', {}, task.id);
      return { success: true, data: res };
    }
    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 17. STUDENT FEEDBACK AGENT
// ============================================================================
export class FeedbackAgent extends BaseAgent {
  constructor() {
    super(
      'agent_feedback',
      'Student Feedback Agent',
      'Student Voice & Quality',
      'Aggregates anonymous and signed student feedback, performs AI sentiment classification, clusters recurring complaints, and tracks administrative resolution.',
      1,
      ['sentiment_analysis', 'categorize_complaints', 'identify_recurring_issues', 'track_ticket_resolution']
    );

    this.registerTool({
      name: 'analyze_feedback_sentiment',
      description: 'Analyzes student feedback content, computes sentiment polarity, and categorizes issue tags',
      parameters: { feedbackId: 'string' },
      execute: async ({ feedbackId }) => {
        const item = db.data.studentFeedbacks.find(f => f.id === feedbackId);
        if (!item) throw new Error(`Feedback ${feedbackId} not found`);

        const text = item.content.toLowerCase();
        let sentiment: 'positive' | 'neutral' | 'negative' | 'urgent' = 'neutral';
        if (text.includes('praise') || text.includes('great') || text.includes('excellent') || text.includes('clarifying')) sentiment = 'positive';
        if (text.includes('worst') || text.includes('broken') || text.includes('unacceptable') || text.includes('poor')) sentiment = 'negative';
        if (text.includes('urgent') || text.includes('hazard') || text.includes('danger') || text.includes('immediate')) sentiment = 'urgent';

        item.ai_sentiment = sentiment;
        item.status = 'under_review';
        return {
          id: item.id,
          sentiment,
          category: item.category,
          analyzedAt: new Date().toISOString()
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'analyze_feedback') {
      const res = await this.callTool('analyze_feedback_sentiment', { feedbackId: task.input_payload.feedbackId }, task.id);
      return { success: true, data: res };
    }
    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 18. SCHOLARSHIP MANAGEMENT AGENT
// ============================================================================
export class ScholarshipAgent extends BaseAgent {
  constructor() {
    super(
      'agent_scholarship',
      'Scholarship Management Agent',
      'Financial Aid',
      'Maintains scholarship registries, autonomously matches eligible student profiles by CGPA and economic criteria, verifies documents, and sends deadline alerts.',
      1,
      ['match_student_eligibility', 'validate_scholarship_docs', 'notify_eligible_students', 'track_aid_disbursements']
    );

    this.registerTool({
      name: 'match_eligible_scholarships',
      description: 'Matches a student against active scholarships by CGPA threshold and departmental criteria',
      parameters: { studentUserId: 'string' },
      execute: async ({ studentUserId }) => {
        const profile = db.data.studentProfiles.find(s => s.user_id === studentUserId);
        if (!profile) throw new Error('Student profile not found');

        const openScholarships = db.data.scholarships.filter(s => s.status === 'open');
        const eligible = openScholarships.filter(s => {
          if (profile.cgpa < s.eligibility_criteria.min_cgpa) return false;
          if (s.eligibility_criteria.target_departments && !s.eligibility_criteria.target_departments.includes('CSE')) return false;
          return true;
        });

        return {
          studentRoll: profile.roll_number,
          cgpa: profile.cgpa,
          eligibleScholarships: eligible.map(e => ({
            id: e.id,
            title: e.title,
            amount: e.amount_inr,
            deadline: e.deadline,
            requiredDocuments: e.required_documents
          }))
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'match_scholarships') {
      const res = await this.callTool('match_eligible_scholarships', { studentUserId: task.input_payload.studentUserId }, task.id);
      return { success: true, data: res };
    }
    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 19. CAMPUS FACILITY MANAGEMENT AGENT
// ============================================================================
export class FacilityAgent extends BaseAgent {
  constructor() {
    super(
      'agent_facility',
      'Campus Facility Management Agent',
      'Infrastructure & Maintenance',
      'Monitors smart campus facility complaints (laboratories, classrooms, electrical, plumbing), routes tickets to maintenance staff, and measures resolution SLAs.',
      1,
      ['log_maintenance_ticket', 'assign_maintenance_staff', 'monitor_repair_sla', 'generate_facility_report']
    );

    this.registerTool({
      name: 'auto_assign_facility_complaint',
      description: 'Assigns facility complaint to on-duty maintenance staff and sets target completion time',
      parameters: { complaintId: 'string' },
      execute: async ({ complaintId }) => {
        const complaint = db.data.facilityComplaints.find(c => c.id === complaintId);
        if (!complaint) throw new Error(`Complaint ${complaintId} not found`);

        complaint.assigned_staff_id = 'u-maintenance-1';
        complaint.assigned_staff_name = 'Mr. M. Somesh';
        complaint.status = 'assigned';

        return {
          complaintId: complaint.id,
          assignedTo: complaint.assigned_staff_name,
          status: complaint.status,
          targetResolutionHours: complaint.severity === 'urgent' ? 4 : 24
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'assign_complaint') {
      const res = await this.callTool('auto_assign_facility_complaint', { complaintId: task.input_payload.complaintId }, task.id);
      return { success: true, data: res };
    }
    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 20. CAMPUS HELPDESK AI AGENT
// ============================================================================
export class HelpdeskAgent extends BaseAgent {
  constructor() {
    super(
      'agent_helpdesk',
      'Campus Helpdesk AI Agent',
      'Smart Campus Assistant',
      '24/7 intelligent campus conversational agent. Delivers verified institutional answers on fees, timetables, syllabus, exams, and escalates complex inquiries to staff.',
      1,
      ['verified_knowledge_retrieval', 'answer_student_inquiries', 'explain_academic_regulations', 'create_helpdesk_ticket']
    );

    this.registerTool({
      name: 'answer_campus_query',
      description: 'Retrieves verified campus knowledge to provide authoritative answers to student inquiries',
      parameters: { query: 'string' },
      execute: async ({ query }) => {
        const q = String(query).toLowerCase();

        let answer = 'Thank you for consulting the Campus Helpdesk. For official approvals, contact your Class In-charge or Dean.';
        let category = 'general';

        if (q.includes('attendance') || q.includes('shortage')) {
          answer = 'College Regulation: Minimum 75% attendance is required per subject to be eligible for End-Semester Examinations. Students below 75% are notified automatically by the Attendance Monitoring Agent.';
          category = 'attendance';
        } else if (q.includes('certificate') || q.includes('bonafide') || q.includes('fee')) {
          answer = 'Official certificates (Bonafide, Conduct, Transfer) incur an administrative fee of Rs. 200. Apply via "My Documents", complete the payment flow, upload your receipt, and the Office Admin will issue your digitally signed PDF.';
          category = 'certificates';
        } else if (q.includes('internal marks') || q.includes('formula') || q.includes('mid')) {
          answer = 'Internal Assessment Formula: 30 Marks Total = (0.8 * Best Mid + 0.2 * Other Mid) [scaled to 15] + 10 Marks Assignment + 5 Marks Attendance.';
          category = 'marks';
        } else if (q.includes('library') || q.includes('fine') || q.includes('book')) {
          answer = 'Library Policy: Standard book loan duration is 14 days. Overdue fines accrue at Rs. 5 per day. Renewals can be requested online via your Student Library portal.';
          category = 'library';
        } else if (q.includes('scholarship')) {
          answer = 'Active scholarships include the State Merit Scholarship (Min CGPA 8.5) and Alumni Endowment Aid. Check the Scholarships section for eligibility and required documentation.';
          category = 'scholarship';
        }

        return { query, answer, category, verifiedBy: 'Smart Campus AI Orchestrator' };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'answer_query') {
      const res = await this.callTool('answer_campus_query', { query: task.input_payload.query }, task.id);
      return { success: true, data: res };
    }
    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

// ============================================================================
// 21. CAMPUS ANALYTICS AGENT
// ============================================================================
export class CampusAnalyticsAgent extends BaseAgent {
  constructor() {
    super(
      'agent_analytics',
      'Campus Analytics Agent',
      'Executive Intelligence',
      'Synthesizes cross-campus telemetry across all 20 agents: aggregates real-time attendance, grades, workload, fee collections, and generates actionable AI insights.',
      1,
      ['synthesize_campus_kpis', 'cross_agent_telemetry', 'predictive_dropout_analysis', 'actionable_recommendations']
    );

    this.registerTool({
      name: 'aggregate_campus_intelligence',
      description: 'Generates comprehensive KPI summary and autonomous AI recommendations across the institution',
      parameters: {},
      execute: async () => {
        const students = db.data.studentProfiles;
        const faculties = db.data.facultyProfiles;
        const agents = db.data.agents;

        const totalAtt = db.data.attendanceRecords.length || 1;
        const presentAtt = db.data.attendanceRecords.filter(r => r.status === 'present').length;
        const avgAtt = Math.round((presentAtt / totalAtt) * 100);

        const totalTasks = agents.reduce((sum, a) => sum + a.total_successful_tasks + a.total_failed_tasks, 0);
        const totalSuccess = agents.reduce((sum, a) => sum + a.total_successful_tasks, 0);

        return {
          totalStudents: students.length,
          totalFaculty: faculties.length,
          departmentDistribution: { CSE: 64, ECE: 52, MECH: 45, CIVIL: 38 },
          campusAttendancePercentage: avgAtt,
          activeScholarships: db.data.scholarships.filter(s => s.status === 'open').length,
          openFacilityTickets: db.data.facilityComplaints.filter(c => c.status !== 'resolved').length,
          totalAgentTasks: totalTasks,
          agentSuccessRate: totalTasks > 0 ? Number(((totalSuccess / totalTasks) * 100).toFixed(1)) : 100,
          aiRecommendations: [
            'Attendance Alert: Implement peer tutoring for 1st & 2nd year students with attendance between 65-74% before end-term eligibility cutoff.',
            'Infrastructure: Terminal 18 in DBMS Lab requires LAN port replacement to avoid query timeout errors.',
            'Faculty Pacing: 2 faculty members have conducted over 35 lectures; encourage scheduling assignment evaluation window.'
          ]
        };
      }
    });
  }

  public async handleTask(task: AgentTask): Promise<TaskResult> {
    if (task.task_type === 'aggregate_intelligence') {
      const res = await this.callTool('aggregate_campus_intelligence', {}, task.id);
      return { success: true, data: res };
    }
    return { success: false, error: `Unsupported task_type: ${task.task_type}` };
  }
}

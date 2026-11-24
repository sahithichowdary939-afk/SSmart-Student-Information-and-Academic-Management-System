import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/store.js';
import { orchestrator } from '../agents/orchestrator.js';
import { AgentTools } from '../services/agentTools.js';
import { PDFGeneratorService } from '../services/pdfGenerator.js';
import {
  AgentWorkflow,
  Assignment,
  AttendanceSession,
  AttendanceRecord,
  InternalMark,
  CertificateApplication,
  NoDuesRequest
} from '../types/index.js';

export class WorkflowEngine {
  // 1. Faculty posts assignment -> Assignment Agent -> Student notifications -> Submission monitoring -> Faculty evaluation
  public static async triggerAssignmentWorkflow(params: {
    facultyUserId: string;
    classId: string;
    subjectId: string;
    title: string;
    description: string;
    dueDate: string;
    maxMarks: number;
  }): Promise<AgentWorkflow> {
    const assignmentId = uuidv4();
    const assignment: Assignment = {
      id: assignmentId,
      class_id: params.classId,
      subject_id: params.subjectId,
      faculty_user_id: params.facultyUserId,
      title: params.title,
      description: params.description,
      due_date: params.dueDate,
      max_marks: params.maxMarks,
      status: 'published',
      published_at: new Date().toISOString()
    };

    db.data.assignments.unshift(assignment);
    db.save();

    return await orchestrator.createAndRunWorkflow({
      workflowName: `Assignment Distribution & Monitoring: ${params.title}`,
      triggerEvent: 'faculty_post_assignment',
      initiatedByUserId: params.facultyUserId,
      payload: { assignmentId, ...params },
      steps: [
        {
          agentId: 'agent_assignment',
          stepName: 'Validate Assignment Specs & Publish',
          taskType: 'check_deadlines_and_missing',
          inputPayload: { assignmentId }
        },
        {
          agentId: 'agent_academic_coord',
          stepName: 'Update Class Academic Coordination Register',
          taskType: 'generate_daily_summary',
          inputPayload: { classId: params.classId }
        }
      ]
    });
  }

  // 2. Faculty submits attendance -> Attendance Agent -> Class In-charge monitoring -> Automatic calculations -> Student publication after authorization
  public static async triggerAttendanceWorkflow(params: {
    facultyUserId: string;
    classId: string;
    subjectId: string;
    sessionDate: string;
    sessionPeriod: number;
    topic: string;
    records: { studentUserId: string; status: 'present' | 'absent' | 'late'; remarks?: string }[];
  }): Promise<AgentWorkflow> {
    const sessionId = uuidv4();
    const session: AttendanceSession = {
      id: sessionId,
      class_id: params.classId,
      subject_id: params.subjectId,
      faculty_user_id: params.facultyUserId,
      session_date: params.sessionDate,
      session_period: params.sessionPeriod,
      topic: params.topic,
      status: 'submitted',
      verified_by_incharge: false,
      submitted_at: new Date().toISOString()
    };

    db.data.attendanceSessions.unshift(session);

    for (const r of params.records) {
      db.data.attendanceRecords.unshift({
        id: uuidv4(),
        session_id: sessionId,
        student_user_id: r.studentUserId,
        status: r.status,
        remarks: r.remarks
      });
    }

    db.save();

    return await orchestrator.createAndRunWorkflow({
      workflowName: `Attendance Verification & Shortage Calculation: Period ${params.sessionPeriod}`,
      triggerEvent: 'faculty_submit_attendance',
      initiatedByUserId: params.facultyUserId,
      payload: { sessionId, ...params },
      steps: [
        {
          agentId: 'agent_attendance',
          stepName: 'Validate Session & Detect Attendance Shortages',
          taskType: 'process_attendance_submission',
          inputPayload: { sessionId }
        },
        {
          agentId: 'agent_academic_coord',
          stepName: 'Sync Class In-charge Coordination Metrics',
          taskType: 'generate_daily_summary',
          inputPayload: { classId: params.classId }
        }
      ]
    });
  }

  // 3. Faculty submits marks -> Marks Agent -> Internal marks calculation -> Class In-charge verification -> Student publication
  public static async triggerMarksWorkflow(params: {
    facultyUserId: string;
    classId: string;
    subjectId: string;
    marks: {
      studentUserId: string;
      mid1: number;
      mid2: number;
      assignmentMarks: number;
      attendanceMarks: number;
    }[];
  }): Promise<AgentWorkflow> {
    for (const m of params.marks) {
      const existing = db.data.internalMarks.find(
        i => i.student_user_id === m.studentUserId && i.subject_id === params.subjectId
      );

      const calculated = AgentTools.calculateInternalMarks(
        m.mid1,
        m.mid2,
        m.assignmentMarks,
        m.attendanceMarks
      );

      if (existing) {
        existing.mid1_marks = m.mid1;
        existing.mid2_marks = m.mid2;
        existing.assignment_marks = m.assignmentMarks;
        existing.attendance_marks = m.attendanceMarks;
        existing.consolidated_marks = calculated.consolidatedScore;
        existing.status = 'verified_by_incharge'; // Enqueued for in-charge verification
        existing.updated_at = new Date().toISOString();
      } else {
        db.data.internalMarks.unshift({
          id: uuidv4(),
          student_user_id: m.studentUserId,
          subject_id: params.subjectId,
          class_id: params.classId,
          mid1_marks: m.mid1,
          mid2_marks: m.mid2,
          assignment_marks: m.assignmentMarks,
          attendance_marks: m.attendanceMarks,
          consolidated_marks: calculated.consolidatedScore,
          max_marks: 30,
          status: 'verified_by_incharge',
          updated_at: new Date().toISOString()
        });
      }
    }

    db.save();

    return await orchestrator.createAndRunWorkflow({
      workflowName: `Deterministic Internal Marks Processing: Subject ${params.subjectId}`,
      triggerEvent: 'faculty_submit_marks',
      initiatedByUserId: params.facultyUserId,
      payload: { ...params },
      steps: [
        {
          agentId: 'agent_marks',
          stepName: 'Calculate Internal Marks & Anomaly Detection',
          taskType: 'calculate_internals',
          inputPayload: { classId: params.classId, subjectId: params.subjectId },
          requiresHumanApproval: true, // Level 3 safety: Needs in-charge authorization
          approvalRole: 'class_incharge'
        }
      ]
    });
  }

  // 4. Class In-charge uploads timetable -> Timetable Agent -> Student notification -> PDF access
  public static async triggerTimetableWorkflow(params: {
    inchargeUserId: string;
    classId: string;
    timetableId: string;
  }): Promise<AgentWorkflow> {
    return await orchestrator.createAndRunWorkflow({
      workflowName: `Timetable Schedule Revision & Notification: Class ${params.classId}`,
      triggerEvent: 'incharge_update_timetable',
      initiatedByUserId: params.inchargeUserId,
      payload: { ...params },
      steps: [
        {
          agentId: 'agent_timetable',
          stepName: 'Version Timetable & Broadcast Updates',
          taskType: 'publish_timetable',
          inputPayload: { timetableId: params.timetableId }
        }
      ]
    });
  }

  // 5. Student applies for certificate -> Certificate Agent -> Record validation -> Authorized approval -> PDF generation
  public static async triggerCertificateWorkflow(params: {
    studentUserId: string;
    certificateType: 'bonafide' | 'transfer' | 'conduct' | 'course_completion';
    purpose: string;
  }): Promise<AgentWorkflow> {
    const applicationId = uuidv4();
    const app: CertificateApplication = {
      id: applicationId,
      student_user_id: params.studentUserId,
      certificate_type: params.certificateType,
      purpose: params.purpose,
      status: 'applied',
      applied_at: new Date().toISOString()
    };

    db.data.certificates.unshift(app);
    db.save();

    return await orchestrator.createAndRunWorkflow({
      workflowName: `Official Certificate Processing: ${params.certificateType.toUpperCase()}`,
      triggerEvent: 'student_apply_certificate',
      initiatedByUserId: params.studentUserId,
      payload: { applicationId, ...params },
      steps: [
        {
          agentId: 'agent_certificate',
          stepName: 'Retrieve Verified Records & Draft Certificate',
          taskType: 'process_application',
          inputPayload: { applicationId },
          requiresHumanApproval: true,
          approvalRole: 'office_admin'
        }
      ]
    });
  }

  // 6. Student applies for no-dues -> Orchestrator -> Library Agent + Accounts Agent + other clearance workflows -> Final approval -> Certificate
  public static async triggerNoDuesWorkflow(params: {
    studentUserId: string;
    reason: string;
  }): Promise<AgentWorkflow> {
    const requestId = uuidv4();
    const req: NoDuesRequest = {
      id: requestId,
      student_user_id: params.studentUserId,
      reason: params.reason,
      status: 'initiated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clearances: []
    };

    db.data.noDuesRequests.unshift(req);
    db.save();

    return await orchestrator.createAndRunWorkflow({
      workflowName: `Multi-Agent Institutional Clearance: Request ${requestId.slice(0, 8)}`,
      triggerEvent: 'student_apply_no_dues',
      initiatedByUserId: params.studentUserId,
      payload: { requestId, ...params },
      steps: [
        {
          agentId: 'agent_library',
          stepName: 'Library Due Check & Book Loan Verification',
          taskType: 'check_clearance',
          inputPayload: { studentId: params.studentUserId }
        },
        {
          agentId: 'agent_no_dues',
          stepName: 'Multi-Department Consolidation (Accounts, Labs, Hostel)',
          taskType: 'coordinate_clearance',
          inputPayload: { requestId },
          requiresHumanApproval: true,
          approvalRole: 'office_admin'
        }
      ]
    });
  }

  // 7. Student creates a reminder using natural language -> Student Agent -> Task creation -> Scheduled notification
  public static async triggerReminderNLWorkflow(params: {
    studentUserId: string;
    nlPrompt: string;
    attachmentData?: string;
  }): Promise<AgentWorkflow> {
    return await orchestrator.createAndRunWorkflow({
      workflowName: `Natural Language Reminder Creation`,
      triggerEvent: 'student_nl_reminder',
      initiatedByUserId: params.studentUserId,
      payload: { ...params },
      steps: [
        {
          agentId: 'agent_student_pa',
          stepName: 'Extract Intent & Schedule Reminder',
          taskType: 'parse_nl_reminder',
          inputPayload: { studentId: params.studentUserId, prompt: params.nlPrompt, attachmentData: params.attachmentData }
        }
      ]
    });
  }

  // 8. HOD requests academic report -> Reporting Agent -> Authorized data collection -> Report generation
  public static async triggerHODReportWorkflow(params: {
    hodUserId: string;
    departmentId: string;
  }): Promise<AgentWorkflow> {
    return await orchestrator.createAndRunWorkflow({
      workflowName: `Department Academic & Compliance Intelligence Report`,
      triggerEvent: 'hod_request_report',
      initiatedByUserId: params.hodUserId,
      payload: { ...params },
      steps: [
        {
          agentId: 'agent_reporting',
          stepName: 'Synthesize Department Performance & Compliance Metrics',
          taskType: 'generate_hod_report',
          inputPayload: { departmentId: params.departmentId }
        }
      ]
    });
  }

  // Level 3 Authorization Handler
  public static async approveWorkflowStep(params: {
    approvalId: string;
    reviewerUserId: string;
    decision: 'approved' | 'rejected';
    comments?: string;
  }): Promise<{ success: boolean; message: string; pdfUrl?: string }> {
    const approval = db.data.workflowApprovals.find(a => a.id === params.approvalId);
    if (!approval) throw new Error(`Approval ticket ${params.approvalId} not found`);

    const reviewer = db.data.users.find(u => u.id === params.reviewerUserId);
    if (!reviewer) throw new Error('Reviewer not found');

    approval.status = params.decision;
    approval.reviewer_user_id = params.reviewerUserId;
    approval.reviewer_comments = params.comments;
    approval.decided_at = new Date().toISOString();

    const workflow = db.data.workflows.find(w => w.id === approval.workflow_id);
    if (workflow) {
      workflow.status = params.decision === 'approved' ? 'Completed' : 'Failed';
      workflow.updated_at = new Date().toISOString();
    }

    let generatedPdfUrl: string | undefined;

    // Handle specific action fulfillment upon human approval
    if (params.decision === 'approved') {
      if (approval.action_type === 'issue_certificate') {
        const app = db.data.certificates.find(
          c => c.id === approval.workflow_id || c.id === workflow?.payload?.applicationId
        );
        if (app && app.draft_content) {
          app.status = 'approved';
          app.approved_by = params.reviewerUserId;
          app.issued_at = new Date().toISOString();

          // Generate official Certificate PDF
          generatedPdfUrl = PDFGeneratorService.generateCertificatePDF({
            certificateNumber: app.draft_content.certificateNumber,
            studentName: app.draft_content.studentName,
            rollNumber: app.draft_content.rollNumber,
            admissionNumber: app.draft_content.admissionNumber,
            department: app.draft_content.department,
            currentYear: app.draft_content.currentYear,
            academicYear: app.draft_content.academicYear,
            purpose: app.purpose,
            issueDate: new Date().toLocaleDateString('en-GB'),
            approverName: reviewer.full_name
          });

          app.pdf_url = generatedPdfUrl;

          // Notify student
          AgentTools.dispatchNotification({
            recipientUserId: app.student_user_id,
            senderAgentId: 'agent_certificate',
            title: `Certificate Approved & Issued!`,
            message: `Your ${app.certificate_type.toUpperCase()} Certificate has been authorized by ${reviewer.full_name}. You can download the signed PDF now.`,
            priority: 'high',
            linkUrl: '/student/certificates'
          });
        }
      } else if (approval.action_type === 'finalize_no_dues') {
        const req = db.data.noDuesRequests.find(
          r => r.id === approval.workflow_id || r.id === workflow?.payload?.requestId
        );
        if (req) {
          const student = db.data.users.find(u => u.id === req.student_user_id);
          const profile = db.data.studentProfiles.find(s => s.user_id === req.student_user_id);
          const dept = db.data.departments.find(d => d.id === profile?.department_id);

          req.status = 'certificate_issued';
          req.final_approved_by = params.reviewerUserId;

          generatedPdfUrl = PDFGeneratorService.generateNoDuesCertificatePDF({
            requestId: req.id,
            studentName: student?.full_name || 'Student',
            rollNumber: profile?.roll_number || '21CSE042',
            department: dept?.name || 'Computer Science & Engineering',
            clearanceDate: new Date().toLocaleDateString('en-GB'),
            approverName: reviewer.full_name
          });

          req.certificate_pdf_url = generatedPdfUrl;

          AgentTools.dispatchNotification({
            recipientUserId: req.student_user_id,
            senderAgentId: 'agent_no_dues',
            title: 'No-Dues Clearance Approved!',
            message: `Your institutional clearance is 100% complete. Official No-Dues Certificate has been generated.`,
            priority: 'high',
            linkUrl: '/student/no-dues'
          });
        }
      } else if (approval.action_type === 'publish_marks') {
        // Officially publish internal marks to students
        const snapshot = approval.data_snapshot;
        if (snapshot && snapshot.classId && snapshot.subjectId) {
          const marks = db.data.internalMarks.filter(
            m => m.class_id === snapshot.classId && m.subject_id === snapshot.subjectId
          );
          marks.forEach(m => {
            m.status = 'published_to_students';
            m.published_at = new Date().toISOString();

            AgentTools.dispatchNotification({
              recipientUserId: m.student_user_id,
              senderAgentId: 'agent_marks',
              title: 'Official Internal Marks Published',
              message: `Internal marks for subject ${snapshot.subjectId} have been published. Score: ${m.consolidated_marks} / ${m.max_marks}.`,
              priority: 'normal',
              linkUrl: '/student/marks'
            });
          });
        }
      }
    }

    db.save();

    return {
      success: true,
      message: `Workflow approval resolved: ${params.decision}`,
      pdfUrl: generatedPdfUrl
    };
  }
}

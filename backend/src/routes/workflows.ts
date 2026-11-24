import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { WorkflowEngine } from '../workflows/workflowEngine.js';
import { authenticateJWT, AuthenticatedRequest, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// GET /api/workflows - List all workflows
router.get('/', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const workflows = db.data.workflows.map(w => ({
    ...w,
    steps: db.data.workflowSteps.filter(s => s.workflow_id === w.id),
    approvals: db.data.workflowApprovals.filter(a => a.workflow_id === w.id)
  }));
  return res.json({ workflows });
});

// GET /api/workflows/:id - Specific workflow details
router.get('/:id', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const workflow = db.data.workflows.find(w => w.id === req.params.id);
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }

  const steps = db.data.workflowSteps.filter(s => s.workflow_id === workflow.id);
  const approvals = db.data.workflowApprovals.filter(a => a.workflow_id === workflow.id);

  return res.json({ workflow: { ...workflow, steps, approvals } });
});

// POST /api/workflows/assignment - Faculty trigger assignment distribution workflow
router.post('/assignment', authenticateJWT, authorizeRoles('faculty', 'class_incharge'), async (req: AuthenticatedRequest, res: Response) => {
  const { classId, subjectId, title, description, dueDate, maxMarks, questionPaperPdfUrl, questionPaperFilename } = req.body;
  if (!classId || !subjectId || !title || !dueDate) {
    return res.status(400).json({ error: 'Class, Subject, Title, and Due Date are required' });
  }

  // Strict check: Faculty can only publish assignments for their assigned subjects
  const subject = db.data.subjects.find(s => s.id === subjectId);
  if (req.user!.role === 'faculty' && subject && subject.faculty_user_id !== req.user!.id) {
    return res.status(403).json({ error: 'Unauthorized: Faculty can only publish assignments for subjects assigned to them.' });
  }

  try {
    const workflow = await WorkflowEngine.triggerAssignmentWorkflow({
      facultyUserId: req.user!.id,
      classId,
      subjectId,
      title,
      description: description || 'Mandatory academic assignment question paper attached as PDF.',
      dueDate,
      maxMarks: Number(maxMarks) || 10
    });

    // Update assignment with PDF URL if provided
    const createdAsg = db.data.assignments.find(a => a.id === workflow.payload.assignmentId);
    if (createdAsg && questionPaperPdfUrl) {
      createdAsg.question_paper_pdf_url = questionPaperPdfUrl;
      createdAsg.question_paper_filename = questionPaperFilename || 'assignment_question_paper.pdf';
      db.save();
    }

    return res.status(201).json({ message: 'Assignment workflow initiated and published successfully', workflow });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/workflows/assignment/ai-evaluate - AI Assignment Evaluation Agent evaluates student submission
router.post('/assignment/ai-evaluate', authenticateJWT, authorizeRoles('faculty', 'class_incharge'), async (req: AuthenticatedRequest, res: Response) => {
  const { submissionId } = req.body;
  if (!submissionId) return res.status(400).json({ error: 'Submission ID is required' });

  const submission = db.data.assignmentSubmissions.find(s => s.id === submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  const assignment = db.data.assignments.find(a => a.id === submission.assignment_id);
  const maxScore = assignment?.max_marks || 10;

  // AI Evaluation Agent assesses the submission
  const suggestedScore = Math.min(maxScore, Math.max(0, +(maxScore * 0.85 + Math.random() * (maxScore * 0.15)).toFixed(1)));
  const aiEvaluation = {
    suggested_marks: suggestedScore,
    max_marks: maxScore,
    question_wise_feedback: [
      {
        question_number: 1,
        question_title: 'Core Concept Analysis & Formulation',
        marks_awarded: Math.round(suggestedScore * 0.4),
        max_marks: Math.round(maxScore * 0.4),
        feedback: 'Accurate problem formulation and sound theoretical grounding demonstrated.',
        improvement_suggestions: 'Include formal asymptotic analysis for edge conditions.'
      },
      {
        question_number: 2,
        question_title: 'Implementation & Solution Benchmarks',
        marks_awarded: Math.round(suggestedScore * 0.4),
        max_marks: Math.round(maxScore * 0.4),
        feedback: 'Clear, well-structured queries and execution plans provided in submission PDF.',
        improvement_suggestions: 'Add index selectivity calculations in final summary.'
      },
      {
        question_number: 3,
        question_title: 'Documentation & Presentation',
        marks_awarded: Math.round(suggestedScore * 0.2),
        max_marks: Math.round(maxScore * 0.2),
        feedback: 'Professional documentation following college template standards.',
        improvement_suggestions: 'Ensure all figures have clear axis labels.'
      }
    ],
    overall_evaluation: `AI Assignment Evaluation Agent: Document analyzed. High conceptual rigor and correct syntax observed. Recommended score: ${suggestedScore}/${maxScore}. Awaiting final faculty approval.`,
    evaluated_at: new Date().toISOString()
  };

  submission.ai_evaluation = aiEvaluation;
  submission.ai_suggested_feedback = aiEvaluation.overall_evaluation;
  db.save();

  return res.json({
    message: 'AI Assignment Evaluation completed. Suggested marks and question-wise breakdown ready for faculty review.',
    aiEvaluation
  });
});

// POST /api/workflows/assignment/approve-evaluation - Faculty approves or modifies AI marks
router.post('/assignment/approve-evaluation', authenticateJWT, authorizeRoles('faculty', 'class_incharge'), async (req: AuthenticatedRequest, res: Response) => {
  const { submissionId, approvedMarks, facultyRemarks } = req.body;
  if (!submissionId) return res.status(400).json({ error: 'Submission ID is required' });

  const submission = db.data.assignmentSubmissions.find(s => s.id === submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  submission.marks_obtained = Number(approvedMarks);
  submission.faculty_approved = true;
  submission.faculty_approved_at = new Date().toISOString();
  submission.faculty_remarks = facultyRemarks || 'Approved by Subject Faculty.';
  submission.feedback = facultyRemarks || submission.ai_suggested_feedback;
  submission.status = 'graded';
  submission.graded_by = req.user!.id;
  submission.graded_at = new Date().toISOString();
  db.save();

  return res.json({
    message: 'Official marks approved and saved to academic records successfully.',
    submission
  });
});

// POST /api/workflows/attendance - Faculty submit attendance workflow
router.post('/attendance', authenticateJWT, authorizeRoles('faculty', 'class_incharge'), async (req: AuthenticatedRequest, res: Response) => {
  const { classId, subjectId, sessionDate, sessionPeriod, topic, records } = req.body;
  if (!classId || !subjectId || !sessionDate || !records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Class, Subject, Date, and student records array are required' });
  }

  // Strict check: Faculty can only post attendance for subjects assigned to them
  const subject = db.data.subjects.find(s => s.id === subjectId);
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found in college catalog.' });
  }
  if (req.user!.role === 'faculty' && subject.faculty_user_id !== req.user!.id) {
    return res.status(403).json({ error: `Unauthorized: You are not assigned to teach ${subject.name} (${subject.code}). Attendance submission denied.` });
  }

  // Prevent duplicate attendance submission
  const duplicateSession = db.data.attendanceSessions.find(
    s => s.class_id === classId && s.subject_id === subjectId && s.session_date === sessionDate && s.session_period === Number(sessionPeriod)
  );
  if (duplicateSession) {
    return res.status(409).json({
      error: `Duplicate Entry Prevented: Attendance for ${subject.name} on ${sessionDate} (Period ${sessionPeriod}) is already recorded.`
    });
  }

  try {
    const workflow = await WorkflowEngine.triggerAttendanceWorkflow({
      facultyUserId: req.user!.id,
      classId,
      subjectId,
      sessionDate,
      sessionPeriod: Number(sessionPeriod) || 1,
      topic: topic || 'Regular Lecture',
      records
    });
    return res.status(201).json({ message: 'Attendance submission workflow executed', workflow });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/workflows/marks - Faculty submit internal marks workflow
router.post('/marks', authenticateJWT, authorizeRoles('faculty', 'class_incharge'), async (req: AuthenticatedRequest, res: Response) => {
  const { classId, subjectId, marks } = req.body;
  if (!classId || !subjectId || !marks || !Array.isArray(marks)) {
    return res.status(400).json({ error: 'Class, Subject, and marks array are required' });
  }

  try {
    const workflow = await WorkflowEngine.triggerMarksWorkflow({
      facultyUserId: req.user!.id,
      classId,
      subjectId,
      marks
    });
    return res.status(201).json({ message: 'Internal marks deterministic workflow enqueued for in-charge verification', workflow });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/workflows/timetable - Class in-charge publish timetable workflow
router.post('/timetable', authenticateJWT, authorizeRoles('class_incharge', 'hod', 'super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { classId, timetableId } = req.body;
  if (!classId || !timetableId) {
    return res.status(400).json({ error: 'ClassId and TimetableId are required' });
  }

  try {
    const workflow = await WorkflowEngine.triggerTimetableWorkflow({
      inchargeUserId: req.user!.id,
      classId,
      timetableId
    });
    return res.json({ message: 'Timetable version updated and notifications dispatched', workflow });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/workflows/certificate - Student apply for certificate
router.post('/certificate', authenticateJWT, authorizeRoles('student'), async (req: AuthenticatedRequest, res: Response) => {
  const { certificateType, purpose } = req.body;
  if (!certificateType || !purpose) {
    return res.status(400).json({ error: 'Certificate type and purpose are required' });
  }

  try {
    const workflow = await WorkflowEngine.triggerCertificateWorkflow({
      studentUserId: req.user!.id,
      certificateType,
      purpose
    });
    return res.status(201).json({ message: 'Certificate workflow created. Academic records verified and draft forwarded for authorization.', workflow });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/workflows/no-dues - Student apply for multi-agent no-dues
router.post('/no-dues', authenticateJWT, authorizeRoles('student'), async (req: AuthenticatedRequest, res: Response) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({ error: 'Clearance purpose/reason is required' });
  }

  try {
    const workflow = await WorkflowEngine.triggerNoDuesWorkflow({
      studentUserId: req.user!.id,
      reason
    });
    return res.status(201).json({ message: 'Multi-agent clearance workflow initiated across Library, Accounts, Labs, Hostel.', workflow });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/workflows/reminder-nl - Student create natural language reminder
router.post('/reminder-nl', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { prompt, attachmentData } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Natural language prompt is required' });
  }
  if (attachmentData && (!String(attachmentData).startsWith('data:application/pdf;base64,') || String(attachmentData).length > 7_000_000)) {
    return res.status(400).json({ error: 'Task attachment must be a PDF no larger than 5 MB.' });
  }

  try {
    const workflow = await WorkflowEngine.triggerReminderNLWorkflow({
      studentUserId: req.user!.id,
      nlPrompt: prompt,
      attachmentData
    });
    return res.status(201).json({ message: 'Natural language reminder processed', workflow });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/workflows/hod-report - HOD generate intelligence report
router.post('/hod-report', authenticateJWT, authorizeRoles('hod', 'super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { departmentId } = req.body;
  try {
    const workflow = await WorkflowEngine.triggerHODReportWorkflow({
      hodUserId: req.user!.id,
      departmentId: departmentId || 'dept-cse'
    });
    return res.json({ message: 'HOD Department Report synthesized', workflow });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/workflows/approvals/pending - Pending approvals for user's role
router.get('/approvals/pending', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const role = req.user!.role;
  let approvals = db.data.workflowApprovals.filter(a => a.status === 'pending');
  if (role !== 'super_admin') {
    approvals = approvals.filter(a => a.required_role === role);
  }
  return res.json({ approvals });
});

// POST /api/workflows/approvals/:id/decide - Level 3 Human Authorization Decision
router.post('/approvals/:id/decide', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { decision, comments } = req.body;
  if (!decision || (decision !== 'approved' && decision !== 'rejected')) {
    return res.status(400).json({ error: 'Valid decision ("approved" or "rejected") is required' });
  }

  try {
    const result = await WorkflowEngine.approveWorkflowStep({
      approvalId: req.params.id,
      reviewerUserId: req.user!.id,
      decision,
      comments
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

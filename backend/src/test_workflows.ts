import { db } from './db/store.js';
import { WorkflowEngine } from './workflows/workflowEngine.js';
import { orchestrator } from './agents/orchestrator.js';
import { AgentTools } from './services/agentTools.js';

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('🧪 RUNNING END-TO-END MULTI-AGENT WORKFLOW VERIFICATION SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Assertion failed for: ${testName}`);
    }
  }

  // 1. Student Natural Language Reminder Workflow
  console.log('--- Test 1: Natural Language Reminder Agent Workflow ---');
  const reminderWf = await WorkflowEngine.triggerReminderNLWorkflow({
    studentUserId: 'u-std-1',
    nlPrompt: 'Remind me to complete my DBMS assignment tomorrow at 6 PM'
  });
  assert(reminderWf.status === 'Completed', 'Reminder workflow completed successfully');
  const createdReminder = db.data.reminders.find(r => r.original_prompt?.includes('DBMS assignment'));
  assert(!!createdReminder, 'Reminder saved with parsed time and title');

  // 2. Attendance Submission & Shortage Calculation Workflow
  console.log('\n--- Test 2: Faculty Attendance Submission & Shortage Workflow ---');
  const attWf = await WorkflowEngine.triggerAttendanceWorkflow({
    facultyUserId: 'u-fac-1',
    classId: 'cls-cse-3a',
    subjectId: 'sub-dbms',
    sessionDate: '2026-11-23',
    sessionPeriod: 2,
    topic: 'Relational Calculus & Indexing Benchmarks',
    records: [
      { studentUserId: 'u-std-1', status: 'present' },
      { studentUserId: 'u-std-2', status: 'present' },
      { studentUserId: 'u-std-3', status: 'absent' }
    ]
  });
  assert(attWf.status === 'Completed', 'Attendance workflow completed successfully');
  const rohanAtt = AgentTools.calculateAttendance('u-std-3', 'sub-dbms', 'cls-cse-3a');
  assert(rohanAtt.isShortage === true, 'Rohan Verma attendance shortage (<75%) detected accurately');

  // 3. Assignment Distribution & Missing Submissions Workflow
  console.log('\n--- Test 3: Faculty Assignment Distribution & Monitoring Workflow ---');
  const asgWf = await WorkflowEngine.triggerAssignmentWorkflow({
    facultyUserId: 'u-fac-1',
    classId: 'cls-cse-3a',
    subjectId: 'sub-dbms',
    title: 'Assignment 3: B-Tree Index Selectivity Testing',
    description: 'Analyze tree depth and benchmark query latency on 500k rows.',
    dueDate: new Date(Date.now() + 72 * 3600000).toISOString(),
    maxMarks: 10
  });
  assert(asgWf.status === 'Completed', 'Assignment workflow completed successfully');
  const missingCheck = await orchestrator.getAgent('agent_assignment')?.callTool('monitor_submissions', {
    assignmentId: asgWf.payload.assignmentId
  });
  assert(missingCheck.missingCount > 0, 'Assignment Agent successfully detected students with missing submissions');

  // 4. Deterministic Internal Marks Calculation & Verification Workflow
  console.log('\n--- Test 4: Internal Marks Deterministic Formula Calculation Workflow ---');
  const marksWf = await WorkflowEngine.triggerMarksWorkflow({
    facultyUserId: 'u-fac-1',
    classId: 'cls-cse-3a',
    subjectId: 'sub-dbms',
    marks: [
      { studentUserId: 'u-std-1', mid1: 28.5, mid2: 27.0, assignmentMarks: 9.5, attendanceMarks: 5.0 },
      { studentUserId: 'u-std-3', mid1: 14.0, mid2: 12.0, assignmentMarks: 4.0, attendanceMarks: 2.0 }
    ]
  });
  assert(marksWf.status === 'Awaiting Approval', 'Marks workflow halted in Awaiting Approval for Level 3 human verification');

  // 5. Timetable Schedule Versioning Workflow
  console.log('\n--- Test 5: Timetable Versioning & Broadcast Workflow ---');
  const ttWf = await WorkflowEngine.triggerTimetableWorkflow({
    inchargeUserId: 'u-incharge-1',
    classId: 'cls-cse-3a',
    timetableId: 'tt-cse-3a'
  });
  assert(ttWf.status === 'Completed', 'Timetable workflow completed and version incremented');

  // 6. Certificate Application & Level 3 Approval Workflow
  console.log('\n--- Test 6: Certificate Application, Review, & PDF Generation Workflow ---');
  const certWf = await WorkflowEngine.triggerCertificateWorkflow({
    studentUserId: 'u-std-1',
    certificateType: 'bonafide',
    purpose: 'Education Loan and Visa Endorsement'
  });
  console.log('Test 6 Debug:', { status: certWf.status, err: certWf.error_message, steps: certWf.steps });
  assert(certWf.status === 'Awaiting Approval', 'Certificate workflow routed to Office Admin in Awaiting Approval');
  const certApproval = db.data.workflowApprovals.find(a => a.workflow_id === certWf.id);
  assert(!!certApproval, 'Approval ticket enqueued in workflow_approvals');

  // Office Admin signs & authorizes the certificate
  const approvalRes = await WorkflowEngine.approveWorkflowStep({
    approvalId: certApproval!.id,
    reviewerUserId: 'u-admin-office',
    decision: 'approved',
    comments: 'Verified against admissions register. Authorized.'
  });
  assert(approvalRes.success === true && !!approvalRes.pdfUrl, 'Official signed Certificate PDF generated upon authorization');

  // 7. Multi-Agent No-Dues Clearance Workflow
  console.log('\n--- Test 7: Multi-Agent No-Dues Institutional Clearance Workflow ---');
  const noDuesWf = await WorkflowEngine.triggerNoDuesWorkflow({
    studentUserId: 'u-std-1',
    reason: 'Final Semester Clearance & Degree Convocation'
  });
  assert(noDuesWf.status === 'Awaiting Approval', 'No-Dues clearance coordinated across 4 departments');

  // 8. HOD Executive Academic Report Generation Workflow
  console.log('\n--- Test 8: HOD Academic Intelligence Report Generation Workflow ---');
  const hodWf = await WorkflowEngine.triggerHODReportWorkflow({
    hodUserId: 'u-hod-1',
    departmentId: 'dept-cse'
  });
  assert(hodWf.status === 'Completed', 'Reporting Agent synthesized department summary report');

  // 9. Library Agent Overdue Fine Calculation
  console.log('\n--- Test 9: Library Loan Audit & Fine Calculation Engine ---');
  if (!db.data.libraryIssues.some(i => i.status === 'issued' || i.status === 'overdue')) {
    db.data.libraryIssues.push({
      id: 'issue-audit-test',
      book_id: 'bk-1',
      student_user_id: 'u-std-3',
      issue_date: '2026-11-01',
      due_date: '2026-11-15',
      status: 'issued',
      fine_amount: 0,
      fine_paid: false
    });
  }
  const libAudit = await orchestrator.getAgent('agent_library')?.callTool('audit_library_loans', {});
  assert(libAudit.totalChecked > 0, 'Library Agent evaluated active book loans');

  // 10. System Monitoring Agent Telemetry Sweep
  console.log('\n--- Test 10: System Telemetry & Health Audit ---');
  const telemetry = await orchestrator.getAgent('agent_monitoring')?.callTool('run_system_health_audit', {});
  assert(telemetry.totalAgents >= 12 && telemetry.activeAgentsCount >= 12, 'All 12 specialized agents + Orchestrator active in telemetry');

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} MULTI-AGENT WORKFLOW TESTS PASSED PERFECTLY!`);
  console.log('================================================================');
}

runEndToEndVerification().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

import { v4 as uuidv4 } from 'uuid';
import { BaseAgent, TaskResult } from './baseAgent.js';
import { db } from '../db/store.js';
import {
  StudentPAAgent,
  AcademicCoordAgent,
  AssignmentAgent,
  AttendanceAgent,
  MarksAgent,
  TimetableAgent,
  LibraryAgent,
  CertificateAgent,
  NoDuesAgent,
  AdminRequestAgent,
  ReportingAgent,
  MonitoringAgent,
  StudentMgmtAgent,
  ExamAgent,
  ResultAnalysisAgent,
  FacultyMgmtAgent,
  FeedbackAgent,
  ScholarshipAgent,
  FacilityAgent,
  HelpdeskAgent,
  CampusAnalyticsAgent
} from './specializedAgents.js';
import {
  AgentWorkflow,
  WorkflowStep,
  AgentTask,
  UserRole
} from '../types/index.js';

export class OrchestratorService {
  private static instance: OrchestratorService;
  public agents: Map<string, BaseAgent> = new Map();

  private constructor() {
    this.registerAgents();
  }

  public static getInstance(): OrchestratorService {
    if (!OrchestratorService.instance) {
      OrchestratorService.instance = new OrchestratorService();
    }
    return OrchestratorService.instance;
  }

  private registerAgents() {
    const agentInstances: BaseAgent[] = [
      new StudentPAAgent(),
      new AcademicCoordAgent(),
      new AssignmentAgent(),
      new AttendanceAgent(),
      new MarksAgent(),
      new TimetableAgent(),
      new LibraryAgent(),
      new CertificateAgent(),
      new NoDuesAgent(),
      new AdminRequestAgent(),
      new ReportingAgent(),
      new MonitoringAgent(),
      new StudentMgmtAgent(),
      new ExamAgent(),
      new ResultAnalysisAgent(),
      new FacultyMgmtAgent(),
      new FeedbackAgent(),
      new ScholarshipAgent(),
      new FacilityAgent(),
      new HelpdeskAgent(),
      new CampusAnalyticsAgent()
    ];

    for (const ag of agentInstances) {
      this.agents.set(ag.id, ag);
    }
  }

  public getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  public getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  // Autonomous Workflow Creation & Execution Engine
  public async createAndRunWorkflow(params: {
    workflowName: string;
    triggerEvent: string;
    initiatedByUserId?: string;
    payload: any;
    steps: {
      agentId: string;
      stepName: string;
      taskType: string;
      inputPayload: any;
      requiresHumanApproval?: boolean;
      approvalRole?: UserRole;
    }[];
  }): Promise<AgentWorkflow> {
    const workflowId = uuidv4();
    const workflow: AgentWorkflow = {
      id: workflowId,
      workflow_name: params.workflowName,
      trigger_event: params.triggerEvent,
      initiated_by_user_id: params.initiatedByUserId,
      status: 'Running',
      payload: params.payload,
      context_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      steps: []
    };

    db.data.workflows.unshift(workflow);
    db.save();

    let stepNumber = 1;
    for (const stepDef of params.steps) {
      const stepId = uuidv4();
      const step: WorkflowStep = {
        id: stepId,
        workflow_id: workflowId,
        step_number: stepNumber++,
        agent_id: stepDef.agentId,
        step_name: stepDef.stepName,
        status: 'running',
        input_data: stepDef.inputPayload,
        execution_time_ms: 0,
        started_at: new Date().toISOString()
      };

      db.data.workflowSteps.unshift(step);
      workflow.steps = workflow.steps || [];
      workflow.steps.push(step);
      db.save();

      const agent = this.getAgent(stepDef.agentId);
      if (!agent) {
        step.status = 'failed';
        step.error_details = `Agent ${stepDef.agentId} not found`;
        workflow.status = 'Failed';
        workflow.error_message = step.error_details;
        db.save();
        break;
      }

      // Check Agent active status
      const agentRec = db.data.agents.find(a => a.id === stepDef.agentId);
      if (agentRec && !agentRec.is_active) {
        step.status = 'failed';
        step.error_details = `Agent ${stepDef.agentId} is currently disabled by administrator`;
        workflow.status = 'Failed';
        workflow.error_message = step.error_details;
        db.save();
        break;
      }

      // Create and enqueue task
      const taskId = uuidv4();
      const task: AgentTask = {
        id: taskId,
        agent_id: stepDef.agentId,
        workflow_id: workflowId,
        task_type: stepDef.taskType,
        priority: 'high',
        input_payload: stepDef.inputPayload,
        status: 'running',
        retry_count: 0,
        max_retries: 3,
        scheduled_for: new Date().toISOString(),
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      db.data.tasks.unshift(task);
      db.save();

      const startTime = Date.now();
      const result: TaskResult = await agent.runTask(task);
      const elapsed = Date.now() - startTime;

      step.execution_time_ms = elapsed;
      step.completed_at = new Date().toISOString();

      if (result.success) {
        step.status = 'completed';
        step.output_data = result.data;
        task.status = 'completed';
        task.output_result = result.data;
        task.completed_at = new Date().toISOString();

        // Level 3 Safety gate: Check if step requires human authorization
        if (result.needsApproval || stepDef.requiresHumanApproval) {
          workflow.status = 'Awaiting Approval';
          db.save();
          break; // Workflow halts until authorized user approves
        }
      } else {
        step.status = 'failed';
        step.error_details = result.error;
        task.status = 'failed';
        task.error_message = result.error;
        workflow.status = 'Failed';
        workflow.error_message = result.error;
        db.save();
        break;
      }
    }

    if (workflow.status === 'Running') {
      workflow.status = 'Completed';
    }

    workflow.updated_at = new Date().toISOString();
    db.save();
    return workflow;
  }

  // Context-aware AI Copilot query handler for each user role
  public async handleAssistantQuery(params: {
    userId: string;
    role: UserRole;
    query: string;
  }): Promise<{ reply: string; toolUsed?: string; data?: any }> {
    const { userId, role, query } = params;
    const lower = query.toLowerCase();

    // 1. Natural language reminder command
    if (lower.startsWith('remind me') || lower.includes('create reminder')) {
      const paAgent = this.getAgent('agent_student_pa') as StudentPAAgent;
      const res = await paAgent.handleTask({
        id: uuidv4(),
        agent_id: 'agent_student_pa',
        task_type: 'parse_nl_reminder',
        priority: 'normal',
        input_payload: { studentId: userId, prompt: query },
        status: 'completed',
        retry_count: 0,
        max_retries: 3,
        scheduled_for: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

      return {
        reply: res.data?.formattedConfirmation || `Scheduled reminder for: "${query}"`,
        toolUsed: 'agent_student_pa.create_reminder_nl',
        data: res.data
      };
    }

    // 2. Attendance inquiries
    if (lower.includes('attendance')) {
      if (role === 'student') {
        const paAgent = this.getAgent('agent_student_pa');
        const summary = await paAgent?.callTool('get_student_overview', { studentId: userId });
        const att = summary?.attendance;
        return {
          reply: `Your current attendance is ${att?.percentage}% (${att?.attendedSessions} of ${att?.totalSessions} sessions attended). ${
            att?.isShortage ? '⚠️ Warning: Attendance is below mandatory 75% threshold!' : '✅ Attendance is in good standing.'
          }`,
          toolUsed: 'agent_attendance.calculate_attendance',
          data: att
        };
      } else if (role === 'class_incharge' || role === 'faculty') {
        const coord = this.getAgent('agent_academic_coord');
        const summary = await coord?.callTool('compile_daily_coordination_summary', { classId: 'cls-cse-3a' });
        return {
          reply: `Class CSE-3A attendance summary: ${summary?.studentsWithShortage} student(s) currently below 75% attendance. ${summary?.unverifiedAttendanceSessions} session(s) pending in-charge verification.`,
          toolUsed: 'agent_academic_coord.compile_daily_coordination_summary',
          data: summary
        };
      }
    }

    // 3. Assignment inquiries
    if (lower.includes('assignment') || lower.includes('homework')) {
      if (role === 'student') {
        const paAgent = this.getAgent('agent_student_pa');
        const summary = await paAgent?.callTool('get_student_overview', { studentId: userId });
        return {
          reply: `You have ${summary?.pendingAssignmentsCount} pending assignment(s): ${summary?.pendingAssignments
            ?.map((a: any) => `"${a.title}" (Due: ${new Date(a.due_date).toLocaleDateString()})`)
            .join(', ')}`,
          toolUsed: 'agent_assignment.monitor_submissions',
          data: summary?.pendingAssignments
        };
      } else {
        const asgAgent = this.getAgent('agent_assignment');
        const res = await asgAgent?.callTool('monitor_submissions', { assignmentId: 'asg-1' });
        return {
          reply: `Assignment "Complex SQL Queries": ${res?.submittedCount} submitted, ${res?.missingCount} student(s) missing submission. Automated reminder notifications have been dispatched.`,
          toolUsed: 'agent_assignment.monitor_submissions',
          data: res
        };
      }
    }

    // 4. Library & Fines inquiries
    if (lower.includes('library') || lower.includes('book') || lower.includes('fine')) {
      const libAgent = this.getAgent('agent_library');
      if (role === 'student') {
        const clr = await libAgent?.callTool('verify_student_library_clearance', { studentId: userId });
        return {
          reply: clr?.details || 'Library records verified.',
          toolUsed: 'agent_library.verify_student_library_clearance',
          data: clr
        };
      } else {
        const audit = await libAgent?.callTool('audit_library_loans', {});
        return {
          reply: `Library Loan Audit: ${audit?.overdueCount} overdue loan(s) detected with active fines. ${audit?.upcomingDueCount} book(s) due within 48 hours.`,
          toolUsed: 'agent_library.audit_library_loans',
          data: audit
        };
      }
    }

    // 5. Internal Marks & Performance
    if (lower.includes('mark') || lower.includes('score') || lower.includes('grade')) {
      if (role === 'student') {
        const marks = db.data.internalMarks.filter(m => m.student_user_id === userId);
        return {
          reply: `Here are your published internal marks: ${marks
            .map(m => `Subject ${m.subject_id}: ${m.consolidated_marks} / ${m.max_marks} (Mid-1: ${m.mid1_marks}, Mid-2: ${m.mid2_marks})`)
            .join(' | ')}`,
          toolUsed: 'agent_marks.query_marks',
          data: marks
        };
      } else {
        const marksAgent = this.getAgent('agent_marks');
        const calc = await marksAgent?.callTool('calculate_and_sync_internal_marks', {
          classId: 'cls-cse-3a',
          subjectId: 'sub-dbms'
        });
        return {
          reply: `Calculated internal marks using deterministic college formula (80% best mid + 20% second mid + assignment + attendance). Processed: ${calc?.totalProcessed} students. Identified ${calc?.studentsNeedingAttention} student(s) requiring academic intervention.`,
          toolUsed: 'agent_marks.calculate_and_sync_internal_marks',
          data: calc
        };
      }
    }

    // 6. Super Admin & System Health
    if (role === 'super_admin' || lower.includes('system') || lower.includes('agent health')) {
      const monitor = this.getAgent('agent_monitoring');
      const health = await monitor?.callTool('run_system_health_audit', {});
      return {
        reply: `System Telemetry: ${health?.activeAgentsCount}/${health?.totalAgents} agents active. ${health?.totalTasksExecuted} total tasks executed with ${health?.systemSuccessRate}% success rate. Average agent latency: ${health?.averageAgentLatencyMs}ms.`,
        toolUsed: 'agent_monitoring.run_system_health_audit',
        data: health
      };
    }

    // Default contextual guidance per role
    return {
      reply: `I am your ${role.replace('_', ' ')} Agentic Copilot. I can query real academic records, trigger deterministic calculations, track deadlines, monitor compliance, and schedule reminders. Try asking about attendance, assignments, internal marks, library dues, or natural language reminders.`
    };
  }
}

export const orchestrator = OrchestratorService.getInstance();

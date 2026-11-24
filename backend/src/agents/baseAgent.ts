import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/store.js';
import {
  AIAgent,
  AgentTask,
  AgentToolCall,
  AgentExecutionLog,
  AutonomyLevel,
  EscalationRecord
} from '../types/index.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (args: any, context: { taskId?: string; agentId: string }) => Promise<any>;
}

export interface TaskPlan {
  steps: string[];
  toolsRequired: string[];
  estimatedDurationMs: number;
  requiresReviewOrApproval: boolean;
  approvalType?: string;
}

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
  needsReview?: boolean;
  reviewDetails?: any;
  needsApproval?: boolean;
  approvalDetails?: any;
}

export abstract class BaseAgent {
  public id: string;
  public name: string;
  public roleCategory: string;
  public description: string;
  public autonomyLevel: AutonomyLevel;
  public capabilities: string[];
  protected tools: Map<string, ToolDefinition> = new Map();

  constructor(
    id: string,
    name: string,
    roleCategory: string,
    description: string,
    autonomyLevel: AutonomyLevel,
    capabilities: string[]
  ) {
    this.id = id;
    this.name = name;
    this.roleCategory = roleCategory;
    this.description = description;
    this.autonomyLevel = autonomyLevel;
    this.capabilities = capabilities;
  }

  public registerTool(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  public getToolsList(): { name: string; description: string }[] {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description
    }));
  }

  public async callTool(toolName: string, args: any, taskId?: string): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" is not authorized or available for agent ${this.id}`);
    }

    const start = Date.now();
    let status: 'success' | 'error' = 'success';
    let response: any = null;

    try {
      response = await tool.execute(args, { taskId, agentId: this.id });
      return response;
    } catch (err: any) {
      status = 'error';
      response = { error: err.message };
      throw err;
    } finally {
      const elapsed = Date.now() - start;
      const toolCall: AgentToolCall = {
        id: uuidv4(),
        task_id: taskId || 'direct-call',
        agent_id: this.id,
        tool_name: toolName,
        arguments: args,
        response,
        status,
        execution_time_ms: elapsed,
        timestamp: new Date().toISOString()
      };
      db.data.toolCalls.unshift(toolCall);
      db.save();
    }
  }

  public logExecution(params: {
    taskId?: string;
    triggerEvent: string;
    logLevel?: 'info' | 'warn' | 'error' | 'audit';
    actionPerformed: string;
    inputReference?: string;
    executionResult: string;
    approvalReferenceId?: string;
    metadata?: any;
  }) {
    const log: AgentExecutionLog = {
      id: uuidv4(),
      agent_id: this.id,
      task_id: params.taskId,
      trigger_event: params.triggerEvent,
      log_level: params.logLevel || 'info',
      action_performed: params.actionPerformed,
      input_reference: params.inputReference,
      execution_result: params.executionResult,
      approval_reference_id: params.approvalReferenceId,
      metadata: params.metadata || {},
      timestamp: new Date().toISOString()
    };
    db.data.executionLogs.unshift(log);
    // Keep max 500 logs in memory
    if (db.data.executionLogs.length > 500) {
      db.data.executionLogs.pop();
    }
    db.save();
  }

  public async planTask(task: AgentTask): Promise<TaskPlan> {
    // Default heuristic planner
    return {
      steps: [`Execute ${task.task_type} via agent ${this.id}`, 'Verify result invariants'],
      toolsRequired: Array.from(this.tools.keys()),
      estimatedDurationMs: 250,
      requiresReviewOrApproval: this.autonomyLevel >= 2
    };
  }

  public async verifyResult(result: any, task: AgentTask): Promise<boolean> {
    if (!result) return false;
    if (result.success === false) return false;
    return true;
  }

  public async escalate(task: AgentTask, reason: string, severity: 'medium' | 'high' | 'critical' = 'high') {
    const escalation: EscalationRecord = {
      id: uuidv4(),
      agent_id: this.id,
      task_id: task.id,
      workflow_id: task.workflow_id,
      reason,
      severity,
      assigned_role: 'super_admin',
      resolution_status: 'open',
      created_at: new Date().toISOString()
    };
    db.data.escalations.unshift(escalation);
    this.logExecution({
      taskId: task.id,
      triggerEvent: 'task_escalation',
      logLevel: 'error',
      actionPerformed: `Escalated task ${task.id} due to: ${reason}`,
      executionResult: `Created escalation ticket ${escalation.id}`
    });
    db.save();
  }

  public updateAgentStats(success: boolean, elapsedMs: number) {
    const agent = db.data.agents.find(a => a.id === this.id);
    if (agent) {
      if (success) {
        agent.total_successful_tasks += 1;
      } else {
        agent.total_failed_tasks += 1;
      }
      agent.last_execution_at = new Date().toISOString();
      agent.average_execution_time_ms = Math.round(
        (agent.average_execution_time_ms * 0.8) + (elapsedMs * 0.2)
      );
      agent.current_status = 'idle';
      db.save();
    }
  }

  public abstract handleTask(task: AgentTask): Promise<TaskResult>;

  public async runTask(task: AgentTask): Promise<TaskResult> {
    const start = Date.now();
    const agentRec = db.data.agents.find(a => a.id === this.id);
    if (agentRec) {
      agentRec.current_status = 'running';
      agentRec.current_task_id = task.id;
    }

    try {
      // 1. Task planning
      const plan = await this.planTask(task);
      this.logExecution({
        taskId: task.id,
        triggerEvent: task.task_type,
        actionPerformed: `Planned task execution with ${plan.steps.length} steps. Tools required: ${plan.toolsRequired.join(', ')}`,
        executionResult: 'Plan created successfully'
      });

      // 2. Execution
      const result = await this.handleTask(task);

      // 3. Verification
      const verified = await this.verifyResult(result, task);
      if (!verified) {
        throw new Error(`Result verification failed for task ${task.id}: invariants not satisfied`);
      }

      const elapsed = Date.now() - start;
      this.updateAgentStats(true, elapsed);
      return result;
    } catch (err: any) {
      const elapsed = Date.now() - start;
      this.updateAgentStats(false, elapsed);

      this.logExecution({
        taskId: task.id,
        triggerEvent: task.task_type,
        logLevel: 'error',
        actionPerformed: `Error executing task: ${err.message}`,
        executionResult: 'Execution failed'
      });

      // Check retries
      if (task.retry_count < task.max_retries) {
        task.retry_count += 1;
        this.logExecution({
          taskId: task.id,
          triggerEvent: 'retry_attempt',
          logLevel: 'warn',
          actionPerformed: `Retrying task (attempt ${task.retry_count} of ${task.max_retries})`,
          executionResult: 'Retry scheduled'
        });
      } else {
        await this.escalate(task, `Exceeded maximum retries (${task.max_retries}). Last error: ${err.message}`);
      }

      return {
        success: false,
        error: err.message
      };
    }
  }
}

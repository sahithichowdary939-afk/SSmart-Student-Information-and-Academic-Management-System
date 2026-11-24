import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { orchestrator } from '../agents/orchestrator.js';
import { authenticateJWT, AuthenticatedRequest, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// GET /api/agents - List all 12 specialized agents + Orchestrator
router.get('/', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const agents = db.data.agents;
  return res.json({ agents });
});

// GET /api/agents/:id - Get specific agent details, tools, execution logs, and configuration
router.get('/:id', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const agentId = req.params.id;
  const agentRec = db.data.agents.find(a => a.id === agentId);
  if (!agentRec) {
    return res.status(404).json({ error: `Agent "${agentId}" not found` });
  }

  const agentInstance = orchestrator.getAgent(agentId);
  const tools = agentInstance ? agentInstance.getToolsList() : [];
  const config = db.data.agentConfigs.find(c => c.agent_id === agentId);
  const logs = db.data.executionLogs.filter(l => l.agent_id === agentId).slice(0, 50);
  const tasks = db.data.tasks.filter(t => t.agent_id === agentId).slice(0, 50);

  return res.json({
    agent: agentRec,
    tools,
    config,
    recentLogs: logs,
    recentTasks: tasks
  });
});

// PATCH /api/agents/:id - Super Admin: Enable/disable agent & configure execution rules
router.patch('/:id', authenticateJWT, authorizeRoles('super_admin'), (req: AuthenticatedRequest, res: Response) => {
  const agentId = req.params.id;
  const { isActive, autonomyLevel, config } = req.body;

  const agent = db.data.agents.find(a => a.id === agentId);
  if (!agent) {
    return res.status(404).json({ error: `Agent "${agentId}" not found` });
  }

  if (typeof isActive === 'boolean') {
    agent.is_active = isActive;
  }
  if (typeof autonomyLevel === 'number') {
    agent.autonomy_level = autonomyLevel as 1 | 2 | 3;
  }
  agent.updated_at = new Date().toISOString();

  if (config) {
    let agentConfig = db.data.agentConfigs.find(c => c.agent_id === agentId);
    if (!agentConfig) {
      agentConfig = {
        id: `cfg-${agentId}`,
        agent_id: agentId,
        execution_mode: 'auto',
        concurrency_limit: 5,
        timeout_seconds: 60,
        retry_policy: { max_retries: 3, backoff_ms: 2000 },
        notification_rules: { notify_on_failure: true, escalate_after_retries: 2 },
        updated_at: new Date().toISOString()
      };
      db.data.agentConfigs.push(agentConfig);
    }
    Object.assign(agentConfig, config, { updated_at: new Date().toISOString() });
  }

  db.save();

  // Log Super Admin action in execution log
  const orchestratorAgent = orchestrator.getAgent('orchestrator');
  orchestratorAgent?.logExecution({
    triggerEvent: 'agent_configuration_update',
    logLevel: 'audit',
    actionPerformed: `Super Admin updated agent ${agentId} status: active=${agent.is_active}, autonomy=${agent.autonomy_level}`,
    executionResult: 'Saved updated agent parameters'
  });

  return res.json({ message: 'Agent settings updated successfully', agent });
});

// GET /api/agents/logs/all - Telemetry, execution logs, and tool calls
router.get('/logs/all', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const limit = Number(req.query.limit) || 100;
  const agentId = req.query.agentId as string;

  let logs = db.data.executionLogs;
  if (agentId) {
    logs = logs.filter(l => l.agent_id === agentId);
  }

  let toolCalls = db.data.toolCalls;
  if (agentId) {
    toolCalls = toolCalls.filter(tc => tc.agent_id === agentId);
  }

  return res.json({
    logs: logs.slice(0, limit),
    toolCalls: toolCalls.slice(0, limit),
    escalations: db.data.escalations
  });
});

// GET /api/agents/tasks/queue - Task queue overview
router.get('/tasks/queue', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const status = req.query.status as string;
  let tasks = db.data.tasks;
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  return res.json({ tasks: tasks.slice(0, 100) });
});

// POST /api/agents/tasks/:id/retry - Super Admin manual retry of failed task
router.post('/tasks/:id/retry', authenticateJWT, authorizeRoles('super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.id;
  const task = db.data.tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const agent = orchestrator.getAgent(task.agent_id);
  if (!agent) {
    return res.status(400).json({ error: `Agent ${task.agent_id} not available` });
  }

  task.status = 'running';
  task.retry_count += 1;
  task.started_at = new Date().toISOString();
  db.save();

  try {
    const result = await agent.runTask(task);
    if (result.success) {
      task.status = 'completed';
      task.output_result = result.data;
      task.completed_at = new Date().toISOString();
    } else {
      task.status = 'failed';
      task.error_message = result.error;
    }
    db.save();

    return res.json({ message: 'Task execution completed', task, result });
  } catch (err: any) {
    task.status = 'failed';
    task.error_message = err.message;
    db.save();
    return res.status(500).json({ error: err.message, task });
  }
});

// POST /api/agents/chat - Role-aware context Assistant query
router.post('/chat', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const response = await orchestrator.handleAssistantQuery({
      userId: req.user!.id,
      role: req.user!.role,
      query
    });

    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

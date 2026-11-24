import { db } from '../db/store.js';
import { orchestrator } from '../agents/orchestrator.js';
import { AgentTools } from './agentTools.js';

export class BackgroundScheduler {
  private static intervalTimer: NodeJS.Timeout | null = null;

  public static start(intervalMs: number = 30000) {
    if (this.intervalTimer) return;

    console.log(`[BackgroundScheduler] Autonomous Agent Engine started. Polling every ${intervalMs / 1000}s...`);

    this.intervalTimer = setInterval(async () => {
      try {
        await this.runTick();
      } catch (err) {
        console.error('[BackgroundScheduler] Error during autonomous tick:', err);
      }
    }, intervalMs);
  }

  public static stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public static async runTick() {
    const now = new Date();

    // 1. Check Student Reminders (Trigger if remind_at <= now and status == 'pending')
    const pendingReminders = db.data.reminders.filter(
      r => r.status === 'pending' && new Date(r.remind_at) <= now
    );

    for (const rem of pendingReminders) {
      rem.status = 'triggered';
      AgentTools.dispatchNotification({
        recipientUserId: rem.user_id,
        senderAgentId: 'agent_student_pa',
        title: `Reminder: ${rem.title}`,
        message: rem.description || rem.title,
        priority: 'high',
        linkUrl: '/student/reminders'
      });

      const pa = orchestrator.getAgent('agent_student_pa');
      pa?.logExecution({
        triggerEvent: 'scheduled_reminder_dispatched',
        actionPerformed: `Autonomous reminder "${rem.title}" delivered to user ${rem.user_id}`,
        executionResult: 'Dispatched alert'
      });
    }

    // 2. Library Agent audit loans (overdue & upcoming due dates)
    const libAgent = orchestrator.getAgent('agent_library');
    if (libAgent) {
      const activeLib = db.data.agents.find(a => a.id === 'agent_library');
      if (activeLib && activeLib.is_active) {
        await libAgent.callTool('audit_library_loans', {});
      }
    }

    // 3. System Monitoring sweep
    const monAgent = orchestrator.getAgent('agent_monitoring');
    if (monAgent) {
      const activeMon = db.data.agents.find(a => a.id === 'agent_monitoring');
      if (activeMon && activeMon.is_active) {
        await monAgent.callTool('run_system_health_audit', {});
      }
    }

    db.save();
  }
}

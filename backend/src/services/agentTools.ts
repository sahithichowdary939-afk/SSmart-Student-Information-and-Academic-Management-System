import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/store.js';
import {
  AgentNotification,
  Reminder,
  WorkflowApproval,
  UserRole
} from '../types/index.js';

export class AgentTools {
  // Deterministic Attendance Calculation
  public static calculateAttendance(studentId: string, subjectId?: string, classId?: string) {
    let sessions = db.data.attendanceSessions;
    if (classId) {
      sessions = sessions.filter(s => s.class_id === classId);
    }
    if (subjectId) {
      sessions = sessions.filter(s => s.subject_id === subjectId);
    }

    const sessionIds = new Set(sessions.map(s => s.id));
    const records = db.data.attendanceRecords.filter(
      r => r.student_user_id === studentId && sessionIds.has(r.session_id)
    );

    const totalSessions = sessions.length;
    const attended = records.filter(r => r.status === 'present').length;
    const percentage = totalSessions > 0 ? Number(((attended / totalSessions) * 100).toFixed(1)) : 100;
    const isShortage = percentage < 75.0;

    return {
      studentId,
      subjectId,
      classId,
      totalSessions,
      attendedSessions: attended,
      absentSessions: totalSessions - attended,
      percentage,
      isShortage,
      requiredMinimum: 75.0
    };
  }

  // Deterministic College Internal Marks Calculation Engine
  // College Formula: 80% weight on best mid-exam + 20% on second mid-exam + Assignment Marks (max 10) + Attendance Marks (max 5)
  // Scaled deterministically to max internal marks (typically 30)
  public static calculateInternalMarks(mid1: number, mid2: number, assignmentMarks: number, attendanceMarks: number) {
    const bestMid = Math.max(mid1, mid2);
    const otherMid = Math.min(mid1, mid2);
    const weightedMid = (0.8 * bestMid) + (0.2 * otherMid);
    // Scaled mid component out of 15 + assignment out of 10 + attendance out of 5 = 30 max
    const scaledMid = Number(((weightedMid / 30) * 15).toFixed(2));
    const finalScore = Number((scaledMid + assignmentMarks + attendanceMarks).toFixed(1));
    const requiresAttention = finalScore < 15.0; // Less than 50% internal threshold

    return {
      mid1,
      mid2,
      bestMid,
      otherMid,
      weightedMidScore: weightedMid,
      scaledMidScore15: scaledMid,
      assignmentMarks,
      attendanceMarks,
      consolidatedScore: finalScore,
      maxMarks: 30,
      requiresAcademicAttention: requiresAttention
    };
  }

  // Deterministic Library Fine Calculation
  public static calculateLibraryFine(issueId: string, returnDate?: string) {
    const issue = db.data.libraryIssues.find(i => i.id === issueId);
    if (!issue) throw new Error(`Library issue record ${issueId} not found`);

    const effectiveDate = returnDate ? new Date(returnDate) : new Date();
    const dueDate = new Date(issue.due_date);
    const diffTime = effectiveDate.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let fine = 0;
    let isOverdue = false;

    if (diffDays > 0) {
      isOverdue = true;
      fine = diffDays * 5.0; // Rs. 5 per day standard rate
    }

    return {
      issueId,
      bookId: issue.book_id,
      studentId: issue.student_user_id,
      dueDate: issue.due_date,
      isOverdue,
      daysOverdue: Math.max(0, diffDays),
      ratePerDay: 5.0,
      fineAmount: fine,
      finePaid: issue.fine_paid
    };
  }

  // Dispatch In-App Notification
  public static dispatchNotification(params: {
    recipientUserId: string;
    senderAgentId: string;
    title: string;
    message: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    linkUrl?: string;
  }) {
    const notif: AgentNotification = {
      id: uuidv4(),
      recipient_user_id: params.recipientUserId,
      sender_agent_id: params.senderAgentId,
      title: params.title,
      message: params.message,
      priority: params.priority || 'normal',
      link_url: params.linkUrl,
      is_read: false,
      created_at: new Date().toISOString()
    };
    db.data.notifications.unshift(notif);
    db.save();
    return notif;
  }

  // Natural Language Reminder Parser
  public static parseNaturalLanguageReminder(userId: string, prompt: string, attachmentData?: string) {
    const lower = prompt.toLowerCase();
    let title = 'Student Academic Reminder';
    let targetDate = new Date();

    // Heuristics for natural language extraction
    // Example: "Remind me to complete my DBMS assignment tomorrow at 6 PM"
    const remindMeMatch = prompt.match(/remind me to (.*?) (tomorrow|today|on|at|by)/i) ||
                          prompt.match(/remind me (.*)/i);

    if (remindMeMatch && remindMeMatch[1]) {
      title = remindMeMatch[1].trim();
      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1);
    } else {
      title = prompt;
    }

    if (lower.includes('tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // Parse time like "6 pm", "18:00", "9 am"
    const timeMatch = lower.match(/(\d{1,2})(:\d{2})?\s*(am|pm)/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const isPm = timeMatch[3] === 'pm';
      if (isPm && hours < 12) hours += 12;
      if (!isPm && hours === 12) hours = 0;
      targetDate.setHours(hours, 0, 0, 0);
    } else {
      // Default to 18:00 if not specified
      targetDate.setHours(18, 0, 0, 0);
    }

    const reminder: Reminder = {
      id: uuidv4(),
      user_id: userId,
      title,
      description: `Created via autonomous Natural Language Agent command: "${prompt}"`,
      remind_at: targetDate.toISOString(),
      status: 'pending',
      created_via_nl: true,
      original_prompt: prompt,
      attachment_data: attachmentData,
      created_at: new Date().toISOString()
    };

    db.data.reminders.unshift(reminder);
    db.save();

    return {
      reminder,
      parsedTitle: title,
      parsedDate: targetDate.toISOString(),
      formattedConfirmation: `Confirmed! I've scheduled your reminder for "${title}" on ${targetDate.toLocaleDateString()} at ${targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    };
  }

  // Request Human Authorization (Level 3 or Level 2 Review)
  public static requestApproval(params: {
    workflowId: string;
    stepId?: string;
    requiredRole: UserRole;
    actionType: 'publish_marks' | 'correct_attendance' | 'issue_certificate' | 'approve_financial' | 'finalize_no_dues';
    description: string;
    dataSnapshot: any;
    assignedUserId?: string;
  }) {
    const approval: WorkflowApproval = {
      id: uuidv4(),
      workflow_id: params.workflowId,
      step_id: params.stepId,
      required_role: params.requiredRole,
      assigned_user_id: params.assignedUserId,
      action_type: params.actionType,
      description: params.description,
      data_snapshot: params.dataSnapshot,
      status: 'pending',
      requested_at: new Date().toISOString()
    };

    db.data.workflowApprovals.unshift(approval);
    db.save();

    // Also notify candidates of that role
    const candidates = db.data.users.filter(u => u.role === params.requiredRole && u.is_active);
    candidates.forEach(user => {
      this.dispatchNotification({
        recipientUserId: user.id,
        senderAgentId: 'orchestrator',
        title: `Authorization Required: ${params.actionType.replace('_', ' ').toUpperCase()}`,
        message: params.description,
        priority: 'high',
        linkUrl: `/approvals`
      });
    });

    return approval;
  }
}

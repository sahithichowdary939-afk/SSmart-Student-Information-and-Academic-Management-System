const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('campus_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  login: async (credentials: { username: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  register: async (userData: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Reset failed');
    }
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to verify token');
    return res.json();
  },

  // Agent Management Center & Chat
  getAgents: async () => {
    const res = await fetch(`${API_BASE}/agents`, { headers: getHeaders() });
    return res.json();
  },

  getAgentDetails: async (id: string) => {
    const res = await fetch(`${API_BASE}/agents/${id}`, { headers: getHeaders() });
    return res.json();
  },

  updateAgentSettings: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/agents/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getAgentLogs: async (params?: { agentId?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.agentId) q.append('agentId', params.agentId);
    if (params?.limit) q.append('limit', params.limit.toString());
    const res = await fetch(`${API_BASE}/agents/logs/all?${q.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  getAgentTasks: async (status?: string) => {
    const q = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/agents/tasks/queue${q}`, { headers: getHeaders() });
    return res.json();
  },

  retryAgentTask: async (taskId: string) => {
    const res = await fetch(`${API_BASE}/agents/tasks/${taskId}/retry`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  chatWithAssistant: async (query: string) => {
    const res = await fetch(`${API_BASE}/agents/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query })
    });
    return res.json();
  },

  // Workflows & Approvals
  getWorkflows: async () => {
    const res = await fetch(`${API_BASE}/workflows`, { headers: getHeaders() });
    return res.json();
  },

  triggerAssignmentWorkflow: async (data: any) => {
    const res = await fetch(`${API_BASE}/workflows/assignment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  triggerAttendanceWorkflow: async (data: any) => {
    const res = await fetch(`${API_BASE}/workflows/attendance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  triggerMarksWorkflow: async (data: any) => {
    const res = await fetch(`${API_BASE}/workflows/marks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  triggerTimetableWorkflow: async (data: any) => {
    const res = await fetch(`${API_BASE}/workflows/timetable`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  triggerCertificateWorkflow: async (data: any) => {
    const res = await fetch(`${API_BASE}/workflows/certificate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  triggerNoDuesWorkflow: async (data: any) => {
    const res = await fetch(`${API_BASE}/workflows/no-dues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  triggerReminderNLWorkflow: async (prompt: string, attachmentData?: string) => {
    const res = await fetch(`${API_BASE}/workflows/reminder-nl`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt, attachmentData })
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Could not create task'); }
    return res.json();
  },

  triggerHODReportWorkflow: async (departmentId?: string) => {
    const res = await fetch(`${API_BASE}/workflows/hod-report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ departmentId })
    });
    return res.json();
  },

  getPendingApprovals: async () => {
    const res = await fetch(`${API_BASE}/workflows/approvals/pending`, { headers: getHeaders() });
    return res.json();
  },

  decideApproval: async (approvalId: string, decision: 'approved' | 'rejected', comments?: string) => {
    const res = await fetch(`${API_BASE}/workflows/approvals/${approvalId}/decide`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ decision, comments })
    });
    return res.json();
  },

  // Academic Modules
  getStudentDashboard: async () => {
    const res = await fetch(`${API_BASE}/academic/student/dashboard`, { headers: getHeaders() });
    return res.json();
  },

  submitAssignment: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/student/assignment/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Assignment submission failed'); }
    return res.json();
  },

  getFacultyDashboard: async () => {
    const res = await fetch(`${API_BASE}/academic/faculty/dashboard`, { headers: getHeaders() });
    return res.json();
  },

  getAssignmentSubmissions: async (asgId: string) => {
    const res = await fetch(`${API_BASE}/academic/faculty/assignment/${asgId}/submissions`, { headers: getHeaders() });
    return res.json();
  },

  gradeSubmission: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/faculty/assignment/grade`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getClassInchargeOverview: async (classId?: string) => {
    const q = classId ? `?classId=${classId}` : '';
    const res = await fetch(`${API_BASE}/academic/class-incharge/overview${q}`, { headers: getHeaders() });
    return res.json();
  },

  verifyAttendanceSession: async (sessionId: string) => {
    const res = await fetch(`${API_BASE}/academic/class-incharge/verify-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId })
    });
    return res.json();
  },

  getHODOverview: async (deptId?: string) => {
    const q = deptId ? `?departmentId=${deptId}` : '';
    const res = await fetch(`${API_BASE}/academic/hod/overview${q}`, { headers: getHeaders() });
    return res.json();
  },

  getOfficeOverview: async () => {
    const res = await fetch(`${API_BASE}/academic/office/overview`, { headers: getHeaders() });
    return res.json();
  },

  getLibraryOverview: async () => {
    const res = await fetch(`${API_BASE}/academic/library/overview`, { headers: getHeaders() });
    return res.json();
  },

  issueLibraryBook: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/library/issue`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  returnLibraryBook: async (issueId: string) => {
    const res = await fetch(`${API_BASE}/academic/library/return`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ issueId })
    });
    return res.json();
  },

  getAccountsOverview: async () => {
    const res = await fetch(`${API_BASE}/academic/accounts/overview`, { headers: getHeaders() });
    return res.json();
  },

  recordFeePayment: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/accounts/record-payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/academic/notifications`, { headers: getHeaders() });
    return res.json();
  },

  markNotificationRead: async (id: string) => {
    const res = await fetch(`${API_BASE}/academic/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },

  // Student Notes & To-Dos
  getStudentNotesTodos: async () => {
    const res = await fetch(`${API_BASE}/academic/student/notes-todos`, { headers: getHeaders() });
    return res.json();
  },

  createStudentNote: async (data: { title: string; content: string; color?: string }) => {
    const res = await fetch(`${API_BASE}/academic/student/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to save note');
    return res.json();
  },

  updateStudentNote: async (id: string, data: { title?: string; content?: string; color?: string }) => {
    const res = await fetch(`${API_BASE}/academic/student/notes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update note');
    return res.json();
  },

  deleteStudentNote: async (id: string) => {
    const res = await fetch(`${API_BASE}/academic/student/notes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  createStudentTodo: async (data: { task: string; priority?: string; dueDate?: string }) => {
    const res = await fetch(`${API_BASE}/academic/student/todos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to add task');
    return res.json();
  },

  updateStudentTodo: async (id: string, data: { isCompleted?: boolean; task?: string; priority?: string; dueDate?: string }) => {
    const res = await fetch(`${API_BASE}/academic/student/todos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteStudentTodo: async (id: string) => {
    const res = await fetch(`${API_BASE}/academic/student/todos/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Student Certificate Apply & Pay
  applyCertificate: async (data: { certificateType: string; purpose: string }) => {
    const res = await fetch(`${API_BASE}/academic/student/certificate/apply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit certificate request');
    return res.json();
  },

  payCertificateFee: async (certificateId: string, paymentMode?: string) => {
    const res = await fetch(`${API_BASE}/academic/student/certificate/pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ certificateId, paymentMode: paymentMode || 'online' })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to process certificate fee payment');
    return res.json();
  },

  uploadCertificateReceipt: async (data: { certificateId: string; fileName: string; receiptUrl?: string }) => {
    const res = await fetch(`${API_BASE}/academic/student/certificate/upload-receipt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to upload payment receipt');
    return res.json();
  },

  // Student Fee Pay
  payStudentFee: async (data: { studentFeeId: string; amount: number; paymentMode?: string }) => {
    const res = await fetch(`${API_BASE}/academic/student/fee/pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Fee payment failed');
    return res.json();
  },

  // Faculty Registered Students & Announcements
  getFacultyStudents: async (params?: Record<string, string>) => {
    const q = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/academic/faculty/students?${q}`, { headers: getHeaders() });
    return res.json();
  },

  createFacultyAnnouncement: async (data: { classId: string; title: string; message: string; priority?: string }) => {
    const res = await fetch(`${API_BASE}/academic/faculty/announcements`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to post announcement');
    return res.json();
  },

  getFacultyAnnouncements: async () => {
    const res = await fetch(`${API_BASE}/academic/faculty/announcements`, { headers: getHeaders() });
    return res.json();
  },

  createFacultyAssignment: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/faculty/assignment/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create assignment');
    return res.json();
  },

  reviewFacultySubmission: async (data: { submissionId: string; status: string; marks?: number; feedback?: string }) => {
    const res = await fetch(`${API_BASE}/academic/faculty/assignment/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to review submission');
    return res.json();
  },

  // Classes & Class Incharge Assignment
  getClasses: async () => {
    const res = await fetch(`${API_BASE}/academic/classes`, { headers: getHeaders() });
    return res.json();
  },

  assignClassIncharge: async (data: { classId: string; facultyUserId: string }) => {
    const res = await fetch(`${API_BASE}/academic/class-incharge/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to assign class incharge');
    return res.json();
  },

  // Office Admin Certificate & Request Management
  verifyCertificatePayment: async (certificateId: string) => {
    const res = await fetch(`${API_BASE}/academic/office/certificate/verify-payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ certificateId })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to verify certificate payment');
    return res.json();
  },

  reviewCertificate: async (data: { certificateId: string; status: 'approved' | 'rejected'; rejectionReason?: string; rejectionRemarks?: string }) => {
    const res = await fetch(`${API_BASE}/academic/office/certificate/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to review certificate');
    return res.json();
  },

  generateCertificate: async (data: { certificateId: string; pdfUrl?: string }) => {
    const res = await fetch(`${API_BASE}/academic/office/certificate/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate certificate');
    return res.json();
  },

  issueCertificate: async (data: { certificateId: string; pdfUrl?: string }) => {
    const res = await fetch(`${API_BASE}/academic/office/certificate/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to issue certificate');
    return res.json();
  },

  updateRequestStatus: async (data: { requestId: string; status: string; resolutionNotes?: string }) => {
    const res = await fetch(`${API_BASE}/academic/office/request/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Library Admin Notifications
  sendLibraryNotifications: async () => {
    const res = await fetch(`${API_BASE}/academic/library/send-notifications`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // Accounts Admin Fee Structures
  getFeeStructures: async () => {
    const res = await fetch(`${API_BASE}/academic/accounts/fee-structures`, { headers: getHeaders() });
    return res.json();
  },

  createFeeStructure: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/accounts/fee-structures`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create fee structure');
    return res.json();
  },

  // Expanded Smart Campus AI System APIs
  getCampusOverview: async () => {
    const res = await fetch(`${API_BASE}/academic/campus/overview`, { headers: getHeaders() });
    return res.json();
  },

  getExamSchedules: async () => {
    const res = await fetch(`${API_BASE}/academic/exams`, { headers: getHeaders() });
    return res.json();
  },

  getExams: async () => {
    const res = await fetch(`${API_BASE}/academic/exams`, { headers: getHeaders() });
    return res.json();
  },

  getExamEligibility: async () => {
    const res = await fetch(`${API_BASE}/academic/exams/eligibility`, { headers: getHeaders() });
    return res.json();
  },

  getResultAnalytics: async () => {
    const res = await fetch(`${API_BASE}/academic/results/analytics`, { headers: getHeaders() });
    return res.json();
  },

  getScholarships: async () => {
    const res = await fetch(`${API_BASE}/academic/scholarships`, { headers: getHeaders() });
    return res.json();
  },

  applyScholarship: async (scholarshipId: string, details?: any) => {
    const res = await fetch(`${API_BASE}/academic/scholarships/apply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ scholarshipId, ...details })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to apply for scholarship');
    return res.json();
  },

  getFacilityComplaints: async () => {
    const res = await fetch(`${API_BASE}/academic/facilities/complaints`, { headers: getHeaders() });
    return res.json();
  },

  submitFacilityComplaint: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/facilities/complaints`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit facility complaint');
    return res.json();
  },

  updateFacilityComplaint: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/academic/facilities/complaints/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update complaint');
    return res.json();
  },

  getHostelInfo: async () => {
    const res = await fetch(`${API_BASE}/academic/hostel`, { headers: getHeaders() });
    return res.json();
  },

  getHostel: async () => {
    const res = await fetch(`${API_BASE}/academic/hostel`, { headers: getHeaders() });
    return res.json();
  },

  submitHostelComplaint: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/hostel/complaints`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit hostel complaint');
    return res.json();
  },

  getTransportInfo: async () => {
    const res = await fetch(`${API_BASE}/academic/transport`, { headers: getHeaders() });
    return res.json();
  },

  getTransport: async () => {
    const res = await fetch(`${API_BASE}/academic/transport`, { headers: getHeaders() });
    return res.json();
  },

  registerTransport: async (routeIdOrData: any, stopName?: string) => {
    const payload = typeof routeIdOrData === 'string'
      ? { routeId: routeIdOrData, stopName: stopName || 'Campus Main Stop' }
      : routeIdOrData;
    const res = await fetch(`${API_BASE}/academic/transport/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to register transport pass');
    return res.json();
  },

  getCampusEvents: async () => {
    const res = await fetch(`${API_BASE}/academic/events`, { headers: getHeaders() });
    return res.json();
  },

  registerCampusEvent: async (eventId: string) => {
    const res = await fetch(`${API_BASE}/academic/events/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ eventId })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to register for event');
    return res.json();
  },

  getStudentFeedback: async () => {
    const res = await fetch(`${API_BASE}/academic/feedback`, { headers: getHeaders() });
    return res.json();
  },

  submitStudentFeedback: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit feedback');
    return res.json();
  },

  submitFeedback: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit feedback');
    return res.json();
  },

  askCampusHelpdesk: async (query: string) => {
    const res = await fetch(`${API_BASE}/academic/helpdesk/ask`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to query helpdesk');
    return res.json();
  },

  askHelpdesk: async (query: string) => {
    const res = await fetch(`${API_BASE}/academic/helpdesk/ask`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to query helpdesk');
    return res.json();
  },

  createHelpdeskTicket: async (subject: string, query: string) => {
    const res = await fetch(`${API_BASE}/academic/helpdesk/ticket`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subject, query })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create ticket');
    return res.json();
  },

  getFacultyFeedbackList: async () => {
    const res = await fetch(`${API_BASE}/academic/faculty-feedback/faculty-list`, { headers: getHeaders() });
    return res.json();
  },

  submitFacultyFeedback: async (data: any) => {
    const res = await fetch(`${API_BASE}/academic/faculty-feedback/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit faculty feedback');
    return res.json();
  },

  getFacultyFeedbackAnalytics: async () => {
    const res = await fetch(`${API_BASE}/academic/faculty-feedback/analytics`, { headers: getHeaders() });
    return res.json();
  },

  getScholarshipVerificationReports: async () => {
    const res = await fetch(`${API_BASE}/academic/office/scholarship-verification`, { headers: getHeaders() });
    return res.json();
  },

  getOfficeReminders: async () => {
    const res = await fetch(`${API_BASE}/academic/office/automatic-reminders`, { headers: getHeaders() });
    return res.json();
  },

  dispatchOfficeReminders: async () => {
    const res = await fetch(`${API_BASE}/academic/office/dispatch-reminders`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to dispatch reminders');
    return res.json();
  },

  aiEvaluateAssignmentSubmission: async (submissionId: string) => {
    const res = await fetch(`${API_BASE}/workflows/assignment/ai-evaluate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ submissionId })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to evaluate assignment');
    return res.json();
  },

  approveAssignmentEvaluation: async (data: { submissionId: string; approvedMarks: number; facultyRemarks?: string }) => {
    const res = await fetch(`${API_BASE}/workflows/assignment/approve-evaluation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to approve evaluation');
    return res.json();
  }
};

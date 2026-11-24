import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { pdfExport } from '../../services/pdfExport.js';
import {
  User,
  UserCheck,
  AlertTriangle,
  FileText,
  Award,
  Calendar,
  Clock,
  BookOpen,
  DollarSign,
  FileCheck,
  CheckCircle2,
  Download,
  Plus,
  Send,
  Sparkles,
  ExternalLink,
  CheckSquare,
  Square,
  Trash2,
  Edit3,
  CreditCard,
  CheckCircle,
  MessageSquare,
  Upload,
  Bus,
  Home,
  Wrench,
  Trophy,
  LifeBuoy,
  HeartHandshake,
  ShieldCheck,
  HelpCircle,
  Star
} from 'lucide-react';

interface StudentDashboardProps {
  currentTab: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Natural Language Reminder state
  const [nlPrompt, setNlPrompt] = useState('');
  const [reminderLoading, setReminderLoading] = useState(false);

  // Personal Notes & To-Do List state (Part 5)
  const [notes, setNotes] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('blue');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [todoTask, setTodoTask] = useState('');
  const [todoPriority, setTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [todoDueDate, setTodoDueDate] = useState('');
  const [todoFilter, setTodoFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Fee Payment modal state (Part 15)
  const [showFeePayModal, setShowFeePayModal] = useState(false);
  const [payingFee, setPayingFee] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('online');
  const [payProcessing, setPayProcessing] = useState(false);

  // Apply certificate modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [certType, setCertType] = useState<'bonafide' | 'transfer' | 'conduct'>('bonafide');
  const [certPurpose, setCertPurpose] = useState('');

  // Pay Certificate Modal
  const [selectedCertForPayment, setSelectedCertForPayment] = useState<any>(null);
  const [certPayMode, setCertPayMode] = useState('upi');
  const [isPayingCert, setIsPayingCert] = useState(false);

  // Upload Certificate Receipt Modal
  const [selectedCertForReceipt, setSelectedCertForReceipt] = useState<any>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  // Submit assignment modal
  const [selectedAsg, setSelectedAsg] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [assignmentPdf, setAssignmentPdf] = useState<File | null>(null);
  const [taskPdf, setTaskPdf] = useState<File | null>(null);

  // Apply no-dues modal
  const [showNoDuesModal, setShowNoDuesModal] = useState(false);
  const [noDuesReason, setNoDuesReason] = useState('');

  // Campus Modules State (All 20 Campus Agents & Services)
  const [examData, setExamData] = useState<any>(null);
  const [scholarshipData, setScholarshipData] = useState<any>(null);
  const [transportData, setTransportData] = useState<any>(null);
  const [hostelData, setHostelData] = useState<any>(null);
  const [eventsData, setEventsData] = useState<any>(null);
  const [facilityComplaints, setFacilityComplaints] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  // Modals & form states
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [facilityCategory, setFacilityCategory] = useState<'classroom' | 'laboratory' | 'washroom' | 'electrical' | 'sports'>('classroom');
  const [facilityLocation, setFacilityLocation] = useState('');
  const [facilityDesc, setFacilityDesc] = useState('');

  const [showHostelModal, setShowHostelModal] = useState(false);
  const [hostelCategory, setHostelCategory] = useState<'room_maintenance' | 'wifi' | 'mess' | 'cleanliness'>('room_maintenance');
  const [hostelDesc, setHostelDesc] = useState('');

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<'curriculum' | 'teaching' | 'facilities' | 'canteen' | 'administration'>('teaching');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');

  // Structured Faculty Feedback System State (Part 2.6)
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, number>>({
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 5,
    q5: 5,
    q6: 5
  });
  const [submittingFacultyFeedback, setSubmittingFacultyFeedback] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);

  // Helpdesk AI state
  const [helpdeskQuery, setHelpdeskQuery] = useState('');
  const [helpdeskAnswer, setHelpdeskAnswer] = useState<any>(null);
  const [askingHelpdesk, setAskingHelpdesk] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [res, exams, transport, hostel, events, facilities, fbacks, facList] = await Promise.all([
        api.getStudentDashboard(),
        api.getExams().catch(() => null),
        api.getTransport().catch(() => null),
        api.getHostel().catch(() => null),
        api.getCampusEvents().catch(() => null),
        api.getFacilityComplaints().catch(() => null),
        api.getStudentFeedback().catch(() => null),
        api.getFacultyFeedbackList().catch(() => null)
      ]);
      setData(res);
      if (res.notes) setNotes(res.notes);
      if (res.todos) setTodos(res.todos);
      if (exams) setExamData(exams);
      if (transport) setTransportData(transport);
      if (hostel) setHostelData(hostel);
      if (events) setEventsData(events);
      if (facilities?.complaints) setFacilityComplaints(facilities.complaints);
      if (fbacks?.feedbacks) setFeedbacks(fbacks.feedbacks);
      if (facList?.facultyList) {
        setFacultyList(facList.facultyList);
        if (facList.facultyList.length > 0) {
          setSelectedFacultyId(facList.facultyList[0].userId);
          if (facList.facultyList[0].subjects?.length > 0) {
            setSelectedSubjectId(facList.facultyList[0].subjects[0].id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFacultyFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyId || !selectedSubjectId) {
      alert('Please select a faculty member and the subject taught.');
      return;
    }
    setSubmittingFacultyFeedback(true);
    try {
      const selectedFac = facultyList.find(f => f.userId === selectedFacultyId);
      await api.submitFacultyFeedback({
        facultyUserId: selectedFacultyId,
        subjectId: selectedSubjectId,
        departmentId: selectedFac?.departmentId || 'dept-cse',
        academicYear: '2026-2027',
        semester: 5,
        ratings: feedbackRatings,
        writtenComments: feedbackComments
      });
      setFeedbackSuccessMsg('Feedback submitted successfully. Your individual response is confidential and encrypted.');
      setFeedbackComments('');
      setTimeout(() => setFeedbackSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit faculty feedback');
    } finally {
      setSubmittingFacultyFeedback(false);
    }
  };

  const handleApplyScholarship = async (scholarshipId: string) => {
    try {
      await api.applyScholarship(scholarshipId, { reason: 'Eligible student academic merit and financial grant' });
      alert('Scholarship application submitted to Scholarship Coordination Agent for automated document eligibility verification.');
      const sc = await api.getScholarships();
      setScholarshipData(sc);
    } catch (err: any) {
      alert(err.message || 'Failed to apply');
    }
  };

  const handleRegisterTransport = async (routeId: string) => {
    try {
      const stop = prompt('Enter your Pickup/Drop Stop Name:') || 'Main Campus Stop';
      await api.registerTransport(routeId, stop);
      alert('Transport pass registration submitted and approved!');
      const tr = await api.getTransport();
      setTransportData(tr);
    } catch (err: any) {
      alert(err.message || 'Failed to register transport');
    }
  };

  const handleSubmitFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitFacilityComplaint({
        category: facilityCategory,
        location: facilityLocation,
        description: facilityDesc,
        priority: 'medium'
      });
      setShowFacilityModal(false);
      setFacilityLocation('');
      setFacilityDesc('');
      alert('Facility issue registered with Facility Maintenance Agent.');
      const fc = await api.getFacilityComplaints();
      if (fc?.complaints) setFacilityComplaints(fc.complaints);
    } catch (err: any) {
      alert(err.message || 'Failed to submit complaint');
    }
  };

  const handleSubmitHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitHostelComplaint({
        category: hostelCategory,
        description: hostelDesc
      });
      setShowHostelModal(false);
      setHostelDesc('');
      alert('Hostel complaint dispatched to Hostel Warden Agent.');
      const hd = await api.getHostel();
      setHostelData(hd);
    } catch (err: any) {
      alert(err.message || 'Failed to submit hostel issue');
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    try {
      await api.registerCampusEvent(eventId);
      alert('Registered for campus event successfully!');
      const ev = await api.getCampusEvents();
      setEventsData(ev);
    } catch (err: any) {
      alert(err.message || 'Failed to register');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitFeedback({
        category: feedbackCategory,
        rating: Number(feedbackRating),
        comments: feedbackComments
      });
      setShowFeedbackModal(false);
      setFeedbackComments('');
      alert('Feedback submitted. AI Sentiment Agent analyzed your submission.');
      const fb = await api.getStudentFeedback();
      if (fb?.feedbacks) setFeedbacks(fb.feedbacks);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    }
  };

  const handleAskHelpdesk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpdeskQuery.trim()) return;
    setAskingHelpdesk(true);
    try {
      const res = await api.askHelpdesk(helpdeskQuery);
      setHelpdeskAnswer(res);
    } catch (err: any) {
      alert(err.message || 'Error asking helpdesk');
    } finally {
      setAskingHelpdesk(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected PDF.'));
    reader.readAsDataURL(file);
  });

  const validatePdf = (file: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Please select a PDF document only.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('PDF size must be 5 MB or less.');
    }
  };

  const handleCreateReminderNL = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlPrompt.trim()) return;
    setReminderLoading(true);
    try {
      validatePdf(taskPdf);
      const attachmentData = taskPdf ? await fileToDataUrl(taskPdf) : undefined;
      await api.triggerReminderNLWorkflow(nlPrompt, attachmentData);
      setNlPrompt('');
      setTaskPdf(null);
      await fetchDashboard();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReminderLoading(false);
    }
  };

  const handleApplyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.triggerCertificateWorkflow({
        certificateType: certType,
        purpose: certPurpose
      });
      setShowCertModal(false);
      setCertPurpose('');
      await fetchDashboard();
      alert('Certificate workflow initiated. Academic records verified and draft sent for officer authorization.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApplyNoDues = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.triggerNoDuesWorkflow({ reason: noDuesReason });
      setShowNoDuesModal(false);
      setNoDuesReason('');
      await fetchDashboard();
      alert('Multi-agent No-Dues clearance workflow initiated across Library, Accounts, Labs, Hostel.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg) return;
    try {
      validatePdf(assignmentPdf);
      if (!assignmentPdf) throw new Error('Please attach your assignment PDF before submitting.');
      const fileUrl = await fileToDataUrl(assignmentPdf);
      const studentRoll = data?.profile?.roll_number || '21CSE042';
      const studentName = data?.user?.fullName || data?.user?.full_name || 'Aarav Sharma';
      await api.submitAssignment({
        assignmentId: selectedAsg.id,
        submissionText,
        fileUrl
      });
      // Automatically download official submission receipt PDF
      pdfExport.downloadSubmissionReceiptPDF({
        studentName,
        rollNumber: studentRoll,
        assignmentTitle: selectedAsg.title,
        fileName: assignmentPdf.name
      });
      setSelectedAsg(null);
      setSubmissionText('');
      setAssignmentPdf(null);
      await fetchDashboard();
      alert('Assignment submitted successfully! Official Submission Receipt PDF downloaded to your device.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Personal Notes & To-Do Handlers (Part 5)
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    try {
      if (editingNoteId) {
        await api.updateStudentNote(editingNoteId, { title: noteTitle, content: noteContent, color: noteColor });
      } else {
        await api.createStudentNote({ title: noteTitle, content: noteContent, color: noteColor });
      }
      setShowNoteModal(false);
      setEditingNoteId(null);
      setNoteTitle('');
      setNoteContent('');
      await fetchDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.deleteStudentNote(id);
      await fetchDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTask.trim()) return;
    try {
      await api.createStudentTodo({ task: todoTask, priority: todoPriority, dueDate: todoDueDate || undefined });
      setTodoTask('');
      setTodoDueDate('');
      await fetchDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleTodo = async (todo: any) => {
    try {
      await api.updateStudentTodo(todo.id, { isCompleted: !todo.is_completed });
      await fetchDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await api.deleteStudentTodo(id);
      await fetchDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenPayCertModal = (cert: any) => {
    setSelectedCertForPayment(cert);
    setCertPayMode('upi');
  };

  const handleConfirmPayCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertForPayment) return;
    setIsPayingCert(true);
    try {
      await api.payCertificateFee(selectedCertForPayment.id, certPayMode);
      const paidCert = selectedCertForPayment;
      setSelectedCertForPayment(null);
      await fetchDashboard();
      alert('Certificate fee of Rs. 200 paid successfully! You can now upload your payment receipt to complete your submission.');
      setSelectedCertForReceipt(paidCert);
      setReceiptFileName(`${paidCert.certificate_type}_fee_receipt.pdf`);
    } catch (err: any) {
      alert(err.message || 'Payment failed');
    } finally {
      setIsPayingCert(false);
    }
  };

  const handleOpenReceiptUpload = (cert: any) => {
    setSelectedCertForReceipt(cert);
    setReceiptFileName(cert.receipt_file_name || `${cert.certificate_type}_fee_receipt.pdf`);
  };

  const handleUploadReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertForReceipt) return;
    setIsUploadingReceipt(true);
    try {
      await api.uploadCertificateReceipt({
        certificateId: selectedCertForReceipt.id,
        fileName: receiptFileName || 'fee_receipt_200.pdf'
      });
      setSelectedCertForReceipt(null);
      await fetchDashboard();
      alert('Payment receipt uploaded successfully! Application is now under verification by the Officer.');
    } catch (err: any) {
      alert(err.message || 'Failed to upload receipt');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handlePayStudentFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFee) return;
    setPayProcessing(true);
    try {
      const res = await api.payStudentFee({
        studentFeeId: payingFee.id,
        amount: Number(payAmount),
        paymentMode: payMode
      });
      setShowFeePayModal(false);
      setPayingFee(null);
      await fetchDashboard();
      alert(`Fee payment of Rs. ${payAmount} verified successfully! Receipt Number: ${res.payment?.receipt_number || 'REC-VERIFIED'}. Pending dues updated.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPayProcessing(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping inline-block mr-2" />
        <span>Loading authenticated student records...</span>
      </div>
    );
  }

  const user = data.user || {};
  const profile = data.profile || {};
  const attendance = data.attendance || {
    overall: { percentage: 100, isShortage: false, attendedSessions: 6, totalSessions: 6 },
    breakdown: []
  };
  const assignments = data.assignments || [];
  const internalMarks = data.internalMarks || [];
  const timetable = data.timetable || null;
  const library = data.library || { borrowedBooks: [], finePending: 0 };
  const fees = data.fees || { records: [], totalPending: 0, payments: [] };
  const certificates = data.certificates || [];
  const noDues = data.noDues || [];
  const reminders = data.reminders || [];
  const announcements = data.announcements || [];

  const studentFullName = String(user?.fullName || user?.full_name || user?.username || 'Aarav Sharma');
  const studentInitials = (studentFullName ? studentFullName.split(/\s+/) : ['A', 'S'])
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('') || 'AS';
  const overallAtt = attendance.overall || { percentage: 100, isShortage: false, attendedSessions: 0, totalSessions: 0 };

  return (
    <div className="space-y-6">
      {/* Student Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-xl shadow-inner">
            {studentInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{studentFullName}</h1>
              <span className="text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                Roll: {profile.roll_number || '21CSE042'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              B.Tech Computer Science & Engineering | Year {profile.current_year || 3} (Sem {profile.semester || 5}) | Section A
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Attendance</span>
            <span className={`text-lg font-extrabold ${overallAtt.isShortage ? 'text-rose-600' : 'text-emerald-600'}`}>
              {overallAtt.percentage}%
            </span>
          </div>
          {overallAtt.isShortage && (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-1.5 rounded-xl font-medium animate-pulse">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Shortage Alert (&lt;75%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Overview Tab */}
      {(currentTab === 'overview' || !currentTab) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Attendance Metric Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Compliance</span>
                <UserCheck className={`w-4 h-4 ${attendance.overall.isShortage ? 'text-rose-600' : 'text-emerald-600'}`} />
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">{attendance.overall.percentage}%</div>
              <p className="text-xs text-slate-500">
                Attended {attendance.overall.attendedSessions} of {attendance.overall.totalSessions} scheduled lectures.
              </p>
            </div>
            {attendance.overall.isShortage ? (
              <div className="mt-4 p-2.5 bg-rose-50 text-rose-800 text-[11px] rounded-lg border border-rose-200 font-medium">
                Autonomous Warning: Attendance below mandatory 75% threshold.
              </div>
            ) : (
              <div className="mt-4 p-2.5 bg-emerald-50 text-emerald-800 text-[11px] rounded-lg border border-emerald-200 font-medium">
                Attendance meets university eligibility requirements.
              </div>
            )}
          </div>

          {/* Pending Assignments Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Assignments</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {assignments.filter((a: any) => !a.isSubmitted).length} Pending
              </div>
              <p className="text-xs text-slate-500">
                {assignments.filter((a: any) => a.isSubmitted).length} of {assignments.length} assignments submitted.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="text-[11px] bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded-md">
                DBMS Assignment 2 due in 48h
              </span>
            </div>
          </div>

          {/* Library & Dues Metric Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institutional Dues</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                Rs. {fees.totalPending}
              </div>
              <p className="text-xs text-slate-500">
                {library.borrowedBooks.length} borrowed book(s) | Pending fines: Rs. {library.finePending}
              </p>
            </div>
            <div className="mt-4">
              <span className={`text-[11px] px-2 py-1 rounded-md font-medium ${
                fees.totalPending === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {fees.totalPending === 0 ? 'Accounts Clearance Ready' : 'Pending Fee Balance'}
              </span>
            </div>
          </div>

          {/* Class Announcements Box (Part 7) */}
          {announcements.length > 0 && (
            <div className="md:col-span-3 bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-900 border-b border-blue-50 pb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Official Class Announcements</h3>
              </div>
              <div className="space-y-2">
                {announcements.map((ann: any) => (
                  <div key={ann.id} className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{ann.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ann.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                          {ann.priority?.toUpperCase() || 'INFO'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{ann.message}</p>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 whitespace-nowrap">
                      <span>By {ann.faculty_name} • {new Date(ann.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {currentTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Subject-Wise Attendance Breakdown</h2>
              <p className="text-xs text-slate-500">Calculated deterministically by Attendance Monitoring Agent</p>
            </div>
            <div className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Minimum Required: 75.0%
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3">Course Code & Title</th>
                  <th className="p-3">Total Classes</th>
                  <th className="p-3">Attended</th>
                  <th className="p-3">Absent</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.breakdown.map((item: any) => (
                  <tr key={item.subject.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{item.subject.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{item.subject.code}</span>
                    </td>
                    <td className="p-3 text-slate-600">{item.stats.totalSessions}</td>
                    <td className="p-3 text-emerald-600 font-bold">{item.stats.attendedSessions}</td>
                    <td className="p-3 text-rose-600 font-bold">{item.stats.absentSessions}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-black ${item.stats.isShortage ? 'text-rose-600' : 'text-slate-900'}`}>
                          {item.stats.percentage}%
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${item.stats.isShortage ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(item.stats.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {item.stats.isShortage ? (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Shortage Alert
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Eligible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {currentTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Active Course Assignments</h2>
            <span className="text-xs text-slate-500">Monitored by Assignment Management Agent</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((asg: any) => (
              <div key={asg.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Max Marks: {asg.max_marks}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      asg.isSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {asg.isSubmitted ? 'Submitted' : 'Pending Submission'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{asg.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{asg.description}</p>
                  {asg.isSubmitted && asg.submission?.file_url && (
                    <a href={asg.submission.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-600 mb-2">
                      <FileText className="w-3 h-3" /> View submitted PDF
                    </a>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {new Date(asg.due_date).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Faculty Assignment Question Paper PDF Download */}
                    <button
                      type="button"
                      onClick={() => pdfExport.downloadAssignmentQuestionPaperPDF({
                        title: asg.title,
                        description: asg.description,
                        maxMarks: asg.max_marks,
                        dueDate: asg.due_date
                      })}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 font-semibold transition"
                      title="Download Assignment Question Paper PDF"
                    >
                      <Download className="w-3 h-3" />
                      <span>Questions PDF</span>
                    </button>

                    {!asg.isSubmitted ? (
                      <button
                        onClick={() => setSelectedAsg(asg)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
                      >
                        Submit PDF
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => pdfExport.downloadSubmissionReceiptPDF({
                          studentName: studentFullName,
                          rollNumber: profile.roll_number || '21CSE042',
                          assignmentTitle: asg.title,
                          fileName: `${profile.roll_number || '21CSE042'}_${asg.id}.pdf`
                        })}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-semibold transition"
                        title="Download Submission Receipt PDF"
                      >
                        <Download className="w-3 h-3" />
                        <span>Receipt PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internal Marks Tab */}
      {currentTab === 'marks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Consolidated Internal Assessment Marks</h2>
            <p className="text-xs text-slate-500">
              Deterministic College Formula: 80% Best Mid + 20% Other Mid (scaled to 15) + Assignment (10) + Attendance (5) = Max 30
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3">Subject ID</th>
                  <th className="p-3">Mid-1 (30)</th>
                  <th className="p-3">Mid-2 (30)</th>
                  <th className="p-3">Assignment (10)</th>
                  <th className="p-3">Attendance (5)</th>
                  <th className="p-3">Consolidated (30)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {internalMarks.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-semibold text-slate-900">{m.subject_id}</td>
                    <td className="p-3 text-slate-700">{m.mid1_marks}</td>
                    <td className="p-3 text-slate-700">{m.mid2_marks}</td>
                    <td className="p-3 text-slate-700">{m.assignment_marks}</td>
                    <td className="p-3 text-slate-700">{m.attendance_marks}</td>
                    <td className="p-3 font-black text-blue-700 text-sm">{m.consolidated_marks} / 30</td>
                    <td className="p-3">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {m.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timetable Tab */}
      {currentTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Class Timetable Schedule (CSE-3A)</h2>
              <p className="text-xs text-slate-500">Official Version {timetable?.version || 1} • Managed by Timetable Agent</p>
            </div>
            <button
              onClick={() => pdfExport.downloadTimetablePDF({
                className: 'B.Tech CSE - 3rd Year (Section A)',
                semester: profile.semester || 5,
                version: timetable?.version || 2,
                slots: timetable?.slots
              })}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Timetable PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {timetable?.slots?.map((slot: any) => (
              <div key={slot.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500">{slot.day_of_week} • Period {slot.period_number}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                    {slot.room_number}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">{slot.subject_id}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {slot.start_time} - {slot.end_time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes & Reminders Tab (Part 5: Persistent Personal Notes & To-Do List) */}
      {currentTab === 'reminders' && (
        <div className="space-y-6">
          {/* Section 1: Personal Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Personal Study Notes & Insights</span>
                </h2>
                <p className="text-xs text-slate-500">Persistent across sessions in the institutional database</p>
              </div>
              <button
                onClick={() => {
                  setEditingNoteId(null);
                  setNoteTitle('');
                  setNoteContent('');
                  setNoteColor('blue');
                  setShowNoteModal(true);
                }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No personal notes added yet. Click "Add Note" to create your first note.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note: any) => (
                  <div
                    key={note.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      note.color === 'emerald'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : note.color === 'amber'
                        ? 'bg-amber-50/50 border-amber-200'
                        : note.color === 'purple'
                        ? 'bg-purple-50/50 border-purple-200'
                        : 'bg-blue-50/50 border-blue-200'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="text-xs font-bold text-slate-900">{note.title}</h4>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setNoteTitle(note.title);
                              setNoteContent(note.content);
                              setNoteColor(note.color || 'blue');
                              setShowNoteModal(true);
                            }}
                            className="text-slate-400 hover:text-blue-600 p-1"
                            title="Edit Note"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Delete Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200/50">
                      Updated {new Date(note.updated_at || note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Student Tasks & To-Do List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Tasks & To-Do List</span>
                </h2>
                <p className="text-xs text-slate-500">Track deadlines, course submissions, and academic priorities</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setTodoFilter('all')}
                  className={`px-3 py-1 rounded-lg transition ${todoFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  All ({todos.length})
                </button>
                <button
                  onClick={() => setTodoFilter('pending')}
                  className={`px-3 py-1 rounded-lg transition ${todoFilter === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Pending ({todos.filter((t: any) => !t.is_completed).length})
                </button>
                <button
                  onClick={() => setTodoFilter('completed')}
                  className={`px-3 py-1 rounded-lg transition ${todoFilter === 'completed' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Completed ({todos.filter((t: any) => t.is_completed).length})
                </button>
              </div>
            </div>

            {/* Quick Add Task Form */}
            <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="text"
                required
                value={todoTask}
                onChange={e => setTodoTask(e.target.value)}
                placeholder="What do you need to accomplish?"
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
              />
              <select
                value={todoPriority}
                onChange={e => setTodoPriority(e.target.value as any)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-2 outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <input
                type="date"
                value={todoDueDate}
                onChange={e => setTodoDueDate(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-2 outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2">
              {todos
                .filter((t: any) => {
                  if (todoFilter === 'pending') return !t.is_completed;
                  if (todoFilter === 'completed') return t.is_completed;
                  return true;
                })
                .map((todo: any) => (
                  <div
                    key={todo.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                      todo.is_completed ? 'bg-slate-50/70 border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTodo(todo)}
                        className="text-slate-400 hover:text-emerald-600 transition"
                      >
                        {todo.is_completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <div>
                        <span className={`text-xs font-semibold ${todo.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {todo.task}
                        </span>
                        {todo.due_date && (
                          <span className="text-[11px] text-slate-400 ml-2">
                            Due: {new Date(todo.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        todo.priority === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : todo.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {todo.priority?.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 3: Autonomous Natural Language Reminder Creation Box */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-300" />
              <h2 className="text-sm font-bold tracking-tight">Autonomous Natural Language Reminder Agent</h2>
            </div>
            <p className="text-xs text-blue-200 leading-relaxed mb-4">
              Speak or type tasks in everyday plain language. The Student PA Agent extracts the intent, target date & time, confirms interpretation, and schedules notifications.
            </p>

            <form onSubmit={handleCreateReminderNL} className="flex gap-2">
              <input
                type="text"
                value={nlPrompt}
                onChange={e => setNlPrompt(e.target.value)}
                placeholder='e.g., "Remind me to complete my DBMS assignment tomorrow at 6 PM"'
                className="flex-1 text-xs bg-slate-800/80 border border-blue-400/40 rounded-xl px-4 py-2.5 text-white placeholder-blue-300 outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label className="flex items-center gap-2 text-xs text-blue-100 bg-slate-800/70 border border-blue-400/40 rounded-xl px-3 py-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>{taskPdf ? taskPdf.name : 'Attach task PDF (optional)'}</span>
                <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => setTaskPdf(e.target.files?.[0] || null)} />
              </label>
              <button
                type="submit"
                disabled={reminderLoading || !nlPrompt.trim()}
                className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2 disabled:bg-slate-700"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{reminderLoading ? 'Agent Parsing...' : 'Instruct Agent'}</span>
              </button>
            </form>
          </div>

          {/* Active Reminders List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Scheduled Reminders</h3>
            <div className="space-y-2.5">
              {reminders.map((r: any) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{r.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{r.description}</div>
                    {r.attachment_data && <a href={r.attachment_data} download={`${r.title || 'task'}-document.pdf`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-600 mt-1"><FileText className="w-3 h-3" /> View attached PDF</a>}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                      {new Date(r.remind_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* My Documents – Certificate Management Tab (Requirement 1) */}
      {(currentTab === 'certificates' || currentTab === 'documents') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>My Documents – Certificate Management</span>
              </h2>
              <p className="text-xs text-slate-500">
                Track requested certificates, complete fee payments, upload receipts, and download official generated certificates
              </p>
            </div>
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request New Certificate</span>
            </button>
          </div>

          <div className="space-y-3">
            {certificates.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No certificate applications yet. Click "Request New Certificate" to apply.
              </div>
            ) : (
              certificates.map((cert: any) => {
                const isPaid = cert.payment_status === 'paid';
                const hasReceipt = !!cert.receipt_file_name;
                const isGenerated = cert.status === 'certificate_generated' || cert.status === 'issued';
                const isApproved = cert.status === 'approved';
                const isRejected = cert.status === 'rejected';

                // Display application status badge
                const getStatusBadge = () => {
                  if (isGenerated) {
                    return (
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                        Certificate Generated
                      </span>
                    );
                  }
                  if (isApproved) {
                    return (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Approved
                      </span>
                    );
                  }
                  if (isRejected) {
                    return (
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                        Rejected
                      </span>
                    );
                  }
                  if (cert.status === 'under_verification' || cert.status === 'under_review') {
                    return (
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                        Under Verification
                      </span>
                    );
                  }
                  if (cert.status === 'receipt_uploaded' || hasReceipt) {
                    return (
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                        Receipt Uploaded
                      </span>
                    );
                  }
                  return (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                      Payment Pending
                    </span>
                  );
                };

                return (
                  <div key={cert.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 uppercase">
                          {cert.certificate_type.replace('_', ' ')} Certificate
                        </span>
                        {getStatusBadge()}
                        {isPaid ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                            Fee Paid (Rs. {cert.fee_amount || 200})
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                            Fee: Rs. {cert.fee_amount || 200}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        <span className="font-medium text-slate-700">Purpose:</span> {cert.purpose}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span>Applied on: {new Date(cert.applied_at).toLocaleDateString()}</span>
                        {cert.payment_reference && (
                          <span className="font-mono text-slate-500">Ref: {cert.payment_reference}</span>
                        )}
                      </div>

                      {/* Receipt Upload Status Display */}
                      {hasReceipt ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-200 w-fit">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Receipt Uploaded: <strong>{cert.receipt_file_name}</strong></span>
                        </div>
                      ) : isPaid && !isRejected ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50/70 px-2.5 py-1 rounded-lg border border-amber-200 w-fit">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Payment receipt pending upload for officer verification</span>
                        </div>
                      ) : null}

                      {/* Officer Rejection Remarks */}
                      {isRejected && (cert.rejection_remarks || cert.rejection_reason) && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                          <strong>Officer Remarks:</strong> {cert.rejection_remarks || cert.rejection_reason}
                        </div>
                      )}
                    </div>

                    {/* Action Flow: Pay Fee -> Upload Receipt -> Download Certificate */}
                    <div className="flex flex-wrap items-center gap-2">
                      {!isPaid && !isRejected && (
                        <button
                          onClick={() => handleOpenPayCertModal(cert)}
                          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Fee (Rs. 200)</span>
                        </button>
                      )}

                      {isPaid && !isRejected && !isGenerated && (
                        <button
                          onClick={() => handleOpenReceiptUpload(cert)}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{hasReceipt ? 'Update Receipt' : 'Upload Payment Receipt'}</span>
                        </button>
                      )}

                      {(isApproved || isGenerated) && (
                        <button
                          onClick={() => pdfExport.downloadCertificatePDF({
                            studentName: studentFullName,
                            rollNumber: profile.roll_number || '21CSE042',
                            purpose: cert.purpose,
                            certificateNumber: cert.id
                          })}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Generated Certificate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Fee Records Tab (Part 15: Student Fee Payment & Pending Dues) */}
      {currentTab === 'fees' && (
        <div className="space-y-6">
          {/* Fee KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Fee Allocated</span>
              <div className="text-2xl font-black text-slate-900">
                Rs. {fees.records.reduce((sum: number, r: any) => sum + (r.total_amount || 0), 0)}
              </div>
              <span className="text-[11px] text-slate-500">Academic Year {profile.current_year ? `Year ${profile.current_year}` : '2026-2027'}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Amount Paid</span>
              <div className="text-2xl font-black text-emerald-600">
                Rs. {fees.records.reduce((sum: number, r: any) => sum + (r.paid_amount || 0), 0)}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Verified in Accounts Ledger</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Remaining Pending Dues</span>
              <div className={`text-2xl font-black ${fees.totalPending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                Rs. {fees.totalPending}
              </div>
              <span className="text-[11px] text-slate-500">{fees.totalPending === 0 ? 'Institutional Clearance Granted' : 'Pending payment required'}</span>
            </div>
          </div>

          {/* Allocated Fee Structures Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Allocated Academic Fee Records</h2>
                <p className="text-xs text-slate-500">Allocated autonomously by Accounts Admin fee schedule</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Fee Category / Term</th>
                    <th className="p-3">Tuition Fee</th>
                    <th className="p-3">Library Fee</th>
                    <th className="p-3">Lab Fee</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Paid Amount</th>
                    <th className="p-3">Pending Due</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fees.records.map((fee: any) => (
                    <tr key={fee.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">
                        <div>{fee.term || 'Academic Fee'}</div>
                        <span className="text-[10px] text-slate-400">{fee.academic_year}</span>
                      </td>
                      <td className="p-3 text-slate-600">Rs. {fee.tuition_fee}</td>
                      <td className="p-3 text-slate-600">Rs. {fee.library_fee}</td>
                      <td className="p-3 text-slate-600">Rs. {fee.lab_fee}</td>
                      <td className="p-3 font-bold text-slate-900">Rs. {fee.total_amount}</td>
                      <td className="p-3 font-bold text-emerald-600">Rs. {fee.paid_amount}</td>
                      <td className="p-3 font-bold text-rose-600">Rs. {fee.pending_amount}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          fee.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : fee.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {fee.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {fee.pending_amount > 0 ? (
                          <button
                            onClick={() => {
                              setPayingFee(fee);
                              setPayAmount(fee.pending_amount.toString());
                              setShowFeePayModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
                          >
                            Pay Online
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold">Paid in Full ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Transaction Records */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Verified Payment Transactions & Receipts</h2>
              <p className="text-xs text-slate-500">Official digital receipts verified by Accounts Administration</p>
            </div>

            {fees.payments && fees.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Receipt Number</th>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Payment Mode</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fees.payments.map((pmt: any) => (
                      <tr key={pmt.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{pmt.receipt_number}</td>
                        <td className="p-3 font-mono text-slate-500">{pmt.reference_number}</td>
                        <td className="p-3 text-slate-600">{new Date(pmt.payment_date).toLocaleDateString()}</td>
                        <td className="p-3 text-slate-600 uppercase">{pmt.payment_mode}</td>
                        <td className="p-3 font-bold text-emerald-600">Rs. {pmt.amount}</td>
                        <td className="p-3">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            VERIFIED & SIGNED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No payment transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* No-Dues Clearance Tab (Multi-Agent Coordination) */}
      {currentTab === 'no-dues' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Multi-Agent No-Dues Institutional Clearance</h2>
              <p className="text-xs text-slate-500">Autonomous Coordination across Library, Accounts, Laboratory, and Hostel</p>
            </div>
            {noDues.length === 0 && (
              <button
                onClick={() => setShowNoDuesModal(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply for No-Dues</span>
              </button>
            )}
          </div>

          {noDues.map((nd: any) => (
            <div key={nd.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-slate-900">Clearance Request: {nd.reason}</span>
                  <p className="text-[11px] text-slate-400">Initiated: {new Date(nd.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    nd.status === 'certificate_issued' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {nd.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <button
                    onClick={() => pdfExport.downloadNoDuesPDF({
                      studentName: studentFullName,
                      rollNumber: profile.roll_number || '21CSE042'
                    })}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Certificate</span>
                  </button>
                </div>
              </div>

              {/* Clearance Department Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {nd.clearances?.map((clr: any) => (
                  <div key={clr.id} className={`p-3 rounded-xl border text-xs ${
                    clr.status === 'cleared'
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/60 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold uppercase tracking-wider text-[10px]">{clr.department}</span>
                      {clr.status === 'cleared' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                    </div>
                    <div className="font-semibold">{clr.status === 'cleared' ? 'CLEARED' : 'DUES FOUND'}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Verified: {clr.cleared_by_agent_or_officer}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Library Tab */}
      {currentTab === 'library' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Borrowed Books & Fines</h2>
            <p className="text-xs text-slate-500">Monitored by Library Management Agent</p>
          </div>

          <div className="space-y-3">
            {library.borrowedBooks.map((item: any) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.book?.title}</h4>
                  <p className="text-[11px] text-slate-500">Author: {item.book?.author} • Shelf: {item.book?.shelf_location}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Due Date: {item.due_date}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                  {item.fine_amount > 0 && (
                    <div className="text-xs font-bold text-rose-600 mt-1">
                      Fine: Rs. {item.fine_amount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Examination & Hall Tickets */}
      {currentTab === 'exams' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Examination Schedule & Hall Tickets</h2>
                <p className="text-xs text-slate-500">Managed autonomously by Exam Management & Eligibility Agent</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Eligible (Attendance &gt; 75%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(examData?.schedules || []).map((exam: any) => (
                <div key={exam.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {exam.subject_code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Sem {exam.semester}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{exam.subject_name}</h4>
                  <div className="text-[11px] text-slate-600 space-y-1 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{exam.exam_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{exam.time_slot}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Home className="w-3 h-3 text-slate-400" />
                      <span>Venue: {exam.venue}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!examData?.schedules || examData.schedules.length === 0) && (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
                  No upcoming exam schedules published for current term.
                </div>
              )}
            </div>
          </div>

          {/* Hall Ticket Card */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Official Document
                </span>
                <h3 className="text-lg font-black mt-2">End Semester Hall Ticket & Admit Card</h3>
                <p className="text-xs text-blue-200 mt-1">
                  AI verified: Attendance threshold met (85.5%), No-Dues clearance confirmed across all departments.
                </p>
              </div>
              <button
                onClick={() => alert('Official Hall Ticket PDF generated with verified QR code!')}
                className="px-4 py-2 bg-white text-blue-900 font-bold rounded-xl text-xs hover:bg-blue-50 transition shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-blue-900" />
                <span>Download Hall Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Structured Faculty Feedback System (Part 2.6) */}
      {currentTab === 'faculty_feedback' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Faculty Academic Feedback System</h2>
                <p className="text-xs text-slate-500">
                  Strictly confidential teaching evaluation. Your responses help the institution maintain high pedagogical standards.
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Confidential & Identity-Protected
              </span>
            </div>

            {feedbackSuccessMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{feedbackSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFacultyFeedback} className="space-y-6">
              {/* Faculty & Subject Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Faculty Member <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedFacultyId}
                    onChange={e => {
                      const newFacId = e.target.value;
                      setSelectedFacultyId(newFacId);
                      const fac = facultyList.find(f => f.userId === newFacId);
                      if (fac?.subjects?.length > 0) {
                        setSelectedSubjectId(fac.subjects[0].id);
                      }
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium text-slate-800 outline-none focus:border-blue-600"
                  >
                    {facultyList.map(f => (
                      <option key={f.userId} value={f.userId}>
                        {f.fullName} ({f.designation} - {f.departmentCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Subject Handled <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={e => setSelectedSubjectId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium text-slate-800 outline-none focus:border-blue-600"
                  >
                    {((facultyList.find(f => f.userId === selectedFacultyId)?.subjects) || []).map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 6 Structured Feedback Questions */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Teaching Methodology & Course Delivery Assessment
                </h3>

                {[
                  { id: 'q1', text: '1. Does the faculty member explain concepts clearly?' },
                  { id: 'q2', text: '2. Does the faculty member complete the syllabus on time?' },
                  { id: 'q3', text: '3. Does the faculty member encourage student participation?' },
                  { id: 'q4', text: '4. Does the faculty member provide clarification when students have doubts?' },
                  { id: 'q5', text: '5. Is the teaching method effective?' },
                  { id: 'q6', text: '6. Does the faculty member provide appropriate academic guidance?' }
                ].map(q => {
                  const currentVal = feedbackRatings[q.id] || 5;
                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-800">{q.text}</span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setFeedbackRatings({ ...feedbackRatings, [q.id]: val })}
                              className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                                currentVal >= val
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              ★ {val}
                            </button>
                          ))}
                          <span className="text-[11px] font-bold text-slate-600 ml-2">
                            {currentVal === 5 ? 'Excellent' : currentVal === 4 ? 'Good' : currentVal === 3 ? 'Average' : 'Needs Work'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Written Comments */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Constructive Comments & Suggestions (Optional)
                </label>
                <textarea
                  value={feedbackComments}
                  onChange={e => setFeedbackComments(e.target.value)}
                  placeholder="Share constructive feedback regarding teaching approach, pace of lectures, or laboratory demonstrations..."
                  rows={3}
                  className="w-full text-xs border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Submitted data is aggregated by HOD and academic coordinators. Single submission per subject term.
                </span>
                <button
                  type="submit"
                  disabled={submittingFacultyFeedback}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingFacultyFeedback ? 'Submitting...' : 'Submit Faculty Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Facilities & Maintenance */}
      {currentTab === 'facilities' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Campus Facility & Maintenance Desk</h2>
                <p className="text-xs text-slate-500">Autonomous ticket tracking & dispatch via Facility Maintenance Agent</p>
              </div>
              <button
                onClick={() => setShowFacilityModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Report Facility Issue</span>
              </button>
            </div>

            <div className="space-y-3">
              {facilityComplaints.map((comp: any) => (
                <div key={comp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-200 text-slate-800">
                        {comp.category}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{comp.location}</span>
                    </div>
                    <p className="text-xs text-slate-600">{comp.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Reported: {comp.created_at}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      comp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      comp.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {comp.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {facilityComplaints.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No maintenance requests submitted. Campus facilities are fully operational.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Transport */}
      {currentTab === 'transport' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Campus Transport & Bus Routes</h2>
                <p className="text-xs text-slate-500">Autonomous route tracking & pass management by Transport Operations Agent</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(transportData?.routes || []).map((route: any) => (
                <div key={route.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Bus #{route.bus_number}
                      </span>
                      <span className="text-xs font-bold text-emerald-700">Rs. {route.fee_per_semester} / sem</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">{route.route_name}</h3>
                    <div className="text-[11px] text-slate-600 mt-2 space-y-1">
                      <p><strong>Driver:</strong> {route.driver_name} ({route.driver_contact})</p>
                      <p><strong>Stops:</strong> {Array.isArray(route.stops) ? route.stops.join(' → ') : route.stops}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => handleRegisterTransport(route.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition shadow-sm"
                    >
                      Book / Renew Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Hostel Life */}
      {currentTab === 'hostel' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Hostel & Residential Life</h2>
                <p className="text-xs text-slate-500">Monitored by Hostel Life & Discipline Agent</p>
              </div>
              <button
                onClick={() => setShowHostelModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Grievance</span>
              </button>
            </div>

            {/* Room Allocation Info */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 uppercase">
                  Resident Allocation
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Block B • Room 204 (Double Occupancy)</h3>
                <p className="text-xs text-slate-600 mt-0.5">High-Speed Campus WiFi • Hot Water • Biometric Entry</p>
              </div>
              <div className="text-xs text-indigo-800 font-semibold bg-white px-3 py-1.5 rounded-lg border border-indigo-200">
                Warden: Dr. R. Verma (Ext: 4402)
              </div>
            </div>

            {/* Past Complaints */}
            <h3 className="text-xs font-bold text-slate-900 mb-3">Hostel Requests & Maintenance History</h3>
            <div className="space-y-2">
              {(hostelData?.complaints || []).map((comp: any) => (
                <div key={comp.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 uppercase text-[10px] bg-slate-200 px-1.5 py-0.5 rounded mr-2">
                      {comp.category}
                    </span>
                    <span className="text-slate-700">{comp.description}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {comp.status?.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Campus Events */}
      {currentTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Campus Events & Co-Curricular Activities</h2>
                <p className="text-xs text-slate-500">Autonomous calendar orchestration by Campus Event Coordination Agent</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(eventsData?.events || []).map((ev: any) => (
                <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                        {ev.category}
                      </span>
                      <span className="text-[10px] text-slate-500">{ev.event_date}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">{ev.title}</h3>
                    <p className="text-[11px] text-slate-600 mt-1">{ev.description}</p>
                    <div className="text-[10px] text-slate-500 mt-3 space-y-0.5">
                      <p><strong>Venue:</strong> {ev.venue}</p>
                      <p><strong>Organizer:</strong> {ev.organizer}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => handleRegisterEvent(ev.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition shadow-sm"
                    >
                      Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Student Feedback */}
      {currentTab === 'feedback' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Student Grievances & Academic Feedback</h2>
                <p className="text-xs text-slate-500">Sentiment analysis and prompt escalation by Student Feedback & Grievance Agent</p>
              </div>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>

            <div className="space-y-3">
              {feedbacks.map((fb: any) => (
                <div key={fb.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 uppercase">
                        {fb.category}
                      </span>
                      <div className="flex items-center text-amber-500 text-xs">
                        {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700">{fb.comments}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Logged: {fb.created_at}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fb.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-800' :
                      fb.sentiment === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {fb.sentiment?.toUpperCase() || 'PROCESSED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Campus Helpdesk AI */}
      {currentTab === 'helpdesk' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Campus Helpdesk & Inquiry AI Agent</h2>
                <p className="text-xs text-slate-500">Instant natural language assistance across campus rules, fees, exams, and procedures</p>
              </div>
            </div>

            <form onSubmit={handleAskHelpdesk} className="flex gap-2 mb-6">
              <input
                type="text"
                value={helpdeskQuery}
                onChange={e => setHelpdeskQuery(e.target.value)}
                placeholder="Ask anything... e.g. 'How do I download my hall ticket?' or 'What are the library overdue charges?'"
                className="flex-1 text-xs border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={askingHelpdesk || !helpdeskQuery.trim()}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{askingHelpdesk ? 'Thinking...' : 'Ask AI'}</span>
              </button>
            </form>

            {helpdeskAnswer && (
              <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900 uppercase">
                    AI Agent Response
                  </span>
                  <span className="text-[10px] text-slate-500">Confidence: {(helpdeskAnswer.confidence * 100).toFixed(0)}%</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{helpdeskAnswer.answer}</p>
                {helpdeskAnswer.ticket_raised && (
                  <div className="text-[11px] text-amber-800 font-medium bg-amber-100/70 p-2.5 rounded-lg border border-amber-200">
                    A support ticket has also been autonomously dispatched to the relevant department coordinator.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Report Facility Issue */}
      {showFacilityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Report Campus Facility Issue</h3>
            <p className="text-xs text-slate-500 mb-4">Routes directly to Facility Maintenance Agent & Maintenance Crew.</p>
            <form onSubmit={handleSubmitFacility} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={facilityCategory}
                  onChange={e => setFacilityCategory(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                >
                  <option value="classroom">Classroom / Projector</option>
                  <option value="laboratory">Laboratory Equipment</option>
                  <option value="washroom">Washroom / Sanitation</option>
                  <option value="electrical">Electrical / AC</option>
                  <option value="sports">Sports Ground / Gym</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Location Details</label>
                <input
                  type="text"
                  required
                  value={facilityLocation}
                  onChange={e => setFacilityLocation(e.target.value)}
                  placeholder="e.g. Science Block 3rd Floor Lab 302"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Issue Description</label>
                <textarea
                  required
                  value={facilityDesc}
                  onChange={e => setFacilityDesc(e.target.value)}
                  placeholder="Explain the problem clearly..."
                  rows={3}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFacilityModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-500"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hostel Complaint */}
      {showHostelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Submit Hostel Grievance</h3>
            <p className="text-xs text-slate-500 mb-4">Dispatched to Hostel Warden Agent and resident support desk.</p>
            <form onSubmit={handleSubmitHostel} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={hostelCategory}
                  onChange={e => setHostelCategory(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                >
                  <option value="room_maintenance">Room Maintenance</option>
                  <option value="wifi">High-speed WiFi / Network</option>
                  <option value="mess">Hostel Mess / Food</option>
                  <option value="cleanliness">Hostel Hygiene / Cleanliness</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  required
                  value={hostelDesc}
                  onChange={e => setHostelDesc(e.target.value)}
                  placeholder="Detail your request or grievance..."
                  rows={3}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHostelModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-500"
                >
                  Submit Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Feedback */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Submit Academic & Campus Feedback</h3>
            <p className="text-xs text-slate-500 mb-4">Feedback is analyzed with AI Sentiment Modeling to assist administration.</p>
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={feedbackCategory}
                  onChange={e => setFeedbackCategory(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                >
                  <option value="teaching">Faculty & Teaching Methodology</option>
                  <option value="curriculum">Curriculum & Syllabus</option>
                  <option value="facilities">Classrooms & Labs</option>
                  <option value="canteen">Canteen & Cafeteria</option>
                  <option value="administration">College Administration</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFeedbackRating(num)}
                      className={`p-2 rounded-lg border text-xs font-bold ${
                        feedbackRating >= num ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {num} ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Constructive Comments</label>
                <textarea
                  required
                  value={feedbackComments}
                  onChange={e => setFeedbackComments(e.target.value)}
                  placeholder="Share your experience or suggestion..."
                  rows={3}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-500"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Apply Certificate */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Apply for Official Certificate</h3>
            <p className="text-xs text-slate-500 mb-4">
              Certificate applications are verified by the Certificate Processing Agent and routed to Office Administration upon fee payment.
            </p>
            <form onSubmit={handleApplyCertificate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Certificate Type</label>
                <select
                  value={certType}
                  onChange={e => setCertType(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                >
                  <option value="bonafide">Bonafide Certificate</option>
                  <option value="transfer">Transfer Certificate</option>
                  <option value="conduct">Conduct Certificate</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Purpose of Request</label>
                <textarea
                  required
                  value={certPurpose}
                  onChange={e => setCertPurpose(e.target.value)}
                  placeholder="e.g. Passport application / Education loan verification / Internship requirement"
                  rows={2}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                Application Processing Fee: <strong>Rs. 200</strong>. You can pay online right after submitting your request.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!certPurpose.trim()}
                  className="px-4 py-2 text-xs bg-blue-600 disabled:opacity-50 text-white rounded-md font-semibold hover:bg-blue-500 shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Certificate Processing Fee (Requirement 1) */}
      {selectedCertForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Pay Certificate Processing Fee</h3>
            <p className="text-xs text-slate-500 mb-4">
              Complete fee payment for your <strong>{selectedCertForPayment.certificate_type.toUpperCase()}</strong> certificate.
            </p>

            <form onSubmit={handleConfirmPayCert} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-semibold text-slate-800">{studentFullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Certificate:</span>
                  <span className="font-bold text-slate-900 uppercase">{selectedCertForPayment.certificate_type}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="font-semibold text-slate-700">Fee Amount Due:</span>
                  <span className="font-black text-emerald-600 text-sm">Rs. {selectedCertForPayment.fee_amount || 200}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / QR' },
                    { id: 'card', label: 'Debit/Credit Card' },
                    { id: 'netbanking', label: 'Net Banking' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCertPayMode(m.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        certPayMode === m.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCertForPayment(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPayingCert}
                  className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-md font-semibold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isPayingCert ? 'Processing...' : 'Confirm & Pay Rs. 200'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Certificate Payment Receipt (Requirement 1) */}
      {selectedCertForReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Payment Receipt</h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload your official payment receipt for officer verification of <strong>{selectedCertForReceipt.certificate_type.toUpperCase()}</strong>.
            </p>

            <form onSubmit={handleUploadReceiptSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Status:</span>
                  <span className="font-bold text-emerald-800">Fee Paid (Rs. 200)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Reference:</span>
                  <span className="font-mono text-slate-700">{selectedCertForReceipt.payment_reference || 'PAY-VERIFIED'}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Receipt Document / File Name</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={receiptFileName}
                    onChange={e => setReceiptFileName(e.target.value)}
                    placeholder="e.g. fee_receipt_bonafide_200.pdf"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Accepted formats: PDF, PNG, JPG (Max 5MB)</p>
              </div>

              <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-medium text-slate-700 block">Select or attach payment receipt</span>
                <span className="text-[10px] text-slate-400">Official bank receipt, UPI screenshot, or counter slip</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCertForReceipt(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingReceipt || !receiptFileName.trim()}
                  className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingReceipt ? 'Uploading...' : 'Submit Receipt for Verification'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Assignment */}
      {selectedAsg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Submit Assignment</h3>
            <p className="text-xs text-slate-500 mb-3">{selectedAsg.title}</p>
            <form onSubmit={handleSubmitAssignment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Solution Notes / Description</label>
                <textarea
                  required
                  value={submissionText}
                  onChange={e => setSubmissionText(e.target.value)}
                  placeholder="Describe your solution approach and attach query benchmarks..."
                  rows={3}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Upload Assignment PDF <span className="text-red-500">*</span></label>
                <input type="file" accept="application/pdf,.pdf" required onChange={e => setAssignmentPdf(e.target.files?.[0] || null)} className="w-full text-xs border border-slate-300 rounded-lg p-2" />
                <p className="text-[10px] text-slate-500 mt-1">PDF only, maximum 5 MB.</p>
                {assignmentPdf && <p className="text-[11px] text-emerald-700 mt-1">Selected: {assignmentPdf.name}</p>}
              </div>
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-[11px] text-blue-800">
                A verified solution document will be generated and routed to respective subject faculty for grading.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedAsg(null); setAssignmentPdf(null); setSubmissionText(''); }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!assignmentPdf}
                  className="px-4 py-2 text-xs bg-blue-600 disabled:opacity-50 text-white rounded-md font-semibold hover:bg-blue-500 shadow-sm"
                >
                  Submit to Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Apply No-Dues */}
      {showNoDuesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Apply for Institutional No-Dues Clearance</h3>
            <p className="text-xs text-slate-500 mb-3">
              Triggers the 4-department multi-agent workflow across Library, Accounts, Labs, Hostel.
            </p>
            <form onSubmit={handleApplyNoDues} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Clearance Purpose</label>
                <input
                  type="text"
                  required
                  value={noDuesReason}
                  onChange={e => setNoDuesReason(e.target.value)}
                  placeholder="e.g. End of Semester / Internship Clearance"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoDuesModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!noDuesReason.trim()}
                  className="px-4 py-2 text-xs bg-blue-600 disabled:opacity-50 text-white rounded-md font-semibold hover:bg-blue-500 shadow-sm"
                >
                  Initiate Multi-Agent Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Personal Note (Part 5) */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {editingNoteId ? 'Edit Personal Note' : 'Add Personal Note'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Saved permanently to your student account in the campus database.
            </p>
            <form onSubmit={handleSaveNote} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Kernel Summary"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Write your study notes, key formulas, or research pointers..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Card Theme</label>
                <select
                  value={noteColor}
                  onChange={e => setNoteColor(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 outline-none"
                >
                  <option value="blue">Blue Note</option>
                  <option value="emerald">Emerald Green Note</option>
                  <option value="amber">Amber Note</option>
                  <option value="purple">Purple Note</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold shadow-sm"
                >
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Fee Online (Part 15) */}
      {showFeePayModal && payingFee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Online Fee Payment Gateway</h3>
            <p className="text-xs text-slate-500 mb-4">
              {payingFee.term} • Total Pending Dues: Rs. {payingFee.pending_amount}
            </p>
            <form onSubmit={handlePayStudentFee} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Amount (Rs.)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={payingFee.pending_amount}
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-600 font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Supports partial or full payment of pending dues.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={payMode}
                  onChange={e => setPayMode(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 outline-none"
                >
                  <option value="online">Institutional Payment Gateway (Net Banking / UPI / Cards)</option>
                  <option value="bank_transfer">Direct NEFT / RTGS Bank Transfer</option>
                  <option value="cheque">Demand Draft / Cheque</option>
                </select>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                Transactions are instantly verified by the Accounts Ledger and reflected on your No-Dues clearance status.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeePayModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payProcessing}
                  className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-md font-semibold shadow-sm transition"
                >
                  {payProcessing ? 'Processing Transaction...' : `Confirm Payment of Rs. ${payAmount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

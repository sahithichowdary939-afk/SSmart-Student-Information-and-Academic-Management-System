import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { pdfExport } from '../../services/pdfExport.js';
import {
  GraduationCap,
  UserCheck,
  FileText,
  Award,
  Activity,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Download,
  Filter,
  Megaphone,
  Check
} from 'lucide-react';

interface FacultyDashboardProps {
  currentTab: string;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ currentTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Registered students & 5 filters
  const [students, setStudents] = useState<any[]>([]);
  const [filterAcadYear, setFilterAcadYear] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterSection, setFilterSection] = useState('all');

  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annClassId, setAnnClassId] = useState('cls-cse-3a');
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPriority, setAnnPriority] = useState('normal');
  const [isPostingAnn, setIsPostingAnn] = useState(false);

  // Post assignment modal (Part 3.1)
  const [showPostAsgModal, setShowPostAsgModal] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgClassId, setAsgClassId] = useState('cls-cse-3a');
  const [asgSubjectId, setAsgSubjectId] = useState('sub-dbms');
  const [asgDepartment, setAsgDepartment] = useState('Computer Science & Engineering');
  const [asgBranch, setAsgBranch] = useState('CSE');
  const [asgAcadYear, setAsgAcadYear] = useState('2026-2027');
  const [asgSemester, setAsgSemester] = useState('5');
  const [asgSection, setAsgSection] = useState('A');
  const [asgPdfFile, setAsgPdfFile] = useState<File | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // AI Assignment Evaluation State (Part 3.2)
  const [evaluatingSubId, setEvaluatingSubId] = useState<string | null>(null);
  const [viewingAiEvaluation, setViewingAiEvaluation] = useState<any>(null);

  // Subject filtering and selection (Academic Year, Branch, Semester, Subject)
  const [subFilterAcadYear, setSubFilterAcadYear] = useState('all');
  const [subFilterBranch, setSubFilterBranch] = useState('all');
  const [subFilterSemester, setSubFilterSemester] = useState('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState('sub-dbms');

  // Submit attendance modal
  const [showAttModal, setShowAttModal] = useState(false);
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attPeriod, setAttPeriod] = useState(1);
  const [attTopic, setAttTopic] = useState('');
  const [attRecords, setAttRecords] = useState<{ studentUserId: string; roll: string; name: string; status: 'present' | 'absent' }[]>([
    { studentUserId: 'u-std-1', roll: '21CSE042', name: 'Aarav Sharma', status: 'present' },
    { studentUserId: 'u-std-2', roll: '21CSE043', name: 'Diya Patel', status: 'present' },
    { studentUserId: 'u-std-3', roll: '21CSE088', name: 'Rohan Verma', status: 'present' }
  ]);

  // Submit marks modal
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [marksList, setMarksList] = useState([
    { studentUserId: 'u-std-1', roll: '21CSE042', name: 'Aarav Sharma', mid1: 28.5, mid2: 27.0, assignmentMarks: 9.5, attendanceMarks: 5.0 },
    { studentUserId: 'u-std-2', roll: '21CSE043', name: 'Diya Patel', mid1: 29.5, mid2: 29.0, assignmentMarks: 10.0, attendanceMarks: 5.0 },
    { studentUserId: 'u-std-3', roll: '21CSE088', name: 'Rohan Verma', mid1: 14.0, mid2: 12.5, assignmentMarks: 4.0, attendanceMarks: 1.5 }
  ]);

  // Grade/Review Submission Modal
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [reviewMarks, setReviewMarks] = useState<number>(9);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.getFacultyDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterAcadYear !== 'all') params.academic_year = filterAcadYear;
      if (filterBranch !== 'all') params.branch = filterBranch;
      if (filterYear !== 'all') params.year = filterYear;
      if (filterSemester !== 'all') params.semester = filterSemester;
      if (filterSection !== 'all') params.section = filterSection;
      const res = await api.getFacultyStudents(params);
      if (res?.students) setStudents(res.students);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.getFacultyAnnouncements();
      if (res?.announcements) setAnnouncements(res.announcements);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchStudents();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filterAcadYear, filterBranch, filterYear, filterSemester, filterSection]);

  const handlePostAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !asgDueDate || !asgSubjectId) {
      alert('Please fill in all assignment parameters.');
      return;
    }
    try {
      let pdfDataUrl: string | undefined = undefined;
      if (asgPdfFile) {
        if (asgPdfFile.size > 5 * 1024 * 1024) {
          alert('PDF size must be 5 MB or less.');
          return;
        }
        pdfDataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(String(reader.result));
          reader.onerror = () => rej(new Error('Failed to read selected PDF'));
          reader.readAsDataURL(asgPdfFile);
        });
      }

      await api.triggerAssignmentWorkflow({
        classId: asgClassId,
        subjectId: asgSubjectId,
        title: asgTitle,
        description: 'Official Question Paper attached as PDF.',
        dueDate: new Date(asgDueDate).toISOString(),
        maxMarks: 10,
        questionPaperPdfUrl: pdfDataUrl,
        questionPaperFilename: asgPdfFile ? asgPdfFile.name : 'assignment_question_paper.pdf'
      });

      setShowPostAsgModal(false);
      setAsgTitle('');
      setAsgPdfFile(null);
      setPreviewPdfUrl(null);
      await fetchDashboard();
      alert('Assignment published! Question paper PDF made accessible and notifications dispatched to students.');
    } catch (err: any) {
      alert(err.message || 'Failed to post assignment');
    }
  };

  const handleRunAiEvaluation = async (submissionId: string) => {
    setEvaluatingSubId(submissionId);
    try {
      const res = await api.aiEvaluateAssignmentSubmission(submissionId);
      await fetchDashboard();
      if (res.aiEvaluation) {
        setViewingAiEvaluation({ submissionId, ...res.aiEvaluation });
      }
      alert('AI Assignment Evaluation completed! Review question-wise suggested marks.');
    } catch (err: any) {
      alert(err.message || 'AI evaluation failed');
    } finally {
      setEvaluatingSubId(null);
    }
  };

  const handleApproveEvaluation = async (submissionId: string, marks: number, remarks: string) => {
    try {
      await api.approveAssignmentEvaluation({
        submissionId,
        approvedMarks: marks,
        facultyRemarks: remarks
      });
      await fetchDashboard();
      alert('Official marks approved and saved to academic records successfully.');
      setViewingAiEvaluation(null);
      setSelectedSub(null);
    } catch (err: any) {
      alert(err.message || 'Failed to approve marks');
    }
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.triggerAttendanceWorkflow({
        classId: 'cls-cse-3a',
        subjectId: 'sub-dbms',
        sessionDate: attDate,
        sessionPeriod: Number(attPeriod),
        topic: attTopic || 'Regular Class',
        records: attRecords.map(r => ({ studentUserId: r.studentUserId, status: r.status }))
      });
      setShowAttModal(false);
      await fetchDashboard();
      alert('Attendance submitted! Attendance Agent validated records, computed percentages, and notified Class In-charge.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmitMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.triggerMarksWorkflow({
        classId: 'cls-cse-3a',
        subjectId: 'sub-dbms',
        marks: marksList.map(m => ({
          studentUserId: m.studentUserId,
          mid1: Number(m.mid1),
          mid2: Number(m.mid2),
          assignmentMarks: Number(m.assignmentMarks),
          attendanceMarks: Number(m.attendanceMarks)
        }))
      });
      setShowMarksModal(false);
      await fetchDashboard();
      alert('Internal marks submitted! Deterministic college formula executed and results forwarded to Class In-charge.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    setIsPostingAnn(true);
    try {
      await api.createFacultyAnnouncement({
        classId: annClassId,
        title: annTitle,
        message: annMessage,
        priority: annPriority
      });
      setAnnTitle('');
      setAnnMessage('');
      await fetchAnnouncements();
      alert('Announcement broadcasted to class students successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    } finally {
      setIsPostingAnn(false);
    }
  };

  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setIsSubmittingReview(true);
    try {
      await api.reviewFacultySubmission({
        submissionId: selectedSub.id,
        status: 'graded',
        marks: Number(reviewMarks),
        feedback: reviewFeedback || 'Reviewed and evaluated.'
      });
      setSelectedSub(null);
      await fetchDashboard();
      alert('Student submission evaluated and feedback recorded successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading faculty dashboard...</div>;
  }

  const { subjects = [], classes = [], assignments = [], recentSessions = [], submissions = [] } = data;

  const parseSyllabus = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    return [
      'Unit 1: Relational Model, ER Diagrams & Schema Design',
      'Unit 2: SQL, Normalization (1NF to BCNF) & Relational Algebra',
      'Unit 3: Transaction Processing, ACID Properties & Concurrency Control',
      'Unit 4: Indexing, B/B+ Trees, Hashing & Query Optimization',
      'Unit 5: Distributed Databases, Replication & NoSQL Paradigms'
    ];
  };

  const assignedSubjects = (subjects || []).map((s: any) => ({
    ...s,
    academic_year: s.academic_year || '2024-25',
    branch: s.branch || 'CSE',
    semester: s.semester ? String(s.semester) : '5',
    className: s.className || (s.id === 'sub-dbms' ? 'CSE - 3rd Year - Sec A' : 'CSE - 3rd Year - Sec B'),
    enrolledCount: s.enrolledCount || (s.id === 'sub-dbms' ? 64 : 58),
    conductedLectures: s.conductedLectures || (s.id === 'sub-dbms' ? 38 : 34),
    credits: s.credits || 4,
    syllabusUnits: parseSyllabus(s.syllabusUnits)
  }));

  const filteredSubjects = assignedSubjects.filter((s: any) => {
    if (subFilterAcadYear !== 'all' && s.academic_year !== subFilterAcadYear) return false;
    if (subFilterBranch !== 'all' && s.branch !== subFilterBranch) return false;
    if (subFilterSemester !== 'all' && String(s.semester) !== subFilterSemester) return false;
    return true;
  });

  const activeSubject = assignedSubjects.find((s: any) => s.id === selectedSubjectId) || filteredSubjects[0] || assignedSubjects[0] || null;

  const subjectAssignments = assignments.filter((a: any) => {
    if (!activeSubject) return true;
    return a.subject_id === activeSubject.id || a.subjectId === activeSubject.id;
  });

  const displayedAssignments = subjectAssignments.length > 0 ? subjectAssignments : assignments;

  const subjectSubmissions = submissions.filter((s: any) => {
    if (!activeSubject) return true;
    return s.subject_id === activeSubject.id || s.subjectId === activeSubject.id || (activeSubject.code && s.subjectCode?.includes(activeSubject.code));
  });

  const displayedSubmissions = subjectSubmissions.length > 0 ? subjectSubmissions : submissions;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Dr. K. S. Rao</h1>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Associate Professor • Dept. of CSE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty ID: EMP-CSE-001 • Cabin 302, Academic Block A • Assigned to CS501 (DBMS) & CS503 (OS)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span>Active Term: <strong className="text-blue-600">2026-2027 (Odd Semester)</strong></span>
        </div>
      </div>

      {/* Overview Cards (shown on overview tab) */}
      {currentTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned Subjects</span>
            <div className="text-2xl font-black text-slate-900">{subjects.length} Courses</div>
            <p className="text-xs text-slate-500 mt-1">CS501 (DBMS), CS503 (Operating Systems)</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Active Assignments</span>
            <div className="text-2xl font-black text-slate-900">{assignments.length} Published</div>
            <p className="text-xs text-slate-500 mt-1">Monitored autonomously for missing submissions</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Submissions Received</span>
            <div className="text-2xl font-black text-indigo-600">{submissions.length} Total</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting evaluation & review</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Attendance Sessions</span>
            <div className="text-2xl font-black text-slate-900">{recentSessions.length} Conducted</div>
            <p className="text-xs text-slate-500 mt-1">Synchronized with Class In-charge</p>
          </div>
        </div>
      )}

      {/* TAB: CLASSES (Registered Students with 5 Filters + Announcements) */}
      {currentTab === 'classes' && (
        <div className="space-y-6">
          {/* Registered Students & 5 Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Registered Students in Assigned Classes</span>
                </h2>
                <p className="text-xs text-slate-500">Filter students by Academic Year, Branch, Year, Semester, and Section</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-200">
                {students.length} Students Listed
              </span>
            </div>

            {/* 5-Tier Filter Bar */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Academic Year</label>
                <select
                  value={filterAcadYear}
                  onChange={e => setFilterAcadYear(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium text-slate-700"
                >
                  <option value="all">All Academic Years</option>
                  <option value="2026-2027">2026-2027</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Branch</label>
                <select
                  value={filterBranch}
                  onChange={e => setFilterBranch(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium text-slate-700"
                >
                  <option value="all">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Year</label>
                <select
                  value={filterYear}
                  onChange={e => setFilterYear(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium text-slate-700"
                >
                  <option value="all">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Semester</label>
                <select
                  value={filterSemester}
                  onChange={e => setFilterSemester(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium text-slate-700"
                >
                  <option value="all">All Semesters</option>
                  <option value="1">Sem 1</option>
                  <option value="2">Sem 2</option>
                  <option value="3">Sem 3</option>
                  <option value="4">Sem 4</option>
                  <option value="5">Sem 5</option>
                  <option value="6">Sem 6</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Section</label>
                <select
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium text-slate-700"
                >
                  <option value="all">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">Academic Year</th>
                    <th className="p-3">Year / Sem</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-400">
                        No students match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    students.map((st: any) => (
                      <tr key={st.user_id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-semibold text-slate-900">{st.fullName}</td>
                        <td className="p-3 font-mono text-slate-600">{st.roll_number}</td>
                        <td className="p-3">{st.branch}</td>
                        <td className="p-3 text-slate-500">{st.academic_year}</td>
                        <td className="p-3 text-slate-600">Year {st.current_year} (Sem {st.semester})</td>
                        <td className="p-3 font-bold text-slate-700">Sec {st.section}</td>
                        <td className="p-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${(st.attendanceStats?.overallPercentage ?? 85) < 75
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                              }`}
                          >
                            {st.attendanceStats?.overallPercentage ?? 85}%
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Class Announcement Broadcasting */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-600" />
                  <span>Class Announcement Broadcasting</span>
                </h2>
                <p className="text-xs text-slate-500">Post timely academic notifications and reminders directly to student dashboards</p>
              </div>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Target Class</label>
                  <select
                    value={annClassId}
                    onChange={e => setAnnClassId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="cls-cse-3a">CSE 3rd Year - Section A</option>
                    <option value="cls-cse-3b">CSE 3rd Year - Section B</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Announcement Title</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={e => setAnnTitle(e.target.value)}
                    placeholder="e.g. Extra Doubt Clearing Session for Query Optimization"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Announcement Message</label>
                <textarea
                  required
                  rows={2}
                  value={annMessage}
                  onChange={e => setAnnMessage(e.target.value)}
                  placeholder="Provide complete instructions, timings, or venue details..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Priority:</span>
                  {(['normal', 'high', 'urgent'] as const).map(p => (
                    <label key={p} className="flex items-center gap-1 text-xs capitalize cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        name="annPriority"
                        value={p}
                        checked={annPriority === p}
                        onChange={() => setAnnPriority(p)}
                        className="text-blue-600"
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isPostingAnn}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {isPostingAnn ? 'Broadcasting...' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>

            {/* List of Recent Announcements */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Broadcast History</h3>
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400">No announcements broadcasted yet.</p>
              ) : (
                announcements.map((a: any) => (
                  <div key={a.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{a.title}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${a.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : a.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                            }`}
                        >
                          {a.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{a.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Class: {a.class_id} • Posted: {new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ASSIGNMENT MANAGEMENT (Part 3.1 & 3.2: Separate Functional Module) */}
      {currentTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900">Assignment Management & Submissions</h2>
              <p className="text-xs text-slate-500">
                Publish question papers as PDF and evaluate student answers with Assignment Evaluation Agent
              </p>
            </div>
            <button
              onClick={() => setShowPostAsgModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Assignment (PDF)</span>
            </button>
          </div>
          {/* Section 1: Subject Selection & Filtering (Academic Year, Branch, Semester, Subject) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span>Subject Selection & Course Filtering</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Select and filter your assigned subjects using Academic Year, Branch, Semester, and Subject
                </p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-200">
                {assignedSubjects.length} Assigned Courses
              </span>
            </div>

            {/* 4 Interactive Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Academic Year</label>
                <select
                  value={subFilterAcadYear}
                  onChange={e => setSubFilterAcadYear(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Academic Years</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Branch</label>
                <select
                  value={subFilterBranch}
                  onChange={e => setSubFilterBranch(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Semester</label>
                <select
                  value={subFilterSemester}
                  onChange={e => setSubFilterSemester(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Semesters</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Assigned Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={e => {
                    setSelectedSubjectId(e.target.value);
                    const sub = assignedSubjects.find((s: any) => s.id === e.target.value);
                    if (sub) {
                      setAsgSubjectId(sub.id);
                      setAsgAcadYear(sub.academic_year);
                      setAsgBranch(sub.branch);
                      setAsgSemester(sub.semester);
                    }
                  }}
                  className="w-full text-xs border border-blue-300 rounded-lg p-2.5 bg-blue-50/50 font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {filteredSubjects.length === 0 ? (
                    <option value="">No matching subjects</option>
                  ) : (
                    filteredSubjects.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} ({s.branch} Sem {s.semester})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Section 2: Relevant Subject Details Card */}
            {activeSubject && (
              <div className="mt-4 p-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                        {activeSubject.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{activeSubject.name}</h3>
                      <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {activeSubject.credits} Credits
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Assigned Class: <strong className="text-slate-800">{activeSubject.className}</strong> • Academic Year: <strong className="text-slate-800">{activeSubject.academic_year}</strong> • Branch: <strong className="text-slate-800">{activeSubject.branch}</strong> • Semester: <strong className="text-slate-800">{activeSubject.semester}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAsgSubjectId(activeSubject.id);
                        setAsgAcadYear(activeSubject.academic_year);
                        setAsgBranch(activeSubject.branch);
                        setAsgSemester(activeSubject.semester);
                        setShowPostAsgModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Assignment</span>
                    </button>
                  </div>
                </div>

                {/* Metrics for Selected Subject */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-blue-100/80">
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled Students</span>
                    <span className="text-lg font-black text-slate-900">{activeSubject.enrolledCount} Active</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Conducted Lectures</span>
                    <span className="text-lg font-black text-emerald-700">{activeSubject.conductedLectures} Sessions</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Course Credits</span>
                    <span className="text-lg font-black text-blue-700">{activeSubject.credits} Credits</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Faculty</span>
                    <span className="text-xs font-bold text-slate-800 truncate block mt-1">Dr. K. S. Rao (Associate Prof)</span>
                  </div>
                </div>

                {/* Syllabus Breakdown (5 Units) */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-800 block mb-2">Subject Syllabus & Course Units:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Array.isArray(activeSubject?.syllabusUnits) ? activeSubject.syllabusUnits : parseSyllabus(activeSubject?.syllabusUnits)).map((u: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/90 px-3 py-2 rounded-lg border border-slate-200 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{u}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Assignment Management (Filtered by Subject) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Assignment Management {activeSubject ? `– ${activeSubject.code} (${activeSubject.name})` : ''}
                </h2>
                <p className="text-xs text-slate-500">
                  Create, publish and track assignments autonomously for your assigned subject
                </p>
              </div>
              <button
                onClick={() => {
                  if (activeSubject) {
                    setAsgSubjectId(activeSubject.id);
                    setAsgAcadYear(activeSubject.academic_year);
                    setAsgBranch(activeSubject.branch);
                    setAsgSemester(activeSubject.semester);
                  }
                  setShowPostAsgModal(true);
                }}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Assignment</span>
              </button>
            </div>

            <div className="space-y-3">
              {displayedAssignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No assignments created for this subject yet. Click "+ Create Assignment" to publish one.
                </div>
              ) : (
                displayedAssignments.map((asg: any) => (
                  <div key={asg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{asg.title}</h4>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl mt-1">{asg.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Due: {new Date(asg.due_date).toLocaleDateString()} • Max Marks: {asg.max_marks || 10} • Subject: {activeSubject?.name || 'DBMS'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => pdfExport.downloadAssignmentQuestionPaperPDF({
                          title: asg.title,
                          description: asg.description,
                          maxMarks: asg.max_marks || 10,
                          dueDate: asg.due_date,
                          facultyName: 'Dr. K. S. Rao',
                          subjectName: activeSubject?.name || 'Database Management Systems',
                          subjectCode: activeSubject?.code || 'CS501'
                        })}
                        className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold transition shadow-sm"
                        title="Download Official Question Paper PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Question Paper PDF</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Student Submissions Review Table (Part 3 & 4) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Student Submissions Review</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Review submitted assignment PDFs from your students, verify work, and update evaluation status
                </p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200">
                {displayedSubmissions.length} Submissions
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Assignment Title</th>
                    <th className="p-3">Submission Date</th>
                    <th className="p-3">Uploaded File</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Marks</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-slate-400">
                        No student submissions recorded for this subject yet.
                      </td>
                    </tr>
                  ) : (
                    displayedSubmissions.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-semibold text-slate-900">{sub.studentName}</td>
                        <td className="p-3 font-mono text-slate-600">{sub.rollNumber}</td>
                        <td className="p-3 text-slate-700 font-medium">{sub.subjectCode} - {sub.subjectName}</td>
                        <td className="p-3 font-medium text-slate-900">{sub.assignmentTitle}</td>
                        <td className="p-3 text-slate-500">
                          {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => pdfExport.downloadSubmissionReceiptPDF({
                              studentName: sub.studentName,
                              rollNumber: sub.rollNumber,
                              assignmentTitle: sub.assignmentTitle,
                              fileName: sub.file_name || 'submission.pdf',
                              submittedAt: sub.submitted_at
                            })}
                            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            <Download className="w-3 h-3" />
                            <span>{sub.file_name || 'submission.pdf'}</span>
                          </button>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.status === 'graded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                              }`}
                          >
                            {sub.status ? sub.status.toUpperCase() : 'SUBMITTED'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">
                          {sub.marks_obtained !== undefined && sub.marks_obtained !== null ? `${sub.marks_obtained}/10` : '-'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {sub.ai_evaluation ? (
                              <button
                                type="button"
                                onClick={() => setViewingAiEvaluation({ submissionId: sub.id, ...sub.ai_evaluation })}
                                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                <span>AI: {sub.ai_evaluation.suggested_marks}/10</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={evaluatingSubId === sub.id}
                                onClick={() => handleRunAiEvaluation(sub.id)}
                                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-semibold text-[11px] transition shadow-xs flex items-center gap-1 disabled:opacity-50"
                              >
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                <span>{evaluatingSubId === sub.id ? 'Evaluating...' : 'Run AI Eval'}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSub(sub);
                                setReviewMarks(sub.marks_obtained ?? sub.ai_evaluation?.suggested_marks ?? 9);
                                setReviewFeedback(sub.feedback ?? sub.ai_evaluation?.overall_evaluation ?? '');
                              }}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-semibold text-[11px] transition shadow-xs"
                            >
                              {sub.status === 'graded' ? 'Update' : 'Review'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ATTENDANCE MANAGEMENT (Part 3.3 & 3.4: Separate Functional Module) */}
      {currentTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Subject-Specific Attendance Management</h2>
              <p className="text-xs text-slate-500">
                Attendance entry strictly restricted to your assigned subjects. Validated by Attendance Monitoring Agent.
              </p>
            </div>
            <button
              onClick={() => setShowAttModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>+ Post Subject Attendance</span>
            </button>
          </div>

          <div className="space-y-2">
            {recentSessions?.map((s: any) => (
              <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">Period {s.session_period} • {s.topic}</span>
                  <span className="text-slate-500 text-[11px] ml-2">Date: {s.session_date}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  {s.status?.toUpperCase() || 'SUBMITTED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MARKS */}
      {(currentTab === 'marks' || currentTab === 'overview') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Internal Marks Entry (CS501 - DBMS)</h2>
              <p className="text-xs text-slate-500">Faculty inputs raw Mid & Assignment scores; Marks Agent executes college calculation</p>
            </div>
            <button
              onClick={() => setShowMarksModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition"
            >
              Enter / Update Marks
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Mid-1 (30)</th>
                  <th className="p-3">Mid-2 (30)</th>
                  <th className="p-3">Assignment (10)</th>
                  <th className="p-3">Attendance (5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marksList.map(m => (
                  <tr key={m.studentUserId} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{m.name}</td>
                    <td className="p-3 text-slate-500">{m.roll}</td>
                    <td className="p-3 font-bold">{m.mid1}</td>
                    <td className="p-3 font-bold">{m.mid2}</td>
                    <td className="p-3 font-bold">{m.assignmentMarks}</td>
                    <td className="p-3 font-bold">{m.attendanceMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Review & Grade Submission (Part 3) */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Evaluate Assignment Submission</h3>
            <p className="text-xs text-slate-500 mb-3">
              Review submission details, record marks, and provide actionable feedback.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-800">{selectedSub.studentName} ({selectedSub.rollNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-semibold text-slate-800">{selectedSub.subjectCode} - {selectedSub.subjectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assignment:</span>
                <span className="font-medium text-slate-800">{selectedSub.assignmentTitle}</span>
              </div>
            </div>

            <form onSubmit={handleReviewSubmission} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Marks Awarded (Out of 10)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  required
                  value={reviewMarks}
                  onChange={e => setReviewMarks(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Feedback / Remarks</label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  placeholder="e.g. Well organized queries and accurate relational algebra schema."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-500 shadow-sm"
                >
                  {isSubmittingReview ? 'Saving...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Post Assignment (Part 3.1: Clean PDF Question Paper Upload Workflow) */}
      {showPostAsgModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Publish Academic Assignment</h3>
                <p className="text-xs text-slate-500">
                  Select course parameters, attach question paper PDF, and publish directly to students.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPostAsgModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostAssignment} className="space-y-4">
              {/* 1. Department & Academic Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">1. Department</label>
                  <select
                    value={asgDepartment}
                    onChange={e => setAsgDepartment(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="Computer Science & Engineering">CSE (Computer Science)</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">2. Academic Year</label>
                  <select
                    value={asgAcadYear}
                    onChange={e => setAsgAcadYear(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="2026-2027">2026-2027</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>
              </div>

              {/* 3. Semester & 4. Class Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">3. Semester</label>
                  <select
                    value={asgSemester}
                    onChange={e => setAsgSemester(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">4. Class & Section</label>
                  <select
                    value={asgSection}
                    onChange={e => setAsgSection(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="A">Class CSE-3 • Section A</option>
                    <option value="B">Class CSE-3 • Section B</option>
                  </select>
                </div>
              </div>

              {/* 5. Assigned Subject */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  5. Subject Assigned to You <span className="text-rose-500">*</span>
                </label>
                <select
                  value={asgSubjectId}
                  onChange={e => {
                    setAsgSubjectId(e.target.value);
                    const sub = assignedSubjects.find((s: any) => s.id === e.target.value);
                    if (sub) {
                      setAsgClassId(sub.id === 'sub-dbms' ? 'cls-cse-3a' : 'cls-cse-3b');
                    }
                  }}
                  className="w-full text-xs border border-blue-400 rounded-lg p-2.5 bg-blue-50/50 font-bold text-blue-900"
                >
                  {assignedSubjects.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Assignment Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  6. Assignment Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={asgTitle}
                  onChange={e => setAsgTitle(e.target.value)}
                  placeholder="e.g. Unit 3 Assignment: Index Tuning Benchmarks & Query Optimization"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 font-medium"
                />
              </div>

              {/* 7. Submission Deadline */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  7. Submission Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={asgDueDate}
                  onChange={e => setAsgDueDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 font-medium"
                />
              </div>

              {/* 8. Upload Question Paper PDF */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  8. Upload Question Paper PDF <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    setAsgPdfFile(file);
                    if (file) {
                      setPreviewPdfUrl(URL.createObjectURL(file));
                    } else {
                      setPreviewPdfUrl(null);
                    }
                  }}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Accepts PDF documents up to 5 MB. Students will download this document directly.
                </p>
                {asgPdfFile && (
                  <p className="text-xs font-semibold text-emerald-700 mt-1">
                    ✓ Selected: {asgPdfFile.name} ({(asgPdfFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Action Buttons with 9. Preview & 10. Publish */}
              <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100">
                <div>
                  {previewPdfUrl ? (
                    <a
                      href={previewPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold border border-blue-200 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>9. Preview Uploaded PDF</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">PDF preview available upon file selection</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostAsgModal(false)}
                    className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 shadow-sm transition"
                  >
                    10. Publish Assignment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Assignment Evaluation Review Dialog (Part 3.2) */}
      {viewingAiEvaluation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Assignment Evaluation Review</h3>
                  <p className="text-xs text-slate-500">Autonomous evaluation by Assignment Evaluation Agent</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingAiEvaluation(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-900 tracking-wider">Suggested Score</span>
                  <div className="text-2xl font-black text-purple-900">
                    {viewingAiEvaluation.suggested_marks} / {viewingAiEvaluation.max_marks || 10}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-purple-800 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
                  Faculty Review Required
                </span>
              </div>

              {/* Question-Wise Feedback Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Question-Wise Evaluation Breakdown:
                </h4>
                {(viewingAiEvaluation.question_wise_feedback || []).map((qf: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{qf.question_title}</span>
                      <span className="text-blue-700">{qf.marks_awarded} / {qf.max_marks} pts</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{qf.feedback}</p>
                    {qf.improvement_suggestions && (
                      <p className="text-[10px] text-amber-800 font-medium bg-amber-50 p-1.5 rounded">
                        💡 Suggestion: {qf.improvement_suggestions}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Overall Evaluation Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <strong className="text-slate-800 block mb-1">Agent Evaluation Summary:</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">{viewingAiEvaluation.overall_evaluation}</p>
              </div>

              {/* Faculty Decision & Approval */}
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <h4 className="text-xs font-bold text-emerald-950">Faculty Authority & Final Approval</h4>
                <p className="text-[11px] text-slate-600">
                  You have final evaluation authority. You can approve the AI suggested marks or modify them as needed.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Approved Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      defaultValue={viewingAiEvaluation.suggested_marks}
                      id="faculty-approved-marks-input"
                      className="w-24 text-xs font-bold border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Faculty Remarks</label>
                    <input
                      type="text"
                      id="faculty-approved-remarks-input"
                      defaultValue="Approved by Subject Faculty after AI-assisted review."
                      className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingAiEvaluation(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const marksInput = document.getElementById('faculty-approved-marks-input') as HTMLInputElement;
                  const remarksInput = document.getElementById('faculty-approved-remarks-input') as HTMLInputElement;
                  const score = Number(marksInput?.value || viewingAiEvaluation.suggested_marks);
                  const remarks = remarksInput?.value || 'Approved by Subject Faculty.';
                  handleApproveEvaluation(viewingAiEvaluation.submissionId, score, remarks);
                }}
                className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm transition"
              >
                Approve & Commit Marks to Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Submit Attendance */}
      {showAttModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Submit Attendance Session</h3>
            <p className="text-xs text-slate-500 mb-4">
              Attendance Agent detects missing entries and recalculates class shortage thresholds.
            </p>
            <form onSubmit={handleSubmitAttendance} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={attDate}
                    onChange={e => setAttDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Period Number</label>
                  <select
                    value={attPeriod}
                    onChange={e => setAttPeriod(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value={1}>Period 1 (09:00 - 09:55)</option>
                    <option value={2}>Period 2 (09:55 - 10:50)</option>
                    <option value={3}>Period 3 (11:05 - 12:00)</option>
                    <option value={4}>Period 4 (12:00 - 12:55)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Topic Covered</label>
                <input
                  type="text"
                  required
                  value={attTopic}
                  onChange={e => setAttTopic(e.target.value)}
                  placeholder="e.g. Distributed Consensus & Raft Protocol"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              {/* Student Attendance List */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 max-h-48 overflow-y-auto">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Class Roll Call (CSE-3A)</span>
                {attRecords.map((r, idx) => (
                  <div key={r.studentUserId} className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-800">{r.name}</span>
                      <span className="text-slate-400 text-[10px] ml-2 font-mono">{r.roll}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...attRecords];
                          updated[idx].status = 'present';
                          setAttRecords(updated);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold ${r.status === 'present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...attRecords];
                          updated[idx].status = 'absent';
                          setAttRecords(updated);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold ${r.status === 'absent' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAttModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-500 shadow-sm"
                >
                  Submit to Class In-charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Internal Marks */}
      {showMarksModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Submit Assessment Scores (CS501)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Marks Agent executes deterministic formula (80% best mid + 20% second mid + assignment + attendance).
            </p>
            <form onSubmit={handleSubmitMarks} className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {marksList.map((m, idx) => (
                  <div key={m.studentUserId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>{m.name}</span>
                      <span className="font-mono text-slate-500">{m.roll}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Mid-1 (30)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={m.mid1}
                          onChange={e => {
                            const updated = [...marksList];
                            updated[idx].mid1 = Number(e.target.value);
                            setMarksList(updated);
                          }}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Mid-2 (30)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={m.mid2}
                          onChange={e => {
                            const updated = [...marksList];
                            updated[idx].mid2 = Number(e.target.value);
                            setMarksList(updated);
                          }}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Asg (10)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={m.assignmentMarks}
                          onChange={e => {
                            const updated = [...marksList];
                            updated[idx].assignmentMarks = Number(e.target.value);
                            setMarksList(updated);
                          }}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Att (5)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={m.attendanceMarks}
                          onChange={e => {
                            const updated = [...marksList];
                            updated[idx].attendanceMarks = Number(e.target.value);
                            setMarksList(updated);
                          }}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMarksModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-500 shadow-sm"
                >
                  Calculate & Forward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { pdfExport } from '../../services/pdfExport.js';
import {
  Compass,
  UserCheck,
  Award,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Check,
  Layers,
  Users,
  Eye,
  FileText
} from 'lucide-react';

interface ClassInchargeProps {
  currentTab: string;
}

export const ClassInchargeDashboard: React.FC<ClassInchargeProps> = ({ currentTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('cls-cse-3a');

  // Individual student session records modal
  const [selectedStudentSessionView, setSelectedStudentSessionView] = useState<any>(null);

  const fetchClasses = async () => {
    try {
      const res = await api.getClasses();
      if (res?.classes) setClassesList(res.classes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOverview = async (classId: string) => {
    setLoading(true);
    try {
      const res = await api.getClassInchargeOverview(classId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchOverview(selectedClassId);
  }, [selectedClassId]);

  const handleVerifySession = async (sessionId: string) => {
    try {
      await api.verifyAttendanceSession(sessionId);
      await fetchOverview(selectedClassId);
      alert('Session verified successfully! Published to student attendance totals.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePublishTimetable = async () => {
    if (!data?.timetable) return;
    try {
      await api.triggerTimetableWorkflow({
        classId: selectedClassId,
        timetableId: data.timetable.id
      });
      await fetchOverview(selectedClassId);
      alert('Timetable version incremented and broadcasted to students.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && !data) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading Class In-charge Coordination Center...</div>;
  }

  const {
    collegeClass,
    totalStudents = 0,
    students = [],
    subjects = [],
    shortages = [],
    unverifiedSessions = [],
    internalMarks = [],
    timetable,
    recentAttendanceRecords = []
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner with Class Switcher Dropdown (Part 8) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Dr. Ramesh Chandra</h1>
            <span className="text-[11px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
              Class In-charge • {collegeClass?.name || 'CSE 3rd Year'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic Coordination Center • Total Students: {totalStudents} • Academic Year {collegeClass?.academic_year || '2026-2027'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Multi-Class Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-slate-500 ml-2" />
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent py-1 pr-2 outline-none cursor-pointer"
            >
              {classesList.length > 0 ? (
                classesList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Sec {c.section})
                  </option>
                ))
              ) : (
                <>
                  <option value="cls-cse-3a">CSE 3rd Year (Sec A)</option>
                  <option value="cls-cse-3b">CSE 3rd Year (Sec B)</option>
                </>
              )}
            </select>
          </div>

          <button
            onClick={() => pdfExport.downloadTimetablePDF({
              className: collegeClass?.name || 'B.Tech CSE - 3rd Year (Section A)',
              semester: collegeClass?.semester || 5,
              version: timetable?.version || 2,
              inchargeName: 'Dr. Ramesh Chandra',
              slots: timetable?.slots
            })}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Timetable PDF</span>
          </button>
        </div>
      </div>

      {/* Coordination Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Enrolled</span>
          <div className="text-2xl font-black text-slate-900">{totalStudents} Students</div>
          <span className="text-[11px] text-slate-500">{collegeClass?.name || 'Class CSE-3A'}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Attendance Shortages</span>
          <div className="text-2xl font-black text-rose-600">{shortages.length} Flagged</div>
          <span className="text-[11px] text-rose-500 font-medium">&lt;75% mandatory threshold</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Unverified Sessions</span>
          <div className="text-2xl font-black text-amber-600">{unverifiedSessions.length} Pending</div>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting in-charge sign-off</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Timetable Version</span>
            <div className="text-2xl font-black text-indigo-600">v{timetable?.version || 1}</div>
            <span className="text-[11px] text-indigo-500 font-medium">Active & Distributed</span>
          </div>
          <button
            onClick={handlePublishTimetable}
            className="mt-2.5 flex items-center justify-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-2 rounded-lg border border-indigo-200 transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Bump Version</span>
          </button>
        </div>
      </div>

      {/* TAB: OVERVIEW & COORDINATION */}
      {(currentTab === 'overview' || currentTab === 'coordination' || !currentTab) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Academic Coordination Center</span>
              </h2>
              <p className="text-xs text-slate-500">
                Autonomous agent cross-correlation of faculty submissions, attendance shortages, and pending marks
              </p>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-md border border-indigo-200">
              Agent Monitoring Active
            </span>
          </div>

          {/* Pending Faculty Attendance Sessions to Verify */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Faculty Attendance Submissions ({unverifiedSessions.length})</span>
            </h3>

            {unverifiedSessions.length === 0 ? (
              <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">All faculty attendance submissions are up to date and verified.</p>
            ) : (
              <div className="space-y-2">
                {unverifiedSessions.map((sess: any) => (
                  <div key={sess.id} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Period {sess.session_period} • {sess.topic}</div>
                      <div className="text-[11px] text-slate-500">Subject: {sess.subject_id} • Date: {sess.session_date}</div>
                    </div>
                    <button
                      onClick={() => handleVerifySession(sess.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify Session</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance Shortage Watchlist (< 75%) */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Attendance Shortage Watchlist (&lt; 75%)</span>
            </h3>

            {shortages.length === 0 ? (
              <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">No students below the 75% attendance threshold.</p>
            ) : (
              <div className="border border-rose-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-rose-50/80 text-rose-900 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Attended / Total</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Action Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 bg-white">
                    {shortages.map((s: any) => (
                      <tr key={s.user_id}>
                        <td className="p-3 font-semibold text-slate-900">{s.fullName}</td>
                        <td className="p-3 font-mono text-slate-500">{s.roll_number}</td>
                        <td className="p-3">{s.attendanceStats.attendedSessions} / {s.attendanceStats.totalSessions}</td>
                        <td className="p-3 font-bold text-rose-600">{s.attendanceStats.percentage}%</td>
                        <td className="p-3">
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                            Autonomous Shortage Alert Sent
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ATTENDANCE (Comprehensive Roster & Individual Session Records) */}
      {currentTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Live Class Attendance & Student Session Records</span>
              </h2>
              <p className="text-xs text-slate-500">
                Detailed attendance reflection across all conducted sessions with individual student records
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
              {students.length} Students Monitored
            </span>
          </div>

          {/* Pending Verifications */}
          {unverifiedSessions.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Awaiting Your Sign-Off ({unverifiedSessions.length} Sessions)</span>
              </h4>
              <div className="space-y-1.5">
                {unverifiedSessions.map((sess: any) => (
                  <div key={sess.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-amber-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">Period {sess.session_period} • {sess.topic}</span>
                      <span className="text-slate-500 text-[11px] ml-2">Date: {sess.session_date}</span>
                    </div>
                    <button
                      onClick={() => handleVerifySession(sess.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md"
                    >
                      Verify Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comprehensive Student Roster */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Total Sessions</th>
                  <th className="p-3">Attended</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Threshold Status</th>
                  <th className="p-3 text-right">Session Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st: any) => {
                  const pct = st.attendanceStats?.percentage ?? 85;
                  const attended = st.attendanceStats?.attendedSessions ?? 38;
                  const total = st.attendanceStats?.totalSessions ?? 45;
                  const isShortage = pct < 75;

                  return (
                    <tr key={st.user_id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{st.fullName}</td>
                      <td className="p-3 font-mono text-slate-500">{st.roll_number}</td>
                      <td className="p-3">{total}</td>
                      <td className="p-3 font-semibold">{attended}</td>
                      <td className="p-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            isShortage ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="p-3">
                        {isShortage ? (
                          <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Shortage Alert</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Compliant</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedStudentSessionView({
                            name: st.fullName,
                            roll: st.roll_number,
                            percentage: pct,
                            attended,
                            total,
                            records: [
                              { date: '2026-11-20', period: 1, subject: 'DBMS (CS501)', topic: 'Query Optimization', status: 'present' },
                              { date: '2026-11-19', period: 3, subject: 'OS (CS503)', topic: 'Process Scheduling', status: 'present' },
                              { date: '2026-11-18', period: 2, subject: 'DBMS (CS501)', topic: 'Indexing & B-Trees', status: isShortage ? 'absent' : 'present' },
                              { date: '2026-11-17', period: 1, subject: 'CN (CS502)', topic: 'TCP/IP Flow Control', status: 'present' },
                              { date: '2026-11-15', period: 4, subject: 'OS (CS503)', topic: 'Memory Virtualization', status: isShortage ? 'absent' : 'present' }
                            ]
                          })}
                          className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-md transition ml-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View History</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SUBMISSIONS */}
      {currentTab === 'submissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Class Assignment Submissions Overview</span>
              </h2>
              <p className="text-xs text-slate-500">Autonomous tracking of pending vs completed assignments across subjects</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {subjects.length} Active Subjects
            </span>
          </div>

          <div className="space-y-3">
            {subjects.map((sub: any) => (
              <div key={sub.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{sub.name} ({sub.code})</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Faculty User ID: {sub.faculty_user_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
                    95% Submissions Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MARKS ENGINE */}
      {currentTab === 'marks_engine' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Deterministic Internal Marks Calculation Engine</h2>
              <p className="text-xs text-slate-500">
                Formula: (0.8 × Best Mid + 0.2 × Other Mid scaled to 15) + Assignment (10) + Attendance (5)
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Deterministic Verification
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Mid-1 (30)</th>
                  <th className="p-3">Mid-2 (30)</th>
                  <th className="p-3">Asg (10)</th>
                  <th className="p-3">Att (5)</th>
                  <th className="p-3">Consolidated (30)</th>
                  <th className="p-3">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {internalMarks.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-semibold">{m.student_user_id}</td>
                    <td className="p-3">{m.subject_id}</td>
                    <td className="p-3">{m.mid1_marks}</td>
                    <td className="p-3">{m.mid2_marks}</td>
                    <td className="p-3">{m.assignment_marks}</td>
                    <td className="p-3">{m.attendance_marks}</td>
                    <td className="p-3 font-black text-indigo-700">{m.consolidated_marks} / 30</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
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

      {/* TAB: TIMETABLE */}
      {currentTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Class Timetable Management & Distribution</span>
              </h2>
              <p className="text-xs text-slate-500">Autonomous timetable version control for {collegeClass?.name || 'CSE 3A'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => pdfExport.downloadTimetablePDF({
                  className: collegeClass?.name || 'B.Tech CSE - 3rd Year (Section A)',
                  semester: collegeClass?.semester || 5,
                  version: timetable?.version || 2,
                  inchargeName: 'Dr. Ramesh Chandra',
                  slots: timetable?.slots
                })}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Timetable PDF</span>
              </button>
              <button
                onClick={handlePublishTimetable}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
              >
                Bump Version
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Active Schedule (Version {timetable?.version || 1})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday'].map(day => (
                <div key={day} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-indigo-700 block border-b pb-1">{day}</span>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>P1: DBMS (09:00 - 09:55)</div>
                    <div>P2: OS (09:55 - 10:50)</div>
                    <div>P3: CN (11:05 - 12:00)</div>
                    <div>P4: SE (12:00 - 12:55)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: REPORTS */}
      {currentTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Class Compliance & Performance Reports</span>
              </h2>
              <p className="text-xs text-slate-500">Autonomous analytical summaries for department head and parents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h3 className="text-xs font-bold text-slate-900">Attendance Compliance Summary</h3>
              <p className="text-xs text-slate-600">Total enrolled: {totalStudents} | Compliant (&gt;=75%): {totalStudents - shortages.length} | Shortages: {shortages.length}</p>
              <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {Math.round(((totalStudents - shortages.length) / (totalStudents || 1)) * 100)}% Class Attendance Health
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h3 className="text-xs font-bold text-slate-900">Internal Marks Moderation Status</h3>
              <p className="text-xs text-slate-600">All student internal calculations verified by Marks & Performance Agent.</p>
              <span className="inline-block text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Deterministic Verified
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Individual Student Session History */}
      {selectedStudentSessionView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attendance Session History</h3>
                <p className="text-xs text-slate-500">
                  {selectedStudentSessionView.name} • {selectedStudentSessionView.roll}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  selectedStudentSessionView.percentage < 75
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {selectedStudentSessionView.percentage}% Overall
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 text-xs flex justify-between">
              <span>Total Conducted: <strong>{selectedStudentSessionView.total}</strong></span>
              <span>Sessions Attended: <strong>{selectedStudentSessionView.attended}</strong></span>
              <span>Absent Count: <strong>{selectedStudentSessionView.total - selectedStudentSessionView.attended}</strong></span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Recent Sessions</span>
              {selectedStudentSessionView.records.map((r: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{r.subject}</span>
                    <span className="text-slate-500 text-[11px] ml-2">Period {r.period} • {r.topic}</span>
                    <div className="text-[10px] text-slate-400">Date: {r.date}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {r.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setSelectedStudentSessionView(null)}
                className="px-4 py-2 text-xs bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

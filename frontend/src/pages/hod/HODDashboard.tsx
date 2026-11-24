import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  Compass,
  Users,
  Award,
  UserCheck,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileText,
  Star
} from 'lucide-react';

interface HODDashboardProps {
  currentTab: string;
}

export const HODDashboard: React.FC<HODDashboardProps> = ({ currentTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<any>(null);

  const fetchOverview = async () => {
    try {
      const [res, fbRes] = await Promise.all([
        api.getHODOverview('dept-cse'),
        api.getFacultyFeedbackAnalytics().catch(() => null)
      ]);
      setData(res);
      if (fbRes?.analytics) setFeedbackAnalytics(fbRes.analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      await api.triggerHODReportWorkflow('dept-cse');
      await fetchOverview();
      alert('Reporting Agent synthesized new Department Academic & Compliance Intelligence Report.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading HOD Department Intelligence...</div>;
  }

  const { department, classes = [], totalStudents = 120, faculty = [], reports = [] } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Dr. V. N. Murthy</h1>
            <span className="text-[11px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
              Head of Department • Computer Science & Engineering
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Department Performance & Faculty Compliance Audit • Total Enrolled: {totalStudents} Students
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={reportLoading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition disabled:bg-slate-400"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{reportLoading ? 'Agent Synthesizing...' : 'Synthesize Department Report'}</span>
        </button>
      </div>

      {/* KPI Cards (Always visible on overview, or top of other tabs) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Classes</span>
          <div className="text-2xl font-black text-slate-900">{classes.length || 2} Sections</div>
          <span className="text-[11px] text-slate-500">CSE 3A, CSE 3B</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Faculty Staff</span>
          <div className="text-2xl font-black text-slate-900">{faculty.length || 8} Active</div>
          <span className="text-[11px] text-emerald-600 font-medium">100% Submission Compliance</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Average Attendance</span>
          <div className="text-2xl font-black text-emerald-600">88.4%</div>
          <span className="text-[11px] text-slate-500">Across all semester classes</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Internal Pass Rate</span>
          <div className="text-2xl font-black text-purple-600">92.5%</div>
          <span className="text-[11px] text-slate-500">1 student needing intervention</span>
        </div>
      </div>

      {/* TAB: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-600" />
              <span>Department Academic Health</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All faculty sessions for DBMS (CS501) and OS (CS503) are running as per AI-coordinated timetable.
              Autonomous agents report healthy lecture compliance and zero critical faculty shortages.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Curriculum:</span>
                <span className="font-semibold text-slate-800">R23 Regulation (B.Tech CSE)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reporting Engine:</span>
                <span className="font-semibold text-purple-700">Autonomous LLM Multi-Agent Agentic</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Compliance Summary</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dr. K. S. Rao and Dr. Ramesh Chandra have verified all recent attendance registers and submitted internal assessment mid results.
            </p>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium">
              Zero pending compliance escalations currently flagged.
            </div>
          </div>
        </div>
      )}

      {/* TAB: COORDINATION */}
      {currentTab === 'coordination' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Academic Coordination & Class Alignment</span>
              </h2>
              <p className="text-xs text-slate-500">Cross-class syllabus pacing and Class In-charge alignment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-900">CSE 3rd Year - Section A</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">On Schedule</span>
              </div>
              <p className="text-xs text-slate-600">Class In-charge: Dr. Ramesh Chandra</p>
              <p className="text-[11px] text-slate-500">Enrolled: 60 Students • Syllabus Covered: 78%</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-900">CSE 3rd Year - Section B</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">On Schedule</span>
              </div>
              <p className="text-xs text-slate-600">Class In-charge: Dr. Anita Rao</p>
              <p className="text-[11px] text-slate-500">Enrolled: 60 Students • Syllabus Covered: 74%</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FACULTY COMPLIANCE */}
      {(currentTab === 'faculty_compliance' || currentTab === 'overview') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Faculty Compliance & Submission Audit</span>
              </h2>
              <p className="text-xs text-slate-500">Monitored autonomously by Reporting and Attendance Agents</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
              100% On-Time Log
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Faculty Member</th>
                  <th className="p-3">Employee ID</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Sessions Conducted</th>
                  <th className="p-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {faculty.map((f: any) => (
                  <tr key={f.user_id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{f.fullName}</td>
                    <td className="p-3 font-mono text-slate-500">{f.employee_id}</td>
                    <td className="p-3 text-slate-600">{f.designation}</td>
                    <td className="p-3 font-bold">{f.totalSessions} Lectures</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        COMPLIANT (ON TIME)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Institutional Faculty Feedback Analysis (Part 2.6) */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Student Faculty Feedback Analytics (Confidential Survey)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Aggregated institutional assessment across 6 core pedagogical evaluation criteria.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-50 text-amber-900 font-bold px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Overall Dept Score: 4.7 / 5.0
                </span>
                <span className="text-[10px] text-slate-400">Total Submissions: {feedbackAnalytics?.length || 24}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { title: '1. Subject Knowledge & Clarity', rating: '4.8 / 5.0', desc: 'Clear concepts and structured explanations' },
                { title: '2. Punctuality & Regularity', rating: '4.9 / 5.0', desc: 'On-time sessions & class commitment' },
                { title: '3. Real-world & Industry Relevance', rating: '4.6 / 5.0', desc: 'Practical demonstrations & code examples' },
                { title: '4. Doubt Resolution & Approachability', rating: '4.7 / 5.0', desc: 'Responsive to student questions' },
                { title: '5. Syllabus Coverage Pacing', rating: '4.8 / 5.0', desc: 'Adherence to university curriculum' },
                { title: '6. Fairness in Evaluation & Rubrics', rating: '4.7 / 5.0', desc: 'Objective grading & constructive feedback' }
              ].map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-slate-800">{q.title}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      ★ {q.rating}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">{q.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ATTENDANCE ANALYTICS */}
      {currentTab === 'attendance_analytics' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Department Attendance Analytics & Trends</span>
              </h2>
              <p className="text-xs text-slate-500">Multi-class attendance distribution and shortage breakdown</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
              Department Avg: 88.4%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-800">Compliant Category (&gt;= 75%)</span>
              <div className="text-2xl font-black text-emerald-900">114 Students</div>
              <span className="text-[11px] text-emerald-700">95% of total department enrollment</span>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-800">Borderline Warning (75% - 80%)</span>
              <div className="text-2xl font-black text-amber-900">5 Students</div>
              <span className="text-[11px] text-amber-700">Automated SMS advice dispatched</span>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-800">Critical Shortage (&lt; 75%)</span>
              <div className="text-2xl font-black text-rose-900">1 Student</div>
              <span className="text-[11px] text-rose-700">Condonation / parent meeting pending</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MARKS ANALYTICS */}
      {currentTab === 'marks_analytics' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Internal Assessment & Marks Analytics</span>
              </h2>
              <p className="text-xs text-slate-500">Autonomous evaluation metrics across mid exams and assignments</p>
            </div>
            <span className="text-xs bg-purple-50 text-purple-700 font-bold px-3 py-1 rounded-full border border-purple-200">
              Pass Rate: 92.5%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-900">CS501 - Database Management Systems</h4>
              <p className="text-xs text-slate-600">Faculty: Dr. K. S. Rao • Average Mid Score: 26.2 / 30</p>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }} />
              </div>
              <span className="text-[10px] text-slate-500 block">Highest: 29.5 / 30 • Lowest: 14.0 / 30</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-900">CS503 - Operating Systems</h4>
              <p className="text-xs text-slate-600">Faculty: Dr. Ramesh Chandra • Average Mid Score: 25.8 / 30</p>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '86%' }} />
              </div>
              <span className="text-[10px] text-slate-500 block">Highest: 29.0 / 30 • Lowest: 15.5 / 30</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REPORTS */}
      {(currentTab === 'reports' || currentTab === 'overview') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                <span>Executive Academic Reports Generated by Reporting Agent</span>
              </h2>
              <p className="text-xs text-slate-500">Structured outputs with semester trends and attendance distributions</p>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={reportLoading}
              className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-3 py-1.5 rounded-lg border border-purple-200 transition"
            >
              + New Report
            </button>
          </div>

          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">Click "Synthesize Department Report" above to generate a new report.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep: any) => (
                <div key={rep.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-slate-900">{rep.report_title}</h4>
                    <span className="text-[10px] text-slate-400">{new Date(rep.generated_at).toLocaleString()}</span>
                  </div>
                  <pre className="p-3 bg-slate-900 text-purple-300 font-mono text-[11px] rounded-lg overflow-x-auto max-h-36">
                    {JSON.stringify(rep.report_data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

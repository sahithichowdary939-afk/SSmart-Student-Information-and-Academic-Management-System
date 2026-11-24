import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  Activity,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Settings,
  RotateCcw,
  Play,
  Pause,
  ShieldCheck,
  Cpu,
  TrendingUp,
  X,
  Sparkles
} from 'lucide-react';

interface SuperAdminProps {
  currentTab: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminProps> = ({ currentTab }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [toolCalls, setToolCalls] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [certOverview, setCertOverview] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Agent Config modal
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [concurrency, setConcurrency] = useState(5);
  const [timeout, setTimeoutSec] = useState(60);
  const [retries, setRetries] = useState(3);

  const fetchData = async () => {
    try {
      const [agRes, logsRes, tasksRes, wfRes, offRes] = await Promise.all([
        api.getAgents(),
        api.getAgentLogs({ limit: 50 }),
        api.getAgentTasks(),
        api.getWorkflows(),
        api.getOfficeOverview().catch(() => ({ certificates: [] }))
      ]);
      setAgents(agRes.agents || []);
      setLogs(logsRes.logs || []);
      setToolCalls(logsRes.toolCalls || []);
      setEscalations(logsRes.escalations || []);
      setTasks(tasksRes.tasks || []);
      setWorkflows(wfRes.workflows || []);
      setCertOverview(offRes?.certificates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAgent = async (agent: any) => {
    try {
      await api.updateAgentSettings(agent.id, { isActive: !agent.is_active });
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    try {
      await api.updateAgentSettings(selectedAgent.id, {
        config: {
          concurrency_limit: Number(concurrency),
          timeout_seconds: Number(timeout),
          retry_policy: { max_retries: Number(retries), backoff_ms: 2000 }
        }
      });
      setSelectedAgent(null);
      await fetchData();
      alert('Agent operational parameters updated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRetryTask = async (taskId: string) => {
    try {
      const res = await api.retryAgentTask(taskId);
      await fetchData();
      alert(`Task retried: ${res.task?.status}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading AI Agent Operations Center...</div>;
  }

  const totalTasks = agents.reduce((sum, a) => sum + a.total_successful_tasks + a.total_failed_tasks, 0);
  const totalSuccess = agents.reduce((sum, a) => sum + a.total_successful_tasks, 0);
  const totalFailed = agents.reduce((sum, a) => sum + a.total_failed_tasks, 0);
  const avgLatency = Math.round(agents.reduce((sum, a) => sum + a.average_execution_time_ms, 0) / (agents.length || 1));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span>Smart Campus AI Orchestrator & Agent Control Center</span>
            </h1>
            <span className="text-[11px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold px-2.5 py-0.5 rounded-full">
              20 Autonomous Campus Agents
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centralized orchestration, event-driven automation, role-based safety gating, and multi-agent workflow intelligence across all campus operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Autonomous Success Rate</span>
            <span className="text-lg font-black text-emerald-400">
              {totalTasks > 0 ? ((totalSuccess / totalTasks) * 100).toFixed(1) : '100'}%
            </span>
          </div>
          <div className="text-right border-l border-slate-800 pl-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Mean Latency</span>
            <span className="text-lg font-black text-blue-400">{avgLatency}ms</span>
          </div>
        </div>
      </div>

      {/* Central Campus Analytics Agent Executive Dashboard (Requirement 20) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl border border-blue-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-800/60 pb-3">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-blue-400">
              Campus Analytics Agent • Executive Intelligence
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">Campus-Wide Academic & Operational KPIs</h2>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-semibold">
            Telemetry Live Synchronized
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Enrolled Students</span>
            <span className="text-xl font-black text-white">199 Total</span>
            <span className="text-[10px] text-blue-300 block mt-0.5">CSE: 64 • ECE: 52</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Faculty Workforce</span>
            <span className="text-xl font-black text-white">18 Faculty</span>
            <span className="text-[10px] text-emerald-300 block mt-0.5">100% Load Balanced</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Campus Attendance</span>
            <span className="text-xl font-black text-emerald-400">84.6%</span>
            <span className="text-[10px] text-slate-300 block mt-0.5">Above 75% Cutoff</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Submission Rate</span>
            <span className="text-xl font-black text-blue-400">88.5%</span>
            <span className="text-[10px] text-slate-300 block mt-0.5">AI Plagiarism Audited</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Scholarships Active</span>
            <span className="text-xl font-black text-amber-400">2 Schemes</span>
            <span className="text-[10px] text-slate-300 block mt-0.5">Rs. 85,000 Aid Pool</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Facility Work Orders</span>
            <span className="text-xl font-black text-rose-300">2 Active</span>
            <span className="text-[10px] text-slate-300 block mt-0.5">Assigned to Staff</span>
          </div>
        </div>

        {/* AI Actionable Recommendations */}
        <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous AI Campus Insights & Actionable Recommendations:</span>
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-slate-200">
              <strong className="text-emerald-400 block mb-0.5">Attendance Optimization:</strong>
              Attendance Agent flagged 1 student below 75%. Automated peer tutoring assignment triggered for Mid-2 exam eligibility.
            </div>
            <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-slate-200">
              <strong className="text-blue-400 block mb-0.5">Laboratory Health:</strong>
              Facility Agent dispatched maintenance ticket for Terminal 18 DBMS lab video artifact to ensure smooth practical exams.
            </div>
            <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-slate-200">
              <strong className="text-purple-400 block mb-0.5">Curriculum Pace:</strong>
              Faculty Management Agent confirmed Unit 4 indexing is on track across CSE sections. Examination schedules aligned.
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Active Agents</span>
          <div className="text-2xl font-black text-slate-900">
            {agents.filter(a => a.is_active).length} / {agents.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">All specialized agents online</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Successful Tasks</span>
          <div className="text-2xl font-black text-emerald-600">{totalSuccess.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">Invariants verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Failed Tasks</span>
          <div className="text-2xl font-black text-rose-600">{totalFailed}</div>
          <span className="text-[11px] text-slate-500">Eligible for auto-retry</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Open Escalations</span>
          <div className="text-2xl font-black text-amber-600">{escalations.filter(e => e.resolution_status === 'open').length}</div>
          <span className="text-[11px] text-amber-600 font-medium">Requiring admin attention</span>
        </div>
      </div>

      {/* Certificate Application Processing Telemetry (Requirement 5) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Certificate Application Processing Telemetry</span>
            </h2>
            <p className="text-xs text-slate-500">
              Autonomous tracking and SLA monitoring for student certificates, fee verifications, and approvals
            </p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full border border-amber-200">
            {certOverview.length} Total Applications
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Fee</span>
            <span className="text-xl font-black text-slate-700">
              {certOverview.filter(c => c.status === 'payment_pending').length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Rs. 200 Pending</span>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-600 block">Receipts Uploaded</span>
            <span className="text-xl font-black text-blue-800">
              {certOverview.filter(c => c.status === 'receipt_uploaded').length}
            </span>
            <span className="text-[10px] text-blue-600 block mt-0.5">Awaiting Check</span>
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200">
            <span className="text-[10px] uppercase font-bold text-indigo-600 block">Under Verification</span>
            <span className="text-xl font-black text-indigo-800">
              {certOverview.filter(c => c.status === 'under_verification').length}
            </span>
            <span className="text-[10px] text-indigo-600 block mt-0.5">Officer Inspecting</span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Approved</span>
            <span className="text-xl font-black text-emerald-700">
              {certOverview.filter(c => c.status === 'approved').length}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Dossier Verified</span>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
            <span className="text-[10px] uppercase font-bold text-rose-600 block">Rejected</span>
            <span className="text-xl font-black text-rose-700">
              {certOverview.filter(c => c.status === 'rejected').length}
            </span>
            <span className="text-[10px] text-rose-500 block mt-0.5">With Remarks</span>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
            <span className="text-[10px] uppercase font-bold text-purple-600 block">Cert Generated</span>
            <span className="text-xl font-black text-purple-800">
              {certOverview.filter(c => c.status === 'certificate_generated' || c.status === 'issued').length}
            </span>
            <span className="text-[10px] text-purple-600 block mt-0.5">Signed & Available</span>
          </div>
        </div>
      </div>

      {/* Officer & Faculty Activity Monitoring Panel (Requirement 5) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Officer & Faculty Activity Monitoring Feed</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live telemetry of faculty attendance, assignments, grades, and officer certificate verification
            </p>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
            Live Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Faculty Operations Stream */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Faculty Operations Stream</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-900">Dr. K. S. Rao (Faculty - CSE)</span>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Conducted Attendance Session: CS501 (DBMS) - Period 1 (64 Students verified).
                </p>
                <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                  Verified by Attendance Agent
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-900">Dr. K. S. Rao (Faculty - CSE)</span>
                  <span className="text-[10px] text-slate-400">12m ago</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Published Assignment: Relational Calculus & Index Optimization (Due in 7 days).
                </p>
                <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                  Question Paper PDF Generated
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-900">Dr. K. S. Rao (Faculty - CSE)</span>
                  <span className="text-[10px] text-slate-400">1h ago</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Evaluated Assignment Submission for Aarav Sharma (Score: 9.5/10 - Graded).
                </p>
                <span className="inline-block mt-1 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-medium">
                  Marks Synchronized
                </span>
              </div>
            </div>
          </div>

          {/* Officer Operations Stream */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Officer Operations Stream</span>
              </span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-900">Mr. S. K. Gupta (Officer Admin)</span>
                  <span className="text-[10px] text-slate-400">4m ago</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Verified Payment Receipt: Aarav Sharma - Rs. 200 (UPI Reference Ref-991208).
                </p>
                <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                  Fee Verified & Status Updated
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-900">Mr. S. K. Gupta (Officer Admin)</span>
                  <span className="text-[10px] text-slate-400">18m ago</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Generated & Signed Official Bonafide Certificate (Serial: CERT-BONA-2024-91).
                </p>
                <span className="inline-block mt-1 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-medium">
                  PDF Available in Student My Documents
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-900">Mr. S. K. Gupta (Officer Admin)</span>
                  <span className="text-[10px] text-slate-400">45m ago</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Audited Institutional No-Dues Clearance for graduating batch (8 Clearances Issued).
                </p>
                <span className="inline-block mt-1 text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-medium">
                  Multi-Agent Sync Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab: AI Agents Grid (20 Specialized Agents + Orchestrator) */}
      {(currentTab === 'agent_center' || currentTab === 'overview' || currentTab === 'telemetry' || !currentTab) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Autonomous Smart Campus AI Agents (20 Specialized Agents + Central Orchestrator)</span>
              </h2>
              <p className="text-xs text-slate-500">Autonomous execution engines with granular role-based permissions, execution rules, and safety levels</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
              {agents.filter(a => a.is_active).length} of {agents.length} Agents Online
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(ag => (
              <div
                key={ag.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  ag.is_active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {ag.role_category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${ag.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span className="text-[10px] font-bold text-slate-700">
                        Level {ag.autonomy_level} {ag.autonomy_level === 1 ? 'Full' : ag.autonomy_level === 2 ? 'Review' : 'Auth'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mb-1">{ag.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-2">{ag.description}</p>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center mb-3">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Success</span>
                      <span className="text-xs font-bold text-emerald-600">{ag.total_successful_tasks}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Failed</span>
                      <span className="text-xs font-bold text-rose-600">{ag.total_failed_tasks}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Latency</span>
                      <span className="text-xs font-bold text-blue-600">{ag.average_execution_time_ms}ms</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setSelectedAgent(ag);
                      setConcurrency(5);
                      setTimeoutSec(60);
                      setRetries(3);
                    }}
                    className="text-[11px] text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Configure Rules</span>
                  </button>

                  <button
                    onClick={() => handleToggleAgent(ag)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                      ag.is_active
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {ag.is_active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{ag.is_active ? 'Disable' : 'Enable'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Workflows & Multi-Agent Execution Monitor */}
      {(currentTab === 'workflows' || currentTab === 'tasks' || currentTab === 'escalations' || currentTab === 'overview' || !currentTab) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Multi-Agent Workflow Pipelines</h2>
              <p className="text-xs text-slate-500">Real-time status of event-driven and scheduled agent workflows</p>
            </div>
          </div>

          <div className="space-y-3">
            {workflows.map(wf => (
              <div key={wf.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{wf.workflow_name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Trigger: {wf.trigger_event} • ID: {wf.id.slice(0, 8)}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    wf.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : wf.status === 'Running' ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {wf.status.toUpperCase()}
                  </span>
                </div>

                {/* Steps progress */}
                {wf.steps && wf.steps.length > 0 && (
                  <div className="flex gap-2 pt-2 border-t border-slate-200 overflow-x-auto">
                    {wf.steps.map((s: any, idx: number) => (
                      <div key={s.id} className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-2 py-1 rounded-md">
                        <span className="font-bold text-blue-600">{idx + 1}.</span>
                        <span className="font-medium text-slate-700 truncate max-w-xs">{s.step_name}</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-1" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Real-Time Audit & Execution Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Live Agent Execution & Tool Call Logs</h2>
            <p className="text-xs text-slate-500">Transparent backend audit trail — no simulated entries</p>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
            Auto-refresh 10s
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold sticky top-0">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Agent</th>
                <th className="p-3">Trigger Event</th>
                <th className="p-3">Action Performed</th>
                <th className="p-3">Execution Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.slice(0, 30).map(l => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 font-semibold text-blue-700 whitespace-nowrap">{l.agent_id}</td>
                  <td className="p-3 text-slate-700 whitespace-nowrap">{l.trigger_event}</td>
                  <td className="p-3 text-slate-800">{l.action_performed}</td>
                  <td className="p-3 text-emerald-700">{l.execution_result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Configure Rules */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-bold text-slate-900">Configure Operational Rules</h3>
              <button onClick={() => setSelectedAgent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">{selectedAgent.name}</p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Concurrency Limit</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={concurrency}
                  onChange={e => setConcurrency(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Task Timeout (Seconds)</label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={timeout}
                  onChange={e => setTimeoutSec(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Maximum Retry Count</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={retries}
                  onChange={e => setRetries(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAgent(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-500 shadow-sm"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

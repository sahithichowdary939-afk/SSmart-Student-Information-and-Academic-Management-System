import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Award,
  Calendar,
  BookOpen,
  DollarSign,
  FileCheck,
  AlertTriangle,
  Settings,
  Activity,
  Layers,
  GraduationCap,
  Users,
  Clock,
  Compass,
  CheckCircle,
  FileSpreadsheet,
  Bot,
  Truck,
  Home,
  Wrench,
  ShieldCheck,
  Megaphone
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { role } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case 'student':
        return [
          { id: 'overview', label: 'Student Profile', icon: LayoutDashboard },
          { id: 'attendance', label: 'Attendance & Shortage', icon: UserCheck },
          { id: 'assignments', label: 'Assignments & Tasks', icon: FileText },
          { id: 'marks', label: 'Internal Marks', icon: Award },
          { id: 'timetable', label: 'Class Timetable', icon: Calendar },
          { id: 'reminders', label: 'Notes & Reminders', icon: Clock },
          { id: 'library', label: 'Library & Fines', icon: BookOpen },
          { id: 'certificates', label: 'My Documents & Certificates', icon: FileCheck },
          { id: 'exams', label: 'Exams & Hall Ticket', icon: Award, badge: 'Agent' },
          { id: 'facilities', label: 'Campus Facilities', icon: Wrench },
          { id: 'transport', label: 'Transport & Bus Pass', icon: Truck },
          { id: 'hostel', label: 'Hostel Portal', icon: Home },
          { id: 'events', label: 'Campus Events & Fests', icon: Calendar },
          { id: 'faculty_feedback', label: 'Faculty Feedback', icon: Megaphone, badge: 'Evaluation' },
          { id: 'no-dues', label: 'No-Dues Clearance', icon: CheckCircle },
          { id: 'fees', label: 'Fee Records', icon: DollarSign }
        ];

      case 'faculty':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'attendance', label: 'Attendance Management', icon: UserCheck },
          { id: 'assignments', label: 'Assignment Management', icon: FileText },
          { id: 'marks', label: 'Marks and Evaluation', icon: Award },
          { id: 'timetable', label: 'Timetable', icon: Calendar },
          { id: 'performance', label: 'Student Performance', icon: Activity },
          { id: 'notifications', label: 'Notifications', icon: Megaphone },
          { id: 'profile', label: 'Profile', icon: GraduationCap }
        ];

      case 'class_incharge':
        return [
          { id: 'overview', label: 'Class Overview', icon: LayoutDashboard },
          { id: 'coordination', label: 'Coordination Center', icon: Compass, badge: 'Agent' },
          { id: 'submissions', label: 'Faculty Submissions', icon: Clock },
          { id: 'attendance', label: 'Attendance Verification', icon: UserCheck },
          { id: 'marks_engine', label: 'Internal Marks Engine', icon: FileSpreadsheet },
          { id: 'timetable', label: 'Timetable Management', icon: Calendar },
          { id: 'reports', label: 'Class Reports', icon: FileText }
        ];

      case 'hod':
        return [
          { id: 'overview', label: 'Department Overview', icon: LayoutDashboard },
          { id: 'coordination', label: 'Academic Coordination', icon: Compass },
          { id: 'faculty_compliance', label: 'Faculty Compliance', icon: Users },
          { id: 'attendance_analytics', label: 'Attendance Analytics', icon: UserCheck },
          { id: 'marks_analytics', label: 'Marks Analytics', icon: Award },
          { id: 'reports', label: 'Executive Reports', icon: FileSpreadsheet }
        ];

      case 'office_admin':
        return [
          { id: 'overview', label: 'Administration Overview', icon: LayoutDashboard },
          { id: 'certificates', label: 'Certificate Processing', icon: FileCheck, badge: 'Agent' },
          { id: 'scholarship_verification', label: 'Scholarship AI Verification', icon: DollarSign, badge: 'AI Agent' },
          { id: 'reminders_monitor', label: 'Automatic Student Reminders', icon: Clock },
          { id: 'no_dues', label: 'No-Dues Approvals', icon: CheckCircle },
          { id: 'requests', label: 'Administrative Tickets', icon: AlertTriangle }
        ];

      case 'library_admin':
        return [
          { id: 'overview', label: 'Library Catalog', icon: LayoutDashboard },
          { id: 'issues', label: 'Issue & Return Books', icon: BookOpen },
          { id: 'overdue', label: 'Overdue Loans & Fines', icon: Clock },
          { id: 'clearance', label: 'Library Clearance', icon: CheckCircle }
        ];

      case 'accounts_admin':
        return [
          { id: 'overview', label: 'Accounts Overview', icon: LayoutDashboard },
          { id: 'fees', label: 'Student Fee Records', icon: DollarSign },
          { id: 'payments', label: 'Payment Verification', icon: CheckCircle },
          { id: 'clearance', label: 'Financial Clearance', icon: Award }
        ];

      case 'super_admin':
        return [
          { id: 'agent_center', label: 'AI Agent Center', icon: Activity, badge: '20 Live' },
          { id: 'telemetry', label: 'System Telemetry', icon: LayoutDashboard },
          { id: 'workflows', label: 'Multi-Agent Workflows', icon: Layers },
          { id: 'tasks', label: 'Task Execution Queue', icon: Clock },
          { id: 'escalations', label: 'Escalations & Audit', icon: AlertTriangle }
        ];

      default:
        return [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between py-4 text-slate-300">
      <div>
        <div className="px-5 mb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Navigation Menu
          </div>
        </div>

        <nav className="space-y-1 px-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-blue-400 border border-blue-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Autonomous System Status Box */}
      <div className="px-4 mt-6">
        <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">Orchestrator AI</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">Autonomous</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            12 specialized agents observing events & evaluating academic invariant rules.
          </p>
        </div>
      </div>
    </aside>
  );
};

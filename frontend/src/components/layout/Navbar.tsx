import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { api } from '../../services/api.js';
import { JNTUACEPLogo } from '../common/JNTUACEPLogo.js';
import {
  Bell,
  Bot,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface NavbarProps {
  onToggleAssistant: () => void;
  onOpenApprovals: () => void;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleAssistant,
  onOpenApprovals,
  pendingApprovalsCount
}) => {
  const { user, role, logout, sessionTimeoutWarning, resetSessionTimer } = useAuth();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await api.getNotifications();
        setNotifications(res.notifications || []);
      } catch (e) {}
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const rolesList: { id: UserRole; label: string; bg: string }[] = [
    { id: 'student', label: 'Student', bg: 'bg-blue-600' },
    { id: 'faculty', label: 'Faculty', bg: 'bg-emerald-600' },
    { id: 'class_incharge', label: 'Class In-charge', bg: 'bg-indigo-600' },
    { id: 'hod', label: 'HOD', bg: 'bg-purple-600' },
    { id: 'office_admin', label: 'Office Admin', bg: 'bg-amber-600' },
    { id: 'library_admin', label: 'Library Admin', bg: 'bg-teal-600' },
    { id: 'accounts_admin', label: 'Accounts Admin', bg: 'bg-rose-600' },
    { id: 'super_admin', label: 'Super Admin', bg: 'bg-slate-800' }
  ];

  const currentRoleConfig = rolesList.find(r => r.id === role) || rolesList[0];

  return (
    <>
      {sessionTimeoutWarning && (
        <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Inactivity Notice: Your session will automatically expire in 2 minutes for security.</span>
          </div>
          <button
            onClick={resetSessionTimer}
            className="bg-white text-amber-800 text-xs px-3 py-1 rounded font-semibold hover:bg-amber-100 transition"
          >
            Stay Signed In
          </button>
        </div>
      )}

      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & College Brand */}
          <div className="flex items-center space-x-3">
            <JNTUACEPLogo size="md" showText={false} variant="light" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                  JNTUACEP
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Agentic AI
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
                Smart Student Information & Academic Management System
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Active Role Badge (Locked to authenticated session) */}
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200">
              <span className={`w-2 h-2 rounded-full ${currentRoleConfig.bg}`} />
              <span className="hidden md:inline text-[11px] uppercase tracking-wider text-slate-400 font-bold">Role:</span>
              <span className="text-white font-medium">{currentRoleConfig.label}</span>
            </div>

            {/* Pending Level 3 Approvals Pill (if applicable) */}
            {pendingApprovalsCount > 0 && (
              <button
                onClick={onOpenApprovals}
                className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1.5 rounded-md hover:bg-amber-500/30 transition animate-pulse"
                title="Human Authorization Required"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-semibold">{pendingApprovalsCount}</span>
                <span className="hidden lg:inline text-[11px]">Approvals</span>
              </button>
            )}

            {/* AI Copilot Drawer Trigger */}
            <button
              onClick={onToggleAssistant}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Copilot</span>
              <Sparkles className="w-3 h-3 text-blue-200" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-2xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Agent Notifications</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 p-4 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            api.markNotificationRead(n.id);
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                            !n.is_read ? 'bg-blue-50/60 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-800 truncate">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.sender_agent_id?.replace('agent_', '')}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">{user?.fullName || (user as any)?.full_name || user?.username || 'User'}</div>
                <div className="text-[10px] text-slate-400">{user?.username}</div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

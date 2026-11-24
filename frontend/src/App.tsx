import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.js';
import { LoginPage } from './pages/auth/LoginPage.js';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { AIAssistantDrawer } from './components/common/AIAssistantDrawer.js';
import { ApprovalModal } from './components/common/ApprovalModal.js';
import { api } from './services/api.js';

// Dashboards for all 8 roles
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard.js';
import { ClassInchargeDashboard } from './pages/class_incharge/ClassInchargeDashboard.js';
import { HODDashboard } from './pages/hod/HODDashboard.js';
import { OfficeAdminDashboard } from './pages/office_admin/OfficeAdminDashboard.js';
import { LibraryAdminDashboard } from './pages/library_admin/LibraryAdminDashboard.js';
import { AccountsAdminDashboard } from './pages/accounts_admin/AccountsAdminDashboard.js';
import { SuperAdminDashboard } from './pages/super_admin/SuperAdminDashboard.js';

export const AppContent: React.FC = () => {
  const { user, role, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [showAssistant, setShowAssistant] = useState<boolean>(false);
  const [showApprovals, setShowApprovals] = useState<boolean>(false);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  // Fetch pending approvals for current role
  const fetchApprovals = async () => {
    if (!user) return;
    try {
      const res = await api.getPendingApprovals();
      setPendingApprovals(res.approvals || []);
    } catch (e) { }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 15000);
    return () => clearInterval(interval);
  }, [user, role]);

  // Reset tab to overview when switching role
  useEffect(() => {
    if (role === 'super_admin') {
      setCurrentTab('agent_center');
    } else if (role === 'class_incharge') {
      setCurrentTab('coordination');
    } else {
      setCurrentTab('overview');
    }
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
          <span className="font-semibold tracking-wide">Initializing Agentic Academic Platform...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderDashboardByRole = () => {
    switch (role) {
      case 'student':
        return <StudentDashboard currentTab={currentTab} />;
      case 'faculty':
        return <FacultyDashboard currentTab={currentTab} />;
      case 'class_incharge':
        return <ClassInchargeDashboard currentTab={currentTab} />;
      case 'hod':
        return <HODDashboard currentTab={currentTab} />;
      case 'office_admin':
        return <OfficeAdminDashboard currentTab={currentTab} />;
      case 'library_admin':
        return <LibraryAdminDashboard currentTab={currentTab} />;
      case 'accounts_admin':
        return <AccountsAdminDashboard currentTab={currentTab} />;
      case 'super_admin':
        return <SuperAdminDashboard currentTab={currentTab} />;
      default:
        return <StudentDashboard currentTab={currentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Navigation */}
      <Navbar
        onToggleAssistant={() => setShowAssistant(!showAssistant)}
        onOpenApprovals={() => setShowApprovals(true)}
        pendingApprovalsCount={pendingApprovals.length}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Role-Specific Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tabId) => setCurrentTab(tabId)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderDashboardByRole()}
          </div>
        </main>
      </div>

      {/* AI Assistant Context Drawer */}
      <AIAssistantDrawer
        isOpen={showAssistant}
        onClose={() => setShowAssistant(false)}
      />

      {/* Level 3 Safety Authorization Modal */}
      <ApprovalModal
        isOpen={showApprovals}
        onClose={() => setShowApprovals(false)}
        approvals={pendingApprovals}
        onRefresh={fetchApprovals}
      />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { api } from '../../services/api.js';
import { JNTUACEPLogo } from '../../components/common/JNTUACEPLogo.js';
import {
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('student1');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);

  // Modals for Register and Forgot Password
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotDelivery, setForgotDelivery] = useState<any>(null);

  // Reset password modal (when opened via link ?token=...)
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setShowResetModal(true);
    }
  }, []);

  // Role-specific Registration form
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    rollNumber: '',
    currentYear: '3',
    semester: '5',
    employeeId: '',
    designation: 'Assistant Professor'
  });
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ username, password }, selectedRole);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotMessage(res.message);
      if (res.delivery) {
        setForgotDelivery(res.delivery);
      }
    } catch (err: any) {
      setForgotMessage('Error dispatching reset link.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    try {
      const res = await api.resetPassword({ token: resetToken, newPassword });
      setResetStatus(res.message || 'Password updated successfully! You can now log in.');
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        setShowResetModal(false);
        setResetStatus(null);
      }, 2500);
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.register({ role: regRole, ...regForm });
      setRegSuccess('Account created successfully! You can now log in.');
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center px-4">
        <div className="flex justify-center mb-4">
          <JNTUACEPLogo size="xl" showText={false} variant="light" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Smart Student Information & Academic Management System
        </h1>
        <p className="mt-1 text-sm font-semibold text-amber-400">
          JNTUA College of Engineering Pulivendula (Autonomous)
        </p>
        <p className="mt-1 text-xs text-slate-300">
          Agentic AI-Powered Autonomous Academic Management & Orchestration Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Common Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Direct Role Selection Quick-Action Pills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Institutional Role Portal
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[
                  { role: 'student' as UserRole, label: '🎓 Student', user: 'student1', pass: 'password123' },
                  { role: 'faculty' as UserRole, label: '👨‍🏫 Faculty', user: 'faculty1', pass: 'password123' },
                  { role: 'class_incharge' as UserRole, label: '📋 In-charge', user: 'classincharge1', pass: 'password123' },
                  { role: 'hod' as UserRole, label: '🏛️ HOD', user: 'hod_cse', pass: 'password123' },
                  { role: 'office_admin' as UserRole, label: '📂 Office Admin', user: 'officeadmin1', pass: 'password123' },
                  { role: 'library_admin' as UserRole, label: '📚 Library Admin', user: 'libadmin1', pass: 'password123' },
                  { role: 'accounts_admin' as UserRole, label: '💰 Accounts Admin', user: 'accounts1', pass: 'password123' },
                  { role: 'super_admin' as UserRole, label: '⚡ Super Admin', user: 'superadmin', pass: 'admin123' }
                ].map((item, idx) => {
                  const isSelected = selectedRole === item.role && username === item.user;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedRole(item.role);
                        setUsername(item.user);
                        setPassword(item.pass);
                      }}
                      className={`text-[11px] font-semibold py-2 px-2.5 rounded-xl border text-left transition flex items-center justify-between ${isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              <select
                id="login-role"
                required
                value={selectedRole}
                onChange={e => {
                  const newRole = e.target.value as UserRole;
                  setSelectedRole(newRole);
                  const demoCreds: Record<UserRole, { u: string; p: string }> = {
                    student: { u: 'student1', p: 'password123' },
                    faculty: { u: 'faculty1', p: 'password123' },
                    class_incharge: { u: 'classincharge1', p: 'password123' },
                    hod: { u: 'hod_cse', p: 'password123' },
                    office_admin: { u: 'officeadmin1', p: 'password123' },
                    library_admin: { u: 'libadmin1', p: 'password123' },
                    accounts_admin: { u: 'accounts1', p: 'password123' },
                    super_admin: { u: 'superadmin', p: 'admin123' }
                  };
                  if (demoCreds[newRole]) {
                    setUsername(demoCreds[newRole].u);
                    setPassword(demoCreds[newRole].p);
                  }
                }}
                className="block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium text-slate-800"
              >
                <option value="student">🎓 Student (Aarav Sharma - Roll: 22001A0501)</option>
                <option value="faculty">👨‍🏫 Faculty (Dr. K. S. Rao - Emp: EMP-CSE-001)</option>
                <option value="class_incharge">📋 Class In-charge (Dr. Ramesh Chandra - Section 3A)</option>
                <option value="hod">🏛️ Head of Department (Dr. V. N. Murthy - Dept of CSE)</option>
                <option value="office_admin">📂 Office Administrator (Mr. S. K. Gupta - Certs & Approvals)</option>
                <option value="library_admin">📚 Library Administrator (Mrs. Lakshmi Devi - Central Library)</option>
                <option value="accounts_admin">💰 Accounts Administrator (Mr. Rajesh Nair - Finance & Fees)</option>
                <option value="super_admin">⚡ Super Administrator (Central Orchestrator & Monitoring)</option>
              </select>
              <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Active Portal: <strong className="text-blue-600 uppercase">{selectedRole.replace('_', ' ')}</strong></span>
                <span className="text-slate-400">Click Sign In to launch portal</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username or Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. student1 or faculty1"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Role-Specific Account Registration Link */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">Need an account? </span>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
            >
              Register with Role
            </button>
          </div>


        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Password Recovery Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your verified institutional email. A secure reset link will be dispatched by no-reply@campus.edu.
            </p>
            {forgotMessage ? (
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{forgotMessage}</span>
                </div>
                {forgotDelivery?.resetUrl && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2">
                    <span className="font-semibold text-blue-900 block">Instant Verification Link:</span>
                    <button
                      onClick={() => {
                        setShowForgotModal(false);
                        const url = new URL(forgotDelivery.resetUrl);
                        const token = url.searchParams.get('token');
                        if (token) {
                          setResetToken(token);
                          setShowResetModal(true);
                        }
                      }}
                      className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-3 rounded text-xs transition"
                    >
                      Open Password Reset Screen
                    </button>
                    {forgotDelivery.previewUrl && (
                      <a
                        href={forgotDelivery.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline block text-center"
                      >
                        View Nodemailer Ethereal Web Preview ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="e.g. aarav.sharma@campus.edu"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowForgotModal(false); setForgotMessage(null); setForgotDelivery(null); }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-500"
                  >
                    Dispatch Reset Link
                  </button>
                </div>
              </form>
            )}
            {forgotMessage && (
              <div className="text-right">
                <button
                  onClick={() => { setShowForgotModal(false); setForgotMessage(null); setForgotDelivery(null); }}
                  className="text-xs text-blue-600 font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Set New Password Modal (from reset token link) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Set New Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your new secure password below to complete your account recovery.
            </p>

            {resetError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetStatus ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{resetStatus}</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowResetModal(false); setResetError(null); }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-sm transition"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Role-Specific Account Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Institutional Account</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select your role category and complete the authorization fields.
            </p>

            {regSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Role Type</label>
                <select
                  value={regRole}
                  onChange={e => setRegRole(e.target.value as UserRole)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 outline-none"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="class_incharge">Class In-charge</option>
                  <option value="hod">Head of Department (HOD)</option>
                  <option value="office_admin">Office Administrator</option>
                  <option value="library_admin">Library Administrator</option>
                  <option value="accounts_admin">Accounts Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regForm.fullName}
                    onChange={e => setRegForm({ ...regForm, fullName: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={regForm.username}
                    onChange={e => setRegForm({ ...regForm, username: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Student specific */}
              {regRole === 'student' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Roll Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 21CSE099"
                      value={regForm.rollNumber}
                      onChange={e => setRegForm({ ...regForm, rollNumber: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Year / Semester</label>
                    <select
                      value={regForm.semester}
                      onChange={e => setRegForm({ ...regForm, semester: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="1">1st Year (Sem 1)</option>
                      <option value="3">2nd Year (Sem 3)</option>
                      <option value="5">3rd Year (Sem 5)</option>
                      <option value="7">4th Year (Sem 7)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Faculty specific */}
              {(regRole === 'faculty' || regRole === 'class_incharge' || regRole === 'hod') && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Employee ID</label>
                    <input
                      type="text"
                      placeholder="e.g. EMP-CSE-150"
                      value={regForm.employeeId}
                      onChange={e => setRegForm({ ...regForm, employeeId: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Designation</label>
                    <input
                      type="text"
                      value={regForm.designation}
                      onChange={e => setRegForm({ ...regForm, designation: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-500 shadow-sm"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

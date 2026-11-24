import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RotateCcw,
  BellRing,
  CheckCircle,
  Search
} from 'lucide-react';

interface LibraryAdminProps {
  currentTab: string;
}

export const LibraryAdminDashboard: React.FC<LibraryAdminProps> = ({ currentTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);

  // Issue modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueBookId, setIssueBookId] = useState('bk-1');
  const [issueRoll, setIssueRoll] = useState('21CSE042');

  const fetchOverview = async () => {
    try {
      const res = await api.getLibraryOverview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.issueLibraryBook({
        bookId: issueBookId,
        rollNumber: issueRoll,
        days: 14
      });
      setShowIssueModal(false);
      await fetchOverview();
      alert('Book issued successfully. Library Agent tracking return deadline.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReturnBook = async (issueId: string) => {
    try {
      await api.returnLibraryBook(issueId);
      await fetchOverview();
      alert('Book returned and library clearance updated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendNotifications = async () => {
    setDispatching(true);
    try {
      const res = await api.sendLibraryNotifications();
      alert(res.message || 'Due date reminders and overdue notices dispatched to student accounts!');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch notifications');
    } finally {
      setDispatching(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading Library Administration...</div>;
  }

  const { books = [], issues = [], overdueLoansCount = 0 } = data;
  const overdueIssues = issues.filter((i: any) => i.status === 'overdue');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Mrs. Lakshmi Devi</h1>
            <span className="text-[11px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
              Chief Librarian • Central Library
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Book Inventory • Loan Tracking & Automated Fine Calculations • Clearance Operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSendNotifications}
            disabled={dispatching}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>{dispatching ? 'Dispatching...' : 'Dispatch Due Notifications'}</span>
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Book to Student</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Cataloged Books</span>
          <div className="text-2xl font-black text-slate-900">{books.length} Titles</div>
          <span className="text-[11px] text-slate-500">Available across all academic blocks</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Active Loans</span>
          <div className="text-2xl font-black text-slate-900">{issues.filter((i: any) => i.status === 'issued').length} Issued</div>
          <span className="text-[11px] text-slate-500">Monitored for return deadlines</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Overdue Loans</span>
          <div className="text-2xl font-black text-rose-600">{overdueLoansCount} Books</div>
          <span className="text-[11px] text-rose-600 font-medium">Fine applied automatically</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Clearance Rate</span>
          <div className="text-2xl font-black text-emerald-600">96.8%</div>
          <span className="text-[11px] text-slate-500">No pending fines for graduating batch</span>
        </div>
      </div>

      {/* TAB: OVERVIEW & ISSUES (Part 6 & 12) */}
      {(currentTab === 'overview' || currentTab === 'issues') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Issued Books Register & Borrower Student Details</span>
              </h2>
              <p className="text-xs text-slate-500">
                Full borrower identification: Name, Roll Number, Branch, Academic Year, and Due Dates
              </p>
            </div>
            <button
              onClick={() => setShowIssueModal(true)}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold px-3 py-1.5 rounded-lg border border-teal-200 transition"
            >
              + Issue Book
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Book Name & ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Academic Year</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Fine</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((i: any) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{i.book?.title || 'Book Title'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {i.book_id}</div>
                    </td>
                    <td className="p-3 text-slate-800 font-medium">{i.studentName || 'Aarav Sharma'}</td>
                    <td className="p-3 font-mono text-slate-600">{i.rollNumber || '21CSE042'}</td>
                    <td className="p-3 text-slate-600">{i.branch || 'CSE'}</td>
                    <td className="p-3 text-slate-500">{i.academic_year || '2026-2027'}</td>
                    <td className="p-3 text-slate-500">{i.issued_date || i.issue_date || '2026-11-01'}</td>
                    <td className="p-3 font-semibold text-slate-700">{i.due_date}</td>
                    <td className="p-3 font-bold text-rose-600">Rs. {i.fine_amount || 0}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          i.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : i.status === 'returned'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {i.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {i.status !== 'returned' ? (
                        <button
                          onClick={() => handleReturnBook(i.id)}
                          className="text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md border border-teal-200 font-semibold text-[11px] inline-flex items-center gap-1 transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Return Book</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">Returned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: OVERDUE */}
      {currentTab === 'overdue' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>Overdue Loans & Fine Calculation Register</span>
              </h2>
              <p className="text-xs text-slate-500">Autonomous fine compounding at Rs. 5 per day past return deadline</p>
            </div>
            <button
              onClick={handleSendNotifications}
              disabled={dispatching}
              className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
            >
              Alert Overdue Borrowers
            </button>
          </div>

          {overdueIssues.length === 0 ? (
            <p className="text-xs text-slate-400 p-6 text-center bg-slate-50 rounded-xl">
              Zero overdue loans. All borrowed books are within their active loan periods.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-rose-50 text-rose-900 uppercase text-[10px] font-bold border-b border-rose-200">
                  <tr>
                    <th className="p-3">Book Title</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Fine Accrued</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdueIssues.map((i: any) => (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{i.book?.title}</td>
                      <td className="p-3">{i.studentName}</td>
                      <td className="p-3 font-mono">{i.rollNumber}</td>
                      <td className="p-3 font-bold text-rose-600">{i.due_date}</td>
                      <td className="p-3 font-black text-rose-600">Rs. {i.fine_amount || 25}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleReturnBook(i.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-md"
                        >
                          Mark Returned
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: CLEARANCE */}
      {currentTab === 'clearance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Student Library No-Dues Clearance Status</span>
              </h2>
              <p className="text-xs text-slate-500">Autonomous verification feeding into Central No-Dues workflow</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-800">Clearance Granted</span>
              <div className="text-2xl font-black text-emerald-900">118 Students</div>
              <span className="text-[11px] text-emerald-700">Zero active loans & zero unpaid fines</span>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-800">Books on Loan</span>
              <div className="text-2xl font-black text-amber-900">{issues.filter((i: any) => i.status === 'issued').length} Students</div>
              <span className="text-[11px] text-amber-700">Clearance contingent on return</span>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-800">Blocked (Fines / Overdue)</span>
              <div className="text-2xl font-black text-rose-900">{overdueLoansCount} Students</div>
              <span className="text-[11px] text-rose-700">Clearance withheld until paid</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue Book */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Issue Book to Student</h3>
            <p className="text-xs text-slate-500 mb-4">
              Library Agent will monitor return due date and compute fine if overdue.
            </p>
            <form onSubmit={handleIssueBook} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Book</label>
                <select
                  value={issueBookId}
                  onChange={e => setIssueBookId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                >
                  {books.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.title} (Available: {b.available_copies})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Student Roll Number</label>
                <input
                  type="text"
                  required
                  value={issueRoll}
                  onChange={e => setIssueRoll(e.target.value)}
                  placeholder="e.g. 21CSE042"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-teal-600 text-white rounded-md font-semibold hover:bg-teal-500 shadow-sm"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

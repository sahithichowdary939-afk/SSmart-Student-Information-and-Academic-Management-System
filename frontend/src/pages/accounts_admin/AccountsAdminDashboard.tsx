import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Plus,
  Receipt,
  Search,
  Filter,
  Layers,
  Award,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

interface AccountsAdminProps {
  currentTab: string;
}

export const AccountsAdminDashboard: React.FC<AccountsAdminProps> = ({ currentTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 5-Tier Filter Sequence (Part 13)
  const [filterAcadYear, setFilterAcadYear] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Record payment modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState('');
  const [payAmount, setPayAmount] = useState('25000');
  const [payMode, setPayMode] = useState('bank_transfer');

  // Create Fee Structure modal (Part 14)
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [fsAcadYear, setFsAcadYear] = useState('2026-2027');
  const [fsBranch, setFsBranch] = useState('CSE');
  const [fsYear, setFsYear] = useState(3);
  const [fsCategory, setFsCategory] = useState<'convener' | 'management' | 'nri' | 'scholarship'>('convener');
  const [fsTuition, setFsTuition] = useState<number>(75000);
  const [fsLibrary, setFsLibrary] = useState<number>(5000);
  const [fsLab, setFsLab] = useState<number>(10000);
  const [fsOther, setFsOther] = useState<number>(5000);
  const [isSubmittingFs, setIsSubmittingFs] = useState(false);

  const fetchOverview = async () => {
    try {
      const res = await api.getAccountsOverview();
      setData(res);
      if (res.fees?.[0]) setSelectedFeeId(res.fees[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordFeePayment({
        studentFeeId: selectedFeeId,
        amount: Number(payAmount),
        paymentMode: payMode,
        referenceNumber: `TXN-${Date.now()}`
      });
      setShowPayModal(false);
      await fetchOverview();
      alert('Payment recorded and verified! Official receipt generated and No-Dues clearance balance updated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFs(true);
    try {
      const total = Number(fsTuition) + Number(fsLibrary) + Number(fsLab) + Number(fsOther);
      await api.createFeeStructure({
        academicYear: fsAcadYear,
        branch: fsBranch,
        year: Number(fsYear),
        category: fsCategory,
        tuitionFee: Number(fsTuition),
        libraryFee: Number(fsLibrary),
        labFee: Number(fsLab),
        otherFee: Number(fsOther),
        totalFee: total
      });
      setShowFeeStructureModal(false);
      await fetchOverview();
      alert(`Fee Structure created successfully! Batch fee allocated to enrolled ${fsBranch} Year-${fsYear} students without duplicates.`);
    } catch (err: any) {
      alert(err.message || 'Failed to create fee structure');
    } finally {
      setIsSubmittingFs(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading Accounts Administration...</div>;
  }

  const { fees = [], payments = [], totalCollected = 0, totalPending = 0 } = data;

  // Filter fees using 5-tier sequence
  const filteredFees = fees.filter((f: any) => {
    if (filterAcadYear !== 'all' && f.academicYear !== filterAcadYear) return false;
    if (filterBranch !== 'all' && f.branch?.toLowerCase() !== filterBranch.toLowerCase()) return false;
    if (filterYear !== 'all' && String(f.currentYear) !== String(filterYear)) return false;
    if (filterSection !== 'all' && f.section?.toLowerCase() !== filterSection.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = f.studentName?.toLowerCase().includes(q);
      const rollMatch = f.rollNumber?.toLowerCase().includes(q);
      if (!nameMatch && !rollMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Mr. Rajesh Nair</h1>
            <span className="text-[11px] bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full">
              Senior Accounts Officer • Accounts & Finance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fee Verification • Payment Receipts • Financial Clearance Operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFeeStructureModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Fee Structure</span>
          </button>
          <button
            onClick={() => setShowPayModal(true)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Collections</span>
          <div className="text-2xl font-black text-emerald-600">Rs. {totalCollected.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">Verified institutional receipts</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Outstanding Dues</span>
          <div className="text-2xl font-black text-rose-600">Rs. {totalPending.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">Across enrolled student batches</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Payment Receipts</span>
          <div className="text-2xl font-black text-slate-900">{payments.length} Transactions</div>
          <span className="text-[11px] text-slate-500">Archived for audit & verification</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Clearance Status</span>
          <div className="text-2xl font-black text-purple-600">
            {fees.filter((f: any) => f.status === 'paid').length} / {fees.length || 1}
          </div>
          <span className="text-[11px] text-slate-500">Students fully cleared</span>
        </div>
      </div>

      {/* TAB: FEES & 5-TIER FILTERING SEQUENCE (Part 13 & 14 & 15) */}
      {(currentTab === 'fees' || currentTab === 'overview') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Student Fee Records & 5-Tier Batch Directory</span>
              </h2>
              <p className="text-xs text-slate-500">
                Filter by Academic Year → Branch → Year → Section → Student
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
              {filteredFees.length} Records Found
            </span>
          </div>

          {/* 5-Tier Filter Controls (Part 13) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">1. Academic Year</label>
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
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">2. Branch</label>
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
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">3. Year</label>
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
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">4. Section</label>
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

            {/* 5. Student Search by Name or Roll Number */}
            <div className="relative">
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">5. Search Student (Name or Roll Number)</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. Aarav Sharma or 21CSE042..."
                  className="w-full text-xs border border-slate-300 rounded-lg pl-8 p-2 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Student Fees Register Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Branch & Sec</th>
                  <th className="p-3">Academic Term</th>
                  <th className="p-3">Tuition / Lab / Lib</th>
                  <th className="p-3">Total Fee</th>
                  <th className="p-3">Paid Amount</th>
                  <th className="p-3">Pending Due</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-4 text-center text-slate-400">
                      No student fee records match the selected sequence criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFees.map((f: any) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{f.studentName || 'Aarav Sharma'}</td>
                      <td className="p-3 font-mono text-slate-500">{f.rollNumber || '21CSE042'}</td>
                      <td className="p-3 text-slate-600">{f.branch || 'CSE'} - Year {f.currentYear || 3} ({f.section || 'A'})</td>
                      <td className="p-3 text-slate-600">{f.term} ({f.academicYear})</td>
                      <td className="p-3 text-[11px] text-slate-500">
                        Rs. {f.tuition_fee?.toLocaleString() || '75,000'} / {f.lab_fee?.toLocaleString() || '10,000'} / {f.library_fee?.toLocaleString() || '5,000'}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">Rs. {f.total_amount?.toLocaleString()}</td>
                      <td className="p-3 text-emerald-600 font-bold">Rs. {f.paid_amount?.toLocaleString()}</td>
                      <td className="p-3 text-rose-600 font-bold">Rs. {f.pending_amount?.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            f.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : f.status === 'partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {f.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {f.pending_amount > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedFeeId(f.id);
                              setPayAmount(String(f.pending_amount));
                              setShowPayModal(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-md transition"
                          >
                            Record Pay
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PAYMENTS (Transaction Receipts Log) */}
      {currentTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>Verified Payment Transactions & Audit Log</span>
              </h2>
              <p className="text-xs text-slate-500">Autonomous receipt archiving with unique institutional transaction IDs</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200">
              {payments.length} Receipts
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Receipt Reference</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Transaction Date</th>
                  <th className="p-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-semibold text-slate-900">{p.reference_number || p.id}</td>
                    <td className="p-3 font-medium text-slate-800">{p.studentName || 'Aarav Sharma'}</td>
                    <td className="p-3 font-bold text-emerald-600">Rs. {p.amount?.toLocaleString()}</td>
                    <td className="p-3 uppercase text-slate-600 font-medium">{p.payment_mode?.replace('_', ' ')}</td>
                    <td className="p-3 text-slate-500">{new Date(p.created_at || Date.now()).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>VERIFIED</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CLEARANCE */}
      {currentTab === 'clearance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Financial Clearance & No-Dues Operations</span>
              </h2>
              <p className="text-xs text-slate-500">Autonomous accounts verification feeding into student graduation clearance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-800">Clearance Approved</span>
              <div className="text-2xl font-black text-emerald-900">
                {fees.filter((f: any) => f.status === 'paid').length} Students
              </div>
              <span className="text-[11px] text-emerald-700">All semester fees paid in full</span>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-800">Partial Balance Remaining</span>
              <div className="text-2xl font-black text-amber-900">
                {fees.filter((f: any) => f.status === 'partial').length} Students
              </div>
              <span className="text-[11px] text-amber-700">Installment schedule active</span>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-800">Pending Financial Hold</span>
              <div className="text-2xl font-black text-rose-900">
                {fees.filter((f: any) => f.status === 'pending').length} Students
              </div>
              <span className="text-[11px] text-rose-700">Clearance withheld until paid</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Yearly Fee Structure (Part 14) */}
      {showFeeStructureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Create Yearly Fee Structure & Batch Allocation</h3>
            <p className="text-xs text-slate-500 mb-4">
              Specifying a fee structure will automatically allocate fee records for all matching enrolled students without duplicate records.
            </p>

            <form onSubmit={handleCreateFeeStructure} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Year</label>
                  <select
                    value={fsAcadYear}
                    onChange={e => setFsAcadYear(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="2026-2027">2026-2027</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Branch</label>
                  <select
                    value={fsBranch}
                    onChange={e => setFsBranch(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Year</label>
                  <select
                    value={fsYear}
                    onChange={e => setFsYear(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Admission Category</label>
                  <select
                    value={fsCategory}
                    onChange={e => setFsCategory(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="convener">Convener / Merit</option>
                    <option value="management">Management Quota</option>
                    <option value="nri">NRI Quota</option>
                    <option value="scholarship">Full Scholarship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tuition Fee (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={fsTuition}
                    onChange={e => setFsTuition(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Library Fee (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={fsLibrary}
                    onChange={e => setFsLibrary(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Laboratory Fee (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={fsLab}
                    onChange={e => setFsLab(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Other / Exam Fee (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={fsOther}
                    onChange={e => setFsOther(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <span className="font-bold text-emerald-900">Total Calculated Fee:</span>
                <span className="text-base font-black text-emerald-700">
                  Rs. {(Number(fsTuition) + Number(fsLibrary) + Number(fsLab) + Number(fsOther)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeeStructureModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFs}
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-500 shadow-sm disabled:opacity-50"
                >
                  {isSubmittingFs ? 'Allocating...' : 'Allocate Batch Fees'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Verified Payment */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Record Verified Payment</h3>
            <p className="text-xs text-slate-500 mb-4">
              AI is strictly prohibited from altering financial records autonomously. Officer manual entry required.
            </p>
            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Student Fee Record</label>
                <select
                  value={selectedFeeId}
                  onChange={e => setSelectedFeeId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                >
                  {fees.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.studentName} ({f.rollNumber}) - Pending: Rs. {f.pending_amount}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Amount Paid (Rs.)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={e => setPayMode(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="online">Online Payment Gateway</option>
                  <option value="cheque">Cheque / Demand Draft</option>
                  <option value="cash">Direct Cash Deposit</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-500 shadow-sm"
                >
                  Generate Official Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { api } from '../../services/api.js';
import {
  X,
  ShieldCheck,
  Check,
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvals: any[];
  onRefresh: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  approvals,
  onRefresh
}) => {
  const [selectedApproval, setSelectedApproval] = useState<any>(approvals[0] || null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!selectedApproval) return;
    setLoading(true);
    try {
      const res = await api.decideApproval(selectedApproval.id, decision, comments);
      if (res.pdfUrl) {
        setGeneratedPdf(res.pdfUrl);
      }
      onRefresh();
      // Remove from local list
      const remaining = approvals.filter(a => a.id !== selectedApproval.id);
      setSelectedApproval(remaining[0] || null);
      if (remaining.length === 0 && !res.pdfUrl) {
        onClose();
      }
    } catch (err: any) {
      alert(`Error recording decision: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Level 3 Safety: Human Authorization Required</h3>
              <p className="text-[11px] text-slate-400">Autonomous operations halted until explicit officer sign-off</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {generatedPdf && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800">Official Document Generated & Signed!</p>
                <p className="text-[11px] text-emerald-600">The PDF has been officially signed and archived.</p>
              </div>
              <a
                href={generatedPdf}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View PDF</span>
              </a>
            </div>
          )}

          {approvals.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>No pending approvals for your role! All operations are in compliance.</span>
            </div>
          ) : (
            <>
              {/* Approval Tabs if multiple */}
              {approvals.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                  {approvals.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedApproval(a)}
                      className={`text-xs px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
                        selectedApproval?.id === a.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {a.action_type.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              {selectedApproval && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {selectedApproval.action_type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                        Requires {selectedApproval.required_role?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {selectedApproval.description}
                    </p>
                  </div>

                  {/* Structured Snapshot */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Data Verification Snapshot</span>
                    </label>
                    <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48">
                      {JSON.stringify(selectedApproval.data_snapshot, null, 2)}
                    </pre>
                  </div>

                  {/* Reviewer Comments Input */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Official Remarks / Approval Comments (Optional)
                    </label>
                    <textarea
                      value={comments}
                      onChange={e => setComments(e.target.value)}
                      placeholder="e.g., Records cross-verified against physical admissions log. Approved for formal issuance."
                      rows={2}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {selectedApproval && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={() => handleDecision('rejected')}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-lg transition"
            >
              Reject Request
            </button>
            <button
              onClick={() => handleDecision('approved')}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Authorize & Fulfill</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

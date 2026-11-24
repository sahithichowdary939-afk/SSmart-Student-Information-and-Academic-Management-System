import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import {
  X,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Clock
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'agent';
  text: string;
  toolUsed?: string;
  data?: any;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: `Hello ${user?.fullName || (user as any)?.full_name || 'there'}! I am your context-aware ${role?.replace('_', ' ')} Agentic Assistant. How can I assist with your academic operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.chatWithAssistant(q);
      const agentMsg: Message = {
        sender: 'agent',
        text: res.reply || 'Task processed successfully.',
        toolUsed: res.toolUsed,
        data: res.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: `Error processing command: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getQuickPrompts = () => {
    switch (role) {
      case 'student':
        return [
          'Remind me to complete my DBMS assignment tomorrow at 6 PM',
          'What is my current attendance percentage and do I have a shortage?',
          'Do I have any books due or unpaid library fines?',
          'Explain my internal marks calculation'
        ];
      case 'faculty':
        return [
          'Show submission status for my active assignments',
          'Which students in CSE-3A have not submitted Assignment 2?',
          'Check missing attendance sessions for my subjects'
        ];
      case 'class_incharge':
        return [
          'Compile daily academic coordination summary for CSE-3A',
          'Which students currently have attendance below 75%?',
          'Are there any pending faculty attendance submissions?'
        ];
      case 'hod':
        return [
          'Generate executive academic and compliance report for CSE',
          'Audit faculty attendance submission compliance rates',
          'List students flagged for academic intervention'
        ];
      case 'super_admin':
        return [
          'Check system health and agent latency',
          'List any stalled workflows or open escalations',
          'Audit agent task execution success rate'
        ];
      default:
        return [
          'Audit overdue library books and calculate fines',
          'Check status of pending no-dues clearance requests'
        ];
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-1.5">
              <span>Agentic Copilot</span>
              <Sparkles className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Role: {role?.replace('_', ' ')} (Level 1/2 Autonomy)</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              {m.text}

              {/* Tool Execution Tag */}
              {m.toolUsed && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-mono text-blue-700 bg-blue-50/70 px-2 py-1 rounded">
                  <Cpu className="w-3 h-3" />
                  <span className="truncate">Tool: {m.toolUsed}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-auto" />
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 w-fit">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>Agent planning & calling backend tools...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-white border-t border-slate-200">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
          Suggested Autonomous Commands
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {getQuickPrompts().map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2 py-1 rounded-md border border-slate-200 transition text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={`Instruct ${role?.replace('_', ' ')} Agent...`}
          className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputQuery.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white p-2 rounded-lg shadow-sm transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

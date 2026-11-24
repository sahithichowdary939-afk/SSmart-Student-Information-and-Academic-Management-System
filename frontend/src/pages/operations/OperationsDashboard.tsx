import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Home,
  Truck,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search
} from 'lucide-react';

interface OperationsDashboardProps {
  currentTab: string;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({ currentTab }) => {
  const { role: rawRole, user } = useAuth();
  const role = rawRole as any;
  const [loading, setLoading] = useState(true);

  // Hostel state
  const [hostelData, setHostelData] = useState<{ rooms: any[]; complaints: any[] }>({ rooms: [], complaints: [] });

  // Transport state
  const [transportData, setTransportData] = useState<{ routes: any[]; myPass: any }>({ routes: [], myPass: null });

  // Maintenance state
  const [facilities, setFacilities] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, tRes, fRes] = await Promise.all([
        api.getHostelInfo().catch(() => ({ rooms: [], complaints: [] })),
        api.getTransportInfo().catch(() => ({ routes: [], myPass: null })),
        api.getFacilityComplaints().catch(() => ({ complaints: [] }))
      ]);
      setHostelData(hRes);
      setTransportData(tRes);
      setFacilities(fRes.complaints || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleUpdateFacilityStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateFacilityComplaint(id, newStatus);
      await fetchData();
      alert(`Work order updated to ${newStatus}`);
    } catch (e: any) {
      alert(e.message || 'Failed to update work order');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading campus operations console...</div>;
  }

  // HOSTEL WARDEN VIEW
  if (role === 'hostel_warden') {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">Hostel Administration & Resident Life</h1>
                <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                  Hostel Warden Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Managed by Hostel Management Agent • Real-time room occupancy, visitor logs, and resident grievance tracking
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Roster</span>
          </button>
        </div>

        {/* Occupancy Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Rooms</span>
            <div className="text-2xl font-black text-slate-900">{hostelData.rooms.length} Units</div>
            <span className="text-xs text-slate-500">Aryabhatta & Bhaskara Blocks</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Residents</span>
            <div className="text-2xl font-black text-orange-600">
              {hostelData.rooms.reduce((acc, r) => acc + (r.occupied || 0), 0)} Enrolled
            </div>
            <span className="text-xs text-emerald-600 font-medium">85% Occupancy Rate</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Open Grievances</span>
            <div className="text-2xl font-black text-amber-600">{hostelData.complaints.length} Active</div>
            <span className="text-xs text-amber-600 font-medium">Auto-triaged by Facility Agent</span>
          </div>
        </div>

        {/* Room Allocations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Hostel Room Allocations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Block Name</th>
                  <th className="p-3">Room No</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Occupied</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hostelData.rooms.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{r.block}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">{r.room_number}</td>
                    <td className="p-3 text-slate-600">{r.capacity} Beds</td>
                    <td className="p-3 font-semibold text-slate-800">{r.occupied} Students</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complaints List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Resident Maintenance & Grievances</h2>
          <div className="space-y-3">
            {hostelData.complaints.map(c => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{c.title}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      Room {c.room_number}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">{c.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Reported by {c.student_name}</span>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                  {c.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // TRANSPORT MANAGER VIEW
  if (role === 'transport_manager') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">Campus Fleet & Transport Operations</h1>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
                  Transport Manager Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Managed by Transport Management Agent • Bus route schedules, driver assignments, and student pass validation
              </p>
            </div>
          </div>
        </div>

        {/* Routes Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transportData.routes.map(rt => (
            <div key={rt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    {rt.route_number}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{rt.route_name}</h3>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  {rt.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Departure: <strong>{rt.departure_time}</strong> • Bus: <strong>{rt.bus_number}</strong>
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="font-semibold text-slate-800">{rt.driver_name} ({rt.driver_phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Riders:</span>
                  <span className="font-semibold text-slate-800">{rt.enrolled_students} / {rt.capacity} Enrolled</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Route Stops:</span>
                <div className="flex flex-wrap gap-1.5">
                  {rt.stops.map((s: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {idx + 1}. {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // MAINTENANCE STAFF VIEW
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-center text-yellow-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">Campus Facility Maintenance & Work Orders</h1>
              <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full">
                Maintenance Staff Console
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned by Campus Facility Management Agent • Real-time work tickets, repair tracking, and resolution verification
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Assigned Facility Work Orders</h2>
          <span className="text-xs bg-yellow-50 text-yellow-800 font-bold px-2.5 py-1 rounded-full border border-yellow-200">
            {facilities.length} Tickets
          </span>
        </div>

        <div className="space-y-3">
          {facilities.map(item => (
            <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.title}</span>
                  <span className="text-[10px] uppercase font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    {item.location_type}: {item.location_details}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.severity === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                    {item.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">{item.description}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Reported by {item.reporter_name} ({item.reporter_role}) • Assigned to: {item.assigned_staff_name}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {item.status !== 'resolved' ? (
                  <>
                    {item.status === 'assigned' && (
                      <button
                        onClick={() => handleUpdateFacilityStatus(item.id, 'in_progress')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition shadow-sm"
                      >
                        Start Repair
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateFacilityStatus(item.id, 'resolved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  </>
                ) : (
                  <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Work Completed</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

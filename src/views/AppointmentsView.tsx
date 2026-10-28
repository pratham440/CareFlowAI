import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  Search,
  Plus,
  Phone,
  Mail,
  Filter,
  CheckCircle,
  Eye,
  Trash2,
  X,
  FileText,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { AppointmentRequest, AppointmentStatus } from '../types';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    deleteAppointment,
    setIsNewAppointmentOpen,
  } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesStatus =
        statusFilter === 'All' ? true : apt.status === statusFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q) ||
        apt.department.toLowerCase().includes(q) ||
        apt.phone.toLowerCase().includes(q) ||
        apt.email.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    return {
      All: appointments.length,
      Pending: appointments.filter((a) => a.status === 'Pending').length,
      Confirmed: appointments.filter((a) => a.status === 'Confirmed').length,
      Completed: appointments.filter((a) => a.status === 'Completed').length,
      Cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
    };
  }, [appointments]);

  return (
    <div className="space-y-5">
      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Appointment Intake & Scheduling
          </h2>
          <p className="text-xs text-slate-500">
            Manage incoming patient visit requests and track confirmation workflow
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewAppointmentOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>New Appointment Request</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Status Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map(
            (status) => {
              const count = statusCounts[status];
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-sky-100 text-sky-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{status}</span>
                  <span className="ml-1.5 text-[11px] tabular-nums opacity-75">
                    ({count})
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, reason, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-900"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No appointment requests found"
            description={
              searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your search query or status filter.'
                : 'There are currently no appointment requests in the system.'
            }
            actionLabel="Create Appointment Request"
            onAction={() => setIsNewAppointmentOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 sm:px-6">Patient Name</th>
                  <th className="py-3 px-4">Requested Date & Time</th>
                  <th className="py-3 px-4">Reason for Visit</th>
                  <th className="py-3 px-4">Contact Information</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Patient Name */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900 text-sm">
                        {apt.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {apt.department}
                      </div>
                    </td>

                    {/* Requested Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 tabular-nums">
                        {apt.requestedDate}
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        {apt.requestedTime}
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-800 font-medium line-clamp-1">
                        {apt.reason}
                      </p>
                      {apt.notes && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          Note: {apt.notes}
                        </p>
                      )}
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 tabular-nums">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{apt.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{apt.email}</span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={apt.status}
                          onChange={(e) =>
                            updateAppointmentStatus(
                              apt.id,
                              e.target.value as AppointmentStatus
                            )
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(apt)}
                          title="View Request Details"
                          className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAppointment(apt.id)}
                          title="Delete Request"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-100 text-sky-800">
                  <FileText className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Appointment Details
                  </h3>
                  <p className="text-xs text-slate-500">Record #{selectedAppointment.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Patient
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedAppointment.patientName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Requested Date & Time
                  </span>
                  <p className="text-slate-800 font-medium tabular-nums mt-0.5">
                    {selectedAppointment.requestedDate} · {selectedAppointment.requestedTime}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Department
                  </span>
                  <p className="text-slate-800 font-medium mt-0.5">
                    {selectedAppointment.department}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Reason for Visit
                </span>
                <p className="text-slate-800 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedAppointment.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Phone
                  </span>
                  <p className="text-slate-800 font-medium tabular-nums mt-0.5">
                    {selectedAppointment.phone}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                  </span>
                  <p className="text-slate-800 font-medium mt-0.5 truncate">
                    {selectedAppointment.email}
                  </p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Staff Notes
                  </span>
                  <p className="text-slate-700 mt-0.5 italic">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Update Status:</span>
                <div className="flex items-center gap-1.5">
                  {(['Pending', 'Confirmed', 'Completed', 'Cancelled'] as AppointmentStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, st);
                          setSelectedAppointment({ ...selectedAppointment, status: st });
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                          selectedAppointment.status === st
                            ? 'bg-sky-700 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

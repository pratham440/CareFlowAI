import React from 'react';
import {
  CalendarClock,
  LifeBuoy,
  PhoneCall,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  User,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { AppointmentStatus } from '../types';

export const DashboardView: React.FC = () => {
  const {
    metrics,
    appointments,
    activities,
    updateAppointmentStatus,
    setActivePage,
    setIsNewAppointmentOpen,
  } = useClinic();

  // Upcoming appointment requests (sorted by date)
  const upcomingRequests = [...appointments]
    .filter((a) => a.status === 'Pending' || a.status === 'Confirmed')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner introducing CareFlow AI */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-800 via-sky-700 to-teal-700 p-6 sm:p-7 text-white shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/15 text-white/90 text-xs font-medium mb-3 backdrop-blur-xs">
            <span>Clinic Front-Desk Operations</span>
            <span>·</span>
            <span>Administrative Suite</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome to CareFlow AI Front-Desk
          </h2>
          <p className="mt-1.5 text-sm text-sky-100/90 leading-relaxed">
            Centralized hub for managing patient booking requests, administrative support tickets, and time-sensitive callbacks.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsNewAppointmentOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-sky-900 bg-white hover:bg-sky-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log Appointment Request</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage('assistant')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors cursor-pointer backdrop-blur-xs"
            >
              <span>Open AI Assistant Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient decorative gradient backdrop */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Required Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Appointment Requests"
          value={metrics.pendingAppointments}
          subtitle={`${metrics.totalAppointments} total in system`}
          icon={CalendarClock}
          variant="sky"
          onClick={() => setActivePage('appointments')}
        />

        <StatCard
          title="Open Support Tickets"
          value={metrics.openTickets}
          subtitle="Billing, records & insurance"
          icon={LifeBuoy}
          variant="teal"
          onClick={() => setActivePage('tickets')}
        />

        <StatCard
          title="Pending Follow-ups"
          value={metrics.pendingFollowUps}
          subtitle="Patient callbacks in queue"
          icon={PhoneCall}
          variant="default"
          onClick={() => setActivePage('followups')}
        />

        <StatCard
          title="Overdue Follow-ups"
          value={metrics.overdueFollowUps}
          subtitle={
            metrics.overdueFollowUps > 0
              ? 'Requires immediate attention'
              : 'All callbacks up to date'
          }
          icon={AlertTriangle}
          variant={metrics.overdueFollowUps > 0 ? 'urgent' : 'default'}
          onClick={() => setActivePage('followups')}
        />
      </div>

      {/* Main Two-Column Layout: Upcoming Requests & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Upcoming Appointment Requests */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Upcoming Appointment Requests</h3>
              <p className="text-xs text-slate-500">Inbound requests awaiting confirmation or scheduled</p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('appointments')}
              className="text-xs font-medium text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View all ({appointments.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingRequests.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No pending or confirmed appointments in queue.
              </div>
            ) : (
              upcomingRequests.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{apt.patientName}</span>
                      <StatusBadge status={apt.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{apt.reason}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <CalendarCheck className="w-3.5 h-3.5 text-slate-600" />
                        {apt.requestedDate} · {apt.requestedTime}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{apt.department}</span>
                      <span aria-hidden="true">·</span>
                      <span>{apt.phone}</span>
                    </div>
                  </div>

                  {/* Inline quick status selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-xs text-slate-600 sr-only">Status</label>
                    <select
                      value={apt.status}
                      onChange={(e) =>
                        updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)
                      }
                      className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right (1 Col): Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-500">Audit trail of clinic actions</p>
            </div>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>

          <div className="p-5 flex-1 divide-y divide-slate-100 space-y-4">
            {activities.slice(0, 5).map((act, index) => (
              <div key={act.id} className={index > 0 ? 'pt-3' : ''}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{act.title}</p>
                  <span className="text-[11px] text-slate-600 shrink-0 tabular-nums">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{act.description}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50/70 border-t border-slate-100 rounded-b-xl text-center">
            <span className="text-[11px] text-slate-600">
              Activity logging helps front-desk staff coordinate across shifts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

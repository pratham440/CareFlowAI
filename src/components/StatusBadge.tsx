import React from 'react';
import { AppointmentStatus, TicketPriority, TicketStatus, FollowUpStatus } from '../types';

interface StatusBadgeProps {
  status: AppointmentStatus | TicketStatus | FollowUpStatus | TicketPriority | 'Overdue';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let indicatorColor = 'bg-slate-400';

  switch (status) {
    // Appointment & Ticket: Confirmed / Resolved / Completed
    case 'Confirmed':
    case 'Resolved':
    case 'Completed':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      indicatorColor = 'bg-emerald-500';
      break;

    // In Progress
    case 'In Progress':
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-200/80';
      indicatorColor = 'bg-sky-500';
      break;

    // Pending / Open
    case 'Pending':
    case 'Open':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200/80';
      indicatorColor = 'bg-amber-500';
      break;

    // Overdue / Urgent / Cancelled
    case 'Overdue':
    case 'Urgent':
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';
      indicatorColor = 'bg-rose-600';
      break;

    case 'High':
      colorClasses = 'bg-orange-50 text-orange-800 border-orange-200';
      indicatorColor = 'bg-orange-500';
      break;

    case 'Medium':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      indicatorColor = 'bg-amber-500';
      break;

    case 'Low':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      indicatorColor = 'bg-slate-400';
      break;

    case 'Cancelled':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200 line-through';
      indicatorColor = 'bg-slate-400';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${sizeClasses} ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${indicatorColor}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};

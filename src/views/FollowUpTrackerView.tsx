import React, { useState, useMemo } from 'react';
import {
  PhoneCall,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  User,
  Trash2,
  X,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react';
import { useClinic, CURRENT_REFERENCE_DATE } from '../context/ClinicContext';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { FollowUp, FollowUpStatus } from '../types';

export const FollowUpTrackerView: React.FC = () => {
  const {
    followUps,
    updateFollowUpStatus,
    deleteFollowUp,
    setIsNewFollowUpOpen,
    isDateOverdue,
    metrics,
  } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<
    'All' | 'Overdue' | 'Pending' | 'In Progress' | 'Completed'
  >('All');
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((fol) => {
      const isOverdue = isDateOverdue(fol.dueDate, fol.status);

      let matchesFilter = true;
      if (filterMode === 'Overdue') {
        matchesFilter = isOverdue;
      } else if (filterMode !== 'All') {
        matchesFilter = fol.status === filterMode;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        fol.requesterName.toLowerCase().includes(q) ||
        fol.callbackReason.toLowerCase().includes(q) ||
        fol.phone.toLowerCase().includes(q) ||
        fol.email.toLowerCase().includes(q) ||
        fol.assignedStaff.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [followUps, filterMode, searchQuery, isDateOverdue]);

  const counts = useMemo(() => {
    return {
      All: followUps.length,
      Overdue: followUps.filter((f) => isDateOverdue(f.dueDate, f.status)).length,
      Pending: followUps.filter((f) => f.status === 'Pending').length,
      'In Progress': followUps.filter((f) => f.status === 'In Progress').length,
      Completed: followUps.filter((f) => f.status === 'Completed').length,
    };
  }, [followUps, isDateOverdue]);

  // Calculate days difference for due date display
  const getDueDateInfo = (dueDate: string, status: FollowUpStatus) => {
    const isOverdue = isDateOverdue(dueDate, status);
    if (status === 'Completed') {
      return { text: dueDate, isOverdue: false, label: 'Fulfilled' };
    }
    if (isOverdue) {
      return { text: `${dueDate} (Past Due)`, isOverdue: true, label: 'Overdue' };
    }
    if (dueDate === CURRENT_REFERENCE_DATE) {
      return { text: `${dueDate} (Due Today)`, isOverdue: false, label: 'Due Today' };
    }
    return { text: dueDate, isOverdue: false, label: 'Upcoming' };
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Patient Callback & Follow-Up Tracker
          </h2>
          <p className="text-xs text-slate-500">
            Ensure no patient voice inquiry or laboratory clarification falls through the cracks
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewFollowUpOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Schedule Callback</span>
        </button>
      </div>

      {/* Urgent Overdue Alert Banner if overdue follow-ups exist */}
      {metrics.overdueFollowUps > 0 && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="font-semibold text-rose-900">
                Action Required: {metrics.overdueFollowUps} callback{metrics.overdueFollowUps > 1 ? 's are' : ' is'} past their due date
              </p>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Front-desk policy requires contacting patients within 24 hours of scheduled due date.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterMode('Overdue')}
            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-100/60 border border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Show Overdue ({metrics.overdueFollowUps})
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Status segmented tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Overdue', 'Pending', 'In Progress', 'Completed'] as const).map(
            (mode) => {
              const count = counts[mode];
              const isActive = filterMode === mode;
              const isOverdueTab = mode === 'Overdue';

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? isOverdueTab
                        ? 'bg-rose-100 text-rose-900 font-bold'
                        : 'bg-teal-100 text-teal-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{mode}</span>
                  <span
                    className={`ml-1.5 text-[11px] tabular-nums ${
                      isOverdueTab && count > 0 ? 'text-rose-700 font-bold' : 'opacity-75'
                    }`}
                  >
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
            placeholder="Search requester, reason, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
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

      {/* Follow-Ups Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredFollowUps.length === 0 ? (
          <EmptyState
            icon={PhoneCall}
            title="No callback records found"
            description={
              searchQuery || filterMode !== 'All'
                ? 'No follow-up callbacks match your current criteria.'
                : 'All patient callbacks have been completed. Great job!'
            }
            actionLabel="Schedule Patient Callback"
            onAction={() => setIsNewFollowUpOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 sm:px-6">Requester Name</th>
                  <th className="py-3 px-4">Callback Reason</th>
                  <th className="py-3 px-4">Contact Information</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFollowUps.map((fol) => {
                  const dueInfo = getDueDateInfo(fol.dueDate, fol.status);

                  return (
                    <tr
                      key={fol.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        dueInfo.isOverdue ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Requester Name */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {fol.requesterName}
                          </span>
                          {dueInfo.isOverdue && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Staff: <span className="text-slate-700">{fol.assignedStaff}</span>
                        </div>
                      </td>

                      {/* Callback Reason */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-slate-800 font-medium line-clamp-2 leading-relaxed">
                          {fol.callbackReason}
                        </p>
                        {fol.notes && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            Note: {fol.notes}
                          </p>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 tabular-nums">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{fol.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{fol.email}</span>
                        </div>
                      </td>

                      {/* Due Date (Highlighted if overdue) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div
                          className={`flex items-center gap-1.5 font-medium tabular-nums ${
                            dueInfo.isOverdue
                              ? 'text-rose-700 font-bold'
                              : 'text-slate-700'
                          }`}
                        >
                          {dueInfo.isOverdue ? (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : (
                            <CalendarCheck className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span>{dueInfo.text}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Scheduled Ref: {fol.dueDate}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 shrink-0">
                        <select
                          value={fol.status}
                          onChange={(e) =>
                            updateFollowUpStatus(fol.id, e.target.value as FollowUpStatus)
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right shrink-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => deleteFollowUp(fol.id)}
                            title="Delete Callback Record"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

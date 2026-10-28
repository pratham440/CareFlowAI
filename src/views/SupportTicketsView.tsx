import React, { useState, useMemo } from 'react';
import {
  LifeBuoy,
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  X,
  FileText,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { SupportTicket, TicketStatus, TicketPriority } from '../types';

export const SupportTicketsView: React.FC = () => {
  const {
    tickets,
    updateTicketStatus,
    deleteTicket,
    setIsNewTicketOpen,
  } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TicketStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TicketPriority>('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const filteredTickets = useMemo(() => {
    return tickets.filter((tck) => {
      const matchesStatus =
        statusFilter === 'All' ? true : tck.status === statusFilter;
      const matchesPriority =
        priorityFilter === 'All' ? true : tck.priority === priorityFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tck.ticketNumber.toLowerCase().includes(q) ||
        tck.title.toLowerCase().includes(q) ||
        tck.description.toLowerCase().includes(q) ||
        tck.patientName.toLowerCase().includes(q) ||
        tck.category.toLowerCase().includes(q);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tickets, statusFilter, priorityFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      All: tickets.length,
      Open: tickets.filter((t) => t.status === 'Open').length,
      'In Progress': tickets.filter((t) => t.status === 'In Progress').length,
      Resolved: tickets.filter((t) => t.status === 'Resolved').length,
    };
  }, [tickets]);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Administrative Support Tickets
          </h2>
          <p className="text-xs text-slate-500">
            Triage patient billing inquiries, medical records releases, and insurance prior authorizations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewTicketOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Open Support Ticket</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Status segmented filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((st) => {
            const count = counts[st];
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-sky-100 text-sky-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{st}</span>
                <span className="ml-1.5 text-[11px] tabular-nums opacity-75">
                  ({count})
                </span>
              </button>
            );
          })}

          <div className="hidden sm:block h-4 w-px bg-slate-200 mx-1" />

          {/* Priority dropdown filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="hidden sm:inline">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'All' | TicketPriority)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, patient, #..."
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

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTickets.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title="No support tickets found"
            description={
              searchQuery || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try clearing your active filters or search terms.'
                : 'There are currently no support tickets in this queue.'
            }
            actionLabel="Open Support Ticket"
            onAction={() => setIsNewTicketOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 sm:px-6">Ticket Title & Number</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((tck) => (
                  <tr
                    key={tck.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Title & Number */}
                    <td className="py-3.5 px-4 sm:px-6 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {tck.ticketNumber}
                        </span>
                        <span className="text-xs text-slate-500">· {tck.category}</span>
                      </div>
                      <div className="font-semibold text-slate-900 text-sm mt-1">
                        {tck.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Patient: <span className="font-medium text-slate-700">{tck.patientName}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-slate-700 line-clamp-2 leading-relaxed">
                        {tck.description}
                      </p>
                      {tck.assignedTo && (
                        <p className="text-[11px] text-slate-600 mt-1">
                          Assigned: {tck.assignedTo}
                        </p>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 shrink-0">
                      <StatusBadge status={tck.priority} size="sm" />
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 tabular-nums text-slate-600 whitespace-nowrap">
                      {new Date(tck.createdAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Status Select */}
                    <td className="py-3.5 px-4 shrink-0">
                      <select
                        value={tck.status}
                        onChange={(e) =>
                          updateTicketStatus(tck.id, e.target.value as TicketStatus)
                        }
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(tck)}
                          title="View Full Ticket"
                          className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTicket(tck.id)}
                          title="Delete Ticket"
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

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                  {selectedTicket.ticketNumber}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {selectedTicket.title}
                  </h3>
                  <p className="text-xs text-slate-500">Category: {selectedTicket.category}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Priority
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={selectedTicket.priority} size="sm" />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Current Status
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={selectedTicket.status} size="sm" />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Assigned Staff
                  </span>
                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedTicket.assignedTo || 'Unassigned'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Patient & Contact
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedTicket.patientName}
                </p>
                <p className="text-slate-600 mt-0.5 tabular-nums">
                  {selectedTicket.contactInfo}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Ticket Description
                </span>
                <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Change Ticket Status:</span>
                <div className="flex items-center gap-1.5">
                  {(['Open', 'In Progress', 'Resolved'] as TicketStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        updateTicketStatus(selectedTicket.id, st);
                        setSelectedTicket({ ...selectedTicket, status: st });
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                        selectedTicket.status === st
                          ? 'bg-sky-700 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
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

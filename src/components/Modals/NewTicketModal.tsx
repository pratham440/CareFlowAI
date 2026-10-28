import React, { useState } from 'react';
import { X, LifeBuoy, AlertCircle, Loader2 } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { TicketCategory, TicketPriority } from '../../types';

export const NewTicketModal: React.FC = () => {
  const { isNewTicketOpen, setIsNewTicketOpen, addTicket } = useClinic();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Billing');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [patientName, setPatientName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewTicketOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Ticket title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!patientName.trim()) {
      setError('Patient name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await addTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        patientName: patientName.trim(),
        contactInfo: contactInfo.trim() || 'Not provided',
        assignedTo: assignedTo.trim() || 'Front Desk Staff',
      });

      if (success) {
        setTitle('');
        setDescription('');
        setPatientName('');
        setContactInfo('');
        setAssignedTo('');
        setError('');
        setIsNewTicketOpen(false);
      } else {
        setError('Server could not process support ticket. Please check connection.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-800">
              <LifeBuoy className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Open Support Ticket</h2>
              <p className="text-xs text-slate-500">Log an administrative or billing inquiry</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsNewTicketOpen(false)}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-6 py-2.5 bg-amber-50/60 border-b border-amber-100/60 text-xs text-amber-900 flex items-center gap-2">
          <span className="font-medium">Scope Notice:</span>
          <span>Support tickets handle billing, records, insurance, and administrative logistics.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 rounded-lg border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Ticket Title / Subject *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Prior authorization inquiry for medication"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="Billing">Billing & Invoices</option>
                <option value="Medical Records">Medical Records Transfer</option>
                <option value="Insurance">Insurance & Prior Auth</option>
                <option value="Prescription">Prescription Logistics</option>
                <option value="General">General Administrative</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="Low">Low (Routine)</option>
                <option value="Medium">Medium (Standard)</option>
                <option value="High">High (Needs Attention)</option>
                <option value="Urgent">Urgent (Immediate SLA)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Arthur Pendelton"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Contact Phone / Email
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="arthur.p@example.com · (555) 872-9012"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description / Details *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background details and specific clinic action needed..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Assign Staff Member (Optional)
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. Carlos Vega (Records) or Sarah Jenkins (Billing)"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewTicketOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Saving to Database...' : 'Open Support Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

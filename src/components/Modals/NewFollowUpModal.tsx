import React, { useState } from 'react';
import { X, PhoneCall, AlertCircle, Loader2 } from 'lucide-react';
import { useClinic, CURRENT_REFERENCE_DATE } from '../../context/ClinicContext';

export const NewFollowUpModal: React.FC = () => {
  const { isNewFollowUpOpen, setIsNewFollowUpOpen, addFollowUp } = useClinic();

  const [requesterName, setRequesterName] = useState('');
  const [callbackReason, setCallbackReason] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dueDate, setDueDate] = useState(CURRENT_REFERENCE_DATE);
  const [assignedStaff, setAssignedStaff] = useState('Front Desk Reception');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewFollowUpOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!requesterName.trim()) {
      setError('Requester name is required.');
      return;
    }
    if (!callbackReason.trim()) {
      setError('Callback reason is required.');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setError('Please provide phone number or email.');
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await addFollowUp({
        requesterName: requesterName.trim(),
        callbackReason: callbackReason.trim(),
        phone: phone.trim() || 'Not provided',
        email: email.trim() || 'Not provided',
        dueDate,
        assignedStaff: assignedStaff.trim() || 'Front Desk Staff',
        notes: notes.trim() || undefined,
      });

      if (success) {
        setRequesterName('');
        setCallbackReason('');
        setPhone('');
        setEmail('');
        setNotes('');
        setError('');
        setIsNewFollowUpOpen(false);
      } else {
        setError('Server could not schedule follow-up callback. Please check connection.');
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
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
              <PhoneCall className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Schedule Patient Callback</h2>
              <p className="text-xs text-slate-500">Record a phone or email follow-up task</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsNewFollowUpOpen(false)}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
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
              Requester's Full Name *
            </label>
            <input
              type="text"
              required
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              placeholder="e.g. Jonathan Hayes"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Callback Reason *
            </label>
            <textarea
              required
              rows={2}
              value={callbackReason}
              onChange={(e) => setCallbackReason(e.target.value)}
              placeholder="e.g. Inquire about ultrasound diagnostic report availability"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Assigned Staff Member
              </label>
              <input
                type="text"
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Internal Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Best time to call is after 2 PM"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewFollowUpOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Saving to Database...' : 'Save Follow-up Callback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

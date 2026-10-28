import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Mic,
  Copy,
  Check,
  Server,
  Layers,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { dbStatus, dataSource, checkDbConnection, isLoading } = useClinic();
  const [testing, setTesting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    await checkDbConnection();
    setTesting(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sampleVapiAppointmentPayload = JSON.stringify(
    {
      patientName: 'Sarah Connor',
      requestedDate: '2026-10-30',
      requestedTime: '10:00 AM',
      reason: 'Follow-up consultation after lab results',
      department: 'Primary Care',
      phone: '+15552348901',
      email: 'sconnor@example.com',
      notes: 'Booked via Vapi Voice Assistant',
    },
    null,
    2
  );

  const sampleVapiCallbackPayload = JSON.stringify(
    {
      requesterName: 'Michael Scott',
      callbackReason: 'Patient billing question regarding lab invoice copay',
      phone: '+15559876543',
      email: 'mscott@example.com',
      dueDate: '2026-10-28',
      notes: 'Caller requested morning callback window',
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Database className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                MongoDB Atlas & Backend Diagnostics
              </h2>
              <p className="text-xs text-slate-500">
                CareFlow AI Full-Stack Server & Database Status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Connection Status Card */}
          <div
            className={`p-4 rounded-xl border ${
              dbStatus.connected
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {dbStatus.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {dbStatus.connected
                        ? 'MongoDB Atlas Connected'
                        : 'Operating in Local Demo Mode'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        dbStatus.connected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {dbStatus.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">
                    {dbStatus.message}
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-slate-600">
                    Target Database: <span className="font-bold">{dbStatus.name}</span> · Collections: appointments, tickets, followups
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || isLoading}
                className="px-3 py-1.5 bg-white text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-slate-600 ${
                    testing || isLoading ? 'animate-spin' : ''
                  }`}
                />
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          {/* Setup Instructions if disconnected */}
          {!dbStatus.connected && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Server className="w-4 h-4 text-sky-700" />
                <span>How to connect your MongoDB Atlas Database:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed text-xs">
                <li>
                  In your MongoDB Atlas dashboard, obtain your connection string (e.g.{' '}
                  <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px]">
                    mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/CareFlowAI?retryWrites=true&w=majority
                  </code>
                  ).
                </li>
                <li>
                  Ensure the database name is set to <strong className="text-slate-800 font-semibold">CareFlowAI</strong> in the URI path.
                </li>
                <li>
                  In Google AI Studio, open the <strong>Secrets</strong> panel and add:
                  <div className="mt-1 p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                    Name: <strong>MONGODB_URI</strong>
                    <br />
                    Value: <em>[Your full MongoDB Atlas connection URI with username and password]</em>
                  </div>
                </li>
                <li>
                  Click <strong>"Test Connection"</strong> above to establish live persistence!
                </li>
              </ol>
            </div>
          )}

          {/* Vapi Voice Agent Integration Section */}
          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-950 font-bold text-xs">
                <Mic className="w-4 h-4 text-teal-700" />
                <span>Vapi Voice Agent Webhook / Tool Calling Setup</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                Ready for Integration
              </span>
            </div>
            <p className="text-xs text-teal-900/90 leading-relaxed">
              Your friend's Vapi voice agent can invoke the exact same REST API endpoints. Both endpoints support standard JSON requests with flexible field aliases (such as <code className="font-mono text-[11px]">callerName</code> or <code className="font-mono text-[11px]">name</code>):
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] text-slate-800">
                    1. Book Appointment: <code className="text-sky-700 font-mono">POST /api/appointments</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(sampleVapiAppointmentPayload, 'apt')}
                    className="text-[11px] text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIndex === 'apt' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 'apt' ? 'Copied' : 'Copy Sample Payload'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {sampleVapiAppointmentPayload}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] text-slate-800">
                    2. Request Callback: <code className="text-teal-700 font-mono">POST /api/followups</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(sampleVapiCallbackPayload, 'fol')}
                    className="text-[11px] text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIndex === 'fol' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 'fol' ? 'Copied' : 'Copy Sample Payload'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {sampleVapiCallbackPayload}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Health Endpoint: <code className="font-mono text-slate-700">/api/health</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

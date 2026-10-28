import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { AiAssistantView } from './views/AiAssistantView';
import { AppointmentsView } from './views/AppointmentsView';
import { SupportTicketsView } from './views/SupportTicketsView';
import { FollowUpTrackerView } from './views/FollowUpTrackerView';
import { NewAppointmentModal } from './components/Modals/NewAppointmentModal';
import { NewTicketModal } from './components/Modals/NewTicketModal';
import { NewFollowUpModal } from './components/Modals/NewFollowUpModal';
import { DatabaseSettingsModal } from './components/Modals/DatabaseSettingsModal';
import {
  ShieldAlert,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Database,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activePage, notification, clearNotification, dbStatus, dataSource } = useClinic();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView />;
      case 'assistant':
        return <AiAssistantView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'tickets':
        return <SupportTicketsView />;
      case 'followups':
        return <FollowUpTrackerView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Header */}
        <Header onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

        {/* Informative Demo Ribbon when MongoDB is not connected */}
        {!dbStatus.connected && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/80 px-4 sm:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-900">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                <strong>CareFlow AI Database Mode:</strong> Currently operating in local demo mode.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDbModalOpen(true)}
              className="text-amber-800 underline hover:text-amber-950 font-medium cursor-pointer"
            >
              Configure MongoDB Atlas (MONGODB_URI) & Vapi API &rarr;
            </button>
          </div>
        )}

        {/* Global Toast Notification */}
        {notification && (
          <div className="px-4 sm:px-8 pt-3">
            <div
              className={`flex items-center justify-between p-3 rounded-xl border text-xs shadow-xs transition-all ${
                notification.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : notification.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-sky-50 border-sky-200 text-sky-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : notification.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-sky-600 shrink-0" />
                )}
                <span className="font-medium leading-relaxed">{notification.message}</span>
              </div>
              <button
                type="button"
                onClick={clearNotification}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                aria-label="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}

            {/* Quiet Footer */}
            <footer className="pt-8 pb-4 border-t border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-sky-700" />
                <span>CareFlow AI · Clinic Administrative Platform</span>
                <span className="hidden sm:inline" aria-hidden="true">·</span>
                <span className="hidden sm:inline font-mono text-[11px] text-slate-500">
                  {dbStatus.connected ? 'Connected: MongoDB Atlas' : 'Local Demo Sandbox'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-center sm:text-right">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 inline shrink-0" />
                <span>Administrative Assistant Only — Not a Medical Diagnosis or Treatment Tool</span>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Reusable Global Modals */}
      <NewAppointmentModal />
      <NewTicketModal />
      <NewFollowUpModal />
      <DatabaseSettingsModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainAppContent />
    </ClinicProvider>
  );
}

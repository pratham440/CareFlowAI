import React, { useState } from 'react';
import {
  Menu,
  RotateCcw,
  Plus,
  CalendarPlus,
  LifeBuoy,
  PhoneCall,
  Check,
  ChevronDown,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useClinic, CURRENT_REFERENCE_DATE } from '../context/ClinicContext';
import { DatabaseSettingsModal } from './Modals/DatabaseSettingsModal';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activePage,
    resetToDemoData,
    setIsNewAppointmentOpen,
    setIsNewTicketOpen,
    setIsNewFollowUpOpen,
    metrics,
    dataSource,
    dbStatus,
    refreshData,
    isLoading,
  } = useClinic();

  const [resetConfirm, setResetConfirm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Clinic Overview Dashboard';
      case 'assistant':
        return 'AI Administrative Assistant';
      case 'appointments':
        return 'Appointment Requests';
      case 'tickets':
        return 'Administrative Support Tickets';
      case 'followups':
        return 'Patient Follow-Up Tracker';
      default:
        return 'Healthcare Administration';
    }
  };

  const handleReset = () => {
    resetToDemoData();
    setResetConfirm(true);
    setTimeout(() => setResetConfirm(false), 2500);
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white/90 backdrop-blur-md border-b border-slate-200">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>CareFlow AI</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-700 font-medium capitalize">{activePage}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right: DB Badge, Quick actions & Controls */}
        <div className="flex items-center gap-2.5">
          {/* MongoDB Connection Status Pill */}
          <button
            type="button"
            onClick={() => setDbModalOpen(true)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              dbStatus.connected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
            title="Click to view database diagnostics and Vapi setup"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <Database className="w-3.5 h-3.5" />
            <span>
              {dbStatus.connected ? 'Atlas: Connected' : 'Demo Mode (Offline)'}
            </span>
          </button>

          {/* Quick Refresh Data button */}
          <button
            type="button"
            onClick={() => refreshData()}
            disabled={isLoading}
            title="Refresh database records"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Overdue alert badge if any */}
          {metrics.overdueFollowUps > 0 && (
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              <span className="tabular-nums">{metrics.overdueFollowUps} Overdue Follow-ups</span>
            </span>
          )}

          {/* Reference Date Display */}
          <span className="hidden xl:inline-flex text-xs text-slate-600 tabular-nums px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg">
            Date: {CURRENT_REFERENCE_DATE}
          </span>

          {/* Reset Demo Data Button (disabled in real MongoDB mode) */}
          {dataSource === 'demo' && (
            <button
              type="button"
              onClick={handleReset}
              title="Reset clinic records to initial demo state"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {resetConfirm ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Reset Applied</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reset Demo</span>
                </>
              )}
            </button>
          )}

          {/* Quick Add Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
              <span>New...</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsNewAppointmentOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-4 h-4 text-sky-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Appointment Request</p>
                      <p className="text-[11px] text-slate-500">Record a patient booking</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsNewTicketOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <LifeBuoy className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Support Ticket</p>
                      <p className="text-[11px] text-slate-500">Billing, records, or insurance</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsNewFollowUpOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-teal-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Follow-Up Callback</p>
                      <p className="text-[11px] text-slate-500">Schedule phone follow-up</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Database Diagnostic and Vapi Setup Modal */}
      <DatabaseSettingsModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </>
  );
};

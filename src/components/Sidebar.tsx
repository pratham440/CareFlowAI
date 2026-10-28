import React from 'react';
import {
  LayoutDashboard,
  Bot,
  CalendarClock,
  LifeBuoy,
  PhoneCall,
  Activity,
  Clock,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { ActivePage } from '../types';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activePage, setActivePage, metrics } = useClinic();

  const navItems: {
    id: ActivePage;
    label: string;
    icon: React.ElementType;
    badgeCount?: number;
    badgeVariant?: 'default' | 'urgent';
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: Bot,
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: CalendarClock,
      badgeCount: metrics.pendingAppointments > 0 ? metrics.pendingAppointments : undefined,
    },
    {
      id: 'tickets',
      label: 'Support Tickets',
      icon: LifeBuoy,
      badgeCount: metrics.openTickets > 0 ? metrics.openTickets : undefined,
    },
    {
      id: 'followups',
      label: 'Follow-Up Tracker',
      icon: PhoneCall,
      badgeCount: metrics.overdueFollowUps > 0 ? metrics.overdueFollowUps : undefined,
      badgeVariant: metrics.overdueFollowUps > 0 ? 'urgent' : 'default',
    },
  ];

  const handleNavClick = (id: ActivePage) => {
    setActivePage(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-teal-600 text-white shadow-xs">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900">CareFlow AI</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">Clinic Administration</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-600">
          Main Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-sky-50 text-sky-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 stroke-[1.9] ${
                    isActive ? 'text-sky-700' : 'text-slate-600'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>

              {item.badgeCount !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium tabular-nums ${
                    item.badgeVariant === 'urgent'
                      ? 'bg-rose-100 text-rose-700 font-bold'
                      : isActive
                      ? 'bg-sky-200/70 text-sky-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badgeVariant === 'urgent' ? `${item.badgeCount} Overdue` : item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Clinic Operating Hours Card */}
      <div className="p-3 mx-3 mb-3 bg-slate-50 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span>Clinic Hours</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Mon – Fri: <span className="tabular-nums font-medium text-slate-700">8am – 6pm</span>
          <br />
          Saturday: <span className="tabular-nums font-medium text-slate-700">9am – 2pm</span>
        </p>
      </div>

      {/* Medical Boundary Notice */}
      <div className="p-3 mx-3 mb-4 bg-amber-50/70 rounded-xl border border-amber-200/60">
        <div className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-amber-900">Administrative Assistant</p>
            <p className="text-[10px] text-amber-800/90 leading-tight mt-0.5">
              Not a medical diagnosis tool. Do not use for urgent health emergencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sliding Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

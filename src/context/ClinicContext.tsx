import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppointmentRequest,
  AppointmentStatus,
  SupportTicket,
  TicketStatus,
  FollowUp,
  FollowUpStatus,
  ActivityEvent,
  ActivePage,
} from '../types';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_TICKETS,
  INITIAL_FOLLOW_UPS,
  INITIAL_ACTIVITIES,
} from '../data/mockData';

// Fictional reference date for clinic demo display
export const CURRENT_REFERENCE_DATE = '2026-10-27';

export interface DatabaseStatusInfo {
  connected: boolean;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  name: string;
  hasUriConfigured: boolean;
  message: string;
}

export interface NotificationState {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ClinicContextType {
  // Navigation
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;

  // Data
  appointments: AppointmentRequest[];
  tickets: SupportTicket[];
  followUps: FollowUp[];
  activities: ActivityEvent[];

  // Backend / Database State
  dataSource: 'mongodb' | 'demo';
  dbStatus: DatabaseStatusInfo;
  isLoading: boolean;
  error: string | null;
  notification: NotificationState | null;
  clearNotification: () => void;
  refreshData: () => Promise<void>;
  checkDbConnection: () => Promise<void>;

  // Mutations
  addAppointment: (request: Omit<AppointmentRequest, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;

  addTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => Promise<boolean>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<boolean>;
  deleteTicket: (id: string) => Promise<boolean>;

  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  updateFollowUpStatus: (id: string, status: FollowUpStatus) => Promise<boolean>;
  deleteFollowUp: (id: string) => Promise<boolean>;

  resetToDemoData: () => void;

  // Modals state
  isNewAppointmentOpen: boolean;
  setIsNewAppointmentOpen: (open: boolean) => void;
  isNewTicketOpen: boolean;
  setIsNewTicketOpen: (open: boolean) => void;
  isNewFollowUpOpen: boolean;
  setIsNewFollowUpOpen: (open: boolean) => void;

  // Computed Metrics
  metrics: {
    pendingAppointments: number;
    totalAppointments: number;
    openTickets: number;
    pendingFollowUps: number;
    overdueFollowUps: number;
  };

  isDateOverdue: (dueDateString: string, status: FollowUpStatus) => boolean;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const STORAGE_KEYS = {
  APPOINTMENTS: 'careflow_appointments_v1',
  TICKETS: 'careflow_tickets_v1',
  FOLLOW_UPS: 'careflow_followups_v1',
  ACTIVITIES: 'careflow_activities_v1',
};

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  const [appointments, setAppointments] = useState<AppointmentRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
      return saved ? JSON.parse(saved) : INITIAL_FOLLOW_UPS;
    } catch {
      return INITIAL_FOLLOW_UPS;
    }
  });

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  // Backend state
  const [dataSource, setDataSource] = useState<'mongodb' | 'demo'>('demo');
  const [dbStatus, setDbStatus] = useState<DatabaseStatusInfo>({
    connected: false,
    status: 'disconnected',
    name: 'CareFlowAI',
    hasUriConfigured: false,
    message: 'Checking MongoDB Atlas connection...',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Modals
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isNewFollowUpOpen, setIsNewFollowUpOpen] = useState(false);

  const clearNotification = () => setNotification(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        setNotification((current) => (current?.message === message ? null : current));
      }, 4000);
    }
  };

  const addActivity = (title: string, type: 'appointment' | 'ticket' | 'followup', action: string, description: string) => {
    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      title,
      timestamp: 'Just now',
      type,
      action,
      description,
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 19)]);
  };

  // Sync to localStorage only when in demo mode
  useEffect(() => {
    if (dataSource === 'demo') {
      try {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      } catch {}
    }
  }, [appointments, dataSource]);

  useEffect(() => {
    if (dataSource === 'demo') {
      try {
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
      } catch {}
    }
  }, [tickets, dataSource]);

  useEffect(() => {
    if (dataSource === 'demo') {
      try {
        localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(followUps));
      } catch {}
    }
  }, [followUps, dataSource]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch {}
  }, [activities]);

  // Check health and load data
  const checkDbConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`Health check failed with status ${res.status}`);
      }
      const data = await res.json();
      const db = data.database || {};

      setDbStatus({
        connected: Boolean(db.connected),
        status: db.status || 'disconnected',
        name: db.name || 'CareFlowAI',
        hasUriConfigured: Boolean(db.hasUriConfigured),
        message: db.message || 'Health check responded',
      });

      if (db.connected) {
        setDataSource('mongodb');
        // Fetch MongoDB collections in parallel
        await loadMongoData();
      } else {
        setDataSource('demo');
      }
    } catch (err: any) {
      console.warn('[ClinicContext] Health check error:', err.message);
      setDbStatus({
        connected: false,
        status: 'disconnected',
        name: 'CareFlowAI',
        hasUriConfigured: false,
        message: 'Could not connect to backend health endpoint. Running in local demo mode.',
      });
      setDataSource('demo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMongoData = async () => {
    try {
      const [aptRes, tckRes, folRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/tickets'),
        fetch('/api/followups'),
      ]);

      if (aptRes.ok) {
        const aptData = await aptRes.json();
        if (aptData.success && Array.isArray(aptData.data)) {
          setAppointments(aptData.data);
        }
      }

      if (tckRes.ok) {
        const tckData = await tckRes.json();
        if (tckData.success && Array.isArray(tckData.data)) {
          setTickets(tckData.data);
        }
      }

      if (folRes.ok) {
        const folData = await folRes.json();
        if (folData.success && Array.isArray(folData.data)) {
          setFollowUps(folData.data);
        }
      }
    } catch (err: any) {
      console.error('[ClinicContext] Error loading collections from MongoDB:', err);
      setError(`Failed to fetch collections from MongoDB: ${err.message}`);
    }
  };

  useEffect(() => {
    checkDbConnection();
  }, [checkDbConnection]);

  const refreshData = async () => {
    await checkDbConnection();
  };

  // Overdue check logic
  const isDateOverdue = (dueDateString: string, status: FollowUpStatus): boolean => {
    if (status === 'Completed') return false;
    return dueDateString < CURRENT_REFERENCE_DATE;
  };

  // Appointment Mutations
  const addAppointment = async (
    data: Omit<AppointmentRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<boolean> => {
    if (dataSource === 'mongodb') {
      try {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Server rejected appointment creation');
        }

        const createdDoc: AppointmentRequest = json.data;
        setAppointments((prev) => [createdDoc, ...prev]);
        addActivity(
          'New appointment request created in MongoDB',
          'appointment',
          'Created',
          `${createdDoc.patientName} requested ${createdDoc.department} visit on ${createdDoc.requestedDate}.`
        );
        showNotification('success', `Appointment for ${createdDoc.patientName} saved to MongoDB Atlas.`);
        return true;
      } catch (err: any) {
        console.error('[ClinicContext] addAppointment error:', err);
        showNotification('error', `Failed to save appointment to MongoDB: ${err.message}`);
        return false;
      }
    } else {
      // Demo Mode
      const newApt: AppointmentRequest = {
        ...data,
        id: `apt-${Date.now()}`,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      setAppointments((prev) => [newApt, ...prev]);
      addActivity(
        'New appointment request logged (Demo Mode)',
        'appointment',
        'Created',
        `${data.patientName} requested ${data.department} consultation for ${data.requestedDate}.`
      );
      showNotification('info', `Appointment logged in Demo Mode. Connect MongoDB to save to Atlas.`);
      return true;
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus): Promise<boolean> => {
    if (dataSource === 'mongodb') {
      try {
        const res = await fetch(`/api/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Failed to update status on server');
        }

        const updatedDoc: AppointmentRequest = json.data;
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? updatedDoc : apt))
        );
        addActivity(
          `Appointment status updated in MongoDB`,
          'appointment',
          status,
          `Appointment for ${updatedDoc.patientName} updated to "${status}".`
        );
        showNotification('success', `Appointment status updated to ${status} in MongoDB.`);
        return true;
      } catch (err: any) {
        console.error('[ClinicContext] updateAppointmentStatus error:', err);
        showNotification('error', `Failed to update status on server: ${err.message}`);
        return false;
      }
    } else {
      // Demo Mode
      setAppointments((prev) =>
        prev.map((apt) => {
          if (apt.id === id) {
            addActivity(
              `Appointment status updated to ${status} (Demo)`,
              'appointment',
              status,
              `Status for ${apt.patientName} was updated to ${status}.`
            );
            return { ...apt, status };
          }
          return apt;
        })
      );
      showNotification('info', `Status updated to ${status} (Demo Mode).`);
      return true;
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    if (dataSource === 'mongodb') {
      try {
        const res = await fetch(`/api/appointments/${id}`, {
          method: 'DELETE',
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Server failed to delete record');
        }

        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
        showNotification('success', 'Appointment deleted from MongoDB Atlas.');
        return true;
      } catch (err: any) {
        console.error('[ClinicContext] deleteAppointment error:', err);
        showNotification('error', `Failed to delete from MongoDB: ${err.message}`);
        return false;
      }
    } else {
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      showNotification('info', 'Appointment removed (Demo Mode).');
      return true;
    }
  };

  // Ticket Mutations
  const addTicket = async (
    data: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>
  ): Promise<boolean> => {
    if (dataSource === 'mongodb') {
      try {
        const res = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Failed to open ticket on server');
        }

        const createdDoc: SupportTicket = json.data;
        setTickets((prev) => [createdDoc, ...prev]);
        addActivity(
          `Support ticket #${createdDoc.ticketNumber} opened in MongoDB`,
          'ticket',
          'Created',
          `"${createdDoc.title}" submitted for ${createdDoc.patientName}.`
        );
        showNotification('success', `Ticket #${createdDoc.ticketNumber} saved to MongoDB Atlas.`);
        return true;
      } catch (err: any) {
        console.error('[ClinicContext] addTicket error:', err);
        showNotification('error', `Failed to open ticket in MongoDB: ${err.message}`);
        return false;
      }
    } else {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newTicket: SupportTicket = {
        ...data,
        id: `tck-${Date.now()}`,
        ticketNumber: `TCK-${randomNum}`,
        status: 'Open',
        createdAt: new Date().toISOString(),
      };
      setTickets((prev) => [newTicket, ...prev]);
      addActivity(
        `Support ticket #${newTicket.ticketNumber} opened (Demo Mode)`,
        'ticket',
        'Created',
        `"${data.title}" submitted for ${data.patientName}.`
      );
      showNotification('info', `Ticket logged in Demo Mode. Connect MongoDB to save to Atlas.`);
      return true;
    }
  };

  const updateTicketStatus = async (id: string, status: TicketStatus): Promise<boolean> => {
    if (dataSource === 'mongodb') {
      try {
        const res = await fetch(`/api/tickets/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Failed to update ticket on server');
        }

        const updatedDoc: SupportTicket = json.data;
        setTickets((prev) => prev.map((tck) => (tck.id === id ? updatedDoc : tck)));
        addActivity(
          `Support ticket #${updatedDoc.ticketNumber} marked ${status} in MongoDB`,
          'ticket',
          status,
          `Ticket "${updatedDoc.title}" moved to ${status}.`
        );
        showNotification('success', `Ticket status updated to ${status} in MongoDB.`);
        return true;
      } catch (err: any) {
        console.error('[ClinicContext] updateTicketStatus error:', err);
        showNotification('error', `Failed to update ticket: ${err.message}`);
        return false;
      }
    } else {
      setTickets((prev) =>
        prev.map((tck) => {
          if (tck.id === id) {
            addActivity(
              `Support ticket #${tck.ticketNumber} marked ${status} (Demo)`,
              'ticket',
              status,
              `Ticket "${tck.title}" moved to ${status}.`
            );
            return { ...tck, status };
          }
          return tck;
        })
      );
      showNotification('info', `Ticket updated to ${status} (Demo Mode).`);
      return true;
    }
  };

  const deleteTicket = async (id: string): Promise<boolean> => {
    if (dataSource === 'mongodb') {
      try {
        const res = await fetch(`/api/tickets/${id}`, {
          method: 'DELETE',
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Server failed to delete ticket');
        }

        setTickets((prev) => prev.filter((tck) => tck.id !== id));
        showNotification('success', 'Ticket deleted from MongoDB Atlas.');
        return true;
      } catch (err: any) {
        console.error('[ClinicContext] deleteTicket error:', err);
        showNotification('error', `Failed to delete ticket: ${err.message}`);
        return false;
      }
    } else {
      setTickets((prev) => prev.filter((tck) => tck.id !== id));
      showNotification('info', 'Ticket removed (Demo Mode).');
      return true;
    }
  };

  // Follow-up Mutations
  const addFollowUp = async (
    data: Omit<FollowUp, 'id' | 'createdAt' | 'status'>
  ): Promise<boolean> => {
    if (dataSource === 'mongodb') {
      try {
        const res = await fetch('/api/followups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Failed to save callback on server');
        }

        const createdDoc: FollowUp = json.data;
        setFollowUps((prev) => [createdDoc, ...prev]);
        addActivity(
          'New patient callback scheduled in MongoDB',
          'followup',
          'Scheduled',
          `Callback scheduled for ${createdDoc.requesterName} due by ${createdDoc.dueDate}.`
        );
        showNotification('success', `Callback for ${createdDoc.requesterName} saved to MongoDB Atlas.`);
        return true;
      } catch (err: any) {
        console.error('[ClinicContext] addFollowUp error:', err);
        showNotification('error', `Failed to schedule callback in MongoDB: ${err.message}`);
        return false;
      }
    } else {
      const newFollowUp: FollowUp = {
        ...data,
        id: `fol-${Date.now()}`,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      setFollowUps((prev) => [newFollowUp, ...prev]);
      addActivity(
        'New patient callback scheduled (Demo Mode)',
        'followup',
        'Scheduled',
        `Callback scheduled for ${data.requesterName} due by ${data.dueDate}.`
      );
      showNotification('info', `Callback scheduled in Demo Mode. Connect MongoDB to save to Atlas.`);
      return true;
    }
  };

  const updateFollowUpStatus = async (id: string, status: FollowUpStatus): Promise<boolean> => {
    if (dataSource === 'mongodb') {
      try {
        const res = await fetch(`/api/followups/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Failed to update callback on server');
        }

        const updatedDoc: FollowUp = json.data;
        setFollowUps((prev) => prev.map((fol) => (fol.id === id ? updatedDoc : fol)));
        addActivity(
          `Follow-up status marked ${status} in MongoDB`,
          'followup',
          status,
          `Callback for ${updatedDoc.requesterName} marked as ${status}.`
        );
        showNotification('success', `Callback status updated to ${status} in MongoDB.`);
        return true;
      } catch (err: any) {
        console.error('[ClinicContext] updateFollowUpStatus error:', err);
        showNotification('error', `Failed to update callback: ${err.message}`);
        return false;
      }
    } else {
      setFollowUps((prev) =>
        prev.map((fol) => {
          if (fol.id === id) {
            addActivity(
              `Follow-up status marked ${status} (Demo)`,
              'followup',
              status,
              `Callback for ${fol.requesterName} marked as ${status}.`
            );
            return { ...fol, status };
          }
          return fol;
        })
      );
      showNotification('info', `Callback updated to ${status} (Demo Mode).`);
      return true;
    }
  };

  const deleteFollowUp = async (id: string): Promise<boolean> => {
    if (dataSource === 'mongodb') {
      try {
        const res = await fetch(`/api/followups/${id}`, {
          method: 'DELETE',
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Server failed to delete callback');
        }

        setFollowUps((prev) => prev.filter((fol) => fol.id !== id));
        showNotification('success', 'Callback deleted from MongoDB Atlas.');
        return true;
      } catch (err: any) {
        console.error('[ClinicContext] deleteFollowUp error:', err);
        showNotification('error', `Failed to delete callback: ${err.message}`);
        return false;
      }
    } else {
      setFollowUps((prev) => prev.filter((fol) => fol.id !== id));
      showNotification('info', 'Callback removed (Demo Mode).');
      return true;
    }
  };

  const resetToDemoData = () => {
    if (dataSource === 'mongodb') {
      showNotification(
        'info',
        'Real MongoDB database is active. Demo reset is disabled to protect production database records.'
      );
      return;
    }
    setAppointments(INITIAL_APPOINTMENTS);
    setTickets(INITIAL_TICKETS);
    setFollowUps(INITIAL_FOLLOW_UPS);
    setActivities(INITIAL_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    showNotification('success', 'Local demo records have been reset.');
  };

  // Computed metrics
  const pendingAppointments = appointments.filter((a) => a.status === 'Pending').length;
  const openTickets = tickets.filter((t) => t.status === 'Open').length;
  const pendingFollowUps = followUps.filter((f) => f.status === 'Pending' || f.status === 'In Progress').length;
  const overdueFollowUps = followUps.filter((f) => isDateOverdue(f.dueDate, f.status)).length;

  return (
    <ClinicContext.Provider
      value={{
        activePage,
        setActivePage,
        appointments,
        tickets,
        followUps,
        activities,
        dataSource,
        dbStatus,
        isLoading,
        error,
        notification,
        clearNotification,
        refreshData,
        checkDbConnection,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        addTicket,
        updateTicketStatus,
        deleteTicket,
        addFollowUp,
        updateFollowUpStatus,
        deleteFollowUp,
        resetToDemoData,
        isNewAppointmentOpen,
        setIsNewAppointmentOpen,
        isNewTicketOpen,
        setIsNewTicketOpen,
        isNewFollowUpOpen,
        setIsNewFollowUpOpen,
        metrics: {
          pendingAppointments,
          totalAppointments: appointments.length,
          openTickets,
          pendingFollowUps,
          overdueFollowUps,
        },
        isDateOverdue,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

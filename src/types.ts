export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
export type TicketCategory = 'Billing' | 'Medical Records' | 'Insurance' | 'Prescription' | 'General';

export type FollowUpStatus = 'Pending' | 'In Progress' | 'Completed';

export interface AppointmentRequest {
  id: string;
  patientName: string;
  requestedDate: string; // YYYY-MM-DD
  requestedTime: string; // e.g. "09:30 AM"
  reason: string;
  department: string;
  phone: string;
  email: string;
  status: AppointmentStatus;
  createdAt: string;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  patientName: string;
  contactInfo: string;
  createdAt: string;
  assignedTo?: string;
}

export interface FollowUp {
  id: string;
  requesterName: string;
  callbackReason: string;
  phone: string;
  email: string;
  dueDate: string; // YYYY-MM-DD
  status: FollowUpStatus;
  assignedStaff: string;
  createdAt: string;
  notes?: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  timestamp: string;
  type: 'appointment' | 'ticket' | 'followup';
  action: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: 'open_appointment_modal' | 'open_callback_modal' | 'view_hours';
  };
}

export type ActivePage = 'dashboard' | 'assistant' | 'appointments' | 'tickets' | 'followups';

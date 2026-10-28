import { AppointmentRequest, SupportTicket, FollowUp, ActivityEvent } from '../types';

export const INITIAL_APPOINTMENTS: AppointmentRequest[] = [
  {
    id: 'apt-1',
    patientName: 'Eleanor Vance',
    requestedDate: '2026-10-29',
    requestedTime: '09:00 AM',
    reason: 'Routine Annual Wellness Exam & Bloodwork Review',
    department: 'Primary Care',
    phone: '(555) 234-8901',
    email: 'eleanor.vance@example.com',
    status: 'Pending',
    createdAt: '2026-10-27T08:15:00Z',
    notes: 'Prefers morning appointments before 11 AM.'
  },
  {
    id: 'apt-2',
    patientName: 'Marcus Sterling',
    requestedDate: '2026-10-28',
    requestedTime: '11:30 AM',
    reason: 'Follow-up consultation for sprained wrist rehabilitation',
    department: 'Orthopedics',
    phone: '(555) 891-2345',
    email: 'm.sterling@example.org',
    status: 'Confirmed',
    createdAt: '2026-10-26T14:20:00Z',
    notes: 'X-rays from urgent care already transferred.'
  },
  {
    id: 'apt-3',
    patientName: 'Sophia Patel',
    requestedDate: '2026-10-30',
    requestedTime: '02:00 PM',
    reason: 'New patient pediatric intake for asthma checkup',
    department: 'Pediatrics',
    phone: '(555) 432-9081',
    email: 'spatel.family@example.net',
    status: 'Pending',
    createdAt: '2026-10-27T10:45:00Z',
    notes: 'Transferred from out-of-state clinic.'
  },
  {
    id: 'apt-4',
    patientName: 'David Chen',
    requestedDate: '2026-10-26',
    requestedTime: '10:00 AM',
    reason: 'Preventive cardiology dietary guidance follow-up',
    department: 'Cardiology',
    phone: '(555) 321-7789',
    email: 'dchen92@example.com',
    status: 'Completed',
    createdAt: '2026-10-24T09:00:00Z',
    notes: 'Completed session with nurse practitioner.'
  },
  {
    id: 'apt-5',
    patientName: 'Hannah Abbott',
    requestedDate: '2026-11-02',
    requestedTime: '03:15 PM',
    reason: 'Dermatology consultation for seasonal skin allergy',
    department: 'Dermatology',
    phone: '(555) 678-4321',
    email: 'hannah.a@example.com',
    status: 'Pending',
    createdAt: '2026-10-27T11:30:00Z',
    notes: 'Requested Dr. Kim if available.'
  },
  {
    id: 'apt-6',
    patientName: 'Robert Langdon',
    requestedDate: '2026-10-25',
    requestedTime: '01:30 PM',
    reason: 'Travel vaccine vaccination consultation',
    department: 'Travel Medicine',
    phone: '(555) 789-0123',
    email: 'rlangdon@example.edu',
    status: 'Cancelled',
    createdAt: '2026-10-22T16:00:00Z',
    notes: 'Patient rescheduled to next month due to flight change.'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tck-1',
    ticketNumber: 'TCK-1048',
    title: 'Discrepancy on Lab Work Copay Statement',
    description: 'Patient received an invoice for $65 despite in-network preventative coverage. Requesting re-billing verification with BlueShield.',
    category: 'Billing',
    priority: 'High',
    status: 'Open',
    patientName: 'Arthur Pendelton',
    contactInfo: 'arthur.p@example.com · (555) 872-9012',
    createdAt: '2026-10-27T09:30:00Z',
    assignedTo: 'Sarah Jenkins (Billing)'
  },
  {
    id: 'tck-2',
    ticketNumber: 'TCK-1047',
    title: 'Electronic Medical Record Transfer to St. Jude',
    description: 'Requested urgent release of cardiology echocardiogram files for secondary specialist appointment on Friday.',
    category: 'Medical Records',
    priority: 'Urgent',
    status: 'In Progress',
    patientName: 'Grace Miller',
    contactInfo: 'gmiller_care@example.com · (555) 431-7722',
    createdAt: '2026-10-26T15:45:00Z',
    assignedTo: 'Carlos Vega (Records)'
  },
  {
    id: 'tck-3',
    ticketNumber: 'TCK-1046',
    title: 'Prior Authorization Status for Statin Medication',
    description: 'Pharmacy indicated insurance rejection pending physician prior authorization letter.',
    category: 'Insurance',
    priority: 'Medium',
    status: 'In Progress',
    patientName: 'Timothy Vance',
    contactInfo: 'tvance@example.org · (555) 901-3456',
    createdAt: '2026-10-25T11:15:00Z',
    assignedTo: 'Elena Rostova (Care Coord)'
  },
  {
    id: 'tck-4',
    ticketNumber: 'TCK-1045',
    title: 'Patient Portal Password & MFA Access Reset',
    description: 'Patient locked out of the MyCare portal after replacing their mobile phone.',
    category: 'General',
    priority: 'Low',
    status: 'Resolved',
    patientName: 'Brenda Lawson',
    contactInfo: 'blawson@example.com · (555) 219-8834',
    createdAt: '2026-10-24T13:00:00Z',
    assignedTo: 'Front Desk Tech'
  },
  {
    id: 'tck-5',
    ticketNumber: 'TCK-1044',
    title: 'Itemized Receipt for FSA Reimbursement Request',
    description: 'Needs itemized breakdown of physical therapy deductible payments made in September.',
    category: 'Billing',
    priority: 'Medium',
    status: 'Open',
    patientName: 'Liam O’Connor',
    contactInfo: 'liam.oc@example.com · (555) 345-6712',
    createdAt: '2026-10-27T10:10:00Z',
    assignedTo: 'Unassigned'
  }
];

export const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'fol-1',
    requesterName: 'Jonathan Hayes',
    callbackReason: 'Inquire about ultrasound diagnostic report availability',
    phone: '(555) 492-1188',
    email: 'j.hayes@example.com',
    dueDate: '2026-10-25', // OVERDUE (past Oct 27)
    status: 'Pending',
    assignedStaff: 'Elena Rostova',
    createdAt: '2026-10-24T10:00:00Z',
    notes: 'Dr. Martinez signed off on the report; patient needs telephone summary.'
  },
  {
    id: 'fol-2',
    requesterName: 'Claire Redfern',
    callbackReason: 'Questions about insurance pre-clearance for MRI',
    phone: '(555) 381-9920',
    email: 'claire.redfern@example.net',
    dueDate: '2026-10-26', // OVERDUE (past Oct 27)
    status: 'Pending',
    assignedStaff: 'Carlos Vega',
    createdAt: '2026-10-25T09:30:00Z',
    notes: 'Left voicemail yesterday, waiting for patient callback window.'
  },
  {
    id: 'fol-3',
    requesterName: 'Albert Thorne',
    callbackReason: 'Clarification on fasting instructions for Thursday bloodwork',
    phone: '(555) 773-4412',
    email: 'athorne@example.com',
    dueDate: '2026-10-28', // Upcoming
    status: 'Pending',
    assignedStaff: 'Nurse Emily',
    createdAt: '2026-10-27T08:45:00Z',
    notes: 'Scheduled for 12-hour fasting lipid panel.'
  },
  {
    id: 'fol-4',
    requesterName: 'Miriam Santiago',
    callbackReason: 'Review prescription delivery options through local pharmacy courier',
    phone: '(555) 662-8801',
    email: 'm.santiago@example.org',
    dueDate: '2026-10-29', // Upcoming
    status: 'In Progress',
    assignedStaff: 'Sarah Jenkins',
    createdAt: '2026-10-26T16:20:00Z',
    notes: 'Reaching out to Walgreens pharmacy dispatch.'
  },
  {
    id: 'fol-5',
    requesterName: 'Douglas Bell',
    callbackReason: 'Post-appointment billing inquiry clarification',
    phone: '(555) 129-4455',
    email: 'dbell@example.com',
    dueDate: '2026-10-26',
    status: 'Completed',
    assignedStaff: 'Carlos Vega',
    createdAt: '2026-10-25T11:00:00Z',
    notes: 'Called back on Oct 26. Patient questions answered successfully.'
  }
];

export const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    title: 'New appointment request received',
    timestamp: '15 mins ago',
    type: 'appointment',
    action: 'Created',
    description: 'Eleanor Vance requested Primary Care consultation for Oct 29.'
  },
  {
    id: 'act-2',
    title: 'Support ticket updated',
    timestamp: '1 hour ago',
    type: 'ticket',
    action: 'In Progress',
    description: 'TCK-1047 (Grace Miller - Medical Records) assigned to Carlos Vega.'
  },
  {
    id: 'act-3',
    title: 'Appointment confirmed',
    timestamp: '3 hours ago',
    type: 'appointment',
    action: 'Status Changed',
    description: 'Marcus Sterling appointment confirmed for Oct 28 at 11:30 AM.'
  },
  {
    id: 'act-4',
    title: 'Follow-up callback completed',
    timestamp: 'Yesterday',
    type: 'followup',
    action: 'Completed',
    description: 'Douglas Bell billing clarification completed by Carlos Vega.'
  }
];

export const CLINIC_INFO = {
  name: 'CareFlow Family Health Clinic',
  address: '742 Healthcare Parkway, Suite 300, Metro City',
  hours: 'Monday – Friday: 8:00 AM – 6:00 PM | Saturday: 9:00 AM – 2:00 PM | Sunday: Closed',
  phone: '(555) 100-CARE (2273)',
  emergencyNotice: 'If you are experiencing a medical emergency, please call 911 immediately or visit the nearest emergency room. CareFlow AI is an administrative assistant and cannot provide medical advice or triage urgent medical conditions.'
};

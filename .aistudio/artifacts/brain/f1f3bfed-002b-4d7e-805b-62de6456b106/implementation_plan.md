# CareFlow AI — Modern Healthcare Administration Platform

CareFlow AI is a responsive, modern administrative assistant web application tailored for clinic coordinators and reception staff. It provides unified management for appointment requests, support tickets, and patient callbacks without providing medical diagnosis or treatment advice.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned during the initial consultation:
> - **Session Persistence**: Data is preserved in browser `localStorage` with a realistic clinic seed dataset and a one-click "Reset Demo Data" option.
> - **Staff Capabilities**: Staff can view, filter, sort, change statuses, and create new appointment requests, support tickets, and follow-up callbacks via accessible modal dialogs.
> - **AI Assistant Experience**: A simulated clinic administrative concierge with quick suggested prompts, typing indicator, clear "Administrative Demo" notices, and instant action shortcuts (e.g., jump to appointment booking).
> - **Medical Boundary**: Strict administrative assistant boundary — no medical diagnosis, triage advice, or clinical treatment recommendations are generated.

---

### 1. Overview & Core Concept

- **What It Does**: CareFlow AI equips clinic front-desk teams, patient navigators, and clinic managers with a clean interface to track incoming patient inquiries, schedule visits, triage administrative tickets (billing, records, insurance), and follow up on callbacks.
- **Target Audience / Persona**: Clinic administrative coordinators, front-desk receptionists, practice managers, and prospective clinic patients using the front-facing assistant.
- **Key Value**: Eliminates lost phone slips and sticky notes by bringing appointments, inquiries, and pending callbacks into a single dashboard with live metric counters and SLA alerts for overdue follow-ups.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Executive Dashboard**:
   - Four top summary metric cards: **Appointment Requests**, **Open Support Tickets**, **Pending Follow-ups**, and **Overdue Follow-ups** (with urgent crimson styling).
   - Quick action buttons to rapidly log a new patient inquiry or appointment.
   - Dual-column workspace: **Recent Clinic Activity Timeline** on the left and **Upcoming Appointment Requests** on the right with direct status dropdowns.
2. **AI Administrative Assistant**:
   - Dedicated interactive chat interface simulating a clinic receptionist.
   - 4 pre-configured suggested queries ("What are your clinic hours?", "How do I request an appointment?", "Can someone call me back?", "How do I contact the clinic?").
   - Realistic typing indicator, response timestamps, and explicit demo disclaimers emphasizing that medical diagnosis is not provided.
3. **Appointments Management**:
   - Data table with Patient Name, Requested Date/Time, Department/Reason for Visit, Contact Information (phone + email), and Status (Pending, Confirmed, Completed, Cancelled).
   - Search bar and segmented status filter tabs (`All`, `Pending`, `Confirmed`, `Completed`, `Cancelled`).
   - "New Appointment Request" modal with validation.
4. **Support Tickets**:
   - Filterable table and card view showing Ticket Title, Description, Priority (Low, Medium, High, Urgent), Created Date, and Status (Open, In Progress, Resolved).
   - "Create Support Ticket" modal with category selection (Billing, Medical Records, Insurance, General).
5. **Follow-Up Tracker**:
   - Table highlighting Requester's Name, Callback Reason, Contact Info, Due Date, and Status (Pending, In Progress, Completed).
   - Dynamic date comparison: any pending follow-up past its due date is clearly highlighted with an **Overdue** indicator and high-priority badge.
   - "Schedule Callback" modal and status toggle controls.

#### Visual Identity & Theme
- **Color Palette & Discipline**:
  - Dominant Neutral: Clean hospital-grade white canvas (`#FFFFFF`) with subtle cool slate surface (`#F8FAFC`).
  - Structural Surfaces: Crisp hairline borders (`border-slate-200`) and soft card backgrounds (`#FFFFFF`).
  - Accent Colors: Healthcare deep navy (`#0F172A`), clinical medical blue (`#0284C7`), and fresh teal (`#0D9488`).
  - Semantic Status: Emerald (`#059669`) for Confirmed/Resolved, Amber (`#D97706`) for Pending/In Progress, Crimson (`#DC2626`) for Overdue/Urgent.
- **Typography & Layout**:
  - Display & Headings: `Plus Jakarta Sans` / modern geometric sans.
  - Body & Form: Clean high-legibility sans with clear line-height.
  - Tabular Numerals: Tabular figures (`tabular-nums`) for phone numbers, dates, times, and metric counts.
  - Anti-Slop Discipline: Zero static pill sandwiches, no arbitrary single-number scoreboards, no floating neon glow, and no code comments in headings.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side LocalStorage Persistence vs. Ephemeral Memory**
  - *Chosen Approach*: Layered state hook that synchronizes with `localStorage`, pre-seeded with rich, realistic clinic records (fictional names and scenarios).
  - *Why*: Allows judges or evaluators to test updating statuses, adding new appointments, reloading the browser, and seeing their changes persist without requiring a remote database setup.
  - *Alternatives Considered*: Pure memory (lost on reload) or cloud database (would require credentials and setup not requested in Turn 1).
- **Decision 2: Clear Separation of Demo AI vs Backend Persistence**
  - *Chosen Approach*: The assistant responds with structured, realistic answers and provides an "Open Booking Form" direct CTA when a user asks to book an appointment.
  - *Why*: Respects the prompt requirement: "Do not pretend that an appointment or callback has been booked unless the application actually saves it."
- **Decision 3: Modular Data Architecture**
  - *Chosen Approach*: Standard TypeScript models (`Appointment`, `Ticket`, `FollowUp`, `ActivityLog`) structured cleanly with mock initial stores.
  - *Why*: Ensures the project can easily connect to Express/Node.js endpoints and MongoDB models in future development phases.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CareFlow AI                               │
│                         (Root App Component)                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌────────────────────────┐                      ┌──────────────────────────────┐
│     Sidebar Nav        │                      │         Header Bar           │
│  - Dashboard           │                      │  - Page Title / Breadcrumbs  │
│  - AI Assistant        │                      │  - Live Overdue Alert Pill   │
│  - Appointments        │                      │  - "Reset Demo Data" Action  │
│  - Support Tickets     │                      │  - Quick Add Button          │
│  - Follow-up Tracker   │                      └──────────────┬───────────────┘
└───────────┬────────────┘                                     │
            └───────────────────────┬──────────────────────────┘
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Active View Container                              │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │    Dashboard    │  │  AI Assistant   │  │   Appointments Table         │  │
│  │ - 4 Metric Cards│  │ - Chat Stream   │  │ - Search & Status Filter     │  │
│  │ - Recent Feed   │  │ - Quick Queries │  │ - Inline Status Switcher     │  │
│  │ - Upcoming List │  │ - Demo Notice   │  │ - "New Request" Modal        │  │
│  └─────────────────┘  └─────────────────┘  └──────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────────┐  │
│  │        Support Tickets View          │  │     Follow-Up Tracker        │  │
│  │ - Priority / Category Triage         │  │ - Overdue Highlight Flags    │  │
│  │ - Status Lifecycle (Open -> Done)    │  │ - Due Date Comparison        │  │
│  │ - "Create Ticket" Modal              │  │ - "Schedule Callback" Modal  │  │
│  └──────────────────────────────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                   LocalStorage Data Store & Event Handlers                   │
│         [Appointments]   [Support Tickets]   [Follow-Ups]   [Activity]       │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Data Entities & Schema
- **AppointmentRequest**: `id`, `patientName`, `requestedDate`, `requestedTime`, `reason`, `department`, `phone`, `email`, `status` ('pending' | 'confirmed' | 'completed' | 'cancelled'), `createdAt`.
- **SupportTicket**: `id`, `ticketNumber`, `title`, `description`, `category` ('billing' | 'records' | 'insurance' | 'general'), `priority` ('low' | 'medium' | 'high' | 'urgent'), `status` ('open' | 'in_progress' | 'resolved'), `patientName`, `createdAt`.
- **FollowUp**: `id`, `requesterName`, `callbackReason`, `phone`, `email`, `dueDate`, `status` ('pending' | 'in_progress' | 'completed'), `assignedStaff`, `notes`, `createdAt`.
- **ActivityEvent**: `id`, `timestamp`, `action`, `entityType`, `summary`.

---

### Verification & Testing Plan
1. **Compilation Check**: Run `compile_applet` and verify no TypeScript or Vite build errors.
2. **Page Navigation**: Test tab switching between Dashboard, AI Assistant, Appointments, Tickets, and Follow-Up Tracker.
3. **Data Mutation**:
   - Add a new appointment, ticket, and callback.
   - Change statuses on existing records across all views.
   - Verify summary KPI cards update live on the Dashboard.
   - Verify overdue follow-ups are highlighted and tallied correctly.
4. **AI Assistant**: Test all 4 pre-configured suggested questions and free-form administrative queries with realistic response typing.
5. **Responsiveness**: Verify smooth layout transition between desktop sidebar and mobile header/drawer.

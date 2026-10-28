import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  ticketNumber: string;
  title: string;
  description: string;
  category: 'Billing' | 'Medical Records' | 'Insurance' | 'Prescription' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved';
  patientName: string;
  contactInfo: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: [true, 'Ticket number is required'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['Billing', 'Medical Records', 'Insurance', 'Prescription', 'General'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      maxlength: [120, 'Patient name cannot exceed 120 characters'],
    },
    contactInfo: {
      type: String,
      trim: true,
      default: 'Not provided',
    },
    assignedTo: {
      type: String,
      trim: true,
      default: 'Unassigned',
    },
  },
  {
    collection: 'tickets',
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ ticketNumber: 1 });

export const Ticket =
  mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

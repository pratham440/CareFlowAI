import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientName: string;
  requestedDate: string;
  requestedTime: string;
  reason: string;
  department: string;
  phone: string;
  email: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      maxlength: [120, 'Patient name cannot exceed 120 characters'],
    },
    requestedDate: {
      type: String,
      required: [true, 'Requested date is required (YYYY-MM-DD)'],
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Requested date must be in YYYY-MM-DD format'],
    },
    requestedTime: {
      type: String,
      default: '09:00 AM',
      trim: true,
    },
    reason: {
      type: String,
      required: [true, 'Reason for visit is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    department: {
      type: String,
      default: 'Primary Care',
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: 'Not provided',
    },
    email: {
      type: String,
      trim: true,
      default: 'Not provided',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        message: 'Status must be Pending, Confirmed, Completed, or Cancelled',
      },
      default: 'Pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    collection: 'appointments',
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

// Helpful index for date-based and status lookups
AppointmentSchema.index({ requestedDate: 1, status: 1 });
AppointmentSchema.index({ patientName: 'text', reason: 'text' });

export const Appointment =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>('Appointment', AppointmentSchema);

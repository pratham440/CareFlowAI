import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUp extends Document {
  requesterName: string;
  callbackReason: string;
  phone: string;
  email: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedStaff: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    requesterName: {
      type: String,
      required: [true, 'Requester name is required'],
      trim: true,
      maxlength: [120, 'Requester name cannot exceed 120 characters'],
    },
    callbackReason: {
      type: String,
      required: [true, 'Callback reason is required'],
      trim: true,
      maxlength: [1000, 'Callback reason cannot exceed 1000 characters'],
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
    dueDate: {
      type: String,
      required: [true, 'Due date is required (YYYY-MM-DD)'],
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Completed'],
        message: 'Status must be Pending, In Progress, or Completed',
      },
      default: 'Pending',
    },
    assignedStaff: {
      type: String,
      trim: true,
      default: 'Front Desk Reception',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    collection: 'followups',
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

FollowUpSchema.index({ dueDate: 1, status: 1 });

export const FollowUp =
  mongoose.models.FollowUp ||
  mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);

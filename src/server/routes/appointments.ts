import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment';
import { getDbStatus, connectToDatabase } from '../db';

const router = Router();

// Middleware to ensure DB connection is attempted
const ensureDb = async (_req: Request, res: Response, next: () => void) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.isConnected) {
    // Attempt connection once if URI configured
    if (dbStatus.hasUriConfigured) {
      await connectToDatabase();
    }
  }

  const refreshedStatus = getDbStatus();
  if (!refreshedStatus.isConnected) {
    res.status(503).json({
      success: false,
      error: 'Database unavailable',
      message: refreshedStatus.message,
      hasUriConfigured: refreshedStatus.hasUriConfigured,
    });
    return;
  }
  next();
};

// GET /api/appointments
router.get('/', ensureDb, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, department } = req.query;
    const filter: Record<string, any> = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (department) {
      filter.department = department;
    }
    if (search && typeof search === 'string') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { patientName: regex },
        { reason: regex },
        { phone: regex },
        { email: regex },
        { department: regex },
      ];
    }

    const appointments = await Appointment.find(filter).sort({ requestedDate: 1, requestedTime: 1 });
    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (err: any) {
    console.error('[API Error] GET /api/appointments:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointments',
      message: err.message,
    });
  }
});

// POST /api/appointments
// Accommodates standard web form and Vapi voice agent parameters
router.post('/', ensureDb, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body || {};

    // Support field aliases for Vapi voice agents
    const patientName = body.patientName || body.name || body.callerName || body.patient_name;
    const requestedDate = body.requestedDate || body.date || body.requested_date;
    const requestedTime = body.requestedTime || body.time || body.requested_time || '09:00 AM';
    const reason = body.reason || body.visitReason || body.notes_reason || body.reason_for_visit;
    const department = body.department || body.specialty || 'Primary Care';
    const phone = body.phone || body.phoneNumber || body.caller_phone || 'Not provided';
    const email = body.email || body.patient_email || 'Not provided';
    const notes = body.notes || body.additionalNotes || body.caller_notes;
    const status = body.status || 'Pending';

    // Validation
    if (!patientName || typeof patientName !== 'string' || !patientName.trim()) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Patient name ("patientName") is required',
      });
      return;
    }

    if (!requestedDate || typeof requestedDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate.trim())) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'A valid requested date ("requestedDate") in YYYY-MM-DD format is required (e.g. "2026-10-30")',
      });
      return;
    }

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Reason for visit ("reason") is required',
      });
      return;
    }

    const appointment = new Appointment({
      patientName: patientName.trim(),
      requestedDate: requestedDate.trim(),
      requestedTime: requestedTime.trim(),
      reason: reason.trim(),
      department: department.trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      notes: notes ? String(notes).trim() : undefined,
      status,
    });

    const saved = await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment request created successfully in MongoDB Atlas',
      data: saved,
    });
  } catch (err: any) {
    console.error('[API Error] POST /api/appointments:', err);
    res.status(400).json({
      success: false,
      error: 'Failed to create appointment',
      message: err.message,
    });
  }
});

// PATCH /api/appointments/:id
router.patch('/:id', ensureDb, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: `"${id}" is not a valid MongoDB ObjectId`,
      });
      return;
    }

    const allowedUpdates = [
      'status',
      'requestedDate',
      'requestedTime',
      'reason',
      'department',
      'phone',
      'email',
      'notes',
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        error: 'No valid fields provided for update',
      });
      return;
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
        message: `No appointment found with ID ${id}`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: updated,
    });
  } catch (err: any) {
    console.error('[API Error] PATCH /api/appointments/:id:', err);
    res.status(400).json({
      success: false,
      error: 'Failed to update appointment',
      message: err.message,
    });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', ensureDb, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: `"${id}" is not a valid MongoDB ObjectId`,
      });
      return;
    }

    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
        message: `No appointment found with ID ${id}`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
      id,
    });
  } catch (err: any) {
    console.error('[API Error] DELETE /api/appointments/:id:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete appointment',
      message: err.message,
    });
  }
});

export default router;

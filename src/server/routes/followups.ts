import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { FollowUp } from '../models/FollowUp';
import { getDbStatus, connectToDatabase } from '../db';

const router = Router();

const ensureDb = async (_req: Request, res: Response, next: () => void) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.isConnected && dbStatus.hasUriConfigured) {
    await connectToDatabase();
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

// GET /api/followups
router.get('/', ensureDb, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const filter: Record<string, any> = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (search && typeof search === 'string') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { requesterName: regex },
        { callbackReason: regex },
        { phone: regex },
        { email: regex },
        { assignedStaff: regex },
      ];
    }

    const followUps = await FollowUp.find(filter).sort({ dueDate: 1, createdAt: -1 });
    res.json({
      success: true,
      count: followUps.length,
      data: followUps,
    });
  } catch (err: any) {
    console.error('[API Error] GET /api/followups:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve follow-up callbacks',
      message: err.message,
    });
  }
});

// POST /api/followups
// Designed to be called by both web users and Vapi voice agents
router.post('/', ensureDb, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body || {};

    const requesterName = body.requesterName || body.name || body.callerName || body.patientName;
    const callbackReason = body.callbackReason || body.reason || body.inquiry || body.notes_reason;
    const phone = body.phone || body.phoneNumber || body.caller_phone || 'Not provided';
    const email = body.email || body.caller_email || 'Not provided';
    const dueDate = body.dueDate || body.date || body.due_date || new Date().toISOString().split('T')[0];
    const status = body.status || 'Pending';
    const assignedStaff = body.assignedStaff || body.staff || 'Front Desk Reception';
    const notes = body.notes || body.additionalNotes;

    if (!requesterName || typeof requesterName !== 'string' || !requesterName.trim()) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Requester name ("requesterName") is required',
      });
      return;
    }

    if (!callbackReason || typeof callbackReason !== 'string' || !callbackReason.trim()) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Callback reason ("callbackReason") is required',
      });
      return;
    }

    if (!dueDate || typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'A valid due date ("dueDate") in YYYY-MM-DD format is required (e.g. "2026-10-28")',
      });
      return;
    }

    const followUp = new FollowUp({
      requesterName: requesterName.trim(),
      callbackReason: callbackReason.trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      dueDate: dueDate.trim(),
      status,
      assignedStaff: String(assignedStaff).trim(),
      notes: notes ? String(notes).trim() : undefined,
    });

    const saved = await followUp.save();

    res.status(201).json({
      success: true,
      message: 'Follow-up callback scheduled successfully in MongoDB Atlas',
      data: saved,
    });
  } catch (err: any) {
    console.error('[API Error] POST /api/followups:', err);
    res.status(400).json({
      success: false,
      error: 'Failed to schedule follow-up callback',
      message: err.message,
    });
  }
});

// PATCH /api/followups/:id
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
      'dueDate',
      'callbackReason',
      'phone',
      'email',
      'assignedStaff',
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

    const updated = await FollowUp.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        error: 'Follow-up not found',
        message: `No follow-up callback found with ID ${id}`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Follow-up callback updated successfully',
      data: updated,
    });
  } catch (err: any) {
    console.error('[API Error] PATCH /api/followups/:id:', err);
    res.status(400).json({
      success: false,
      error: 'Failed to update follow-up callback',
      message: err.message,
    });
  }
});

// DELETE /api/followups/:id
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

    const deleted = await FollowUp.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Follow-up not found',
        message: `No follow-up callback found with ID ${id}`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Follow-up callback deleted successfully',
      id,
    });
  } catch (err: any) {
    console.error('[API Error] DELETE /api/followups/:id:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete follow-up callback',
      message: err.message,
    });
  }
});

export default router;

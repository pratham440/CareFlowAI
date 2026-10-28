import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Ticket } from '../models/Ticket';
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

// GET /api/tickets
router.get('/', ensureDb, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority, category, search } = req.query;
    const filter: Record<string, any> = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (priority && priority !== 'All') {
      filter.priority = priority;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search && typeof search === 'string') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { ticketNumber: regex },
        { title: regex },
        { description: regex },
        { patientName: regex },
        { contactInfo: regex },
      ];
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (err: any) {
    console.error('[API Error] GET /api/tickets:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tickets',
      message: err.message,
    });
  }
});

// POST /api/tickets
router.post('/', ensureDb, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body || {};

    const title = body.title || body.subject;
    const description = body.description || body.details || body.message;
    const patientName = body.patientName || body.name || body.callerName;
    const contactInfo = body.contactInfo || body.phone || body.email || 'Not provided';
    const category = body.category || 'General';
    const priority = body.priority || 'Medium';
    const status = body.status || 'Open';
    const assignedTo = body.assignedTo || body.assignedStaff || 'Unassigned';

    // Auto-generate unique ticket number if not specified
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = body.ticketNumber || `TCK-${randomSuffix}`;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Ticket title ("title") is required',
      });
      return;
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Ticket description ("description") is required',
      });
      return;
    }

    if (!patientName || typeof patientName !== 'string' || !patientName.trim()) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Patient name ("patientName") is required',
      });
      return;
    }

    const ticket = new Ticket({
      ticketNumber,
      title: title.trim(),
      description: description.trim(),
      patientName: patientName.trim(),
      contactInfo: String(contactInfo).trim(),
      category,
      priority,
      status,
      assignedTo: String(assignedTo).trim(),
    });

    const saved = await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully in MongoDB Atlas',
      data: saved,
    });
  } catch (err: any) {
    console.error('[API Error] POST /api/tickets:', err);
    res.status(400).json({
      success: false,
      error: 'Failed to create ticket',
      message: err.message,
    });
  }
});

// PATCH /api/tickets/:id
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
      'priority',
      'category',
      'title',
      'description',
      'patientName',
      'contactInfo',
      'assignedTo',
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

    const updated = await Ticket.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: `No support ticket found with ID ${id}`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: updated,
    });
  } catch (err: any) {
    console.error('[API Error] PATCH /api/tickets/:id:', err);
    res.status(400).json({
      success: false,
      error: 'Failed to update ticket',
      message: err.message,
    });
  }
});

// DELETE /api/tickets/:id
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

    const deleted = await Ticket.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: `No support ticket found with ID ${id}`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Ticket deleted successfully',
      id,
    });
  } catch (err: any) {
    console.error('[API Error] DELETE /api/tickets/:id:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete ticket',
      message: err.message,
    });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { getDbStatus } from '../db';
import { Appointment } from '../models/Appointment';
import { Ticket } from '../models/Ticket';
import { FollowUp } from '../models/FollowUp';

const router = Router();
const serverStartTime = Date.now();

// GET /api/health
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const dbStatus = getDbStatus();
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);

  let collectionCounts: Record<string, number> | null = null;

  if (dbStatus.isConnected) {
    try {
      const [aptCount, tckCount, folCount] = await Promise.all([
        Appointment.countDocuments(),
        Ticket.countDocuments(),
        FollowUp.countDocuments(),
      ]);
      collectionCounts = {
        appointments: aptCount,
        tickets: tckCount,
        followups: folCount,
      };
    } catch {
      // Ignore count errors if any
    }
  }

  res.json({
    status: 'ok',
    service: 'CareFlow AI Full-Stack Server',
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.statusText,
      connected: dbStatus.isConnected,
      name: dbStatus.dbName,
      hasUriConfigured: dbStatus.hasUriConfigured,
      message: dbStatus.message,
      collections: ['appointments', 'tickets', 'followups'],
      counts: collectionCounts,
    },
  });
});

export default router;

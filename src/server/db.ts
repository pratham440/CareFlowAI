import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export interface DbStatus {
  isConnected: boolean;
  readyState: number; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  statusText: 'connected' | 'connecting' | 'disconnected' | 'error';
  dbName: string;
  message: string;
  hasUriConfigured: boolean;
}

const DB_NAME = 'CareFlowAI';

export const getDbStatus = (): DbStatus => {
  const state = mongoose.connection.readyState;
  const hasUri = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);

  let statusText: DbStatus['statusText'] = 'disconnected';
  let message = 'MongoDB is disconnected.';

  if (!hasUri) {
    message = 'MONGODB_URI environment secret is not configured. Add MONGODB_URI in the Secrets panel to connect to MongoDB Atlas.';
  } else if (state === 1) {
    statusText = 'connected';
    message = `Successfully connected to MongoDB Atlas database "${DB_NAME}".`;
  } else if (state === 2) {
    statusText = 'connecting';
    message = 'Connecting to MongoDB Atlas...';
  } else if (state === 0) {
    statusText = 'disconnected';
    message = 'Connection attempt not yet active or previously closed.';
  }

  return {
    isConnected: state === 1,
    readyState: state,
    statusText,
    dbName: DB_NAME,
    message,
    hasUriConfigured: hasUri,
  };
};

export const connectToDatabase = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.warn('[CareFlow DB] MONGODB_URI is not defined in environment secrets. Backend is operating in unattached mode.');
    return false;
  }

  // Prevent multiple connection calls if already connected or connecting
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  if (mongoose.connection.readyState === 2) {
    return false;
  }

  try {
    console.log(`[CareFlow DB] Connecting to MongoDB Atlas (Target Database: ${DB_NAME})...`);

    await mongoose.connect(uri, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[CareFlow DB] Connected to MongoDB Atlas: ${DB_NAME}`);
    return true;
  } catch (error: any) {
    console.error('[CareFlow DB] MongoDB Atlas connection error:', error.message || error);
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[CareFlow DB] MongoDB connection lost.');
});

mongoose.connection.on('error', (err) => {
  console.error('[CareFlow DB] MongoDB connection error event:', err.message || err);
});

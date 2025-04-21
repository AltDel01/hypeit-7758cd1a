
import { PollingConfig } from './types';

export const POLLING_CONFIG: PollingConfig = {
  MAX_RETRIES: 10,
  INITIAL_DELAY: 3000,
  MAX_DELAY: 8000,
} as const;

export const calculateNextDelay = (currentDelay: number): number => {
  return Math.min(currentDelay + 500, POLLING_CONFIG.MAX_DELAY);
};

export const isValidResponse = (status: string, imageUrl?: string): boolean => {
  return status === "completed" && !!imageUrl;
};

export const isProcessing = (status?: string): boolean => {
  return status === "processing" || status === "accepted";
};



/**
 * Manages the state of active polling operations
 */

const activePolls = new Map<string, boolean>();

export const addActivePoll = (requestId: string): void => {
  activePolls.set(requestId, true);
};

export const removeActivePoll = (requestId: string): void => {
  activePolls.delete(requestId);
  console.log(`Removed ${requestId} from active polls`);
};

export const isPollingActive = (requestId: string): boolean => {
  return activePolls.get(requestId) || false;
};

export const cancelAllActivePolls = (): void => {
  console.log(`Canceling ${activePolls.size} active polls`);
  activePolls.clear();
};

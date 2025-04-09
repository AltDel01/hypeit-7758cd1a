
import { PollImageParams, ImageStatusResult } from "./types";
import { checkImageStatus } from "./statusChecker";
import { delayExecution } from "./helpers";
import { useFallbackImage } from "./fallbackHandler";
import { checkValidImageUrl } from '../imageValidation';

/**
 * A class to manage image polling operations
 */
export class PollingManager {
  private static activePolls = new Map<string, boolean>();
  
  /**
   * Check if a poll is already active for a given request ID
   */
  static isPolling(requestId: string): boolean {
    return this.activePolls.get(requestId) === true;
  }
  
  /**
   * Start polling for an image result
   */
  static startPolling(params: PollImageParams): void {
    const { requestId } = params;
    
    if (this.isPolling(requestId)) {
      console.log(`Already polling for requestId: ${requestId}, skipping duplicate poll`);
      return;
    }
    
    this.activePolls.set(requestId, true);
    this.executePoll(params);
  }
  
  /**
   * Stop polling for a given request ID
   */
  static stopPolling(requestId: string): void {
    if (this.isPolling(requestId)) {
      this.activePolls.delete(requestId);
      console.log(`Stopped polling for requestId: ${requestId}`);
    }
  }
  
  /**
   * Cancel all active polling operations
   */
  static cancelAllPolls(): void {
    console.log(`Canceling ${this.activePolls.size} active polls`);
    this.activePolls.clear();
  }
  
  /**
   * Execute a single poll operation
   */
  private static async executePoll(params: PollImageParams): Promise<void> {
    const { 
      requestId, 
      prompt, 
      aspectRatio, 
      retries = 10, 
      delay = 3000, 
      maxRetries = 10 
    } = params;
    
    const currentRetries = Math.min(retries, maxRetries);
    
    if (currentRetries <= 0 || !this.isPolling(requestId)) {
      console.log(`Maximum polling retries reached for request ${requestId}`);
      this.handleMaxRetriesReached(prompt, aspectRatio, requestId);
      return;
    }
    
    try {
      console.log(`Polling for image result, requestId: ${requestId}, retries left: ${currentRetries}`);
      
      await delayExecution(delay);
      
      const result = await checkImageStatus(requestId);
      
      console.log(`Poll result for ${requestId}:`, result);
      
      this.handleStatusCheckResult(result, {
        ...params,
        retries: currentRetries
      });
      
    } catch (error) {
      console.error(`Polling error for ${requestId}:`, error);
      
      if (currentRetries > 1) {
        const shorterDelay = Math.max(1000, delay / 2);
        
        setTimeout(() => this.executePoll({
          ...params,
          retries: currentRetries - 1,
          delay: shorterDelay
        }), shorterDelay);
      } else {
        this.handleMaxRetriesReached(prompt, aspectRatio, requestId);
      }
    }
  }
  
  /**
   * Handle the maximum retries being reached
   */
  private static handleMaxRetriesReached(prompt: string, aspectRatio: string, requestId: string): void {
    useFallbackImage(prompt, aspectRatio);
    this.stopPolling(requestId);
  }
  
  /**
   * Handle the result of a status check
   */
  private static handleStatusCheckResult(
    result: ImageStatusResult, 
    params: PollImageParams
  ): void {
    const { requestId, prompt, aspectRatio, retries, delay } = params;
    
    if (result.error || (result.apiError && result.apiError.includes("API key"))) {
      console.error(`Error in polling result for ${requestId}:`, result.error || result.apiError);
      this.stopPolling(requestId);
      useFallbackImage(prompt, aspectRatio);
      return;
    }
    
    if (result.imageUrl && checkValidImageUrl(result.imageUrl)) {
      console.log(`Valid image URL received for ${requestId}`);
      // Dispatch image generated event
      const event = new CustomEvent('imageGenerated', { 
        detail: { imageUrl: result.imageUrl, prompt } 
      });
      window.dispatchEvent(event);
      
      this.stopPolling(requestId);
      return;
    }
    
    if (result.status === "processing" || result.status === "accepted" || result.data) {
      console.log(`Image still processing (${result.status}) for ${requestId}, polling again`);
      
      setTimeout(() => this.executePoll({
        ...params,
        retries: retries - 1, 
        delay: Math.min(delay + 500, 8000)
      }), 50);
      
      return;
    }
    
    if (retries > 1) {
      console.log(`Status: ${result.status || "unknown"} for ${requestId}, continuing polling`);
      
      setTimeout(() => this.executePoll({
        ...params,
        retries: retries - 1,
        delay
      }), 50);
    } else {
      console.log(`No retries left for ${requestId}, using fallback`);
      this.handleMaxRetriesReached(prompt, aspectRatio, requestId);
    }
  }
}

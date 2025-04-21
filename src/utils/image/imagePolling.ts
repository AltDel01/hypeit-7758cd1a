
/**
 * Main image polling functionality
 * This file re-exports functionality from the polling module
 */
import { pollForImageResult } from "./polling/pollingCore";
import type { PollImageParams } from "./polling/types";

export { pollForImageResult, type PollImageParams };

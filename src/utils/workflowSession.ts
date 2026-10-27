/** Active calendar content belongs to this visit, not a saved previous week. */
export const createWorkflowSession = <Day>() => ({
  strategyId: null as string | null,
  days: null as Day[] | null,
});
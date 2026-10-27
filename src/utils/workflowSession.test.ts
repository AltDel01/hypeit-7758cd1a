import { test, expect } from 'bun:test';
import { createWorkflowSession } from './workflowSession';

test('refresh starts without the previous seven-day strategy', () => {
  const previousVisit = createWorkflowSession<{ concept: string }>();
  previousVisit.strategyId = 'previous-strategy';
  previousVisit.days = Array.from({ length: 7 }, () => ({ concept: 'Previous content' }));
  const refreshedVisit = createWorkflowSession<{ concept: string }>();
  expect(refreshedVisit.days).toBeNull();
  expect(refreshedVisit.strategyId).toBeNull();
  expect(previousVisit.days).toHaveLength(7);
});

test('a new login gets an independent empty calendar', () => {
  const firstLogin = createWorkflowSession<string>();
  firstLogin.days = ['Day-1'];
  const newLogin = createWorkflowSession<string>();
  expect(newLogin.days).toBeNull();
  expect(newLogin.strategyId).toBeNull();
  expect(newLogin).not.toBe(firstLogin);
});
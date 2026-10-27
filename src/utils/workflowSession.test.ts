import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorkflowSession } from './workflowSession';

test('refresh starts without the previous seven-day strategy', () => {
  const previousVisit = createWorkflowSession<{ concept: string }>();
  previousVisit.strategyId = 'previous-strategy';
  previousVisit.days = Array.from({ length: 7 }, () => ({ concept: 'Previous content' }));
  const refreshedVisit = createWorkflowSession<{ concept: string }>();
  assert.equal(refreshedVisit.days, null);
  assert.equal(refreshedVisit.strategyId, null);
  assert.equal(previousVisit.days.length, 7);
});

test('a new login gets an independent empty calendar', () => {
  const firstLogin = createWorkflowSession<string>();
  firstLogin.days = ['Day-1'];
  const newLogin = createWorkflowSession<string>();
  assert.equal(newLogin.days, null);
  assert.equal(newLogin.strategyId, null);
  assert.notEqual(newLogin, firstLogin);
});
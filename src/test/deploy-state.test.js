import { describe, expect, it } from 'vitest';
import { verificationResult } from '../../scripts/deploy-state.js';

describe('deployment verification', () => {
  it('V26 accepts the exact live build while the Pages API is delayed', () => {
    expect(verificationResult(true, 'queued')).toBe('live');
  });

  it('keeps waiting when neither live nor terminal', () => {
    expect(verificationResult(false, 'queued')).toBe('waiting');
  });

  it('fails on a terminal Pages error before the build is live', () => {
    expect(verificationResult(false, 'errored')).toBe('failed');
  });
});

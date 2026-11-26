import { describe, expect, it, vi, afterEach } from 'vitest';
import { CompactContractService, getProtocolReadiness } from '../compactContractService';

describe('CompactContractService (Midnight.js v5)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports honest protocol readiness when contract address & proof server are offline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const readiness = await getProtocolReadiness();

    expect(readiness.networkKey).toBe('preview');
    expect(readiness.contractDeployed).toBe(false);
    expect(readiness.proofServerOnline).toBe(false);
    expect(readiness.readyForOnChain).toBe(false);
  });

  it('fails closed instead of mocking transactions when contract is undeployed', async () => {
    await expect(
      CompactContractService.createGame('0x' + '11'.repeat(32), '0x' + '22'.repeat(32), '0.1')
    ).rejects.toThrow(/Not Deployed/i);

    await expect(CompactContractService.forfeitGame('0x' + '11'.repeat(32))).rejects.toThrow(
      /Not Deployed/i
    );
  });
});

import { FHEVMClientImpl, getFHEVMClient, createFHEVMClient } from '../core/fhevm-client';

// Mock @zama-fhe/relayer-sdk
jest.mock('@zama-fhe/relayer-sdk', () => ({
  createInstance: jest.fn(),
}));

describe('FHEVMClient', () => {
  let client: FHEVMClientImpl;

  beforeEach(() => {
    client = new FHEVMClientImpl();
  });

  describe('getFHEVMClient', () => {
    it('should return singleton instance', () => {
      const client1 = getFHEVMClient();
      const client2 = getFHEVMClient();
      expect(client1).toBe(client2);
    });
  });

  describe('createFHEVMClient', () => {
    it('should create new instance', () => {
      const client1 = createFHEVMClient();
      const client2 = createFHEVMClient();
      expect(client1).not.toBe(client2);
    });
  });

  describe('isSupported', () => {
    it('should return true for supported chains', () => {
      expect(client.isSupported(31337)).toBe(true);
      expect(client.isSupported(11155111)).toBe(true);
    });

    it('should return false for unsupported chains', () => {
      expect(client.isSupported(1)).toBe(false);
      expect(client.isSupported(5)).toBe(false);
    });
  });

  describe('getSupportedChains', () => {
    it('should return supported chains', () => {
      const chains = client.getSupportedChains();
      expect(chains).toContain(31337);
      expect(chains).toContain(11155111);
    });
  });
});

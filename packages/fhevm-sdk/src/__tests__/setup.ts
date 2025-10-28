// Jest setup file
import '@testing-library/jest-dom';

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn(),
    JsonRpcProvider: jest.fn(),
    Wallet: jest.fn(),
    Contract: jest.fn(),
  },
}));

// Mock @zama-fhe/relayer-sdk
jest.mock('@zama-fhe/relayer-sdk', () => ({
  createInstance: jest.fn(),
}));

// Add a simple test to make Jest happy
describe('Setup', () => {
  it('should run setup file', () => {
    expect(true).toBe(true);
  });
});

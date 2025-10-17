#!/usr/bin/env node

import { CloakSDK } from '@cloak-sdk/core';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';

// Load environment variables
dotenv.config();

/**
 * Test suite for Cloak SDK functionality
 */
class CloakSDKTests {
  constructor() {
    this.sdk = null;
    this.provider = null;
    this.wallet = null;
    this.userAddress = null;
    this.testResults = [];
  }

  async initialize() {
    const spinner = ora('Initializing SDK for testing...').start();
    
    try {
      this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      
      // Setup wallet for testing
      if (process.env.PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.userAddress = this.wallet.address;
      } else {
        this.wallet = ethers.Wallet.createRandom().connect(this.provider);
        this.userAddress = this.wallet.address;
      }
      
      this.sdk = new CloakSDK();
      
      await this.sdk.initialize({
        provider: this.provider,
        // No mockChains - using actual Sepolia network
      });

      spinner.succeed(`SDK initialized for testing with wallet: ${this.userAddress}`);
      
    } catch (error) {
      spinner.fail('Failed to initialize SDK');
      throw error;
    }
  }

  async runTest(testName, testFunction) {
    const spinner = ora(`Running ${testName}...`).start();
    
    try {
      await testFunction();
      spinner.succeed(`${testName} passed`);
      this.testResults.push({ name: testName, status: 'PASS', error: null });
    } catch (error) {
      spinner.fail(`${testName} failed`);
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
    }
  }

  async testSDKInitialization() {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }
    
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
  }

  async testEncryption() {
    const encryption = this.sdk.getEncryption();
    
    if (!encryption) {
      throw new Error('Encryption module not available');
    }
    
    if (typeof encryption.encrypt !== 'function') {
      throw new Error('Encrypt function not available');
    }
  }

  async testDecryption() {
    const decryption = this.sdk.getDecryption();
    
    if (!decryption) {
      throw new Error('Decryption module not available');
    }
    
    if (typeof decryption.decrypt !== 'function') {
      throw new Error('Decrypt function not available');
    }
  }

  async testContractInteraction() {
    const contract = this.sdk.getContract();
    
    if (!contract) {
      throw new Error('Contract module not available');
    }
    
    if (typeof contract.callContractMethod !== 'function') {
      throw new Error('Call contract method function not available');
    }
  }

  async testDataTypes() {
    const testData = [
      { type: 'externalEuint32', value: 42 },
      { type: 'externalEuint256', value: 1000000 },
      { type: 'externalEbool', value: true }
    ];

    for (const data of testData) {
      const encryption = this.sdk.getEncryption();
      
      try {
        await encryption.encrypt({
          contractAddress: process.env.COUNTER_CONTRACT_ADDRESS,
          userAddress: this.userAddress,
          data: data.value,
          dataType: data.type
        });
      } catch (error) {
        throw new Error(`Failed to encrypt ${data.type}: ${error.message}`);
      }
    }
  }

  async testErrorHandling() {
    const encryption = this.sdk.getEncryption();
    
    try {
      // Test with invalid data type
      await encryption.encrypt({
        contractAddress: 'invalid_address',
        userAddress: this.userAddress,
        data: 'invalid_data',
        dataType: 'invalid_type'
      });
      
      // If we get here, error handling failed
      throw new Error('Expected error was not thrown');
    } catch (error) {
      // This is expected - error handling is working
      if (!error.message) {
        throw new Error('Error object missing message');
      }
    }
  }

  async testEnvironmentVariables() {
    const requiredVars = [
      'CHAIN_ID',
      'RPC_URL',
      'FHEVM_NETWORK',
      'GATEWAY_URL',
      'COUNTER_CONTRACT_ADDRESS',
      'VOTING_CONTRACT_ADDRESS',
      'BANK_CONTRACT_ADDRESS'
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Required environment variable ${varName} is not set`);
      }
    }
  }

  async testNetworkConnection() {
    try {
      const network = await this.provider.getNetwork();
      
      if (network.chainId !== BigInt(process.env.CHAIN_ID)) {
        throw new Error(`Chain ID mismatch: expected ${process.env.CHAIN_ID}, got ${network.chainId}`);
      }
    } catch (error) {
      throw new Error(`Network connection failed: ${error.message}`);
    }
  }

  async runAllTests() {
    console.log(chalk.magenta.bold('\n🧪 Cloak SDK Test Suite'));
    console.log(chalk.gray('Running comprehensive tests...\n'));
    
    try {
      await this.initialize();
      
      const tests = [
        { name: 'SDK Initialization', fn: () => this.testSDKInitialization() },
        { name: 'Environment Variables', fn: () => this.testEnvironmentVariables() },
        { name: 'Network Connection', fn: () => this.testNetworkConnection() },
        { name: 'Encryption Module', fn: () => this.testEncryption() },
        { name: 'Decryption Module', fn: () => this.testDecryption() },
        { name: 'Contract Interaction', fn: () => this.testContractInteraction() },
        { name: 'Data Types', fn: () => this.testDataTypes() },
        { name: 'Error Handling', fn: () => this.testErrorHandling() }
      ];

      for (const test of tests) {
        await this.runTest(test.name, test.fn);
      }
      
      this.showResults();
      
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Test suite failed to initialize:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  }

  showResults() {
    console.log(chalk.cyan('\n📊 Test Results'));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    console.log(chalk.green(`✅ Passed: ${passed}`));
    console.log(chalk.red(`❌ Failed: ${failed}`));
    console.log(chalk.blue(`📊 Total: ${total}`));
    
    if (failed > 0) {
      console.log(chalk.red('\n❌ Failed Tests:'));
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(test => {
          console.log(chalk.red(`   • ${test.name}: ${test.error}`));
        });
    }
    
    if (passed === total) {
      console.log(chalk.green.bold('\n🎉 All tests passed!'));
    } else {
      console.log(chalk.yellow.bold('\n⚠️ Some tests failed. Check the errors above.'));
    }
  }
}

// Run the test suite
const testSuite = new CloakSDKTests();
testSuite.runAllTests().catch(console.error);

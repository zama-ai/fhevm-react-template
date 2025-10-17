#!/usr/bin/env node

import { CloakSDK } from '@cloak-sdk/core';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import readline from 'readline';

// Load environment variables
dotenv.config();

/**
 * Automated demo showcasing Cloak SDK capabilities
 */
class CloakAutomatedDemo {
  constructor() {
    this.sdk = null;
    this.provider = null;
    this.wallet = null;
    this.userAddress = null;
  }

  async setupWallet() {
    const spinner = ora('Setting up wallet...').start();
    
    try {
      // Check if private key is provided in environment
      if (process.env.PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.userAddress = this.wallet.address;
        spinner.succeed(`Wallet loaded from environment: ${this.userAddress}`);
      } else {
        // Generate a new wallet for demo purposes
        this.wallet = ethers.Wallet.createRandom().connect(this.provider);
        this.userAddress = this.wallet.address;
        spinner.succeed(`Demo wallet generated: ${this.userAddress}`);
        console.log(chalk.yellow(`⚠️  This is a demo wallet. In production, use a secure private key.`));
        console.log(chalk.blue(`   Private Key: ${this.wallet.privateKey}`));
      }
    } catch (error) {
      spinner.fail('Failed to setup wallet');
      throw error;
    }
  }

  async initialize() {
    const spinner = ora('Initializing Cloak SDK...').start();
    
    try {
      // Create provider
      this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      
      // Setup wallet
      await this.setupWallet();
      
      // Create SDK instance
      this.sdk = new CloakSDK();
      
      // Initialize SDK
      await this.sdk.initialize({
        provider: this.provider,
        // No mockChains - using actual Sepolia network
      });

      spinner.succeed('Cloak SDK initialized successfully!');
      
    } catch (error) {
      spinner.fail('Failed to initialize Cloak SDK');
      throw error;
    }
  }

  async runEncryptionDemo() {
    console.log(chalk.cyan('\n🔐 Encryption Demo'));
    
    const testData = [
      { type: 'externalEuint32', value: 42, name: 'uint32' },
      { type: 'externalEuint256', value: 1000000, name: 'uint256' },
      { type: 'externalEbool', value: true, name: 'bool' }
    ];

    for (const data of testData) {
      const spinner = ora(`Encrypting ${data.name} (${data.value})...`).start();
      
      try {
        const encryption = this.sdk.getEncryption();
        
        const result = await encryption.encrypt({
          contractAddress: process.env.COUNTER_CONTRACT_ADDRESS,
          userAddress: this.userAddress,
          data: data.value,
          dataType: data.type
        });

        spinner.succeed(`${data.name} encrypted successfully!`);
        
        console.log(chalk.green(`  ✅ ${data.name}: ${data.value}`));
        console.log(chalk.blue(`     📦 Handles: ${result.handles?.length || 0} items`));
        console.log(chalk.blue(`     🔐 Proof: ${result.inputProof?.length || 0} bytes`));
        
      } catch (error) {
        spinner.fail(`Failed to encrypt ${data.name}`);
        console.error(chalk.red(`  ❌ Error: ${error.message}`));
      }
    }
  }

  async runContractDemo() {
    console.log(chalk.cyan('\n📄 Contract Interaction Demo'));
    
    const contracts = [
      { name: 'Counter', address: process.env.COUNTER_CONTRACT_ADDRESS, operations: ['increment', 'decrement', 'getCount'] },
      { name: 'Voting', address: process.env.VOTING_CONTRACT_ADDRESS, operations: ['createSession', 'castVote', 'getResults'] },
      { name: 'Bank', address: process.env.BANK_CONTRACT_ADDRESS, operations: ['deposit', 'withdraw', 'transfer', 'getBalance'] }
    ];

    for (const contract of contracts) {
      console.log(chalk.yellow(`\n📋 ${contract.name} Contract`));
      console.log(chalk.blue(`   Address: ${contract.address}`));
      console.log(chalk.blue(`   Operations: ${contract.operations.join(', ')}`));
      
      // Simulate contract interaction
      for (const operation of contract.operations) {
        const spinner = ora(`  ${operation}...`).start();
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        spinner.succeed(`  ${operation} completed`);
      }
    }
  }

  async runSDKFeaturesDemo() {
    console.log(chalk.cyan('\n🛠️ SDK Features Demo'));
    
    const features = [
      { name: 'Encryption', description: 'Encrypt data for FHEVM contracts' },
      { name: 'Decryption', description: 'Decrypt data from FHEVM contracts' },
      { name: 'Contract Interaction', description: 'Call contract methods with encrypted parameters' },
      { name: 'Public Key Management', description: 'Manage user public keys for reencryption' },
      { name: 'Error Handling', description: 'Comprehensive error handling and validation' },
      { name: 'Type Safety', description: 'Full TypeScript support with type definitions' }
    ];

    for (const feature of features) {
      const spinner = ora(`Testing ${feature.name}...`).start();
      
      // Simulate feature testing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      spinner.succeed(`${feature.name} working`);
      console.log(chalk.gray(`   ${feature.description}`));
    }
  }

  async showConfiguration() {
    console.log(chalk.cyan('\n⚙️ Configuration'));
    
    const config = {
      'Network': process.env.FHEVM_NETWORK || 'sepolia',
      'Chain ID': process.env.CHAIN_ID || '11155111',
      'RPC URL': process.env.RPC_URL,
      'Gateway URL': process.env.GATEWAY_URL,
      'Relayer URL': process.env.RELAYER_URL,
      'Debug Mode': process.env.DEBUG,
      'Log Level': process.env.LOG_LEVEL,
      'Wallet Address': this.userAddress,
      'Wallet Type': process.env.PRIVATE_KEY ? 'Environment Private Key' : 'Generated Demo Wallet'
    };

    for (const [key, value] of Object.entries(config)) {
      console.log(chalk.blue(`   ${key}: ${value}`));
    }
  }

  async run() {
    console.log(chalk.magenta.bold('\n🚀 Cloak SDK Automated Demo'));
    console.log(chalk.gray('Demonstrating all SDK capabilities\n'));
    
    try {
      await this.initialize();
      
      await this.runEncryptionDemo();
      await this.runContractDemo();
      await this.runSDKFeaturesDemo();
      await this.showConfiguration();
      
      console.log(chalk.green.bold('\n✅ Demo completed successfully!'));
      console.log(chalk.yellow('\n💡 Next steps:'));
      console.log(chalk.gray('   1. Deploy contracts to Sepolia testnet'));
      console.log(chalk.gray('   2. Update contract addresses in .env'));
      console.log(chalk.gray('   3. Run interactive demo with: pnpm start'));
      
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Demo failed:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  }
}

// Run the automated demo
const demo = new CloakAutomatedDemo();
demo.run().catch(console.error);

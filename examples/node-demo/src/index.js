#!/usr/bin/env node

import { CloakSDK } from '@cloak-sdk/core';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

// Load environment variables
dotenv.config();

class CloakNodeDemo {
  constructor() {
    this.sdk = null;
    this.provider = null;
    this.signer = null;
    this.wallet = null;
    this.userAddress = null;
    this.isInitialized = false;
  }

  async initialize() {
    const spinner = ora('Initializing Cloak SDK...').start();
    
    try {
      // Create provider
      this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      
      // Setup wallet
      if (process.env.PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.userAddress = this.wallet.address;
        console.log(chalk.blue(`   Wallet loaded from environment: ${this.userAddress}`));
      } else {
        this.wallet = ethers.Wallet.createRandom().connect(this.provider);
        this.userAddress = this.wallet.address;
        console.log(chalk.yellow(`   Demo wallet generated: ${this.userAddress}`));
        console.log(chalk.yellow(`   Private Key: ${this.wallet.privateKey}`));
      }
      
      // Create SDK instance
      this.sdk = new CloakSDK();
      
      // Initialize SDK
      await this.sdk.initialize({
        provider: this.provider,
        // No mockChains - using actual Sepolia network
      });

      this.isInitialized = true;
      spinner.succeed(`Cloak SDK initialized successfully with wallet: ${this.userAddress}`);
      
      console.log(chalk.green('\n🚀 Cloak SDK Node.js Demo Ready!'));
      console.log(chalk.blue(`📡 Connected to: ${process.env.FHEVM_NETWORK || 'sepolia'}`));
      console.log(chalk.blue(`🔗 Chain ID: ${process.env.CHAIN_ID || '11155111'}`));
      console.log(chalk.blue(`🌐 RPC URL: ${process.env.RPC_URL}`));
      console.log(chalk.blue(`👤 Wallet Address: ${this.userAddress}`));
      
    } catch (error) {
      spinner.fail('Failed to initialize Cloak SDK');
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  }

  async showMenu() {
    const choices = [
      { name: '🔐 Encrypt Data', value: 'encrypt' },
      { name: '🔓 Decrypt Data', value: 'decrypt' },
      { name: '📊 Counter Demo', value: 'counter' },
      { name: '🗳️ Voting Demo', value: 'voting' },
      { name: '🏦 Banking Demo', value: 'banking' },
      { name: '📋 SDK Status', value: 'status' },
      { name: '❌ Exit', value: 'exit' }
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices
      }
    ]);

    return action;
  }

  async handleAction(action) {
    switch (action) {
      case 'encrypt':
        await this.encryptDemo();
        break;
      case 'decrypt':
        await this.decryptDemo();
        break;
      case 'counter':
        await this.counterDemo();
        break;
      case 'voting':
        await this.votingDemo();
        break;
      case 'banking':
        await this.bankingDemo();
        break;
      case 'status':
        await this.showStatus();
        break;
      case 'exit':
        console.log(chalk.yellow('\n👋 Goodbye!'));
        process.exit(0);
    }
  }

  async encryptDemo() {
    console.log(chalk.cyan('\n🔐 Encryption Demo'));
    
    const { dataType, value } = await inquirer.prompt([
      {
        type: 'list',
        name: 'dataType',
        message: 'Select data type to encrypt:',
        choices: [
          { name: 'uint32', value: 'externalEuint32' },
          { name: 'uint256', value: 'externalEuint256' },
          { name: 'bool', value: 'externalEbool' }
        ]
      },
      {
        type: 'input',
        name: 'value',
        message: 'Enter value to encrypt:',
        validate: (input) => {
          if (!input) return 'Please enter a value';
          return true;
        }
      }
    ]);

    const spinner = ora('Encrypting data...').start();
    
    try {
      const encryption = this.sdk.getEncryption();
      const result = await encryption.encrypt({
        contractAddress: process.env.COUNTER_CONTRACT_ADDRESS,
        userAddress: this.userAddress,
        data: dataType === 'externalEbool' ? value === 'true' : parseInt(value),
        dataType: dataType
      });

      spinner.succeed('Data encrypted successfully!');
      
      console.log(chalk.green('\n✅ Encryption Result:'));
      console.log(chalk.blue(`📦 Handles: ${result.handles?.length || 0} items`));
      console.log(chalk.blue(`🔐 Input Proof: ${result.inputProof?.length || 0} bytes`));
      console.log(chalk.gray(`📄 Raw Result: ${JSON.stringify(result, null, 2)}`));
      
    } catch (error) {
      spinner.fail('Encryption failed');
      console.error(chalk.red('Error:'), error.message);
    }
  }

  async decryptDemo() {
    console.log(chalk.cyan('\n🔓 Decryption Demo'));
    console.log(chalk.yellow('Note: This demo shows the decryption flow structure.'));
    console.log(chalk.yellow('In a real application, you would decrypt data from smart contracts.'));
    
    const decryption = this.sdk.getDecryption();
    
    try {
      // This would typically be called with actual encrypted data from a contract
      console.log(chalk.green('\n✅ Decryption utilities available:'));
      console.log(chalk.blue(`🔧 Decrypt function: ${typeof decryption.decrypt}`));
      console.log(chalk.blue(`🔑 Generate signature: ${typeof decryption.generateSignature}`));
      
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
    }
  }

  async counterDemo() {
    console.log(chalk.cyan('\n📊 Counter Demo'));
    console.log(chalk.yellow('This demo shows how to interact with the FHECounter contract.'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Counter action:',
        choices: [
          { name: '📈 Increment', value: 'increment' },
          { name: '📉 Decrement', value: 'decrement' },
          { name: '📋 Get Count', value: 'getCount' }
        ]
      }
    ]);

    const spinner = ora(`Performing ${action}...`).start();
    
    try {
      // This would interact with the actual contract
      console.log(chalk.green(`\n✅ ${action} operation completed!`));
      console.log(chalk.blue(`📄 Contract: ${process.env.COUNTER_CONTRACT_ADDRESS}`));
      console.log(chalk.gray('Note: This is a demo - actual contract interaction requires deployed contracts.'));
      
    } catch (error) {
      spinner.fail(`${action} failed`);
      console.error(chalk.red('Error:'), error.message);
    }
  }

  async votingDemo() {
    console.log(chalk.cyan('\n🗳️ Voting Demo'));
    console.log(chalk.yellow('This demo shows how to interact with the FHEVoting contract.'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Voting action:',
        choices: [
          { name: '📝 Create Session', value: 'create' },
          { name: '🗳️ Cast Vote', value: 'vote' },
          { name: '📊 Get Results', value: 'results' }
        ]
      }
    ]);

    const spinner = ora(`Performing ${action}...`).start();
    
    try {
      console.log(chalk.green(`\n✅ ${action} operation completed!`));
      console.log(chalk.blue(`📄 Contract: ${process.env.VOTING_CONTRACT_ADDRESS}`));
      console.log(chalk.gray('Note: This is a demo - actual contract interaction requires deployed contracts.'));
      
    } catch (error) {
      spinner.fail(`${action} failed`);
      console.error(chalk.red('Error:'), error.message);
    }
  }

  async bankingDemo() {
    console.log(chalk.cyan('\n🏦 Banking Demo'));
    console.log(chalk.yellow('This demo shows how to interact with the FHEBank contract.'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Banking action:',
        choices: [
          { name: '💰 Deposit', value: 'deposit' },
          { name: '💸 Withdraw', value: 'withdraw' },
          { name: '🔄 Transfer', value: 'transfer' },
          { name: '📊 Check Balance', value: 'balance' }
        ]
      }
    ]);

    const spinner = ora(`Performing ${action}...`).start();
    
    try {
      console.log(chalk.green(`\n✅ ${action} operation completed!`));
      console.log(chalk.blue(`📄 Contract: ${process.env.BANK_CONTRACT_ADDRESS}`));
      console.log(chalk.gray('Note: This is a demo - actual contract interaction requires deployed contracts.'));
      
    } catch (error) {
      spinner.fail(`${action} failed`);
      console.error(chalk.red('Error:'), error.message);
    }
  }

  async showStatus() {
    console.log(chalk.cyan('\n📋 SDK Status'));
    
    console.log(chalk.green('\n✅ SDK Information:'));
    console.log(chalk.blue(`🔧 Initialized: ${this.isInitialized ? 'Yes' : 'No'}`));
    console.log(chalk.blue(`📡 Network: ${process.env.FHEVM_NETWORK}`));
    console.log(chalk.blue(`🔗 Chain ID: ${process.env.CHAIN_ID}`));
    console.log(chalk.blue(`🌐 RPC URL: ${process.env.RPC_URL}`));
    console.log(chalk.blue(`🚪 Gateway: ${process.env.GATEWAY_URL}`));
    
    console.log(chalk.green('\n📄 Contract Addresses:'));
    console.log(chalk.blue(`📊 Counter: ${process.env.COUNTER_CONTRACT_ADDRESS}`));
    console.log(chalk.blue(`🗳️ Voting: ${process.env.VOTING_CONTRACT_ADDRESS}`));
    console.log(chalk.blue(`🏦 Bank: ${process.env.BANK_CONTRACT_ADDRESS}`));
    
    console.log(chalk.green('\n🔐 FHEVM Contracts:'));
    console.log(chalk.blue(`⚡ Executor: ${process.env.FHEVM_EXECUTOR_CONTRACT}`));
    console.log(chalk.blue(`🔒 ACL: ${process.env.ACL_CONTRACT}`));
    console.log(chalk.blue(`🔑 KMS Verifier: ${process.env.KMS_VERIFIER_CONTRACT}`));
  }

  async run() {
    console.log(chalk.magenta.bold('\n🦸 Cloak SDK Node.js Demo'));
    console.log(chalk.gray('Universal FHEVM SDK for confidential dApps - Server-side\n'));
    
    await this.initialize();
    
    while (true) {
      try {
        const action = await this.showMenu();
        await this.handleAction(action);
        
        // Wait for user to continue
        await inquirer.prompt([
          {
            type: 'input',
            name: 'continue',
            message: 'Press Enter to continue...'
          }
        ]);
        
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
      }
    }
  }
}

// Run the demo
const demo = new CloakNodeDemo();
demo.run().catch(console.error);

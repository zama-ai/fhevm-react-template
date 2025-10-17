#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { initCommand } from "./commands/init";
import { deployCommand } from "./commands/deploy";
import { compileCommand } from "./commands/compile";

const program = new Command();

program
  .name("cloak")
  .description("Cloak SDK CLI - Tools for building confidential dApps with FHEVM")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(compileCommand);
program.addCommand(deployCommand);

program.configureOutput({
  writeErr: (str) => process.stderr.write(str),
  writeOut: (str) => process.stdout.write(str),
  outputError: (str, write) => {
    write(chalk.red(str));
  },
});

process.on("uncaughtException", (error) => {
  console.error(chalk.red("Uncaught Exception:"), error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error(chalk.red("Unhandled Rejection:"), reason);
  process.exit(1);
});

program.parse();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

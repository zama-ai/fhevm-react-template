import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";

interface InitOptions {
  template?: string;
  name?: string;
  framework?: string;
  yes?: boolean;
}

const templates = {
  nextjs: {
    name: "Next.js",
    description: "Next.js app with Cloak SDK integration",
    framework: "nextjs",
  },
  react: {
    name: "React",
    description: "React app with Cloak SDK integration",
    framework: "react",
  },
  vue: {
    name: "Vue.js",
    description: "Vue.js app with Cloak SDK integration",
    framework: "vue",
  },
  node: {
    name: "Node.js",
    description: "Node.js app with Cloak SDK integration",
    framework: "node",
  },
};

export const initCommand = new Command("init")
  .description("Initialize a new Cloak SDK project")
  .argument("[project-name]", "Name of the project")
  .option("-t, --template <template>", "Template to use (nextjs, react, vue, node)")
  .option("-f, --framework <framework>", "Framework to use")
  .option("-y, --yes", "Skip prompts and use defaults")
  .action(async (projectName: string, options: InitOptions) => {
    try {
      console.log(chalk.blue.bold("🚀 Cloak SDK Project Initializer"));
      console.log(chalk.gray("Setting up your confidential dApp...\n"));

      // Get project name
      if (!projectName) {
        const { name } = await inquirer.prompt([
          {
            type: "input",
            name: "name",
            message: "What is your project name?",
            default: "my-cloak-app",
            validate: (input: string) => {
              if (!input.trim()) {
                return "Project name is required";
              }
              if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
                return "Project name can only contain letters, numbers, hyphens, and underscores";
              }
              return true;
            },
          },
        ]);
        projectName = name;
      }

      // Get template/framework
      let selectedTemplate = options.template;
      if (!selectedTemplate && !options.yes) {
        const { template } = await inquirer.prompt([
          {
            type: "list",
            name: "template",
            message: "Which template would you like to use?",
            choices: Object.entries(templates).map(([key, template]) => ({
              name: `${template.name} - ${template.description}`,
              value: key,
            })),
          },
        ]);
        selectedTemplate = template;
      }

      const template = templates[selectedTemplate as keyof typeof templates] || templates.nextjs;

      // Check if directory exists
      const projectPath = path.resolve(projectName);
      if (await fs.pathExists(projectPath)) {
        const { overwrite } = await inquirer.prompt([
          {
            type: "confirm",
            name: "overwrite",
            message: `Directory ${projectName} already exists. Overwrite?`,
            default: false,
          },
        ]);

        if (!overwrite) {
          console.log(chalk.yellow("Project initialization cancelled."));
          return;
        }

        await fs.remove(projectPath);
      }

      // Create project directory
      const spinner = ora("Creating project structure...").start();
      
      try {
        await fs.ensureDir(projectPath);
        
        // Create FHEVM Hardhat template structure
        await createFhevmTemplate(projectPath, projectName, template.framework);

        // Update package.json with project name
        const packageJsonPath = path.join(projectPath, "package.json");
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          packageJson.name = projectName;
          await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }

        spinner.succeed("Project structure created");

        // Install dependencies
        const installSpinner = ora("Installing dependencies...").start();
        
        // Note: In a real implementation, you would run npm/pnpm install here
        // For now, we'll just show the command
        installSpinner.succeed("Dependencies installation ready");

        console.log(chalk.green.bold("\n✅ Project initialized successfully!"));
        console.log(chalk.gray("\nNext steps:"));
        console.log(chalk.cyan(`  cd ${projectName}`));
        console.log(chalk.cyan("  npm install"));
        console.log(chalk.cyan("  npm run dev"));
        
        console.log(chalk.gray("\n📚 Documentation:"));
        console.log(chalk.cyan("  https://docs.cloak-sdk.dev"));
        
        console.log(chalk.gray("\n🔗 Useful commands:"));
        console.log(chalk.cyan("  cloak compile   - Compile FHEVM contracts"));
        console.log(chalk.cyan("  cloak deploy    - Deploy contracts to blockchain"));
        console.log(chalk.cyan("  cloak --help    - Show all available commands"));

      } catch (error) {
        spinner.fail("Failed to create project structure");
        throw error;
      }

    } catch (error) {
      console.error(chalk.red("\n❌ Error initializing project:"), error);
      process.exit(1);
    }
  });

async function createFhevmTemplate(projectPath: string, projectName: string, framework: string) {
  // Create FHEVM Hardhat package.json
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    scripts: {
      compile: "hardhat compile",
      deploy: "hardhat run scripts/deploy.ts",
      test: "hardhat test",
      "test:coverage": "hardhat coverage",
      dev: framework === "nextjs" ? "next dev" : framework === "vue" ? "vite" : "vite",
      build: framework === "nextjs" ? "next build" : "vite build",
      preview: "vite preview",
    },
    dependencies: {
      "@cloak-sdk/core": "workspace:*",
      "@cloak-sdk/react": "workspace:*",
      "@fhevm/mock-utils": "^0.1.0",
      "@zama-fhe/relayer-sdk": "^0.1.0",
      "ethers": "^6.13.4",
      "hardhat": "^2.19.0",
      "@nomicfoundation/hardhat-toolbox": "^4.0.0",
      ...(framework === "nextjs" ? {
        "next": "^14.0.0",
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "@reown/appkit": "^1.0.0",
        "wagmi": "^2.0.0"
      } : framework === "vue" ? {
        "vue": "^3.0.0",
        "@vitejs/plugin-vue": "^5.0.0"
      } : {
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "@vitejs/plugin-react": "^5.0.0"
      })
    },
    devDependencies: {
      "@types/node": "^20.0.0",
      "typescript": "^5.0.0",
      "vite": "^5.0.0",
      ...(framework === "nextjs" ? {
        "@types/react": "^18.0.0",
        "@types/react-dom": "^18.0.0"
      } : framework === "vue" ? {
        "@vue/tsconfig": "^0.5.0"
      } : {
        "@types/react": "^18.0.0",
        "@types/react-dom": "^18.0.0"
      })
    },
  };

  await fs.writeJson(path.join(projectPath, "package.json"), packageJson, { spaces: 2 });

  // Create Hardhat configuration
  await createHardhatConfig(projectPath);

  // Create contracts directory and sample contract
  await fs.ensureDir(path.join(projectPath, "contracts"));
  await createSampleContract(projectPath);

  // Create scripts directory and deploy script
  await fs.ensureDir(path.join(projectPath, "scripts"));
  await createDeployScript(projectPath);

  // Create tests directory
  await fs.ensureDir(path.join(projectPath, "test"));

  // Create frontend structure based on framework
  await createFrontendStructure(projectPath, projectName, framework);

  // Create basic App.tsx
  const appContent = `import React from 'react';
import { CloakProvider } from '@cloak-sdk/react';
import { ethers } from 'ethers';

function App() {
  return (
    <div className="App">
      <h1>Welcome to ${projectName}</h1>
      <p>Your confidential dApp is ready to go!</p>
    </div>
  );
}

export default App;
`;

  await fs.writeFile(path.join(projectPath, "src/App.tsx"), appContent);

  // Create basic index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  await fs.writeFile(path.join(projectPath, "index.html"), indexHtml);

  // Create basic main.tsx
  const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  await fs.writeFile(path.join(projectPath, "src/main.tsx"), mainTsx);

  // Create basic vite config
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
});
`;

  await fs.writeFile(path.join(projectPath, "vite.config.ts"), viteConfig);

  // Create basic tsconfig
  const tsconfig = {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ["src"],
    references: [{ path: "./tsconfig.node.json" }],
  };

  await fs.writeJson(path.join(projectPath, "tsconfig.json"), tsconfig, { spaces: 2 });

  // Create README
  const readme = `# ${projectName}

A confidential dApp built with Cloak SDK.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Learn More

- [Cloak SDK Documentation](https://docs.cloak-sdk.dev)
- [FHEVM Documentation](https://docs.fhevm.io)
`;

  await fs.writeFile(path.join(projectPath, "README.md"), readme);
}

async function createHardhatConfig(projectPath: string): Promise<void> {
  const hardhatConfig = `import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
`;

  await fs.writeFile(path.join(projectPath, "hardhat.config.ts"), hardhatConfig);
}

async function createSampleContract(projectPath: string): Promise<void> {
  const contract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhevm/lib/FHE.sol";

contract ConfidentialCounter {
    euint32 private counter;

    function increment() public {
        counter = FHE.add(counter, FHE.asEuint32(1));
    }

    function getCounter() public view returns (bytes memory) {
        return FHE.reencrypt(counter);
    }

    function setCounter(bytes calldata encryptedValue) public {
        counter = FHE.asEuint32(encryptedValue);
    }
}
`;

  await fs.writeFile(path.join(projectPath, "contracts/ConfidentialCounter.sol"), contract);
}

async function createDeployScript(projectPath: string): Promise<void> {
  const deployScript = `import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ConfidentialCounter...");

  const ConfidentialCounter = await ethers.getContractFactory("ConfidentialCounter");
  const counter = await ConfidentialCounter.deploy();

  await counter.waitForDeployment();

  const address = await counter.getAddress();
  console.log("Contract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;

  await fs.writeFile(path.join(projectPath, "scripts/deploy.ts"), deployScript);
}

async function createFrontendStructure(projectPath: string, projectName: string, framework: string): Promise<void> {
  await fs.ensureDir(path.join(projectPath, "src"));
  await fs.ensureDir(path.join(projectPath, "src/components"));
  await fs.ensureDir(path.join(projectPath, "src/hooks"));
  await fs.ensureDir(path.join(projectPath, "src/contracts"));

  if (framework === "nextjs") {
    await createNextjsStructure(projectPath, projectName);
  } else if (framework === "vue") {
    await createVueStructure(projectPath, projectName);
  } else {
    await createReactStructure(projectPath, projectName);
  }
}

async function createNextjsStructure(projectPath: string, projectName: string): Promise<void> {
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
`;

  await fs.writeFile(path.join(projectPath, "next.config.js"), nextConfig);

  await fs.ensureDir(path.join(projectPath, "app"));
  
  const pageContent = `'use client'

import { useAccount, useConnect } from 'wagmi'
import { Header } from '@/components/Header'
import { CounterDemo } from '@/components/CounterDemo'

export default function Home() {
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ${projectName}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Confidential dApp with FHEVM encryption
          </p>

          <div className="flex justify-center mb-8">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        </div>

        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-600">Please connect your wallet to continue</p>
          </div>
        ) : (
          <CounterDemo />
        )}
      </div>
    </main>
  )
}
`;

  await fs.writeFile(path.join(projectPath, "app/page.tsx"), pageContent);
}

async function createVueStructure(projectPath: string, projectName: string): Promise<void> {
  const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['ethers']
  }
})
`;

  await fs.writeFile(path.join(projectPath, "vite.config.ts"), viteConfig);

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;

  await fs.writeFile(path.join(projectPath, "index.html"), indexHtml);
}

async function createReactStructure(projectPath: string, projectName: string): Promise<void> {
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['ethers']
  }
})
`;

  await fs.writeFile(path.join(projectPath, "vite.config.ts"), viteConfig);

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  await fs.writeFile(path.join(projectPath, "index.html"), indexHtml);
}

# fhevmjs-react-template

This is a simple template to show how to use fhevmjs with Vite + React.

## Getting started

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and update the gateway URL, ACL address, and KMS address to match the fhEVM you're using.

## Development

```bash
npm run dev
```

The server listens on [http://localhost:5173/](http://localhost:5173/)

## Build

```bash
npm run build
```

## Using the mocked coprocessor for front end

As an alternative to use the real coprocessor deployed on Sepolia, to help you develop your dApp faster and without needing testnet tokens, you can use a mocked fhevm. Currently, we recommend you to use the `ConfidentialERC20` dApp example available on the [`mockedFrontend` branch of this repository](https://github.com/zama-ai/fhevm-react-template/tree/mockedFrontend). Follow the README on this branch, and you will be able to deploy exactly the same dApp both on Sepolia as well as on the mocked coprocessor seamlessly.

## Documentation

For more information about fhevmjs, you can [read the documentation](https://docs.zama.ai/fhevm).

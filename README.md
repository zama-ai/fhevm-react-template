# fhevmjs-react-template

This is a simple template to show how to use fhevmjs with Vite + React.

## Getting started

```bash
npm install
```

## Configuration

Edit your `.env` to set Gateway URL, ACL Address and KMS Address.

## Development

```bash
npm run dev
```

The server listens on [http://localhost:4173/](http://localhost:4173/)

Note: HMR is currently broken because Vite does not handle WASM correctly. A workaround has been implemented as a script: running `npm run dev` will execute a build watch alongside Vite preview. If you have a solution for enabling the Vite dev server with HMR, feel free to open a pull request! :)

## Build

```bash
npm run build
```

## Documentation

For more information about fhevmjs, you can [read the documentation](https://docs.zama.ai/fhevm).

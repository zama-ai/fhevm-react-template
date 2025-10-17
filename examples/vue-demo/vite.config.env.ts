// Environment configuration for different build modes
export const envConfig = {
  development: {
    define: {
      __DEV__: true,
      __PROD__: false,
    },
    build: {
      sourcemap: true,
      minify: false,
    }
  },
  production: {
    define: {
      __DEV__: false,
      __PROD__: true,
    },
    build: {
      sourcemap: false,
      minify: 'esbuild',
    }
  }
}

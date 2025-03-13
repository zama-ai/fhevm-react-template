import { build, preview } from 'vite';

(async () => {
  try {
    await preview({
      BASE_URL: '/',
      MODE: 'production',
      DEV: false,
      PROD: true,
      preview: {
        port: 3000
      }
    });
    console.log('Preview server is running...');
    console.log('Listening on http://localhost:3000\n');

    const watcher = await build({
      build: {
        watch: {},
      },
    });
    console.log('Build in watch mode is running...');
  } catch (err) {
    console.error('Error:', err);
  }
})();

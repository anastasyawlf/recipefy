const Hapi = require('@hapi/hapi');
const apiRoutes = require('./routes/apiRoutes');

const init = async () => {
  const server = Hapi.server({
    port: 8080,
    host: 'localhost',
  });

  // Tambahkan rute API ke server
  apiRoutes.forEach(route => server.route(route));

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

init();

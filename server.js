require('dotenv').config();
const fastify = require('fastify')({
  logger: true
});
const autoload = require('fastify-autoload');
const path = require('path');
const PORT = process.env.PORT || 5000;
fastify.register(require('fastify-cors'), {
  origin: ['https://quasar-auth-sample.netlify.app', 'http://localhost:8080'],
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  credentials: true
});
fastify.register(
  require('fastify-knexjs'),
  {
    client: 'pg',
    connection: process.env.DATABASE_URL
  },
  (err) => console.error(err)
);
fastify.register(autoload, { dir: path.join(__dirname, 'plugins') });
fastify.register(autoload, { dir: path.join(__dirname, 'services') });

fastify.get(
  '/',
  () => {
    return {
      msg: 'api v0.0.1'
    };
  }
);

const start = async () => {
  try {
    await fastify.listen(PORT, '0.0.0.0');
    fastify.log.info(
      `dooh-server listening on ${fastify.server.address().port}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

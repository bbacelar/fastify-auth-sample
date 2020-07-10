const { signinSchema, registerBodySchema } = require('../schemas/auth');
const bcrypt = require('bcrypt');

const encryptPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const EXPIRATION_TIME = {
  '30s': () => Math.floor(Date.now() / 1000) + 30,
  '01h': () => Math.floor(Date.now() / 1000) + 60 * 60,
  '24h': () => Math.floor(Date.now() / 1000) + 60 * 60 * 24
};

function createPayload ({ id, name, email }) {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: id,
    name: name,
    email: email,
    iat: now,
    exp: EXPIRATION_TIME['24h']()
  };
}

async function routes (fastify, options) {
  fastify.post(
    '/register',
    {
      schema: registerBodySchema
    },
    async (req, reply) => {
      if (req.body) {
        try {
          const alreadyExists = await fastify
            .knex('users')
            .select('email')
            .where({ email: req.body.email })
            .whereNull('deleted_at')
            .first();
          if (alreadyExists) {
            reply.code(409).send('User already registered');
            return;
          }
          const user = {
            name: req.body.name,
            email: req.body.email,
            password: encryptPassword(req.body.password)
          };
          const id = await fastify.knex('users').returning('id').insert(user);
          const payload = createPayload({ id, ...user });
          reply.code(200).send({ ...payload, token: fastify.jwt.sign(payload) });
        } catch (err) {
          fastify.log.error(err);
          reply.code(500).send('Internal error');
        }
      }
    }
  );

  fastify.post('/signin', { schema: signinSchema }, async (req, reply) => {
    try {
      const dbUser = await fastify
        .knex('users')
        .select('id', 'name', 'email', 'password')
        .where({ email: req.body.email })
        .whereNull('deleted_at')
        .first();

      if (!dbUser) {
        reply.code(404).send('User not found');
        return;
      }
      const isMatch = bcrypt.compareSync(req.body.password, dbUser.password);
      if (!isMatch) {
        reply.code(401).send('Invalid email or password');
        return;
      }
      const payload = createPayload(dbUser);
      reply.code(200).send({
        ...payload,
        token: fastify.jwt.sign(payload)
      });
    } catch (error) {
      console.log(error);
      reply.code(500).send('Internal error');
    }
  });
}

module.exports = routes;

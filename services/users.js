const {
  responseArraySchema,
  responseSingleSchema
} = require('../schemas/user');

async function routes (fastify, _) {
  fastify.get(
    '/users',
    { schema: responseArraySchema, preValidation: [fastify.authenticate] },
    async (_, reply) => {
      try {
        const users = await fastify
          .knex('users')
          .select('id', 'name', 'email', 'created_on')
          .whereNull('deleted_at');

        reply.code(200).send(users);
      } catch (err) {
        reply.code(500).send('Internal error');
      }
    }
  );

  fastify.get(
    '/users/:id',
    { schema: responseSingleSchema, preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const user = await fastify
          .knex('users')
          .where('id', req.params.id)
          .select('id', 'name', 'email', 'created_on')
          .first();

        reply.code(200).send(user);
      } catch (err) {
        console.log(err);
        reply.code(500).send('Internal error');
      }
    }
  );
}

module.exports = routes;

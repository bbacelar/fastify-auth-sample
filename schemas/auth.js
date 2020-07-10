const S = require('fluent-schema');

const responseSchema = {
  200: S.object()
    .prop('sub', S.string())
    .prop('name', S.string())
    .prop('email', S.string().format(S.FORMATS.EMAIL))
    .prop('iat', S.number())
    .prop('ext', S.number())
    .prop('token', S.string())
};

const baseSchema = S.object()
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())
  .prop('password', S.string().required());

const registerBodySchema = {
  body: S.object().prop('name', S.string().required()).extend(baseSchema),
  response: responseSchema
};

const signinSchema = {
  body: baseSchema,
  response: responseSchema
};

module.exports = { signinSchema, registerBodySchema };

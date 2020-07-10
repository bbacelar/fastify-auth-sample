const S = require('fluent-schema');

const userBaseSchema = S.object()
  .id('#userBase')
  .prop('name', S.string())
  .prop('email', S.string().format(S.FORMATS.EMAIL));

const userSchema = S.object()
  .id('#userSchema')
  .prop('id', S.string())
  .prop('created_on', S.string().format(S.FORMATS.DATE_TIME))
  .extend(userBaseSchema);

const responseArraySchema = {
  response: {
    200: S.array().items(userSchema)
  }
};

const responseSingleSchema = {
  response: {
    200: userSchema
  }
};

module.exports = { responseArraySchema, responseSingleSchema };

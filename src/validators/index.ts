import Joi from "joi";

const fileSchema = Joi.object({
  originalFilename: Joi.string().required(),
  mimetype: Joi.string().valid("application/pdf").required().messages({
    "any.only": "Seul les fichiers PDF sont autorisés",
  }),
  size: Joi.number()
    .max(5 * 1024 * 1024)
    .required()
    .messages({
      "number.max": "La taille du ficher ne doit pas exceder 5MB",
    }),
});

const fileKeySchema = Joi.object({
  filename: Joi.string().required(),
});

const fileKeySchemaArray = Joi.array().items(Joi.string().required());

export { fileSchema, fileKeySchema, fileKeySchemaArray };

import Joi from "joi";

export const updateUserSchema = Joi.object({
  name: Joi.string(),
  phone: Joi.string().pattern(
    /^\+?[0-9]{1,4}[-\s]?[0-9]{2,4}[-\s]?[0-9]{6,8}$/
  ),
  profile_image: Joi.string(),
  date_of_birth: Joi.date(),
  gender: Joi.string().valid("male", "female"),
});

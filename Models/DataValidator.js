const Joi = require("joi");
const { default: mongoose } = require("mongoose");


const schema = Joi.object({
    firstName: Joi
                  .string()
                  .min(3)
                  .max(15)
                  .required()
                  .messages({
                    'string.base': 'First name should be a type of text.',
                    'string.empty': 'First name is required.',
                    'string.min': 'First name should have a minimum length of 3.',
                    'string.max': 'First name should have a maximum length of 15.',
                    'any.required': 'First name is required.'
                }),
    lastName: Joi
                 .string()
                 .min(3)
                 .max(15)
                 .required()
                 .messages({
                    'string.base': 'Last name should be a type of text.',
                    'string.empty': 'Last name is required.',
                    'string.min': 'Last name should have a minimum length of 3.',
                    'string.max': 'Last name should have a maximum length of 15.',
                    'any.required': 'Last name is required.'
                }),
    email: Joi
                .string()
                .email()
                .required()
                .messages({
                  'string.email': 'Email must be a valid email address.',
                  'any.required': 'Email is required.',
              }),  
    password: Joi
                 .string()
                 .pattern(new RegExp('^[a-zA-Z0-9]{8,30}$'))
                 .required()
                 .messages({
                    'string.pattern.base': 'Password must be 8-20 characters long, and include at least one uppercase letter, one lowercase letter',
                    'any.required': 'Password is required.'
                 }),
    confirmPassword: Joi
                        .string()
                        .required()
                        .valid(Joi.ref('password'))
                        .messages({
                            'any.only':'Confirm password must be same as Passsword',
                            'any.required': 'Confrim passwrod is required'
                        })

});



module.exports = schema;
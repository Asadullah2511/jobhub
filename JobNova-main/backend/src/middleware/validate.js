const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const validate = (validations) => {
    return async (req, res, next) => {
        for (const validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) break;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value
            }));

            return next(new ValidationError('Validation failed', formattedErrors));
        }

        next();
    };
};

module.exports = validate;

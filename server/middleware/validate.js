const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            return res.status(400).json ({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
    };
};

const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.params);
            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters',
                errors: error.errors
            });
        }
    };
};

module.exports = { validate, validateParams };
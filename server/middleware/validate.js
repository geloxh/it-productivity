const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (result.success) return next();
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: result.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
    };
};

const validateParams = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);
        if (result.success) return next();
        return res.status(400).json({
            success: false,
            message: 'Invalid parameters',
            errors: result.error.issues
        });
    };
};

module.exports = { validate, validateParams };
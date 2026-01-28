const User = require('../models/User');
const logger = require('../config/logger');

// @desc    GET all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
    try {
        // Exclude password from the result for security
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ success: false, error: 'Server Error '});
    }
};

// @desc    Create a user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
    try {
        // IMPORTANT: In a real application, you MUST hash the password before saving.
        // Libraries like bcrypt are perfect for this.
        // const salt = await bcrypt.genSalt(10);
        // req.body.password = await bcrypt.hash(req.body.password, salt);

        const user = await User.create(req.body);

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: userResponse
        });
    } catch (err) {
        logger.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    GET single user
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            // Use a constant error response
            return res.status(404).json({ success: false, error: `User not found with id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        logger.error(err);
        // Handle CastError for porrly formatted ObjectId
        if (err.name === 'CastError') {
            return res.status(404).json({ success:  false, error: `User not found with id of ${req.params.id}`});
        }
        res.status(500).json({ success:  false, error: 'Server Error' });
    }
};
// Follow pattern for updateUser and deleteUser

// exports.updateUser = async (req, res, next) => { ... };
// exports.deleteUser = async (req, res, next) => { ... };
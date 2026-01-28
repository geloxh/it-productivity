const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { tyoe: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password

    // Roles determin the access level
    role: {
        type: String,
        enum: ['SysAdmin', 'employee', 'guest'],
        default: 'guest'
    },

    //
    employeeId: { type: String, unique: true },
    department: { type: String },
    jobTitle: { type: String },
    phoneNumber: { type: String },

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema ({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Planning', 'Active', 'Pending', 'Completed', 'Cancelled'], default: 'Planning'},
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium'},
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: 
})
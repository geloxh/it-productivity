const mongooose = required('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    jobTitle: { type: String },
    company: { type: String, enum: ['SPK', '3E', 'PowerNet', 'NORM' ] },
    isActive: { type: Boolean, default: true },
    contractStatus: {
        type: String,
        enum: ['Active', 'Resigned', 'Awol', 'Terminated'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
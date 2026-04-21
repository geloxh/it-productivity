const Project = require('../models/Project');

exports.create = async (req, res) => {
    try {
        const project = await Project.create({ ...req.body, owner: req.user.id });
        res.status(201).json(project);
    } catch (error) {
        console.log('CREATE ERROR:', error.message); // add this
        res.status(400).json({ error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const project = await Project.find().populate('owner members');
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('owner members');
        if (!project) return res.status(404).json({ error: 'Project not found.'});
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) return res.status(404).json({ error: 'Project not found.' });
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ error: "Project not found." });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
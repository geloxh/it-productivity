const Asset = require('../models/Asset');

const createAsset = async (assetData) => {
    return await Asset.create(assetData);
};

const getAllAssets = async (filters = {}) => {
    return await Asset.find(filters).populate('assignedTo');
};

const getAssetById = async (id) => {
    const asset = await Asset.findById(id).populate('assignedTo');
    if (!asset) throw new Error('Asset not found.');
    return asset;
}

const updateAsset = async (id, updates) => {
    const asset = await Asset.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!asset) throw new Error('Asset not found.');
    return asset;
};

const assignedAsset = async (assetId, userId) => {
    const asset = await Asset.findByIdAndUpdate(
        assetId,
        { assignedTo: userId, status: 'Assigned'},
        { new: true }
    );
    if (!asset) throw new Error('Asset not found.');
    return asset;
};

module.exports = { createAsset, getAllAssets, getAssetById, updateAsset, assignAsset };
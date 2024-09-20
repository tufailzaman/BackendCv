const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    token: { type: String, required: true }
});

module.exports = mongoose.model('Token', tokenSchema);

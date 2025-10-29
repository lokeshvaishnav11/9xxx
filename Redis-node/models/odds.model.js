const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({}, { strict: false, collection: 'manageodds' });

const manageodds = mongoose.model('mangeodd', MatchSchema);

module.exports = manageodds;
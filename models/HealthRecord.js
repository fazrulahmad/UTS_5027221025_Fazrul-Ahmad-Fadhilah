const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  recordID: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  condition: { type: String, required: true }
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);

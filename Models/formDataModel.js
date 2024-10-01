// const { string } = require('joi');
const mongoose = require('mongoose');

const FormDataSchema = new mongoose.Schema({
  personalInfo: {
    type: Object,
    required: true,
  },
  professionalSummary: {
    type: Object,
    required: true,
  },
  skills: {
    type: Array,
    required: true,
  },
  experience: {
    type: Object,
    required: true,
  },
  education: {
    type: Object,
    required: true,
  },
  customDetails: {
    type: Array,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('FormData', FormDataSchema);

const mongoose = require('mongoose');

const facultyregister = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  paypal: {
    type: String,
    required: true
  },
  highest_qualification: {
    type: String,
    required: true
  },
  institute: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true
  }
});

const FacultyReg = mongoose.model('FacultyReg', facultyregister);

module.exports = FacultyReg;

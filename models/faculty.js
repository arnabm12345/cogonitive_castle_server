const mongoose = require('mongoose')
const { Schema } = mongoose

const facultySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    avatar: {
        type: String
    },
    password: {
        type: String,
    },
    registrationNumber: {
        type: String,
    },
    gender: {
        type: String,
    },
    designation: {
        type: String,
        required: true
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'subject', 
        required: true
    },
    facultyMobileNumber: {
        type: Number
    },
    aadharCard: {
        type: Number
    },
    dob: {
        type: String,
        required: true
    },
    joiningYear: {
        type: Number,
        required: true 
    },
    block:{
        type:Number,
        required:true
    },
    subjectsCanTeach: [{
        type: Schema.Types.ObjectId,
        ref: 'subject',
      }],
    otp: {
        type: String
    }
})

module.exports = mongoose.model('faculty', facultySchema)

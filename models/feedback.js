const mongoose = require('mongoose');
const { Schema } = mongoose

const feedbackShema = new mongoose.Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'student',
    required: true
  },
  
  message:{
  type:String,
  required:true
  },
  
});

const Feedback = mongoose.model('Feedback', feedbackShema);
module.exports = Feedback;

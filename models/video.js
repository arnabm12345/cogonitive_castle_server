const mongoose = require('mongoose');
const { Schema } = mongoose

const videoSchema = new mongoose.Schema({
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'subject',
    required: true
  },
  file: {
    type: String,
    required: true
  },
  title:{
    type: String,
    required: true
  },
  registration_num:{
  type:String,
  required:true
  },
  description:{
    type:String,
    required:true
  }
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;

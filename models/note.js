const mongoose = require('mongoose');
const { Schema } = mongoose

const noteSchema = new mongoose.Schema({
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
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;

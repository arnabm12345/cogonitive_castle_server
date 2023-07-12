const mongoose = require('mongoose');
const {Schema}=mongoose
const noticeSchema = new mongoose.Schema({
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'subject',
    required: true
  },
  classt:{
    type: String,
    required: true
  },
  date:{
    type: String,
    required: true
  },
  content:{
    type: String,
    required: true
  },
  registration_num:{
  type:String,
  required:true
  },
});

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;

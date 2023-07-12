const mongoose = require("mongoose");
const { Schema } = mongoose

const timetableSchema = new Schema({
  day: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true 
},
  morning: {
    time: {
        type:String,
    },
    zoomLink: {
        type:String,
    },
    subject: {
        type:String,
    },
  },
  afternoon: {
    time: {
        type:String,
    },
    zoomLink: {
        type:String,
    },
    subject: {
        type:String,
    },
  },
  evening: {
    time: {
        type:String,
    },
    zoomLink: {
        type:String,
    },
    subject: {
        type:String,
    },
  },
  
});

module.exports = mongoose.model("Timetable", timetableSchema);


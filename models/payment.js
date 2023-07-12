const mongoose = require('mongoose');
const {Schema}=mongoose
const paymentSchema = new mongoose.Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'student',
    required: true
  },
 orderId:{
  type:String,
  required:true
 },
  date:{
    type: String,
    required: true
  },
  registrationNumber:{
  type:String,
  required:true
  },
  name:{
    type:String
  },
  amount:{
    type:String,
    required:true

  }

});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

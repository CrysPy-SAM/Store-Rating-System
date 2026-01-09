const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 60
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'store_owner'],
    default: 'user'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

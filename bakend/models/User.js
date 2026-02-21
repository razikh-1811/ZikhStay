const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  clerkId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  name: String,
  role: { 
    type: String, 
    enum: ['guest', 'partner', 'admin'], 
    default: 'guest' 
  },
  // Specifically for Partners (Hotel Owners)
  phoneNumber: String,
  isVerifiedPartner: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  formbotId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Formbot', // Link to the formbot collection, with lowercase 'formbot'
    required: true
  },
  fields: [
    {
      label: { type: String, required: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
    },
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  views: { 
    type: Number, 
    default: 0 // Tracks page views
  },
  starts: { 
    type: Number, 
    default: 0 // Tracks number of users who filled in the first field
  }
});

module.exports = mongoose.model('Response', responseSchema);

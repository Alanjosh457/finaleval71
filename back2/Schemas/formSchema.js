const mongoose = require('mongoose');

// Form Schema
const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fields: [
    {
      type: { type: String, required: true },  // 'text', 'phone', 'email', etc.
      label: { type: String, required: true },  // Label for the form field
      value: { type: mongoose.Schema.Types.Mixed },  // Value can be any type (String, Number, Date, etc.)
    },
  ],
  formbotId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Formbot' },  // Reference to the Formbot
  createdAt: { type: Date, default: Date.now },  // Automatically set the creation date
});

module.exports = mongoose.model('Form', formSchema);

const mongoose = require("mongoose");

// Define the Formbot schema
const formbotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null }, // Reference to a folder if it is inside one, else null
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User who owns this formbot
});

module.exports = mongoose.model("Formbot", formbotSchema);

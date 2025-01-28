const mongoose = require("mongoose");

// Define the Folder schema
const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User who owns this folder
  formbots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Formbot" }], // List of formbots inside this folder
});

module.exports = mongoose.model("Folder", folderSchema);

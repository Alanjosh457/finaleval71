const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: {
    type: String,
    required: true,
  },
 
  password: {
    type: String,
    required: true,
  },
  // Stores the workspaces shared with the user
  sharedWorkspaces: [
    {
      workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace", // Reference to the Workspace model
      },
      sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // The user who shared the workspace
      },
      shareMode: {
        type: String,
        enum: ['edit', 'view'], // Either 'edit' or 'view'
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);

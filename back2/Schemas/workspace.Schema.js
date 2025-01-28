const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // The user who owns the workspace
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  // Users who have access to this workspace
  sharedWith: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // The user who is shared the workspace
      },
      shareMode: {
        type: String,
        enum: ['edit', 'view'], // 'edit' or 'view'
      },
    },
  ],
  // Optional fields for more metadata
  description: {
    type: String,
    default: '', // Optionally add description
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Workspace", workspaceSchema);

const mongoose = require('mongoose');

const sharedWorkspaceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sharedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.Mixed, // Allow referencing either Workspace or User
    required: true,
  },
  permission: {
    type: String,
    enum: ['edit', 'view'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save validation for integrity
sharedWorkspaceSchema.pre('save', function (next) {
  if (!['edit', 'view'].includes(this.permission)) {
    return next(new Error('Invalid permission value.'));
  }

  if (!this.workspaceId) {
    return next(new Error('Workspace ID is required.'));
  }

  next();
});

const SharedWorkspace = mongoose.model('SharedWorkspace', sharedWorkspaceSchema);

module.exports = SharedWorkspace;
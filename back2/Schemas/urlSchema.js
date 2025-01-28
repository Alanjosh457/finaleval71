const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortenedKey: {
    type: String,
    required: true,
    unique: true,
  },
  remarks: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  expirationDate: {
    type: Date,
    default: null,
  },
  deviceClicks: {
    mobile: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
  },
  osClicks: {
    type: [String], // An array of OS names, like ["android", "ios", "windows"]
    default: [],
  },
  ipAddresses: {
    type: [String],
    default: [],
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Url", urlSchema);

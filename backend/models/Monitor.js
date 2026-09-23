const mongoose = require("mongoose");

const monitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      default: "GET",
    },

    currentStatus: {
      type: String,
      enum: ["UP", "DOWN", "UNKNOWN"],
      default: "UNKNOWN",
    },

    lastStatusCode: {
      type: Number,
      default: null,
    },

    lastResponseTime: {
      type: Number,
      default: null,
    },

    lastError: {
      type: String,
      default: null,
    },

    lastCheckedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Monitor", monitorSchema);
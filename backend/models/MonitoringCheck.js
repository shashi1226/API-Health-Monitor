const mongoose = require("mongoose");

const monitoringCheckSchema = new mongoose.Schema(
  {
    monitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Monitor",
      required: true,
    },

    status: {
      type: String,
      enum: ["UP", "DOWN"],
      required: true,
    },

    statusCode: {
      type: Number,
      default: null,
    },

    responseTime: {
      type: Number,
      default: null,
    },

    error: {
      type: String,
      default: null,
    },

    checkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MonitoringCheck", monitoringCheckSchema);
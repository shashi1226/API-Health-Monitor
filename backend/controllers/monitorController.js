const Monitor = require("../models/Monitor");
const MonitoringCheck = require("../models/MonitoringCheck");
const { checkHealth } = require("../services/healthCheckService");

// Create a new monitor
const createMonitor = async (req, res) => {
  try {
    const { name, url, method } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: "Name and URL are required",
      });
    }

    const monitor = await Monitor.create({
      name,
      url,
      method: method || "GET",
    });

    res.status(201).json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    console.error("Create monitor error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create monitor",
    });
  }
};

// Get all monitors
const getMonitors = async (req, res) => {
  try {
    const monitors = await Monitor.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: monitors,
    });
  } catch (error) {
    console.error("Get monitors error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch monitors",
    });
  }
};

// Get one monitor
const getMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    console.error("Get monitor error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch monitor",
    });
  }
};

// Update a monitor
const updateMonitor = async (req, res) => {
  try {
    const { name, url, method } = req.body;

    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: "Name and URL are required",
      });
    }

    monitor.name = name;
    monitor.url = url;
    monitor.method = method || "GET";

    await monitor.save();

    res.status(200).json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    console.error("Update monitor error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update monitor",
    });
  }
};

// Delete a monitor
const deleteMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    // Delete the monitor
    await Monitor.findByIdAndDelete(req.params.id);

    // Delete all monitoring history for this monitor
    await MonitoringCheck.deleteMany({
      monitor: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Monitor and its history deleted successfully",
    });
  } catch (error) {
    console.error("Delete monitor error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete monitor",
    });
  }
};

const checkMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    const result = await checkHealth(monitor);

    const monitoringCheck = await MonitoringCheck.create({
      monitor: monitor._id,
      status: result.status,
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      error: result.error,
    });

    monitor.currentStatus = result.status;
    monitor.lastStatusCode = result.statusCode;
    monitor.lastResponseTime = result.responseTime;
    monitor.lastError = result.error;
    monitor.lastCheckedAt = new Date();

    await monitor.save();

    res.status(200).json({
      success: true,
      data: {
        monitor,
        check: monitoringCheck,
      },
    });
  } catch (error) {
    console.error("Check monitor error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to check monitor",
    });
  }
};
const getMonitorHistory = async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    const history = await MonitoringCheck.find({
      monitor: req.params.id,
    }).sort({ checkedAt: -1 });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get monitor history error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch monitor history",
    });
  }
};

module.exports = {
  createMonitor,
  getMonitors,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  checkMonitor,
  getMonitorHistory,
};

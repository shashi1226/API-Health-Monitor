const express = require("express");

const {
  createMonitor,
  getMonitors,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  checkMonitor,
  getMonitorHistory,
} = require("../controllers/monitorController");

const router = express.Router();

router.post("/", createMonitor);
router.get("/", getMonitors);
router.post("/:id/check", checkMonitor);
router.get("/:id/history", getMonitorHistory);
router.get("/:id", getMonitor);
router.put("/:id", updateMonitor);
router.delete("/:id", deleteMonitor);

module.exports = router;
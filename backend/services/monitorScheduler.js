const Monitor = require("../models/Monitor");
const MonitoringCheck = require("../models/MonitoringCheck");
const { checkHealth } = require("./healthCheckService");

const runAutomaticChecks = async () => {
  try {
    const monitors = await Monitor.find();

    if (monitors.length === 0) {
      console.log("Automatic monitoring: No monitors found.");
      return;
    }

    console.log(`Automatic monitoring: Checking ${monitors.length} APIs...`);

    await Promise.all(
      monitors.map(async (monitor) => {
        try {
          const result = await checkHealth(monitor);

          await MonitoringCheck.create({
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

          console.log(
            `${monitor.name}: ${result.status} - ${result.responseTime}ms`,
          );
        } catch (error) {
          console.error(
            `Automatic check failed for ${monitor.name}:`,
            error.message,
          );
        }
      }),
    );

    console.log("Automatic monitoring: Check completed.");
  } catch (error) {
    console.error("Automatic monitoring error:", error.message);
  }
};

const startMonitorScheduler = () => {
  console.log("Automatic monitoring started.");
  console.log("Checking APIs every 1 minute.");

  // Run once when the server starts
  runAutomaticChecks();

  // Then run every 1 minute
  setInterval(runAutomaticChecks, 60 * 1000);
};

module.exports = {
  startMonitorScheduler,
};
const Monitor = require("../models/Monitor");
const MonitoringCheck = require("../models/MonitoringCheck");

const getDashboardStats = async (req, res) => {
  try {
    const totalMonitors = await Monitor.countDocuments();

    const upMonitors = await Monitor.countDocuments({
      currentStatus: "UP",
    });

    const downMonitors = await Monitor.countDocuments({
      currentStatus: "DOWN",
    });

    const averageResponse = await MonitoringCheck.aggregate([
      {
        $match: {
          responseTime: { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          averageResponseTime: { $avg: "$responseTime" },
        },
      },
    ]);

    const recentFailures = await MonitoringCheck.find({
      status: "DOWN",
    })
      .populate("monitor", "name url")
      .sort({ checkedAt: -1 })
      .limit(5);

    const averageResponseTime =
      averageResponse.length > 0
        ? Math.round(averageResponse[0].averageResponseTime)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalMonitors,
        upMonitors,
        downMonitors,
        averageResponseTime,
        recentFailures,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = {
  getDashboardStats,
};
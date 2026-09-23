const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/db");
const monitorRoutes = require("./routes/monitorRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { startMonitorScheduler } = require("./services/monitorScheduler");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use("/api/dashboard", dashboardRoutes);

app.use(express.json());

app.use("/api/monitors", monitorRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API Health Monitor backend is running",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    startMonitorScheduler();
  });
};

startServer();

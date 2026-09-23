const axios = require("axios");

const checkHealth = async (monitor) => {
  const startTime = Date.now();

  try {
    const response = await axios({
      method: monitor.method,
      url: monitor.url,
      timeout: 10000,
      validateStatus: () => true,
    });

    const responseTime = Date.now() - startTime;

    return {
      status: response.status >= 200 && response.status < 400 ? "UP" : "DOWN",
      statusCode: response.status,
      responseTime,
      error: null,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: "DOWN",
      statusCode: error.response?.status || null,
      responseTime,
      error: error.message,
    };
  }
};

module.exports = {
  checkHealth,
};
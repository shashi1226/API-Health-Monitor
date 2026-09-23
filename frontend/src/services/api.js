const API_BASE_URL = "https://api-health-monitor-ol0y.onrender.com/api";

export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard statistics");
  }

  return response.json();
};

export const getMonitors = async () => {
  const response = await fetch(`${API_BASE_URL}/monitors`);

  if (!response.ok) {
    throw new Error("Failed to fetch monitors");
  }

  return response.json();
};

export const getMonitorHistory = async (monitorId) => {
  const response = await fetch(
    `${API_BASE_URL}/monitors/${monitorId}/history`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch monitor history");
  }

  return response.json();
};

export const createMonitor = async (monitorData) => {
  const response = await fetch(`${API_BASE_URL}/monitors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(monitorData),
  });

  if (!response.ok) {
    throw new Error("Failed to create monitor");
  }

  return response.json();
};

export const checkMonitor = async (monitorId) => {
  const response = await fetch(
    `${API_BASE_URL}/monitors/${monitorId}/check`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to check monitor");
  }

  return response.json();
};

export const deleteMonitor = async (monitorId) => {
  const response = await fetch(
    `${API_BASE_URL}/monitors/${monitorId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete monitor");
  }

  return response.json();
};

export const updateMonitor = async (monitorId, monitorData) => {
  const response = await fetch(
    `${API_BASE_URL}/monitors/${monitorId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(monitorData),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update monitor");
  }

  return response.json();
};
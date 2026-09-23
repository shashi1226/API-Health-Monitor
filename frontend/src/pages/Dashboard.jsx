import { useEffect, useState } from "react";
import {
  getDashboardStats,
  getMonitors,
  getMonitorHistory,
  createMonitor,
  checkMonitor,
  deleteMonitor,
  updateMonitor,
} from "../services/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [monitors, setMonitors] = useState([]);
  const [history, setHistory] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState(null);
  const [checkingMonitorId, setCheckingMonitorId] = useState(null);
  const [selectedMonitorId, setSelectedMonitorId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    method: "GET",
  });
  const handleCheckMonitor = async (monitorId) => {
    try {
      setCheckingMonitorId(monitorId);
      setError("");

      await checkMonitor(monitorId);

      setSuccessMessage("API health check completed.");
      setTimeout(() => setSuccessMessage(""), 3000);

      await loadDashboard();
    } catch (error) {
      console.error(error);
      setError("Unable to check the API.");
    } finally {
      setCheckingMonitorId(null);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, monitorsResponse] = await Promise.all([
        getDashboardStats(),
        getMonitors(),
      ]);

      setStats(statsResponse.data);
      setMonitors(monitorsResponse.data);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the monitoring server. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleAddMonitor = async () => {
    try {
      if (!formData.name.trim() || !formData.url.trim()) {
        setError("Please enter both API name and URL.");
        return;
      }

      await createMonitor(formData);
      setSuccessMessage("API added successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);

      setShowAddForm(false);

      setFormData({
        name: "",
        url: "",
        method: "GET",
      });

      await loadDashboard();
    } catch (error) {
      console.error(error);
      setError("Unable to add the API monitor.");
    }
  };

  useEffect(() => {
    const monitorId = selectedMonitorId || monitors[0]?._id;

    if (!monitorId) {
      return;
    }

    const loadHistory = async () => {
      try {
        const response = await getMonitorHistory(monitorId);
        setHistory(response.data);
      } catch (error) {
        console.error(error);
        setHistory([]);
      }
    };

    loadHistory();
  }, [selectedMonitorId, monitors]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedMonitorId) {
      return;
    }

    const loadHistory = async () => {
      try {
        const response = await getMonitorHistory(selectedMonitorId);

        setHistory(response.data);
      } catch (error) {
        console.error(error);
        setHistory([]);
      }
    };

    loadHistory();
  }, [selectedMonitorId]);

  const handleDeleteMonitor = async (monitorId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this API monitor?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMonitor(monitorId);
      setSuccessMessage("API deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);

      await loadDashboard();
    } catch (error) {
      console.error(error);
      setError("Unable to delete the API monitor.");
    }
  };

  const handleUpdateMonitor = async () => {
    if (!editingMonitor) {
      return;
    }

    if (!formData.name.trim() || !formData.url.trim()) {
      setError("API name and URL are required.");
      return;
    }

    try {
      await updateMonitor(editingMonitor._id, {
        name: formData.name.trim(),
        url: formData.url.trim(),
        method: formData.method,
      });
      setSuccessMessage("API updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);

      setShowEditForm(false);
      setEditingMonitor(null);

      await loadDashboard();
    } catch (error) {
      console.error(error);
      setError("Unable to update the API monitor.");
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <h2>API Monitor</h2>
            <span>Health Monitor</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a className="nav-item active">Dashboard</a>
          <a className="nav-item">Monitors</a>
        </nav>

        <div className="sidebar-footer">
          <span>API Health Monitor</span>
          <small>MVP v1.0</small>
        </div>
      </aside>

      <main className="main-content">
        {loading && (
          <div className="loading-banner">Loading dashboard data...</div>
        )}
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Monitor the health and performance of your APIs.</p>
          </div>

          <button
            className="add-api-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add API
          </button>
        </header>

        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2>Add API Monitor</h2>
                  <p>Add an API endpoint to monitor.</p>
                </div>

                <button
                  className="modal-close"
                  onClick={() => setShowAddForm(false)}
                >
                  ×
                </button>
              </div>

              <div className="form-group">
                <label>API Name</label>

                <input
                  type="text"
                  placeholder="GitHub API"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>API URL</label>

                <input
                  type="text"
                  placeholder="https://api.github.com"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      url: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>HTTP Method</label>
                <select
                  value={formData.method}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      method: e.target.value,
                    })
                  }
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>

                <button className="submit-button" onClick={handleAddMonitor}>
                  Add API
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2>Edit API Monitor</h2>
                  <p>Update your API monitor details.</p>
                </div>

                <button
                  className="modal-close"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingMonitor(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="form-group">
                <label>API Name</label>
                <input
                  type="text"
                  placeholder="GitHub API"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>API URL</label>
                <input
                  type="text"
                  placeholder="https://api.github.com"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      url: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>HTTP Method</label>
                <select
                  value={formData.method}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      method: e.target.value,
                    })
                  }
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingMonitor(null);
                  }}
                >
                  Cancel
                </button>

                <button className="submit-button" onClick={handleUpdateMonitor}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <div>
              <strong>Connection Error</strong>
              <p>{error}</p>
            </div>
            {successMessage && (
              <div className="success-message">
                <strong>Success</strong>
                <p>{successMessage}</p>
              </div>
            )}

            <button className="retry-button" onClick={loadDashboard}>
              Retry
            </button>
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total APIs</span>
            <strong>{loading ? "..." : (stats?.totalMonitors ?? 0)}</strong>
          </div>

          <div className="stat-card">
            <span>APIs UP</span>
            <strong className="status-up">
              {loading ? "..." : (stats?.upMonitors ?? 0)}
            </strong>
          </div>

          <div className="stat-card">
            <span>APIs DOWN</span>
            <strong className="status-down">
              {loading ? "..." : (stats?.downMonitors ?? 0)}
            </strong>
          </div>

          <div className="stat-card">
            <span>Avg Response</span>
            <strong>
              {loading ? "..." : `${stats?.averageResponseTime ?? 0} ms`}
            </strong>
          </div>
        </section>

        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>API Status</h2>
              <p>Current status of your monitored endpoints.</p>
            </div>

            <button className="refresh-button" onClick={loadDashboard}>
              Refresh
            </button>
          </div>

          {monitors.length === 0 ? (
            <div className="empty-state">No APIs are being monitored yet.</div>
          ) : (
            monitors.map((monitor) => (
              <div className="api-row" key={monitor._id}>
                <div className="api-info">
                  <div
                    className={`status-dot ${
                      monitor.currentStatus === "DOWN" ? "status-dot-down" : ""
                    }`}
                  ></div>

                  <div>
                    <h3>{monitor.name}</h3>
                    <p>{monitor.url}</p>
                  </div>
                </div>

                <div className="api-details">
                  <div>
                    <span>Status</span>
                    <strong
                      className={
                        monitor.currentStatus === "UP"
                          ? "status-up"
                          : "status-down"
                      }
                    >
                      {monitor.currentStatus}
                    </strong>
                  </div>
                  <button
                    className="check-button"
                    onClick={() => handleCheckMonitor(monitor._id)}
                    disabled={checkingMonitorId === monitor._id}
                  >
                    {checkingMonitorId === monitor._id
                      ? "Checking..."
                      : "Check"}
                  </button>

                  <button
                    className="edit-button"
                    onClick={() => {
                      setEditingMonitor(monitor);
                      setFormData({
                        name: monitor.name,
                        url: monitor.url,
                        method: monitor.method || "GET",
                      });
                      setShowEditForm(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => handleDeleteMonitor(monitor._id)}
                  >
                    Delete
                  </button>

                  <div>
                    <span>HTTP</span>
                    <strong>{monitor.lastStatusCode || "—"}</strong>
                  </div>

                  <div>
                    <span>Response</span>
                    <strong>
                      {monitor.lastResponseTime
                        ? `${monitor.lastResponseTime} ms`
                        : "—"}
                    </strong>
                  </div>
                  <div>
                    <span>Last checked</span>
                    <strong>
                      {monitor.lastCheckedAt
                        ? new Date(monitor.lastCheckedAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "—"}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>Response Time</h2>
              <p>Recent API response performance.</p>
              <select
                className="history-monitor-select"
                value={selectedMonitorId || monitors[0]?._id || ""}
                onChange={(e) => setSelectedMonitorId(e.target.value)}
              >
                {monitors.map((monitor) => (
                  <option key={monitor._id} value={monitor._id}>
                    {monitor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <p>History records: {history.length}</p>
          </div>

          <div className="chart-container">
            {history.length === 0 ? (
              <div className="empty-state">
                No monitoring history available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[...history].reverse()}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="checkedAt"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }
                    />

                    <YAxis
                      label={{
                        value: "ms",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />

                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleString()
                      }
                      formatter={(value) => [`${value} ms`, "Response Time"]}
                    />

                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;

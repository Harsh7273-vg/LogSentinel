
import { useEffect, useMemo, useState } from "react";
import "./index.css";

const API = "";

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <p className="stat-title">{title}</p>
      <h2>{value ?? "—"}</h2>
      <p className="stat-subtitle">{subtitle}</p>
    </div>
  );
}

function App() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [level, setLevel] = useState("INFO");
  const [message, setMessage] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  // Log search and filtering
  const [searchText, setSearchText] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const responses = await Promise.all([
        fetch(`${API}/api/dashboard/summary`),
        fetch(`${API}/api/logs`),
        fetch(`${API}/api/anomalies`),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Could not load dashboard data.");
      }

      const [summaryData, logsData, anomalyData] =
        await Promise.all(responses.map((response) => response.json()));

      setSummary(summaryData);
      setLogs(logsData.logs || []);
      setAnomalies(anomalyData.anomalies || []);
    } catch {
      setError(
        "Unable to connect to the backend. Check that FastAPI is running on port 8000 and the frontend proxy is configured."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleAddLog(event) {
    event.preventDefault();
    setSubmitError("");
    setResult(null);

    if (!message.trim()) {
      setSubmitError("Please enter a log message.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          message: message.trim(),
          source: source.trim() || "unknown",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to submit the log."
        );
      }

      setResult(data);
      setMessage("");
      setSource("");

      // Show the newly submitted log in the Application Logs tab.
      setActiveTab("logs");
      setSearchText("");
      setLevelFilter("ALL");
      setSourceFilter("ALL");
      setRiskFilter("ALL");

      await loadDashboard();
    } catch (err) {
      setSubmitError(
        err.message || "Unable to submit the log. Check the backend."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "—";
    const date = new Date(timestamp);

    return Number.isNaN(date.getTime())
      ? timestamp
      : date.toLocaleString();
  }

  const displayedLogs = useMemo(() => {
    const records =
      activeTab === "anomalies" ? anomalies : logs;

    const query = searchText.trim().toLowerCase();

    return records.filter((log) => {
      const matchesSearch =
        !query ||
        [log.message, log.source, log.level, log.risk_level]
          .some((value) =>
            String(value ?? "").toLowerCase().includes(query)
          ) ||
        (log.reasons || []).some((reason) =>
          String(reason).toLowerCase().includes(query)
        );

      const matchesLevel =
        levelFilter === "ALL" ||
        (log.level || "").toUpperCase() === levelFilter;

      const matchesSource =
        sourceFilter === "ALL" ||
        (log.source || "unknown") === sourceFilter;

      const matchesRisk =
        riskFilter === "ALL" ||
        (log.risk_level || "low").toLowerCase() ===
          riskFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesLevel &&
        matchesSource &&
        matchesRisk
      );
    });
  }, [
    logs,
    anomalies,
    activeTab,
    searchText,
    levelFilter,
    sourceFilter,
    riskFilter,
  ]);

  const availableSources = useMemo(() => {
    const sources = logs.map((log) => log.source || "unknown");
    return [...new Set(sources)].sort((a, b) => a.localeCompare(b));
  }, [logs]);

  function resetFilters() {
    setSearchText("");
    setLevelFilter("ALL");
    setSourceFilter("ALL");
    setRiskFilter("ALL");
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d7dce5",
    borderRadius: "8px",
    background: "#fff",
    color: "#172033",
    font: "inherit",
  };

  const filterLabelStyle = {
    display: "block",
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 600,
    color: "#475467",
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">⌁</div>
          <div>
            <h2>Log<span>Sentinel</span></h2>
            <p>INTELLIGENT MONITORING</p>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>

        <button
          className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span>▦</span> Overview
        </button>

        <button
          className={`nav-item ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          <span>▤</span> Application Logs
        </button>

        <button
          className={`nav-item ${activeTab === "anomalies" ? "active" : ""}`}
          onClick={() => setActiveTab("anomalies")}
        >
          <span>⚠</span> Detected Anomalies
          {anomalies.length > 0 && (
            <span className="nav-count">{anomalies.length}</span>
          )}
        </button>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            <div>
              <strong>Monitoring service</strong>
              <p>
                {error
                  ? "Connection issue"
                  : loading
                    ? "Connecting..."
                    : "Dashboard loaded"}
              </p>
            </div>
          </div>
          <p className="sidebar-version">
            INTELLIGENT LOG ANALYZER · v1.0
          </p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Monitoring</p>
            <h1>
              {activeTab === "overview"
                ? "Security Overview"
                : activeTab === "logs"
                  ? "Application Logs"
                  : "Detected Anomalies"}
            </h1>
          </div>

          <button
            className="refresh-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            <span>{loading ? "◌" : "↻"}</span>
            {loading ? "Loading..." : "Refresh data"}
          </button>
        </header>

        {error && (
          <div className="error-banner">
            <strong>Connection error</strong>
            <p>{error}</p>
            <button onClick={loadDashboard}>Try again</button>
          </div>
        )}

        {activeTab !== "anomalies" && (
          <section className="panel" style={{ marginBottom: 24 }}>
            <div className="panel-header">
              <div>
                <h3>Add New Log</h3>
                <p>Submit a log for analysis and risk classification.</p>
              </div>
              <span className="panel-symbol">＋</span>
            </div>

            <form onSubmit={handleAddLog}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <label>
                  <span style={{ display: "block", marginBottom: 7 }}>
                    Severity
                  </span>
                  <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    style={inputStyle}
                    disabled={submitting}
                  >
                    {["INFO", "WARNING", "ERROR", "CRITICAL", "FATAL"].map(
                      (item) => (
                        <option key={item} value={item}>{item}</option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  <span style={{ display: "block", marginBottom: 7 }}>
                    Source
                  </span>
                  <input
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                    placeholder="e.g. auth-service"
                    maxLength={200}
                    style={inputStyle}
                    disabled={submitting}
                  />
                </label>
              </div>

              <label>
                <span style={{ display: "block", marginBottom: 7 }}>
                  Log Message
                </span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Enter the application log message..."
                  minLength={1}
                  maxLength={5000}
                  rows={4}
                  required
                  style={{ ...inputStyle, resize: "vertical" }}
                  disabled={submitting}
                />
              </label>

              {submitError && (
                <div
                  role="alert"
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 8,
                    background: "#fff0f0",
                    color: "#b42318",
                  }}
                >
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: 16,
                  padding: "11px 20px",
                  border: 0,
                  borderRadius: 8,
                  background: submitting ? "#7b8495" : "#3949ab",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: submitting ? "wait" : "pointer",
                }}
              >
                {submitting ? "Analyzing log..." : "Submit & Analyze Log"}
              </button>
            </form>

            {result && (
              <div
                role="status"
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#172033",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Analysis Result</h3>
                <p><strong>Status:</strong> {result.message}</p>
                <p><strong>Log ID:</strong> {result.log_id}</p>
                <p>
                  <strong>Anomaly detected:</strong>{" "}
                  {result.analysis?.is_anomaly ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Risk level:</strong>{" "}
                  {result.analysis?.risk_level ?? "Not provided"}
                </p>
                <p>
                  <strong>Reasons:</strong>{" "}
                  {result.analysis?.reasons?.length
                    ? result.analysis.reasons.join(", ")
                    : "No reasons provided by the detector."}
                </p>
              </div>
            )}
          </section>
        )}

        {activeTab === "overview" && (
          <>
            <section className="welcome-panel">
              <div>
                <div className="eyebrow">
                  <span className="status-dot" />
                  LOG MONITORING SYSTEM
                </div>
                <h2>
                  Understand your logs.
                  <br />
                  Detect anomalies earlier.
                </h2>
                <p>
                  Monitor application activity and investigate unusual
                  log patterns from one dashboard.
                </p>
              </div>
              <div className="welcome-art" aria-hidden="true">
                <div className="art-ring ring-one" />
                <div className="art-ring ring-two" />
                <div className="art-center">⌁</div>
                <span className="art-node node-one">01</span>
                <span className="art-node node-two">AI</span>
                <span className="art-node node-three">!</span>
              </div>
            </section>

            <section className="stats-grid">
              <StatCard title="Total Logs" value={summary?.total_logs}
                subtitle="Logs stored in database" icon="▤" color="blue" />
              <StatCard title="Detected Anomalies" value={summary?.anomaly_logs}
                subtitle="Logs matching detection rules" icon="⌁" color="purple" />
              <StatCard title="Error Logs" value={summary?.error_logs}
                subtitle="Error, critical and fatal levels" icon="!"
                color="red" />
              <StatCard title="High-Risk Logs" value={summary?.high_risk_logs}
                subtitle="Logs classified as high risk" icon="⚠"
                color="orange" />
            </section>

            <section className="content-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Severity Breakdown</h3>
                    <p>Distribution of stored log levels</p>
                  </div>
                  <span className="panel-symbol">▥</span>
                </div>

                {loading && !summary ? (
                  <p className="empty-state">Loading statistics...</p>
                ) : summary?.severity_breakdown?.length ? (
                  <div className="breakdown-list">
                    {summary.severity_breakdown.map((item) => {
                      const percent =
                        (item.count / (summary.total_logs || 1)) * 100;

                      return (
                        <div className="breakdown-item" key={item.level}>
                          <div className="breakdown-label">
                            <span>{item.level}</span>
                            <strong>{item.count}</strong>
                          </div>
                          <div className="progress-track">
                            <div
                              className={`progress-fill ${item.level.toLowerCase()}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="empty-state">No logs available yet.</p>
                )}
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Risk Distribution</h3>
                    <p>Saved detector classifications</p>
                  </div>
                  <span className="panel-symbol">◉</span>
                </div>

                {summary?.risk_breakdown?.length ? (
                  <div className="risk-list">
                    {summary.risk_breakdown.map((item) => (
                      <div className="risk-item" key={item.risk_level}>
                        <span className={`risk-dot ${item.risk_level}`} />
                        <span className="risk-name">
                          {item.risk_level.toUpperCase()}
                        </span>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">
                    {loading ? "Loading risk data..." : "No risk data available."}
                  </p>
                )}

                <div className="info-note">
                  <span>ⓘ</span>
                  <p>
                    Risk levels are assigned by the current rule-based
                    detector, not necessarily a trained ML model.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {(activeTab === "logs" || activeTab === "anomalies") && (
          <section className="panel table-panel">
            <div className="panel-header">
              <div>
                <h3>
                  {activeTab === "anomalies"
                    ? "Suspicious Log Records"
                    : "Latest Application Logs"}
                </h3>
                <p>
                  Showing {displayedLogs.length} of{" "}
                  {(activeTab === "anomalies" ? anomalies : logs).length}{" "}
                  records
                </p>
              </div>
              <span className="panel-symbol">▤</span>
            </div>

            {/* Search and filters */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <label>
                <span style={filterLabelStyle}>Search logs</span>
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search message, source, reason..."
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={filterLabelStyle}>Severity</span>
                <select
                  value={levelFilter}
                  onChange={(event) => setLevelFilter(event.target.value)}
                  style={inputStyle}
                >
                  <option value="ALL">All severities</option>
                  {["INFO", "WARNING", "ERROR", "CRITICAL", "FATAL"].map(
                    (item) => (
                      <option key={item} value={item}>{item}</option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span style={filterLabelStyle}>Source</span>
                <select
                  value={sourceFilter}
                  onChange={(event) => setSourceFilter(event.target.value)}
                  style={inputStyle}
                >
                  <option value="ALL">All sources</option>
                  {availableSources.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                <span style={filterLabelStyle}>Risk level</span>
                <select
                  value={riskFilter}
                  onChange={(event) => setRiskFilter(event.target.value)}
                  style={inputStyle}
                >
                  <option value="ALL">All risk levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  padding: "8px 13px",
                  border: "1px solid #d7dce5",
                  borderRadius: 8,
                  background: "#fff",
                  cursor: "pointer",
                  color: "#344054",
                  fontWeight: 600,
                }}
              >
                Clear filters
              </button>
            </div>

            {loading && displayedLogs.length === 0 ? (
              <p className="empty-state">Loading records...</p>
            ) : displayedLogs.length === 0 ? (
              <p className="empty-state">
                No matching logs. Try changing the search or filters.
              </p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>TIME</th>
                      <th>LEVEL</th>
                      <th>MESSAGE</th>
                      <th>SOURCE</th>
                      <th>RISK</th>
                      {activeTab === "anomalies" && <th>REASONS</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="time-cell">{formatDate(log.timestamp)}</td>
                        <td>
                          <span className={`level-badge ${(log.level || "").toLowerCase()}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="message-cell">{log.message}</td>
                        <td>{log.source || "unknown"}</td>
                        <td>
                          <span className={`risk-badge ${(log.risk_level || "low").toLowerCase()}`}>
                            {log.risk_level || "low"}
                          </span>
                        </td>
                        {activeTab === "anomalies" && (
                          <td className="reasons-cell">
                            {(log.reasons || []).join(", ") || "No reasons recorded"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          <span>Intelligent Log Anomaly Analyzer</span>
          <span>FastAPI · React · SQLite</span>
        </footer>
      </main>
    </div>
  );
}

export default App;

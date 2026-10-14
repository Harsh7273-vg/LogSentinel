# Intelligent Log Anomaly Analyzer

An application log analysis tool that identifies potentially unusual logs, highlights risk levels, and provides possible root-cause hints using explainable, rule-based detection.

## Overview

The Intelligent Log Anomaly Analyzer helps developers monitor application logs and identify potential operational issues. It provides a dashboard for viewing logs, detected anomalies, and summary analytics.

## Features

- **Log Collection:** Submit application logs with severity, message, and source.
- **Anomaly Detection:** Identify potential issues using severity levels, error keywords, and suspicious patterns.
- **Risk Classification:** Classify detected issues as low, medium, or high risk.
- **Root-Cause Hints:** Display possible explanations for recognized error patterns.
- **Dashboard:** View log summaries and anomaly information.
- **Analytics:** Review severity breakdowns, error sources, and hourly trends.
- **Persistent Storage:** Store log records in SQLite.
- **Input Validation:** Reject invalid requests, such as empty messages or missing required fields.
- **REST API:** Access backend functionality through FastAPI endpoints.

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript

**Backend**
- Python
- FastAPI
- Pydantic
- SQLite
- Uvicorn

**Detection**
- Python rule-based detection
- Regular expressions and keyword matching

## Project Structure

```text
intelligent-log-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── anomaly_detector.py
│   └── logs.db
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── .venv/
└── README.md
```

*Note: This is a simplified overview. Your actual project may contain additional files and folders.*

## Getting Started

### Prerequisites

- Python installed
- Node.js and npm installed
- Git (optional, for version control)

### 1. Set Up the Backend

Open a terminal in the project root.

Activate the existing virtual environment in Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Move into the backend directory:

```powershell
cd backend
```

Start the FastAPI server:

```powershell
python -m uvicorn app.main:app --reload
```

The backend should be available at:

- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs

Keep this terminal running.

### 2. Set Up the Frontend

Open a second terminal and move into the frontend directory:

```powershell
cd "$HOME\OneDrive\Desktop\intelligent-log-analyzer\frontend"
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open the local URL printed in the terminal by Vite.

Keep the frontend and backend running in separate terminals.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Basic API information |
| GET | `/health` | Health check |
| POST | `/api/logs` | Submit and analyze a log |
| GET | `/api/logs` | Retrieve stored logs |
| GET | `/api/dashboard/summary` | Retrieve dashboard summary |
| GET | `/api/anomalies` | Retrieve detected anomalies |
| GET | `/api/analytics` | Retrieve analytics data |

## Example: Submit a Log

Send a POST request to:

`http://127.0.0.1:8000/api/logs`

Example JSON:

```json
{
  "level": "CRITICAL",
  "message": "Database connection failed: connection refused",
  "source": "database-service"
}
```

The API returns the saved log ID and an analysis containing the anomaly flag, risk level, and detection reasons.

## Detection Approach

The current detector uses explainable rules based on:

1. Log severity, such as ERROR and CRITICAL.
2. Error-related keywords, such as failure, timeout, and connection refused.
3. Suspicious operational patterns.
4. Root-cause hints matched against known error patterns.

The detector is rule-based; it is not currently a trained machine-learning model. Root-cause hints are possible explanations, not confirmed diagnoses.

## Validation and Testing

The following scenarios have been tested during development:

- Normal INFO log: not classified as an anomaly.
- Critical database failure: classified as a high-risk anomaly.
- Database connection timeout: classified as a medium-risk anomaly.
- Empty message: rejected by request validation.
- Missing required severity: rejected by request validation.
- Frontend log submission and dashboard refresh: verified during development.

## Future Improvements

- Add automated unit and integration tests.
- Improve detection rules and reduce false positives.
- Add configurable detection thresholds.
- Add authentication and access control where needed.
- Add deployment instructions and monitoring.
- Evaluate whether statistical or machine-learning-based anomaly detection would improve results.

## Disclaimer

This project is a development tool for identifying potentially unusual application logs. Detection results depend on the configured rules and log content. It should not be treated as a substitute for comprehensive production monitoring or incident investigation.

## Author

Add your name and relevant project links here.

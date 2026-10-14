# LogSentinel — Intelligent Log Anomaly Analyzer

An application log monitoring and analysis tool that identifies potentially unusual logs, classifies risk levels, and provides explainable root-cause hints using rule-based anomaly detection.

## Overview

LogSentinel helps developers monitor application logs and identify potential operational issues through a web-based dashboard. It combines a React frontend with a FastAPI backend to collect logs, analyze suspicious patterns, store results, and present useful monitoring analytics.

## Features

- **Log Collection:** Submit application logs with severity, message, and source.
- **Rule-Based Anomaly Detection:** Identify potential issues using severity levels, keywords, and suspicious patterns.
- **Risk Classification:** Categorize detected issues into low, medium, and high risk.
- **Root-Cause Hints:** Provide possible explanations for recognized error patterns.
- **Monitoring Dashboard:** View log summaries, application logs, and detected anomalies.
- **Analytics:** Review severity breakdowns, error sources, and hourly trends.
- **Persistent Storage:** Store log records and analysis results in SQLite.
- **Input Validation:** Validate incoming requests using Pydantic.
- **REST API:** Access monitoring and analysis functionality through FastAPI endpoints.

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Python
- FastAPI
- Pydantic
- SQLite
- Uvicorn

**Detection**
- Rule-based detection
- Keyword matching
- Regular expressions
- Explainable detection reasons and root-cause hints

## Project Structure

```text
intelligent-log-analyzer/
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       └── anomaly_detector.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

The SQLite database is created at runtime. The virtual environment, local database, and generated files are excluded from version control where configured.

## Getting Started

### Prerequisites

- Python 3.10 or a compatible version
- Node.js and npm
- Git (optional, for cloning the repository)

### 1. Clone the Repository

```bash
git clone https://github.com/Harsh7273-vg/LogSentinel.git
cd LogSentinel
```

Alternatively, open your existing local project folder.

### 2. Set Up the Backend

Create a Python virtual environment from the project root:

```powershell
python -m venv .venv
```

Activate it in Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
python -m pip install fastapi uvicorn pydantic
```

Start the backend from the project root:

```powershell
python -m uvicorn app.main:app --reload --app-dir backend
```

The backend should be available at:

- API base: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

Keep this terminal running.

### 3. Set Up the Frontend

Open a second terminal in the project root and run:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

http://localhost:5173

Keep both development servers running.

**Note:** The frontend relies on the development proxy configuration for API requests. If the dashboard cannot connect to the backend, verify `frontend/vite.config.js` and ensure the proxy targets `http://127.0.0.1:8000`.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Basic API information |
| GET | `/health` | Health check |
| POST | `/api/logs` | Submit and analyze a log |
| GET | `/api/logs` | Retrieve stored logs |
| GET | `/api/dashboard/summary` | Retrieve dashboard statistics |
| GET | `/api/anomalies` | Retrieve detected anomalies |
| GET | `/api/analytics` | Retrieve analytics and hourly trends |

For request schemas and interactive testing, open `/docs` while the backend is running.

## Example: Submit a Log

Send a POST request to:

`http://127.0.0.1:8000/api/logs`

Example JSON body:

```json
{
  "level": "CRITICAL",
  "message": "Database connection failed: connection refused",
  "source": "database-service"
}
```

The API processes the submitted log, stores the record, and returns its ID and analysis results, including the anomaly flag, risk level, and detection reasons.

## Detection Approach

The current detector uses explainable rules based on:

1. **Severity:** Log levels such as ERROR and CRITICAL.
2. **Keywords:** Terms such as failure, timeout, and connection refused.
3. **Suspicious patterns:** Recognized operational error patterns.
4. **Root-cause hints:** Possible explanations associated with matching patterns.

This version uses rule-based detection, not a trained machine-learning model. Anomaly results and root-cause hints are indicators for investigation, not confirmed diagnoses.

## Validation and Testing

During development, the following functionality was tested:

- Normal INFO log handling.
- Detection of an ERROR log containing `connection refused`.
- Detection of a CRITICAL log containing `out of memory`.
- Log submission and retrieval through the REST API.
- Dashboard summary and analytics endpoints.
- Frontend integration with the backend.
- Display of application logs and detected anomalies.

These checks reflect development testing and do not constitute comprehensive automated or production testing.

## Future Improvements

- Add automated unit and integration tests.
- Improve detection rules and reduce false positives.
- Introduce configurable detection thresholds.
- Evaluate statistical or machine-learning-based anomaly detection.
- Add authentication and role-based access control.
- Add deployment instructions and production monitoring.
- Improve observability, error handling, and scalability.

## Disclaimer

LogSentinel is a development tool for identifying potentially unusual application logs. Its results depend on configured rules and log content. It is not a substitute for comprehensive production monitoring, security controls, or incident investigation.

## Author

**Harsh Dubey**

- GitHub: https://github.com/Harsh7273-vg
- Project Repository: https://github.com/Harsh7273-vg/LogSentinel

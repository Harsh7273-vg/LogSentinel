# LogSentinel — Intelligent Log Anomaly Analyzer

An application log monitoring and analysis tool that identifies potentially suspicious log patterns, classifies risk, and provides explainable anomaly hints through a web dashboard.

## Overview

LogSentinel is a full-stack application built with React and FastAPI. It allows users to submit application logs, inspect stored records, identify potentially anomalous events, and view monitoring analytics.

The current anomaly detection approach is **rule-based**. It uses configured rules and suspicious keywords rather than a trained machine learning model.

## Features

- **Log Collection:** Submit log severity, message, and source.
- **Rule-Based Anomaly Detection:** Identify configured suspicious keywords and patterns.
- **Risk Classification:** Classify detected events according to the application's configured rules.
- **Explainable Results:** Display reasons or hints associated with detected patterns.
- **Dashboard:** View submitted logs and detected anomalies.
- **Analytics:** Review available severity summaries, error sources, and time-based trends.
- **Persistent Storage:** Store log records in SQLite.
- **Input Validation:** Validate request data with Pydantic.
- **REST API:** Provide backend endpoints using FastAPI.

## Tech Stack

**Frontend**
- React
- JavaScript
- Vite
- CSS

**Backend**
- Python
- FastAPI
- Pydantic
- SQLite
- Uvicorn

**Detection**
- Rule-based pattern matching
- Keyword matching
- Explainable anomaly hints

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
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
├── .gitignore
└── README.md
```

SQLite database files and the Python virtual environment are generated or maintained locally and should not be committed to Git.

## Prerequisites

- Python 3.10 or newer
- Node.js and npm
- Git (for cloning the repository)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Harsh7273-vg/LogSentinel.git
cd LogSentinel
```

### 2. Set up the backend

Create and activate a virtual environment from the project root.

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
python -m pip install fastapi uvicorn pydantic
```

Start the backend:

```powershell
python -m uvicorn app.main:app --reload --app-dir backend
```

The backend should be available at:

- API base: `http://127.0.0.1:8000/`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

Keep this terminal running while using the application.

### 3. Set up the frontend

Open a second terminal at the project root and run:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173/`

Keep the frontend and backend running in separate terminals.

## API Documentation

FastAPI provides interactive API documentation at:

`http://127.0.0.1:8000/docs`

Use the documentation to inspect the endpoints actually registered by the running backend, their request schemas, and their responses.

The application's intended workflow includes submitting logs, retrieving stored records, and viewing dashboard or anomaly information where those routes are implemented.

## Example Log Request

Example JSON body for a log submission endpoint that accepts these fields:

```json
{
  "level": "CRITICAL",
  "message": "Database connection failed: connection refused",
  "source": "database-service"
}
```

Check the API documentation for the exact route and accepted values before sending a request.

## How Anomaly Detection Works

The current implementation uses configurable rules and suspicious-pattern matching. For example, messages containing terms such as `failure`, `timeout`, or `connection refused` may be considered suspicious if the corresponding rules are enabled.

The detector can provide hints to help investigate unusual events. These results are **indicators for investigation, not confirmed root-cause diagnoses**.

This version should not be described as a trained ML model unless a machine learning detector is implemented and evaluated separately.

## Testing and Verification

During development, the application workflow was checked for:

- Starting the backend and opening the API documentation.
- Opening the frontend dashboard.
- Submitting a log through the application.
- Displaying a detection result.
- Checking persistence after a page refresh.
- Reviewing dashboard and analytics behavior.

These checks are development verification, not a claim of comprehensive automated testing or production readiness.

## Future Improvements

- Add automated unit and API integration tests.
- Refine detection rules and evaluate false positives.
- Add configurable thresholds and detection settings.
- Explore statistical or machine learning anomaly detection.
- Add authentication and role-based access control.
- Improve deployment, monitoring, and scalability.

## Disclaimer

LogSentinel is a development project intended for log analysis and investigation support. Detection results may be incomplete or incorrect and should be reviewed by a human.

## Author

**Harsh Dubey**

GitHub: [Harsh7273-vg](https://github.com/Harsh7273-vg)

Repository: [LogSentinel](https://github.com/Harsh7273-vg/LogSentinel)

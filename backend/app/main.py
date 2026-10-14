
from datetime import datetime, timezone, timedelta
import json
import sqlite3

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.anomaly_detector import detect_anomaly


app = FastAPI(
    title="Intelligent Log Anomaly Analyzer",
    description=(
        "Receive, store, analyze, and summarize application logs."
    ),
    version="1.4.0",
)

DB_PATH = "logs.db"


# Initialize database and support existing databases
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                level TEXT NOT NULL,
                message TEXT NOT NULL,
                source TEXT NOT NULL,
                is_anomaly INTEGER NOT NULL DEFAULT 0,
                risk_level TEXT NOT NULL DEFAULT 'low',
                reasons TEXT NOT NULL DEFAULT '[]'
            )
        """)

        columns = {
            row[1]
            for row in conn.execute(
                "PRAGMA table_info(logs)"
            ).fetchall()
        }

        if "is_anomaly" not in columns:
            conn.execute("""
                ALTER TABLE logs
                ADD COLUMN is_anomaly INTEGER NOT NULL DEFAULT 0
            """)

        if "risk_level" not in columns:
            conn.execute("""
                ALTER TABLE logs
                ADD COLUMN risk_level TEXT NOT NULL DEFAULT 'low'
            """)

        if "reasons" not in columns:
            conn.execute("""
                ALTER TABLE logs
                ADD COLUMN reasons TEXT NOT NULL DEFAULT '[]'
            """)


init_db()


# Request model
class LogEntry(BaseModel):
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    level: str = Field(min_length=1, max_length=20)
    message: str = Field(min_length=1, max_length=5000)
    source: str = Field(default="unknown", max_length=200)


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Intelligent Log Anomaly Analyzer is running!",
        "status": "success",
        "version": "1.4.0",
    }


# Health check
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "log-analyzer-backend",
    }


# Analyze and save an incoming log
@app.post("/api/logs")
def receive_log(log: LogEntry):
    analysis = detect_anomaly(
        level=log.level,
        message=log.message,
    )

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute(
                """
                INSERT INTO logs (
                    timestamp,
                    level,
                    message,
                    source,
                    is_anomaly,
                    risk_level,
                    reasons
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    log.timestamp.isoformat(),
                    log.level.upper(),
                    log.message,
                    log.source,
                    int(analysis["is_anomaly"]),
                    analysis["risk_level"],
                    json.dumps(analysis["reasons"]),
                ),
            )

            log_id = cursor.lastrowid

    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=500,
            detail="Failed to save log to the database.",
        ) from exc

    return {
        "status": "received",
        "log_id": log_id,
        "message": "Log saved and analyzed successfully",
        "analysis": analysis,
    }


# Retrieve the latest 100 logs
@app.get("/api/logs")
def get_logs():
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row

        rows = conn.execute("""
            SELECT
                id,
                timestamp,
                level,
                message,
                source,
                is_anomaly,
                risk_level,
                reasons
            FROM logs
            ORDER BY id DESC
            LIMIT 100
        """).fetchall()

    logs = []

    for row in rows:
        item = dict(row)
        item["is_anomaly"] = bool(item["is_anomaly"])
        item["reasons"] = json.loads(item["reasons"])
        logs.append(item)

    return {
        "count": len(logs),
        "logs": logs,
    }


# Dashboard summary
@app.get("/api/dashboard/summary")
def dashboard_summary():
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row

        total_logs = conn.execute(
            "SELECT COUNT(*) FROM logs"
        ).fetchone()[0]

        error_logs = conn.execute("""
            SELECT COUNT(*)
            FROM logs
            WHERE UPPER(level) IN ('ERROR', 'CRITICAL', 'FATAL')
        """).fetchone()[0]

        warning_logs = conn.execute("""
            SELECT COUNT(*)
            FROM logs
            WHERE UPPER(level) IN ('WARNING', 'WARN')
        """).fetchone()[0]

        anomaly_logs = conn.execute("""
            SELECT COUNT(*)
            FROM logs
            WHERE is_anomaly = 1
        """).fetchone()[0]

        high_risk_logs = conn.execute("""
            SELECT COUNT(*)
            FROM logs
            WHERE LOWER(risk_level) = 'high'
        """).fetchone()[0]

        severity_rows = conn.execute("""
            SELECT UPPER(level) AS level, COUNT(*) AS count
            FROM logs
            GROUP BY UPPER(level)
            ORDER BY count DESC
        """).fetchall()

        risk_rows = conn.execute("""
            SELECT LOWER(risk_level) AS risk_level, COUNT(*) AS count
            FROM logs
            GROUP BY LOWER(risk_level)
            ORDER BY count DESC
        """).fetchall()

    return {
        "total_logs": total_logs,
        "error_logs": error_logs,
        "warning_logs": warning_logs,
        "anomaly_logs": anomaly_logs,
        "high_risk_logs": high_risk_logs,
        "severity_breakdown": [
            dict(row) for row in severity_rows
        ],
        "risk_breakdown": [
            dict(row) for row in risk_rows
        ],
    }


# Retrieve only detected anomalies
@app.get("/api/anomalies")
def get_anomalies():
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row

        rows = conn.execute("""
            SELECT
                id,
                timestamp,
                level,
                message,
                source,
                risk_level,
                reasons
            FROM logs
            WHERE is_anomaly = 1
            ORDER BY id DESC
        """).fetchall()

    anomalies = []

    for row in rows:
        item = dict(row)
        item["reasons"] = json.loads(item["reasons"])
        anomalies.append(item)

    return {
        "count": len(anomalies),
        "anomalies": anomalies,
    }


# Analytics endpoint
@app.get("/api/analytics")
def get_analytics():
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=24)

    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row

            # Overall statistics
            overall = conn.execute("""
                SELECT
                    COUNT(*) AS total_logs,
                    COALESCE(SUM(is_anomaly), 0) AS total_anomalies,
                    COALESCE(SUM(
                        CASE
                            WHEN UPPER(level)
                                IN ('ERROR', 'CRITICAL', 'FATAL')
                            THEN 1 ELSE 0
                        END
                    ), 0) AS total_error_logs
                FROM logs
            """).fetchone()

            total_logs = overall["total_logs"]
            total_anomalies = overall["total_anomalies"]

            anomaly_percentage = (
                round(total_anomalies / total_logs * 100, 2)
                if total_logs else 0.0
            )

            # Sources ranked by error count
            top_error_sources = conn.execute("""
                SELECT
                    source,
                    COUNT(*) AS error_count,
                    SUM(is_anomaly) AS anomaly_count
                FROM logs
                WHERE UPPER(level)
                    IN ('ERROR', 'CRITICAL', 'FATAL')
                GROUP BY source
                ORDER BY error_count DESC, source ASC
                LIMIT 10
            """).fetchall()

            # Severity counts
            severity_rows = conn.execute("""
                SELECT
                    UPPER(level) AS level,
                    COUNT(*) AS count
                FROM logs
                GROUP BY UPPER(level)
                ORDER BY count DESC
            """).fetchall()

            # Read logs for the previous 24 hours.
            # Timestamps are stored as ISO-formatted strings.
            recent_rows = conn.execute("""
                SELECT timestamp, is_anomaly
                FROM logs
                WHERE timestamp >= ?
                ORDER BY timestamp ASC
            """, (cutoff.isoformat(),)).fetchall()

        # Prepare 24 hourly buckets in UTC.
        hourly_buckets = {}

        current_hour = now.replace(
            minute=0, second=0, microsecond=0
        )

        for hours_ago in range(23, -1, -1):
            bucket_time = current_hour - timedelta(hours=hours_ago)
            bucket_key = bucket_time.strftime("%Y-%m-%dT%H:00:00Z")

            hourly_buckets[bucket_key] = {
                "hour": bucket_key,
                "logs": 0,
                "anomalies": 0,
            }

        for row in recent_rows:
            try:
                timestamp = datetime.fromisoformat(
                    row["timestamp"].replace("Z", "+00:00")
                )

                if timestamp.tzinfo is None:
                    timestamp = timestamp.replace(tzinfo=timezone.utc)
                else:
                    timestamp = timestamp.astimezone(timezone.utc)

                bucket_time = timestamp.replace(
                    minute=0, second=0, microsecond=0
                )
                bucket_key = bucket_time.strftime(
                    "%Y-%m-%dT%H:00:00Z"
                )

                if bucket_key in hourly_buckets:
                    hourly_buckets[bucket_key]["logs"] += 1

                    if row["is_anomaly"]:
                        hourly_buckets[bucket_key]["anomalies"] += 1

            except (ValueError, TypeError):
                # Skip timestamps that cannot be parsed.
                continue

        return {
            "period": "last_24_hours",
            "timezone": "UTC",
            "overview": {
                "total_logs": total_logs,
                "total_anomalies": total_anomalies,
                "total_error_logs": overall["total_error_logs"],
                "anomaly_percentage": anomaly_percentage,
            },
            "severity_breakdown": [
                dict(row) for row in severity_rows
            ],
            "top_error_sources": [
                {
                    "source": row["source"],
                    "error_count": row["error_count"],
                    "anomaly_count": row["anomaly_count"] or 0,
                }
                for row in top_error_sources
            ],
            "hourly_trends": list(hourly_buckets.values()),
        }

    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate analytics.",
        ) from exc

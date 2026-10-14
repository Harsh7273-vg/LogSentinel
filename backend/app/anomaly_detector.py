
import re


ERROR_KEYWORDS = [
    "failed",
    "failure",
    "exception",
    "critical",
    "traceback",
    "connection refused",
    "out of memory",
    "timeout",
    "timed out",
    "unhandled error",
    "service unavailable",
    "deadlock",
]

SUSPICIOUS_PATTERNS = [
    r"authentication failed",
    r"unauthorized access",
    r"too many requests",
    r"permission denied",
    r"invalid credentials",
    r"access denied",
    r"connection refused",
    r"out of memory",
    r"service unavailable",
]

ROOT_CAUSE_HINTS = [
    (
        r"authentication failed|invalid credentials",
        "Possible root cause: Invalid credentials or an authentication configuration issue.",
    ),
    (
        r"unauthorized access|permission denied|access denied",
        "Possible root cause: Insufficient permissions or an access-control configuration issue.",
    ),
    (
        r"connection refused",
        "Possible root cause: The target service may be stopped, unreachable, or listening on a different port.",
    ),
    (
        r"out of memory|memory exhausted",
        "Possible root cause: The application may have insufficient available memory.",
    ),
    (
        r"timeout|timed out",
        "Possible root cause: A slow response, network delay, or an unresponsive dependency.",
    ),
    (
        r"too many requests|rate limit",
        "Possible root cause: The request rate may have exceeded the service limit.",
    ),
    (
        r"deadlock",
        "Possible root cause: Competing operations may be waiting on each other's resources.",
    ),
    (
        r"service unavailable",
        "Possible root cause: The service may be temporarily unavailable or overloaded.",
    ),
    (
        r"exception|traceback|unhandled error",
        "Possible root cause: An unhandled exception or application logic error.",
    ),
    (
        r"database|sql|query",
        "Possible root cause: A database operation, query, or connectivity problem.",
    ),
]


def detect_anomaly(level: str, message: str) -> dict:
    """
    Explainable rule-based log anomaly detection.

    Returns:
        is_anomaly: Whether the log matches anomaly rules.
        risk_level: low, medium, or high.
        reasons: Detection reasons and possible root-cause hints.
    """

    normalized_level = (level or "").strip().upper()
    normalized_message = (message or "").strip().lower()

    reasons = []

    def add_reason(reason: str) -> None:
        if reason not in reasons:
            reasons.append(reason)

    # 1. Detect by severity
    if normalized_level in {"CRITICAL", "FATAL"}:
        add_reason("Critical severity log")
    elif normalized_level == "ERROR":
        add_reason("Error severity log")

    # 2. Match error keywords using word boundaries where applicable
    for keyword in ERROR_KEYWORDS:
        pattern = rf"(?<!\w){re.escape(keyword)}(?!\w)"
        if re.search(pattern, normalized_message):
            add_reason(f"Matched keyword: {keyword}")

    # 3. Check suspicious patterns
    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, normalized_message, re.IGNORECASE):
            add_reason(f"Matched suspicious pattern: {pattern}")

    # 4. Add a possible root-cause hint
    for pattern, hint in ROOT_CAUSE_HINTS:
        if re.search(pattern, normalized_message, re.IGNORECASE):
            add_reason(hint)
            break

    # 5. Determine anomaly status
    is_anomaly = bool(reasons)

    # 6. Assign risk level
    if normalized_level in {"CRITICAL", "FATAL"}:
        risk_level = "high"
    elif is_anomaly:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "is_anomaly": is_anomaly,
        "risk_level": risk_level,
        "reasons": reasons,
    }

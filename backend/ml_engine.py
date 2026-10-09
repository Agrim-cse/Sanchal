"""
Sanchal — ML Slippage & Delay Prediction Engine (Phase 2)
==========================================================
Uses LightGBM (gradient-boosted trees) to predict the probability that
a public works project will miss its deadline.

Training data: Synthetic DataFrame generated from seeded project specs.
Model artefact: saved to data/delay_model.pkl via joblib.

Key functions:
    train_and_save_model()             — builds & persists the model
    predict_delay_risk(project: dict)  — returns Delay_Risk_Score (0-100 %)
"""

import os
import json
import random
import logging

logger = logging.getLogger("sanchal.ml_engine")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "data", "delay_model.pkl")

# ---------------------------------------------------------------------------
# Lazy imports — degrade gracefully if heavy ML deps not yet installed
# ---------------------------------------------------------------------------
try:
    import numpy as np
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

try:
    import lightgbm as lgb
    LGBM_AVAILABLE = True
except ImportError:
    LGBM_AVAILABLE = False

try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    JOBLIB_AVAILABLE = False

try:
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import LabelEncoder
    from sklearn.metrics import roc_auc_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


# ---------------------------------------------------------------------------
# Feature engineering helpers
# ---------------------------------------------------------------------------

# Map department names → numeric code (stable encoding)
DEPT_CODES: dict[str, int] = {
    "Chennai Metro Water":   0,
    "TNEB Electricity Board": 1,
    "CMRL Metro":            2,
    "BSNL Telecom":          3,
    "PWD":                   4,
    "BMTC":                  5,
    "Other":                 6,
}

STATUS_PENALTY: dict[str, float] = {
    "CRITICAL_OVERLAP": 0.9,
    "MODERATE_RISK":    0.5,
    "ON_SCHEDULE":      0.1,
}


def _dept_code(dept: str) -> int:
    return DEPT_CODES.get(dept, 6)


def _status_penalty(status: str) -> float:
    return STATUS_PENALTY.get(status, 0.5)


def _project_to_features(project: dict) -> dict:
    """
    Convert a project dict into a flat feature dict for model inference.

    Expected keys (all optional — defaults applied if missing):
        contractor_id, department, project_scope_size, estimated_cost_cr,
        avg_delay_days, monsoon_months_overlap, status, delay_risk_score
    """
    from datetime import date

    # ── Compute project duration in days ───────────────────────────────────
    try:
        start = date.fromisoformat(project.get("start_date", "2026-01-01"))
        end   = date.fromisoformat(project.get("end_date",   "2026-03-01"))
        duration_days = max(1, (end - start).days)
    except (ValueError, TypeError):
        duration_days = 60

    # ── Monsoon overlap heuristic (Jun–Nov is monsoon season in Chennai) ───
    try:
        start = date.fromisoformat(project.get("start_date", "2026-01-01"))
        end   = date.fromisoformat(project.get("end_date",   "2026-03-01"))
        monsoon_months = {6, 7, 8, 9, 10, 11}
        months_in_project = set()
        cur = start.replace(day=1)
        while cur <= end:
            months_in_project.add(cur.month)
            # Advance by one month
            if cur.month == 12:
                cur = cur.replace(year=cur.year + 1, month=1)
            else:
                cur = cur.replace(month=cur.month + 1)
        monsoon_overlap = len(months_in_project & monsoon_months)
    except Exception:
        monsoon_overlap = 2   # conservative default

    return {
        "department_code":          _dept_code(project.get("department", "Other")),
        "contractor_id":            int(project.get("contractor_id", 3)),
        "duration_days":            duration_days,
        "estimated_cost_cr":        float(project.get("estimated_cost_cr", 10.0)),
        "project_scope_size":       float(project.get("project_scope_size", 5.0)),
        "avg_delay_days":           float(project.get("avg_delay_days", 10.0)),
        "monsoon_months_overlap":   monsoon_overlap,
        "cpgrams_count":            int(project.get("cpgrams_count", 0)),
        "spatial_conflict_penalty": _status_penalty(project.get("status", "MODERATE_RISK")),
    }


# ---------------------------------------------------------------------------
# Synthetic training data generator
# ---------------------------------------------------------------------------

def _generate_synthetic_data(n_samples: int = 1200):
    """
    Generate a synthetic DataFrame mimicking Chennai road-works history.
    This provides a plausible training signal in the absence of real data.
    """
    import numpy as np
    import pandas as pd

    random.seed(42)
    np.random.seed(42)

    rows = []
    for _ in range(n_samples):
        dept_code       = random.randint(0, 6)
        contractor_id   = random.randint(1, 15)
        duration_days   = random.randint(20, 300)
        cost_cr         = round(random.uniform(0.5, 50.0), 2)
        scope_size      = round(random.uniform(1.0, 30.0), 1)
        avg_delay_days  = round(random.uniform(0, 35), 1)
        monsoon_overlap = random.randint(0, 6)
        cpgrams_count   = random.randint(0, 80)
        conflict_pen    = random.choice([0.1, 0.5, 0.9])

        # Ground-truth label: probability of delay increases with:
        # high avg_delay, monsoon months, spatial conflicts, large scope
        delay_prob = (
            0.15
            + (avg_delay_days / 35) * 0.30
            + (monsoon_overlap / 6)  * 0.20
            + conflict_pen           * 0.20
            + (cost_cr / 50)         * 0.10
            + (cpgrams_count / 80)   * 0.05
        )
        delayed = int(random.random() < min(delay_prob, 0.98))

        rows.append({
            "department_code":          dept_code,
            "contractor_id":            contractor_id,
            "duration_days":            duration_days,
            "estimated_cost_cr":        cost_cr,
            "project_scope_size":       scope_size,
            "avg_delay_days":           avg_delay_days,
            "monsoon_months_overlap":   monsoon_overlap,
            "cpgrams_count":            cpgrams_count,
            "spatial_conflict_penalty": conflict_pen,
            "delayed":                  delayed,
        })

    return pd.DataFrame(rows)


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

def train_and_save_model() -> None:
    """
    Train a LightGBM binary classifier on synthetic data and persist it.
    Safe to call multiple times — skips re-training if model file exists.
    """
    if not all([PANDAS_AVAILABLE, LGBM_AVAILABLE, SKLEARN_AVAILABLE, JOBLIB_AVAILABLE]):
        logger.warning(
            "ML dependencies not available. Skipping model training. "
            "Install: lightgbm scikit-learn pandas joblib"
        )
        return

    if os.path.exists(MODEL_PATH):
        logger.info("Delay model already exists at %s — skipping training.", MODEL_PATH)
        return

    import pandas as pd
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import roc_auc_score
    import lightgbm as lgb
    import joblib

    logger.info("Training LightGBM delay prediction model…")
    df = _generate_synthetic_data(n_samples=1500)

    FEATURES = [
        "department_code", "contractor_id", "duration_days",
        "estimated_cost_cr", "project_scope_size", "avg_delay_days",
        "monsoon_months_overlap", "cpgrams_count", "spatial_conflict_penalty",
    ]
    X, y = df[FEATURES], df["delayed"]
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = lgb.LGBMClassifier(
        n_estimators=200,
        learning_rate=0.05,
        num_leaves=31,
        min_child_samples=20,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbose=-1,
    )
    model.fit(X_train, y_train)

    val_preds = model.predict_proba(X_val)[:, 1]
    auc = roc_auc_score(y_val, val_preds)
    logger.info("Model trained — Validation AUC: %.4f", auc)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump({"model": model, "features": FEATURES, "auc": auc}, MODEL_PATH)
    logger.info("Model saved to %s", MODEL_PATH)


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------

def predict_delay_risk(project: dict) -> dict:
    """
    Predict slippage risk for a single project.

    Parameters
    ----------
    project : dict
        At minimum: department, start_date, end_date, estimated_cost_cr.
        Optional extras: avg_delay_days, cpgrams_count, status.

    Returns
    -------
    dict
        {
          "delay_risk_score": 82,          # integer 0–100
          "risk_label":       "HIGH RISK", # "HIGH RISK" / "MODERATE" / "ON TRACK"
          "estimated_delay_days": 14,
          "model_used":       "lgbm" | "heuristic",
        }
    """
    features = _project_to_features(project)

    # ── Try LightGBM model first ───────────────────────────────────────────
    if all([LGBM_AVAILABLE, JOBLIB_AVAILABLE, PANDAS_AVAILABLE]):
        try:
            import joblib
            import pandas as pd

            if not os.path.exists(MODEL_PATH):
                train_and_save_model()

            artefact = joblib.load(MODEL_PATH)
            model    = artefact["model"]
            feat_cols = artefact["features"]

            row = pd.DataFrame([{k: features.get(k, 0) for k in feat_cols}])
            prob = model.predict_proba(row)[0][1]   # P(delayed)
            risk_score = int(round(prob * 100))

            return _build_response(risk_score, features["duration_days"], "lgbm")
        except Exception as exc:
            logger.warning("LightGBM inference failed (%s) — using heuristic.", exc)

    # ── Heuristic fallback (always works, no deps) ─────────────────────────
    risk_score = _heuristic_risk(features)
    return _build_response(risk_score, features["duration_days"], "heuristic")


def _heuristic_risk(f: dict) -> int:
    """
    Simple linear combination heuristic.
    Returns risk percentage 0-100.
    """
    score = (
        (f["avg_delay_days"] / 35)            * 35
        + f["spatial_conflict_penalty"]        * 25
        + (f["monsoon_months_overlap"] / 6)   * 20
        + (f["cpgrams_count"] / 80)            * 10
        + (f["estimated_cost_cr"] / 50)        * 10
    )
    return max(5, min(95, int(round(score))))


def _build_response(risk_score: int, duration_days: int, model_used: str) -> dict:
    # Estimate delay in days using same formula as the frontend DelayCard
    delay_days = round((risk_score / 100) * duration_days * 0.4)

    if risk_score > 75:
        label = "HIGH RISK"
    elif risk_score >= 40:
        label = "MODERATE"
    else:
        label = "ON TRACK"

    return {
        "delay_risk_score":     risk_score,
        "risk_label":           label,
        "estimated_delay_days": delay_days,
        "model_used":           model_used,
    }

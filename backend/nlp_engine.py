"""
Sanchal — Social Grievance NLP Urgency Classifier (Phase 2)
============================================================
Uses Hugging Face `transformers` DistilBERT to classify social media
text into three municipal urgency tiers:

    HIGH   — hazardous / life-safety / major traffic
    MEDIUM — inconvenience / minor disruption / query
    LOW    — resolved / positive / informational

Strategy:
  1. Run distilbert-base-uncased-finetuned-sst-2-english (binary sentiment).
  2. Override with keyword-pattern matching for civic domain specificity
     (sentiment models were never trained on road-works language).
  3. Return {urgency_tier, confidence, classification_method}.

The pipeline falls back to keyword-only classification if transformers
is not installed, so the API never returns an error in hackathon demos.
"""

import re
import logging

logger = logging.getLogger("sanchal.nlp_engine")

# ---------------------------------------------------------------------------
# Lazy import — graceful degradation
# ---------------------------------------------------------------------------
try:
    from transformers import pipeline as hf_pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

# Module-level singleton — loaded once on first call
_SENTIMENT_PIPELINE = None


def _get_pipeline():
    """Load DistilBERT sentiment pipeline lazily (singleton)."""
    global _SENTIMENT_PIPELINE
    if _SENTIMENT_PIPELINE is not None:
        return _SENTIMENT_PIPELINE
    if not TRANSFORMERS_AVAILABLE:
        return None
    try:
        logger.info("Loading DistilBERT pipeline…")
        _SENTIMENT_PIPELINE = hf_pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            truncation=True,
            max_length=512,
        )
        logger.info("DistilBERT pipeline loaded successfully.")
        return _SENTIMENT_PIPELINE
    except Exception as exc:
        logger.warning("Failed to load DistilBERT: %s — using keyword fallback.", exc)
        return None


# ---------------------------------------------------------------------------
# Keyword pattern libraries
# ---------------------------------------------------------------------------

# Patterns that always indicate HIGH urgency regardless of sentiment model
HIGH_PATTERNS = [
    r"\baccident\b", r"\bdanger(?:ous)?\b", r"\bhazard(?:ous)?\b",
    r"\bno barricad", r"\bunbarricad", r"\bopen trench\b",
    r"\bmissing cover\b", r"\bfell?\b.*trench", r"\bchild\b.*pit",
    r"\bschool\b.*dig", r"\bhospital\b.*block",
    r"\bwater(?:logging|logged)\b", r"\bflooding?\b",
    r"\bemergency\b", r"\bsewage\b.*overflow",
    r"\bsame stretch\b", r"\bagain\b.*dig",     # Dig-Once trigger words
    r"\bthird time\b", r"\b18 months\b",
    r"\bno safety\b", r"\bwait(?:ing)? to happen\b",
    r"\bnight.*open\b", r"\bopen.*night\b",
    r"\bcmda\b", r"\bmadness\b",
]

# Patterns that strongly indicate LOW urgency (positive / resolved)
LOW_PATTERNS = [
    r"\bkudos\b", r"\bwell done\b", r"\bthank(?:s| you)\b",
    r"\bcompleted?\b", r"\bfinished?\b", r"\bgreat work\b",
    r"\bimpressive\b", r"\bhope.*follow\b", r"\brare sight\b",
    r"\bwithin schedule\b", r"\bon time\b", r"\bon track\b",
    r"\bproper barricad", r"\bgood job\b",
]

# Words that add domain weight to MEDIUM tier (above baseline neutral)
MEDIUM_BOOST_PATTERNS = [
    r"\bdust\b", r"\bnoise\b", r"\btraffic\b",
    r"\bblocked?\b", r"\bbottleneck\b",
    r"\bshop.*suffer", r"\bbusiness.*disrupt",
    r"\bweek [0-9]+", r"\bweeks?\b", r"\bmonths?\b",
    r"\bno footpath\b", r"\bwhen will\b",
    r"\bwhat is.*doing\b",
]


def _keyword_urgency(text: str) -> tuple[str, float]:
    """
    Pure regex-based urgency classification.

    Returns (tier, confidence) where confidence ∈ [0, 1].
    """
    lower = text.lower()

    # HIGH check
    high_matches = sum(1 for p in HIGH_PATTERNS if re.search(p, lower))
    if high_matches >= 1:
        conf = min(0.95, 0.70 + high_matches * 0.08)
        return ("HIGH", round(conf, 3))

    # LOW check
    low_matches = sum(1 for p in LOW_PATTERNS if re.search(p, lower))
    if low_matches >= 1:
        conf = min(0.90, 0.65 + low_matches * 0.10)
        return ("LOW", round(conf, 3))

    # MEDIUM with boost check
    medium_matches = sum(1 for p in MEDIUM_BOOST_PATTERNS if re.search(p, lower))
    if medium_matches >= 2:
        return ("MEDIUM", round(min(0.80, 0.55 + medium_matches * 0.06), 3))

    # Default: MEDIUM at lower confidence
    return ("MEDIUM", 0.50)


def _sentiment_to_tier(label: str, score: float, text: str) -> tuple[str, float, str]:
    """
    Map DistilBERT output + keyword context to a municipal urgency tier.

    Logic:
        NEGATIVE + HIGH keywords  → HIGH
        NEGATIVE (high conf)      → MEDIUM (road-works negatives ≠ life risk)
        NEGATIVE (low conf)       → MEDIUM
        POSITIVE                  → run LOW keywords; default MEDIUM
    """
    keyword_tier, keyword_conf = _keyword_urgency(text)

    # Keyword patterns always take precedence for explicit civic language
    if keyword_tier == "HIGH":
        return ("HIGH", max(score, keyword_conf), "keyword+sentiment")

    if label == "NEGATIVE":
        if score >= 0.90:
            # Strong negative — likely MEDIUM (complaint) but could be HIGH
            tier = "MEDIUM" if keyword_tier == "LOW" else keyword_tier
            conf = round((score + keyword_conf) / 2, 3)
            return (tier, conf, "sentiment+keyword")
        else:
            return ("MEDIUM", round(score, 3), "sentiment")

    # POSITIVE sentiment
    if keyword_tier == "LOW":
        return ("LOW", keyword_conf, "keyword+sentiment")
    return ("MEDIUM", round(1 - score, 3), "sentiment")   # weak positive → medium


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def classify_grievance(text: str) -> dict:
    """
    Classify a social media grievance into a municipal urgency tier.

    Parameters
    ----------
    text : str
        Raw citizen complaint or social media post text.

    Returns
    -------
    dict
        {
          "urgency_tier":           "HIGH" | "MEDIUM" | "LOW",
          "confidence":             0.88,        # 0.0 – 1.0
          "classification_method":  "keyword+sentiment" | "keyword" | "heuristic",
          "distilbert_label":       "NEGATIVE",  # raw model output (if available)
          "distilbert_score":       0.97,
        }
    """
    if not text or not text.strip():
        return {
            "urgency_tier":          "MEDIUM",
            "confidence":            0.50,
            "classification_method": "default_empty",
            "distilbert_label":      None,
            "distilbert_score":      None,
        }

    # ── Try DistilBERT ─────────────────────────────────────────────────────
    pipe = _get_pipeline()
    if pipe is not None:
        try:
            result = pipe(text)[0]
            label  = result["label"]   # "POSITIVE" or "NEGATIVE"
            score  = result["score"]   # confidence

            tier, conf, method = _sentiment_to_tier(label, score, text)
            return {
                "urgency_tier":          tier,
                "confidence":            conf,
                "classification_method": method,
                "distilbert_label":      label,
                "distilbert_score":      round(score, 4),
            }
        except Exception as exc:
            logger.warning("DistilBERT inference error: %s — falling back to keyword.", exc)

    # ── Keyword-only fallback ──────────────────────────────────────────────
    tier, conf = _keyword_urgency(text)
    return {
        "urgency_tier":          tier,
        "confidence":            conf,
        "classification_method": "keyword",
        "distilbert_label":      None,
        "distilbert_score":      None,
    }


def batch_classify(texts: list[str]) -> list[dict]:
    """
    Classify a list of grievance texts.
    Returns a list of result dicts matching classify_grievance output.
    """
    return [classify_grievance(t) for t in texts]

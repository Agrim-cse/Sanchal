"""
Sanchal — WhatsApp Bot Logic (Phase 4)
=======================================
Handles incoming Twilio WhatsApp messages from citizens:
  1. Detects language (Tamil / Hindi / English) from the incoming text.
  2. Searches the SQLite database for matching public works projects.
  3. Formats a response with project status + ML delay risk.
  4. Translates the response into the citizen's preferred language.
  5. Returns a Twilio-compatible XML MessagingResponse string.

Dependencies:
  pip install twilio deep-translator
"""

import logging
import re
from typing import Optional

from sqlalchemy.orm import Session

logger = logging.getLogger("sanchal.whatsapp_bot")

# ---------------------------------------------------------------------------
# Language detection helpers
# ---------------------------------------------------------------------------

# Tamil Unicode range: U+0B80-U+0BFF
_TAMIL_RE = re.compile(r"[\u0B80-\u0BFF]")
# Hindi (Devanagari) Unicode range: U+0900-U+097F
_HINDI_RE = re.compile(r"[\u0900-\u097F]")


def detect_language(text: str) -> str:
    """
    Returns 'ta' (Tamil), 'hi' (Hindi), or 'en' (English/default).
    """
    if _TAMIL_RE.search(text):
        return "ta"
    if _HINDI_RE.search(text):
        return "hi"
    return "en"


# ---------------------------------------------------------------------------
# Database search
# ---------------------------------------------------------------------------

def search_projects_by_text(text: str, db: Session):
    """
    Tries to match the free-text query against road_name, department,
    or description fields in the public_works table.
    Returns up to 3 matching PublicWork ORM objects.
    """
    from models import PublicWork  # noqa: PLC0415

    query_lower = text.lower()

    # Strip common filler words to extract meaningful area/road tokens
    stop_words = {
        "road", "works", "roadworks", "excavation", "project", "in", "at",
        "near", "the", "a", "an", "about", "status", "update", "work",
    }
    search_tokens = [
        t for t in query_lower.split()
        if t not in stop_words and len(t) > 2
    ]

    results = []
    seen_ids: set = set()

    for token in search_tokens:
        hits = (
            db.query(PublicWork)
            .filter(
                PublicWork.road_name.ilike(f"%{token}%")
                | PublicWork.description.ilike(f"%{token}%")
                | PublicWork.department.ilike(f"%{token}%")
            )
            .limit(3)
            .all()
        )
        for h in hits:
            if h.id not in seen_ids:
                results.append(h)
                seen_ids.add(h.id)
        if len(results) >= 3:
            break

    # Fallback: return top 2 active projects as a general status
    if not results:
        results = db.query(PublicWork).limit(2).all()

    return results[:3]


# ---------------------------------------------------------------------------
# Risk label helpers
# ---------------------------------------------------------------------------

def _risk_label(score: int) -> str:
    if score > 75:
        return "HIGH RISK 🔴"
    if score >= 40:
        return "MODERATE RISK 🟡"
    return "ON TRACK 🟢"


def _estimated_delay(score: int) -> str:
    """Rough textual estimate of delay days from risk score."""
    if score > 75:
        return f"~{int(score * 0.6)} days"
    if score >= 40:
        return f"~{int(score * 0.3)} days"
    return "No significant delay"


# ---------------------------------------------------------------------------
# Response formatting
# ---------------------------------------------------------------------------

HEADER_EN = (
    "🏙️ *Sanchal — Chennai Municipal Intelligence*\n"
    "━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
)

FOOTER_EN = (
    "━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    "📲 Reply with a road name or area for live status.\n"
    "For grievances, visit: https://pgportal.gov.in"
)

NO_MATCH_EN = (
    "⚠️ No active projects matched your query.\n"
    "Try sending a road name or area (e.g., 'Tambaram', 'Adyar')."
)


def format_project_block(work) -> str:
    """Formats a single PublicWork ORM object into a WhatsApp-friendly block."""
    risk_lbl = _risk_label(work.delay_risk_score)
    est_delay = _estimated_delay(work.delay_risk_score)
    return (
        f"📍 *{work.road_name}*\n"
        f"  🏢 Dept: {work.department}\n"
        f"  👷 Contractor: {work.contractor}\n"
        f"  📅 {work.start_date} → {work.end_date}\n"
        f"  ⚡ Risk: {risk_lbl} ({work.delay_risk_score}%)\n"
        f"  ⏱ Est. Delay: {est_delay}\n"
        f"  🪪 ID: {work.id}\n"
    )


def build_response_en(works) -> str:
    if not works:
        return HEADER_EN + NO_MATCH_EN + "\n" + FOOTER_EN

    blocks = "\n".join(format_project_block(w) for w in works)
    count_note = f"Found {len(works)} active project(s):\n\n"
    return HEADER_EN + count_note + blocks + FOOTER_EN


# ---------------------------------------------------------------------------
# Translation
# ---------------------------------------------------------------------------

def translate_text(text: str, target_lang: str) -> str:
    """
    Translates text to target_lang using deep-translator (GoogleTranslator).
    Falls back to the original English text if translation fails.
    target_lang: ISO 639-1 code, e.g., 'ta', 'hi', 'en'
    """
    if target_lang == "en":
        return text

    try:
        from deep_translator import GoogleTranslator  # noqa: PLC0415

        MAX_CHUNK = 4800
        if len(text) <= MAX_CHUNK:
            translated = GoogleTranslator(source="en", target=target_lang).translate(text)
            return translated or text

        # Chunk on newline boundaries to stay within API limits
        chunks = []
        current = ""
        for line in text.split("\n"):
            if len(current) + len(line) + 1 > MAX_CHUNK:
                chunks.append(current)
                current = line
            else:
                current += "\n" + line if current else line
        if current:
            chunks.append(current)

        translated_chunks = []
        for chunk in chunks:
            t = GoogleTranslator(source="en", target=target_lang).translate(chunk)
            translated_chunks.append(t or chunk)

        return "\n".join(translated_chunks)

    except ImportError:
        logger.warning("deep-translator not installed; returning English response.")
        return text
    except Exception as exc:
        logger.error("Translation error (en->%s): %s", target_lang, exc)
        return text  # Graceful degradation


# ---------------------------------------------------------------------------
# Main bot entry point
# ---------------------------------------------------------------------------

def process_whatsapp_message(body: str, from_number: str, db: Session) -> str:
    """
    Main handler called from the FastAPI endpoint.

    Args:
        body        : Raw WhatsApp message text from Twilio.
        from_number : Citizen's WhatsApp number (e.g., 'whatsapp:+919876543210').
        db          : SQLAlchemy Session (injected by FastAPI Depends).

    Returns:
        A plain-text string to be set as the Twilio TwiML <Message> body.
    """
    logger.info("WhatsApp message from %s: %r", from_number, body[:80])

    # 1. Detect language from the raw incoming text
    lang = detect_language(body)
    logger.info("Detected language: %s", lang)

    # 2. If non-English, translate the query to English for DB search
    search_text = body
    if lang != "en":
        try:
            from deep_translator import GoogleTranslator  # noqa: PLC0415

            search_text = (
                GoogleTranslator(source=lang, target="en").translate(body) or body
            )
            logger.info("Translated query to English: %r", search_text[:80])
        except Exception as exc:
            logger.warning("Query translation failed: %s", exc)

    # 3. Search the database for matching projects
    matching_works = search_projects_by_text(search_text, db)

    # 4. Build the English response
    response_en = build_response_en(matching_works)

    # 5. Translate response to the citizen's detected language
    final_response = translate_text(response_en, lang)

    return final_response


# ---------------------------------------------------------------------------
# Twilio TwiML wrapper
# ---------------------------------------------------------------------------

def build_twiml_response(message_body: str) -> str:
    """
    Wraps a plain text message in a Twilio MessagingResponse XML envelope.
    Falls back to hand-crafted XML if the twilio package is not installed.
    """
    try:
        from twilio.twiml.messaging_response import MessagingResponse  # noqa: PLC0415

        resp = MessagingResponse()
        resp.message(message_body)
        return str(resp)

    except ImportError:
        logger.warning("twilio package not installed; returning raw XML.")
        # Safe XML fallback with entity escaping
        escaped = (
            message_body
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )
        return (
            '<?xml version="1.0" encoding="UTF-8"?>'
            "<Response>"
            f"<Message>{escaped}</Message>"
            "</Response>"
        )

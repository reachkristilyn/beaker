"""
Grants.gov search client.

Calls the public search2 endpoint (no API key required) and returns
cleaned, open-only, future-deadline federal grant opportunities.

Field names below are taken from the live search2 sample response:
https://grants.gov/api/common/search2
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date, datetime

import httpx  # already installed transitively by the Agents SDK; if not: pip install httpx

SEARCH2_URL = "https://api.grants.gov/v1/api/search2"

logger = logging.getLogger(__name__)


@dataclass
class GrantOpportunity:
    grant_name: str
    agency: str
    number: str
    deadline: str | None      # ISO "YYYY-MM-DD", or None if grant lists no close date
    opp_status: str           # e.g. "posted", "forecasted"
    aln: list[str]            # CFDA / assistance listing numbers
    source_url: str


def _to_iso(raw: str | None) -> str | None:
    """Grants.gov returns 'MM/DD/YYYY' (or '' for forecasted). Return ISO or None."""
    if not raw or not raw.strip():
        return None
    try:
        return datetime.strptime(raw.strip(), "%m/%d/%Y").date().isoformat()
    except ValueError:
        # Unknown format -> treat as no reliable date rather than crashing.
        return None


def search_grants(
    keyword: str,
    *,
    rows: int = 25,
    statuses: str = "posted|forecasted",
    timeout: float = 20.0,
) -> list[GrantOpportunity]:
    """
    Search Grants.gov and return open, non-expired opportunities.

    The deadline guard here is deterministic: any grant whose close date is
    already in the past is dropped in code, regardless of what the API returns.
    Grants with no close date (typically forecasted) are kept.
    """
    payload = {
        "keyword": keyword,
        "oppStatuses": statuses,
        "rows": rows,
    }

    try:
        resp = httpx.post(SEARCH2_URL, json=payload, timeout=timeout)
        resp.raise_for_status()
        body = resp.json()
    except Exception as exc:  # network error, timeout, bad JSON, etc.
        logger.warning("Grants.gov search failed for %r: %s", keyword, exc)
        return []

    if body.get("errorcode") != 0:
        logger.warning("Grants.gov returned error: %s", body.get("msg"))
        return []

    hits = (body.get("data") or {}).get("oppHits") or []
    today = date.today()
    out: list[GrantOpportunity] = []

    for h in hits:
        deadline = _to_iso(h.get("closeDate"))

        # Deterministic past-deadline guard.
        if deadline is not None and date.fromisoformat(deadline) < today:
            continue

        opp_id = str(h.get("id") or "").strip()
        out.append(
            GrantOpportunity(
                grant_name=h.get("title") or "Untitled opportunity",
                agency=h.get("agencyName") or h.get("agencyCode") or "Unknown agency",
                number=h.get("number") or "",
                deadline=deadline,
                opp_status=h.get("oppStatus") or "",
                aln=h.get("alnist") or [],
                source_url=(
                    f"https://grants.gov/search-results-detail/{opp_id}"
                    if opp_id
                    else "https://grants.gov"
                ),
            )
        )

    # Soonest deadline first; grants with no deadline sink to the bottom.
    out.sort(key=lambda g: (g.deadline is None, g.deadline or ""))
    return out


if __name__ == "__main__":
    # Standalone test: python -m beaker_agents.grants_gov reentry
    import sys

    term = " ".join(sys.argv[1:]) or "reentry"
    for g in search_grants(term):
        print(f"{g.deadline or 'no deadline':<12} {g.agency[:28]:<28} {g.grant_name}")
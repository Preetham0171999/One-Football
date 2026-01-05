from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Optional

import time
import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET

from logic.combined_predictor.predict import combine_predictions
from auth.routes import router as auth_router


app = FastAPI()


@app.on_event("startup")
def _ensure_db_schema():
    """Lightweight schema guard for local development (no migrations).

    1) Creates missing tables.
    2) Adds any newer columns used by the app.
    """
    try:
        from sqlalchemy import text
        from database.db import engine
        from database.models import Base

        # Create any missing tables first (prevents UndefinedTable errors).
        Base.metadata.create_all(bind=engine)

        # Postgres supports IF NOT EXISTS
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS name VARCHAR"))
            conn.commit()
    except Exception:
        # If the DB isn't reachable at startup, normal routes will fail anyway.
        # Don't crash the app here; surface errors on request.
        pass


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",     # 👈 THIS is the missing one
        "http://127.0.0.1:5173",     # 👈 optional but good
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Using the database for all data. JSON-based loading removed.
class Match(BaseModel):
    team_a: str
    team_b: str
    left_formation: str      # 👈 added
    right_formation: str     # 👈 added
    left_playing_11: dict
    right_playing_11: dict
    left_rating: float
    right_rating: float





@app.post("/predict")
def predict(match: Match):
    try:
        result = combine_predictions(
            match.team_a,
            match.team_b,
            match.left_formation,      # 👈 pass through
            match.right_formation,     # 👈 pass through
            match.left_playing_11,
            match.right_playing_11,
            match.left_rating,
            match.right_rating
        )
    except Exception as e:
        return {"error": str(e)}

    return {"winner": result}








app.include_router(auth_router)

from database.db import SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
        
        
from database.models import Team
from auth.security import get_current_user


@app.get("/teams")
def get_teams(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    teams = db.query(Team).all()
    return {"teams": [t.name for t in teams]}


@app.get("/logo/{team_name}")
def get_logo(team_name: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    team = db.query(Team).filter(Team.name == team_name).first()
    return {"team": team_name, "logo": team.logo if team else None}

from database.models import Player

@app.get("/players/{team_name}")
def get_players(team_name: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    players = db.query(Player).filter(Player.team == team_name).all()
    return {
        "team": team_name,
        "players": [
            {
                "name": p.name,
                "position": p.position,
                "rating": p.rating
            } for p in players
        ]
    }



from database.models import ClubMetric

@app.get("/club-metrics/{team_name}")
def get_metrics(team_name: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    row = db.query(ClubMetric).filter(ClubMetric.team == team_name).first()
    return {"team": team_name, "metrics": row.metrics if row else []}


from database.models import ClubHistory

@app.get("/club-history/{team_name}")
def get_club_history(team_name: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    row = db.query(ClubHistory).filter(
        ClubHistory.team == team_name.lower()
    ).first()
    return {"history": row.history if row else []}


# ----------------------------
# Saved analyses (per-user)
# ----------------------------
from database.models import Analysis


class AnalysisCreate(BaseModel):
    name: str
    team: Optional[str] = None
    formation: Optional[str] = None
    assigned: dict[str, Any]
    subs: dict[str, Any]
    freePositions: dict[str, Any]
    arrows: list[dict[str, Any]]


@app.post("/analysis")
def save_analysis(
    payload: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    name = (payload.name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Analysis name is required")

    analysis = (
        db.query(Analysis)
        .filter(Analysis.user_email == current_user, Analysis.name == name)
        .first()
    )

    if analysis:
        analysis.team = payload.team
        analysis.formation = payload.formation
        analysis.assigned = payload.assigned
        analysis.subs = payload.subs
        analysis.free_positions = payload.freePositions
        analysis.arrows = payload.arrows
    else:
        analysis = Analysis(
            user_email=current_user,
            name=name,
            team=payload.team,
            formation=payload.formation,
            assigned=payload.assigned,
            subs=payload.subs,
            free_positions=payload.freePositions,
            arrows=payload.arrows,
        )
        db.add(analysis)
    try:
        db.commit()
        db.refresh(analysis)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "id": analysis.id,
        "name": analysis.name,
        "created_at": analysis.created_at,
        "team": analysis.team,
        "formation": analysis.formation,
    }


@app.get("/analysis")
def list_analyses(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    rows = (
        db.query(Analysis)
        .filter(Analysis.user_email == current_user)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return {
        "analyses": [
            {
                "id": a.id,
                "name": a.name,
                "created_at": a.created_at,
                "team": a.team,
                "formation": a.formation,
            }
            for a in rows
        ]
    }


@app.get("/analysis/{analysis_id}")
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    a = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_email == current_user)
        .first()
    )
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "id": a.id,
        "name": a.name,
        "created_at": a.created_at,
        "team": a.team,
        "formation": a.formation,
        "assigned": a.assigned,
        "subs": a.subs,
        "freePositions": a.free_positions,
        "arrows": a.arrows,
    }


# ----------------------------
# Latest news (RSS headlines)
# ----------------------------

_NEWS_CACHE: dict[str, Any] = {"ts": 0.0, "data": None}

_LEAGUES_CACHE: dict[str, Any] = {"ts": 0.0, "data": None}
_STANDINGS_CACHE: dict[str, Any] = {}


def _fetch_rss_headlines(url: str, limit: int = 20) -> list[dict[str, Any]]:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "One-Football/1.0 (+https://localhost)",
            "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
        },
        method="GET",
    )

    with urllib.request.urlopen(req, timeout=6) as resp:
        xml_bytes = resp.read()

    root = ET.fromstring(xml_bytes)
    channel = root.find("channel")
    if channel is None:
        channel = root.find("./channel")
    if channel is None:
        raise ValueError("Unsupported feed format")

    items = []
    for item in channel.findall("item")[: max(0, int(limit))]:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub = (item.findtext("pubDate") or "").strip()

        if not title or not link:
            continue

        items.append({"title": title, "link": link, "published": pub or None})

    return items


def _http_get_json(url: str, timeout: int = 8) -> Any:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "One-Football/1.0 (+https://localhost)",
            "Accept": "application/json",
        },
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
    return json.loads(raw)


@app.get("/news/latest")
def latest_news(
    limit: int = 20,
    current_user: str = Depends(get_current_user),
):
    # Cache for 5 minutes to avoid repeated external requests
    now = time.time()
    if _NEWS_CACHE.get("data") is not None and (now - float(_NEWS_CACHE.get("ts") or 0)) < 300:
        cached = _NEWS_CACHE["data"]
        return {
            "source": cached.get("source"),
            "items": cached.get("items", []),
            "cached": True,
        }

    # RSS feed (no API key). Headlines + links only.
    feed_url = "https://feeds.bbci.co.uk/sport/football/rss.xml"
    try:
        items = _fetch_rss_headlines(feed_url, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"News fetch failed: {e}")

    data = {"source": "BBC Sport Football", "items": items}
    _NEWS_CACHE["ts"] = now
    _NEWS_CACHE["data"] = data
    return {"source": data["source"], "items": data["items"], "cached": False}


# ----------------------------
# Leagues & standings (points table)
# ----------------------------

# NOTE: Previous provider (api-football-standings.azharimm.site) is no longer
# serving JSON. Using ESPN's public JSON endpoints instead.
_ESPN_SOCCER_API_BASE = "https://site.web.api.espn.com/apis/v2/sports/soccer"

# Minimal, stable league list for the dropdown.
# IDs are ESPN soccer league codes used in URLs.
_LEAGUE_CATALOG = [
    {"id": "eng.1", "name": "Premier League", "abbr": "EPL"},
    {"id": "esp.1", "name": "LaLiga", "abbr": "LALIGA"},
    {"id": "ita.1", "name": "Serie A", "abbr": "SA"},
    {"id": "ger.1", "name": "Bundesliga", "abbr": "BUN"},
    {"id": "fra.1", "name": "Ligue 1", "abbr": "L1"},
    {"id": "uefa.champions", "name": "UEFA Champions League", "abbr": "UCL"},
    {"id": "uefa.europa", "name": "UEFA Europa League", "abbr": "UEL"},
    {"id": "usa.1", "name": "MLS", "abbr": "MLS"},
]


def _espn_standings_url(league_id: str) -> str:
    return f"{_ESPN_SOCCER_API_BASE}/{urllib.parse.quote(league_id)}/standings"


def _extract_stat(stat_map: dict[str, Any], *names: str, default: Any = None) -> Any:
    for n in names:
        if n in stat_map:
            return stat_map.get(n)
    return default


@app.get("/leagues")
def list_leagues(current_user: str = Depends(get_current_user)):
    # Catalog is static; keep existing cache structure for compatibility.
    now = time.time()
    if _LEAGUES_CACHE.get("data") is None:
        _LEAGUES_CACHE["ts"] = now
        _LEAGUES_CACHE["data"] = _LEAGUE_CATALOG
    return {"leagues": _LEAGUES_CACHE["data"], "cached": True}


@app.get("/leagues/{league_id}/standings")
def league_standings(
    league_id: str,
    season: int = int(time.gmtime().tm_year),
    current_user: str = Depends(get_current_user),
):
    league_id = (league_id or "").strip()
    if not league_id:
        raise HTTPException(status_code=400, detail="league_id is required")

    # ESPN endpoint serves current standings without requiring a season.
    # Keep the season parameter for frontend compatibility, but do not use it.
    cache_key = f"{league_id}:current"
    now = time.time()
    cached = _STANDINGS_CACHE.get(cache_key)
    if cached and (now - float(cached.get("ts") or 0)) < 600:
        return {"leagueId": league_id, "season": season, "standings": cached.get("data", []), "cached": True}

    try:
        payload = _http_get_json(_espn_standings_url(league_id))
        children = (payload or {}).get("children") or []
        if not children:
            raise ValueError("No standings data")

        standings = ((children[0] or {}).get("standings") or {}).get("entries") or []
        out = []
        for idx, entry in enumerate(standings, start=1):
            team = (entry or {}).get("team") or {}
            stats = (entry or {}).get("stats") or []
            stat_map = {s.get("name"): s.get("value") for s in stats if isinstance(s, dict)}

            out.append(
                {
                    "rank": _extract_stat(stat_map, "rank", default=idx),
                    "teamId": team.get("id"),
                    "teamName": team.get("displayName") or team.get("name"),
                    "played": _extract_stat(stat_map, "gamesPlayed", "games", default=None),
                    "wins": _extract_stat(stat_map, "wins", default=None),
                    "draws": _extract_stat(stat_map, "ties", "draws", default=None),
                    "losses": _extract_stat(stat_map, "losses", default=None),
                    "goalDifference": _extract_stat(stat_map, "pointDifferential", "goalDifference", default=None),
                    "points": _extract_stat(stat_map, "points", default=None),
                }
            )

        out = [r for r in out if r.get("teamName")]
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Standings fetch failed: {e}")

    _STANDINGS_CACHE[cache_key] = {"ts": now, "data": out}
    return {"leagueId": league_id, "season": int(season), "standings": out, "cached": False}




                
            
        

                
            
            

        
        
        
        
        
        
        
        
        
        
            
            

    
       
                
        
    
        
            
                    
                    
        
                    
                    
                    
                
                
            
            
        
        
        
            
            
        
      



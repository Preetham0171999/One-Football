from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Optional

import os
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


class ChatRequest(BaseModel):
    message: str


_CHAT_KB_CACHE: dict[str, Any] = {"ts": 0.0, "path": None, "data": None}


def _load_chat_kb() -> dict[str, Any]:
    """Load canned chat responses from JSON.

    Format:
      {
        "default": "...",
        "intents": [
          {"any": ["kw1", "kw2"], "reply": "..."},
          {"all": ["kw1", "kw2"], "reply": "..."}
        ]
      }
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    kb_path = os.getenv("CHAT_KB_PATH") or os.path.join(base_dir, "chat_knowledge.json")

    now = time.time()
    cached = _CHAT_KB_CACHE
    if cached.get("data") is not None and cached.get("path") == kb_path and (now - float(cached.get("ts") or 0)) < 5:
        return cached["data"]

    try:
        with open(kb_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            raise ValueError("chat KB must be a JSON object")
        if "intents" in data and not isinstance(data.get("intents"), list):
            raise ValueError("chat KB intents must be a list")
    except Exception:
        data = {}

    _CHAT_KB_CACHE["ts"] = now
    _CHAT_KB_CACHE["path"] = kb_path
    _CHAT_KB_CACHE["data"] = data
    return data


def _chat_reply(message: str) -> str:
    text = (message or "").strip().lower()
    if not text:
        return "Ask a question about football or how to use the app."

    kb = _load_chat_kb()
    intents = kb.get("intents") if isinstance(kb, dict) else None
    if isinstance(intents, list):
        for intent in intents:
            if not isinstance(intent, dict):
                continue

            any_keywords = intent.get("any")
            all_keywords = intent.get("all")

            matched = False
            if isinstance(any_keywords, list) and any_keywords:
                matched = any((str(k).lower() in text) for k in any_keywords)
            elif isinstance(all_keywords, list) and all_keywords:
                matched = all((str(k).lower() in text) for k in all_keywords)

            if matched:
                reply = intent.get("reply")
                if isinstance(reply, str) and reply.strip():
                    return reply.strip()

    default_reply = kb.get("default") if isinstance(kb, dict) else None
    if isinstance(default_reply, str) and default_reply.strip():
        return default_reply.strip()

    return (
        "I can help with football basics (formations, pressing, counters) or how to use this app (Team Selector, Build Team, Build Match). "
        "Try asking: 'How do I predict a match?' or 'Which formation fits a counter-attacking team?'"
    )


@app.post("/chat")
def chat_endpoint(payload: ChatRequest):
    return {"reply": _chat_reply(payload.message)}





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


# ----------------------------
# Team schedule (external API)
# ----------------------------

_TEAM_ID_MAP = {
    # football-data.org team IDs
    # Keys are normalized team names (lowercase, no spaces/underscores).
    "arsenal": 57,
    "barcelona": 81,
    "bayernmunich": 5,
    "juventus": 109,
    "liverpool": 64,
    "manchesterunited": 66,
    "psg": 524,
    "realmadrid": 86,
}


def _normalize_team_key(team_name: str) -> str:
    return "".join(ch for ch in (team_name or "").strip().lower() if ch.isalnum())


@app.get("/schedule/{team_name}")
def get_schedule(team_name: str, current_user: str = Depends(get_current_user)):
    token = os.getenv("FOOTBALL_DATA_TOKEN")
    if not token:
        raise HTTPException(
            status_code=501,
            detail="FOOTBALL_DATA_TOKEN is not set on the backend",
        )

    key = _normalize_team_key(team_name)
    team_id = _TEAM_ID_MAP.get(key)
    if not team_id:
        raise HTTPException(status_code=404, detail="Team not supported for schedules")

    base_url = "https://api.football-data.org/v4"
    params = urllib.parse.urlencode({"status": "SCHEDULED", "limit": 10})
    url = f"{base_url}/teams/{team_id}/matches?{params}"

    req = urllib.request.Request(url, headers={"X-Auth-Token": token})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        # Bubble up API errors in a user-friendly way.
        try:
            detail = e.read().decode("utf-8")
        except Exception:
            detail = str(e)
        raise HTTPException(status_code=502, detail=f"Schedule provider error: {detail}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Schedule provider error: {str(e)}")

    matches = payload.get("matches") if isinstance(payload, dict) else None
    if not isinstance(matches, list):
        matches = []

    fixtures = []
    for m in matches:
        if not isinstance(m, dict):
            continue
        utc_date = m.get("utcDate")
        date_only = (utc_date or "").split("T")[0] if isinstance(utc_date, str) else None

        competition = None
        comp = m.get("competition")
        if isinstance(comp, dict):
            competition = comp.get("name")

        home = m.get("homeTeam") if isinstance(m.get("homeTeam"), dict) else {}
        away = m.get("awayTeam") if isinstance(m.get("awayTeam"), dict) else {}
        home_name = home.get("name")
        away_name = away.get("name")

        opponent = None
        if home.get("id") == team_id:
            opponent = away_name
        elif away.get("id") == team_id:
            opponent = home_name
        else:
            opponent = away_name or home_name

        fixtures.append(
            {
                "date": date_only,
                "opponent": opponent,
                "competition": competition,
                "homeTeam": home_name,
                "awayTeam": away_name,
            }
        )

    return {"team": team_name, "fixtures": fixtures}



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





                        
                        
                
                
                
                
            
                
        
        
        

        
                    
                    
                    
        
        
        
        
        
        
        
        
       
                    
                    
        
        

    





        

        
        
            
            
            
            
            
            
            
            
        
        

                
                
                
        
        
        

                
                 
        
        
        
        
        
        


                
            
            
        
        
        
        
        
        
        

       
       
                
            
            
                
                
                
                    

                    
        
                    
                    
                    
        
        
                     
                    




                
            
        

                
            
            

        
        
        
        
        
        
        
        
        
        
            
            

    
       
                
        
    
        
            
                    
                    
        
                    
                    
                    
                
                
            
            
        
        
        
            
            
        
      



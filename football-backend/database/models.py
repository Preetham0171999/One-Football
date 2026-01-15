from sqlalchemy import Column, Integer, String, JSON, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from .db import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    logo = Column(String)


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    team = Column(String, index=True)
    position = Column(String)
    rating = Column(Integer)


class ClubMetric(Base):
    __tablename__ = "club_metrics"

    id = Column(Integer, primary_key=True)
    team = Column(String, index=True)
    metrics = Column(JSON)


class ClubHistory(Base):
    __tablename__ = "club_history"

    id = Column(Integer, primary_key=True)
    team = Column(String, index=True)
    history = Column(JSON)
    
    
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True)
    user_email = Column(String, index=True)

    # Optional metadata for filtering/display
    name = Column(String, index=True, nullable=True)
    team = Column(String, index=True, nullable=True)
    formation = Column(String, nullable=True)

    # Saved analysis state
    assigned = Column(JSON)
    subs = Column(JSON)
    free_positions = Column(JSON)
    arrows = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class CustomTeam(Base):
    __tablename__ = "custom_teams"

    __table_args__ = (
        UniqueConstraint("owner_email", "name", name="uq_custom_team_owner_name"),
    )

    id = Column(Integer, primary_key=True)
    owner_email = Column(String, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)

    # Stored as a list of player dicts: [{name, position, rating}, ...]
    players = Column(JSON, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


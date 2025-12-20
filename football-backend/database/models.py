from sqlalchemy import Column, Integer, String, JSON
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

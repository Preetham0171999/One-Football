🐳 Running with Docker (recommended)

You can run the full stack without building anything locally.
All images are available on Docker Hub.

Docker Hub Images
Component	Image
Backend API	preethamkenganal/football-backend:backend
Frontend UI	preethamkenganal/football-backend:frontend


1️⃣ Pull images manually (optional)
docker pull preethamkenganal/football-backend:backend
docker pull preethamkenganal/football-backend:frontend

2️⃣ Run full stack with Docker Compose

From the project root (where docker-compose.yml is located):
docker compose up -d
Backend API → http://localhost:8000/docs
Frontend UI → http://localhost:5173

🗄️ Database

Uses the official PostgreSQL Docker image (postgres:16) with data persisted in Docker volumes.
The database image is not bundled in this repository.

⚡ Notes

This repository contains source code, Dockerfiles, and docker-compose.yml.
You can run the entire system without installing dependencies locally.
Recommended for demo, portfolio, or learning purposes.

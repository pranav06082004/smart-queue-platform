🎫 Smart Queue Platform

An AI-powered virtual queue management platform that lets customers join queues remotely, track their live position and estimated wait time, and get notified as their turn approaches — while staff manage queue flow, view analytics, and forecast demand in real time.

Built incrementally across 22 phases as a full-stack system design learning project, evolving from a simple monolith into a horizontally-scalable, observable, containerized platform with real-time updates, asynchronous processing, and three distinct AI capabilities — every architectural decision driven by an actual, demonstrated problem rather than added speculatively.

✨ Features

Customers

Register / login, browse organizations and services
Join a queue and receive a token number
View live position and AI-predicted wait time
Real-time updates via WebSockets (turn called, position changes, queue status)
In-app notifications (joined, turn approaching, your turn, queue paused/closed)
Natural-language search ("I need a haircut, no more than 20 min wait")
AI-ranked branch/queue recommendations

Staff

Create and manage organizations, services, and queues
Control queue lifecycle: open / pause / resume / close
Call next, skip, or complete customers
Real-time queue statistics and historical analytics
AI-powered demand forecasting by hour of day
🏗️ Architecture
                              ┌─────────────┐
                              │   Client    │
                              │  (React)    │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │    Nginx    │
                              │Load Balancer│
                              └──────┬──────┘
                     ┌───────────────┼───────────────┐
              ┌──────▼──────┐               ┌──────▼──────┐
              │  Backend    │               │  Backend    │
              │ Instance A  │◄──────────────┤ Instance B  │
              │  (Express)  │   stateless   │  (Express)  │
              └──────┬──────┘               └──────┬──────┘
                     │                              │
       ┌─────────────┼──────────────┬───────────────┤
       ▼             ▼              ▼                ▼
┌─────────────┐ ┌─────────┐  ┌───────────┐   ┌──────────────┐
│ PostgreSQL  │ │  Redis  │  │ RabbitMQ  │   │  AI Service  │
│(source of   │ │(cache + │  │  (async   │   │(Python/      │
│  truth)     │ │pub/sub +│  │  events)  │   │ FastAPI)     │
│             │ │rate lim)│  │           │   │              │
└─────────────┘ └─────────┘  └─────┬─────┘   └──────────────┘
                                    │
                              ┌─────▼─────┐
                              │  Worker   │
                              │ (Node.js, │
                              │ separate  │
                              │ process)  │
                              └───────────┘

Key architectural properties (each proven with a real test, not just designed):

Stateless application tier — JWT auth, Redis-backed rate limiting, verified with two real backend instances behind a load balancer
Concurrency-safe — atomic token generation + a database-level partial unique index, verified with a real 8-way concurrent load test
Fail-open on every optional dependency — Redis, RabbitMQ, and the AI service can each go down without breaking core functionality, verified by stopping each directly
AI is bounded, never autonomous — every AI output (predictions, recommendations, LLM-parsed intent) is validated against real data before use; AI has no code path capable of mutating data directly
🛠️ Tech Stack
Layer	Technology
Frontend	React, TypeScript, Vite, Tailwind CSS, React Router
Backend	Node.js, Express, TypeScript, Prisma
Database	PostgreSQL
Cache / Pub-Sub / Rate Limiting	Redis
Message Queue	RabbitMQ
Real-time	Socket.IO
AI Service	Python, FastAPI, scikit-learn, pandas
LLM	Groq (OpenAI-compatible API)
Auth	JWT, bcrypt
Observability	Pino (structured logging), custom metrics
Testing	Jest, Supertest
Infrastructure	Docker, Docker Compose, Nginx
📁 Project Structure
smart-queue-platform/
├── backend/                 # Express API + WebSocket server + background worker
│   ├── src/
│   │   ├── config/          # env, prisma, redis, rabbitmq clients
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── services/        # business logic
│   │   ├── routes/          # Express route definitions
│   │   ├── middleware/      # auth, rate limiting, idempotency, logging
│   │   ├── messaging/       # RabbitMQ producer + event definitions
│   │   ├── realtime/        # Socket.IO + Redis Pub/Sub
│   │   ├── utils/           # cache, metrics helpers
│   │   ├── __tests__/       # Jest + Supertest integration tests
│   │   ├── server.ts        # API entry point
│   │   └── worker.ts        # background worker entry point (separate process)
│   ├── prisma/               # schema + migrations
│   └── Dockerfile
├── ai-service/               # Python FastAPI microservice
│   ├── data/                 # synthetic dataset generation
│   ├── training/              # model training scripts
│   ├── models/                 # trained model artifacts (.pkl)
│   ├── schemas/                 # Pydantic request/response models
│   ├── services/                 # prediction logic
│   ├── main.py
│   └── Dockerfile
├── frontend/                  # React SPA
│   └── Dockerfile
├── nginx/
│   └── nginx.conf             # load balancer config
├── scripts/
│   └── concurrency-test.js     # standalone concurrent-load test script
├── docs/                        # phase-by-phase design documents
├── docker-compose.yml
└── .env                          # JWT_SECRET for Docker Compose
🚀 Getting Started
Option A — Docker Compose (recommended, single command)

Prerequisites: Docker Desktop

bash
git clone <your-repo-url>
cd smart-queue-platform

# Set a real JWT secret
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" > .env

docker compose up --build

Once all services are healthy:

Frontend: http://localhost:5173
Backend API: http://localhost:4000/api/health
AI Service: http://localhost:8000/health
RabbitMQ dashboard: http://localhost:15672 (guest/guest)

Run database migrations (first time only):

bash
docker compose exec backend npx prisma migrate deploy
Option B — Manual local setup

Prerequisites: Node.js 18+, Python 3.12+, Docker (for Postgres/Redis/RabbitMQ)

bash
# Infrastructure
docker run --name sq-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=smart_queue -p 5432:5432 -d postgres:16
docker run --name sq-redis -p 6379:6379 -d redis:7
docker run --name sq-rabbitmq -p 5672:5672 -p 15672:15672 -d rabbitmq:3-management

# Backend
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, etc.
npx prisma migrate dev
npm run dev             # API server, port 4000

# Worker (separate terminal)
npm run worker

# AI Service (separate terminal)
cd ../ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1   # or source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
python data/generate_data.py
python training/train_model.py
python data/generate_demand_data.py
python training/train_demand_model.py
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd ../frontend
npm install
npm run dev              # http://localhost:5173
🧪 Testing
bash
cd backend
npm test

Includes integration tests for authentication boundaries, real concurrent queue joins (verifying zero token collisions), queue state transitions, and idempotency-key behavior.

For a standalone stress test against a running instance:

bash
node scripts/concurrency-test.js <queue-id>
📊 Key Design Decisions
Why a monolith, not microservices? Documented in docs/phase-17-microservice-analysis.md — the AI service and worker are extracted for real, evidenced reasons (different runtime, independent scaling). Everything else stays in one deployable unit until real traffic evidence justifies further extraction — including a concrete audit of exactly what would need to change if it were.
Why RabbitMQ over Kafka? Simpler, sufficient for reliable background job distribution at this scale — no evidence of needing Kafka's high-throughput event-streaming model.
Why JWT over server-side sessions? Enables genuinely stateless horizontal scaling — verified directly with two real backend instances.
Why does AI never act directly? Every AI-touching endpoint (recommendations, natural-language search) only ever proposes data; all actual mutations go through the same validated, ownership-checked business logic as manual usage — verified directly, including under a deliberate prompt-injection attempt.
📄 License

This project was built as a personal learning exercise in full-stack development and system design.

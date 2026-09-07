# 🎫 Smart Queue Platform

An AI-powered virtual queue management platform that lets customers join queues remotely, track their live position and estimated wait time, and get notified as their turn approaches — while staff manage queue flow, view analytics, and forecast demand in real time.

Built incrementally across **22 phases** as a full-stack system design learning project, evolving from a simple monolith into a horizontally scalable, observable, containerized platform with real-time updates, asynchronous processing, and three distinct AI capabilities.

> **Core principle:** Every architectural decision was driven by an actual, demonstrated problem rather than added speculatively.

---

## ✨ Features

### 👤 Customers

* Register / login
* Browse organizations and services
* Join a queue and receive a token number
* View live queue position
* View AI-predicted waiting time
* Receive real-time updates via WebSockets

  * Turn called
  * Position changes
  * Queue status changes
* In-app notifications

  * Queue joined
  * Turn approaching
  * Your turn
  * Queue paused
  * Queue closed
* Natural-language search

  * Example: `"I need a haircut, no more than 20 min wait"`
* AI-ranked branch / queue recommendations

### 👨‍💼 Staff

* Create and manage organizations
* Create and manage services
* Create and manage queues
* Control queue lifecycle

  * Open
  * Pause
  * Resume
  * Close
* Call next customer
* Skip customers
* Complete customers
* View real-time queue statistics
* View historical analytics
* AI-powered demand forecasting by hour of day

---

# 🏗️ Architecture

```text
                              ┌─────────────┐
                              │   Client    │
                              │   React     │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │    Nginx    │
                              │Load Balancer│
                              └──────┬──────┘
                                     │
                     ┌───────────────┴───────────────┐
                     │                               │
              ┌──────▼──────┐               ┌──────▼──────┐
              │  Backend    │               │  Backend    │
              │ Instance A  │◄──────────────┤ Instance B  │
              │  Express    │   Stateless   │  Express    │
              └──────┬──────┘               └──────┬──────┘
                     │                              │
                     └──────────────┬───────────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐        ┌─────────────┐       ┌─────────────┐
      │ PostgreSQL  │        │    Redis    │       │  RabbitMQ   │
      │             │        │             │       │             │
      │ Source of   │        │ Cache       │       │ Async       │
      │ Truth       │        │ Pub/Sub     │       │ Events      │
      │             │        │ Rate Limit  │       │             │
      └─────────────┘        └─────────────┘       └──────┬──────┘
                                                           │
                                                    ┌──────▼──────┐
                                                    │   Worker    │
                                                    │  Node.js    │
                                                    │  Process    │
                                                    └─────────────┘

                              ┌─────────────┐
                              │ AI Service  │
                              │ Python /    │
                              │ FastAPI     │
                              └─────────────┘
```

---

## 🔑 Key Architectural Properties

Each architectural property was **proven with a real test**, rather than simply designed on paper.

### Stateless Application Tier

* JWT-based authentication
* Redis-backed rate limiting
* Multiple backend instances behind Nginx
* Verified using two real backend instances

### Concurrency Safe

* Atomic token generation
* Database-level partial unique index
* Verified using an **8-way concurrent load test**
* Zero token collisions under concurrent queue joins

### Fail-Open Optional Dependencies

Redis, RabbitMQ, and the AI service can independently go down without breaking core queue functionality.

Verified by directly stopping each dependency.

### AI Safety Boundary

AI is **bounded and never autonomous**.

Every AI output is validated against real application data before being used.

AI has no direct code path capable of mutating application data.

```text
User
  │
  ▼
AI Service
  │
  │ Suggest / Predict
  ▼
Validation Layer
  │
  │ Verify against real data
  ▼
Business Logic
  │
  ▼
Database
```

---

# 🛠️ Tech Stack

| Layer                               | Technology                                          |
| ----------------------------------- | --------------------------------------------------- |
| **Frontend**                        | React, TypeScript, Vite, Tailwind CSS, React Router |
| **Backend**                         | Node.js, Express, TypeScript, Prisma                |
| **Database**                        | PostgreSQL                                          |
| **Cache / Pub-Sub / Rate Limiting** | Redis                                               |
| **Message Queue**                   | RabbitMQ                                            |
| **Real-Time Communication**         | Socket.IO                                           |
| **AI Service**                      | Python, FastAPI, scikit-learn, pandas               |
| **LLM**                             | Groq (OpenAI-compatible API)                        |
| **Authentication**                  | JWT, bcrypt                                         |
| **Observability**                   | Pino, Custom Metrics                                |
| **Testing**                         | Jest, Supertest                                     |
| **Infrastructure**                  | Docker, Docker Compose, Nginx                       |

---

# 📁 Project Structure

```text
smart-queue-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/             # Environment, Prisma, Redis, RabbitMQ clients
│   │   ├── controllers/        # HTTP request handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # Express route definitions
│   │   ├── middleware/         # Auth, rate limiting, idempotency, logging
│   │   ├── messaging/          # RabbitMQ producer + event definitions
│   │   ├── realtime/           # Socket.IO + Redis Pub/Sub
│   │   ├── utils/              # Cache and metrics helpers
│   │   ├── __tests__/          # Jest + Supertest integration tests
│   │   ├── server.ts           # API entry point
│   │   └── worker.ts           # Background worker entry point
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   └── Dockerfile
│
├── ai-service/
│   ├── data/                   # Synthetic dataset generation
│   ├── training/               # Model training scripts
│   ├── models/                 # Trained model artifacts (.pkl)
│   ├── schemas/                # Pydantic request/response models
│   ├── services/               # Prediction logic
│   ├── main.py
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf              # Load balancer configuration
│
├── scripts/
│   └── concurrency-test.js     # Concurrent load test
│
├── docs/
│   └── phase-by-phase design documents
│
├── docker-compose.yml
├── .env
└── README.md
```

---

# 🚀 Getting Started

## Option A — Docker Compose

**Recommended:** Start the complete platform with Docker Compose.

### Prerequisites

* Docker Desktop
* Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-queue-platform
```

### 2. Create a JWT Secret

#### Linux / macOS

```bash
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" > .env
```

#### Windows PowerShell

```powershell
"JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" | Out-File -Encoding utf8 .env
```

### 3. Start All Services

```bash
docker compose up --build
```

### 4. Service URLs

| Service            | URL                              |
| ------------------ | -------------------------------- |
| Frontend           | http://localhost:5173            |
| Backend API        | http://localhost:4000/api/health |
| AI Service         | http://localhost:8000/health     |
| RabbitMQ Dashboard | http://localhost:15672           |

Default RabbitMQ credentials:

```text
Username: guest
Password: guest
```

### 5. Run Database Migrations

Run this the first time the project is started:

```bash
docker compose exec backend npx prisma migrate deploy
```

---

# 💻 Option B — Manual Local Setup

### Prerequisites

* Node.js 18+
* Python 3.12+
* Docker
* npm

Docker is used for PostgreSQL, Redis, and RabbitMQ.

---

## 1. Start Infrastructure

### PostgreSQL

```bash
docker run \
  --name sq-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smart_queue \
  -p 5432:5432 \
  -d postgres:16
```

### Redis

```bash
docker run \
  --name sq-redis \
  -p 6379:6379 \
  -d redis:7
```

### RabbitMQ

```bash
docker run \
  --name sq-rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -d rabbitmq:3-management
```

---

## 2. Start Backend

```bash
cd backend

npm install

cp .env.example .env
```

Configure the required environment variables such as:

```env
DATABASE_URL=
JWT_SECRET=
REDIS_URL=
RABBITMQ_URL=
AI_SERVICE_URL=
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the API server:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

---

## 3. Start Background Worker

Open another terminal:

```bash
cd backend
npm run worker
```

The worker runs as a separate Node.js process and handles asynchronous RabbitMQ events.

---

## 4. Start AI Service

Open another terminal:

```bash
cd ai-service
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Generate datasets:

```bash
python data/generate_data.py
python data/generate_demand_data.py
```

Train the models:

```bash
python training/train_model.py
python training/train_demand_model.py
```

Start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

AI service runs on:

```text
http://localhost:8000
```

---

## 5. Start Frontend

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🧪 Testing

Run the backend test suite:

```bash
cd backend
npm test
```

The test suite includes integration tests for:

* Authentication boundaries
* Concurrent queue joins
* Token collision prevention
* Queue state transitions
* Idempotency-key behavior

---

## ⚡ Concurrent Load Test

A standalone concurrency test is also provided.

Start the platform first, then run:

```bash
node scripts/concurrency-test.js <queue-id>
```

The test verifies that concurrent users joining the same queue do not receive duplicate token numbers.

---

# 📊 Key Design Decisions

## Why a Monolith Instead of Microservices?

The system intentionally started as a modular monolith.

The AI service and background worker were extracted only when there were concrete architectural reasons:

* AI service requires a different runtime
* AI workloads may need independent scaling
* Background jobs should not block API requests
* Worker processes can scale independently

Everything else remains inside a single deployable backend until real traffic or operational evidence justifies further extraction.

The analysis is documented in:

```text
docs/phase-17-microservice-analysis.md
```

---

## Why RabbitMQ Instead of Kafka?

RabbitMQ was selected because the system primarily needs:

* Reliable asynchronous job processing
* Work queues
* Event delivery
* Consumer acknowledgement
* Background task distribution

Kafka's high-throughput event-streaming model would add operational complexity without solving a demonstrated requirement at the current scale.

---

## Why JWT Instead of Server-Side Sessions?

JWT authentication allows the backend instances to remain stateless.

```text
                ┌─────────────┐
                │    Nginx    │
                └──────┬──────┘
                       │
              ┌────────┴────────┐
              │                 │
        ┌─────▼─────┐     ┌─────▼─────┐
        │ Backend A │     │ Backend B │
        └───────────┘     └───────────┘
              │                 │
              └────────┬────────┘
                       │
                 PostgreSQL
```

Authentication state does not need to be stored inside a particular backend instance.

This was verified using two real backend instances behind the load balancer.

---

## Why Does AI Never Act Directly?

AI is treated as a **decision-support component**, not an autonomous actor.

```text
                    User Request
                         │
                         ▼
                  ┌─────────────┐
                  │ AI Service  │
                  └──────┬──────┘
                         │
                    Prediction /
                    Recommendation
                         │
                         ▼
                  ┌─────────────┐
                  │ Validation  │
                  └──────┬──────┘
                         │
                  Verified Data
                         │
                         ▼
                  ┌─────────────┐
                  │  Business   │
                  │    Logic    │
                  └──────┬──────┘
                         │
                         ▼
                     Database
```

Every AI-powered operation is validated against real application data before being used.

AI cannot directly mutate application state.

This includes protection against deliberately malformed or prompt-injection-style inputs.

---

# 🤖 AI Capabilities

The platform contains **three distinct AI capabilities**.

### 1. Waiting-Time Prediction

Predicts estimated waiting time based on queue and service information.

### 2. Demand Forecasting

Forecasts queue demand by hour of day to help staff prepare for expected traffic.

### 3. Natural-Language Search & Recommendations

Users can describe what they need naturally.

Example:

```text
"I need a haircut and don't want to wait more than 20 minutes."
```

The system extracts the user's intent and ranks relevant branches / queues.

AI results are always bounded by real application data.

---

# 🔐 Reliability & Resilience

Optional dependencies are designed to **fail open** wherever possible.

| Dependency       | Failure Behavior                                     |
| ---------------- | ---------------------------------------------------- |
| Redis            | Core queue operations continue                       |
| RabbitMQ         | Core synchronous operations continue                 |
| AI Service       | Queue functionality continues without AI predictions |
| Database         | Required source of truth                             |
| Backend Instance | Traffic can be served by another instance            |

This ensures that optional infrastructure improves the system without becoming a single point of failure for core queue operations.

---

# 📈 System Design Concepts Demonstrated

This project was intentionally built as a **system design learning project**, not simply as a CRUD application.

Key concepts demonstrated include:

* Modular monolith architecture
* Horizontal scaling
* Stateless services
* Load balancing
* Database constraints
* Concurrency control
* Atomic operations
* Redis caching
* Redis Pub/Sub
* Rate limiting
* Message queues
* Event-driven architecture
* Asynchronous processing
* WebSockets
* Idempotency
* Graceful degradation
* Fault isolation
* AI service isolation
* API design
* Authentication and authorization
* Role-Based Access Control
* Structured logging
* Metrics and observability
* Containerization
* Docker Compose
* Background workers
* Microservice trade-offs

---

# 🧭 Development Approach

The platform was developed incrementally across **22 phases**.

The architecture evolved based on demonstrated requirements:

```text
Simple Monolith
      │
      ▼
Authentication
      │
      ▼
Queue Management
      │
      ▼
Concurrency Safety
      │
      ▼
Real-Time Updates
      │
      ▼
Redis
      │
      ▼
Asynchronous Processing
      │
      ▼
Background Worker
      │
      ▼
AI Service
      │
      ▼
Observability
      │
      ▼
Horizontal Scaling
      │
      ▼
Docker + Nginx
      │
      ▼
Production-Oriented Architecture
```

Each phase introduces a real engineering problem and then adds the minimum architectural complexity required to solve it.

---

# 📚 Documentation

Detailed phase-by-phase architecture and design decisions are available in:

```text
docs/
```

Important design documents include:

```text
docs/phase-17-microservice-analysis.md
```

---

# 📄 License

This project was built as a personal learning exercise in **full-stack development, distributed systems, AI integration, and system design**.

# AgriChain — AI-Powered Demand-to-Delivery Agricultural Supply Chain
**Smart India Hackathon (SIH 2026) Prototype**

AgriChain is an intelligent, transparent agricultural supply chain platform connecting institutional buyers, Farmer Producer Organizations (FPOs), individual farmers, and logistics providers. The system replaces fragmented multi-intermediary supply lines with direct AI-powered multi-supplier matching, consolidated freight dispatching, transparent price realization, and predictive demand planning.

---

## Architecture Overview

AgriChain is built as a multi-tier modular architecture:

```
                  ┌─────────────────────────────────────┐
                  │    Next.js 14 Frontend (App Router) │
                  │     TypeScript, Tailwind CSS, Maps  │
                  │              (Port 3000)            │
                  └──────────────────┬──────────────────┘
                                     │ REST / JWT
                                     ▼
                  ┌─────────────────────────────────────┐
                  │       NestJS Backend API Gateway    │
                  │  Prisma ORM, RBAC, Swagger, Routes  │
                  │              (Port 3001)            │
                  └─────────┬─────────────────┬─────────┘
                            │                 │
            ┌───────────────┴────┐       ┌────┴───────────────┐
            │   PostgreSQL 16    │       │   FastAPI Service  │
            │   (Port 5432)      │       │ Demand Forecasting │
            │   Prisma Client    │       │    (Port 8000)     │
            └────────────────────┘       └────────────────────┘
```

- **Frontend (`/frontend`)**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons, Recharts, Leaflet route mapping (`http://localhost:3000`).
- **Backend (`/backend`)**: NestJS, Prisma ORM, PostgreSQL, Passport JWT authentication, Swagger OpenAPI documentation (`http://localhost:3001/api`, docs at `http://localhost:3001/api/docs`).
- **AI Forecasting Service (`/ai-service`)**: FastAPI microservice delivering seasonal & historical regression demand forecasting (`http://localhost:8000`).
- **Database & Cache**: PostgreSQL 16 & Redis 7 via Docker Compose.

---

## Demo Credentials

All seeded accounts share the same password: **`demo123`**

| Role | Email | Name / Entity | Purpose |
|------|-------|---------------|---------|
| **Buyer** | `buyer@mumbai.com` | Vikram Mehta (SpiceRoute Restaurants) | Post demand, run AI matching, order |
| **Logistics** | `logistics@agrichain.in` | Raj Transport Services / Cold Chain | Accept transport jobs, update transit status |
| **FPO A** | `fpo.nashik@agrichain.in` | Nashik Sunrise FPO (45 members) | Supply aggregator (3,000 kg Grade-A Tomato) |
| **FPO B** | `fpo.pune@agrichain.in` | Pune Sahyadri FPO (62 members) | Supply aggregator (4,000 kg Grade-A Tomato) |
| **Farmer C**| `farmer.rajesh@agrichain.in` | Rajesh Patil (Patil Organic Farm) | Direct farm listing (2,000 kg Grade-A Tomato) |
| **Farmer D**| `farmer.sunita@agrichain.in` | Sunita Deshmukh (Deshmukh Veg Farm)| Direct farm listing (1,000 kg Grade-A Tomato) |
| **Admin** | `admin@agrichain.in` | System Administrator | Platform analytics & user oversight |

---

## Getting Started & Setup

### Prerequisites
- Node.js 18+ (tested with v24) & npm
- Docker & Docker Compose
- Python 3.10+ (optional, for standalone AI microservice)

### 1. Database Infrastructure (Docker)
Run PostgreSQL and Redis containers:
```bash
docker compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run start:dev
```
Backend will start on `http://localhost:3001`.
- API documentation (Swagger): `http://localhost:3001/api/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. AI Forecasting Service (Optional)
The NestJS backend includes built-in fallback demand estimation. To optionally run the dedicated FastAPI microservice:
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --port 8000
```

---

## End-to-End Demo Walkthrough

### Step 1: Buyer Demand Creation & AI Matching
1. Navigate to `http://localhost:3000/login` and log in with **`buyer@mumbai.com`** / **`demo123`**.
2. View existing demands or click **Create Demand**:
   - Product: **Tomato**
   - Quantity: **10,000 kg** (10 Tonnes)
   - Quality Grade: **Grade A**
   - Max Price: **₹25.00 / kg**
   - Delivery Location: **Mumbai**
   - Required By: **20 Sept 2026**
3. Click **Submit Demand**.
4. On the Demands page, click **Run AI Matching →**:
   - The multi-objective combinatorial solver discovers optimal suppliers totaling 10,000 kg:
     - **Nashik Sunrise FPO**: ~3,000 kg @ ₹21.00
     - **Pune Sahyadri FPO**: ~4,000 kg @ ₹22.00
     - **Rajesh Patil**: ~2,000 kg @ ₹20.00
     - **Sunita Deshmukh**: ~1,000 kg @ ₹21.50
   - Review match scores, distance, quality, and consolidation tree.

### Step 2: Confirmation & Consolidated Order Creation
1. Click **Confirm Suppliers & Create Order**.
2. AgriChain generates a consolidated Order (`ORD-...`), updates demand to `FULFILLED`, reserves inventory, and automatically creates a consolidated **Logistics Job**.
3. Inspect the **Order Detail Page**:
   - Visual Order Timeline: `CONFIRMED` → `PROCESSING`
   - Sourcing Breakdown table with per-supplier payouts
   - Transparent Price Breakdown card: buyer price, logistics fee, platform fee, and farmer net realization.

### Step 3: Logistics Dispatch & Execution
1. Open an incognito window or log out and log in with **`logistics@agrichain.in`** / **`demo123`**.
2. Visit **Available Jobs** (`/dashboard/logistics/jobs`).
3. Select vehicle `MH-04-AB-1234` (Raj Cold Chain) and click **Accept & Assign Vehicle**.
4. Head to **My Jobs** (`/dashboard/logistics/my-jobs`) or **Route Map** (`/dashboard/logistics/routes`):
   - View optimized multi-stop pickup sequence (Nashik → Pune → Mumbai).
   - View total mileage, estimated time, and route savings.
5. Advance the job status:
   - Click **Start Transit** (`IN_PROGRESS` → order becomes `IN_TRANSIT`).
   - Click **Mark Delivered** (`COMPLETED` → order becomes `DELIVERED`).

### Step 4: Farmer / FPO Settlement & Transparency
1. Log in with **`fpo.nashik@agrichain.in`** or **`farmer.rajesh@agrichain.in`** / **`demo123`**.
2. View **Earnings & Orders**:
   - Exact payout realized for supplied quantity.
   - Elimination of unauthorized APMC commission deductions.

### Step 5: Admin Platform Oversight
1. Log in with **`admin@agrichain.in`** / **`demo123`**.
2. View real-time platform metrics: total transaction volume, active demands, regional crop demand trends, and system health.

---

## Important Notice on Estimates & Disclaimers

> **Transparency Note**: In accordance with SIH prototype guidelines:
> - All potential farmer savings, route optimizations, and price comparisons are **ESTIMATES** calculated using standard benchmark models against traditional mandi intermediaries.
> - Demand forecast figures are **PREDICTIVE ESTIMATES** based on regional seasonal factors and historical patterns; actual market volumes and yields may vary.

# AgriChain — Next Work Handoff

Copy the **PROMPT** below into a new Cursor chat in `d:\Farmer`. Do **not** rebuild the project. Finish remaining screens, then run, fix, seed, and document.

---

## PROMPT (paste this)

```
Continue the existing SIH prototype in d:\Farmer. Do NOT start from scratch. Do NOT rewrite working backend modules unless they are broken.

PROJECT: AgriChain — AI-Powered Demand-to-Delivery Agricultural Supply Chain
Stack already in place:
- backend: NestJS + Prisma + PostgreSQL + JWT RBAC (port 3001, prefix /api, Swagger /api/docs)
- frontend: Next.js 14 App Router + TypeScript + Tailwind (port 3000)
- ai-service: FastAPI forecast service (port 8000)
- docker-compose.yml: postgres:5432, redis:6379
- seed: backend/prisma/seed.ts (password for all demo users: demo123)

GOAL: Finish remaining UI, then actually run the stack, fix compile/API/DB errors, verify the full demo flow, write README with setup + demo credentials.

==================================================
A. CREATE THESE MISSING FRONTEND PAGES (required)
==================================================

Nav already points here from frontend/src/components/layout/DashboardLayout.tsx — pages do not exist yet:

1. frontend/src/app/dashboard/buyer/demands/page.tsx
   - List buyer demands via api.buyers.demands()
   - Link each row to /dashboard/buyer/matching/[id]

2. frontend/src/app/dashboard/buyer/supply/page.tsx
   - List available supply via api.buyers.supply()
   - Table: product, supplier, qty, grade, price, location, harvest date

3. frontend/src/app/dashboard/logistics/page.tsx
   - Provider profile via api.logistics.profile()
   - Vehicles list, job counts, professional B2B dashboard

4. frontend/src/app/dashboard/logistics/jobs/page.tsx
   - Available jobs via api.logistics.jobs()
   - Accept/assign using api.logistics.assignJob(jobId, providerId, vehicleId)

5. frontend/src/app/dashboard/logistics/my-jobs/page.tsx
   - Assigned jobs via api.logistics.myJobs()
   - Update status: IN_PROGRESS, COMPLETED via api.logistics.updateStatus
   - Link to job detail / route

6. frontend/src/app/dashboard/logistics/routes/page.tsx
   - Show optimized route map using existing RouteMap component
   - Pickup sequence, distance, ETA, vehicle capacity, estimated cost
   - Load from latest job or allow selecting a job

7. frontend/src/app/dashboard/forecast/page.tsx
   - Demand forecasting dashboard
   - Default: Tomato / Mumbai via api.forecast.get('Tomato','Mumbai')
   - Product + location selectors
   - Show ESTIMATE labels: current weekly demand, predicted, % change, shortage
   - Disclaimer: estimate, not guaranteed

Optional but useful:
8. frontend/src/app/dashboard/buyer/price/[id]/page.tsx — standalone price transparency using api.orders.priceBreakdown(id)

Match existing UI: white/light bg, navy/dark-green accents, cards, tables, StatusBadge. No cartoon/SaaS rainbow.

==================================================
B. SMALL FIXES / GAPS
==================================================

- Add frontend/next-env.d.ts if missing
- Add frontend/src/app/dashboard/logistics/[jobId] detail if needed for tracking
- Buyer dashboard "Open Listings Viewed" currently shows "—" — wire or remove
- Logistics POST /logistics/jobs body is { orderId } — Nest @Body('orderId') — verify this works
- RouteMap uses dynamic leaflet import — ensure CSS import does not break Next.js; use a client-only map
- Seed unused vars in backend/prisma/seed.ts (listingFpoA, truck, admin) — either use them or prefix with _ so tsc is clean
- Confirm matching still works when grade/price filters exclude listings
- After confirming order, auto-assign seeded logistics vehicle if easy (Raj Cold Chain, MH-04-AB-1234)

==================================================
C. DEMO FLOW THAT MUST WORK END-TO-END
==================================================

Login buyer@mumbai.com / demo123
→ Create 10,000 kg Grade A Tomato demand, max ₹25/kg, Mumbai, required 20 Sept 2026
→ AI matching finds combination totaling 10T:
   FPO A Nashik Sunrise ~3000kg, FPO B Pune Sahyadri ~4000kg, Farmer C Rajesh Patil ~2000kg, Farmer D Sunita Deshmukh ~1000kg
→ Confirm → create consolidated order → create logistics job + route
→ Order tracking: timeline, consolidation tree, price breakdown, map
→ Logistics login can assign vehicle and update IN_TRANSIT / DELIVERED
→ Admin dashboard metrics update

Demo accounts (password demo123):
- admin@agrichain.in
- buyer@mumbai.com
- fpo.nashik@agrichain.in
- fpo.pune@agrichain.in
- farmer.rajesh@agrichain.in
- farmer.sunita@agrichain.in
- logistics@agrichain.in

==================================================
D. RUN AND VERIFY (mandatory before finishing)
==================================================

1. docker compose up -d
2. backend: npm install, npx prisma generate, npx prisma db push, npm run prisma:seed, npm run start:dev
3. frontend: npm install, npm run dev
4. ai-service optional: pip install -r requirements.txt, uvicorn main:app --port 8000
5. Fix ALL compile errors, Prisma errors, API 4xx/5xx in the demo flow
6. Test login for each role
7. Test full buyer matching → order → logistics → admin

==================================================
E. README
==================================================

Write README.md at repo root with:
- What the project is
- Architecture (frontend / NestJS / Prisma / FastAPI / Docker)
- Setup (Docker, backend, frontend, AI service)
- Demo credentials
- Demo walkthrough
- API docs URL
- Note that savings/forecasts are ESTIMATES

Do not claim guaranteed farmer income increases.

Keep professional SIH 2026 prototype quality. Prioritize working DEMAND → MATCHING → CONSOLIDATION → LOGISTICS → SETTLEMENT over extra features.
```

---

## Files already built (do not recreate unless broken)

### Root
- `docker-compose.yml`
- `.gitignore`

### Backend (`backend/`)
- `package.json`, `tsconfig.json`, `nest-cli.json`, `.env`, `.env.example`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/main.ts`, `src/app.module.ts`
- `src/prisma/prisma.module.ts`, `src/prisma/prisma.service.ts`
- `src/common/utils/geo.util.ts`, `route.util.ts`, `matching.util.ts`
- `src/auth/*` (JWT, register, login, roles)
- `src/products/*`
- `src/farmers/*`
- `src/buyers/*`
- `src/matching/*`
- `src/orders/*`
- `src/logistics/*`
- `src/routes/*`
- `src/forecast/*`
- `src/analytics/*`

### AI (`ai-service/`)
- `main.py`
- `requirements.txt`

### Frontend already present
- `frontend/package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.env.local`
- `src/app/globals.css`, `layout.tsx`, `page.tsx` (landing)
- `src/app/login/page.tsx`, `register/page.tsx`
- `src/lib/api.ts`
- `src/components/layout/DashboardLayout.tsx`
- `src/components/ui/StatusBadge.tsx`, `ScoreBar.tsx`, `OrderTimeline.tsx`, `ConsolidationTree.tsx`, `PriceBreakdownCard.tsx`
- `src/components/map/RouteMap.tsx`
- Buyer: dashboard, create-demand, matching/[id], orders, orders/[id]
- Farmer/FPO: dashboards, listings, demands, matching, orders, earnings
- Admin: analytics dashboard, users placeholder

---

## Files the next agent should create

| File | Purpose |
|------|---------|
| `frontend/src/app/dashboard/buyer/demands/page.tsx` | Buyer demand list |
| `frontend/src/app/dashboard/buyer/supply/page.tsx` | Available supply |
| `frontend/src/app/dashboard/logistics/page.tsx` | Logistics dashboard |
| `frontend/src/app/dashboard/logistics/jobs/page.tsx` | Available jobs |
| `frontend/src/app/dashboard/logistics/my-jobs/page.tsx` | Assigned jobs + status updates |
| `frontend/src/app/dashboard/logistics/routes/page.tsx` | Route optimization map |
| `frontend/src/app/dashboard/forecast/page.tsx` | Demand forecast dashboard |
| `frontend/next-env.d.ts` | Next types (if missing) |
| `README.md` | Setup + demo credentials |

Optional:
| File | Purpose |
|------|---------|
| `frontend/src/app/dashboard/buyer/price/[id]/page.tsx` | Standalone price transparency |
| `frontend/src/app/dashboard/logistics/jobs/[id]/page.tsx` | Job detail + map |

---

## Key APIs already implemented

- `POST /api/auth/login` `{ email, password }`
- `POST /api/buyers/demands`
- `GET /api/matching/demand/:id` (runs matching)
- `POST /api/matching/confirm` `{ demandId, matchIds }`
- `POST /api/orders` `{ demandId, matchIds }`
- `GET /api/orders/:id`
- `GET /api/orders/:id/price-breakdown`
- `POST /api/logistics/jobs` `{ orderId }`
- `PATCH /api/logistics/jobs/:id/assign` `{ providerId, vehicleId }`
- `PATCH /api/logistics/jobs/:id/status` `{ status }`
- `POST /api/routes/optimize`
- `GET /api/forecast/:product/:location`
- `GET /api/analytics/dashboard`

Auth header: `Bearer <jwt>`

---

## Env

Backend `.env`:
```
DATABASE_URL=postgresql://agri_user:agri_pass@localhost:5432/agri_chain?schema=public
JWT_SECRET=agri-chain-sih-2026-secret-key-change-in-prod
PORT=3001
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
AI_SERVICE_URL=http://localhost:8000
```

Frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000 wait no — http://localhost:3001/api
```
Use `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

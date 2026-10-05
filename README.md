# CampusRide (Common Transportation Finder)
**College Mini Project — Department of Artificial Intelligence & Data Science**  
**D.Y. Patil College of Engineering (DYPCOE), Akurdi, Pune - 411044**

---

## 📌 Executive Summary

**CampusRide** is a college-only carpooling Progressive Web Application (PWA) designed specifically for students and faculty of DYPCOE Akurdi. It enables peers traveling along similar Pune transit corridors with compatible lecture arrival times to discover each other and coordinate shared commutes.

### 🎯 Key Engineering Pillars & Strict Scope Boundaries
1. **NO Chat / Messaging of Any Kind**:
   - Replaced by the **Verified Contact Model**: Survey showed 68% of students prefer direct phone calls.
   - Phone numbers remain masked (e.g. `+91 98••••••21`) until a ride request is **mutually accepted**.
   - Upon acceptance, an unmasked phone number and a direct 1-tap **"Call Student" (`tel:...`)** link are revealed.
   - Exact home addresses are never shown; only approximate pickup zones are displayed with a privacy circular buffer.
2. **NO Fees, Prices, Fares, or Cost-Splitting**:
   - Zero commercial or monetary calculation elements. Carpooling is peer-driven for carbon reduction and parking decongestion.
   - **Amber (`#FEA619` / `#855300`) Repurposed**: Dedicated exclusively to seat availability highlights, arrival time window warnings, and Eco-Impact (CO2 saved) achievements.
   - Bottom Navigation: **Home**, **My Rides**, **Requests**, **Profile**.
3. **Role Flexibility**:
   - Single student account that dynamically switches between **"Need a Ride"**, **"Offer a Ride"**, or **"Both"** anytime.
4. **Spatial Route Matching Engine**:
   - Polyline buffer intersection ($\ge 60\%$), $500\text{ m}$ pickup walking proximity, and arrival time compatibility ($\le 15\text{ min}$) with guaranteed **zero false matches**.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS (v3 with Stitch tokens).
- **PWA**: `vite-plugin-pwa` with service worker, offline fallback banner, and manifest.
- **Maps & Routing**: Leaflet + OpenStreetMap raster tiles (100% free, no paid API keys); route geometry via OSRM public API and Nominatim geocoding with local offline Pune corridor fallbacks.
- **Database & Backend**:
  - Full PostgreSQL / Supabase SQL schema with 13 tables, enums, triggers, and Row Level Security (`supabase/migrations/001_initial_schema.sql` and `supabase/seed.sql`).
  - **Zero-Friction Client Demo Store**: Instant out-of-the-box local storage engine with ~20 realistic DYPCOE students across Akurdi, Wakad, Hinjawadi, Ravet, and Nigdi corridors.
- **Testing**: Vitest automated test suite covering **TC-01 through TC-10**, state machine transitions, and spatial math.

---

## 📐 Design Tokens (Stitch Alignment)

CampusRide strictly reuses the tokens defined in `design/DESIGN.md` and the visual layout of `design/code.html`:
- **Canvas / Surface**: `#F8F9FF`
- **Primary Teal**: `#005C55` (base), `#0F766E` (container / CTA), `#A3FAEF` (on-container)
- **Secondary Amber**: `#FEA619` / `#855300` (repurposed for seats, alerts, CO2 stats)
- **Tertiary Blue**: `#0047BF` / `#EFF6FF` (reserved exclusively for DYPCOE ID verification)
- **Ergonomics**: Minimum 48px touch targets, 52px input fields, rounded-2xl cards, pill badges, and Inter typography.

---

## 🚀 Quick Start & Setup

### Prerequisites
- Node.js LTS (v18+) and npm

### 1. Clone & Install Dependencies
```bash
cd ctf
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(By default, `.env` runs in instant Demo Mode without needing external Supabase credentials).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your mobile browser or desktop Chrome with mobile emulation.

### 4. Run Automated Test Suite
```bash
npm test
```
All 23 automated tests (including TC-01 through TC-10) will execute and verify the matching engine, privacy rules, and state machine.

### 5. Build for Production
```bash
npm run build
```

---

## 🧪 Automated Test Suite Matrix

| Test Case | Description | Result |
| :--- | :--- | :---: |
| **TC-01** | Valid registration with college email domain creates a student profile | ✅ PASS |
| **TC-02** | Invalid or non-college domain (`@gmail.com`) is rejected with correction error | ✅ PASS |
| **TC-03** | "Offer ride" profile is discoverable by compatible passengers | ✅ PASS |
| **TC-04** | "Looking for ride" passenger is discoverable by compatible drivers | ✅ PASS |
| **TC-05** | Compatible routes ($\ge 60\%$ overlap) and arrival times ($\le 15$ min) produce a match | ✅ PASS |
| **TC-06** | Creating a ride request triggers real-time in-app notification | ✅ PASS |
| **TC-07** | Contact number remains masked until acceptance, then unmasked with direct call capability | ✅ PASS |
| **TC-08** | Location sharing is active only during accepted ride and ceases on completion | ✅ PASS |
| **TC-09** | Verified badge appears strictly for verified students | ✅ PASS |
| **TC-10** | Incompatible route or arrival time returns no-match and creates nothing | ✅ PASS |

---

## 🎬 Step-by-Step Demo Guide for Evaluators

### Scenario 1: Quick Demo Login & Commute Search
1. Open the app at `http://localhost:5173`.
2. Tap through the 3 onboarding slides or tap **Skip**.
3. On the Auth screen, tap **Demo Rider (Sneha)** to sign in instantly as Sneha Patil (TE Computer Engg).
4. On the Home screen:
   - Notice the role toggle is set to **"Need a Ride"**.
   - Pickup is prefilled with **"Datta Mandir Road, Wakad"**.
   - Arrival window is set to **08:45 - 09:00 AM**.
   - Notice there are **NO price tags** anywhere.
5. Tap **Find College Matches**.

### Scenario 2: Corridor Matches & Privacy-Preserving Map
1. The **Matching Peers** screen displays compatible drivers on the Wakad $\rightarrow$ Akurdi corridor.
2. Tap **Details** on Rohan Sharma's card:
   - Inspect the interactive Leaflet map displaying both routes with the overlapping segment highlighted.
   - Notice the **Approximate Pickup Zone** circular buffer and privacy guarantee notice.
   - Notice the driver's vehicle specs (Tata Nexon EV, 3 seats available).
3. Tap **Request Ride with Rohan Sharma**.

### Scenario 3: Contact Model & Phone Unmasking
1. Go to the **Profile** tab $\rightarrow$ tap the **Switch Demo Account** dropdown $\rightarrow$ select **Rohan Sharma (OFFER)**.
2. Rohan receives an in-app notification: *"New Ride Request Received"*.
3. Tap the **Requests** tab:
   - Notice Sneha's incoming request is shown in the **Incoming** queue.
   - Observe that her phone number is **masked** (`+91 97••••••90`) with the label *"Revealed when accepted"*.
4. Tap **Accept Request**:
   - The card status turns to **Accepted**.
   - The phone number unmasks to `+91 97654 32190`.
   - The green/teal **Call** button activates with a direct `tel:+919765432190` link.

### Scenario 4: Active Ride Lifecycle & Eco Impact
1. Tap **View Active Ride Status**:
   - Inspect the visual stepper: `Created` $\rightarrow$ `Searching` $\rightarrow$ `Match Found` $\rightarrow$ `Contacted` $\rightarrow$ `Accepted` $\rightarrow$ `Completed`.
   - Toggle the **Share Live GPS with Peer** switch.
2. Tap **Mark Ride as Completed**:
   - The celebration modal launches with eco confetti.
   - View the **Campus Climate Achievement** card: *"0.94 kg CO2 Saved!"* (avoided 7.8 km of solo driving).
3. Submit a 5-star rating with a note.
4. The app redirects to **My Rides** showing updated cumulative rides and carbon savings.

### Scenario 5: College Admin Verification Portal
1. Tap **Profile** $\rightarrow$ tap **Open Admin Dashboard** (or switch account to `Prof. Dr. S. K. Mahajan`).
2. View live statistics: **Verified Students**, **Campus CO2 Saved**, and total pooled commutes.
3. In the **Pending Student ID Approvals** queue, view Kavita Bhosale's uploaded college ID photo with zoom preview.
4. Tap **Approve ID**:
   - The student instantly receives the tertiary blue **Verified Student** badge across the system.

### Scenario 6: Strict Zero-False-Match Guarantee (TC-10)
1. Return to the Home screen and enter a distant, incompatible pickup (e.g. *"Katraj Snake Park"* or arrival time *"11:45 AM"*).
2. Tap **Find College Matches**:
   - The app displays an explicit *"No Suitable Route Match Right Now"* empty state.
   - Zero false or incompatible matches are ever created.

---

## 🗄️ Database Tables (`supabase/migrations/001_initial_schema.sql`)

1. `students` — College credentials, department, year, role, verification status, CO2 metrics.
2. `verification_requests` — ID photo uploads, PRN verification, reviewer log.
3. `vehicles` — Vehicle type (two-wheeler / car), model, license plate, seats.
4. `locations` — Pune transit landmarks & DYPCOE campus coordinates.
5. `routes` — GeoJSON polylines, arrival windows, active commute days.
6. `matches` — Spatial overlap %, arrival delta, shared days.
7. `ride_requests` — Lifecycle status machine records.
8. `rides` — Active & completed rides with CO2 calculation ($dist \times 0.12\text{ kg}$).
9. `notifications` — In-app realtime alerts.
10. `ratings` — 1 to 5 star peer reviews and feedback.
11. `reports` — Student conduct grievance reports.
12. `blocked_users` — Safety peer blocks.
13. `privacy_settings` — Location sharing and phone masking toggles.

---

## 👥 Contributors & Academic Context

- **Department**: Department of Artificial Intelligence & Data Science
- **Institution**: D.Y. Patil College of Engineering (DYPCOE), Akurdi, Pune
- **Project**: Mini Project / Common Transportation Finder (CampusRide)

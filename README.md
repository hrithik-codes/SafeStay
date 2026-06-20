# SafeStay — Safety-First Hotel Booking

A hotel booking demo where **safety isn't a filter, it's a gate.** Inspired by recent hotel fire
incidents in Delhi: hotels that fail mandatory fire/structural checks cannot be booked through
this platform, full stop — regardless of price, star rating, or how the request is made
(the gate is enforced server-side, not just hidden in the UI).

## Stack
- **Backend:** Python + Flask + SQLite
- **Frontend:** Tailwind CSS (CDN) + vanilla JS + Leaflet.js / OpenStreetMap
- No build step, no node install needed for the frontend.

## Quick start

```bash
cd backend
pip install -r requirements.txt
python seed_data.py      # builds hotels.db with 20 demo hotels + safety data
python app.py             # runs on http://localhost:5000
```

Then open **http://localhost:5000** in a browser. (Requires internet access for the
Tailwind/Leaflet/Google Fonts CDN scripts — standard for a hackathon demo machine.)

## How the safety system works

### 1. Hard gate (booking eligibility)
Every hotel carries real-feeling compliance data: Fire Dept NOC, working fire extinguishers,
marked emergency exits, fire escape staircase (mandatory for 4+ floor buildings), fire alarm,
sprinklers, electrical & structural safety certs. **If a hotel is missing any critical item
(NOC, extinguishers, marked exits, or fire escape on tall buildings), it is hard-blocked from
booking** — the `/api/bookings` endpoint re-validates this server-side, so the gate can't be
bypassed by editing the frontend.

### 2. Weighted safety score (0–100)
Hotels that pass the gate get a weighted score from the hard factors above plus CCTV coverage,
lighting, guard coverage, etc. This drives the "Verified / Caution / Unsafe" tier shown
everywhere.

### 3. Traveller-type lens (dynamic)
The same underlying data is **re-weighted** for who's travelling — Solo Female, Solo Traveller,
Family, Group, Travelling with Children — so a hotel's displayed score changes based on what
matters most for that trip (e.g. female staff/24×7 security weigh heavily for solo female
travellers; child-proofing/hospital proximity weigh heavily for families). Switchable on both
the homepage and hotel detail page.

### 4. Safety Map
`/map` — every hotel plotted on a real Leaflet/OpenStreetMap map, pins colour-coded by safety
tier (green = verified, amber = caution, red = unsafe/blocked), with a small badge on pins
that hold both a valid Fire NOC *and* structural safety certificate.

### 5. Blocked → alternatives
Visiting a blocked hotel's page shows exactly which checks it failed, disables the booking
button, and surfaces the nearest hotels that *do* pass every check, sorted by distance.

### 6. Check-in documents
Every hotel page lists the standard documents required at check-in (ID proof, address proof,
passport/visa for foreign nationals, etc.) per the local C-Form requirement.

## Project structure

```
backend/
  app.py            Flask app, all routes (pages + JSON API)
  safety_engine.py  Traveller-type scoring logic
  seed_data.py      DB schema + 20 seeded demo hotels (run once to build hotels.db)
  hotels.db         SQLite DB (generated)
frontend/
  templates/        Jinja2 HTML (base.html, index.html, hotel.html, map.html)
  static/css/       Design system (style.css)
  static/js/        app.js (search/listing), hotel.js (detail + booking gate), map.js (Leaflet)
```

## Demo script suggestion (for judges)
1. Show the homepage — point out the live count: "X pass mandatory checks, Y blocked."
2. Switch "Travelling as" to **Solo Female Traveller** — show the ranking and scores change.
3. Click into a **caution-tier** hotel — show the full inspection-style checklist.
4. Click into a hotel tagged **Unsafe** — try to book it. Show the blocked modal with the
   exact failed checks, then scroll to "Safer Alternatives Nearby."
5. Open `/map` — show the colour-coded pins and the certification badge.

## Notes
- All hotel names, certificates, and safety data are **simulated for this demo** and do not
  represent real properties or government records.
- Database is SQLite for zero-setup; swap `DB_PATH` in `app.py` for Postgres easily if needed later.

"""
SafeStay — Database schema + seed data
Builds hotels.db with hotels that carry hard safety-compliance fields.
Run: python seed_data.py
"""

import sqlite3
import os
import random

DB_PATH = os.path.join(os.path.dirname(__file__), "hotels.db")

SCHEMA = """
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS bookings;

CREATE TABLE hotels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    price_per_night INTEGER NOT NULL,
    star_rating REAL NOT NULL,
    image_seed TEXT NOT NULL,
    description TEXT,

    -- HARD SAFETY COMPLIANCE FIELDS (gate booking) --
    fire_noc BOOLEAN NOT NULL,                 -- Fire dept No Objection Certificate
    fire_extinguishers BOOLEAN NOT NULL,       -- Serviced extinguishers present
    fire_extinguisher_count INTEGER NOT NULL,
    marked_exits BOOLEAN NOT NULL,             -- Illuminated / marked emergency exits
    exit_count INTEGER NOT NULL,
    fire_alarm_system BOOLEAN NOT NULL,
    sprinkler_system BOOLEAN NOT NULL,
    electrical_safety_cert BOOLEAN NOT NULL,
    structural_safety_cert BOOLEAN NOT NULL,
    last_fire_drill TEXT,                      -- date string
    building_floors INTEGER NOT NULL,
    has_fire_escape_staircase BOOLEAN NOT NULL,

    -- SOFT / TRAVELLER-PROFILE FACTORS (feed dynamic scores) --
    cctv_coverage INTEGER NOT NULL,            -- 0-100 % coverage estimate
    well_lit_corridors BOOLEAN NOT NULL,
    female_staff_front_desk BOOLEAN NOT NULL,
    in_room_safe BOOLEAN NOT NULL,
    keycard_floor_access BOOLEAN NOT NULL,     -- restricted floor access via keycard
    child_proofing BOOLEAN NOT NULL,           -- socket guards, pool fencing etc.
    pool_lifeguard BOOLEAN NOT NULL,
    near_hospital_km REAL NOT NULL,
    near_police_km REAL NOT NULL,
    security_24x7 BOOLEAN NOT NULL,
    id_verification_strict BOOLEAN NOT NULL,
    group_friendly_rooms BOOLEAN NOT NULL,     -- connecting/multi-bed rooms

    -- META --
    safety_score INTEGER NOT NULL,             -- 0-100 computed base score
    safety_tier TEXT NOT NULL,                  -- 'verified' | 'caution' | 'unsafe'
    is_bookable BOOLEAN NOT NULL
);

CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_id INTEGER NOT NULL,
    guest_name TEXT NOT NULL,
    checkin TEXT NOT NULL,
    checkout TEXT NOT NULL,
    traveller_type TEXT NOT NULL,
    total_price INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);
"""

# Jaipur-centric + a few other Indian cities for variety, real-ish coordinates
HOTELS_RAW = [
    # name, city, area, lat, lng, price, stars, floors
    ("Amber Heritage Residency", "Jaipur", "Amer Road", 26.9855, 75.8513, 4200, 4.2, 5),
    ("Pink City Grand", "Jaipur", "MI Road", 26.9196, 75.8194, 3500, 4.0, 8),
    ("Hawa Mahal View Hotel", "Jaipur", "Badi Choupad", 26.9239, 75.8267, 2800, 3.6, 4),
    ("Rambagh Boutique Stay", "Jaipur", "Rambagh", 26.8951, 75.8090, 6200, 4.6, 3),
    ("Jal Mahal Inn", "Jaipur", "Jal Mahal Road", 26.9537, 75.8463, 2200, 3.2, 6),
    ("Nahargarh Nest", "Jaipur", "Nahargarh", 26.9373, 75.8156, 3100, 3.8, 4),
    ("City Palace Suites", "Jaipur", "Tripolia Bazaar", 26.9258, 75.8237, 5400, 4.4, 6),
    ("Galta Gate Lodge", "Jaipur", "Galta Ji Road", 26.9293, 75.8520, 1800, 2.9, 5),
    ("Tonk Road Business Hotel", "Jaipur", "Tonk Road", 26.8467, 75.8056, 3300, 3.7, 10),
    ("Vaishali Nagar Comfort Inn", "Jaipur", "Vaishali Nagar", 26.9123, 75.7368, 2600, 3.5, 7),
    ("Malviya Nagar Staywell", "Jaipur", "Malviya Nagar", 26.8580, 75.8060, 2400, 3.3, 5),
    ("Civil Lines Heritage Manor", "Jaipur", "Civil Lines", 26.9080, 75.8030, 4800, 4.3, 3),
    ("Sindhi Camp Budget Stay", "Jaipur", "Sindhi Camp", 26.9239, 75.7982, 1200, 2.4, 6),
    ("Raja Park Residency", "Jaipur", "Raja Park", 26.9036, 75.8265, 2100, 3.1, 4),
    ("Mansarovar Family Suites", "Jaipur", "Mansarovar", 26.8645, 75.7575, 2900, 3.9, 6),
    ("Connaught Comfort Delhi", "Delhi", "Connaught Place", 28.6315, 77.2167, 4500, 4.1, 9),
    ("Karol Bagh Inn", "Delhi", "Karol Bagh", 28.6519, 77.1909, 2000, 3.0, 7),
    ("Paharganj Backpacker Hub", "Delhi", "Paharganj", 28.6447, 77.2167, 1100, 2.2, 5),
    ("Aerocity Skyline Hotel", "Delhi", "Aerocity", 28.5562, 77.1180, 7200, 4.7, 12),
    ("Saket Garden Stay", "Delhi", "Saket", 28.5245, 77.2066, 3400, 3.8, 6),
]

CITY_HOSPITAL_RANGE = (0.3, 5.0)
CITY_POLICE_RANGE = (0.2, 3.5)


def compute_safety_score(h):
    """Weighted base safety score 0-100 from hard + soft factors."""
    score = 0
    # Hard factors — heavily weighted (life-safety critical)
    score += 18 if h["fire_noc"] else 0
    score += 12 if h["fire_extinguishers"] else 0
    score += 12 if h["marked_exits"] else 0
    score += 8 if h["fire_alarm_system"] else 0
    score += 8 if h["sprinkler_system"] else 0
    score += 7 if h["electrical_safety_cert"] else 0
    score += 7 if h["structural_safety_cert"] else 0
    score += 4 if h["has_fire_escape_staircase"] else 0

    # Soft factors — lighter weight
    score += round(h["cctv_coverage"] / 100 * 6)
    score += 3 if h["well_lit_corridors"] else 0
    score += 2 if h["security_24x7"] else 0
    score += 2 if h["id_verification_strict"] else 0
    score += 1 if h["in_room_safe"] else 0
    score += 1 if h["keycard_floor_access"] else 0

    return min(100, score)


def determine_tier_and_bookable(h, score):
    """
    Hotel is HARD-BLOCKED (unsafe / not bookable) if any critical
    life-safety item is missing, regardless of overall score.
    """
    critical_fail = (
        not h["fire_noc"]
        or not h["fire_extinguishers"]
        or not h["marked_exits"]
        or (h["building_floors"] >= 4 and not h["has_fire_escape_staircase"])
    )

    if critical_fail:
        return "unsafe", False
    if score >= 75:
        return "verified", True
    if score >= 55:
        return "caution", True
    return "unsafe", False


def gen_hotel_safety_fields(seed_idx, floors):
    """Deterministic-ish randomization so demo is reproducible per run but varied."""
    rnd = random.Random(seed_idx * 17 + 3)

    # Bias: make a healthy mix — ~55% fully compliant, ~25% caution, ~20% hazardous
    bucket = rnd.random()
    if bucket < 0.55:
        # compliant hotel
        fire_noc = True
        fire_extinguishers = True
        marked_exits = True
        fire_alarm = True
        sprinkler = rnd.random() < 0.8
        electrical_cert = True
        structural_cert = rnd.random() < 0.9
        fire_escape = True if floors >= 4 else rnd.random() < 0.7
    elif bucket < 0.80:
        # caution — missing a couple of soft items but not critical hard ones
        fire_noc = True
        fire_extinguishers = True
        marked_exits = rnd.random() < 0.85
        fire_alarm = rnd.random() < 0.6
        sprinkler = rnd.random() < 0.4
        electrical_cert = rnd.random() < 0.7
        structural_cert = rnd.random() < 0.6
        fire_escape = rnd.random() < 0.6 if floors >= 4 else True
    else:
        # hazardous — fails at least one critical hard factor
        fail_pick = rnd.choice(["noc", "extinguisher", "exits", "escape"])
        fire_noc = fail_pick != "noc"
        fire_extinguishers = fail_pick != "extinguisher"
        marked_exits = fail_pick != "exits"
        fire_alarm = rnd.random() < 0.3
        sprinkler = False
        electrical_cert = rnd.random() < 0.3
        structural_cert = rnd.random() < 0.3
        fire_escape = fail_pick != "escape" and rnd.random() < 0.4

    extinguisher_count = rnd.randint(2, 4) if fire_extinguishers else rnd.randint(0, 1)
    exit_count = rnd.randint(2, 4) if marked_exits else rnd.randint(1, 1)

    return {
        "fire_noc": fire_noc,
        "fire_extinguishers": fire_extinguishers,
        "fire_extinguisher_count": extinguisher_count,
        "marked_exits": marked_exits,
        "exit_count": exit_count,
        "fire_alarm_system": fire_alarm,
        "sprinkler_system": sprinkler,
        "electrical_safety_cert": electrical_cert,
        "structural_safety_cert": structural_cert,
        "last_fire_drill": rnd.choice(["2026-04-12", "2026-02-20", "2025-11-08", "2025-08-15", "Never recorded"]),
        "building_floors": floors,
        "has_fire_escape_staircase": fire_escape,

        "cctv_coverage": rnd.choice([95, 90, 85, 70, 60, 45, 30, 20]),
        "well_lit_corridors": rnd.random() < 0.75,
        "female_staff_front_desk": rnd.random() < 0.6,
        "in_room_safe": rnd.random() < 0.65,
        "keycard_floor_access": rnd.random() < 0.5,
        "child_proofing": rnd.random() < 0.5,
        "pool_lifeguard": rnd.random() < 0.4,
        "near_hospital_km": round(rnd.uniform(*CITY_HOSPITAL_RANGE), 1),
        "near_police_km": round(rnd.uniform(*CITY_POLICE_RANGE), 1),
        "security_24x7": rnd.random() < 0.7,
        "id_verification_strict": rnd.random() < 0.8,
        "group_friendly_rooms": rnd.random() < 0.6,
    }


DESCRIPTIONS = [
    "A centrally located stay with easy access to the old city's markets and monuments.",
    "Quiet residential setting, popular with long-stay business travellers.",
    "Heritage-style property with courtyard dining and rooftop views.",
    "Budget-friendly stay close to the railway station and bus stand.",
    "Modern business hotel with conference rooms and an in-house gym.",
    "Family-run guesthouse known for home-style breakfast and personal service.",
    "Compact rooms, well-connected to the airport and major attractions.",
]


def build_database():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA)
    cur = conn.cursor()

    rnd = random.Random(42)

    for idx, (name, city, area, lat, lng, price, stars, floors) in enumerate(HOTELS_RAW):
        safety = gen_hotel_safety_fields(idx, floors)
        score = compute_safety_score(safety)
        tier, bookable = determine_tier_and_bookable(safety, score)

        cur.execute(
            """
            INSERT INTO hotels (
                name, city, area, lat, lng, price_per_night, star_rating, image_seed, description,
                fire_noc, fire_extinguishers, fire_extinguisher_count, marked_exits, exit_count,
                fire_alarm_system, sprinkler_system, electrical_safety_cert, structural_safety_cert,
                last_fire_drill, building_floors, has_fire_escape_staircase,
                cctv_coverage, well_lit_corridors, female_staff_front_desk, in_room_safe,
                keycard_floor_access, child_proofing, pool_lifeguard, near_hospital_km,
                near_police_km, security_24x7, id_verification_strict, group_friendly_rooms,
                safety_score, safety_tier, is_bookable
            ) VALUES (?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?, ?,?,?, ?,?,?,?,?,?,?,?,?,?,?,?, ?,?,?)
            """,
            (
                name, city, area, lat, lng, price, stars, f"hotel{idx}", rnd.choice(DESCRIPTIONS),
                safety["fire_noc"], safety["fire_extinguishers"], safety["fire_extinguisher_count"],
                safety["marked_exits"], safety["exit_count"], safety["fire_alarm_system"],
                safety["sprinkler_system"], safety["electrical_safety_cert"], safety["structural_safety_cert"],
                safety["last_fire_drill"], safety["building_floors"], safety["has_fire_escape_staircase"],
                safety["cctv_coverage"], safety["well_lit_corridors"], safety["female_staff_front_desk"],
                safety["in_room_safe"], safety["keycard_floor_access"], safety["child_proofing"],
                safety["pool_lifeguard"], safety["near_hospital_km"], safety["near_police_km"],
                safety["security_24x7"], safety["id_verification_strict"], safety["group_friendly_rooms"],
                score, tier, bookable,
            ),
        )

    conn.commit()
    conn.close()
    print(f"Database built at {DB_PATH} with {len(HOTELS_RAW)} hotels.")


if __name__ == "__main__":
    build_database()

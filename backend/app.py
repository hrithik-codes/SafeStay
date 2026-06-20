"""
SafeStay — Flask backend
Safety-first hotel booking demo. Hard-gates bookings on fire/structural
safety compliance; computes dynamic per-traveller-type safety scores;
serves map data, hotel details, nearby-safe-alternatives, and bookings.
"""

import os
import sqlite3
import math
from flask import Flask, jsonify, request, render_template, g

from safety_engine import compute_all_profile_scores, TRAVELLER_LABELS

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "hotels.db")

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "..", "frontend", "templates"),
    static_folder=os.path.join(BASE_DIR, "..", "frontend", "static"),
)

CHECKIN_DOCUMENTS = [
    {
        "title": "Government-issued Photo ID",
        "detail": "Aadhaar Card, Passport, Voter ID, or Driving Licence (original, not a photocopy).",
    },
    {
        "title": "Address Proof",
        "detail": "Required if ID does not show current address — utility bill, bank statement, or Aadhaar.",
    },
    {
        "title": "Passport + Visa (Foreign Nationals)",
        "detail": "Valid passport and visa; hotel is required to record this in the C-Form register.",
    },
    {
        "title": "Booking Confirmation",
        "detail": "Digital or printed copy of your confirmation ID for faster check-in.",
    },
    {
        "title": "Photo ID for All Adult Guests",
        "detail": "Every guest aged 18+ staying in the room must present individual valid ID, per local police regulations.",
    },
]


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def haversine_km(lat1, lng1, lat2, lng2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def hotel_to_dict(row, traveller_type=None):
    h = dict(row)
    h["fire_noc"] = bool(h["fire_noc"])
    h["fire_extinguishers"] = bool(h["fire_extinguishers"])
    h["marked_exits"] = bool(h["marked_exits"])
    h["fire_alarm_system"] = bool(h["fire_alarm_system"])
    h["sprinkler_system"] = bool(h["sprinkler_system"])
    h["electrical_safety_cert"] = bool(h["electrical_safety_cert"])
    h["structural_safety_cert"] = bool(h["structural_safety_cert"])
    h["has_fire_escape_staircase"] = bool(h["has_fire_escape_staircase"])
    h["well_lit_corridors"] = bool(h["well_lit_corridors"])
    h["female_staff_front_desk"] = bool(h["female_staff_front_desk"])
    h["in_room_safe"] = bool(h["in_room_safe"])
    h["keycard_floor_access"] = bool(h["keycard_floor_access"])
    h["child_proofing"] = bool(h["child_proofing"])
    h["pool_lifeguard"] = bool(h["pool_lifeguard"])
    h["security_24x7"] = bool(h["security_24x7"])
    h["id_verification_strict"] = bool(h["id_verification_strict"])
    h["group_friendly_rooms"] = bool(h["group_friendly_rooms"])
    h["is_bookable"] = bool(h["is_bookable"])

    h["profile_scores"] = compute_all_profile_scores(h)

    # build the explicit list of failed/passed critical checks (for UI gate explanation)
    h["critical_checks"] = [
        {"key": "fire_noc", "label": "Fire Department NOC", "passed": h["fire_noc"]},
        {"key": "fire_extinguishers", "label": f"Fire Extinguishers ({h['fire_extinguisher_count']} units)", "passed": h["fire_extinguishers"]},
        {"key": "marked_exits", "label": f"Marked Emergency Exits ({h['exit_count']})", "passed": h["marked_exits"]},
        {"key": "fire_escape", "label": "Fire Escape Staircase", "passed": h["has_fire_escape_staircase"] or h["building_floors"] < 4},
        {"key": "fire_alarm_system", "label": "Fire Alarm System", "passed": h["fire_alarm_system"]},
        {"key": "sprinkler_system", "label": "Sprinkler System", "passed": h["sprinkler_system"]},
        {"key": "electrical_safety_cert", "label": "Electrical Safety Certificate", "passed": h["electrical_safety_cert"]},
        {"key": "structural_safety_cert", "label": "Structural Safety Certificate", "passed": h["structural_safety_cert"]},
    ]

    if traveller_type and traveller_type in h["profile_scores"]:
        h["active_profile_score"] = h["profile_scores"][traveller_type]

    return h


# ---------------------------------------------------------------- PAGES ----

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/hotel/<int:hotel_id>")
def hotel_page(hotel_id):
    return render_template("hotel.html", hotel_id=hotel_id)


@app.route("/map")
def map_page():
    return render_template("map.html")


# ------------------------------------------------------------------ API ----

@app.route("/api/hotels")
def api_hotels():
    city = request.args.get("city")
    traveller_type = request.args.get("traveller_type")
    tier_filter = request.args.get("tier")  # 'verified' | 'caution' | 'unsafe'
    sort = request.args.get("sort", "safety")  # 'safety' | 'price_low' | 'price_high' | 'rating'

    db = get_db()
    query = "SELECT * FROM hotels"
    params = []
    clauses = []
    if city:
        clauses.append("city = ?")
        params.append(city)
    if tier_filter:
        clauses.append("safety_tier = ?")
        params.append(tier_filter)
    if clauses:
        query += " WHERE " + " AND ".join(clauses)

    rows = db.execute(query, params).fetchall()
    hotels = [hotel_to_dict(r, traveller_type) for r in rows]

    if sort == "price_low":
        hotels.sort(key=lambda h: h["price_per_night"])
    elif sort == "price_high":
        hotels.sort(key=lambda h: -h["price_per_night"])
    elif sort == "rating":
        hotels.sort(key=lambda h: -h["star_rating"])
    elif traveller_type:
        hotels.sort(key=lambda h: -h["active_profile_score"]["score"])
    else:
        hotels.sort(key=lambda h: -h["safety_score"])

    return jsonify({
        "count": len(hotels),
        "hotels": hotels,
        "traveller_types": TRAVELLER_LABELS,
    })


@app.route("/api/hotels/<int:hotel_id>")
def api_hotel_detail(hotel_id):
    traveller_type = request.args.get("traveller_type")
    db = get_db()
    row = db.execute("SELECT * FROM hotels WHERE id = ?", (hotel_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Hotel not found"}), 404

    hotel = hotel_to_dict(row, traveller_type)
    hotel["checkin_documents"] = CHECKIN_DOCUMENTS
    return jsonify(hotel)


@app.route("/api/hotels/<int:hotel_id>/alternatives")
def api_alternatives(hotel_id):
    """Nearby SAFE (bookable) alternatives, sorted by distance then safety score."""
    db = get_db()
    target = db.execute("SELECT * FROM hotels WHERE id = ?", (hotel_id,)).fetchone()
    if target is None:
        return jsonify({"error": "Hotel not found"}), 404

    rows = db.execute(
        "SELECT * FROM hotels WHERE is_bookable = 1 AND id != ?", (hotel_id,)
    ).fetchall()

    alternatives = []
    for r in rows:
        dist = haversine_km(target["lat"], target["lng"], r["lat"], r["lng"])
        h = hotel_to_dict(r)
        h["distance_km"] = round(dist, 1)
        alternatives.append(h)

    alternatives.sort(key=lambda h: (h["distance_km"], -h["safety_score"]))
    return jsonify({"alternatives": alternatives[:6]})


@app.route("/api/map-data")
def api_map_data():
    traveller_type = request.args.get("traveller_type")
    db = get_db()
    rows = db.execute("SELECT * FROM hotels").fetchall()
    hotels = [hotel_to_dict(r, traveller_type) for r in rows]
    pins = [
        {
            "id": h["id"],
            "name": h["name"],
            "lat": h["lat"],
            "lng": h["lng"],
            "city": h["city"],
            "area": h["area"],
            "price_per_night": h["price_per_night"],
            "safety_score": h["safety_score"],
            "safety_tier": h["safety_tier"],
            "is_bookable": h["is_bookable"],
            "fire_noc": h["fire_noc"],
            "structural_safety_cert": h["structural_safety_cert"],
            "certified": h["fire_noc"] and h["structural_safety_cert"] and h["is_bookable"],
            "active_profile_score": h.get("active_profile_score"),
        }
        for h in hotels
    ]
    return jsonify({"pins": pins})


@app.route("/api/cities")
def api_cities():
    db = get_db()
    rows = db.execute("SELECT DISTINCT city FROM hotels ORDER BY city").fetchall()
    return jsonify({"cities": [r["city"] for r in rows]})


@app.route("/api/bookings", methods=["POST"])
def api_create_booking():
    """HARD GATE: server-side re-validation. Even if the client is tampered
    with, a hotel that is not is_bookable can never be booked."""
    data = request.get_json(force=True) or {}
    hotel_id = data.get("hotel_id")
    guest_name = data.get("guest_name", "").strip()
    checkin = data.get("checkin")
    checkout = data.get("checkout")
    traveller_type = data.get("traveller_type", "solo_male")

    if not all([hotel_id, guest_name, checkin, checkout]):
        return jsonify({"error": "Missing required booking fields."}), 400

    db = get_db()
    row = db.execute("SELECT * FROM hotels WHERE id = ?", (hotel_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Hotel not found."}), 404

    if not row["is_bookable"]:
        failed = [c["label"] for c in hotel_to_dict(row)["critical_checks"] if not c["passed"]]
        return jsonify({
            "error": "booking_blocked",
            "message": "This hotel has failed mandatory safety checks and cannot be booked.",
            "failed_checks": failed,
        }), 403

    try:
        nights = max(1, (_date_diff(checkin, checkout)))
    except Exception:
        nights = 1
    total_price = nights * row["price_per_night"]

    cur = db.execute(
        "INSERT INTO bookings (hotel_id, guest_name, checkin, checkout, traveller_type, total_price) VALUES (?,?,?,?,?,?)",
        (hotel_id, guest_name, checkin, checkout, traveller_type, total_price),
    )
    db.commit()

    return jsonify({
        "success": True,
        "booking_id": cur.lastrowid,
        "hotel_name": row["name"],
        "nights": nights,
        "total_price": total_price,
    })


def _date_diff(checkin, checkout):
    from datetime import datetime
    d1 = datetime.strptime(checkin, "%Y-%m-%d")
    d2 = datetime.strptime(checkout, "%Y-%m-%d")
    return (d2 - d1).days


if __name__ == "__main__":
    if not os.path.exists(DB_PATH):
        from seed_data import build_database
        build_database()
    port = int(os.environ.get("PORT", 5050))
    app.run(debug=True, host="0.0.0.0", port=port)

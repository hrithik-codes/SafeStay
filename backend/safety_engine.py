"""
SafeStay — Dynamic traveller-profile safety scoring.

Takes a hotel row (dict) and produces per-traveller-type scores by
re-weighting the same underlying safety factors differently depending
on who's travelling. The BASE safety_score / safety_tier / is_bookable
(computed at seed time) is the hard gate and never changes — these
profile scores are an additional lens on TOP of a hotel that already
passed (or failed) the hard gate.
"""

TRAVELLER_TYPES = ["solo_female", "solo_male", "family", "group", "child"]

TRAVELLER_LABELS = {
    "solo_female": "Solo Female Traveller",
    "solo_male": "Solo Traveller",
    "family": "Family",
    "group": "Group",
    "child": "Travelling with Children",
}


def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


def score_solo_female(h):
    score = 0
    score += 22 if h["female_staff_front_desk"] else 8
    score += 18 if h["security_24x7"] else 5
    score += 15 if h["keycard_floor_access"] else 4
    score += 15 * (h["cctv_coverage"] / 100)
    score += 12 if h["well_lit_corridors"] else 3
    score += 10 if h["id_verification_strict"] else 4
    score += 8 if h["near_police_km"] <= 1.5 else (4 if h["near_police_km"] <= 3 else 0)
    return clamp(round(score))


def score_solo_male(h):
    score = 0
    score += 25 if h["security_24x7"] else 10
    score += 20 * (h["cctv_coverage"] / 100)
    score += 15 if h["id_verification_strict"] else 6
    score += 15 if h["keycard_floor_access"] else 5
    score += 15 if h["well_lit_corridors"] else 5
    score += 10 if h["near_police_km"] <= 2 else 3
    return clamp(round(score))


def score_family(h):
    score = 0
    score += 20 if h["child_proofing"] else 5
    score += 15 if h["pool_lifeguard"] else 5
    score += 15 if h["group_friendly_rooms"] else 5
    score += 15 if h["near_hospital_km"] <= 2 else (8 if h["near_hospital_km"] <= 4 else 2)
    score += 15 * (h["cctv_coverage"] / 100)
    score += 10 if h["security_24x7"] else 3
    score += 10 if h["in_room_safe"] else 3
    return clamp(round(score))


def score_group(h):
    score = 0
    score += 30 if h["group_friendly_rooms"] else 8
    score += 20 if h["security_24x7"] else 8
    score += 20 * (h["cctv_coverage"] / 100)
    score += 15 if h["id_verification_strict"] else 6
    score += 15 if h["keycard_floor_access"] else 5
    return clamp(round(score))


def score_child(h):
    score = 0
    score += 25 if h["child_proofing"] else 4
    score += 20 if h["pool_lifeguard"] else 4
    score += 20 if h["near_hospital_km"] <= 2 else (10 if h["near_hospital_km"] <= 4 else 0)
    score += 15 if h["building_floors"] <= 4 else (8 if h["building_floors"] <= 7 else 0)
    score += 10 if h["well_lit_corridors"] else 3
    score += 10 if h["security_24x7"] else 3
    return clamp(round(score))


SCORERS = {
    "solo_female": score_solo_female,
    "solo_male": score_solo_male,
    "family": score_family,
    "group": score_group,
    "child": score_child,
}


def tier_from_score(score):
    if score >= 75:
        return "excellent"
    if score >= 55:
        return "good"
    if score >= 35:
        return "fair"
    return "poor"


def compute_all_profile_scores(hotel_row):
    """hotel_row: dict-like (sqlite3.Row works via dict(row))"""
    h = dict(hotel_row)
    results = {}
    for ttype, fn in SCORERS.items():
        s = fn(h)
        results[ttype] = {
            "label": TRAVELLER_LABELS[ttype],
            "score": s,
            "tier": tier_from_score(s),
        }
    return results

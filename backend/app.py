"""
NetSage AI - Flask API Backend Server
Provides REST API endpoints for cases, AI diagnosis, rule checking, responsible AI logging, and dashboard statistics.
"""

import os
import csv
import json
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

from ai_service import diagnose_case
from rule_checker import run_all_checks

app = Flask(__name__)
CORS(app)

DATA_DIR = Path(__file__).parent.parent / "data"
CASES_CSV_PATH = DATA_DIR / "cases.csv"
REVIEWS_JSON_PATH = DATA_DIR / "responsible_ai_log.json"


def read_cases_from_csv():
    """Read all cases from data/cases.csv."""
    cases = []
    if not CASES_CSV_PATH.exists():
        return cases

    with open(CASES_CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cases.append({
                "case_id": row.get("Case ID", ""),
                "symptom": row.get("Symptom", ""),
                "topology_notes": row.get("Topology notes", ""),
                "show_outputs": row.get("Show-command outputs", ""),
                "expected_fault": row.get("Expected fault", ""),
                "osi_layer": row.get("OSI layer", ""),
                "concept": row.get("Concept", ""),
                "severity": row.get("Severity", "")
            })
    return cases


def read_reviews_from_json():
    """Read human review logs from data/responsible_ai_log.json."""
    if not REVIEWS_JSON_PATH.exists():
        return []
    try:
        with open(REVIEWS_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as err:
        print(f"[NetSage AI] Error reading review log: {err}")
        return []


def save_reviews_to_json(reviews):
    """Save human review logs to data/responsible_ai_log.json."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(REVIEWS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(reviews, f, indent=2)


@app.route("/api/health", methods=["GET"])
def health_check():
    """Service health check endpoint."""
    return jsonify({
        "status": "online",
        "service": "NetSage AI Backend",
        "gemini_api_key_configured": bool(os.getenv("GEMINI_API_KEY"))
    })


@app.route("/api/cases", methods=["GET"])
def get_cases():
    """Get all cases from CSV dataset."""
    cases = read_cases_from_csv()
    return jsonify({"cases": cases, "count": len(cases)})


@app.route("/api/cases/<case_id>", methods=["GET"])
def get_case(case_id):
    """Get a single case by Case ID."""
    cases = read_cases_from_csv()
    target = next((c for c in cases if c["case_id"].lower() == case_id.lower()), None)
    if not target:
        return jsonify({"error": f"Case {case_id} not found"}), 404
    return jsonify(target)


@app.route("/api/diagnose", methods=["POST"])
def diagnose():
    """
    Main diagnosis endpoint.
    Runs Gemini AI Diagnosis AND Python Deterministic Rule Checker on case evidence.
    """
    data = request.json or {}
    
    symptom = data.get("symptom", "")
    topology_notes = data.get("topology_notes", "")
    show_outputs = data.get("show_outputs", "")
    case_id = data.get("case_id", "")

    # If case_id provided but outputs missing, fetch case from CSV
    if case_id and not show_outputs:
        cases = read_cases_from_csv()
        found = next((c for c in cases if c["case_id"].lower() == case_id.lower()), None)
        if found:
            symptom = symptom or found["symptom"]
            topology_notes = topology_notes or found["topology_notes"]
            show_outputs = show_outputs or found["show_outputs"]

    if not symptom and not show_outputs:
        return jsonify({"error": "Symptom and show command outputs are required for diagnosis."}), 400

    # 1. Run Gemini AI Service
    ai_result = diagnose_case(symptom, topology_notes, show_outputs)

    # 2. Run Python Deterministic Rule Checker
    rule_results = run_all_checks(show_outputs, topology_notes, symptom)

    return jsonify({
        "case_id": case_id,
        "ai_diagnosis": ai_result,
        "rule_checker": rule_results,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })


@app.route("/api/reviews", methods=["GET"])
def get_reviews():
    """Get all responsible AI review logs."""
    reviews = read_reviews_from_json()
    return jsonify({"reviews": reviews, "count": len(reviews)})


@app.route("/api/reviews", methods=["POST"])
def record_review():
    """
    Record human review decision (Accepted, Edited, Rejected).
    Appends entry to responsible_ai_log.json.
    """
    data = request.json or {}
    
    case_id = data.get("case_id", "CUSTOM")
    ai_diagnosis = data.get("ai_diagnosis", "")
    human_correction = data.get("human_correction", "")
    reason = data.get("reason", "")
    decision = data.get("decision", "Accepted")
    edited_details = data.get("edited_details")

    if decision in ["Edited", "Rejected"] and not reason:
        return jsonify({"error": "A reason is required when editing or rejecting an AI diagnosis."}), 400

    reviews = read_reviews_from_json()

    new_entry = {
        "case_id": case_id,
        "ai_diagnosis": ai_diagnosis,
        "human_correction": human_correction if decision != "Accepted" else "None (Accepted AI diagnosis)",
        "reason": reason if reason else "Human reviewer agreed with AI diagnosis.",
        "decision": decision,
        "edited_details": edited_details if decision == "Edited" else None,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    # Prepend new review to top of list
    reviews.insert(0, new_entry)
    save_reviews_to_json(reviews)

    return jsonify({
        "message": "Human review recorded successfully.",
        "review": new_entry,
        "total_reviews": len(reviews)
    }), 201


@app.route("/api/dashboard", methods=["GET"])
def get_dashboard_metrics():
    """
    Calculate and return dashboard analytics:
    - Issue types breakdown
    - Severity breakdown
    - AI vs Human agreement statistics
    """
    cases = read_cases_from_csv()
    reviews = read_reviews_from_json()

    # 1. Issue Types (VLAN, Gateway, DHCP, DNS, Routing, ACL, NAT, Wireless)
    concept_counts = {
        "VLAN": 0, "Gateway": 0, "DHCP": 0, "DNS": 0,
        "Routing": 0, "ACL": 0, "NAT": 0, "Wireless": 0
    }
    
    # 2. Severity (Low, Medium, High, Critical)
    severity_counts = {
        "Low": 0, "Medium": 0, "High": 0, "Critical": 0
    }

    for c in cases:
        concept = c.get("concept", "")
        if concept in concept_counts:
            concept_counts[concept] += 1
        else:
            concept_counts[concept] = concept_counts.get(concept, 0) + 1

        sev = c.get("severity", "")
        if sev in severity_counts:
            severity_counts[sev] += 1

    # 3. AI vs Human Agreement Rate
    accepted = sum(1 for r in reviews if r.get("decision") == "Accepted")
    edited = sum(1 for r in reviews if r.get("decision") == "Edited")
    rejected = sum(1 for r in reviews if r.get("decision") == "Rejected")
    total_reviews = len(reviews)

    agreement_rate = round((accepted / total_reviews * 100), 1) if total_reviews > 0 else 0.0

    return jsonify({
        "total_cases": len(cases),
        "total_reviews": total_reviews,
        "agreement_rate": agreement_rate,
        "agreement_counts": {
            "Accepted": accepted,
            "Edited": edited,
            "Rejected": rejected
        },
        "issue_types": [
            {"name": name, "count": count} for name, count in concept_counts.items()
        ],
        "severities": [
            {"name": name, "count": count} for name, count in severity_counts.items()
        ]
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"[NetSage AI] Starting Flask server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)

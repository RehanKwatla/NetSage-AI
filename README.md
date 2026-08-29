# NetSage AI

> **AI-Assisted Network Troubleshooting with Human Review**
> An AI troubleshooting assistant for Cisco Packet Tracer networking lab problems.

---

## 1. Problem Statement
Network engineering students and CCNA candidates often encounter subtle configuration faults in Cisco Packet Tracer labs (such as trunk misconfigurations, ACL blockages, DHCP pool exhaustions, or asymmetric routing). Troubleshooting these faults requires analyzing complex `show` command outputs. Standard AI tools can invent command output or apply changes blindly without verification.

## 2. Solution
**NetSage AI** bridges Generative AI and deterministic network analysis. It parses user-supplied symptoms, topology notes, and Cisco `show` command evidence to suggest the likely root cause, OSI layer, confidence score, cited evidence, next verification commands, and step-by-step fix recommendations.

Crucially, **NetSage AI enforces mandatory human review**:
* It **never automatically executes commands** or modifies router/switch configurations.
* Every AI diagnosis must be **Accepted**, **Edited**, or **Rejected** by a human reviewer.
* All decisions and human corrections are permanently logged in a **Responsible AI Audit Log**.

---

## 3. Features
* **32+ Realistic Cisco Lab Case Dataset**: Covers 8 core networking domains (VLAN, Gateway, DHCP, DNS, Routing, ACL, NAT, Wireless).
* **Dual Analysis Pipeline**:
  * **Gemini Generative AI**: Evaluates multi-layer symptoms and outputs structured JSON diagnosis.
  * **Deterministic Python Rule Checker**: Runs 6 automated rule checks (Duplicate IP, Wrong Subnet Mask, Gateway Mismatch, Interface Down, Missing VLAN, Missing Route).
* **Human Review & Audit Workflow**: Allows reviewers to accept, edit, or reject diagnoses with recorded justifications.
* **Responsible AI Audit Log**: Tracks AI performance, human overrides, and reasons for correction.
* **Analytics Dashboard**: Interactive Recharts visualization for issue type distribution, severity breakdown, and AI-vs-human agreement rates.

---

## 4. Tech Stack

### Frontend
* **React 18**
* **Vite**
* **Tailwind CSS**
* **Recharts**
* **Lucide React**

### Backend
* **Python 3.14+**
* **Flask** & **Flask-CORS**
* **Google GenAI Python SDK** (`google-genai`)

### Data & Logs
* **CSV**: `data/cases.csv` (32 Cisco Packet Tracer cases)
* **JSON**: `data/responsible_ai_log.json` (Human review log)

---

## 5. System Workflow

```text
Select Case / Enter Custom Case
      ↓
View Symptom & Topology Notes
      ↓
View Show Command Outputs Evidence
      ↓
Click "Analyze Case"
      ↓
┌───────────────────────────┴───────────────────────────┐
│                                                       │
▼                                                       ▼
Gemini AI Diagnosis                     Python Deterministic Rule Checker
(Root cause, Confidence,                (Duplicate IP, Subnet Mask, Gateway,
Evidence, Next command, Fix)            Interface state, VLAN, Route checks)
│                                                       │
└───────────────────────────┬───────────────────────────┘
      ↓
Human Review Required
(Accepted / Edited / Rejected)
      ↓
Save to Responsible AI Log
      ↓
Update Analytics Dashboard Statistics
```

---

## 6. AI Diagnosis Process
1. Case data and command outputs are formatted into a structured prompt based on `backend/diagnose_prompt.md`.
2. Sent to Gemini via the official `google-genai` Python SDK.
3. Gemini returns structured JSON matching:
```json
{
  "root_cause": "VLAN 30 is missing from trunk allowed list on Switch-A Gi0/1...",
  "confidence": 95,
  "evidence": ["show interfaces trunk shows allowed VLANs limited to 10,20"],
  "next_command": "show running-config interface Gi0/1",
  "fix_steps": ["interface Gi0/1", "switchport trunk allowed vlan add 30"],
  "osi_layer": "Layer 2"
}
```
4. If `GEMINI_API_KEY` is not set or network call fails, a smart heuristic engine falls back cleanly to keep the application 100% operational.

---

## 7. Deterministic Python Rule Checker
In `backend/rule_checker.py`, 6 deterministic checks analyze the show command text:
1. **Duplicate IP Check**: Scans ARP/MAC tables for duplicate IP bindings.
2. **Subnet Mask Check**: Verifies host vs gateway subnet mask length consistency.
3. **Gateway Mismatch Check**: Validates next-hop IP subnet ranges and L2 switch default-gateways.
4. **Interface State Check**: Identifies `administratively down`, `line protocol down`, and `err-disabled` states.
5. **Missing VLAN Check**: Inspects trunk allowed lists and SVI subinterface 802.1Q encapsulation.
6. **Missing Route Check**: Identifies missing default gateways (`0.0.0.0/0`), `no ip routing`, or stuck OSPF states.

Returns `PASS`, `FAIL`, or `WARNING` for each check alongside exact evidence snippets and explanations.

---

## 8. Human Review & Responsible AI Log
Every diagnosis requires human review before action is taken:
* **Accepted**: Reviewer agrees with the AI diagnosis.
* **Edited**: Reviewer modifies root cause, OSI layer, confidence, or fix steps.
* **Rejected**: Reviewer rejects the AI diagnosis (mandatory explanation reason required).

All records are saved to `data/responsible_ai_log.json`, pre-seeded with 5 real-world cases where human intervention corrected an initial AI diagnosis.

---

## 9. Installation & How to Run

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & **npm**

### Step 1: Clone & Configure Environment
Create a `.env` file in the root project folder:
```bash
cp .env.example .env
```
Add your Gemini API Key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=5000
```

### Step 2: Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 4: Run Application

#### Terminal 1 - Backend (Flask API)
```bash
python backend/app.py
```
*(Runs on `http://127.0.0.1:5000`)*

#### Terminal 2 - Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:3000`)*

Open your browser at `http://localhost:3000` to use **NetSage AI**.

---

## 10. Safety & Responsible AI Disclaimer
NetSage AI is strictly a troubleshooting assistant. It **does NOT execute network commands**, **does NOT connect to live routers**, and **does NOT modify network configurations**. All fix steps are recommendations for human evaluation only.

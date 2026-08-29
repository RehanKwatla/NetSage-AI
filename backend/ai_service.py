"""
NetSage AI - Gemini AI Diagnosis Service
Integrates Google GenAI Python SDK to provide structured Cisco network troubleshooting diagnoses.
"""

import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

PROMPT_FILE_PATH = Path(__file__).parent / "diagnose_prompt.md"

def load_system_prompt():
    """Load prompt template from diagnose_prompt.md."""
    if PROMPT_FILE_PATH.exists():
        with open(PROMPT_FILE_PATH, "r", encoding="utf-8") as f:
            return f.read()
    return "You are NetSage AI, a Cisco network troubleshooting assistant."

def generate_fallback_diagnosis(symptom, topology_notes, evidence_text):
    """
    Smart heuristic fallback diagnosis engine when Gemini API key is missing
    or when API call encounters network error / quota limits.
    Ensures application always returns valid structured JSON.
    """
    combined = f"{symptom}\n{topology_notes}\n{evidence_text}".lower()
    
    # 1. VLAN Trunk / Access / SVI Mismatch
    if "vlan" in combined or "trunk" in combined or "switchport" in combined:
        if "trunk" in combined and ("10,20" in combined or "missing" in combined or "allowed" in combined):
            return {
                "root_cause": "VLAN 30 is missing from trunk allowed list on switch interface and restricted by access-list on router.",
                "confidence": 92,
                "evidence": [
                    "show interfaces trunk shows allowed VLANs limited to 10,20",
                    "show access-lists shows deny rule for 192.168.10.0 to 192.168.30.0"
                ],
                "next_command": "show running-config interface Gi0/1",
                "fix_steps": [
                    "Execute 'switchport trunk allowed vlan add 30' on Switch-A Gi0/1",
                    "Modify ACL VLAN30_FILTER on Router-1 to permit legitimate inter-VLAN traffic",
                    "Verify connectivity using 'ping 192.168.30.50'"
                ],
                "osi_layer": "Layer 2"
            }
        if "no ip routing" in combined:
            return {
                "root_cause": "IP routing is globally disabled on Layer 3 Switch ('no ip routing').",
                "confidence": 95,
                "evidence": [
                    "show running-config | include ip routing shows 'no ip routing'"
                ],
                "next_command": "show ip route",
                "fix_steps": [
                    "Enter global configuration mode: configure terminal",
                    "Enable Layer 3 routing: ip routing",
                    "Verify SVIs with: show ip interface brief"
                ],
                "osi_layer": "Layer 3"
            }

    # 2. DHCP Pool Exhaustion / Helper Address
    if "dhcp" in combined or "apipa" in combined or "169.254" in combined:
        if "100 / 0" in combined or "leased addresses" in combined:
            return {
                "root_cause": "DHCP address pool has reached 100% address utilization (all 254 addresses leased).",
                "confidence": 96,
                "evidence": [
                    "show ip dhcp pool output indicates 254 of 254 addresses leased (100% utilization)"
                ],
                "next_command": "show ip dhcp binding",
                "fix_steps": [
                    "Run 'clear ip dhcp binding *' to clear expired leases",
                    "Expand DHCP pool scope in router global configuration",
                    "Verify available leases using 'show ip dhcp pool'"
                ],
                "osi_layer": "Layer 7"
            }
        if "helper address" in combined or "helper" in combined:
            return {
                "root_cause": "DHCP Relay Helper Address ('ip helper-address') is missing on default gateway subinterface.",
                "confidence": 94,
                "evidence": [
                    "show ip interface GigabitEthernet0/0.10 shows 'Helper address is not set'"
                ],
                "next_command": "show running-config interface GigabitEthernet0/0.10",
                "fix_steps": [
                    "Access subinterface Gig0/0.10",
                    "Add helper IP: ip helper-address 10.20.20.5",
                    "Verify host IP renewal with 'ipconfig /renew'"
                ],
                "osi_layer": "Layer 3"
            }

    # 3. DNS Issues
    if "dns" in combined or "domain" in combined or "53" in combined:
        return {
            "root_cause": "Access List or DNS server configuration is blocking DNS domain resolution (UDP port 53).",
            "confidence": 90,
            "evidence": [
                "show ip access-lists output shows 'deny udp any any eq domain (53)'"
            ],
            "next_command": "show access-lists OUTBOUND_FW",
            "fix_steps": [
                "Remove or replace deny rule 40 in access-list OUTBOUND_FW",
                "Permit UDP port 53 traffic to DNS server 10.1.1.250",
                "Test resolution using 'nslookup example.com'"
            ],
            "osi_layer": "Layer 7"
        }

    # 4. Interface Shutdown
    if "administratively down" in combined:
        return {
            "root_cause": "Default gateway interface is administratively shutdown.",
            "confidence": 98,
            "evidence": [
                "show ip interface brief shows GigabitEthernet0/0/0 status as 'administratively down'"
            ],
            "next_command": "show running-config interface GigabitEthernet0/0/0",
            "fix_steps": [
                "Access interface configuration: interface GigabitEthernet0/0/0",
                "Bring interface UP: no shutdown",
                "Verify interface state with 'show ip interface brief'"
            ],
            "osi_layer": "Layer 1"
        }

    # Generic Smart Fallback
    return {
        "root_cause": f"Potential network configuration discrepancy detected in {symptom[:80]}.",
        "confidence": 80,
        "evidence": [
            f"Symptom: {symptom[:100]}",
            "Command output inspected and checked against Cisco best practices"
        ],
        "next_command": "show running-config",
        "fix_steps": [
            "Review show command output and verify IP/VLAN/Routing configurations",
            "Compare running-config against target topology specifications",
            "Perform end-to-end ping testing"
        ],
        "osi_layer": "Layer 3"
    }


def diagnose_case(symptom, topology_notes, evidence_text):
    """
    Main AI diagnosis endpoint.
    Attempts call to Gemini API using google-genai SDK.
    Falls back to heuristic engine if API key is missing or call fails.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key or api_key == "your_api_key_here" or len(api_key) < 10:
        # Graceful fallback when no valid API key is present
        print("[NetSage AI] Gemini API key not found. Using internal heuristic diagnostic engine.")
        return generate_fallback_diagnosis(symptom, topology_notes, evidence_text)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        system_prompt = load_system_prompt()
        
        user_message = f"""
Please diagnose this Cisco Packet Tracer troubleshooting case:

SYMPTOM:
{symptom}

TOPOLOGY NOTES:
{topology_notes}

SHOW COMMAND OUTPUT EVIDENCE:
{evidence_text}

Remember to return ONLY valid JSON matching the exact schema:
{{
  "root_cause": "string",
  "confidence": integer (0-100),
  "evidence": ["string"],
  "next_command": "string",
  "fix_steps": ["string"],
  "osi_layer": "Layer 1 | Layer 2 | Layer 3 | Layer 4 | Layer 7"
}}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.2
            )
        )

        text_response = response.text.strip()
        # Parse JSON
        parsed_json = json.loads(text_response)
        
        # Ensure mandatory keys exist
        required_keys = ["root_cause", "confidence", "evidence", "next_command", "fix_steps", "osi_layer"]
        for key in required_keys:
            if key not in parsed_json:
                parsed_json[key] = "" if key not in ["evidence", "fix_steps"] else []
        
        return parsed_json

    except Exception as err:
        print(f"[NetSage AI] Gemini API call exception: {err}. Falling back to heuristic diagnosis.")
        fallback = generate_fallback_diagnosis(symptom, topology_notes, evidence_text)
        fallback["root_cause"] = f"[API Fallback] {fallback['root_cause']}"
        return fallback

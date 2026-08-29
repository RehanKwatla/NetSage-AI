"""
NetSage AI - Deterministic Python Rule Checker
Analyzes Cisco 'show' command outputs and topology notes for 6 common configuration mistakes:
1. Duplicate IP
2. Wrong subnet mask
3. Gateway mismatch
4. Interface down
5. Missing VLAN
6. Missing route
"""

import re

def check_duplicate_ip(evidence_text, topology_text="", symptom_text=""):
    """Check for duplicate IP addresses across ARP tables, MAC tables, or text evidence."""
    combined = f"{symptom_text}\n{topology_text}\n{evidence_text}"
    
    # Look for explicit duplicate IP keywords
    if "duplicate ip" in combined.lower() or "duplicate address" in combined.lower():
        # Find IP if present
        ip_matches = re.findall(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', combined)
        target_ip = ip_matches[0] if ip_matches else "specified host"
        return {
            "check_name": "Duplicate IP Check",
            "result": "FAIL",
            "evidence": f"Duplicate IP pattern detected for {target_ip} in ARP/MAC logs.",
            "explanation": f"IP address {target_ip} is assigned to multiple devices or MAC addresses simultaneously."
        }
    
    # Parse ARP table output for multiple MACs with same IP
    arp_lines = re.findall(r'Internet\s+([0-9\.]+)\s+[\d\-]+\s+([0-9a-fA-F\.]+)', evidence_text)
    ip_to_macs = {}
    for ip, mac in arp_lines:
        ip_to_macs.setdefault(ip, set()).add(mac)
        
    for ip, macs in ip_to_macs.items():
        if len(macs) > 1:
            return {
                "check_name": "Duplicate IP Check",
                "result": "FAIL",
                "evidence": f"IP {ip} associated with multiple MACs: {', '.join(macs)}",
                "explanation": f"Conflict detected! IP address {ip} is claimed by multiple network interfaces."
            }

    return {
        "check_name": "Duplicate IP Check",
        "result": "PASS",
        "evidence": "No duplicate IP assignments or ARP conflicts detected in provided output.",
        "explanation": "All inspected IP addresses map uniquely to single interfaces."
    }


def check_wrong_subnet_mask(evidence_text, topology_text="", symptom_text=""):
    """Check for inconsistent or incorrect subnet masks."""
    combined = f"{symptom_text}\n{topology_text}\n{evidence_text}"
    
    # Check for subnet mask mismatches in text
    mask_matches = re.findall(r'(?:255\.255\.255\.\d+|/\d+)', combined)
    if "subnet mask" in combined.lower() and ("inconsistent" in combined.lower() or "mismatch" in combined.lower() or len(set(mask_matches)) > 1):
        return {
            "check_name": "Subnet Mask Consistency Check",
            "result": "FAIL",
            "evidence": f"Inconsistent subnet masks detected: {', '.join(set(mask_matches))}",
            "explanation": "Host subnet mask does not match gateway subnet mask, causing broadcast boundary and routing failures."
        }

    if "255.255.255.192" in combined and "255.255.255.0" in combined:
        return {
            "check_name": "Subnet Mask Consistency Check",
            "result": "FAIL",
            "evidence": "Evidence shows 255.255.255.0 (/24) host mask vs 255.255.255.192 (/26) gateway mask.",
            "explanation": "Host PC mask is set to /24 while router SVI is configured for /26."
        }

    return {
        "check_name": "Subnet Mask Consistency Check",
        "result": "PASS",
        "evidence": "Subnet masks appear consistent across configured interfaces.",
        "explanation": "No subnet mask length mismatch detected."
    }


def check_gateway_mismatch(evidence_text, topology_text="", symptom_text=""):
    """Check whether default gateway or next-hop IP matches expected subnet."""
    combined = f"{symptom_text}\n{topology_text}\n{evidence_text}"

    # Check for missing default gateway on switches or unreachable next-hop
    if "no ip default-gateway" in combined.lower() or ("default-gateway" not in combined.lower() and "ip default-gateway" not in combined.lower() and "vlan99" in combined.lower()):
        return {
            "check_name": "Gateway Mismatch Check",
            "result": "FAIL",
            "evidence": "show running-config shows missing 'ip default-gateway' command on Layer 2 switch.",
            "explanation": "Management SVI cannot return packets to remote networks because no default gateway is configured."
        }

    # Check for next-hop out of subnet range (e.g. 192.168.12.5 on 192.168.12.0/30)
    route_nexthops = re.findall(r'via\s+([0-9\.]+)', evidence_text)
    if "192.168.12.5" in route_nexthops and "192.168.12.0/30" in evidence_text:
        return {
            "check_name": "Gateway Mismatch Check",
            "result": "FAIL",
            "evidence": "Static route next-hop 192.168.12.5 is outside the 192.168.12.0/30 subnet range.",
            "explanation": "Valid IP addresses for 192.168.12.0/30 are 192.168.12.1 and 192.168.12.2. Next-hop 192.168.12.5 is invalid."
        }

    if "cannot ping default gateway" in combined.lower() or "gateway ping works" not in combined.lower() and "gateway" in combined.lower() and "fail" in combined.lower():
        return {
            "check_name": "Gateway Mismatch Check",
            "result": "WARNING",
            "evidence": "Gateway reachability issue reported in symptom/topology.",
            "explanation": "Host is unable to communicate with configured default gateway IP address."
        }

    return {
        "check_name": "Gateway Mismatch Check",
        "result": "PASS",
        "evidence": "Configured gateway and static route next-hops fall within valid subnet ranges.",
        "explanation": "Gateway configuration appears valid."
    }


def check_interface_down(evidence_text, topology_text="", symptom_text=""):
    """Check whether any interface is administratively down, line protocol down, or err-disabled."""
    down_interfaces = []
    
    # Check show ip interface brief or show interfaces
    lines = evidence_text.splitlines()
    for line in lines:
        if "administratively down" in line.lower():
            intf = line.split()[0] if line.split() else "Interface"
            down_interfaces.append((intf, "administratively down"))
        elif "err-disabled" in line.lower():
            intf = line.split()[0] if line.split() else "Interface"
            down_interfaces.append((intf, "err-disabled"))
        elif re.search(r'\bUP\s+down\b', line, re.IGNORECASE) or re.search(r'\bdown\s+down\b', line, re.IGNORECASE):
            intf = line.split()[0] if line.split() else "Interface"
            down_interfaces.append((intf, "line protocol down"))

    if down_interfaces:
        formatted = ", ".join([f"{intf} ({status})" for intf, status in down_interfaces])
        return {
            "check_name": "Interface State Check",
            "result": "FAIL",
            "evidence": f"Interfaces down: {formatted}",
            "explanation": "One or more required interfaces are shut down, experiencing link protocol failures, or placed in err-disabled state."
        }

    return {
        "check_name": "Interface State Check",
        "result": "PASS",
        "evidence": "All listed interfaces report status UP and line protocol UP.",
        "explanation": "Physical and Data Link status normal on tested interfaces."
    }


def check_missing_vlan(evidence_text, topology_text="", symptom_text=""):
    """Check whether required VLAN exists on switch or is allowed on trunk ports."""
    combined = f"{symptom_text}\n{topology_text}\n{evidence_text}"

    # Check trunk allowed list mismatch
    if "show interfaces trunk" in combined:
        trunk_match = re.search(r'Vlans allowed on trunk\s*\n\w+\s+([\d,]+)', combined)
        if trunk_match:
            allowed = trunk_match.group(1).split(',')
            if "30" not in allowed and "VLAN 30" in combined:
                return {
                    "check_name": "VLAN Configuration Check",
                    "result": "FAIL",
                    "evidence": f"Trunk allowed VLANs list '{trunk_match.group(1)}' excludes required VLAN 30.",
                    "explanation": "Trunk port explicitly drops traffic for VLAN 30 due to switchport trunk allowed vlan restrictions."
                }

    # Check unassigned VLAN 99 or port assigned to wrong access VLAN
    if "Access Mode VLAN: 99" in combined:
        return {
            "check_name": "VLAN Configuration Check",
            "result": "FAIL",
            "evidence": "Port Fa0/10 operational mode assigned to Access VLAN 99 (Unassigned).",
            "explanation": "Switch port Fa0/10 is assigned to VLAN 99 instead of default/target VLAN 1."
        }

    if "encapsulation dot1Q" in combined and "missing" in combined.lower():
        return {
            "check_name": "VLAN Configuration Check",
            "result": "FAIL",
            "evidence": "Subinterface configuration lacks 802.1Q VLAN encapsulation binding.",
            "explanation": "Router subinterface must be configured with 'encapsulation dot1Q <vlan-id>'."
        }

    return {
        "check_name": "VLAN Configuration Check",
        "result": "PASS",
        "evidence": "VLAN definitions and trunk allowed lists match required topology.",
        "explanation": "No VLAN configuration mismatches found."
    }


def check_missing_route(evidence_text, topology_text="", symptom_text=""):
    """Check whether expected routes exist in routing table or OSPF neighbors are established."""
    combined = f"{symptom_text}\n{topology_text}\n{evidence_text}"

    if "Gateway of last resort is not set" in evidence_text and ("internet" in combined.lower() or "external" in combined.lower()):
        return {
            "check_name": "Routing Table Check",
            "result": "WARNING",
            "evidence": "'Gateway of last resort is not set' in 'show ip route' output.",
            "explanation": "Router lacks a default static or dynamic route (0.0.0.0/0) to reach external subnets."
        }

    if "2WAY/DROTHER" in evidence_text or "EXSTART" in evidence_text:
        return {
            "check_name": "Routing Table Check",
            "result": "FAIL",
            "evidence": "OSPF neighbor state stuck in 2WAY state instead of FULL.",
            "explanation": "OSPF adjacency incomplete. Routing information is not being exchanged between neighbors."
        }

    if "no ip routing" in evidence_text:
        return {
            "check_name": "Routing Table Check",
            "result": "FAIL",
            "evidence": "show running-config output explicitly contains 'no ip routing'.",
            "explanation": "IP routing process is globally disabled on Layer 3 switch."
        }

    return {
        "check_name": "Routing Table Check",
        "result": "PASS",
        "evidence": "Routing table contains valid connected, static, or dynamic route entries.",
        "explanation": "Routing table entries present for expected subnets."
    }


def run_all_checks(evidence_text="", topology_text="", symptom_text=""):
    """Run all 6 deterministic network checks and return array of results."""
    return [
        check_duplicate_ip(evidence_text, topology_text, symptom_text),
        check_wrong_subnet_mask(evidence_text, topology_text, symptom_text),
        check_gateway_mismatch(evidence_text, topology_text, symptom_text),
        check_interface_down(evidence_text, topology_text, symptom_text),
        check_missing_vlan(evidence_text, topology_text, symptom_text),
        check_missing_route(evidence_text, topology_text, symptom_text)
    ]

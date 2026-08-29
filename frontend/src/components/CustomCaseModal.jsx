import React, { useState } from 'react';
import { X, Plus, Terminal } from 'lucide-react';

export default function CustomCaseModal({ isOpen, onClose, onCreateCase }) {
  const [symptom, setSymptom] = useState('');
  const [topologyNotes, setTopologyNotes] = useState('');
  const [showOutputs, setShowOutputs] = useState('');
  const [concept, setConcept] = useState('VLAN');
  const [severity, setSeverity] = useState('High');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symptom || !showOutputs) return;

    const customId = `CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase = {
      case_id: customId,
      symptom,
      topology_notes: topologyNotes || 'User custom topology scenario.',
      show_outputs: showOutputs,
      expected_fault: 'Custom user defined fault',
      osi_layer: 'Layer 3',
      concept,
      severity
    };

    onCreateCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            Create Custom Cisco Troubleshooting Lab Case
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Reported Network Symptom *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Host 192.168.1.10 cannot ping default gateway 192.168.1.1"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Domain Concept
              </label>
              <select
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                {['VLAN', 'Gateway', 'DHCP', 'DNS', 'Routing', 'ACL', 'NAT', 'Wireless'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                {['Low', 'Medium', 'High', 'Critical'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Topology & Lab Environment Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. PC1 connected to Switch-1 Fa0/1 (VLAN 10). Router-1 connected to Switch-1 Gi0/1."
              value={topologyNotes}
              onChange={(e) => setTopologyNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Cisco Show Command Outputs *
            </label>
            <textarea
              rows={6}
              required
              placeholder={`show ip interface brief\nGigabitEthernet0/0/0 192.168.1.1 YES manual administratively down down\n\nshow vlan brief\n...`}
              value={showOutputs}
              onChange={(e) => setShowOutputs(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition shadow-md shadow-cyan-900/30"
            >
              Load Custom Case
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

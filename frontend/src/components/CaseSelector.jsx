import React, { useState } from 'react';
import { Filter, PlusCircle, Search, Layers } from 'lucide-react';

export default function CaseSelector({ cases, selectedCase, onSelectCase, onOpenCustomModal }) {
  const [selectedConcept, setSelectedConcept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const concepts = ['All', 'VLAN', 'Gateway', 'DHCP', 'DNS', 'Routing', 'ACL', 'NAT', 'Wireless'];

  const filteredCases = cases.filter(c => {
    const matchesConcept = selectedConcept === 'All' || c.concept === selectedConcept;
    const matchesSearch = searchQuery === '' || 
      c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.expected_fault.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesConcept && matchesSearch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Select Troubleshooting Lab Case
          </h2>
          <p className="text-xs text-slate-400">
            Choose from {cases.length} pre-configured Cisco Packet Tracer scenarios or define a custom case.
          </p>
        </div>

        <button
          onClick={onOpenCustomModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-medium text-sm transition shadow-md shadow-emerald-900/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Custom Case</span>
        </button>

      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        
        {/* Concept Filter Buttons */}
        <div className="md:col-span-8 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-slate-400 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1" /> Domain:
          </span>
          {concepts.map(concept => (
            <button
              key={concept}
              onClick={() => setSelectedConcept(concept)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                selectedConcept === concept
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {concept}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search symptoms or Case IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

      </div>

      {/* Select Box */}
      <div className="relative">
        <select
          value={selectedCase?.case_id || ''}
          onChange={(e) => {
            const found = cases.find(c => c.case_id === e.target.value);
            if (found) onSelectCase(found);
          }}
          className="w-full bg-slate-950 border border-slate-700 hover:border-cyan-500/50 rounded-lg px-4 py-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition appearance-none cursor-pointer"
        >
          {filteredCases.map(c => (
            <option key={c.case_id} value={c.case_id} className="bg-slate-900 text-slate-200">
              [{c.case_id}] ({c.concept} • {c.severity}) - {c.symptom.substring(0, 95)}...
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          ▼
        </div>
      </div>
    </div>
  );
}

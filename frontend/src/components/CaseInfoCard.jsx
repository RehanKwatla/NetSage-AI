import React from 'react';
import { AlertCircle, Network, Server, Tag } from 'lucide-react';

export default function CaseInfoCard({ currentCase }) {
  if (!currentCase) return null;

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-950 text-red-400 border-red-800';
      case 'high':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'medium':
        return 'bg-yellow-950 text-yellow-400 border-yellow-800';
      case 'low':
      default:
        return 'bg-blue-950 text-blue-400 border-blue-800';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg mb-6">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-mono font-bold">
            {currentCase.case_id}
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <Tag className="w-3 h-3 text-cyan-400" />
            {currentCase.concept}
          </span>
          {currentCase.osi_layer && (
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800">
              {currentCase.osi_layer}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Severity:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getSeverityBadge(currentCase.severity)}`}>
            {currentCase.severity}
          </span>
        </div>

      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Symptom */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-red-400 font-semibold text-xs tracking-wider uppercase">
            <AlertCircle className="w-4 h-4" />
            Reported Symptom
          </div>
          <p className="text-slate-200 text-sm leading-relaxed font-medium">
            {currentCase.symptom}
          </p>
        </div>

        {/* Topology Notes */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
            <Network className="w-4 h-4" />
            Topology & Lab Environment Notes
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {currentCase.topology_notes}
          </p>
        </div>

      </div>

    </div>
  );
}

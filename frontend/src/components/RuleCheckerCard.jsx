import React from 'react';
import { Cpu, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export default function RuleCheckerCard({ ruleResults }) {
  if (!ruleResults || !Array.isArray(ruleResults)) return null;

  const getResultBadge = (result) => {
    switch (result?.toUpperCase()) {
      case 'PASS':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
          badgeText: 'PASS'
        };
      case 'FAIL':
        return {
          icon: <XCircle className="w-4 h-4 text-red-400" />,
          bg: 'bg-red-950/80 text-red-300 border-red-800',
          badgeText: 'FAIL'
        };
      case 'WARNING':
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          bg: 'bg-amber-950/80 text-amber-300 border-amber-800',
          badgeText: 'WARNING'
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 mb-5 border-b border-slate-800">
        <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-sans">Deterministic Python Rule Checker</h3>
          <p className="text-xs text-slate-400">Deterministic Config & Protocol Verification Engine</p>
        </div>
      </div>

      {/* Grid of 6 checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ruleResults.map((check, idx) => {
          const badge = getResultBadge(check.result);

          return (
            <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              
              <div>
                {/* Title & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-200">
                    {check.check_name}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border flex items-center gap-1 shrink-0 ${badge.bg}`}>
                    {badge.icon}
                    {badge.badgeText}
                  </span>
                </div>

                {/* Evidence snippet */}
                <p className="text-xs text-slate-400 font-mono mb-2 bg-slate-900/80 p-2 rounded border border-slate-800/80">
                  {check.evidence}
                </p>
              </div>

              {/* Explanation */}
              <div className="text-[11px] text-slate-300 pt-2 border-t border-slate-800/50 flex items-start gap-1.5 mt-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{check.explanation}</span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

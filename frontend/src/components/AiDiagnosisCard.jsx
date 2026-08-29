import React from 'react';
import { Bot, CheckCircle2, ShieldAlert, Terminal, Layers, ArrowRight, Lightbulb } from 'lucide-react';

export default function AiDiagnosisCard({ diagnosis }) {
  if (!diagnosis) return null;

  const { root_cause, confidence, osi_layer, evidence, next_command, fix_steps } = diagnosis;

  const getConfidenceColor = (conf) => {
    if (conf >= 85) return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-800' };
    if (conf >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-800' };
    return { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-800' };
  };

  const confColor = getConfidenceColor(confidence || 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Glow effect */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-sans">Gemini AI Diagnosis</h3>
            <p className="text-xs text-slate-400">Generative AI Multi-factor Network Analysis</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* OSI Layer */}
          {osi_layer && (
            <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
              <Layers className="w-3 h-3 text-purple-400" />
              {osi_layer}
            </span>
          )}

          {/* Confidence Meter */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400">Confidence:</span>
            <span className={`text-xs font-bold font-mono ${confColor.text}`}>{confidence}%</span>
            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${confColor.bg} transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Root Cause Section */}
      <div className="mb-6 bg-slate-950/70 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          Likely Root Cause
        </h4>
        <p className="text-slate-100 text-sm font-semibold leading-relaxed">
          {root_cause}
        </p>
      </div>

      {/* Evidence Used List */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Evidence Cited from Show Outputs
        </h4>
        {evidence && evidence.length > 0 ? (
          <ul className="space-y-2">
            {evidence.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">No specific evidence items cited.</p>
        )}
      </div>

      {/* Recommended Next Command */}
      {next_command && (
        <div className="mb-6 bg-slate-950 border border-cyan-900/50 rounded-xl p-4">
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Recommended Next Verification Command
          </h4>
          <div className="bg-slate-900 px-3 py-2 rounded-lg font-mono text-xs text-cyan-300 border border-slate-800 flex items-center justify-between">
            <code>{next_command}</code>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Cisco IOS</span>
          </div>
        </div>
      )}

      {/* Recommended Fix Steps */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Recommended Resolution & Fix Steps
        </h4>
        {fix_steps && fix_steps.length > 0 ? (
          <ol className="space-y-2">
            {fix_steps.map((step, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-xs text-slate-200 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span className="font-mono pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-slate-500 italic">No fix steps provided.</p>
        )}
      </div>

    </div>
  );
}

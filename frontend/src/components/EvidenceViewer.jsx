import React from 'react';
import { Terminal as TerminalIcon, Sparkles, Copy, Check } from 'lucide-react';

export default function EvidenceViewer({ evidenceText, onAnalyze, loading }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(evidenceText || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg mb-8">
      
      {/* Terminal Header Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1.5 pl-2">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            Cisco IOS Show Commands Evidence Terminal
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 transition"
            title="Copy CLI Evidence"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="bg-[#0A0F1D] p-5 font-mono text-sm leading-relaxed text-slate-200 overflow-x-auto max-h-96 cli-scroll border-b border-slate-800">
        {evidenceText ? (
          <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-cyan-300/90">
            {evidenceText}
          </pre>
        ) : (
          <div className="text-slate-500 italic py-6 text-center text-xs">
            No command outputs supplied for this case.
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Ready for AI Diagnosis & Deterministic Rule Check</span>
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading || !evidenceText}
          className={`flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg w-full sm:w-auto ${
            loading || !evidenceText
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-900/30 hover:shadow-cyan-500/20 active:scale-95'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing Network Evidence...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Analyze Case</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
}

import React from 'react';
import { Cpu, ShieldCheck, BarChart3, Activity, Terminal, ShieldAlert } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                  NetSage <span className="text-cyan-400 font-mono">AI</span>
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" /> Cisco Labs
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                AI-Assisted Network Troubleshooting with Human Review
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('troubleshooter')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'troubleshooter'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Troubleshooter</span>
            </button>

            <button
              onClick={() => setActiveTab('log')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'log'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Responsible AI Log</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics Dashboard</span>
            </button>
          </nav>

          {/* Safety Status Banner */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Human Review Required • No Auto Config</span>
          </div>

        </div>
      </div>
    </header>
  );
}

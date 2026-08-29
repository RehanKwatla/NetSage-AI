import React, { useState, useEffect } from 'react';
import { getReviews } from '../services/api';
import { ShieldCheck, Filter, Search, CheckCircle2, Edit3, XCircle, Info, RefreshCw } from 'lucide-react';

export default function ResponsibleAiLogPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDecision, setFilterDecision] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviews();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(r => {
    const matchesDecision = filterDecision === 'All' || r.decision === filterDecision;
    const matchesSearch = searchQuery === '' ||
      r.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ai_diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.human_correction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDecision && matchesSearch;
  });

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'Accepted':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'Edited':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5" /> Edited
          </span>
        );
      case 'Rejected':
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-950 text-red-400 border border-red-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-sans">Responsible AI Audit & Review Log</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Transparent audit log of human evaluations, overrides, and corrections on AI diagnoses.
              </p>
            </div>
          </div>

          <button
            onClick={fetchReviews}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Log</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        
        {/* Decision Filter */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1" /> Decision:
          </span>
          {['All', 'Accepted', 'Edited', 'Rejected'].map(d => (
            <button
              key={d}
              onClick={() => setFilterDecision(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filterDecision === d
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search review records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

      </div>

      {/* Review Records List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs font-mono">
          Loading Responsible AI logs...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
          No matching human review records found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-700 transition">
              
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 bg-slate-950 text-cyan-400 border border-slate-800 rounded text-xs font-mono font-bold">
                    {item.case_id}
                  </span>
                  {getDecisionBadge(item.decision)}
                </div>
                
                {item.timestamp && (
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {/* AI Original Diagnosis */}
                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
                  <span className="block text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                    AI Original Diagnosis
                  </span>
                  <p className="text-xs text-slate-300 font-medium">
                    {item.ai_diagnosis}
                  </p>
                </div>

                {/* Human Reviewer Correction */}
                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
                  <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Human Reviewer Correction / Assessment
                  </span>
                  <p className="text-xs text-slate-200 font-semibold">
                    {item.human_correction}
                  </p>
                </div>
              </div>

              {/* Reason for decision */}
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300 mr-1">Reviewer Reason:</strong>
                  {item.reason}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';
import { BarChart3, PieChart, CheckCircle2, AlertTriangle, ShieldCheck, FileText, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie, Legend
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 font-mono text-xs">
        Loading NetSage AI Analytics Dashboard...
      </div>
    );
  }

  if (!data) return null;

  const conceptColors = {
    VLAN: '#00B4D8',
    Gateway: '#0077B6',
    DHCP: '#7209B7',
    DNS: '#4361EE',
    Routing: '#4CC9F0',
    ACL: '#F72585',
    NAT: '#4895EF',
    Wireless: '#3F37C9'
  };

  const severityColors = {
    Low: '#3B82F6',
    Medium: '#EAB308',
    High: '#F97316',
    Critical: '#EF4444'
  };

  const agreementData = [
    { name: 'Accepted', value: data.agreement_counts.Accepted, color: '#10B981' },
    { name: 'Edited', value: data.agreement_counts.Edited, color: '#F59E0B' },
    { name: 'Rejected', value: data.agreement_counts.Rejected, color: '#EF4444' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-sans">Analytics & AI Diagnostic Metrics</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live statistics derived from the 32+ lab case dataset and historical human review logs.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Total Cases */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Lab Scenarios</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{data.total_cases}</div>
          <div className="text-[11px] text-slate-500 mt-1">Cisco Packet Tracer cases</div>
        </div>

        {/* AI-Human Agreement Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>AI Agreement Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{data.agreement_rate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Accepted without human edit</div>
        </div>

        {/* Total Human Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Logged Human Reviews</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{data.total_reviews}</div>
          <div className="text-[11px] text-slate-500 mt-1">Audited diagnostic entries</div>
        </div>

        {/* Human Corrections */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Human Corrected Cases</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {data.agreement_counts.Edited + data.agreement_counts.Rejected}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Edited or Rejected AI output</div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* 1. Issue Types Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Issue Types Breakdown (8 Domains)
          </h3>
          <p className="text-xs text-slate-400 mb-6">Distribution of troubleshooting cases across core networking concepts</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.issue_types}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.issue_types.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={conceptColors[entry.name] || '#00B4D8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. AI vs Human Agreement Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            AI vs Human Review Agreement Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-6">Review decisions breakdown (Accepted, Edited, Rejected)</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={agreementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agreementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Severity Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          Case Severity Distribution
        </h3>
        <p className="text-xs text-slate-400 mb-6">Proportion of cases classified by operational impact</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data.severities.map((item) => (
            <div key={item.name} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-1">{item.name} Severity</div>
              <div className="text-2xl font-bold font-mono" style={{ color: severityColors[item.name] || '#FFF' }}>
                {item.count}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {roundPct(item.count, data.total_cases)}% of dataset
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function roundPct(val, total) {
  if (!total) return 0;
  return Math.round((val / total) * 100);
}

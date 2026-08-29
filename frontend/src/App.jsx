import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Check, CheckCircle2,
  ChevronRight, Clipboard, Download, FileText, GitBranch, LayoutDashboard,
  Menu, Network, Play, RefreshCw, Search, Server, Settings, ShieldCheck,
  Terminal, UserCheck, X, Wifi, Workflow, Wrench, XCircle
} from 'lucide-react';
import { getCases, getDashboard, getReviews, diagnoseCase, submitReview } from './services/api';

const nav = [
  ['overview', 'Overview', LayoutDashboard], ['troubleshoot', 'Troubleshoot', Wrench],
  ['cases', 'Cases', FileText], ['topology', 'Topology', Network], ['diagnostics', 'Diagnostics', Activity],
  ['rules', 'Rule checker', ShieldCheck], ['review', 'Human review', UserCheck],
  ['analytics', 'Analytics', BarChart3], ['responsible', 'Responsible AI', Clipboard], ['settings', 'Settings', Settings]
];

const statusTone = { high: 'critical', medium: 'warning', low: 'ok' };

function App() {
  const [active, setActive] = useState('troubleshoot');
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [reviewState, setReviewState] = useState('pending');
  const [reviewReason, setReviewReason] = useState('');
  const [verified, setVerified] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const [caseData, reviewData, metrics] = await Promise.all([getCases(), getReviews(), getDashboard()]);
      setCases(caseData.cases || []); setSelected(prev => prev || caseData.cases?.[0]);
      setReviews(reviewData.reviews || []); setDashboard(metrics);
    } catch (e) { setError('Backend unavailable. Start the Flask service to load live case data.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const filteredCases = useMemo(() => cases.filter(c =>
    `${c.case_id} ${c.symptom} ${c.concept} ${c.expected_fault}`.toLowerCase().includes(query.toLowerCase())
  ), [cases, query]);

  const runDiagnosis = async () => {
    if (!selected) return;
    setRunning(true); setDiagnosis(null); setError(''); setReviewState('pending'); setVerified(false);
    try { setDiagnosis(await diagnoseCase({ case_id: selected.case_id, symptom: selected.symptom, topology_notes: selected.topology_notes, show_outputs: selected.show_outputs })); }
    catch (e) { setError(e.response?.data?.error || 'Diagnosis could not be completed.'); }
    finally { setRunning(false); }
  };
  const recordReview = async (decision) => {
    if (!diagnosis || (decision !== 'Accepted' && !reviewReason.trim())) { setError('Add a reason when editing or rejecting a diagnosis.'); return; }
    try {
      await submitReview({ case_id: selected.case_id, ai_diagnosis: diagnosis.ai_diagnosis?.root_cause || '', human_correction: decision === 'Accepted' ? '' : reviewReason, reason: decision === 'Accepted' ? 'Human reviewer agreed with the recommendation.' : reviewReason, decision, edited_details: decision === 'Edited' ? diagnosis.ai_diagnosis : null });
      setReviewState(decision.toLowerCase()); setNotice(`Review recorded as ${decision}.`); setReviewReason(''); refresh();
      setTimeout(() => setNotice(''), 3500);
    } catch (e) { setError('Review could not be saved to the audit log.'); }
  };
  const exportConfig = () => {
    const blob = new Blob([`! NetSage AI Packet Tracer handoff\n! Case: ${selected?.case_id || 'unassigned'}\n! This is a device configuration handoff, not a .pkt file.\n\n${selected?.show_outputs || ''}`], { type: 'text/plain' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${selected?.case_id || 'netsage-lab'}-packet-tracer-handoff.txt`; link.click(); URL.revokeObjectURL(link.href);
  };

  const selectView = (view) => { setActive(view); setMobileNav(false); };
  const title = nav.find(n => n[0] === active)?.[1] || 'Troubleshoot';

  if (loading) return <div className="boot"><div className="boot-mark"><Network size={25}/></div><span>Loading case registry</span><div className="progress"><i /></div></div>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Network size={19}/></div><div><strong>NETSAGE</strong><span>AI / OPERATIONS</span></div></div>
      <div className="system-state"><span className="state-dot" /> DIAGNOSTIC SERVICE <b>ONLINE</b></div>
      <nav>{nav.map(([id, label, Icon]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => selectView(id)}><Icon size={16}/><span>{label}</span>{id === 'review' && reviews.length > 0 && <em>{reviews.length}</em>}</button>)}</nav>
      <div className="sidebar-foot"><div className="user-line"><div className="avatar">RN</div><div><strong>Network lab</strong><span>Reviewer session</span></div></div><div className="version">NETSAGE / 1.4.0</div></div>
    </aside>
    <main className="main-shell">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Menu size={19}/></button><div><p className="eyebrow">NETSAGE AI / {active.toUpperCase()}</p><h1>{title}</h1></div><div className="top-actions"><span className="last-sync">Dataset synced / 32 cases</span><button className="icon-button" onClick={refresh} title="Refresh data"><RefreshCw size={16}/></button><button className="primary-button" onClick={() => { selectView('troubleshoot'); setTimeout(runDiagnosis, 0); }}><Play size={14}/> Run diagnosis</button></div></header>
      {error && <div className="alert error"><AlertTriangle size={16}/><span>{error}</span><button onClick={() => setError('')}><X size={15}/></button></div>}
      {notice && <div className="alert success"><CheckCircle2 size={16}/><span>{notice}</span></div>}
      {active === 'troubleshoot' && <TroubleshootView {...{cases, filteredCases, selected, setSelected, query, setQuery, diagnosis, running, runDiagnosis, reviewState, reviewReason, setReviewReason, recordReview, verified, setVerified, exportConfig}} />}
      {active === 'overview' && <Overview dashboard={dashboard} cases={cases} selectView={selectView} />}
      {active === 'cases' && <CasesView cases={filteredCases} query={query} setQuery={setQuery} selected={selected} setSelected={setSelected} selectView={selectView} />}
      {active === 'topology' && <TopologyView />}
      {active === 'diagnostics' && <DiagnosticsView diagnosis={diagnosis} runDiagnosis={runDiagnosis} selected={selected} />}
      {active === 'rules' && <RulesView diagnosis={diagnosis} />}
      {active === 'review' && <ReviewView reviews={reviews} />}
      {active === 'analytics' && <AnalyticsView dashboard={dashboard} />}
      {active === 'responsible' && <ResponsibleView reviews={reviews} dashboard={dashboard} />}
      {active === 'settings' && <SettingsView />}
    </main>
  </div>;
}

function SectionHead({ kicker, title, note, action }) { return <div className="section-head"><div><span className="eyebrow">{kicker}</span><h2>{title}</h2>{note && <p>{note}</p>}</div>{action}</div>; }
function Stat({ label, value, detail, tone = 'neutral' }) { return <div className="stat"><span>{label}</span><strong className={tone}>{value}</strong><small>{detail}</small></div>; }
function Panel({ title, meta, children, className = '' }) { return <section className={`panel ${className}`}><div className="panel-head"><h3>{title}</h3>{meta && <span>{meta}</span>}</div>{children}</section>; }

function Overview({ dashboard, cases, selectView }) { return <div className="content"><SectionHead kicker="FIELD SUMMARY" title="A clear line from symptom to fix." note="The active case registry and review trail, without hiding the evidence." action={<button className="primary-button" onClick={() => selectView('troubleshoot')}><Wrench size={14}/> Open a case</button>} /><div className="stats-row"><Stat label="CASE REGISTRY" value={dashboard?.total_cases || cases.length} detail="loaded troubleshooting cases" tone="accent"/><Stat label="HUMAN REVIEWS" value={dashboard?.total_reviews || 0} detail="decisions in audit log"/><Stat label="AGREEMENT" value={`${dashboard?.agreement_rate || 0}%`} detail="AI / human agreement" tone="ok"/><Stat label="SERVICE" value="ONLINE" detail="Flask diagnostic API" tone="ok"/></div><div className="overview-grid"><Panel title="Recent case queue" meta="Priority order"><div className="queue">{cases.slice(0, 6).map(c => <button key={c.case_id} onClick={() => selectView('troubleshoot')}><span className={`severity ${statusTone[(c.severity || '').toLowerCase()] || 'neutral'}`}>{c.severity}</span><span><b>{c.case_id}</b><small>{c.symptom}</small></span><ChevronRight size={15}/></button>)}</div></Panel><Panel title="Review chain" meta="AI → human → verification"><div className="chain"><div><span>01</span><strong>Collect evidence</strong><small>Symptom, topology and show output</small></div><ArrowRight/><div><span>02</span><strong>Run diagnosis</strong><small>AI reasoning beside deterministic checks</small></div><ArrowRight/><div><span>03</span><strong>Review and verify</strong><small>Human decision is the final authority</small></div></div></Panel></div></div> }

function TroubleshootView({ filteredCases, selected, setSelected, query, setQuery, diagnosis, running, runDiagnosis, reviewState, reviewReason, setReviewReason, recordReview, verified, setVerified, exportConfig }) { return <div className="content"><SectionHead kicker="ACTIVE WORKSTATION" title="Trace the fault from symptom to evidence." note="Select a case, inspect the CLI output, then run an evidence-bound diagnosis." action={<button className="secondary-button" onClick={exportConfig}><Download size={14}/> Packet Tracer handoff</button>} /><div className="workspace"><aside className="case-rail"><div className="rail-title"><span>CASE REGISTRY</span><b>{filteredCases.length}</b></div><div className="search"><Search size={14}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find case or concept" /></div><div className="case-list">{filteredCases.map(c => <button key={c.case_id} className={selected?.case_id === c.case_id ? 'selected' : ''} onClick={() => setSelected(c)}><span className={`severity ${statusTone[(c.severity || '').toLowerCase()] || 'neutral'}`} /> <span><b>{c.case_id}</b><small>{c.concept} / {c.severity}</small></span><ChevronRight size={14}/></button>)}</div></aside><div className="evidence-column"><div className="case-header"><div><span className="eyebrow">{selected?.case_id || 'NO CASE'}</span><h2>{selected?.symptom || 'Select a case from the registry'}</h2></div><span className={`severity-label ${statusTone[(selected?.severity || '').toLowerCase()] || 'neutral'}`}>{selected?.severity || '—'} severity</span></div><div className="metadata"><div><span>CONCEPT</span><b>{selected?.concept || '—'}</b></div><div><span>OSI TARGET</span><b>{selected?.osi_layer || '—'}</b></div><div><span>TOPOLOGY</span><b>{selected?.topology_notes || '—'}</b></div></div><Panel title="Command evidence" meta="Read-only case output"><pre className="terminal"><i>$ case evidence / {selected?.case_id || 'unassigned'}</i>{'\n\n'}{selected?.show_outputs || 'No command output loaded.'}</pre><div className="terminal-foot"><span><Terminal size={14}/> Cisco IOS output</span><button className="text-button" onClick={() => navigator.clipboard?.writeText(selected?.show_outputs || '')}><Clipboard size={13}/> Copy output</button></div></Panel><div className="run-row"><button className="primary-button large" onClick={runDiagnosis} disabled={running || !selected}>{running ? <><RefreshCw className="spin" size={15}/> Running checks</> : <><Play size={15}/> Run diagnosis</>}</button><span>AI reasoning and deterministic checks run together. No recommendation is final until reviewed.</span></div></div><DiagnosisPanel diagnosis={diagnosis} running={running}/></div><ReviewPanel diagnosis={diagnosis} reviewState={reviewState} reviewReason={reviewReason} setReviewReason={setReviewReason} recordReview={recordReview} verified={verified} setVerified={setVerified}/></div> }

function DiagnosisPanel({ diagnosis, running }) { const ai = diagnosis?.ai_diagnosis; return <div className="diagnosis-column"><Panel title="AI diagnosis" meta={running ? 'Processing…' : ai ? 'Recommendation' : 'Awaiting evidence'} className="diagnosis-panel">{running ? <div className="loading-block"><RefreshCw className="spin" size={19}/><span>Comparing symptom with command evidence…</span></div> : ai ? <><div className="root-cause"><span>LIKELY ROOT CAUSE</span><h2>{ai.root_cause}</h2></div><div className="diagnosis-facts"><div><span>CONFIDENCE</span><b>{ai.confidence}</b></div><div><span>OSI LAYER</span><b>{ai.osi_layer}</b></div></div><div className="evidence-list"><span className="label">EVIDENCE USED</span>{(ai.evidence || []).map((e, i) => <p key={i}><Check size={14}/>{e}</p>)}</div><div className="next-command"><span>NEXT COMMAND</span><code>{ai.next_command || 'No additional command suggested'}</code></div><div className="fix"><span>RECOMMENDED FIX</span>{(ai.fix_steps || []).map((s, i) => <p key={i}><b>{String(i + 1).padStart(2, '0')}</b>{s}</p>)}</div></> : <div className="empty-state"><Activity size={22}/><p>Run diagnosis to see a structured recommendation, evidence trail and next command.</p></div>}</Panel><Panel title="Deterministic rule checks" meta={diagnosis ? `${(diagnosis.rule_checker || []).filter(r => r.status === 'PASS').length} pass / ${(diagnosis.rule_checker || []).filter(r => r.status === 'FAIL').length} fail` : 'Separate from AI'}>{diagnosis?.rule_checker?.length ? diagnosis.rule_checker.map((r, i) => <div className="rule-line" key={i}><span className={`rule-icon ${r.status?.toLowerCase()}`}>{r.status === 'PASS' ? <Check size={13}/> : r.status === 'FAIL' ? <X size={13}/> : <AlertTriangle size={13}/>}</span><div><b>{r.check}</b><small>{r.evidence || r.message}</small></div><strong>{r.status}</strong></div>) : <div className="empty-inline">No checks have run for this case.</div>}</Panel></div> }

function ReviewPanel({ diagnosis, reviewState, reviewReason, setReviewReason, recordReview, verified, setVerified }) { return <Panel title="Human review" meta={reviewState === 'pending' ? 'Required before verification' : `Decision: ${reviewState}`} className="review-panel"><div className="review-intro"><UserCheck size={18}/><div><b>AI recommendation → Human review → Fix → Verification</b><p>The reviewer owns the final decision. Accept the recommendation, edit it with a reason, or reject it.</p></div></div><div className="review-actions"><button disabled={!diagnosis || reviewState !== 'pending'} className={reviewState === 'accepted' ? 'decision accepted' : 'decision'} onClick={() => recordReview('Accepted')}><CheckCircle2 size={16}/> Accept</button><button disabled={!diagnosis || reviewState !== 'pending'} className={reviewState === 'edited' ? 'decision edited' : 'decision'} onClick={() => recordReview('Edited')}><Wrench size={16}/> Edit</button><button disabled={!diagnosis || reviewState !== 'pending'} className={reviewState === 'rejected' ? 'decision rejected' : 'decision'} onClick={() => recordReview('Rejected')}><XCircle size={16}/> Reject</button></div><textarea value={reviewReason} onChange={e => setReviewReason(e.target.value)} placeholder="Reviewer note — required for edit or reject" disabled={!diagnosis || reviewState !== 'pending'} /><div className="verification"><div><span className={verified ? 'check-box done' : 'check-box'}>{verified && <Check size={13}/>}</span><div><b>Verify the proposed fix</b><small>Re-run the relevant show command in Packet Tracer after applying the change.</small></div></div><button disabled={reviewState === 'pending'} className="secondary-button" onClick={() => setVerified(true)}>{verified ? 'Verified' : 'Mark verified'}</button></div></Panel> }

function CasesView({ cases, query, setQuery, selected, setSelected, selectView }) { return <div className="content"><SectionHead kicker="CASE REGISTRY" title="Cases built around real troubleshooting evidence." note="32 seeded labs across VLAN, routing, DHCP, DNS, ACL, NAT, wireless and gateway faults." /><div className="toolbar"><div className="search wide"><Search size={14}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search case ID, symptom, concept or fault" /></div><span className="toolbar-count">{cases.length} results</span></div><div className="table-wrap"><table><thead><tr><th>Case</th><th>Symptom</th><th>Concept</th><th>OSI layer</th><th>Severity</th><th /></tr></thead><tbody>{cases.map(c => <tr key={c.case_id} onClick={() => {setSelected(c); selectView('troubleshoot')}}><td><b>{c.case_id}</b></td><td>{c.symptom}</td><td>{c.concept}</td><td>{c.osi_layer}</td><td><span className={`severity-label ${statusTone[(c.severity || '').toLowerCase()] || 'neutral'}`}>{c.severity}</span></td><td><ChevronRight size={15}/></td></tr>)}</tbody></table></div></div> }
function TopologyView() { return <div className="content"><SectionHead kicker="TOPOLOGY / LIVE CASE" title="A diagram that keeps the fault in context." note="The active lab path is represented as an engineering diagram, not decorative 3D artwork." /><Panel title="Branch lab / inter-VLAN path" meta="Suspected fault: Layer 3"><div className="topology"><div className="device pc"><Wifi size={20}/><b>PC-01</b><small>10.10.10.21</small></div><div className="link healthy"><span>Fa0/1</span></div><div className="device switch"><Network size={22}/><b>SW-CORE</b><small>VLAN 10 / 20 / 30</small></div><div className="link fault"><span>Gi0/1 · trunk</span></div><div className="device router"><GitBranch size={22}/><b>R1-EDGE</b><small>Gi0/0 · 10.10.10.1</small></div><div className="path-note"><AlertTriangle size={15}/><span><b>Suspected fault location</b><small>Trunk path carries VLAN 10; verify allowed VLANs and routing state.</small></span></div></div><div className="legend"><span><i className="legend-dot green"/> Healthy link</span><span><i className="legend-dot red"/> Suspected fault</span><span><i className="legend-dot amber"/> Review required</span></div></Panel></div> }
function DiagnosticsView({ diagnosis, runDiagnosis, selected }) { return <div className="content"><SectionHead kicker="DIAGNOSTICS" title="The recommendation stays close to its evidence." note="AI reasoning is shown beside the rules that can be checked without a model." action={<button className="primary-button" onClick={runDiagnosis}><Play size={14}/> Run diagnosis</button>} />{diagnosis ? <div className="diagnostic-report"><DiagnosisPanel diagnosis={diagnosis}/></div> : <div className="empty-page"><Activity size={26}/><h3>No diagnosis for {selected?.case_id || 'the active case'}</h3><p>Run a diagnosis from the troubleshooting workstation.</p></div>}</div> }
function RulesView({ diagnosis }) { const checks = diagnosis?.rule_checker || []; return <div className="content"><SectionHead kicker="RULE CHECKER" title="Deterministic evidence, kept separate from AI." note="These checks use the case text and command output. They do not infer beyond the rules." /><Panel title="Current check run" meta={checks.length ? `${checks.length} checks` : 'No active run'}>{checks.length ? checks.map((r, i) => <div className="rule-line large" key={i}><span className={`rule-icon ${r.status?.toLowerCase()}`}>{r.status === 'PASS' ? <Check size={13}/> : r.status === 'FAIL' ? <X size={13}/> : <AlertTriangle size={13}/>}</span><div><b>{r.check}</b><small>{r.evidence || r.message}</small></div><strong>{r.status}</strong></div>) : <div className="empty-page"><ShieldCheck size={23}/><p>Run diagnosis to populate the deterministic checker.</p></div>}</Panel></div> }
function ReviewView({ reviews }) { return <div className="content"><SectionHead kicker="HUMAN REVIEW" title="The final authority is visible." note="Every decision is stored with the reason behind it." /><div className="review-summary"><Stat label="TOTAL DECISIONS" value={reviews.length} detail="review log entries"/><Stat label="ACCEPTED" value={reviews.filter(r=>r.decision==='Accepted').length} detail="AI recommendation kept" tone="ok"/><Stat label="EDITED" value={reviews.filter(r=>r.decision==='Edited').length} detail="human correction" tone="warning"/><Stat label="REJECTED" value={reviews.filter(r=>r.decision==='Rejected').length} detail="recommendation discarded" tone="critical"/></div><Panel title="Decision log" meta="Newest first"><ReviewTable reviews={reviews}/></Panel></div> }
function ReviewTable({ reviews }) { return <div className="review-table">{reviews.map((r, i) => <div className="review-row" key={i}><span className={`decision-chip ${r.decision?.toLowerCase()}`}>{r.decision}</span><div><b>{r.case_id}</b><p>{r.reason}</p></div><time>{r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'}</time></div>)}</div> }
function AnalyticsView({ dashboard }) { return <div className="content"><SectionHead kicker="ANALYTICS" title="Measure the review loop, not vanity metrics." note="Counts are calculated from the case registry and responsible-AI log." /><div className="stats-row"><Stat label="CASES" value={dashboard?.total_cases || 0} detail="in registry"/><Stat label="REVIEWS" value={dashboard?.total_reviews || 0} detail="logged decisions"/><Stat label="AGREEMENT" value={`${dashboard?.agreement_rate || 0}%`} detail="accepted / reviews" tone="ok"/></div><Panel title="Issue distribution" meta="Registry counts"><div className="bars">{(dashboard?.issue_types || []).map(x => <div className="bar-row" key={x.name}><span>{x.name}</span><div><i style={{width: `${Math.min(100, (x.count / Math.max(...(dashboard?.issue_types || [{count:1}]).map(y=>y.count))) * 100)}%`}} /></div><b>{x.count}</b></div>)}</div></Panel></div> }
function ResponsibleView({ reviews, dashboard }) { return <div className="content"><SectionHead kicker="RESPONSIBLE AI" title="An engineering audit trail for assisted decisions." note="Review the points where a human agreed, corrected or rejected the model." /><div className="responsible-grid"><Panel title="Agreement profile" meta="Current log"><div className="audit-number"><strong>{dashboard?.agreement_rate || 0}%</strong><span>AI / human agreement</span></div><div className="audit-list"><p><CheckCircle2 size={15}/> Accepted <b>{dashboard?.agreement_counts?.Accepted || 0}</b></p><p><Wrench size={15}/> Edited <b>{dashboard?.agreement_counts?.Edited || 0}</b></p><p><XCircle size={15}/> Rejected <b>{dashboard?.agreement_counts?.Rejected || 0}</b></p></div></Panel><Panel title="Corrected examples" meta={`${reviews.filter(r => r.decision !== 'Accepted').length} in log`}><ReviewTable reviews={reviews.filter(r => r.decision !== 'Accepted').slice(0, 5)}/></Panel></div></div> }
function SettingsView() { return <div className="content"><SectionHead kicker="SETTINGS" title="Keep the lab configuration explicit." note="Runtime and export constraints are shown plainly so operators know what the system can do." /><div className="settings-list"><div><span>DIAGNOSIS SERVICE</span><b>Flask REST API / online when backend is running</b></div><div><span>AI PROVIDER</span><b>Gemini when configured; evidence-bound heuristic fallback otherwise</b></div><div><span>PACKET TRACER EXPORT</span><b>Configuration handoff supported. Native .pkt generation requires Cisco Packet Tracer.</b></div><div><span>DATA STORE</span><b>CSV case registry + JSON responsible-AI audit log</b></div></div></div> }

export default App;

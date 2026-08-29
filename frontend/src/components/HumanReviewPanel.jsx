import React, { useState } from 'react';
import { UserCheck, CheckCircle2, Edit3, XCircle, AlertTriangle, Send } from 'lucide-react';

export default function HumanReviewPanel({ currentCase, aiDiagnosis, onSubmitReview, saving }) {
  const [decision, setDecision] = useState('Accepted'); // 'Accepted' | 'Edited' | 'Rejected'
  
  // Editable fields for 'Edited'
  const [editedRootCause, setEditedRootCause] = useState(aiDiagnosis?.root_cause || '');
  const [editedOsiLayer, setEditedOsiLayer] = useState(aiDiagnosis?.osi_layer || 'Layer 3');
  const [editedConfidence, setEditedConfidence] = useState(aiDiagnosis?.confidence || 90);
  const [editedFixSteps, setEditedFixSteps] = useState(
    Array.isArray(aiDiagnosis?.fix_steps) ? aiDiagnosis.fix_steps.join('\n') : ''
  );
  
  // Mandatory reason for Edited or Rejected
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleDecisionChange = (newDecision) => {
    setDecision(newDecision);
    setValidationError('');
    if (newDecision === 'Edited' && aiDiagnosis) {
      setEditedRootCause(aiDiagnosis.root_cause || '');
      setEditedOsiLayer(aiDiagnosis.osi_layer || 'Layer 3');
      setEditedConfidence(aiDiagnosis.confidence || 90);
      setEditedFixSteps(Array.isArray(aiDiagnosis.fix_steps) ? aiDiagnosis.fix_steps.join('\n') : '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if ((decision === 'Rejected' || decision === 'Edited') && !reason.trim()) {
      setValidationError(`A detailed explanation reason is required when selecting "${decision}".`);
      return;
    }

    const payload = {
      case_id: currentCase?.case_id || 'CUSTOM',
      ai_diagnosis: aiDiagnosis?.root_cause || 'No diagnosis',
      human_correction: decision === 'Edited' ? editedRootCause : (decision === 'Rejected' ? 'Diagnosis Rejected' : 'Accepted AI Diagnosis'),
      decision: decision,
      reason: reason.trim() || 'Human reviewer accepted AI diagnosis without modifications.',
      edited_details: decision === 'Edited' ? {
        root_cause: editedRootCause,
        osi_layer: editedOsiLayer,
        confidence: Number(editedConfidence),
        fix_steps: editedFixSteps.split('\n').filter(s => s.trim())
      } : null
    };

    onSubmitReview(payload);
  };

  if (!aiDiagnosis) return null;

  return (
    <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-xl p-6 shadow-2xl mb-8">
      
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 mb-5 border-b border-slate-800">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            Human Review & Decision
            <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
              Mandatory Review
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Compare AI Diagnosis with Deterministic Rule Checker and record your decision.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Decision Option Buttons */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Select Review Decision:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Accepted Option */}
            <button
              type="button"
              onClick={() => handleDecisionChange('Accepted')}
              className={`p-4 rounded-xl border-2 text-left transition flex items-start space-x-3 ${
                decision === 'Accepted'
                  ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${decision === 'Accepted' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <div className="font-bold text-sm text-slate-100">Accepted</div>
                <div className="text-xs text-slate-400 mt-1">Reviewer agrees completely with AI root cause & steps.</div>
              </div>
            </button>

            {/* Edited Option */}
            <button
              type="button"
              onClick={() => handleDecisionChange('Edited')}
              className={`p-4 rounded-xl border-2 text-left transition flex items-start space-x-3 ${
                decision === 'Edited'
                  ? 'bg-amber-950/80 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Edit3 className={`w-5 h-5 shrink-0 mt-0.5 ${decision === 'Edited' ? 'text-amber-400' : 'text-slate-500'}`} />
              <div>
                <div className="font-bold text-sm text-slate-100">Edited</div>
                <div className="text-xs text-slate-400 mt-1">Reviewer modifies the diagnosis information.</div>
              </div>
            </button>

            {/* Rejected Option */}
            <button
              type="button"
              onClick={() => handleDecisionChange('Rejected')}
              className={`p-4 rounded-xl border-2 text-left transition flex items-start space-x-3 ${
                decision === 'Rejected'
                  ? 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <XCircle className={`w-5 h-5 shrink-0 mt-0.5 ${decision === 'Rejected' ? 'text-red-400' : 'text-slate-500'}`} />
              <div>
                <div className="font-bold text-sm text-slate-100">Rejected</div>
                <div className="text-xs text-slate-400 mt-1">Reviewer rejects the AI diagnosis as incorrect.</div>
              </div>
            </button>

          </div>
        </div>

        {/* Form Fields for 'Edited' Mode */}
        {decision === 'Edited' && (
          <div className="bg-slate-950 p-5 rounded-xl border border-amber-900/50 space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Edit3 className="w-4 h-4" /> Edit Diagnosis Details
            </h4>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Corrected Root Cause:</label>
              <textarea
                rows={2}
                value={editedRootCause}
                onChange={(e) => setEditedRootCause(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OSI Layer:</label>
                <select
                  value={editedOsiLayer}
                  onChange={(e) => setEditedOsiLayer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Layer 1">Layer 1 (Physical)</option>
                  <option value="Layer 2">Layer 2 (Data Link)</option>
                  <option value="Layer 3">Layer 3 (Network)</option>
                  <option value="Layer 4">Layer 4 (Transport)</option>
                  <option value="Layer 7">Layer 7 (Application)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confidence Score (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editedConfidence}
                  onChange={(e) => setEditedConfidence(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Corrected Fix Steps (one per line):</label>
              <textarea
                rows={3}
                value={editedFixSteps}
                onChange={(e) => setEditedFixSteps(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Reason Text Area (Required for Edited & Rejected) */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Review Reason & Justification <span className="text-slate-500 font-normal">(Required for Edited & Rejected)</span>:
          </label>
          <textarea
            rows={3}
            placeholder={
              decision === 'Accepted'
                ? 'Optional notes on why the AI diagnosis is accepted...'
                : 'Explain why the AI diagnosis was modified or rejected based on evidence...'
            }
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setValidationError('');
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-950/50 disabled:opacity-50"
          >
            {saving ? (
              <span>Recording Human Review...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Save Review to Responsible AI Log</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}

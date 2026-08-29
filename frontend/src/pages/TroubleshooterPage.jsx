import React, { useState } from 'react';
import CaseSelector from '../components/CaseSelector';
import CaseInfoCard from '../components/CaseInfoCard';
import EvidenceViewer from '../components/EvidenceViewer';
import AiDiagnosisCard from '../components/AiDiagnosisCard';
import RuleCheckerCard from '../components/RuleCheckerCard';
import HumanReviewPanel from '../components/HumanReviewPanel';
import CustomCaseModal from '../components/CustomCaseModal';

import { diagnoseCase, submitReview } from '../services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TroubleshooterPage({ cases, selectedCase, setSelectedCase, onReviewSuccess }) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const handleAnalyze = async () => {
    if (!selectedCase) return;
    setLoading(true);
    setErrorMsg('');
    setAnalysisResult(null);

    try {
      const payload = {
        case_id: selectedCase.case_id,
        symptom: selectedCase.symptom,
        topology_notes: selectedCase.topology_notes,
        show_outputs: selectedCase.show_outputs
      };

      const res = await diagnoseCase(payload);
      setAnalysisResult(res);
    } catch (err) {
      console.error('Diagnosis error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to complete diagnosis. Ensure backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewPayload) => {
    setSavingReview(true);
    try {
      await submitReview(reviewPayload);
      setToastMsg(`Human Review for ${reviewPayload.case_id} recorded successfully as [${reviewPayload.decision}]!`);
      if (onReviewSuccess) onReviewSuccess();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setErrorMsg('Failed to save human review to backend log.');
    } finally {
      setSavingReview(false);
    }
  };

  const handleCreateCustomCase = (customCase) => {
    setSelectedCase(customCase);
    setAnalysisResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 bg-red-950/80 border border-red-800 text-red-300 p-4 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1 & 2: Select Case */}
      <CaseSelector
        cases={cases}
        selectedCase={selectedCase}
        onSelectCase={(c) => {
          setSelectedCase(c);
          setAnalysisResult(null);
        }}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      {/* Step 3: View Case Info */}
      <CaseInfoCard currentCase={selectedCase} />

      {/* Step 4: Evidence & Analyze Action */}
      <EvidenceViewer
        evidenceText={selectedCase?.show_outputs}
        onAnalyze={handleAnalyze}
        loading={loading}
      />

      {/* Step 5 & 6: AI Diagnosis + Deterministic Python Rule Checker */}
      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* AI Diagnosis */}
          <AiDiagnosisCard diagnosis={analysisResult.ai_diagnosis} />

          {/* Python Rule Checker */}
          <RuleCheckerCard ruleResults={analysisResult.rule_checker} />

        </div>
      )}

      {/* Step 7 & 8: Human Review */}
      {analysisResult && (
        <HumanReviewPanel
          currentCase={selectedCase}
          aiDiagnosis={analysisResult.ai_diagnosis}
          onSubmitReview={handleSubmitReview}
          saving={savingReview}
        />
      )}

      {/* Custom Case Creator Modal */}
      <CustomCaseModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onCreateCase={handleCreateCustomCase}
      />

    </div>
  );
}

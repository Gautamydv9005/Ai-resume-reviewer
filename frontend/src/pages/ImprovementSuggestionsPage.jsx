import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  Filter,
  FileCheck
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { useToast } from '../context/ToastContext';
import { analysisService } from '../services/analysisService';
import Sidebar from '../components/common/Sidebar';
import SuggestionDiffCard from '../components/analysis/SuggestionDiffCard';
import SkeletonLoader from '../components/common/SkeletonLoader';

export default function ImprovementSuggestionsPage() {
  const { resumeId } = useParams();
  const { activeAnalysis, selectResume } = useResume();
  const { addToast } = useToast();
  const [data, setData] = useState(activeAnalysis);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (resumeId) {
      selectResume(resumeId);
      setLoading(true);
      analysisService.getResumeAnalysis(resumeId)
        .then(res => setData(res))
        .finally(() => setLoading(false));
    }
  }, [resumeId, selectResume]);

  const improvements = data?.improvements || [];
  const filtered = activeFilter === 'all'
    ? improvements
    : improvements.filter(i => i.section.toLowerCase() === activeFilter.toLowerCase());

  const handleCopyAll = async () => {
    const allText = improvements
      .map(i => `--- ${i.section.toUpperCase()} ---\n${i.suggested}`)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(allText);
      addToast({
        message: 'Copied all AI suggested section rewrites to clipboard!',
        type: 'success',
        duration: 3500
      });
    } catch {
      addToast({
        message: 'Could not access clipboard.',
        type: 'error'
      });
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {loading ? (
          <SkeletonLoader count={3} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-brand">
                    <Sparkles size={13} /> Interactive Rewrites
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Target: {data?.targetJobTitle || 'Full Stack Engineer'}
                  </span>
                </div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                  Resume Improvement Suggestions
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Review original wording against AI-optimized suggestions for all 5 core sections.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button onClick={handleCopyAll} className="btn btn-secondary btn-sm">
                  <Copy size={15} /> Copy All AI Suggestions
                </button>
                <Link to="/compare" className="btn btn-primary btn-sm">
                  Compare Versions <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Filter Tabs by Section */}
            <div className="tabs-header">
              <button
                className={`tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Sections ({improvements.length})
              </button>
              {['Summary', 'Experience', 'Projects', 'Skills', 'Achievements'].map(sec => (
                <button
                  key={sec}
                  className={`tab-btn ${activeFilter.toLowerCase() === sec.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setActiveFilter(sec.toLowerCase())}
                >
                  {sec}
                </button>
              ))}
            </div>

            {/* List of Diff Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filtered.map(improvement => (
                <SuggestionDiffCard key={improvement.id} improvement={improvement} />
              ))}

              {filtered.length === 0 && (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No improvement suggestions for this section filter.
                </div>
              )}
            </div>

            {/* Recruiter Formula Advice Note */}
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                borderLeft: '4px solid var(--brand-primary)',
                background: 'var(--bg-tertiary)'
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Recruiter Writing Formula: Google X-Y-Z
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Notice how the AI suggestions reformat passive verbs into results-driven statements:
                <em> "Accomplished [X], as measured by [Y], by doing [Z]"</em>. This structure boosts hiring manager engagement and maximizes ATS keyword density.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

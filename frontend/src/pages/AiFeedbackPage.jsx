import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { analysisService } from '../services/analysisService';
import Sidebar from '../components/common/Sidebar';
import FeedbackCard from '../components/analysis/FeedbackCard';
import SkeletonLoader from '../components/common/SkeletonLoader';

export default function AiFeedbackPage() {
  const { resumeId } = useParams();
  const { activeAnalysis, selectResume } = useResume();
  const [data, setData] = useState(activeAnalysis);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'strengths' | 'weaknesses' | 'suggestions'

  useEffect(() => {
    if (resumeId) {
      selectResume(resumeId);
      setLoading(true);
      analysisService.getResumeAnalysis(resumeId)
        .then(res => setData(res))
        .finally(() => setLoading(false));
    }
  }, [resumeId, selectResume]);

  const feedback = data?.feedback || { strengths: [], weaknesses: [], suggestions: [] };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-brand">
                    <Sparkles size={13} /> Deep AI Intelligence
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {data?.fileName}
                  </span>
                </div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>AI Feedback & Evaluation</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Categorized breakdown of existing strengths, identified gaps, and actionable recruiter recommendations.
                </p>
              </div>

              <Link to={`/analysis/${resumeId || 'res_001'}/improvements`} className="btn btn-primary btn-sm">
                View Text Diffs <ArrowRight size={15} />
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="tabs-header">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Feedback ({feedback.strengths.length + feedback.weaknesses.length + feedback.suggestions.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'strengths' ? 'active' : ''}`}
                onClick={() => setActiveTab('strengths')}
              >
                <CheckCircle2 size={16} color="var(--success)" /> Strengths ({feedback.strengths.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'weaknesses' ? 'active' : ''}`}
                onClick={() => setActiveTab('weaknesses')}
              >
                <AlertTriangle size={16} color="var(--danger)" /> Weaknesses ({feedback.weaknesses.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
                onClick={() => setActiveTab('suggestions')}
              >
                <Lightbulb size={16} color="var(--brand-cyan)" /> Suggestions ({feedback.suggestions.length})
              </button>
            </div>

            {/* Strengths Section */}
            {(activeTab === 'all' || activeTab === 'strengths') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Strengths & Key Assets</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                  {feedback.strengths.map(item => (
                    <FeedbackCard key={item.id} item={item} type="strength" />
                  ))}
                </div>
              </div>
            )}

            {/* Weaknesses Section */}
            {(activeTab === 'all' || activeTab === 'weaknesses') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Identified Weaknesses & Risks</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                  {feedback.weaknesses.map(item => (
                    <FeedbackCard key={item.id} item={item} type="weakness" />
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Suggestions Section */}
            {(activeTab === 'all' || activeTab === 'suggestions') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-cyan)' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Actionable Recruiter Recommendations</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                  {feedback.suggestions.map(item => (
                    <FeedbackCard key={item.id} item={item} type="suggestion" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

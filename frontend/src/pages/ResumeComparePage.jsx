import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  Layers
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { historyService } from '../services/historyService';
import Sidebar from '../components/common/Sidebar';
import CompareMetricRow from '../components/comparison/CompareMetricRow';
import { sampleImprovements, comparisonMetrics } from '../mock/mockHistoryData';
import SkeletonLoader from '../components/common/SkeletonLoader';

export default function ResumeComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { history } = useResume();

  const v1Param = searchParams.get('v1') || (history[1] ? history[1].id : 'res_002');
  const v2Param = searchParams.get('v2') || (history[0] ? history[0].id : 'res_001');

  const [res1Id, setRes1Id] = useState(v1Param);
  const [res2Id, setRes2Id] = useState(v2Param);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    historyService.compareResumes(res1Id, res2Id)
      .then(res => setComparisonData(res))
      .finally(() => setLoading(false));
  }, [res1Id, res2Id]);

  const handleV1Change = (id) => {
    setRes1Id(id);
    setSearchParams({ v1: id, v2: res2Id });
  };

  const handleV2Change = (id) => {
    setRes2Id(id);
    setSearchParams({ v1: res1Id, v2: id });
  };

  const r1 = comparisonData?.resume1 || history[1] || history[0];
  const r2 = comparisonData?.resume2 || history[0];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-brand" style={{ marginBottom: '0.25rem' }}>
                <GitCompare size={13} /> Version Delta
              </span>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Resume Comparison</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Compare two versions side-by-side to verify ATS score improvements and keyword additions.
              </p>
            </div>

            <Link to="/upload" className="btn btn-primary btn-sm">
              Upload Newer Version <ArrowRight size={15} />
            </Link>
          </div>

          {/* Selectors Card */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              alignItems: 'center'
            }}
          >
            {/* Version 1 Selector */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <label className="form-label" style={{ marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                Baseline Version (Resume V1)
              </label>
              <select
                className="form-select"
                value={res1Id}
                onChange={(e) => handleV1Change(e.target.value)}
              >
                {history.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.fileName} ({item.date} • {item.overallScore || 76}/100)
                  </option>
                ))}
              </select>
            </div>

            {/* Version 2 Selector */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <label className="form-label" style={{ marginBottom: '0.4rem', color: 'var(--brand-primary)' }}>
                Revised Version (Resume V2)
              </label>
              <select
                className="form-select"
                value={res2Id}
                onChange={(e) => handleV2Change(e.target.value)}
              >
                {history.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.fileName} ({item.date} • {item.overallScore || 88}/100)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={3} />
          ) : (
            <>
              {/* Matrix Table */}
              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-tertiary)',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid var(--border-default)'
                  }}
                >
                  <div>Evaluation Metric</div>
                  <div>Resume V1 (Baseline)</div>
                  <div>Resume V2 (Target)</div>
                  <div>Improvement Delta</div>
                </div>

                <CompareMetricRow
                  label="Overall Candidate Score"
                  score1={r1?.overallScore || 76}
                  score2={r2?.overallScore || 88}
                  unit="/100"
                />
                <CompareMetricRow
                  label="ATS Compatibility Score"
                  score1={r1?.atsScore || 72}
                  score2={r2?.atsScore || 91}
                  unit="%"
                />
                <CompareMetricRow
                  label="Job Match Fit"
                  score1={r1?.jobMatchScore || 70}
                  score2={r2?.jobMatchScore || 84}
                  unit="%"
                />
                <CompareMetricRow
                  label="Technical Skills Score"
                  score1={r1?.skillsScore || 80}
                  score2={r2?.skillsScore || 90}
                  unit="%"
                />
                <CompareMetricRow
                  label="Experience Impact Score"
                  score1={r1?.experienceScore || 75}
                  score2={r2?.experienceScore || 86}
                  unit="%"
                />
              </div>

              {/* Verified Improvements Between Versions */}
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <Award size={22} color="var(--brand-primary)" />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                      Improvements Identified Between Versions
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Key strategic modifications that drove score gains from V1 to V2.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {sampleImprovements.map((imp, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem 1.15rem',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid var(--success-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

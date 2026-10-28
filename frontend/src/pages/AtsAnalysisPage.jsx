import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck2,
  Cpu,
  Search,
  Check,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { atsService } from '../services/atsService';
import Sidebar from '../components/common/Sidebar';
import CircularProgress from '../components/common/CircularProgress';
import KeywordChip from '../components/common/KeywordChip';
import SkeletonLoader from '../components/common/SkeletonLoader';

export default function AtsAnalysisPage() {
  const { resumeId } = useParams();
  const { selectResume } = useResume();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keywordFilter, setKeywordFilter] = useState('');

  useEffect(() => {
    const id = resumeId || 'res_001';
    selectResume(id);
    setLoading(true);
    atsService.getAtsAnalysis(id)
      .then(res => setData(res))
      .finally(() => setLoading(false));
  }, [resumeId, selectResume]);

  const matched = (data?.matchedKeywords || []).filter(k =>
    k.name.toLowerCase().includes(keywordFilter.toLowerCase())
  );
  const missing = (data?.missingKeywords || []).filter(k =>
    k.name.toLowerCase().includes(keywordFilter.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {loading ? (
          <SkeletonLoader count={4} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-success">
                    <ShieldCheck size={13} /> ATS Engine Audit
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    File: {data?.fileName}
                  </span>
                </div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>ATS Compatibility & Keyword Scanner</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Simulated parser check for Greenhouse, Workday, Lever, and Taleo algorithms.
                </p>
              </div>

              <Link to={`/job-match/${resumeId || 'res_001'}`} className="btn btn-primary btn-sm">
                Inspect Job Description Match <ArrowRight size={15} />
              </Link>
            </div>

            {/* Score Summary Banner */}
            <div
              className="glass-panel"
              style={{
                padding: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
                alignItems: 'center'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <CircularProgress
                  score={data?.atsScore || 89}
                  max={100}
                  size={145}
                  label="ATS Score"
                  subtitle={data?.atsStatus || 'Passed Screening'}
                  color="#10b981"
                />
              </div>

              {/* Keyword Statistics Counter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Keyword Match Rate
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
                    {data?.matchPercentage || 86}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {data?.matchedKeywordsCount || 36} of {data?.totalKeywordsDetected || 42} required terms found
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Missing High-Priority Terms
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)' }}>
                    {data?.missingKeywordsCount || 6}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Adding these will raise ATS score into top 5%
                  </div>
                </div>
              </div>

              {/* Summary Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Standard 1-Column Format Verified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Text Layer Extractable (No Flattened Images)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Standard Section Headings Detected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Contact Information Parsed Successfully</span>
                </div>
              </div>
            </div>

            {/* Keyword Search & Chips Section */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Keyword Analysis</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Keywords extracted and cross-referenced with your technical domain.
                  </p>
                </div>

                <div style={{ position: 'relative', width: '260px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search keywords..."
                    style={{ paddingLeft: '2rem', paddingBottom: '0.45rem', paddingTop: '0.45rem', fontSize: '0.85rem' }}
                    value={keywordFilter}
                    onChange={(e) => setKeywordFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Matched Keywords Grid */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-success">Matched Keywords ({matched.length})</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Identified in your resume</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {matched.map(kw => (
                    <KeywordChip
                      key={kw.name}
                      name={kw.name}
                      type="matched"
                      count={kw.count}
                    />
                  ))}
                  {matched.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No matching keywords found for filter.</span>
                  )}
                </div>
              </div>

              {/* Missing Keywords Grid */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-danger">Missing Keywords ({missing.length})</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recommended to add</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {missing.map(kw => (
                    <KeywordChip
                      key={kw.name}
                      name={kw.name}
                      type="missing"
                      tip={kw.tip}
                    />
                  ))}
                  {missing.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No missing keywords matching filter.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Formatting & Parsing Audit */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Formatting Issues */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCheck2 size={18} color="var(--brand-primary)" />
                  Formatting Compatibility Audit
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data?.formattingAudit?.map((rule, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{rule.rule}</span>
                        {rule.status === 'passed' ? (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Passed</span>
                        ) : rule.status === 'warning' ? (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Notice</span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Failed</span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                        {rule.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Detection & Risks */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="var(--brand-cyan)" />
                  Section Detection Confidence
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {data?.sectionDetection?.map((sec, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.6rem 0.75rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.825rem'
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>{sec.section}</span>
                      <span style={{ fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                        {sec.confidence}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Potential ATS Problems */}
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={15} /> Potential ATS Risks & Fixes
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data?.potentialAtsRisks?.map((risk, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'var(--warning-light)',
                        border: '1px solid var(--warning-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.825rem'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: '0.2rem' }}>
                        {risk.risk} ({risk.severity} Severity)
                      </div>
                      <div style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {risk.solution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

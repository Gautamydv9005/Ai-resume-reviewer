import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { jobMatchService } from '../services/jobMatchService';
import Sidebar from '../components/common/Sidebar';
import CircularProgress from '../components/common/CircularProgress';
import SkeletonLoader from '../components/common/SkeletonLoader';

export default function JobMatchPage() {
  const { resumeId } = useParams();
  const { selectResume } = useResume();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = resumeId || 'res_001';
    selectResume(id);
    setLoading(true);
    jobMatchService.getJobMatchAnalysis(id)
      .then(res => setData(res))
      .finally(() => setLoading(false));
  }, [resumeId, selectResume]);

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
                  <span className="badge badge-brand">
                    <Briefcase size={13} /> Job Match Engine
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Target Role Alignment
                  </span>
                </div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                  Job Match & Skills Alignment
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Role: <strong style={{ color: 'var(--brand-primary)' }}>{data?.jobTitle || 'General Application'}</strong>
                  {data?.company && data.company !== 'Target Employer' && (
                    <> at <strong style={{ color: 'var(--text-primary)' }}>{data.company}</strong></>
                  )}
                  {data?.experienceLevel && (
                    <> • <span className="badge badge-secondary" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>{data.experienceLevel}</span></>
                  )}
                </p>
              </div>

              <Link to={`/analysis/${resumeId || 'res_001'}/improvements`} className="btn btn-primary btn-sm">
                Apply Matching Tweaks <ArrowRight size={15} />
              </Link>
            </div>

            {/* Resume Only Mode Notice */}
            {data?.hasJobMatch === false && (
              <div
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Briefcase size={22} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Resume Only Mode Active</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      This resume was analyzed without a target Job Description. Targeted role alignment and ATS keyword parity require entering job details.
                    </p>
                  </div>
                </div>
                <Link to="/upload" className="btn btn-primary btn-sm">
                  <Sparkles size={14} /> Analyze With Job Description
                </Link>
              </div>
            )}

            {/* Top Score Matrix Banner */}
            <div
              className="glass-panel"
              style={{
                padding: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2rem',
                alignItems: 'center'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <CircularProgress
                  score={data?.jobMatchScore ?? null}
                  max={100}
                  size={150}
                  label="Job Match Score"
                  subtitle={data?.matchVerdict || (data?.hasJobMatch === false ? 'Resume Only' : 'High Screen Probability')}
                  color="#06b6d4"
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-default)'
                  }}
                >
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Recruiter Match Summary
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {data?.summary}
                  </p>
                </div>

                {/* Role Fit Breakdown Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data?.roleFitBreakdown?.map((fit, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fit.area}</span>
                        <span style={{ fontWeight: 700, color: fit.score >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                          {fit.score}% ({fit.status})
                        </span>
                      </div>
                      <div style={{ height: '5px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${fit.score}%`,
                            background: fit.score >= 80 ? 'var(--success)' : 'var(--warning)',
                            borderRadius: 'var(--radius-full)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills Comparison: Matching vs Missing */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Matching Skills */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <CheckCircle2 size={20} color="var(--success)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    Matching Skills ({data?.matchingSkills?.length})
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {data?.matchingSkills?.map((skill, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid var(--success-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {skill.name}
                        </span>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills to Improve */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <AlertCircle size={20} color="var(--warning)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    Skills to Improve / Add ({data?.skillsToImprove?.length})
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {data?.skillsToImprove?.map((skill, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--warning-light)',
                        border: '1px solid var(--warning-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--warning)', fontWeight: 700 }}>○</span>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {skill.name}
                          </span>
                        </div>
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                          {skill.priority} Priority
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem' }}>
                        {skill.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Relevant Experience Alignment & Recommended Skills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Experience Alignment */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Relevant Experience Alignment
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data?.relevantExperienceAnalysis?.map((exp, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{exp.aspect}</span>
                        {exp.match ? (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Verified</span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Gap Detected</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Required: {exp.required}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                        Found in resume: {exp.found}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Skills to Learn */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={18} color="var(--brand-cyan)" />
                  High-ROI Skills to Learn
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Adding certifications or mini-projects for these technologies will provide maximum match lift:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {data?.recommendedSkillsToLearn?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Estimated study time: {item.duration}
                        </div>
                      </div>
                      <span className="badge badge-info" style={{ fontWeight: 700 }}>
                        {item.impact}
                      </span>
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

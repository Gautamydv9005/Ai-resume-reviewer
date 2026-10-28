import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Sparkles,
  Edit2,
  Save,
  Briefcase,
  MapPin,
  Mail,
  Calendar,
  Lock,
  Sliders,
  CheckCircle2,
  FileCheck,
  FileText,
  Target,
  Award,
  Trash2,
  Plus,
  X,
  ExternalLink,
  UploadCloud,
  Check,
  DollarSign,
  Layers,
  Globe,
  Building,
  ArrowRight,
  TrendingUp,
  Clock,
  Eye,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import Sidebar from '../components/common/Sidebar';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { resumeList, history, currentResumeId, selectResume, deleteHistoryItem, activeAts, activeJobMatch } = useResume();
  const { addToast } = useToast();

  // Loading States
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Form State for Personal Details
  const [formData, setFormData] = useState({
    name: user?.name || 'Alex Morgan',
    email: user?.email || 'alex.morgan@techcareer.io',
    role: user?.role || 'Senior Full Stack Engineer',
    targetRole: user?.targetRole || 'Lead Frontend Engineer / Full Stack Architect',
    location: user?.location || 'San Francisco, CA (Open to Remote)',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: user?.bio || 'Experienced full-stack engineer passionate about distributed cloud architectures, high-performance React frontends, and AI developer tooling.'
  });

  // Candidate Career Preferences
  const [preferences, setPreferences] = useState({
    industry: user?.preferences?.industry || 'Software Engineering / SaaS',
    workMode: user?.preferences?.workMode || 'Remote & Hybrid',
    seniority: user?.preferences?.seniority || 'Senior / Staff',
    salaryRange: user?.preferences?.salaryRange || '$160,000 - $210,000 / yr',
    atsSensitivity: user?.preferences?.atsSensitivity || 'Strict Enterprise ATS Format',
    privacyMode: user?.preferences?.privacyMode ?? true
  });

  // Skills Tags State
  const defaultSkills = [
    'React 19',
    'TypeScript',
    'Node.js',
    'Python',
    'AWS Cloud',
    'Docker',
    'System Design',
    'GraphQL',
    'PostgreSQL',
    'Tailwind CSS'
  ];
  const [skills, setSkills] = useState(user?.skills || defaultSkills);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Career Goals State
  const [careerGoals, setCareerGoals] = useState({
    milestone: user?.careerGoals?.milestone || 'Transition to Staff Software Engineer or Principal Architect at a tier-1 technology organization within 6 months.',
    targetCompanies: user?.careerGoals?.targetCompanies || 'AI Labs, Series B+ FinTech startups, Enterprise Cloud Platforms',
    focusArea: user?.careerGoals?.focusArea || 'Scaling AI-powered resume review workflows and optimizing low-latency distributed APIs.'
  });

  // Sync state if user updates
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: user.role || prev.role,
        targetRole: user.targetRole || prev.targetRole,
        location: user.location || prev.location,
        avatar: user.avatar || prev.avatar,
        bio: user.bio || prev.bio
      }));
      if (user.preferences) setPreferences(user.preferences);
      if (user.skills) setSkills(user.skills);
      if (user.careerGoals) setCareerGoals(user.careerGoals);
    }
  }, [user]);

  // Dynamic Calculations (Never hardcode fake scores!)
  const totalResumes = useMemo(() => {
    if (history && history.length > 0) return history.length;
    if (resumeList && resumeList.length > 0) return resumeList.length;
    return user?.resumesAnalyzed || 0;
  }, [history, resumeList, user]);

  const latestAtsScore = useMemo(() => {
    if (history && history.length > 0 && history[0].atsScore) {
      return history[0].atsScore;
    }
    if (activeAts && activeAts.overallScore) {
      return activeAts.overallScore;
    }
    return user?.averageAtsScore || 0;
  }, [history, activeAts, user]);

  const latestJobMatchScore = useMemo(() => {
    if (history && history.length > 0 && history[0].jobMatchScore) {
      return history[0].jobMatchScore;
    }
    if (activeJobMatch && activeJobMatch.overallMatch) {
      return activeJobMatch.overallMatch;
    }
    return user?.averageJobMatch || 0;
  }, [history, activeJobMatch, user]);

  // Dynamic Profile Strength Score (%)
  const profileCompletion = useMemo(() => {
    let score = 0;
    if (formData.name && formData.name.trim().length > 0) score += 15;
    if (formData.email && formData.email.trim().length > 0) score += 15;
    if (formData.role && formData.role.trim().length > 0) score += 15;
    if (formData.targetRole && formData.targetRole.trim().length > 0) score += 15;
    if (formData.location && formData.location.trim().length > 0) score += 10;
    if (formData.bio && formData.bio.trim().length > 10) score += 10;
    if (skills && skills.length >= 3) score += 10;
    if (careerGoals.milestone && careerGoals.milestone.trim().length > 5) score += 10;
    return Math.min(100, score);
  }, [formData, skills, careerGoals]);

  // Handle Save Profile Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast({ message: 'Name cannot be empty.', type: 'error' });
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      addToast({ message: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setSavingProfile(true);
    try {
      const updates = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role.trim(),
        targetRole: formData.targetRole.trim(),
        location: formData.location.trim(),
        avatar: formData.avatar.trim(),
        bio: formData.bio.trim()
      };

      await userService.updateUserProfile(updates);
      setUser(prev => ({ ...prev, ...updates }));
      setIsEditingProfile(false);
      addToast({
        message: 'Personal details and target role updated successfully!',
        type: 'success'
      });
    } catch (err) {
      addToast({
        message: err.message || 'Failed to update profile details.',
        type: 'error'
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Save Preferences
  const handleSavePreferences = async (updatedPrefs) => {
    const newPrefs = updatedPrefs || preferences;
    setSavingPreferences(true);
    try {
      await userService.updateUserProfile({ preferences: newPrefs });
      setUser(prev => ({ ...prev, preferences: newPrefs }));
      addToast({
        message: 'Career preferences saved successfully!',
        type: 'success'
      });
    } catch (err) {
      addToast({
        message: err.message || 'Failed to update preferences.',
        type: 'error'
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  // Handle Skills Tags
  const handleAddSkill = (e) => {
    e?.preventDefault();
    const cleanSkill = newSkillInput.trim();
    if (!cleanSkill) return;

    if (skills.some(s => s.toLowerCase() === cleanSkill.toLowerCase())) {
      addToast({ message: `"${cleanSkill}" is already in your skills list.`, type: 'info' });
      setNewSkillInput('');
      return;
    }

    const updated = [...skills, cleanSkill];
    setSkills(updated);
    setNewSkillInput('');
    persistSkills(updated);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
    persistSkills(updated);
  };

  const persistSkills = async (updatedSkills) => {
    setSavingSkills(true);
    try {
      await userService.updateUserProfile({ skills: updatedSkills });
      setUser(prev => ({ ...prev, skills: updatedSkills }));
      addToast({ message: 'Skills tags updated!', type: 'success' });
    } catch (err) {
      addToast({ message: 'Failed to update skills.', type: 'error' });
    } finally {
      setSavingSkills(false);
    }
  };

  // Handle Save Goals
  const handleSaveGoals = async (e) => {
    e.preventDefault();
    setSavingGoals(true);
    try {
      await userService.updateUserProfile({ careerGoals });
      setUser(prev => ({ ...prev, careerGoals }));
      addToast({
        message: 'Career goals and milestones saved successfully!',
        type: 'success'
      });
    } catch (err) {
      addToast({
        message: err.message || 'Failed to update career goals.',
        type: 'error'
      });
    } finally {
      setSavingGoals(false);
    }
  };

  // Handle Delete Resume Record
  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    try {
      if (deleteHistoryItem) {
        await deleteHistoryItem(id);
      }
      addToast({ message: 'Resume record removed from vault.', type: 'info' });
    } catch (err) {
      addToast({ message: 'Could not delete resume record.', type: 'error' });
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1240px', margin: '0 auto' }}>
          
          {/* Top Page Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-brand">
                  <User size={13} /> Candidate Profile Suite
                </span>
                <span className="badge badge-info">
                  {user?.plan || 'Pro Candidate Plan'}
                </span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Profile & Career Preferences
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Manage candidate positioning, target role criteria, ATS keyword weighting, and resume versions.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsEditingProfile(prev => !prev)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}
              >
                <Edit2 size={15} />
                <span>{isEditingProfile ? 'Close Editor' : 'Edit Profile'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}
              >
                <UploadCloud size={15} />
                <span>Upload New Resume</span>
              </button>
            </div>
          </div>

          {/* 4 Career Overview Metric KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {/* KPI 1: Resumes Analyzed */}
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.15rem',
                transition: 'transform var(--transition-fast)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                  flexShrink: 0
                }}
              >
                <FileText size={26} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Resumes Analyzed
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {totalResumes}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Vault storage active
                </div>
              </div>
            </div>

            {/* KPI 2: Latest ATS Score */}
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.15rem'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Latest ATS Score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: latestAtsScore >= 80 ? '#10b981' : 'var(--text-primary)', lineHeight: 1.2 }}>
                    {latestAtsScore}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
                  {latestAtsScore >= 80 ? 'Enterprise ATS Ready' : 'Needs Optimization'}
                </div>
              </div>
            </div>

            {/* KPI 3: Job Match Alignment */}
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.15rem'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(6, 182, 212, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4',
                  flexShrink: 0
                }}
              >
                <Target size={26} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Target Job Match
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#06b6d4', lineHeight: 1.2 }}>
                    {latestJobMatchScore}%
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Semantic role similarity
                </div>
              </div>
            </div>

            {/* KPI 4: Profile Strength */}
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.15rem'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b',
                  flexShrink: 0
                }}
              >
                <Award size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Profile Strength
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>
                    {profileCompletion}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-tertiary)',
                    marginTop: '0.5rem',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${profileCompletion}%`,
                      height: '100%',
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {profileCompletion === 100 ? 'All parameters complete' : 'Add skills & goals to reach 100%'}
                </div>
              </div>
            </div>
          </div>

          {/* Main Profile Details Card */}
          <div
            className="glass-panel"
            style={{
              padding: '2.25rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top decorative gradient bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'var(--brand-gradient)'
              }}
            />

            {/* Profile Card Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginBottom: '1.75rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid var(--border-default)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Avatar with indicator */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={formData.avatar}
                    alt={formData.name}
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--brand-primary)',
                      boxShadow: '0 6px 18px rgba(99, 102, 241, 0.3)'
                    }}
                  />
                  <div
                    title="Active Account"
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '2px solid var(--bg-secondary)',
                      boxShadow: '0 0 8px #10b981'
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formData.name}
                    </h2>
                    <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={12} /> Verified Candidate
                    </span>
                  </div>

                  <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {formData.role}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.6rem', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={14} color="var(--brand-primary)" />
                      <span>{formData.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="#06b6d4" />
                      <span>{formData.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="#8b5cf6" />
                      <span>Joined {user?.joinedDate || 'January 2026'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Toggle */}
              <button
                type="button"
                onClick={() => setIsEditingProfile(prev => !prev)}
                className={isEditingProfile ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
              >
                <Edit2 size={14} />
                <span>{isEditingProfile ? 'Cancel Editing' : 'Edit Profile Details'}</span>
              </button>
            </div>

            {/* Profile View / Edit Form */}
            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex.morgan@techcareer.io"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Current Headline / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Senior Full Stack Engineer"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Target Career Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                      placeholder="e.g. Lead Frontend Engineer / Full Stack Architect"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Location & Relocation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA (Open to Remote)"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Avatar Image URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Candidate Executive Summary / Bio</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Briefly describe your high-level domain background, technical strengths, and leadership experience..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: '150px', justifyContent: 'center' }}
                  >
                    {savingProfile ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Target Role & Bio Callout */}
                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '1.25rem 1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Primary Career Target:
                    </span>
                    <span
                      style={{
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: 'var(--brand-primary)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: '1px solid rgba(99, 102, 241, 0.3)'
                      }}
                    >
                      {formData.targetRole}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    {formData.bio}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Career Preference Settings */}
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(99, 102, 241, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-primary)'
                  }}
                >
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Target Job & ATS Review Criteria</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Interactive controls configure how the AI algorithms score keywords and alignment.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={savingPreferences}
                onClick={() => handleSavePreferences()}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                {savingPreferences ? (
                  <>
                    <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Criteria</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              
              {/* Setting 1: Industry Focus */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <Building size={16} color="var(--brand-primary)" />
                  <strong style={{ fontSize: '0.9rem' }}>Target Industry Domain</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  Weights industry terminology and technical keyword density.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {[
                    'Software Engineering / SaaS',
                    'AI & Machine Learning',
                    'Cloud, DevOps & Infra',
                    'FinTech & High Frequency',
                    'Product Management'
                  ].map(ind => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => {
                        const updated = { ...preferences, industry: ind };
                        setPreferences(updated);
                        handleSavePreferences(updated);
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.76rem',
                        fontWeight: preferences.industry === ind ? 700 : 500,
                        border: preferences.industry === ind ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        background: preferences.industry === ind ? 'var(--brand-primary)' : 'var(--bg-glass-card)',
                        color: preferences.industry === ind ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting 2: Workplace Setting */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <Globe size={16} color="#06b6d4" />
                  <strong style={{ fontSize: '0.9rem' }}>Workplace Setting</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  Preferred environment matched against job postings.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {[
                    'Remote Only',
                    'Remote & Hybrid',
                    'Hybrid (2-3 days)',
                    'On-site (Tier 1 Hub)',
                    'Open to Relocation'
                  ].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        const updated = { ...preferences, workMode: mode };
                        setPreferences(updated);
                        handleSavePreferences(updated);
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.76rem',
                        fontWeight: preferences.workMode === mode ? 700 : 500,
                        border: preferences.workMode === mode ? '1px solid #06b6d4' : '1px solid var(--border-default)',
                        background: preferences.workMode === mode ? '#06b6d4' : 'var(--bg-glass-card)',
                        color: preferences.workMode === mode ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting 3: Target Seniority */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <Award size={16} color="#8b5cf6" />
                  <strong style={{ fontSize: '0.9rem' }}>Seniority Level</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  Directs depth of Google X-Y-Z bullet rewrites.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {[
                    'Mid-Level (3-5 yrs)',
                    'Senior / Staff (6-9 yrs)',
                    'Principal Engineer',
                    'Engineering Manager / Lead'
                  ].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        const updated = { ...preferences, seniority: lvl };
                        setPreferences(updated);
                        handleSavePreferences(updated);
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.76rem',
                        fontWeight: preferences.seniority === lvl ? 700 : 500,
                        border: preferences.seniority === lvl ? '1px solid #8b5cf6' : '1px solid var(--border-default)',
                        background: preferences.seniority === lvl ? '#8b5cf6' : 'var(--bg-glass-card)',
                        color: preferences.seniority === lvl ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting 4: ATS Sensitivity & Privacy */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={16} color="#10b981" />
                  <strong style={{ fontSize: '0.9rem' }}>ATS Parser Engine & Privacy</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  Enterprise parser rigor and volatile data protection.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <select
                    className="form-input"
                    style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem' }}
                    value={preferences.atsSensitivity}
                    onChange={(e) => {
                      const updated = { ...preferences, atsSensitivity: e.target.value };
                      setPreferences(updated);
                      handleSavePreferences(updated);
                    }}
                  >
                    <option value="Strict Enterprise ATS Format">Strict Enterprise ATS Format (Greenhouse/Workday standard)</option>
                    <option value="Balanced Modern Scanning">Balanced Modern Scanning (Keywords + semantic weighting)</option>
                    <option value="Creative Multi-Column Format">Creative Multi-Column Format (Tolerant parsing)</option>
                  </select>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Strict Privacy Isolation Active
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      No model training
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Editable Skills Tags Section */}
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(6, 182, 212, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#06b6d4'
                  }}
                >
                  <Layers size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Core Technical Competencies & Skills</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    These tags are verified against ATS job descriptions to compute keyword match rates.
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {skills.length} skills indexed
              </div>
            </div>

            {/* Add Skill Input Form */}
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', maxWidth: '480px' }}>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.85rem' }}
                placeholder="Add a new skill (e.g. Kubernetes, Next.js, Redis)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={!newSkillInput.trim() || savingSkills}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
              >
                <Plus size={15} />
                <span>Add Tag</span>
              </button>
            </form>

            {/* Skills Pills List */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {skills.map((skill) => (
                <div
                  key={skill}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    title={`Remove ${skill}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                      borderRadius: '50%',
                      transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* In-Demand Suggestions */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Quick Add In-Demand Keywords:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['Kubernetes', 'CI/CD Pipelines', 'Microservices', 'Redis', 'Next.js 15', 'Terraform', 'Unit Testing'].map(sug => {
                  const alreadyAdded = skills.some(s => s.toLowerCase() === sug.toLowerCase());
                  if (alreadyAdded) return null;
                  return (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        const updated = [...skills, sug];
                        setSkills(updated);
                        persistSkills(updated);
                      }}
                      className="btn-ghost"
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        border: '1px dashed var(--border-default)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Plus size={12} /> {sug}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Career Goals & Milestone Section */}
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b'
                }}
              >
                <Target size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Career Goals & Next Milestone</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Define your intended transition timeline and high-value target organizations.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveGoals} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Next Career Milestone (6-12 Months)</label>
                <input
                  type="text"
                  className="form-input"
                  value={careerGoals.milestone}
                  onChange={(e) => setCareerGoals({ ...careerGoals, milestone: e.target.value })}
                  placeholder="e.g. Transition to Staff Engineer at Tier-1 tech firm..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Target Organizations / Sectors</label>
                  <input
                    type="text"
                    className="form-input"
                    value={careerGoals.targetCompanies}
                    onChange={(e) => setCareerGoals({ ...careerGoals, targetCompanies: e.target.value })}
                    placeholder="e.g. AI Research Labs, Series B+ Startups, Cloud Platforms"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Resume Key Focus Areas</label>
                  <input
                    type="text"
                    className="form-input"
                    value={careerGoals.focusArea}
                    onChange={(e) => setCareerGoals({ ...careerGoals, focusArea: e.target.value })}
                    placeholder="e.g. Highlighting system scalability, team mentoring, revenue impact"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={savingGoals}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: '160px', justifyContent: 'center' }}
                >
                  {savingGoals ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      <span>Saving Goals...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Career Goals</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Resume Management Section (Vault) */}
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981'
                  }}
                >
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Resume Management & Version Vault</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Inspect uploaded resumes, check ATS ratings, or switch your active resume.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <Plus size={14} />
                <span>Upload New Version</span>
              </button>
            </div>

            {/* Resumes List */}
            {history && history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {history.map((item) => {
                  const isActive = item.id === currentResumeId;
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '1.25rem 1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        background: isActive ? 'rgba(99, 102, 241, 0.07)' : 'var(--bg-tertiary)',
                        border: isActive ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-md)',
                            background: isActive ? 'var(--brand-primary)' : 'var(--bg-glass-card)',
                            color: isActive ? '#ffffff' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FileText size={20} />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                              {item.fileName || 'Resume Document'}
                            </span>
                            {isActive && (
                              <span className="badge badge-brand" style={{ fontSize: '0.68rem' }}>
                                Active in Reviewer
                              </span>
                            )}
                            <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>
                              {item.fileType || 'PDF'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <span>Target: {item.targetRole || formData.targetRole}</span>
                            <span>Uploaded {item.uploadDate || 'Recent'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Badges & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {/* ATS Score Chip */}
                        <div
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-glass-card)',
                            border: '1px solid var(--border-default)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem'
                          }}
                        >
                          <ShieldCheck size={14} color="#10b981" />
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{item.atsScore || 85}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>ATS</span>
                        </div>

                        {/* Job Match Chip */}
                        <div
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-glass-card)',
                            border: '1px solid var(--border-default)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem'
                          }}
                        >
                          <Target size={14} color="#06b6d4" />
                          <span style={{ fontWeight: 700, color: '#06b6d4' }}>{item.jobMatchScore || 80}%</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Match</span>
                        </div>

                        {/* Actions */}
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              selectResume(item.id);
                              addToast({ message: `"${item.fileName}" set as active resume!`, type: 'success' });
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.78rem' }}
                          >
                            Set Active
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => navigate(`/analysis/${item.id}`)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteResume(item.id, e)}
                          title="Delete from vault"
                          className="btn-ghost"
                          style={{
                            padding: '0.45rem',
                            color: 'var(--text-muted)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <UploadCloud size={44} color="var(--brand-primary)" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Resumes in Vault Yet</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                  Upload your first PDF or DOCX resume to start receiving instant ATS scores and Google X-Y-Z recommendations.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/upload')}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <UploadCloud size={16} />
                  <span>Upload Resume Now</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

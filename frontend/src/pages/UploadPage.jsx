import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  Briefcase,
  AlertCircle,
  ArrowRight,
  FileCheck,
  Plus,
  Lock,
  ChevronDown
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const EXPERIENCE_LEVELS = [
  'Internship',
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead'
];

export default function UploadPage() {
  const navigate = useNavigate();
  const { uploadAndAnalyze, uploadStatus, resetUploadState } = useResume();
  const { addToast } = useToast();
  const { isGuest, guestSession, updateGuestSession } = useAuth();

  const guestLimitReached = isGuest && (guestSession?.reviewsUsed >= 1 || guestSession?.canReview === false);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [includeJobDescription, setIncludeJobDescription] = useState(true);

  // Manual Job Description fields (initialized empty — no auto-population)
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobText, setJobText] = useState('');
  const [skillTags, setSkillTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Validation errors
  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const fileInputRef = useRef(null);

  // Clear specific field errors when user edits
  const handleJobTitleChange = (val) => {
    setJobTitle(val);
    if (fieldErrors.jobTitle) {
      setFieldErrors(prev => ({ ...prev, jobTitle: '' }));
    }
  };

  const handleCompanyChange = (val) => {
    setCompany(val);
    if (fieldErrors.company) {
      setFieldErrors(prev => ({ ...prev, company: '' }));
    }
  };

  const handleExperienceLevelChange = (val) => {
    setExperienceLevel(val);
    if (fieldErrors.experienceLevel) {
      setFieldErrors(prev => ({ ...prev, experienceLevel: '' }));
    }
  };

  const handleJobTextChange = (val) => {
    setJobText(val);
    if (fieldErrors.jobText) {
      setFieldErrors(prev => ({ ...prev, jobText: '' }));
    }
  };

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setValidationError('');
    setFieldErrors(prev => ({ ...prev, file: '' }));
    if (!selectedFile) return;

    // Check extension
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const isPdfOrDoc =
      validTypes.includes(selectedFile.type) ||
      selectedFile.name.endsWith('.pdf') ||
      selectedFile.name.endsWith('.docx') ||
      selectedFile.name.endsWith('.doc');

    if (!isPdfOrDoc) {
      setValidationError('Unsupported format. Please upload a PDF or DOCX file.');
      addToast({
        message: 'Invalid file type. Please upload a PDF or DOCX file.',
        type: 'error'
      });
      return;
    }

    // Check size limit: 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setValidationError('File size exceeds 10MB limit.');
      addToast({
        message: 'File size too large (max 10MB).',
        type: 'error'
      });
      return;
    }

    setFile(selectedFile);
    addToast({
      message: `Selected "${selectedFile.name}" successfully!`,
      type: 'info',
      duration: 2000
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setValidationError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Pre-load sample file for quick demonstration (does NOT populate job fields)
  const handleUseSampleResume = () => {
    const mockSampleFile = new File(['%PDF-1.4 Mock Senior Full Stack Engineer Resume'], 'Alex_Morgan_Senior_Engineer_2026.pdf', {
      type: 'application/pdf'
    });
    validateAndSetFile(mockSampleFile);
  };

  // Add skill tag
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const exists = skillTags.some(tag => tag.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setSkillTags([...skillTags, trimmed]);
      setNewTagInput('');
    } else {
      addToast({
        message: `Skill "${trimmed}" is already added.`,
        type: 'info',
        duration: 2000
      });
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSkillTags(skillTags.filter(t => t !== tagToRemove));
  };

  // Submit Upload & Analysis
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (guestLimitReached) {
      addToast({
        message: 'Your free resume review is complete! Create an account or log in to analyze another resume.',
        type: 'warning'
      });
      return;
    }

    setValidationError('');
    const errors = {};

    if (!file) {
      errors.file = 'Please select or drag a resume file before analyzing.';
    }

    if (includeJobDescription) {
      const trimmedTitle = jobTitle.trim();
      const trimmedLevel = experienceLevel.trim();
      const trimmedText = jobText.trim();

      if (!trimmedTitle) {
        errors.jobTitle = 'Target Job Title is required.';
      }
      if (!trimmedLevel) {
        errors.experienceLevel = 'Please select an Experience Level.';
      } else if (!EXPERIENCE_LEVELS.includes(trimmedLevel)) {
        errors.experienceLevel = 'Please select a valid experience level from the options.';
      }
      if (!trimmedText) {
        errors.jobText = 'Job Description text is required for job-match analysis.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.file && Object.keys(errors).length === 1) {
        setValidationError(errors.file);
      } else {
        setValidationError('Please complete all required fields marked below before submitting.');
      }
      addToast({
        message: 'Please complete all required fields.',
        type: 'error'
      });
      return;
    }

    setFieldErrors({});
    setValidationError('');

    try {
      const jobData = includeJobDescription
        ? {
            title: jobTitle.trim(),
            company: company.trim() || undefined,
            experienceLevel: experienceLevel.trim(),
            text: jobText.trim(),
            requiredSkills: skillTags.map(s => s.trim()).filter(Boolean)
          }
        : null;

      const created = await uploadAndAnalyze(file, jobData);

      if (isGuest) {
        updateGuestSession({
          reviewsUsed: 1,
          canReview: false,
          completedResumeId: created.id
        });
      }

      addToast({
        message: 'Resume analyzed successfully!',
        type: 'success',
        duration: 3500
      });

      // Navigate to analysis results
      navigate(`/analysis/${created.id}`);
    } catch (err) {
      // NOTE: Form field values are strictly preserved on error
      if (err.limitReached) {
        if (isGuest) {
          updateGuestSession({
            reviewsUsed: 1,
            canReview: false,
            completedResumeId: err.completedResumeId || guestSession?.completedResumeId
          });
        }
        addToast({
          message: 'Your free resume review is complete! Create an account or log in to analyze another resume.',
          type: 'error'
        });
      } else {
        setValidationError(err.message || 'Unable to analyze resume. Please try again.');
        addToast({
          message: err.message || 'Unable to analyze resume. Please try again.',
          type: 'error'
        });
      }
    }
  };

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge badge-brand" style={{ marginBottom: '0.65rem' }}>
          {isGuest ? 'Guest Free Trial' : 'AI Document Ingestion'}
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Upload Your Resume</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>
          {isGuest
            ? 'You have 1 free resume review without creating an account. Get full ATS scoring & AI feedback.'
            : 'Upload your resume for comprehensive ATS parsing, keyword optimization, and custom job matching.'}
        </p>
      </div>

      {/* Guest Limit Complete Message Card */}
      {guestLimitReached && (
        <div
          className="glass-panel"
          style={{
            padding: '2.25rem 2rem',
            marginBottom: '2rem',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <Lock size={28} />
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.65rem' }}>
            Your Free Resume Review is Complete!
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              maxWidth: '560px',
              margin: '0 auto 1.75rem auto',
              lineHeight: 1.6
            }}
          >
            Your free resume review is complete! Create an account or log in to analyze another resume.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <Sparkles size={18} /> Create Free Account
            </Link>
            <Link to="/login?mode=signin" className="btn btn-secondary btn-lg">
              Log In to Existing Account
            </Link>
            {guestSession?.completedResumeId && (
              <Link
                to={`/analysis/${guestSession.completedResumeId}`}
                className="btn btn-outline btn-lg"
                style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}
              >
                <FileText size={18} /> View Your Completed Review
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Upload Box */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {/* Upload Status / Progress Bar */}
        {uploadStatus.isUploading ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
            <div
              className="animate-spin-slow"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '3px solid var(--border-default)',
                borderTopColor: 'var(--brand-primary)',
                margin: '0 auto 1.5rem auto'
              }}
            />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {uploadStatus.stage || 'AI is analyzing your resume...'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Processing resume text through AI evaluation and ATS scoring engines...
            </p>

            {/* Visual Progress Bar */}
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                height: '10px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-full)',
                margin: '0 auto',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${uploadStatus.progress}%`,
                  height: '100%',
                  background: 'var(--brand-gradient)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {uploadStatus.progress}% Completed
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Drag & Drop Target Area */}
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${
                    fieldErrors.file
                      ? 'var(--danger)'
                      : dragActive
                      ? 'var(--brand-primary)'
                      : 'var(--border-strong)'
                  }`,
                  background: fieldErrors.file
                    ? 'rgba(239, 68, 68, 0.05)'
                    : dragActive
                    ? 'var(--brand-primary-light)'
                    : 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  marginBottom: '1.5rem'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: fieldErrors.file ? 'rgba(239, 68, 68, 0.15)' : 'var(--brand-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: fieldErrors.file ? 'var(--danger)' : 'var(--brand-primary)',
                    margin: '0 auto 1.25rem auto'
                  }}
                >
                  <UploadCloud size={30} />
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Drag & drop your resume file here
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Supports <strong style={{ color: 'var(--text-primary)' }}>PDF</strong> and{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>DOCX</strong> (Max 10MB)
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <FileText size={15} />
                    Browse Local Files
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    data-testid="use-sample-resume-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseSampleResume();
                    }}
                  >
                    <Sparkles size={15} color="var(--brand-primary)" />
                    Use Sample Resume
                  </button>
                </div>
              </div>
            ) : (
              /* Selected File Preview Box */
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--brand-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--brand-primary)'
                    }}
                  >
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Size: {(file.size / 1024).toFixed(1)} KB • Ready for screening
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="btn-ghost"
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--danger)',
                    cursor: 'pointer'
                  }}
                  title="Remove selected file"
                  aria-label="Remove selected file"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* General Validation Error Alert */}
            {validationError && (
              <div
                style={{
                  background: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--danger)',
                  fontSize: '0.88rem',
                  marginBottom: '1.5rem'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Target Job Description Section */}
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1.75rem', marginTop: '1.5rem' }}>
              {/* Mode Selector Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Briefcase size={20} color="var(--brand-primary)" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                      Target Job Details
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                    Enter the job details you are targeting or evaluate your resume in standalone mode.
                  </p>
                </div>

                {/* Mode Selector Toggle Buttons */}
                <div
                  style={{
                    display: 'inline-flex',
                    background: 'var(--bg-tertiary)',
                    padding: '4px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)'
                  }}
                  role="group"
                  aria-label="Analysis Mode"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIncludeJobDescription(false);
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.jobTitle;
                        delete next.experienceLevel;
                        delete next.jobText;
                        return next;
                      });
                      if (validationError && !fieldErrors.file) {
                        setValidationError('');
                      }
                    }}
                    style={{
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      background: !includeJobDescription ? 'var(--brand-primary)' : 'transparent',
                      color: !includeJobDescription ? '#ffffff' : 'var(--text-secondary)'
                    }}
                  >
                    Resume Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncludeJobDescription(true)}
                    style={{
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      background: includeJobDescription ? 'var(--brand-primary)' : 'transparent',
                      color: includeJobDescription ? '#ffffff' : 'var(--text-secondary)'
                    }}
                  >
                    Resume + Job Description
                  </button>
                </div>
              </div>

              {/* Mode Notice: Resume Only Mode */}
              {!includeJobDescription && (
                <div
                  className="glass-panel animate-fade-in"
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(99, 102, 241, 0.06)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <FileText size={22} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
                      Resume Only Mode Active
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Your resume will be evaluated for overall ATS compliance, keyword strength, structural readability, and standard sections without targeting a specific job listing.
                    </p>
                    <div
                      style={{
                        marginTop: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.82rem',
                        color: 'var(--brand-primary)',
                        background: 'var(--brand-primary-light)',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <AlertCircle size={14} />
                      <span>Job Match Score and role-specific requirements will not be evaluated in this mode.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode Form: Resume + Job Description */}
              {includeJobDescription && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                    Please manually provide the job details below. These are used to calculate your exact ATS Job Match Score and uncover missing skills.
                  </p>

                  {/* Row 1: Target Job Title & Company Name */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {/* Target Job Title (Required) */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="target-job-title" className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>
                          Target Job Title <span style={{ color: 'var(--danger)' }}>*</span>
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Required</span>
                      </label>
                      <input
                        id="target-job-title"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Senior Full Stack Engineer"
                        value={jobTitle}
                        onChange={(e) => handleJobTitleChange(e.target.value)}
                        style={
                          fieldErrors.jobTitle
                            ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)' }
                            : {}
                        }
                      />
                      {fieldErrors.jobTitle && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <AlertCircle size={14} />
                          <span>{fieldErrors.jobTitle}</span>
                        </div>
                      )}
                    </div>

                    {/* Company Name (Optional) */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="company-name" className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>Company Name</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optional</span>
                      </label>
                      <input
                        id="company-name"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Stripe, Google, Acme Corp"
                        value={company}
                        onChange={(e) => handleCompanyChange(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Row 2: Experience Level (Required) */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="experience-level" className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>
                        Experience Level <span style={{ color: 'var(--danger)' }}>*</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Required</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        id="experience-level"
                        className="form-select"
                        value={experienceLevel}
                        onChange={(e) => handleExperienceLevelChange(e.target.value)}
                        style={{
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          paddingRight: '2.5rem',
                          cursor: 'pointer',
                          ...(fieldErrors.experienceLevel
                            ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)' }
                            : {})
                        }}
                      >
                        <option value="" disabled>Select experience level...</option>
                        {EXPERIENCE_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        style={{
                          position: 'absolute',
                          right: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                          color: 'var(--text-muted)'
                        }}
                      />
                    </div>
                    {fieldErrors.experienceLevel && (
                      <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertCircle size={14} />
                        <span>{fieldErrors.experienceLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Job Description Text (Required) */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="job-description-text" className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>
                        Job Description Text <span style={{ color: 'var(--danger)' }}>*</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paste full job post requirements</span>
                    </label>
                    <textarea
                      id="job-description-text"
                      className="form-textarea"
                      rows={5}
                      placeholder="Paste target job responsibilities, qualifications, and core requirements here..."
                      value={jobText}
                      onChange={(e) => handleJobTextChange(e.target.value)}
                      style={
                        fieldErrors.jobText
                          ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)' }
                          : {}
                      }
                    />
                    {fieldErrors.jobText && (
                      <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertCircle size={14} />
                        <span>{fieldErrors.jobText}</span>
                      </div>
                    )}
                  </div>

                  {/* Row 4: Required Skills & Keywords Tags (User-Managed) */}
                  <div>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>Required Skills & Keywords</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User-managed tags</span>
                    </label>

                    {skillTags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {skillTags.map(tag => (
                          <span
                            key={tag}
                            className="chip chip-matched"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.35rem 0.75rem',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(99, 102, 241, 0.15)',
                              border: '1px solid rgba(99, 102, 241, 0.35)',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                lineHeight: 1
                              }}
                              title={`Remove ${tag}`}
                              aria-label={`Remove ${tag}`}
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ maxWidth: '320px', padding: '0.55rem 0.85rem', fontSize: '0.88rem' }}
                        placeholder="Add skill (e.g. React, Docker, Python)..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Plus size={15} /> Add Skill
                      </button>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
                      Add target skills one by one to verify your resume's coverage against each specific technology.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div style={{ marginTop: '2.25rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={uploadStatus.isUploading || guestLimitReached}
                style={{ minWidth: '220px' }}
              >
                {guestLimitReached ? (
                  <>
                    <Lock size={18} />
                    Free Review Used
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analyze Resume Now
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Info Callout */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'var(--brand-primary-light)',
          borderColor: 'rgba(99, 102, 241, 0.25)'
        }}
      >
        <Sparkles size={24} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          <strong>Automated Multi-Stage Audit:</strong> Your resume is simultaneously parsed for ATS keyword compatibility, structural readability, and semantic alignment with current industry standards.
        </div>
      </div>
    </div>
  );
}

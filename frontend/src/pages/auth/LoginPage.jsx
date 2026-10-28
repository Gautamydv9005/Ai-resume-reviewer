import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Zap,
  ExternalLink,
  Key,
  X,
  HelpCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage({ initialMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, register, resendVerification, socialLogin, startGuestSession } = useAuth();
  const { addToast } = useToast();
  const [guestLoading, setGuestLoading] = useState(false);

  // Mode: 'signup' or 'signin' (defaults to 'signup' first as requested)
  const queryMode = searchParams.get('mode');
  const [mode, setMode] = useState(
    initialMode || queryMode || (location.pathname === '/register' ? 'signup' : 'signup')
  );

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'facebook' | 'github'
  const [signupSentEmail, setSignupSentEmail] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);

  // Google OAuth Modal & Config State
  const DEFAULT_GOOGLE_CLIENT_ID = '1006441548808-ri9ffi18bs0m11u848c2odn3ui2qs316.apps.googleusercontent.com';
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [enteredGoogleClientId, setEnteredGoogleClientId] = useState(
    localStorage.getItem('resumate_google_client_id') ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    DEFAULT_GOOGLE_CLIENT_ID
  );

  const from = location.state?.from?.pathname || '/dashboard';

  // Synchronize mode if searchParams change
  useEffect(() => {
    if (queryMode) {
      setMode(queryMode === 'signin' ? 'signin' : 'signup');
    }
  }, [queryMode]);

  const handleResendVerificationLink = async (targetEmail) => {
    const toSend = targetEmail || unverifiedEmail || email || signupSentEmail;
    if (!toSend) {
      addToast({ message: 'Please enter your email to resend verification.', type: 'error' });
      return;
    }
    setResendingEmail(true);
    try {
      await resendVerification(toSend);
      addToast({
        message: `Fresh verification email sent to ${toSend}! Check your inbox.`,
        type: 'success'
      });
    } catch (err) {
      addToast({
        message: err.message || 'Failed to resend verification link.',
        type: 'error'
      });
    } finally {
      setResendingEmail(false);
    }
  };

  // Handle standard email/password authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({ message: 'Please enter both email and password.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          addToast({ message: 'Please provide your full name to sign up.', type: 'error' });
          setLoading(false);
          return;
        }
        const res = await register({ name, email, password, targetRole });
        setSignupSentEmail(email);
        setMode('verification_pending');
        addToast({
          message: res?.message || `Verification link sent to ${email}! Please check your inbox.`,
          type: 'success'
        });
        return;
      } else {
        await login(email, password);
        addToast({
          message: 'Signed in successfully! Welcome back to ResuMate AI.',
          type: 'success'
        });
      }
      navigate(from, { replace: true });
    } catch (err) {
      if (err.isUnverified || err.data?.isUnverified) {
        setUnverifiedEmail(err.email || email);
      }
      addToast({
        message: err.message || 'Authentication failed. Please verify your details.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger Google OAuth 2.0 Authorization Flow
  const handleGoogleSignInClick = () => {
    const configuredClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      DEFAULT_GOOGLE_CLIENT_ID ||
      localStorage.getItem('resumate_google_client_id');

    if (configuredClientId && configuredClientId.trim().length > 5) {
      initiateGoogleOAuthRedirect(configuredClientId.trim());
    } else {
      setShowGoogleModal(true);
    }
  };

  // Redirect browser to Google's official accounts OAuth endpoint
  const initiateGoogleOAuthRedirect = (clientId) => {
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(
      'openid email profile'
    )}&prompt=select_account`;

    addToast({
      message: 'Redirecting to Google Accounts...',
      type: 'info'
    });

    window.location.href = googleAuthUrl;
  };

  // Save entered Google Client ID and redirect immediately
  const handleSaveClientIdAndRedirect = (e) => {
    e.preventDefault();
    const cleanId = enteredGoogleClientId.trim();
    if (!cleanId) {
      addToast({ message: 'Please enter a valid Google OAuth Client ID.', type: 'error' });
      return;
    }
    localStorage.setItem('resumate_google_client_id', cleanId);
    setShowGoogleModal(false);
    initiateGoogleOAuthRedirect(cleanId);
  };

  // Handle other social logins or fallback demo
  const handleSocialAuth = async (providerName) => {
    setSocialLoading(providerName);
    try {
      const res = await socialLogin(providerName);
      const providerLabel =
        providerName === 'google'
          ? 'Google (Gmail)'
          : providerName === 'facebook'
          ? 'Facebook'
          : 'GitHub';

      addToast({
        message: `Successfully connected with ${providerLabel}! Welcome, ${res.user.name}.`,
        type: 'success'
      });
      navigate(from, { replace: true });
    } catch (err) {
      addToast({
        message: `Failed to authenticate via ${providerName}. Please try again.`,
        type: 'error'
      });
    } finally {
      setSocialLoading(null);
    }
  };

  // Continue as Guest Handler
  const handleContinueAsGuest = async () => {
    setGuestLoading(true);
    try {
      const res = await startGuestSession();
      addToast({
        message: res?.reviewsUsed >= 1
          ? 'You have already completed your 1 free guest review. Sign up or log in for unlimited reviews!'
          : 'Welcome! You can review 1 resume for free as a guest.',
        type: 'info'
      });
      navigate('/upload');
    } catch (err) {
      addToast({
        message: err.message || 'Could not start guest session. Please try again.',
        type: 'error'
      });
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 70%)'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '490px',
          padding: '2.5rem 2.25rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-default)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top Decorative Glow */}
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

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1rem auto',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Sparkles size={26} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            {mode === 'signup'
              ? 'Sign up first to unlock instant AI resume scoring, ATS audits & job alignment.'
              : 'Sign in to access your resumes, scoring history & ATS insights.'}
          </p>
        </div>

        {/* Verification Pending View OR Regular Auth Views */}
        {mode === 'verification_pending' ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '2px solid rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <Mail size={30} />
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Check Your Inbox!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We have sent an email verification link to <strong style={{ color: 'var(--text-primary)' }}>{signupSentEmail || email}</strong>. Click the link in that email to activate your account.
            </p>

            <div
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                textAlign: 'left',
                lineHeight: 1.5
              }}
            >
              💡 <strong>Tip:</strong> If you don't see the email within 1-2 minutes, check your Spam/Junk folder or request another link below.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={resendingEmail}
                onClick={() => handleResendVerificationLink(signupSentEmail || email)}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-glass-card)'
                }}
              >
                {resendingEmail ? <RefreshCw size={15} className="spin" /> : <RefreshCw size={15} />}
                <span>{resendingEmail ? 'Sending Link...' : 'Resend Verification Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setSignupSentEmail('');
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Go to Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Unverified Email Warning Banner */}
            {unverifiedEmail && mode === 'signin' && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  color: '#f59e0b',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <AlertCircle size={16} />
                  <span>Email Verification Required</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Your account ({unverifiedEmail}) has not been verified yet. Check your inbox or click below to get a fresh link.
                </p>
                <button
                  type="button"
                  disabled={resendingEmail}
                  onClick={() => handleResendVerificationLink(unverifiedEmail)}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'transparent',
                    border: 'none',
                    color: '#f59e0b',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    padding: 0
                  }}
                >
                  {resendingEmail ? 'Sending new link...' : 'Resend verification email now'}
                </button>
              </div>
            )}

            {/* Segmented Mode Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-tertiary)',
                padding: '4px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.75rem',
                border: '1px solid var(--border-default)'
              }}
            >
              <button
                type="button"
                onClick={() => setMode('signup')}
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  background: mode === 'signup' ? 'var(--brand-primary)' : 'transparent',
                  color: mode === 'signup' ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: mode === 'signup' ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none'
                }}
              >
                Sign Up First
              </button>
              <button
                type="button"
                onClick={() => setMode('signin')}
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  background: mode === 'signin' ? 'var(--brand-primary)' : 'transparent',
                  color: mode === 'signin' ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: mode === 'signin' ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none'
                }}
              >
                Sign In
              </button>
            </div>

        {/* Social Authentication Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {/* Gmail / Google Button */}
          <button
            type="button"
            disabled={socialLoading !== null || loading}
            onClick={handleGoogleSignInClick}
            className="btn-secondary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: '1px solid var(--border-default)',
              background: 'var(--bg-glass-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Gmail / Google</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Or continue with email
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Name Field (Sign Up only) */}
          {mode === 'signup' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.825rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="e.g. Jordan Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.825rem' }}>Work or Personal Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0, fontSize: '0.825rem' }}>Password</label>
              {mode === 'signin' && (
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Forgot Password?
                </Link>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Target Role (Sign Up only) */}
          {mode === 'signup' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.825rem' }}>
                Target Role / Industry <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Briefcase
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="e.g. Software Engineer, Product Manager"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || socialLoading !== null}
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 700
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                <span>{mode === 'signup' ? 'Creating Account...' : 'Authenticating...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Free Account & Start' : 'Sign In to ResuMate'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Subtle Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.25rem 0 1rem 0',
            gap: '0.75rem'
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            OR
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
        </div>

        {/* Continue as Guest Button */}
        <div>
          <button
            type="button"
            onClick={handleContinueAsGuest}
            disabled={guestLoading}
            className="btn btn-secondary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.925rem',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
              transition: 'all var(--transition-normal)',
              cursor: 'pointer'
            }}
          >
            {guestLoading ? (
              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
            ) : (
              <>
                <Sparkles size={16} color="var(--brand-primary)" />
                <span>Continue as Guest</span>
                <ArrowRight size={16} color="var(--brand-primary)" />
              </>
            )}
          </button>
          <p
            style={{
              textAlign: 'center',
              marginTop: '0.5rem',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)'
            }}
          >
            Try one resume review without creating an account.
          </p>
        </div>

        {/* Privacy Note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            marginTop: '1.25rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <ShieldCheck size={14} color="#10b981" />
          <span>Encrypted ATS evaluation • No spam • Free access</span>
        </div>
        </>
      )}
      </div>

      {/* Google OAuth Configuration & Redirect Modal */}
      {showGoogleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.25rem'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowGoogleModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Google Sign-In Redirect</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  Live Google OAuth 2.0 Integration
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              To redirect to Google's official accounts sign-in, Google requires an OAuth <strong>Client ID</strong> registered for this web app.
            </p>

            {/* Quick Option 1: Paste Google Client ID */}
            <form onSubmit={handleSaveClientIdAndRedirect} style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                1. Connect Your Google OAuth Client ID:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.82rem' }}
                  placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                  value={enteredGoogleClientId}
                  onChange={(e) => setEnteredGoogleClientId(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                  Save & Redirect
                </button>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Saved to your browser and redirects straight to <code>accounts.google.com</code>.
              </div>
            </form>

            {/* Quick Option 2: Direct Navigate to Google Accounts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 0 }}>
                2. Or choose an instant action:
              </label>

              <button
                type="button"
                onClick={() => {
                  window.open('https://accounts.google.com', '_blank');
                  addToast({ message: 'Opened Google Accounts in a new window.', type: 'info' });
                }}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.84rem'
                }}
              >
                <ExternalLink size={15} />
                <span>Open Google Accounts (accounts.google.com)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  handleSocialAuth('google');
                }}
                className="btn btn-ghost"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.84rem',
                  background: 'rgba(99, 102, 241, 0.08)',
                  color: 'var(--brand-primary)',
                  border: '1px solid rgba(99, 102, 241, 0.25)'
                }}
              >
                <Zap size={14} />
                <span>Instant Demo Sign-In (Simulated Google Account)</span>
              </button>
            </div>

            {/* Quick Setup Instructions for Google Cloud Console */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                lineHeight: 1.45
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Want to create a free Google OAuth Client ID?
              </div>
              1. Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)' }}>Google Cloud Console Credentials</a>.<br />
              2. Click <strong>Create Credentials → OAuth client ID</strong> (Web application).<br />
              3. Set Authorized redirect URI to: <code style={{ color: 'var(--brand-primary)' }}>{window.location.origin}/auth/callback/google</code><br />
              4. Paste the Client ID above or add <code style={{ color: 'var(--brand-primary)' }}>VITE_GOOGLE_CLIENT_ID</code> to <code style={{ color: 'var(--brand-primary)' }}>frontend/.env</code>!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

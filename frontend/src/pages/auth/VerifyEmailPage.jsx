import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Mail,
  RefreshCw,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'resend_sent'
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [resending, setResending] = useState(false);

  // Automatically attempt verification on mount if token is present
  useEffect(() => {
    let isMounted = true;

    async function attemptVerification() {
      if (!token) {
        setStatus('error');
        setErrorMessage('No verification token provided in the link. Please check your email for the complete link.');
        return;
      }

      try {
        const res = await verifyEmail(token, emailParam);
        if (isMounted) {
          setStatus('success');
          addToast({
            message: res.message || '🎉 Email successfully verified! Welcome to ResuMate AI.',
            type: 'success'
          });
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(
            err.message || 'Verification failed. The link may have expired or is invalid.'
          );
        }
      }
    }

    attemptVerification();

    return () => {
      isMounted = false;
    };
  }, [token, emailParam]);

  // Handle resend verification link
  const handleResend = async (e) => {
    e.preventDefault();
    const cleanEmail = resendEmail.trim();

    if (!cleanEmail) {
      addToast({ message: 'Please enter your email address.', type: 'error' });
      return;
    }

    setResending(true);
    try {
      await resendVerification(cleanEmail);
      setStatus('resend_sent');
      addToast({
        message: `Fresh verification email sent to ${cleanEmail}! Please check your inbox.`,
        type: 'success'
      });
    } catch (err) {
      addToast({
        message: err.message || 'Failed to resend verification email.',
        type: 'error'
      });
    } finally {
      setResending(false);
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
          maxWidth: '500px',
          padding: '2.75rem 2.25rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-default)',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
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
            background:
              status === 'success'
                ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                : status === 'error'
                ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                : 'var(--brand-gradient)'
          }}
        />

        {/* 1. VERIFYING STATE */}
        {status === 'verifying' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}
            >
              <div
                className="spinner"
                style={{
                  width: '32px',
                  height: '32px',
                  borderWidth: '3px',
                  borderColor: 'var(--brand-primary)',
                  borderTopColor: 'transparent'
                }}
              />
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
              Verifying Your Email...
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '380px', margin: '0 auto' }}>
              Please wait while we validate your security token and activate your ResuMate AI account.
            </p>
          </div>
        )}

        {/* 2. SUCCESS STATE */}
        {status === 'success' && (
          <div>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                margin: '0 auto 1.5rem auto',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <Sparkles size={13} />
              Account Activated
            </div>

            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Email Verified Successfully!
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your email address has been confirmed. You now have full access to real-time ATS resume scoring, AI bullet feedback, and smart job matching.
            </p>

            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login?mode=signin')}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Sign In to Your Account'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* 3. ERROR / EXPIRED STATE */}
        {status === 'error' && (
          <div>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '2px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                margin: '0 auto 1.5rem auto',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
              }}
            >
              <XCircle size={36} />
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
              Verification Failed
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {errorMessage}
            </p>

            {/* Resend Card */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                textAlign: 'left',
                marginBottom: '1.5rem'
              }}
            >
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Need a new verification link?
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
                Enter your registered email address and we'll send you a fresh verification link.
              </p>

              <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                    style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
                    placeholder="name@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={resending}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {resending ? (
                    <RefreshCw size={16} className="spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  <span>{resending ? 'Sending Link...' : 'Resend Verification Email'}</span>
                </button>
              </form>
            </div>

            <Link
              to="/login?mode=signin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--brand-primary)',
                fontSize: '0.86rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={15} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        )}

        {/* 4. RESEND SENT CONFIRMATION */}
        {status === 'resend_sent' && (
          <div>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '2px solid rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)',
                margin: '0 auto 1.5rem auto'
              }}
            >
              <Mail size={32} />
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
              Check Your Inbox!
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              We have sent a new verification link to <strong style={{ color: 'var(--text-primary)' }}>{resendEmail}</strong>. Please click the link in that email to activate your account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/login?mode=signin"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.8rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none'
                }}
              >
                <span>Proceed to Sign In</span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

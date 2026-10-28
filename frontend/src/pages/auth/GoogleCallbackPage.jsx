import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SERVICE_URLS } from '../../services/apiClient';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const { addToast } = useToast();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleGoogleResponse = async () => {
      try {
        // Extract token from URL hash (implicit flow: #access_token=...&token_type=Bearer...)
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const errorParam = params.get('error');

        if (errorParam) {
          throw new Error(`Google Authentication error: ${errorParam}`);
        }

        if (!accessToken) {
          // Check query parameters in case authorization code flow or direct query
          const searchParams = new URLSearchParams(location.search);
          const searchToken = searchParams.get('access_token');
          if (!searchToken) {
            throw new Error('No access token received from Google.');
          }
        }

        const tokenToUse = accessToken || new URLSearchParams(location.search).get('access_token');

        // Fetch user profile from Google UserInfo API
        const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenToUse}`
          }
        });

        if (!userinfoResponse.ok) {
          throw new Error('Failed to retrieve user profile from Google.');
        }

        const profile = await userinfoResponse.json();

        // 2. Synchronize user profile into backend MongoDB database
        let finalUser = {
          id: `usr_google_${profile.sub || Math.random().toString(36).substring(2)}`,
          name: profile.name || 'Google User',
          email: profile.email,
          avatar: profile.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          role: 'Candidate',
          targetRole: 'Software Engineer',
          provider: 'Google'
        };

        try {
          const authBackendUrl = SERVICE_URLS.auth;
          const syncRes = await fetch(`${authBackendUrl}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: tokenToUse,
              idToken: params.get('id_token') || tokenToUse
            })
          });

          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.user) {
              finalUser = syncData.user;
            }
          }
        } catch (syncErr) {
          console.warn('[Sync] MongoDB sync fallback to local storage:', syncErr.message);
        }

        // Persist session
        localStorage.setItem('resumate_auth_token', tokenToUse);
        localStorage.setItem('resumate_user_profile', JSON.stringify(finalUser));
        setUser(finalUser);

        addToast({
          message: `Signed in successfully with Google! Welcome, ${finalUser.name || 'Professional'}.`,
          type: 'success'
        });

        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Google OAuth callback failed:', err);
        setError(err.message || 'Google sign-in could not be completed.');
      }
    };

    handleGoogleResponse();
  }, [location, navigate, setUser, addToast]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {error ? (
          <div>
            <AlertCircle size={44} color="var(--danger)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Google Sign-In Failed
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div>
            <div
              className="spinner"
              style={{
                width: '40px',
                height: '40px',
                borderWidth: '3px',
                margin: '0 auto 1.5rem auto'
              }}
            />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Connecting to Google...
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Verifying your credentials and preparing your dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

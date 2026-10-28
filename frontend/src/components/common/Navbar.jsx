import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UploadCloud,
  LayoutDashboard,
  History,
  GitCompare,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
  Layers
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/verify-email');

  const navLinks = !isAuthPage
    ? [
        { label: 'Upload & Review', path: '/upload', icon: UploadCloud },
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'History', path: '/resume-history', icon: History },
        { label: 'Compare', path: '/compare', icon: GitCompare }
      ]
    : [];

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-default)',
        transition: 'background var(--transition-normal)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px'
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: 'var(--text-primary)'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                ResuMate<span className="text-gradient">.AI</span>
              </span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              AI RESUME PLATFORM
            </div>
          </div>
        </Link>

        {/* Center Navigation Links (Hidden during login/signup) */}
        {!isAuthPage && navLinks.length > 0 && (
          <nav className="nav-desktop">
            {navLinks.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`btn-ghost ${isActive(path) ? 'active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  color: isActive(path) ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  background: isActive(path) ? 'var(--brand-primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        )}

        {/* Right Action Icons & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Toggle theme mode"
          >
            {isDark ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {/* User Auth or Sign In */}
          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(prev => !prev)}
                className="btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    padding: '0.5rem',
                    zIndex: 1000,
                    animation: 'fadeIn 0.15s ease-out'
                  }}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-default)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>
                  <div style={{ padding: '0.25rem 0' }}>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      className="btn-ghost"
                    >
                      <User size={15} />
                      Profile & Settings
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      className="btn-ghost"
                    >
                      <LayoutDashboard size={15} />
                      Overview Dashboard
                    </Link>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.25rem' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        color: 'var(--danger)',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      className="btn-ghost"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isGuest && (
                <span
                  className="badge badge-brand"
                  style={{
                    fontSize: '0.74rem',
                    padding: '0.2rem 0.55rem',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    color: 'var(--brand-primary)',
                    fontWeight: 600
                  }}
                >
                  Guest Free Trial
                </span>
              )}
              <Link to="/login?mode=signin" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/login?mode=signup" className="btn btn-primary btn-sm">
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

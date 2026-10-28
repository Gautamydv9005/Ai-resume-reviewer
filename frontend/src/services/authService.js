import { serviceRequest, delay } from './apiClient';
import { mockCurrentUser } from '../mock/mockUsers';

export const authService = {
  /**
   * Login user with Email & Password
   */
  async login(email, password) {
    const remoteResponse = await serviceRequest('auth', '/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (remoteResponse && remoteResponse.success) {
      if (remoteResponse.token) {
        localStorage.setItem('resumate_auth_token', remoteResponse.token);
      }
      if (remoteResponse.user) {
        localStorage.setItem('resumate_user_profile', JSON.stringify(remoteResponse.user));
      }
      return remoteResponse;
    }

    throw new Error(remoteResponse?.message || 'Login failed. Please verify your credentials.');
  },

  /**
   * Register new user
   */
  async register(userData) {
    const remoteResponse = await serviceRequest('auth', '/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (remoteResponse && remoteResponse.success) {
      // Do NOT store token — user must sign in manually after registration
      return remoteResponse;
    }

    throw new Error(remoteResponse?.message || 'Registration failed. Please try again.');
  },

  /**
   * Verify email with verification token
   */
  async verifyEmail(token, email) {
    const remoteResponse = await serviceRequest('auth', '/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token, email })
    });

    if (remoteResponse && remoteResponse.success) {
      if (remoteResponse.token) {
        localStorage.setItem('resumate_auth_token', remoteResponse.token);
      }
      if (remoteResponse.user) {
        localStorage.setItem('resumate_user_profile', JSON.stringify(remoteResponse.user));
      }
      return remoteResponse;
    }

    throw new Error(remoteResponse?.message || 'Email verification failed. The link may be invalid or expired.');
  },

  /**
   * Resend verification email
   */
  async resendVerification(email) {
    const remoteResponse = await serviceRequest('auth', '/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (remoteResponse && remoteResponse.success) {
      return remoteResponse;
    }

    throw new Error(remoteResponse?.message || 'Failed to resend verification email.');
  },

  /**
   * Social Authentication (Google / Gmail, Facebook, GitHub)
   */
  async socialLogin(provider) {
    const remoteResponse = await serviceRequest('auth', `/social/${provider}`, {
      method: 'POST'
    });

    if (remoteResponse) {
      if (remoteResponse.token) {
        localStorage.setItem('resumate_auth_token', remoteResponse.token);
      }
      return remoteResponse;
    }

    await delay(650);
    const mockToken = `mock_${provider}_jwt_` + Math.random().toString(36).substring(2);

    const socialProfiles = {
      google: {
        id: 'usr_google_101',
        name: 'Jordan Rivera (Google)',
        email: 'jordan.rivera@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        targetRole: 'Full Stack Engineer',
        provider: 'Google'
      },
      facebook: {
        id: 'usr_fb_202',
        name: 'Jordan Rivera',
        email: 'jordan.rivera@facebook.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        targetRole: 'Product Software Architect',
        provider: 'Facebook'
      },
      github: {
        id: 'usr_gh_303',
        name: 'Jordan Rivera (GitHub)',
        email: 'jordan-coder@github.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        targetRole: 'Senior Cloud & AI Engineer',
        provider: 'GitHub'
      }
    };

    const user = socialProfiles[provider] || {
      ...mockCurrentUser,
      provider
    };

    localStorage.setItem('resumate_auth_token', mockToken);
    localStorage.setItem('resumate_user_profile', JSON.stringify(user));

    return {
      success: true,
      token: mockToken,
      user
    };
  },

  /**
   * Forgot password request
   */
  async forgotPassword(email) {
    const remoteResponse = await serviceRequest('auth', '/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (remoteResponse) return remoteResponse;

    await delay(600);
    return {
      success: true,
      message: `Password reset instructions have been sent to ${email}.`
    };
  },

  /**
   * Reset password with reset token
   */
  async resetPassword(token, newPassword) {
    const remoteResponse = await serviceRequest('auth', '/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });

    if (remoteResponse) return remoteResponse;

    await delay(600);
    return {
      success: true,
      message: 'Password has been successfully updated. You may now log in.'
    };
  },

  /**
   * Get Current Authenticated User Profile
   */
  async getCurrentUser() {
    const remoteResponse = await serviceRequest('auth', '/me', {
      method: 'GET'
    });

    if (remoteResponse) return remoteResponse;

    await delay(150);
    const token = localStorage.getItem('resumate_auth_token');
    if (!token) return null;

    const storedUser = localStorage.getItem('resumate_user_profile');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        // Fallback
      }
    }

    return mockCurrentUser;
  },

  /**
   * Sign out
   */
  logout() {
    localStorage.removeItem('resumate_auth_token');
    localStorage.removeItem('resumate_user_profile');
    return Promise.resolve(true);
  },

  /**
   * Start or retrieve a secure guest session
   */
  async startGuestSession() {
    const remoteResponse = await serviceRequest('auth', '/guest-session', {
      method: 'POST'
    });

    if (remoteResponse && remoteResponse.success) {
      if (remoteResponse.guestToken) {
        localStorage.setItem('resumate_guest_token', remoteResponse.guestToken);
      }
      return remoteResponse;
    }

    const localToken = 'gst_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('resumate_guest_token', localToken);
    return {
      success: true,
      isGuest: true,
      guestToken: localToken,
      reviewsUsed: 0,
      canReview: true,
      completedResumeId: null
    };
  },

  /**
   * Check guest session status
   */
  async getGuestSessionStatus() {
    const remoteResponse = await serviceRequest('auth', '/guest-session', {
      method: 'GET'
    });

    if (remoteResponse && remoteResponse.success) {
      if (remoteResponse.guestToken) {
        localStorage.setItem('resumate_guest_token', remoteResponse.guestToken);
      }
      return remoteResponse;
    }

    const localToken = localStorage.getItem('resumate_guest_token');
    return {
      success: true,
      isGuest: !!localToken,
      guestToken: localToken || null,
      reviewsUsed: 0,
      canReview: true,
      completedResumeId: null
    };
  }
};

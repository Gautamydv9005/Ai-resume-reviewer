import { serviceRequest, delay } from './apiClient';
import { mockCurrentUser } from '../mock/mockUsers';

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('resumate_user_profile');
    if (stored) return { ...mockCurrentUser, ...JSON.parse(stored) };
  } catch (e) {}
  return { ...mockCurrentUser };
};

let userCache = getInitialUser();

export const userService = {
  /**
   * Get current user profile details
   */
  async getUserProfile() {
    const remoteResponse = await serviceRequest('user', '/profile');
    if (remoteResponse) {
      userCache = { ...userCache, ...remoteResponse };
      localStorage.setItem('resumate_user_profile', JSON.stringify(userCache));
      return userCache;
    }

    await delay(200);
    return { ...userCache };
  },

  /**
   * Update user profile with persistence
   */
  async updateUserProfile(updates) {
    const remoteResponse = await serviceRequest('user', '/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    await delay(350);
    userCache = { ...userCache, ...(remoteResponse?.user || updates) };
    localStorage.setItem('resumate_user_profile', JSON.stringify(userCache));
    return { success: true, user: userCache };
  }
};

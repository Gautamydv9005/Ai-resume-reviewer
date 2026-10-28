import { dataStore } from '../utils/dataStore.js';

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_88291';
    const user = await dataStore.users.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const safeUser = { ...user };
    delete safeUser.password;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_88291';
    const updates = req.body;

    delete updates.password; // Prevent accidental password overwriting via profile update
    delete updates._id;

    const updatedUser = await dataStore.users.update(userId, updates);

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const safeUser = { ...updatedUser };
    delete safeUser.password;

    res.json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user profile', error: err.message });
  }
};

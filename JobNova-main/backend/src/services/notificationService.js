const { query } = require('../config/database');

const notificationService = {
  createNotification: async (userId, type, message, relatedId = null) => {
    try {
      const result = await query(
        `INSERT INTO notifications (user_id, type, message, related_id)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, type, message, relatedId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  getUserNotifications: async (userId) => {
    const result = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows || [];
  },

  markAsRead: async (notificationId, userId) => {
    const result = await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );
    if (!result.rows[0]) throw new Error('Notification not found');
    return result.rows[0];
  },

  markAllAsRead: async (userId) => {
    const result = await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false RETURNING *',
      [userId]
    );
    return result.rows;
  }
};

module.exports = notificationService;

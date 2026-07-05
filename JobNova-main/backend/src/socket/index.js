const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;

const setupSocket = (io) => {

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.user?.user_id);

    socket.on('join:session', async (sessionId) => {
      try {
        const profileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [socket.user.id]);
        const profileData = profileResult.rows[0];
        if (!profileData) {
          socket.emit('error', { message: 'Profile not found' });
          return;
        }

        const profileId = profileData.id;

        const sessionResult = await query(
          'SELECT id FROM chat_sessions WHERE id = $1 AND (employer_id = $2 OR candidate_id = $2)',
          [sessionId, profileId]
        );

        if (!sessionResult.rows[0]) {
          socket.emit('error', { message: 'Session not found or access denied' });
          return;
        }

        socket.join(`chat:${sessionId}`);
        console.log(`${socket.user.user_id} joined session ${sessionId}`);
      } catch (err) {
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    socket.on('send:message', async (data) => {
      const { sessionId, content } = data;

      if (!sessionId || !content?.trim()) {
        socket.emit('error', { message: 'Session ID and content are required' });
        return;
      }

      try {
        const profileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [socket.user.id]);
        const profileData = profileResult.rows[0];
        if (!profileData) {
          socket.emit('error', { message: 'Profile not found' });
          return;
        }

        const senderProfileId = profileData.id;

        const msgResult = await query(
          'INSERT INTO chat_messages (session_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
          [sessionId, senderProfileId, content.trim()]
        );
        const message = msgResult.rows[0];

        await query(
          'UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1',
          [sessionId]
        );

        io.to(`chat:${sessionId}`).emit('message:new', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('mark:read', async (data) => {
      const { sessionId } = data;

      if (!sessionId) {
        socket.emit('error', { message: 'Session ID is required' });
        return;
      }

      try {
        const profileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [socket.user.id]);
        const profileData = profileResult.rows[0];
        if (!profileData) return;

        const profileId = profileData.id;

        await query(
          `UPDATE chat_messages SET is_read = true
           WHERE session_id = $1 AND sender_id != $2 AND is_read = false`,
          [sessionId, profileId]
        );

        io.to(`chat:${sessionId}`).emit('messages:read', { sessionId, readBy: socket.user.id });
      } catch (err) {
        // Silently fail
      }
    });

    socket.on('typing:start', (data) => {
      const { sessionId } = data;
      if (sessionId) {
        socket.to(`chat:${sessionId}`).emit('typing', { sessionId, userId: socket.user.id, typing: true });
      }
    });

    socket.on('typing:stop', (data) => {
      const { sessionId } = data;
      if (sessionId) {
        socket.to(`chat:${sessionId}`).emit('typing', { sessionId, userId: socket.user.id, typing: false });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.user?.user_id);
    });
  });
};

module.exports = { setupSocket };

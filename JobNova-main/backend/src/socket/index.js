const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

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

        // Join all sessions the user is part of
        socket.on('join:session', async (sessionId) => {
            try {
                const profileQuery = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('user_id', socket.user.id)
                    .single();

                if (profileQuery.error || !profileQuery.data) {
                    socket.emit('error', { message: 'Profile not found' });
                    return;
                }

                const profileId = profileQuery.data.id;

                const { data: session, error } = await supabaseAdmin
                    .from('chat_sessions')
                    .select('id')
                    .eq('id', sessionId)
                    .or(`employer_id.eq.${profileId},candidate_id.eq.${profileId}`)
                    .single();

                if (error || !session) {
                    socket.emit('error', { message: 'Session not found or access denied' });
                    return;
                }

                socket.join(`chat:${sessionId}`);
                console.log(`${socket.user.user_id} joined session ${sessionId}`);
            } catch (err) {
                socket.emit('error', { message: 'Failed to join session' });
            }
        });

        // Send a message
        socket.on('send:message', async (data) => {
            const { sessionId, content } = data;

            if (!sessionId || !content?.trim()) {
                socket.emit('error', { message: 'Session ID and content are required' });
                return;
            }

            try {
                const profileQuery = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('user_id', socket.user.id)
                    .single();

                if (profileQuery.error || !profileQuery.data) {
                    socket.emit('error', { message: 'Profile not found' });
                    return;
                }

                const senderProfileId = profileQuery.data.id;

                const { data: message, error } = await supabaseAdmin
                    .from('chat_messages')
                    .insert([{ session_id: sessionId, sender_id: senderProfileId, content: content.trim() }])
                    .select()
                    .single();

                if (error) {
                    socket.emit('error', { message: 'Failed to send message' });
                    return;
                }

                await supabaseAdmin
                    .from('chat_sessions')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', sessionId);

                io.to(`chat:${sessionId}`).emit('message:new', message);
            } catch (err) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Mark messages as read
        socket.on('mark:read', async (data) => {
            const { sessionId } = data;

            if (!sessionId) {
                socket.emit('error', { message: 'Session ID is required' });
                return;
            }

            try {
                const profileQuery = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('user_id', socket.user.id)
                    .single();

                if (profileQuery.error || !profileQuery.data) return;

                const profileId = profileQuery.data.id;

                await supabaseAdmin
                    .from('chat_messages')
                    .update({ is_read: true })
                    .eq('session_id', sessionId)
                    .neq('sender_id', profileId)
                    .eq('is_read', false);

                io.to(`chat:${sessionId}`).emit('messages:read', { sessionId, readBy: socket.user.id });
            } catch (err) {
                // Silently fail — marking read is non-critical
            }
        });

        // Typing indicators
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
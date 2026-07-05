const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET;

const authService = {
    registerUser: async ({ user_id, phone, password, role, first_name, last_name }) => {
        if (!user_id || !password || !role || !first_name || !last_name) {
            throw new Error('User ID, password, role, first name, and last name are required');
        }

        const VALID_ROLES = ['blue_collar', 'white_collar', 'employer', 'admin'];
        if (!VALID_ROLES.includes(role)) {
            throw new Error('Invalid role');
        }

        const existingUserId = await userRepository.findByUserId(user_id);
        if (existingUserId) {
            throw new Error('User ID already taken');
        }

        if (phone) {
            const existingPhone = await userRepository.findByPhone(phone);
            if (existingPhone) {
                throw new Error('Phone number already registered');
            }
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await userRepository.createUser({
            user_id,
            phone,
            password_hash: passwordHash,
            role,
            first_name,
            last_name
        });

        // Auto-create a profile so the user's name is immediately available
        try {
            const profileRepository = require('../repositories/profileRepository');
            await profileRepository.create(newUser.id, {
                full_name: `${first_name} ${last_name}`.trim()
            });
        } catch (profileErr) {
            console.error('Auto-create profile failed (non-fatal):', profileErr.message);
        }

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, user_id: newUser.user_id, phone: newUser.phone, first_name: newUser.first_name, last_name: newUser.last_name },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return { user: newUser, token };
    },

    loginUser: async ({ identifier, password }) => {
        if (!identifier || !password) {
            throw new Error('User ID / Phone and password required');
        }

        // Identifier could be user_id or phone
        let user = await userRepository.findByPhone(identifier);
        if (!user) {
            user = await userRepository.findByUserId(identifier);
        }

        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.password_hash) {
            throw new Error('Invalid credentials - Please register a password');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Check if account is suspended
        if (user.is_suspended) {
            throw new Error('Your account has been suspended. Please contact the administrator.');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, user_id: user.user_id, phone: user.phone, first_name: user.first_name, last_name: user.last_name },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const { password_hash, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    },

    getProfile: async (id) => {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    },

    forgotPassword: async (email) => {
        if (!email) {
            throw new Error('Email is required');
        }

        const user = await userRepository.findByEmail(email);
        // Don't reveal whether the account exists
        if (!user) {
            return;
        }

        const crypto = require('crypto');
        const { supabaseAdmin } = require('../config/supabase');

        // Generate a secure random token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

        // Store token in password_resets table
        const { error } = await supabaseAdmin
            .from('password_resets')
            .insert([{ user_id: user.id, token, expires_at: expiresAt }]);

        if (error) {
            console.error('Error storing reset token:', error);
            throw new Error('Failed to process password reset request');
        }

        // Send email
        try {
            const { sendPasswordResetEmail } = require('./mailService');
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            await sendPasswordResetEmail(email, token, frontendUrl);
        } catch (emailErr) {
            console.error('Failed to send password reset email:', emailErr);
            // Don't throw � token is saved, email will be retryable
        }
    },

    resetPassword: async (token, newPassword) => {
        if (!token || !newPassword) {
            throw new Error('Token and new password are required');
        }

        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        const { supabaseAdmin } = require('../config/supabase');

        // Find the token
        const { data: resetRecord, error: findError } = await supabaseAdmin
            .from('password_resets')
            .select('*')
            .eq('token', token)
            .eq('used', false)
            .single();

        if (findError || !resetRecord) {
            throw new Error('Invalid or expired reset token');
        }

        // Check expiry
        if (new Date() > new Date(resetRecord.expires_at)) {
            throw new Error('Reset token has expired');
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update user password
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', resetRecord.user_id);

        if (updateError) {
            throw new Error('Failed to reset password');
        }

        // Mark token as used
        await supabaseAdmin
            .from('password_resets')
            .update({ used: true })
            .eq('id', resetRecord.id);
    }
};

module.exports = authService;
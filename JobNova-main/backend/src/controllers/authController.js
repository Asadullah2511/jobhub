const authService = require('../services/authService');

const authController = {
    // Register: User ID + Phone + Password + Role + Names
    register: async (req, res) => {
        try {
            const { user_id, phone, password, role, first_name, last_name } = req.body;

            const { user, token } = await authService.registerUser({
                user_id, phone, password, role, first_name, last_name
            });

            res.status(201).json({
                success: true,
                data: { user, token },
                message: 'Registration successful'
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // Login: User ID / Phone + Password
    login: async (req, res) => {
        try {
            const { identifier, password } = req.body; // identifier can be user_id or phone

            const { user, token } = await authService.loginUser({ identifier, password });

            res.json({
                success: true,
                data: { user, token },
                message: 'Login successful'
            });

        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    },

    // Get Profile (Protected)
    getProfile: async (req, res) => {
        try {
            // Usually req.user is populated by an authMiddleware
            const { user } = req;
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            await authService.forgotPassword(email);
            res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, new_password } = req.body;
            await authService.resetPassword(token, new_password);
            res.json({ success: true, message: 'Password has been reset successfully.' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
};

module.exports = authController;
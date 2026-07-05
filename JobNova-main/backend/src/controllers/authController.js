const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, created } = require('../utils/responseHelper');

const authController = {
    register: asyncHandler(async (req, res) => {
        const { user_id, phone, password, role, first_name, last_name } = req.body;

        const { user, token } = await authService.registerUser({
            user_id, phone, password, role, first_name, last_name
        });

        return created(res, { user, token }, 'Registration successful');
    }),

    login: asyncHandler(async (req, res) => {
        const { identifier, password } = req.body;

        const { user, token } = await authService.loginUser({ identifier, password });

        return success(res, { user, token }, 'Login successful');
    }),

    getProfile: asyncHandler(async (req, res) => {
        const { user } = req;
        return success(res, user);
    }),

    forgotPassword: asyncHandler(async (req, res) => {
        const { email } = req.body;
        await authService.forgotPassword(email);
        return success(res, null, 'If an account with that email exists, a password reset link has been sent.');
    }),

    resetPassword: asyncHandler(async (req, res) => {
        const { token, new_password } = req.body;
        await authService.resetPassword(token, new_password);
        return success(res, null, 'Password has been reset successfully.');
    })
};

module.exports = authController;
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
    }
});

const sendPasswordResetEmail = async (to, token, frontendUrl) => {
    const resetLink = frontendUrl + '/reset-password?token=' + token;

    const mailOptions = {
        from: '"JobNova Support" <' + process.env.BREVO_SMTP_USER + '>',
        to,
        subject: 'Reset Your JobNova Password',
        html:
            '<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">' +
                '<h2>Password Reset Request</h2>' +
                '<p>You requested a password reset for your JobNova account.</p>' +
                '<p>Click the button below to reset your password. This link expires in 1 hour.</p>' +
                '<a href="' + resetLink + '"' +
                   ' style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">' +
                   'Reset Password' +
                '</a>' +
                '<p>If you did not request this, please ignore this email.</p>' +
                '<hr>' +
                '<p style="color: #6b7280; font-size: 12px;">JobNova - Job Platform</p>' +
            '</div>'
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };

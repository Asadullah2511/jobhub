const twilio = require('twilio');
const { query } = require('../config/database');

// Initialize Twilio client
// In production, get these from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;

// Check if Twilio is configured
const isTwilioConfigured = () => {
  return !!(accountSid && authToken && twilioPhone);
};

if (isTwilioConfigured()) {
  twilioClient = twilio(accountSid, authToken);
  console.log('✅ Twilio client initialized');
} else {
  console.warn('⚠️  Twilio not configured - OTP will be logged to console only (dev mode)');
}

/**
 * Generate a 6-digit OTP code
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to phone number
 * @param {string} phone - Phone number in E.164 format (e.g., +923001234567)
 * @returns {Promise<{success: boolean, otp?: string, expiresAt?: Date}>}
 */
async function sendOTP(phone) {
  try {
    // Clean phone number
    let cleanPhone = phone.trim().replace(/\s+/g, '');

    // Ensure it starts with +
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('92')) {
        cleanPhone = '+' + cleanPhone;
      } else if (cleanPhone.startsWith('0')) {
        cleanPhone = '+92' + cleanPhone.substring(1);
      } else {
        cleanPhone = '+92' + cleanPhone;
      }
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in database
    await query(
      `INSERT INTO otp_verifications (phone, otp_code, expires_at, verified, attempts)
       VALUES ($1, $2, $3, false, 0)`,
      [cleanPhone, otpCode, expiresAt]
    );

    // Send via Twilio if configured
    if (isTwilioConfigured()) {
      await twilioClient.messages.create({
        body: `Your JobHub verification code is: ${otpCode}. Valid for 10 minutes.`,
        from: twilioPhone,
        to: cleanPhone
      });

      console.log(`📱 OTP sent to ${cleanPhone}`);
      return { success: true, expiresAt };
    } else {
      // Dev mode: just log the OTP
      console.log(`\n🔐 DEV MODE OTP for ${cleanPhone}: ${otpCode}`);
      console.log(`   Expires at: ${expiresAt.toLocaleString()}\n`);

      // In dev mode, return the OTP so tests can use it
      return { success: true, otp: otpCode, expiresAt };
    }

  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    throw new Error('Failed to send OTP');
  }
}

/**
 * Verify OTP code
 * @param {string} phone - Phone number
 * @param {string} otpCode - OTP code to verify
 * @returns {Promise<{success: boolean, message?: string}>}
 */
async function verifyOTP(phone, otpCode) {
  try {
    // Clean phone number (same logic as sendOTP)
    let cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('92')) {
        cleanPhone = '+' + cleanPhone;
      } else if (cleanPhone.startsWith('0')) {
        cleanPhone = '+92' + cleanPhone.substring(1);
      } else {
        cleanPhone = '+92' + cleanPhone;
      }
    }

    // Find the most recent unverified OTP for this phone
    const result = await query(
      `SELECT id, otp_code, expires_at, attempts, verified
       FROM otp_verifications
       WHERE phone = $1 AND verified = false
       ORDER BY created_at DESC
       LIMIT 1`,
      [cleanPhone]
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'No OTP found for this phone number' };
    }

    const otpRecord = result.rows[0];

    // Check if already used
    if (otpRecord.verified) {
      return { success: false, message: 'OTP already used' };
    }

    // Check if expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return { success: false, message: 'OTP expired' };
    }

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
      return { success: false, message: 'Maximum attempts exceeded' };
    }

    // Verify code
    if (otpRecord.otp_code !== otpCode) {
      // Increment attempts
      await query(
        `UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1`,
        [otpRecord.id]
      );
      return { success: false, message: 'Invalid OTP code' };
    }

    // Mark as verified
    await query(
      `UPDATE otp_verifications SET verified = true WHERE id = $1`,
      [otpRecord.id]
    );

    console.log(`✅ OTP verified for ${cleanPhone}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Error verifying OTP:', error.message);
    throw new Error('Failed to verify OTP');
  }
}

/**
 * Clean up expired OTPs (should be run periodically)
 */
async function cleanupExpiredOTPs() {
  try {
    const result = await query(
      `DELETE FROM otp_verifications WHERE expires_at < NOW() - INTERVAL '1 hour'`
    );
    console.log(`🧹 Cleaned up ${result.rowCount} expired OTPs`);
  } catch (error) {
    console.error('❌ Error cleaning up OTPs:', error.message);
  }
}

module.exports = {
  sendOTP,
  verifyOTP,
  cleanupExpiredOTPs,
  isTwilioConfigured
};

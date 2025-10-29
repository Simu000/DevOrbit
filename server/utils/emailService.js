// server/utils/emailService.js
import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Your app password: uqwb ptjq jtjo krkv
  },
});

// Verify connection
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

export const sendResetEmail = async (email, resetToken) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `DevOrbit <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - DevOrbit',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2196F3; margin: 0;">DevOrbit</h1>
          <p style="color: #666; margin: 5px 0;">Developer Community Platform</p>
        </div>
        
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password for your DevOrbit account.</p>
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2196F3; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;
                    font-size: 16px; font-weight: bold;">
            Reset Your Password
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <div style="background: #f5f5f5; padding: 12px; border-radius: 5px; margin: 15px 0; word-break: break-all;">
          <code>${resetUrl}</code>
        </div>
        
        <p style="color: #d32f2f;"><strong>⚠️ This link will expire in 1 hour.</strong></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email.<br>
            Your account security is important to us.
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px;">
            DevOrbit - Connect, Learn, and Grow with Developers Worldwide
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to: ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import crypto from 'crypto';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

// Create reusable transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify connection configuration
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
}

// Email types
export type EmailType = 
  | 'welcome'
  | 'verification'
  | 'password-reset'
  | 'subscription-success'
  | 'subscription-cancelled'
  | 'subscription-expiring'
  | 'payment-received'
  | 'payment-failed';

// Email data interface
interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Base email sender
export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: data.from || `"Norvis AI" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
}

// Generate secure token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate verification URL
export function generateVerificationUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/auth/verify-email?token=${token}`;
}

// Generate reset password URL
export function generateResetPasswordUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/auth/reset-password?token=${token}`;
}

// Email template wrapper
function getEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Norvis AI</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          color: white;
          font-size: 32px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 40px 30px;
          color: #333333;
        }
        .content h1 {
          color: #1a1a1a;
          font-size: 24px;
          margin: 0 0 20px 0;
          font-weight: 600;
        }
        .content p {
          color: #666666;
          font-size: 16px;
          margin: 0 0 15px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          font-size: 16px;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .footer {
          background-color: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          color: #6b7280;
          font-size: 14px;
          margin: 5px 0;
        }
        .footer a {
          color: #4F46E5;
          text-decoration: none;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 30px 0;
        }
        .info-box {
          background-color: #f0f9ff;
          border-left: 4px solid #4F46E5;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-box p {
          margin: 0;
          color: #1e40af;
          font-size: 14px;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">Norvis AI</h1>
        </div>
        ${content}
        <div class="footer">
          <p>© ${new Date().getFullYear()} Norvis AI. All rights reserved.</p>
          <p>Multi-Modal AI Chat Platform</p>
          <div class="social-links">
            <a href="#">Privacy Policy</a> | 
            <a href="#">Terms of Service</a> | 
            <a href="#">Contact Us</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Welcome Email
export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const content = `
    <div class="content">
      <h1>Welcome to Norvis AI! 🎉</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining Norvis AI! We're excited to have you on board.</p>
      <p>With Norvis AI, you can:</p>
      <ul style="color: #666666; font-size: 16px; line-height: 1.8;">
        <li>Connect with multiple AI providers (OpenAI, Anthropic, Google)</li>
        <li>Use your own API keys for complete control</li>
        <li>Upload files and generate images</li>
        <li>Access powerful AI models on demand</li>
      </ul>
      <p>Get started by verifying your email address and setting up your API keys.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Go to Dashboard</a>
      <div class="info-box">
        <p>💡 Pro Tip: Start with our free tier and upgrade to Premium when you need more messages!</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Norvis AI! 🚀',
    html: getEmailTemplate(content),
  });
}

// Email Verification
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationUrl: string
): Promise<boolean> {
  const content = `
    <div class="content">
      <h1>Verify Your Email Address 📧</h1>
      <p>Hi ${name},</p>
      <p>Thank you for registering with Norvis AI! Please verify your email address to activate your account.</p>
      <p>Click the button below to verify your email:</p>
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
      <div class="divider"></div>
      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="${verificationUrl}" style="color: #4F46E5; word-break: break-all;">${verificationUrl}</a>
      </p>
      <div class="info-box">
        <p>⚠️ This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Verify Your Email - Norvis AI',
    html: getEmailTemplate(content),
  });
}

// Password Reset
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  const content = `
    <div class="content">
      <h1>Reset Your Password 🔐</h1>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password for your Norvis AI account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <div class="divider"></div>
      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #4F46E5; word-break: break-all;">${resetUrl}</a>
      </p>
      <div class="info-box">
        <p>⚠️ This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Reset Your Password - Norvis AI',
    html: getEmailTemplate(content),
  });
}

// Subscription Success
export async function sendSubscriptionSuccessEmail(
  to: string,
  name: string,
  planName: string,
  amount: number,
  nextBillingDate: string
): Promise<boolean> {
  const content = `
    <div class="content">
      <h1>Subscription Activated! 🎉</h1>
      <p>Hi ${name},</p>
      <p>Your ${planName} subscription has been successfully activated!</p>
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af;">Subscription Details:</h3>
        <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
        <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}/month</p>
        <p style="margin: 5px 0;"><strong>Next Billing:</strong> ${nextBillingDate}</p>
      </div>
      <p>You now have access to all premium features!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/chat" class="button">Start Chatting</a>
      <div class="info-box">
        <p>💡 You can manage your subscription anytime from your account settings.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `${planName} Subscription Activated! 🚀`,
    html: getEmailTemplate(content),
  });
}

// Payment Received
export async function sendPaymentReceivedEmail(
  to: string,
  name: string,
  amount: number,
  planName: string,
  transactionId: string
): Promise<boolean> {
  const content = `
    <div class="content">
      <h1>Payment Received 💳</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your payment! Your transaction has been processed successfully.</p>
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af;">Payment Details:</h3>
        <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <p>Your subscription is now active and you can enjoy all premium features.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/chat" class="button">Go to Dashboard</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Payment Received - Norvis AI',
    html: getEmailTemplate(content),
  });
}

// Subscription Expiring Soon
export async function sendSubscriptionExpiringEmail(
  to: string,
  name: string,
  planName: string,
  expiryDate: string
): Promise<boolean> {
  const content = `
    <div class="content">
      <h1>Subscription Expiring Soon ⏰</h1>
      <p>Hi ${name},</p>
      <p>Your ${planName} subscription will expire on <strong>${expiryDate}</strong>.</p>
      <p>Don't miss out on premium features! Renew your subscription to continue enjoying:</p>
      <ul style="color: #666666; font-size: 16px; line-height: 1.8;">
        <li>Increased message limits</li>
        <li>Priority support</li>
        <li>Advanced AI features</li>
        <li>And much more!</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" class="button">Renew Subscription</a>
      <div class="info-box">
        <p>💡 Your data and chat history will be preserved even if your subscription expires.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Your Subscription is Expiring Soon - Norvis AI',
    html: getEmailTemplate(content),
  });
}

// Subscription Cancelled
export async function sendSubscriptionCancelledEmail(
  to: string,
  name: string,
  planName: string,
  endDate: string
): Promise<boolean> {
  const content = `
    <div class="content">
      <h1>Subscription Cancelled 😢</h1>
      <p>Hi ${name},</p>
      <p>Your ${planName} subscription has been cancelled.</p>
      <p>Your subscription will remain active until <strong>${endDate}</strong>, after which you'll be moved to the free tier.</p>
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>What happens next?</strong><br>
          • You can continue using premium features until ${endDate}<br>
          • After that, you'll have access to free tier features<br>
          • Your chat history will be preserved<br>
          • You can reactivate anytime!
        </p>
      </div>
      <p>We're sorry to see you go. If you have any feedback, we'd love to hear it!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" class="button">Reactivate Subscription</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Subscription Cancelled - Norvis AI',
    html: getEmailTemplate(content),
  });
}

// OTP Verification Email
export async function sendOTPEmail(
  to: string,
  name: string,
  otp: string
): Promise<boolean> {
  const content = `
    <div class="content">
      <h1>Giriş Doğrulama Kodu 🔐</h1>
      <p>Merhaba ${name},</p>
      <p>Hesabınıza giriş yapmak için aşağıdaki 6 haneli doğrulama kodunu kullanın:</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 20px 40px; border-radius: 12px; letter-spacing: 8px; font-size: 36px; font-weight: 700; color: white; font-family: 'Courier New', monospace;">
          ${otp}
        </div>
      </div>
      
      <p style="text-align: center; color: #666; font-size: 14px; margin: 20px 0;">
        Bu kod <strong>5 dakika</strong> süreyle geçerlidir.
      </p>
      
      <div class="info-box">
        <p>⚠️ Bu giriş denemesini siz yapmadıysanız, bu email'i görmezden gelin ve hesap şifrenizi değiştirmeyi düşünün.</p>
      </div>
      
      <div class="divider"></div>
      
      <p style="color: #999; font-size: 13px; text-align: center;">
        Güvenlik nedeniyle, bu kodu kimseyle paylaşmayın.<br>
        Norvis AI ekibi asla sizden bu kodu istemez.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Giriş Doğrulama Kodu: ${otp} - Norvis AI`,
    html: getEmailTemplate(content),
  });
}

// Payment Failed
export async function sendPaymentFailedEmail(
  to: string,
  name: string,
  amount: number,
  reason?: string
): Promise<boolean> {
  const content = `
    <div class="content">
      <h1>Payment Failed ⚠️</h1>
      <p>Hi ${name},</p>
      <p>We were unable to process your payment of $${amount.toFixed(2)}.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <div style="background-color: #fee; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px;">
          <strong>Action Required:</strong><br>
          Please update your payment method to avoid service interruption.
        </p>
      </div>
      <p>Update your payment method now to continue enjoying premium features.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/billing" class="button">Update Payment Method</a>
      <div class="info-box">
        <p>💡 If you continue to have issues, please contact our support team.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Payment Failed - Action Required - Norvis AI',
    html: getEmailTemplate(content),
  });
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  sendSubscriptionSuccessEmail,
  sendPaymentReceivedEmail,
  sendSubscriptionExpiringEmail,
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
  verifyEmailConnection,
  generateToken,
  generateOTP,
  generateVerificationUrl,
  generateResetPasswordUrl,
};

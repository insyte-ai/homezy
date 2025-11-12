import * as brevo from '@getbrevo/brevo';
import { logger } from '../utils/logger';
import { env } from '../config/env';

class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;
  private sender = {
    name: env.EMAIL_FROM_NAME || 'Homezy',
    email: env.EMAIL_FROM || 'noreply@homezy.ae',
  };

  constructor() {
    this.apiInstance = new brevo.TransactionalEmailsApi();

    const apiKey = env.BREVO_API_KEY || '';
    if (apiKey) {
      this.apiInstance.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        apiKey
      );
      logger.info('Brevo email service initialized', {
        apiKeyPrefix: apiKey.substring(0, 10) + '...',
        senderEmail: this.sender.email,
      });
    } else {
      logger.warn('BREVO_API_KEY not found in environment variables');
    }
  }

  /**
   * Send magic link for account access (create password or login)
   */
  async sendMagicLinkEmail(
    to: string,
    token: string,
    hasPassword: boolean,
    firstName?: string
  ): Promise<void> {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      const displayName = firstName || to.split('@')[0];
      const magicLinkUrl = `${clientUrl}/auth/magic-link?token=${token}`;

      const sendSmtpEmail = new brevo.SendSmtpEmail();

      if (hasPassword) {
        // User already has password - send login link
        sendSmtpEmail.subject = 'Sign in to Your Homezy Account';

        sendSmtpEmail.htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 30px 20px; text-align: center; }
              .content { padding: 30px 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
              .notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏠 Welcome Back!</h1>
              </div>
              <div class="content">
                <h2>Hi ${displayName},</h2>
                <p>We received a request to access your Homezy account. Click the button below to sign in:</p>

                <div style="text-align: center;">
                  <a href="${magicLinkUrl}" class="button">Sign In to Homezy</a>
                </div>

                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #0066cc;">${magicLinkUrl}</p>

                <div class="notice">
                  <strong>⏰ This link expires in 24 hours</strong><br>
                  For your security, this link can only be used once.
                </div>

                <p style="margin-top: 30px;">If you didn't request this link, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Homezy. All rights reserved.</p>
                <p>Connecting homeowners with trusted professionals in UAE</p>
              </div>
            </div>
          </body>
          </html>
        `;

        sendSmtpEmail.textContent = `
          Welcome Back!

          Hi ${displayName},

          We received a request to access your Homezy account. Click the link below to sign in:

          ${magicLinkUrl}

          This link expires in 24 hours and can only be used once.

          If you didn't request this link, you can safely ignore this email.

          © ${new Date().getFullYear()} Homezy. All rights reserved.
        `;
      } else {
        // User needs to create password
        sendSmtpEmail.subject = 'Complete Your Homezy Account Setup';

        sendSmtpEmail.htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 30px 20px; text-align: center; }
              .content { padding: 30px 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
              .feature { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #FFD700; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏠 Welcome to Homezy!</h1>
              </div>
              <div class="content">
                <h2>Hi ${displayName},</h2>
                <p>Thank you for submitting your lead! Your project has been posted and verified professionals in UAE will start submitting quotes soon.</p>

                <div class="feature">
                  <strong>✓ What happens next:</strong>
                  <ul style="margin: 10px 0;">
                    <li>Up to 5 verified professionals can claim your lead</li>
                    <li>You'll receive quotes directly to this email</li>
                    <li>Compare quotes and choose the best professional</li>
                    <li>Chat with professionals before making a decision</li>
                  </ul>
                </div>

                <div class="feature">
                  <strong>🔐 Secure Your Account:</strong>
                  <p style="margin: 10px 0;">Click the button below to create your password and access your dashboard where you can manage leads and view quotes.</p>
                </div>

                <div style="text-align: center;">
                  <a href="${magicLinkUrl}" class="button">Create Your Password</a>
                </div>

                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #0066cc;">${magicLinkUrl}</p>

                <p style="margin-top: 30px; font-size: 12px; color: #666;">This link expires in 24 hours.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Homezy. All rights reserved.</p>
                <p>Connecting homeowners with trusted professionals in UAE</p>
              </div>
            </div>
          </body>
          </html>
        `;

        sendSmtpEmail.textContent = `
          Welcome to Homezy!

          Hi ${displayName},

          Thank you for submitting your lead! Your project has been posted and verified professionals in UAE will start submitting quotes soon.

          What happens next:
          - Up to 5 verified professionals can claim your lead
          - You'll receive quotes directly to this email
          - Compare quotes and choose the best professional
          - Chat with professionals before making a decision

          Create your password to access your dashboard:
          ${magicLinkUrl}

          This link expires in 24 hours.

          © ${new Date().getFullYear()} Homezy. All rights reserved.
        `;
      }

      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [
        {
          email: to,
          name: displayName,
        },
      ];

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Magic link email sent', {
        to,
        hasPassword,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending magic link email', {
        to,
        error: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        responseBody: error.response?.body,
      });
      throw error;
    }
  }

  /**
   * Send welcome email to guest account (DEPRECATED - use sendMagicLinkEmail)
   */
  async sendGuestWelcomeEmail(to: string, firstName?: string): Promise<void> {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      const displayName = firstName || to.split('@')[0];

      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Welcome to Homezy - Your Lead is Active!';
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [
        {
          email: to,
          name: displayName,
        },
      ];

      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .feature { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #FFD700; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Welcome to Homezy!</h1>
            </div>
            <div class="content">
              <h2>Hi ${displayName},</h2>
              <p>Thank you for submitting your lead! Your project has been posted and verified professionals in UAE will start submitting quotes soon.</p>

              <div class="feature">
                <strong>✓ What happens next:</strong>
                <ul style="margin: 10px 0;">
                  <li>Up to 5 verified professionals can claim your lead</li>
                  <li>You'll receive quotes directly to this email</li>
                  <li>Compare quotes and choose the best professional</li>
                  <li>Chat with professionals before making a decision</li>
                </ul>
              </div>

              <div class="feature">
                <strong>🔐 Your Account:</strong>
                <p style="margin: 10px 0;">We've created a free account for you! You can view your leads, manage quotes, and communicate with professionals.</p>
              </div>

              <div style="text-align: center;">
                <a href="${clientUrl}/homeowner/dashboard" class="button">View Your Dashboard</a>
              </div>

              <p style="margin-top: 30px;">Need help? Just reply to this email or visit our help center.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Homezy. All rights reserved.</p>
              <p>Connecting homeowners with trusted professionals in UAE</p>
            </div>
          </div>
        </body>
        </html>
      `;

      sendSmtpEmail.textContent = `
        Welcome to Homezy!

        Hi ${displayName},

        Thank you for submitting your lead! Your project has been posted and verified professionals in UAE will start submitting quotes soon.

        What happens next:
        - Up to 5 verified professionals can claim your lead
        - You'll receive quotes directly to this email
        - Compare quotes and choose the best professional
        - Chat with professionals before making a decision

        Your Account:
        We've created a free account for you! View your dashboard at:
        ${clientUrl}/homeowner/dashboard

        Need help? Just reply to this email or visit our help center.

        © ${new Date().getFullYear()} Homezy. All rights reserved.
        Connecting homeowners with trusted professionals in UAE
      `;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Guest welcome email sent', {
        to,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending guest welcome email', {
        to,
        error: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        responseBody: error.response?.body,
        responseText: error.response?.text,
      });
      // Don't throw error - email failure shouldn't block signup
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(to: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${
        process.env.CLIENT_URL || 'http://localhost:3001'
      }/auth/verify-email?token=${token}`;

      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Verify Your Homezy Account';
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [
        {
          email: to,
          name: to.split('@')[0],
        },
      ];

      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Welcome to Homezy</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for signing up with Homezy! Please click the button below to verify your email address and complete your registration.</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #0066cc;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account with Homezy, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Homezy. All rights reserved.</p>
              <p>Questions? Contact us at support@homezy.ae</p>
            </div>
          </div>
        </body>
        </html>
      `;

      sendSmtpEmail.textContent = `
        Welcome to Homezy!

        Please verify your email address by clicking the link below:
        ${verificationUrl}

        This link will expire in 24 hours.

        If you didn't create an account with Homezy, please ignore this email.

        © ${new Date().getFullYear()} Homezy. All rights reserved.
      `;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Email verification sent', {
        to,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending email verification', {
        to,
        error: error.message,
        response: error.response?.body,
      });
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to: string, token: string): Promise<void> {
    try {
      const resetUrl = `${
        process.env.CLIENT_URL || 'http://localhost:3001'
      }/auth/reset-password?token=${token}`;

      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Reset Your Homezy Password';
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [
        {
          email: to,
          name: to.split('@')[0],
        },
      ];

      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #0066cc;">${resetUrl}</p>
              <p>This link will expire in 1 hour.</p>

              <div class="warning">
                <strong>⚠️ Security Note:</strong> If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Homezy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      sendSmtpEmail.textContent = `
        Password Reset

        We received a request to reset your password. Click the link below to create a new password:
        ${resetUrl}

        This link will expire in 1 hour.

        If you didn't request a password reset, please ignore this email or contact support if you have concerns.

        © ${new Date().getFullYear()} Homezy. All rights reserved.
      `;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Password reset email sent', {
        to,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending password reset email', {
        to,
        error: error.message,
        response: error.response?.body,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

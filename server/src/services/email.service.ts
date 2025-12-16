import * as brevo from '@getbrevo/brevo';
import { logger } from '../utils/logger';
import { env } from '../config/env';

class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;
  private sender = {
    name: env.EMAIL_FROM_NAME || 'Homezy',
    email: env.EMAIL_FROM || 'noreply@homezy.co',
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
              <p>Questions? Contact us at support@homezy.co</p>
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

  /**
   * Send email when a homeowner sends a direct lead to a professional
   */
  async sendDirectLeadReceived(
    to: string,
    data: {
      professionalName: string;
      homeownerName: string;
      leadTitle: string;
      leadCategory: string;
      leadBudget: string;
      leadId: string;
      expiresAt: Date;
    }
  ): Promise<void> {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      const leadUrl = `${clientUrl}/pro/leads/${data.leadId}`;
      const expiryHours = 24;

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `New Direct Lead: ${data.leadTitle}`;
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [{ email: to, name: data.professionalName }];

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
            .lead-info { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #FFD700; }
            .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 New Direct Lead</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.professionalName},</h2>
              <p><strong>${data.homeownerName}</strong> has sent you a private lead request!</p>

              <div class="lead-info">
                <h3>${data.leadTitle}</h3>
                <p><strong>Category:</strong> ${data.leadCategory}</p>
                <p><strong>Budget:</strong> AED ${data.leadBudget}</p>
              </div>

              <div class="urgent">
                <strong>⏰ This is a private opportunity for ${expiryHours} hours</strong><br>
                You have exclusive access to this lead until ${data.expiresAt.toLocaleString('en-US', { timeZone: 'Asia/Dubai', dateStyle: 'medium', timeStyle: 'short' })} (Dubai time).<br><br>
                After ${expiryHours} hours, if not accepted, this lead will become public on the marketplace.
              </div>

              <div style="text-align: center;">
                <a href="${leadUrl}" class="button">View Lead Details</a>
              </div>

              <p style="margin-top: 30px;">Don't miss this opportunity to connect directly with a homeowner who specifically selected you!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Homezy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      sendSmtpEmail.textContent = `
        New Direct Lead

        Hi ${data.professionalName},

        ${data.homeownerName} has sent you a private lead request!

        Lead Details:
        - Title: ${data.leadTitle}
        - Category: ${data.leadCategory}
        - Budget: AED ${data.leadBudget}

        ⏰ This is a private opportunity for ${expiryHours} hours
        You have exclusive access until ${data.expiresAt.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}.
        After ${expiryHours} hours, if not accepted, this lead will become public.

        View lead details: ${leadUrl}

        © ${new Date().getFullYear()} Homezy. All rights reserved.
      `;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Direct lead received email sent', {
        to,
        leadId: data.leadId,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending direct lead received email', {
        to,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send 12-hour reminder for pending direct lead
   */
  async sendDirectLeadReminder1(
    to: string,
    data: {
      professionalName: string;
      leadTitle: string;
      leadCategory: string;
      leadId: string;
      expiresAt: Date;
      hoursRemaining: number;
    }
  ): Promise<void> {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      const leadUrl = `${clientUrl}/pro/leads/${data.leadId}`;

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `Reminder: Direct Lead Expires in ${data.hoursRemaining} Hours`;
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [{ email: to, name: data.professionalName }];

      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ffc107; color: #000; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Reminder: Direct Lead Expiring Soon</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.professionalName},</h2>
              <p>You have a pending direct lead that will expire in approximately <strong>${data.hoursRemaining} hours</strong>.</p>

              <div class="urgent">
                <strong>Lead:</strong> ${data.leadTitle}<br>
                <strong>Category:</strong> ${data.leadCategory}<br>
                <strong>Expires:</strong> ${data.expiresAt.toLocaleString('en-US', { timeZone: 'Asia/Dubai', dateStyle: 'medium', timeStyle: 'short' })} (Dubai time)
              </div>

              <p>After expiry, this lead will become available to other professionals on the marketplace.</p>

              <div style="text-align: center;">
                <a href="${leadUrl}" class="button">Review & Accept Lead</a>
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
        Reminder: Direct Lead Expiring Soon

        Hi ${data.professionalName},

        You have a pending direct lead that will expire in approximately ${data.hoursRemaining} hours.

        Lead: ${data.leadTitle}
        Category: ${data.leadCategory}
        Expires: ${data.expiresAt.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}

        After expiry, this lead will become available to other professionals.

        Review & accept: ${leadUrl}

        © ${new Date().getFullYear()} Homezy. All rights reserved.
      `;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Direct lead reminder 1 sent', {
        to,
        leadId: data.leadId,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending direct lead reminder 1', {
        to,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send 1-hour reminder for pending direct lead
   */
  async sendDirectLeadReminder2(
    to: string,
    data: {
      professionalName: string;
      leadTitle: string;
      leadCategory: string;
      leadId: string;
      expiresAt: Date;
      minutesRemaining: number;
    }
  ): Promise<void> {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      const leadUrl = `${clientUrl}/pro/leads/${data.leadId}`;

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `🚨 Final Reminder: Direct Lead Expires in ${data.minutesRemaining} Minutes`;
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [{ email: to, name: data.professionalName }];

      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff6b6b; color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 14px 32px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .urgent { background: #ffebee; border-left: 4px solid #ff6b6b; padding: 15px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Final Reminder: Lead Expiring Soon!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.professionalName},</h2>
              <p><strong>Last chance!</strong> Your direct lead expires in approximately <strong>${data.minutesRemaining} minutes</strong>.</p>

              <div class="urgent">
                <strong>Lead:</strong> ${data.leadTitle}<br>
                <strong>Category:</strong> ${data.leadCategory}<br>
                <strong>Expires:</strong> ${data.expiresAt.toLocaleString('en-US', { timeZone: 'Asia/Dubai', timeStyle: 'short' })} (Dubai time)
              </div>

              <p><strong>Act now</strong> or this opportunity will be opened to other professionals!</p>

              <div style="text-align: center;">
                <a href="${leadUrl}" class="button">Accept Lead Now</a>
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
        🚨 Final Reminder: Lead Expiring Soon!

        Hi ${data.professionalName},

        Last chance! Your direct lead expires in approximately ${data.minutesRemaining} minutes.

        Lead: ${data.leadTitle}
        Category: ${data.leadCategory}
        Expires: ${data.expiresAt.toLocaleString('en-US', { timeZone: 'Asia/Dubai', timeStyle: 'short' })}

        Act now or this opportunity will be opened to other professionals!

        Accept lead now: ${leadUrl}

        © ${new Date().getFullYear()} Homezy. All rights reserved.
      `;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Direct lead reminder 2 sent', {
        to,
        leadId: data.leadId,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending direct lead reminder 2', {
        to,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send email when direct lead is converted to public
   */
  async sendDirectLeadConvertedToPublic(
    to: string,
    data: {
      homeownerName: string;
      leadTitle: string;
      leadId: string;
    }
  ): Promise<void> {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      const leadUrl = `${clientUrl}/dashboard/leads/${data.leadId}`;

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `Your Lead is Now on the Marketplace`;
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [{ email: to, name: data.homeownerName }];

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
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #FFD700; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📢 Lead Now on Marketplace</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.homeownerName},</h2>
              <p>Your lead "<strong>${data.leadTitle}</strong>" is now available on the public marketplace.</p>

              <div class="info-box">
                <strong>What this means:</strong>
                <ul style="margin: 10px 0;">
                  <li>Up to 5 verified professionals can now claim your lead</li>
                  <li>You'll start receiving quotes from interested professionals</li>
                  <li>Compare quotes and choose the best professional for your project</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${leadUrl}" class="button">View Your Lead</a>
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
        Lead Now on Marketplace

        Hi ${data.homeownerName},

        Your lead "${data.leadTitle}" is now available on the public marketplace.

        What this means:
        - Up to 5 verified professionals can now claim your lead
        - You'll start receiving quotes from interested professionals
        - Compare quotes and choose the best professional for your project

        View your lead: ${leadUrl}

        © ${new Date().getFullYear()} Homezy. All rights reserved.
      `;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Direct lead converted email sent', {
        to,
        leadId: data.leadId,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending direct lead converted email', {
        to,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send email when professional accepts a direct lead
   */
  async sendDirectLeadAccepted(
    to: string,
    data: {
      homeownerName: string;
      professionalName: string;
      leadTitle: string;
      leadId: string;
    }
  ): Promise<void> {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      const leadUrl = `${clientUrl}/dashboard/leads/${data.leadId}`;

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `${data.professionalName} Accepted Your Lead!`;
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [{ email: to, name: data.homeownerName }];

      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 14px 32px; background: #4CAF50; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Professional Accepted!</h1>
            </div>
            <div class="content">
              <h2>Great news, ${data.homeownerName}!</h2>
              <p><strong>${data.professionalName}</strong> has accepted your lead for "<strong>${data.leadTitle}</strong>".</p>

              <div class="info-box">
                <strong>Next steps:</strong>
                <ul style="margin: 10px 0;">
                  <li>Wait for ${data.professionalName} to submit a detailed quote</li>
                  <li>Review the quote and ask any questions via chat</li>
                  <li>Accept the quote if you're happy to proceed</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${leadUrl}" class="button">View Lead Details</a>
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
        Professional Accepted!

        Great news, ${data.homeownerName}!

        ${data.professionalName} has accepted your lead for "${data.leadTitle}".

        Next steps:
        - Wait for ${data.professionalName} to submit a detailed quote
        - Review the quote and ask any questions via chat
        - Accept the quote if you're happy to proceed

        View lead details: ${leadUrl}

        © ${new Date().getFullYear()} Homezy. All rights reserved.
      `;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Direct lead accepted email sent', {
        to,
        leadId: data.leadId,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending direct lead accepted email', {
        to,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send email when professional declines a direct lead
   */
  async sendDirectLeadDeclined(
    to: string,
    data: {
      homeownerName: string;
      professionalName: string;
      leadTitle: string;
      leadId: string;
    }
  ): Promise<void> {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      const leadUrl = `${clientUrl}/dashboard/leads/${data.leadId}`;

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `Update on Your Lead: ${data.leadTitle}`;
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [{ email: to, name: data.homeownerName }];

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
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #FFD700; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📢 Lead Update</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.homeownerName},</h2>
              <p>${data.professionalName} was unable to accept your lead for "<strong>${data.leadTitle}</strong>".</p>

              <div class="info-box">
                <strong>Good news:</strong><br>
                Your lead has been automatically posted to the public marketplace where up to 5 verified professionals can claim it and submit quotes.
              </div>

              <p>You'll start receiving quotes from interested professionals soon.</p>

              <div style="text-align: center;">
                <a href="${leadUrl}" class="button">View Your Lead</a>
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
        Lead Update

        Hi ${data.homeownerName},

        ${data.professionalName} was unable to accept your lead for "${data.leadTitle}".

        Good news:
        Your lead has been automatically posted to the public marketplace where up to 5 verified professionals can claim it and submit quotes.

        You'll start receiving quotes from interested professionals soon.

        View your lead: ${leadUrl}

        © ${new Date().getFullYear()} Homezy. All rights reserved.
      `;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Direct lead declined email sent', {
        to,
        leadId: data.leadId,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending direct lead declined email', {
        to,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send service reminder notification email
   */
  async sendServiceReminderEmail(
    to: string,
    data: {
      firstName: string;
      reminderTitle: string;
      category: string;
      propertyName: string;
      dueDate: Date;
      daysUntilDue: number;
      reminderId: string;
    }
  ): Promise<void> {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      const reminderUrl = `${clientUrl}/dashboard/my-home/reminders`;

      const sendSmtpEmail = new brevo.SendSmtpEmail();

      // Subject varies based on urgency
      let subject = `Service Reminder: ${data.reminderTitle}`;
      let urgencyBadge = '';
      let headerColor = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';

      if (data.daysUntilDue <= 1) {
        subject = `🚨 Due Today: ${data.reminderTitle}`;
        urgencyBadge = '<span style="background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">DUE TODAY</span>';
        headerColor = '#ff6b6b';
      } else if (data.daysUntilDue <= 7) {
        subject = `⏰ Due Soon: ${data.reminderTitle}`;
        urgencyBadge = '<span style="background: #ffc107; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 12px;">DUE IN ' + data.daysUntilDue + ' DAYS</span>';
        headerColor = '#ffc107';
      }

      sendSmtpEmail.subject = subject;
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [{ email: to, name: data.firstName }];

      const categoryLabel = data.category
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${headerColor}; color: ${data.daysUntilDue <= 1 ? 'white' : '#000'}; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .reminder-info { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #FFD700; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .cta-section { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Service Reminder</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.firstName},</h2>
              <p>This is a friendly reminder about upcoming home maintenance. ${urgencyBadge}</p>

              <div class="reminder-info">
                <h3 style="margin-top: 0;">${data.reminderTitle}</h3>
                <p><strong>Category:</strong> ${categoryLabel}</p>
                <p><strong>Property:</strong> ${data.propertyName}</p>
                <p><strong>Due Date:</strong> ${data.dueDate.toLocaleDateString('en-US', { timeZone: 'Asia/Dubai', dateStyle: 'long' })}</p>
              </div>

              <div class="cta-section">
                <strong>💡 Need help with this service?</strong><br>
                Request a quote from verified Homezy professionals and get competitive offers for your ${categoryLabel.toLowerCase()} needs.
              </div>

              <div style="text-align: center;">
                <a href="${reminderUrl}" class="button">View Reminder</a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                You can manage your reminders, snooze them, or mark them as complete from your Homezy dashboard.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Homezy. All rights reserved.</p>
              <p style="font-size: 11px;">You're receiving this email because you have service reminders enabled. <a href="${clientUrl}/dashboard/settings">Manage preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      sendSmtpEmail.textContent = `
        Service Reminder

        Hi ${data.firstName},

        This is a friendly reminder about upcoming home maintenance.

        ${data.reminderTitle}
        Category: ${categoryLabel}
        Property: ${data.propertyName}
        Due Date: ${data.dueDate.toLocaleDateString('en-US', { timeZone: 'Asia/Dubai', dateStyle: 'long' })}

        Need help with this service?
        Request a quote from verified Homezy professionals.

        View reminder: ${reminderUrl}

        © ${new Date().getFullYear()} Homezy. All rights reserved.
      `;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info('Service reminder email sent', {
        to,
        reminderId: data.reminderId,
        daysUntilDue: data.daysUntilDue,
        messageId: (result.body as any).messageId,
      });
    } catch (error: any) {
      logger.error('Error sending service reminder email', {
        to,
        reminderId: data.reminderId,
        error: error.message,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

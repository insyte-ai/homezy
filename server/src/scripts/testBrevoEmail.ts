/**
 * Test script to verify Brevo email configuration
 * Run with: npx tsx src/scripts/testBrevoEmail.ts
 */

import * as brevo from '@getbrevo/brevo';
import dotenv from 'dotenv';

dotenv.config();

async function testBrevoConfig() {
  console.log('\n🔍 Testing Brevo Configuration...\n');

  const apiKey = process.env.BREVO_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'noreply@homezy.co';
  const emailFromName = process.env.EMAIL_FROM_NAME || 'Homezy';

  console.log('Configuration:');
  console.log(`  API Key: ${apiKey ? apiKey.substring(0, 15) + '...' : 'NOT SET'}`);
  console.log(`  Sender Email: ${emailFrom}`);
  console.log(`  Sender Name: ${emailFromName}`);
  console.log('');

  if (!apiKey) {
    console.error('❌ BREVO_API_KEY is not set in environment variables');
    process.exit(1);
  }

  try {
    // Initialize API
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    console.log('✅ API client initialized');

    // Test 1: Get account info
    console.log('\n📋 Test 1: Fetching account info...');
    const accountApi = new brevo.AccountApi();
    accountApi.setApiKey(brevo.AccountApiApiKeys.apiKey, apiKey);

    try {
      const accountInfo = await accountApi.getAccount();
      console.log('✅ Account info retrieved successfully');
      console.log(`   Email: ${(accountInfo.body as any).email}`);
      console.log(`   Plan: ${JSON.stringify((accountInfo.body as any).plan)}`);
    } catch (error: any) {
      console.error('❌ Failed to get account info:', error.message);
      if (error.response?.status === 401) {
        console.error('\n🚨 401 Error: API key is invalid or expired');
        console.error('   Please check your API key at: https://app.brevo.com/settings/keys/api');
      }
      throw error;
    }

    // Test 2: Get sender list
    console.log('\n📋 Test 2: Fetching verified senders...');
    const sendersApi = new brevo.SendersApi();
    sendersApi.setApiKey(brevo.SendersApiApiKeys.apiKey, apiKey);

    try {
      const senders = await sendersApi.getSenders();
      const senderList = (senders.body as any).senders || [];
      console.log(`✅ Found ${senderList.length} verified sender(s):`);
      senderList.forEach((sender: any) => {
        console.log(`   - ${sender.email} (${sender.name}) - Active: ${sender.active}`);
      });

      // Check if current sender is verified
      const isVerified = senderList.some((s: any) => s.email === emailFrom && s.active);
      if (!isVerified) {
        console.warn(`\n⚠️  WARNING: ${emailFrom} is not in verified senders list`);
        console.warn('   You need to verify this email in Brevo:');
        console.warn('   https://app.brevo.com/senders/domain/list');
      } else {
        console.log(`\n✅ ${emailFrom} is verified and active`);
      }
    } catch (error: any) {
      console.error('❌ Failed to get senders:', error.message);
    }

    // Test 3: Send test email
    console.log('\n📧 Test 3: Sending test email...');
    const testEmail = new brevo.SendSmtpEmail();
    testEmail.subject = 'Test Email from Homezy';
    testEmail.sender = { name: emailFromName, email: emailFrom };
    testEmail.to = [{ email: 'vikrumdulani@gmail.com', name: 'Test User' }];
    testEmail.htmlContent = `
      <html>
        <body>
          <h1>Test Email</h1>
          <p>This is a test email from Homezy to verify Brevo integration.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        </body>
      </html>
    `;
    testEmail.textContent = `Test Email - Sent at: ${new Date().toISOString()}`;

    try {
      const result = await apiInstance.sendTransacEmail(testEmail);
      console.log('✅ Test email sent successfully!');
      console.log(`   Message ID: ${(result.body as any).messageId}`);
      console.log('\n🎉 All tests passed! Brevo is configured correctly.');
    } catch (error: any) {
      console.error('❌ Failed to send test email:', error.message);
      if (error.response?.status === 401) {
        console.error('\n🚨 401 Error: Authentication failed');
        console.error('   Possible causes:');
        console.error('   1. Invalid or expired API key');
        console.error('   2. API key lacks permission for transactional emails');
      } else if (error.response?.status === 400) {
        console.error('\n🚨 400 Error: Bad request');
        console.error('   Response:', error.response?.body);
      }
      throw error;
    }

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Body:', JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  }
}

testBrevoConfig()
  .then(() => {
    console.log('\n✅ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });

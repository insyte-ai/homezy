import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';
import { CreditBalance, CreditTransaction } from '../models/Credit.model';
import creditService from '../services/credit.service';
import { logger } from '../utils/logger';

dotenv.config();

/**
 * Test script to verify credit system functionality
 */
async function testCreditSystem() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/homezy';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for credit system test');

    // Find a verified professional or use the first one
    let professional = await User.findOne({
      role: 'professional',
      'proProfile.verificationStatus': { $in: ['basic', 'comprehensive'] },
    });

    if (!professional) {
      console.log('\n⚠️  No verified professionals found in database');
      console.log('Please verify a professional first or run the test after onboarding\n');

      // Find any professional
      professional = await User.findOne({ role: 'professional' });

      if (!professional) {
        console.log('No professionals found at all. Please register a professional first.\n');
        process.exit(0);
      }

      console.log(`Found unverified professional: ${professional.email}`);
      console.log('Updating verification status for testing...\n');

      professional.proProfile!.verificationStatus = 'approved';
      await professional.save();
    }

    const professionalId = professional._id.toString();
    console.log('='.repeat(60));
    console.log('CREDIT SYSTEM TEST');
    console.log('='.repeat(60));
    console.log(`Professional: ${professional.email}`);
    console.log(`Verification: ${professional.proProfile?.verificationStatus}`);
    console.log('='.repeat(60));

    // Test 1: Get initial balance
    console.log('\n1️⃣  Testing getBalance (should create with 100 free credits)...');
    let balance = await creditService.getBalance(professionalId);
    console.log('✅ Balance created/retrieved:');
    console.log(`   - Total: ${balance.totalBalance} credits`);
    console.log(`   - Free: ${balance.freeCredits} credits`);
    console.log(`   - Paid: ${balance.paidCredits} credits`);
    console.log(`   - Last Reset: ${balance.lastResetDate?.toISOString()}`);

    // Test 2: Check transactions
    console.log('\n2️⃣  Checking transaction history...');
    const { transactions } = await creditService.getTransactions(professionalId, { limit: 10 });
    console.log(`✅ Found ${transactions.length} transaction(s):`);
    transactions.forEach((txn: any, idx: number) => {
      console.log(`   ${idx + 1}. ${txn.type}: ${txn.amount > 0 ? '+' : ''}${txn.amount} (${txn.description})`);
    });

    // Test 3: Spend some credits
    console.log('\n3️⃣  Testing credit spending (claim a lead for 3 credits)...');
    const spendResult = await creditService.spendCredits({
      professionalId,
      amount: 3,
      description: 'Test lead claim',
      metadata: { leadId: 'test-lead-123', budgetBracket: 'under-3k' },
    });
    console.log('✅ Credits spent successfully:');
    console.log(`   - New balance: ${spendResult.balance.totalBalance} credits`);
    console.log(`   - Free credits: ${spendResult.balance.freeCredits}`);
    console.log(`   - Paid credits: ${spendResult.balance.paidCredits}`);

    // Test 4: Monthly reset
    console.log('\n4️⃣  Testing monthly reset...');
    const resetBalance = await creditService.resetMonthlyCredits(professionalId);
    console.log('✅ Monthly reset completed:');
    console.log(`   - New balance: ${resetBalance.totalBalance} credits`);
    console.log(`   - Free credits: ${resetBalance.freeCredits} (should be 100)`);
    console.log(`   - Paid credits: ${resetBalance.paidCredits}`);
    console.log(`   - Last reset: ${resetBalance.lastResetDate?.toISOString()}`);

    // Test 5: Verify reset transaction
    console.log('\n5️⃣  Verifying reset transaction...');
    const resetTxn = await CreditTransaction.findOne({
      professionalId,
      type: 'monthly_reset',
    }).sort({ createdAt: -1 });

    if (resetTxn) {
      console.log('✅ Reset transaction found:');
      console.log(`   - Amount: ${resetTxn.amount > 0 ? '+' : ''}${resetTxn.amount}`);
      console.log(`   - Description: ${resetTxn.description}`);
      console.log(`   - Previous free credits: ${resetTxn.metadata?.previousFreeCredits}`);
      console.log(`   - Balance after: ${resetTxn.balanceAfter}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    const finalBalance = await creditService.getBalance(professionalId);
    const allTransactions = await CreditTransaction.find({ professionalId }).sort({ createdAt: 1 });

    console.log(`Final Balance: ${finalBalance.totalBalance} credits`);
    console.log(`  - Free: ${finalBalance.freeCredits}`);
    console.log(`  - Paid: ${finalBalance.paidCredits}`);
    console.log(`\nTotal Transactions: ${allTransactions.length}`);
    allTransactions.forEach((txn: any, idx: number) => {
      const sign = txn.amount > 0 ? '+' : '';
      console.log(`  ${idx + 1}. [${txn.type}] ${sign}${txn.amount} → Balance: ${txn.balanceAfter}`);
    });
    console.log('='.repeat(60));
    console.log('✅ All tests passed!\n');

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    logger.error('Credit system test error:', error);
    throw error;
  }
}

// Run test
testCreditSystem()
  .then(() => {
    console.log('Credit system test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Credit system test failed:', error);
    process.exit(1);
  });

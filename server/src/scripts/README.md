# Homezy Background Scripts

This directory contains background jobs and scripts for maintaining the Homezy platform.

## Available Scripts

### 1. Monthly Credits Reset

**File:** `monthlyCreditsReset.ts`

**Purpose:** Resets free credits to 100 for all verified professionals on the 1st of each month.

**Schedule:** Run on the 1st of each month at 00:01 UTC
**Cron Expression:** `1 0 1 * *`

**Manual Execution:**
```bash
cd server
npm run credits:reset
```

**Details:**
- Targets all professionals with `verificationStatus` of `basic` or `comprehensive`
- Sets `freeCredits` to exactly 100 (overwrites any remaining free credits)
- Maintains `paidCredits` balance untouched
- Creates a `monthly_reset` transaction record with previous balance info
- Updates `lastResetDate` field in CreditBalance

**Logic:**
- If professional had 30 free credits → sets to 100 (+70 adjustment)
- If professional had 120 free credits → sets to 100 (-20 adjustment)
- Only affects free credits; paid credits remain unchanged

---

### 2. Credit Expiry

**File:** `creditExpiry.ts`

**Purpose:** Expires purchased credits that are 6 months old.

**Schedule:** Run daily at 02:00 UTC
**Cron Expression:** `0 2 * * *`

**Manual Execution:**
```bash
cd server
npm run credits:expire
```

**Details:**
- Finds all `CreditTransaction` records with:
  - `creditType: 'paid'`
  - `remainingAmount > 0`
  - `expiresAt <= now`
- Deducts expired credits from professional balances
- Creates `expiry` transaction records
- Updates `remainingAmount` to 0 for expired transactions

---

## Setup for Production

### Option 1: Using Cron Jobs (Linux/Unix)

1. Open crontab:
```bash
crontab -e
```

2. Add the following entries:
```bash
# Monthly credits reset (1st of month at 00:01 UTC)
1 0 1 * * cd /path/to/homezy/server && npm run credits:reset >> /var/log/homezy-credits-reset.log 2>&1

# Daily credit expiry (every day at 02:00 UTC)
0 2 * * * cd /path/to/homezy/server && npm run credits:expire >> /var/log/homezy-credits-expire.log 2>&1
```

### Option 2: Using BullMQ (Recommended for Scalability)

Add these jobs to your BullMQ worker:

```typescript
import { Queue } from 'bullmq';
import monthlyCreditsReset from './scripts/monthlyCreditsReset';
import creditExpiry from './scripts/creditExpiry';

// Define repeatable jobs
const creditsQueue = new Queue('credits', { connection: redisConnection });

// Monthly reset (1st of month at 00:01)
creditsQueue.add(
  'monthly-reset',
  {},
  {
    repeat: {
      pattern: '1 0 1 * *', // Cron pattern
    },
  }
);

// Daily expiry (02:00 daily)
creditsQueue.add(
  'credit-expiry',
  {},
  {
    repeat: {
      pattern: '0 2 * * *',
    },
  }
);

// Process jobs
creditsQueue.process('monthly-reset', async () => {
  return await monthlyCreditsReset();
});

creditsQueue.process('credit-expiry', async () => {
  return await creditExpiry();
});
```

### Option 3: Using Cloud Schedulers

**AWS EventBridge:**
- Create two scheduled rules with cron expressions
- Configure Lambda functions to execute the scripts

**Google Cloud Scheduler:**
- Create two Cloud Scheduler jobs
- Point to Cloud Functions that execute the scripts

---

## Testing

### Test Monthly Reset Locally

```bash
# 1. Start your development environment
npm run dev

# 2. In another terminal, run the reset script
npm run credits:reset
```

**Expected Output:**
```
Connected to MongoDB for monthly credits reset
Found X verified professionals for credit reset
Reset credits for professional: pro@example.com
...
Monthly credit reset completed: {
  success: true,
  totalProfessionals: X,
  successCount: X,
  errorCount: 0,
  errors: []
}
```

### Test Credit Expiry Locally

```bash
npm run credits:expire
```

**Expected Output:**
```
Connected to MongoDB for credit expiry job
Credit expiry job completed: {
  expiredTransactions: X,
  totalExpired: Y
}
```

---

## Monitoring & Alerts

**Recommended Monitoring:**

1. **Script Execution Logs:**
   - All scripts use Winston logger
   - Check logs at `server/logs/` for execution history

2. **Success Rate Tracking:**
   - Monitor `successCount` vs `errorCount` in script output
   - Set up alerts if `errorCount > 0`

3. **Database Checks:**
   - Query `CreditBalance.lastResetDate` to ensure resets are happening
   - Check `CreditTransaction` for `monthly_reset` and `expiry` types

4. **Email Notifications:**
   - Consider sending admin emails on script completion
   - Alert on failures or unexpected behavior

---

## Troubleshooting

**Issue: Script fails to connect to MongoDB**
- Check `MONGODB_URI` in `.env` file
- Ensure MongoDB is running and accessible

**Issue: No professionals found for reset**
- Verify professionals have `verificationStatus: 'basic'` or `'comprehensive'`
- Check User collection for verified professionals

**Issue: Credits not expiring**
- Verify `expiresAt` dates on `CreditTransaction` records
- Ensure purchased credits have `expiresAt` set (6 months from purchase)

**Issue: Transaction failures**
- Check MongoDB logs for errors
- Verify database indexes are created
- Ensure sufficient MongoDB connection pool size

---

## Future Enhancements

- [ ] Add email notifications to professionals when credits reset
- [ ] Send warning emails 7 days before credits expire
- [ ] Create dashboard for viewing script execution history
- [ ] Add Slack/Discord webhook notifications for admin alerts
- [ ] Implement retry logic with exponential backoff for failed resets

# Homezy Background Scripts

This directory contains background jobs and scripts for maintaining the Homezy platform.

## Credit System Overview

### Credit Rules:
- **Welcome Bonus:** One-time 20 free credits when a professional first accesses credits
- **Free Credit Expiry:** 3 months from account creation
- **Paid Credits:** Never expire
- **FIFO Deduction:** Free credits used first (if not expired), then paid credits (oldest first)

---

## Available Scripts

### 1. Credit Expiry

**File:** `creditExpiry.ts`

**Purpose:** Expires free credits that are 3 months old.

**Schedule:** Run daily at 02:00 UTC
**Cron Expression:** `0 2 * * *`

**Manual Execution:**
```bash
cd server
npm run credits:expire
```

**Details:**
- Finds all `CreditTransaction` records with:
  - `creditType: 'free'`
  - `remainingAmount > 0`
  - `expiresAt <= now`
- Deducts expired credits from professional balances
- Creates `expiry` transaction records
- Updates `remainingAmount` to 0 for expired transactions

**Note:** Paid credits never expire and are not processed by this job.

---

### 2. Test Credits

**File:** `testCredits.ts`

**Purpose:** Test script to verify credit system functionality.

**Manual Execution:**
```bash
cd server
npm run credits:test
```

---

## Setup for Production

### Option 1: Using Cron Jobs (Linux/Unix)

1. Open crontab:
```bash
crontab -e
```

2. Add the following entry:
```bash
# Daily credit expiry (every day at 02:00 UTC)
0 2 * * * cd /path/to/homezy/server && npm run credits:expire >> /var/log/homezy-credits-expire.log 2>&1
```

### Option 2: Using BullMQ (Recommended for Scalability)

Add the job to your BullMQ worker:

```typescript
import { Queue } from 'bullmq';
import creditExpiry from './scripts/creditExpiry';

// Define repeatable jobs
const creditsQueue = new Queue('credits', { connection: redisConnection });

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
creditsQueue.process('credit-expiry', async () => {
  return await creditExpiry();
});
```

### Option 3: Using Cloud Schedulers

**AWS EventBridge:**
- Create a scheduled rule with cron expression
- Configure Lambda function to execute the script

**Google Cloud Scheduler:**
- Create a Cloud Scheduler job
- Point to Cloud Function that executes the script

---

## Testing

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

### Test Credit System

```bash
npm run credits:test
```

**Expected Output:**
```
CREDIT SYSTEM TEST
============================================================
Professional: pro@example.com
...
Final Balance: 17 credits
  - Free: 17 (expires in 3 months from creation)
  - Paid: 0 (never expires)
============================================================
All tests passed!
```

---

## Monitoring & Alerts

**Recommended Monitoring:**

1. **Script Execution Logs:**
   - All scripts use Winston logger
   - Check logs at `server/logs/` for execution history

2. **Success Rate Tracking:**
   - Monitor expired transaction counts
   - Set up alerts on unexpected behavior

3. **Database Checks:**
   - Query `CreditTransaction` for `expiry` type transactions
   - Check `expiresAt` dates for upcoming expirations

4. **Email Notifications:**
   - Consider sending admin emails on script completion
   - Alert on failures or unexpected behavior

---

## Troubleshooting

**Issue: Script fails to connect to MongoDB**
- Check `MONGODB_URI` in `.env` file
- Ensure MongoDB is running and accessible

**Issue: Credits not expiring**
- Verify `expiresAt` dates on `CreditTransaction` records
- Ensure free credits have `expiresAt` set (3 months from creation)

**Issue: Transaction failures**
- Check MongoDB logs for errors
- Verify database indexes are created
- Ensure sufficient MongoDB connection pool size

---

## Future Enhancements

- [ ] Send warning emails 7 days before free credits expire
- [ ] Create dashboard for viewing script execution history
- [ ] Add Slack/Discord webhook notifications for admin alerts
- [ ] Implement retry logic with exponential backoff for failed operations

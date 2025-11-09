# Railway Deployment Guide for Homezy

This guide walks you through deploying the Homezy client and server to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- Railway CLI (optional but recommended): `npm install -g @railway/cli`
- **MongoDB Atlas account** (recommended - sign up at https://www.mongodb.com/cloud/atlas/register)
- Redis instance (Railway Redis plugin recommended)
- Required third-party accounts:
  - Stripe (for payments)
  - Cloudinary (for image uploads)
  - Anthropic (for AI features)
  - Brevo (for email)

## Architecture

The Homezy application consists of two services:
1. **Server**: Express.js API (Node.js)
2. **Client**: Next.js frontend

Both services will be deployed as separate Railway services.

## Step 1: Create Railway Project

1. Go to https://railway.app and create a new project
2. Choose "Empty Project"
3. Name your project (e.g., "homezy")

## Step 2: Set Up MongoDB Atlas (Recommended)

### Why Atlas over Railway MongoDB?
MongoDB Atlas is recommended for Homezy because:
- **Free tier** - M0 cluster with 512MB (perfect for development/staging)
- **Production-grade** - Built for reliability with automated backups
- **Advanced features** - Atlas Search for property searches, performance monitoring
- **Scalability** - Easy to upgrade as your app grows
- **Point-in-time recovery** - Critical for apps with payments and user data

### Create MongoDB Atlas Cluster

1. **Sign up for MongoDB Atlas**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Create a free account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose **M0 (Free)** tier for development/staging
   - Select a cloud provider (AWS, GCP, or Azure)
   - Choose a region **close to your Railway region** for lowest latency
   - Name your cluster (e.g., "homezy-dev" or "homezy-prod")
   - Click "Create"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `homezy-app` (or your preference)
   - Click "Autogenerate Secure Password" and **save it securely**
   - Database User Privileges: Select "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access From Anywhere" (Railway uses dynamic IPs)
   - IP Address: `0.0.0.0/0`
   - Comment: "Railway deployment"
   - Click "Confirm"

   **Security Note:** For production, consider using MongoDB's private endpoints or VPC peering for enhanced security.

5. **Get Connection String**
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: **Node.js**, Version: **5.5 or later**
   - Copy the connection string (looks like):
   ```
   mongodb+srv://homezy-app:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your database user password
   - Add database name before the `?`: `...mongodb.net/homezy?retryWrites=true...`
   - Final format: `mongodb+srv://homezy-app:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/homezy?retryWrites=true&w=majority`

### Alternative: Railway MongoDB

If you prefer simplicity over features:

1. Click "+ New" → "Database" → "Add MongoDB"
2. Note the `MONGO_URL` that Railway generates
3. Copy this value for use in the server environment variables

**Note:** Railway MongoDB is fine for small hobby projects but lacks the features and reliability of Atlas.

## Step 3: Set Up Redis

1. Click "+ New" → "Database" → "Add Redis"
2. Note the connection details Railway provides:
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD`
3. Save these for the server environment variables

## Step 4: Deploy the Server

### Create Server Service
1. Click "+ New" → "GitHub Repo"
2. Connect your homezy repository
3. Configure service:
   - **Root Directory**: `/server`
   - **Build Command**: (Railway will auto-detect from package.json)
   - **Start Command**: `npm start`

### Configure Server Environment Variables

Add the following environment variables in the Railway dashboard:

#### Server Configuration
```
NODE_ENV=production
PORT=5000
API_VERSION=v1
```

**Note:** Railway will automatically set the `PORT` environment variable. You can use 5000 or leave it to Railway's default. For local development, use port 5001 to avoid conflicts with macOS AirPlay (which uses port 5000).

#### Database
```
MONGODB_URI=<your-mongodb-atlas-connection-string>
```

Example:
```
MONGODB_URI=mongodb+srv://homezy-app:YourSecurePassword123@cluster0.xxxxx.mongodb.net/homezy?retryWrites=true&w=majority
```

**Important:**
- Use the connection string from Atlas (Step 2)
- Ensure you replaced `<password>` with your actual database user password
- Add `/homezy` (or your database name) before the `?` in the connection string

#### Redis
```
REDIS_HOST=<redis-host-from-railway>
REDIS_PORT=<redis-port-from-railway>
REDIS_PASSWORD=<redis-password-from-railway>
```

#### JWT & Security
```
JWT_ACCESS_SECRET=<generate-random-32-char-string>
JWT_REFRESH_SECRET=<generate-random-32-char-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
COOKIE_SECRET=<generate-random-32-char-string>
```

**Generate secrets using:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### CORS
```
CORS_ORIGIN=<your-client-railway-url>
```
Note: Update this after deploying the client

#### Stripe
```
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
```

#### Cloudinary
```
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

#### Anthropic AI
```
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

#### Email (Brevo)
```
BREVO_API_KEY=<your-brevo-api-key>
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Homezy
```

#### Optional Configuration
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
```

### Deploy Server
1. Railway will automatically deploy when you push to your repository
2. Note the server URL (e.g., `https://homezy-server.railway.app`)

## Step 5: Deploy the Client

### Create Client Service
1. Click "+ New" → "GitHub Repo"
2. Select the same homezy repository
3. Configure service:
   - **Root Directory**: `/client`
   - **Build Command**: (Railway will auto-detect from package.json)
   - **Start Command**: `npm start`

### Configure Client Environment Variables

Add the following environment variables:

```
NEXT_PUBLIC_API_URL=<your-server-railway-url>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
NEXT_PUBLIC_SITE_URL=<your-client-railway-url>
```

Note: The `NEXT_PUBLIC_SITE_URL` will be updated after the first deployment.

### Deploy Client
1. Railway will automatically deploy
2. Note the client URL (e.g., `https://homezy.railway.app`)

## Step 6: Update Environment Variables

### Update Server CORS_ORIGIN
1. Go to the server service settings
2. Update `CORS_ORIGIN` with your client URL from Step 4
3. Redeploy the server

### Update Client NEXT_PUBLIC_SITE_URL
1. Go to the client service settings
2. Update `NEXT_PUBLIC_SITE_URL` with the actual client URL
3. Redeploy the client

## Step 7: Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter: `<your-server-railway-url>/api/v1/webhooks/stripe`
4. Select events to listen for (payment_intent.*, customer.*, etc.)
5. Copy the webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Railway server environment variables
7. Redeploy the server

## Step 8: Custom Domain (Optional)

### For Client
1. Go to client service settings → Domains
2. Click "Custom Domain"
3. Add your domain (e.g., `homezy.com`)
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_SITE_URL` with your custom domain
6. Update server's `CORS_ORIGIN` with your custom domain

### For Server
1. Go to server service settings → Domains
2. Click "Custom Domain"
3. Add your API subdomain (e.g., `api.homezy.com`)
4. Update DNS records as instructed
5. Update client's `NEXT_PUBLIC_API_URL` with your custom API domain

## Monitoring & Logs

- View logs in Railway dashboard for each service
- Set up health check endpoints (already configured in Dockerfile)
- Monitor resource usage in Railway metrics

## Troubleshooting

### Build Failures

**Client build fails:**
- Ensure all `NEXT_PUBLIC_*` environment variables are set
- Check that `output: 'standalone'` is set in `next.config.ts`

**Server build fails:**
- Verify all required environment variables are set
- Check TypeScript compilation errors in logs

### Runtime Issues

**Server connection errors:**
- Verify MongoDB and Redis connection strings
- Check that services are running in Railway dashboard
- Review server logs for specific error messages

**Client can't connect to server:**
- Verify `NEXT_PUBLIC_API_URL` points to correct server URL
- Check server CORS settings allow client domain
- Ensure server is running and healthy

### Environment Variables Not Loading
- Rebuild the application after adding/updating env vars
- For Next.js, ensure variables start with `NEXT_PUBLIC_` for client-side access
- Check Railway logs to see which environment variables are being used during build

## MongoDB Atlas Best Practices

### For Development/Staging
- Use **M0 (Free)** cluster - completely free forever
- Single region deployment
- 512MB storage is sufficient for development

### For Production
- Upgrade to **M10** cluster (~$57/month) minimum for:
  - Dedicated resources
  - Automated backups
  - Point-in-time recovery
  - Better performance
- Enable automated backups
- Set up alerts for storage, connections, and performance
- Consider multi-region deployment for high availability

### Monitoring
- Use Atlas performance monitoring dashboard
- Set up alerts for:
  - High connection count
  - Slow queries
  - Storage approaching limit
- Review Query Profiler for optimization opportunities

### Backup Strategy
- Atlas M10+ includes continuous backups
- Set retention period (default: 2 days, can extend to 365 days)
- Test restore process periodically
- For M0 clusters, use `mongodump` for manual backups

## Cost Optimization

### Railway
- Use Railway's free tier for development ($5 credit/month)
- Monitor usage to avoid unexpected charges
- Consider scaling settings based on traffic
- Set up budget alerts in Railway dashboard

### MongoDB Atlas
- **Development**: Use M0 (Free) cluster - $0/month
- **Production**: Start with M10 - $57/month (monthly billing)
- **Scaling**: Easy to upgrade/downgrade based on needs
- **Cost-saving tips**:
  - Pause development clusters when not in use
  - Start with single-region deployment
  - Monitor and optimize slow queries
  - Set up storage alerts before hitting limits

## Security Checklist

### Application Security
- [ ] All secrets are stored as environment variables (not in code)
- [ ] JWT secrets are at least 32 characters
- [ ] CORS is properly configured with specific origins (not `*`)
- [ ] Stripe webhook secret is configured
- [ ] Production NODE_ENV is set
- [ ] Rate limiting is enabled
- [ ] All API keys are valid and active

### MongoDB Atlas Security
- [ ] Database user has minimum required privileges (not admin)
- [ ] Strong password for database user (20+ characters)
- [ ] Network access properly configured
- [ ] Consider VPC peering or private endpoints for production
- [ ] Enable audit logs (available on M10+)
- [ ] Regular security patching (automatic with Atlas)
- [ ] Encryption at rest enabled (default on Atlas)
- [ ] Encryption in transit with TLS/SSL (default)

## Deployment Workflow

1. Make changes to your code locally
2. Test locally with `docker-compose up`
3. Commit and push to GitHub
4. Railway automatically deploys the changes
5. Monitor deployment in Railway dashboard
6. Verify functionality in production

## Database Migration (Moving from Railway MongoDB to Atlas)

If you started with Railway MongoDB and want to migrate to Atlas:

1. **Export data from Railway MongoDB**
   ```bash
   mongodump --uri="<railway-mongodb-url>" --out=./backup
   ```

2. **Import to Atlas**
   ```bash
   mongorestore --uri="<atlas-connection-string>" ./backup
   ```

3. **Update environment variables** in Railway with new Atlas connection string

4. **Test thoroughly** before removing Railway MongoDB

5. **Remove Railway MongoDB** service once confirmed working

## Support

### Railway
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app

### MongoDB Atlas
- Atlas Documentation: https://docs.atlas.mongodb.com/
- Community Forums: https://www.mongodb.com/community/forums/
- Atlas Support: Available in the Atlas dashboard

### Homezy Application
- Check application logs in Railway dashboard
- Review MongoDB Atlas performance advisor
- Check MongoDB Atlas alerts for database issues

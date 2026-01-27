# Deployment Guide

This guide covers deploying both the Next.js backend and the Expo app.

## Architecture Overview

- **Next.js Backend** (`apps/nextjs`): API server with tRPC endpoints, deployed to Vercel
- **Expo App** (`apps/expo`): Mobile app (iOS/Android) and web, deployed via EAS Build/Update

## Step 1: Deploy Next.js Backend to Vercel

### Prerequisites
- Vercel account (https://vercel.com)
- PostgreSQL database (Railway, Supabase, or similar)
- All environment variables configured

### Deployment Steps

1. **Connect Repository to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub/GitLab repository
   - Select the repository

2. **Configure Project Settings**
   - **Root Directory**: `apps/nextjs` (or leave as root if using Vercel's monorepo detection)
   - **Framework Preset**: Next.js
   - **Build Command**: `cd ../.. && pnpm install && pnpm db:generate && pnpm build --filter=nextjs`
   - **Install Command**: `pnpm install` (from root)
   - **Output Directory**: `apps/nextjs/.next` (or `.next` if root is `apps/nextjs`)
   
   **Alternative (if Vercel detects monorepo automatically):**
   - **Root Directory**: Leave as repository root
   - **Build Command**: `pnpm install && pnpm db:generate && pnpm build --filter=nextjs`
   - **Output Directory**: `apps/nextjs/.next`

3. **Environment Variables**
   Add all required environment variables in Vercel dashboard:
   ```
   # Database
   POSTGRES_URL=your_postgres_url
   POSTGRES_PRISMA_URL=your_prisma_url
   POSTGRES_URL_NON_POOLING=your_non_pooling_url
   
   # Clerk
   CLERK_SECRET_KEY=your_clerk_secret
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_WEBHOOK_SIGNING_SECRET=your_webhook_secret
   
   # ImageKit
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   
   # Other
   NODE_ENV=production
   NEXT_PUBLIC_WEB_URL=https://your-domain.vercel.app
   ```

4. **Run Database Migrations**
   After first deployment, run database migrations:
   ```bash
   # Option 1: Via Vercel CLI (if you have it installed)
   vercel env pull .env.local
   pnpm db:push
   
   # Option 2: Via Vercel dashboard
   # Go to your project → Settings → Environment Variables
   # Then run migrations manually or use a migration service
   ```
   
   **Important**: Make sure `POSTGRES_URL` and `POSTGRES_PRISMA_URL` are set correctly in Vercel.

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your deployment URL (e.g., `https://startracker.vercel.app`)

6. **Verify Deployment**
   - Visit `https://your-domain.vercel.app/api/trpc/auth.user.me`
   - Should return a response (even if error, means API is working)
   - Check admin panel: `https://your-domain.vercel.app/admin`

## Step 2: Deploy Expo App

### Option A: Mobile Apps (iOS/Android) via EAS Build

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS** (if not already done)
   ```bash
   cd apps/expo
   eas build:configure
   ```

4. **Set Production API URL**
   Update `apps/expo/.env` or set in EAS:
   ```bash
   EXPO_PUBLIC_API_URL=https://your-domain.vercel.app
   EXPO_PUBLIC_ENV=production
   ```

5. **Build for Production**
   ```bash
   # Build for iOS
   eas build --platform ios --profile production
   
   # Build for Android
   eas build --platform android --profile production
   
   # Build for both
   eas build --platform all --profile production
   ```

6. **Submit to App Stores**
   ```bash
   # Submit iOS to App Store
   eas submit --platform ios
   
   # Submit Android to Google Play
   eas submit --platform android
   ```

### Option B: Web Deployment (PWA/Web App)

1. **Build Web Version**
   ```bash
   cd apps/expo
   EXPO_PUBLIC_API_URL=https://your-domain.vercel.app \
   EXPO_PUBLIC_ENV=production \
   pnpm build:web
   ```

2. **Deploy Web Build**
   - The build output will be in `apps/expo/web-build/`
   - Deploy this folder to:
     - **Vercel**: Create a new project pointing to `apps/expo/web-build`
     - **Netlify**: Drag and drop the `web-build` folder
     - **Any static hosting**: Upload the contents of `web-build`

3. **Configure Web Deployment**
   - Set `EXPO_PUBLIC_API_URL` to your Next.js backend URL
   - Ensure CORS is properly configured (already done in `apps/nextjs/src/app/api/trpc/[trpc]/route.ts`)

## Step 3: Environment Variables Summary

### Next.js (Vercel)
All variables from `.env` that start with:
- `POSTGRES_*`
- `CLERK_*`
- `STRIPE_*`
- `IMAGEKIT_*`
- `NEXT_PUBLIC_*`

### Expo (EAS)
Set via `eas secret:create` or in `eas.json`:
```bash
cd apps/expo
eas secret:create --name EXPO_PUBLIC_API_URL --value https://your-domain.vercel.app
eas secret:create --name EXPO_PUBLIC_ENV --value production
eas secret:create --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value your_clerk_key
```

## Step 4: Post-Deployment Checklist

### Next.js Backend
- [ ] Next.js backend is accessible at production URL
- [ ] tRPC API endpoints are working (`/api/trpc/*`)
- [ ] Database migrations are applied (`pnpm db:push`)
- [ ] Admin panel is accessible (`/admin`)
- [ ] Webhooks (Stripe) are configured with production URL
- [ ] All environment variables are set in Vercel dashboard
- [ ] CORS is configured correctly (already done in code)

### Expo App
- [ ] `EXPO_PUBLIC_API_URL` is set to production backend URL
- [ ] `EXPO_PUBLIC_ENV` is set to `production`
- [ ] EAS secrets are configured (if using EAS Build)
- [ ] App can connect to production API
- [ ] Push notifications are configured (if applicable)

## Troubleshooting

### Next.js Deployment Issues
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure database is accessible from Vercel
- Check `next.config.mjs` for any build issues

### Expo Deployment Issues
- Verify `EXPO_PUBLIC_API_URL` is set correctly
- Check EAS build logs
- Ensure API is accessible from mobile devices
- Verify CORS headers are correct

### API Connection Issues
- Test API endpoint directly: `https://your-domain.vercel.app/api/trpc/auth.user.me`
- Check CORS configuration
- Verify environment variables match between frontend and backend
- Check network requests in browser/mobile dev tools

## Quick Deploy Commands

```bash
# Deploy Next.js (via Vercel CLI or Git push)
vercel --prod

# Deploy Expo update (OTA update)
cd apps/expo
EXPO_PUBLIC_API_URL=https://your-domain.vercel.app eas update --branch production

# Build and submit Expo app
cd apps/expo
eas build --platform all --profile production
eas submit --platform all
```

# Star Tracker Project Guide

## 📱 Project Overview

**Star Tracker** is a social media platform that connects "Stars" (content creators/celebrities) with "Star Trackers" (fans/followers). It's built as a **monorepo** using **Turborepo** and contains two main applications:

### 1. **Expo App** (Mobile - iOS & Android)
- **Location**: `apps/expo/`
- **Type**: React Native mobile application
- **Purpose**: The main mobile app for users to:
  - Follow and track their favorite stars
  - View exclusive content from stars
  - Subscribe to star profiles (paid subscriptions)
  - Create and share posts and stories
  - Purchase event packages
  - React to content (hearts, smiles, stars)

### 2. **Next.js App** (Web - Admin Dashboard)
- **Location**: `apps/nextjs/`
- **Type**: Next.js web application
- **Purpose**: Admin dashboard and web interface for:
  - User management
  - Content moderation (flagging inappropriate content)
  - Admin controls
  - Preview pages for mobile app
  - Checkout flows
  - Profile viewing

## 🏗️ Project Architecture

This is a **Turborepo monorepo** with the following structure:

```
Startracker-2-Chefry/
├── apps/
│   ├── expo/          # Mobile app (React Native)
│   └── nextjs/        # Web app (Next.js)
├── packages/
│   ├── api/           # tRPC API router (shared backend)
│   ├── db/            # Prisma database schema & client
│   └── config/        # Shared configs (ESLint, Tailwind)
└── package.json       # Root package with workspace scripts
```

### Key Technologies:
- **Frontend**: React 19, React Native, Expo SDK 53
- **Backend**: Next.js API routes with tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Clerk (for both apps)
- **Payments**: Stripe
- **Styling**: Tailwind CSS / NativeWind
- **Package Manager**: pnpm
- **Build System**: Turborepo

## 🚀 Getting Started

### Prerequisites

1. **Node.js**: Version >= 22.19.0
2. **pnpm**: Version >= 10.15.1
   ```bash
   npm install -g pnpm@10.15.1
   ```
3. **PostgreSQL Database**: You'll need a PostgreSQL database
4. **Xcode** (for iOS development on macOS)
5. **Android Studio** (for Android development)

### Step 1: Install Dependencies

```bash
# From the project root
pnpm install
```

### Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and configure the following variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `CLERK_SECRET_KEY` - From Clerk dashboard
   - `CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
   - `STRIPE_SECRET_KEY` - From Stripe dashboard
   - `STRIPE_WEBHOOK_SIGNING_SECRET` - From Stripe dashboard
   - `IMAGEKIT_PUBLIC_KEY` - From ImageKit dashboard
   - `IMAGEKIT_PRIVATE_KEY` - From ImageKit dashboard
   - `POSTMARK_API_KEY` - For email sending
   - `EXPO_PUBLIC_API_URL` - Your API URL (e.g., `http://localhost:3000` for dev)
   - `NEXT_PUBLIC_WEB_URL` - Your web app URL

### Step 3: Set Up Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (creates tables)
pnpm db:push

# Optional: Open Prisma Studio to view/edit data
pnpm db:studio
```

### Step 4: Run the Applications

#### Option A: Run Both Apps Together (Recommended for Development)

```bash
# From project root - runs both apps in parallel
pnpm dev
```

This will:
- Start Next.js on `http://localhost:3000`
- Start Expo dev server (you can then press `i` for iOS or `a` for Android)

#### Option B: Run Apps Separately (Better for Debugging)

**Terminal 1 - Next.js (Web App):**
```bash
pnpm dev:nextjs
# or
cd apps/nextjs
pnpm dev
```
Access at: `http://localhost:3000`

**Terminal 2 - Expo (Mobile App):**
```bash
pnpm dev:expo
# or
cd apps/expo
pnpm dev
```

Then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on your phone

## 📱 Running the Expo App

### For iOS (macOS only):

1. **Using iOS Simulator:**
   ```bash
   cd apps/expo
   pnpm dev
   # Then press 'i' when prompted
   ```

2. **On Physical Device:**
   ```bash
   cd apps/expo
   pnpm start:ios
   ```

### For Android:

1. **Using Android Emulator:**
   - Make sure Android Studio is installed and emulator is running
   ```bash
   cd apps/expo
   pnpm dev:android
   ```

2. **On Physical Device:**
   ```bash
   cd apps/expo
   pnpm start:android
   ```

### Development vs Production Mode:

- **Development mode** (default): `pnpm dev`
- **Production mode**: `pnpm dev:prod` (uses production API URL)

## 🌐 Running the Next.js App

```bash
# From root
pnpm dev:nextjs

# Or from apps/nextjs
cd apps/nextjs
pnpm dev
```

The app will be available at `http://localhost:3000`

## 📦 Available Scripts

### Root Level Scripts:

```bash
pnpm dev              # Run both apps in parallel
pnpm dev:nextjs       # Run only Next.js app
pnpm dev:expo         # Run only Expo app
pnpm build            # Build all apps
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Prisma Studio
pnpm lint             # Lint all packages
pnpm type-check       # Type check all packages
```

### Expo App Scripts:

```bash
cd apps/expo
pnpm dev              # Start Expo dev server (iOS)
pnpm dev:android      # Start Expo dev server (Android)
pnpm dev:prod         # Start in production mode
pnpm ios              # Run on iOS device/simulator
pnpm android          # Run on Android device/emulator
```

### Next.js App Scripts:

```bash
cd apps/nextjs
pnpm dev              # Start Next.js dev server
pnpm build            # Build for production
pnpm start            # Start production server
```

## 🔧 Key Features

### Mobile App (Expo):
- User authentication (Clerk)
- Feed with posts and stories
- User profiles (Stars and Star Trackers)
- Follow/unfollow users
- Subscribe to stars (paid subscriptions via Stripe)
- Create posts with images/videos
- Create stories
- React to posts (heart, smile, star)
- Purchase event packages
- Push notifications
- Image/video uploads via ImageKit

### Web App (Next.js):
- Admin dashboard
- User management
- Content moderation (flag inappropriate content)
- User privilege management
- Preview pages for mobile app
- Checkout flows
- Profile viewing

## 🗄️ Database

The project uses **PostgreSQL** with **Prisma ORM**. Key models include:

- **User**: Users (Stars and Star Trackers)
- **Post**: User posts with media
- **Story**: Temporary stories (like Instagram stories)
- **UserFollow**: Follow relationships and subscriptions
- **EventPackage**: Paid content packages
- **ContentFlag**: Reported content
- **Media**: Images and videos

## 🔐 Authentication

Both apps use **Clerk** for authentication:
- OAuth providers (Google, Apple, etc.)
- Email/password authentication
- Session management

## 💳 Payments

**Stripe** is integrated for:
- Star subscriptions (recurring payments)
- Event package purchases
- Connected accounts for stars to receive payments

## 📸 Media Storage

**ImageKit** is used for:
- Image and video uploads
- Image optimization
- CDN delivery

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Error:**
   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Run `pnpm db:push` to create tables

2. **Expo App Won't Start:**
   - Make sure you have Xcode installed (for iOS)
   - For Android, ensure Android Studio and emulator are set up
   - Try clearing cache: `cd apps/expo && pnpm clean`

3. **Port Already in Use:**
   - Next.js uses port 3000 by default
   - Expo uses port 8081
   - Kill processes using these ports or change them

4. **Module Not Found Errors:**
   - Run `pnpm install` from root
   - Clear node_modules: `pnpm clean` then `pnpm install`

5. **TypeScript Errors:**
   - Run `pnpm db:generate` to regenerate Prisma client
   - Run `pnpm type-check` to see all type errors

## 📚 Additional Resources

- [Turborepo Docs](https://turborepo.org/docs)
- [Expo Docs](https://docs.expo.dev/)
- [Next.js Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)

## 🚢 Deployment

### Next.js (Vercel):
- Deploy the `apps/nextjs` folder to Vercel
- Set environment variables in Vercel dashboard
- The Next.js app must be deployed for the Expo app to work in production

### Expo (App Stores):
- Use EAS Build: `cd apps/expo && eas build`
- Submit to stores: `eas submit`
- Use EAS Update for OTA updates: `eas update`

## 📝 Notes

- The Expo app connects to the Next.js API in production
- Make sure `EXPO_PUBLIC_API_URL` points to your deployed Next.js app
- Both apps share the same database
- The `packages/api` contains tRPC routers that are used by both apps

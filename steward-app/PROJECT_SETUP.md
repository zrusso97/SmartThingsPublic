# Steward: The Civic Maintenance Engine - Project Setup

## Project Directory Structure

```
steward-app/
├── src/
│   ├── screens/
│   │   ├── AuthScreen.tsx          # Sign-up / Login
│   │   ├── MapScreen.tsx           # Home - interactive map with task pins
│   │   ├── TaskDetailScreen.tsx    # View task details
│   │   ├── CreateTaskScreen.tsx    # Form to create a new task
│   │   ├── ProofOfWorkScreen.tsx   # Upload before/after photos
│   │   └── ProfileScreen.tsx       # User profile + Civic Credits wallet
│   ├── components/
│   │   ├── TaskPin.tsx             # Custom map marker (color-coded by effort)
│   │   ├── TaskCard.tsx            # Task summary card
│   │   ├── PhotoUploader.tsx       # Camera/gallery photo picker
│   │   └── CreditsBadge.tsx        # Displays civic credits count
│   ├── navigation/
│   │   └── AppNavigator.tsx        # React Navigation stack + tab setup
│   ├── services/
│   │   ├── supabase.ts             # Supabase client initialization
│   │   ├── auth.ts                 # Auth helper functions
│   │   ├── tasks.ts                # Task CRUD operations
│   │   └── submissions.ts          # Submission/proof-of-work operations
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth state hook
│   │   └── useTasks.ts             # Tasks data fetching hook
│   ├── utils/
│   │   └── helpers.ts              # Shared utility functions
│   ├── constants/
│   │   └── theme.ts                # Colors, effort levels, point tiers
│   └── assets/                     # Static images, icons
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema migration
├── app.json                        # Expo configuration
├── App.tsx                         # Root component
├── babel.config.js                 # Babel config (NativeWind)
├── tailwind.config.js              # Tailwind/NativeWind config
├── nativewind-env.d.ts             # NativeWind type declarations
├── tsconfig.json                   # TypeScript config
└── package.json
```

## Step 1: Terminal Commands to Initialize the Project

Run these commands in order from the repo root:

```bash
# 1. Create the Expo project with TypeScript template
npx create-expo-app@latest steward-app --template blank-typescript

# 2. Navigate into the project
cd steward-app

# 3. Install core navigation
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context

# 4. Install mapping
npx expo install react-native-maps

# 5. Install Supabase client
npm install @supabase/supabase-js

# 6. Install async storage (for Supabase auth persistence)
npx expo install @react-native-async-storage/async-storage

# 7. Install image picker (for before/after photos)
npx expo install expo-image-picker

# 8. Install location services (for getting user position)
npx expo install expo-location

# 9. Install NativeWind (Tailwind for React Native)
npm install nativewind
npm install --save-dev tailwindcss@3.3.2

# 10. Install additional UI helpers
npx expo install expo-linear-gradient
npm install react-native-uuid

# 11. Initialize Tailwind config
npx tailwindcss init
```

### Environment Variables

Create a `.env` file in `steward-app/` (do NOT commit this):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Project Setup

1. Go to https://supabase.com and create a new project
2. Copy the **Project URL** and **anon/public key** from Settings > API
3. Paste them into your `.env` file
4. Enable **Email Auth** under Authentication > Providers
5. Create a **Storage bucket** called `task-photos` (set to public)
6. Run the migration SQL from `supabase/migrations/001_initial_schema.sql`

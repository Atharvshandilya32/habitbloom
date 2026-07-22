# Firebase Configuration Guide

## Getting Your Firebase Credentials

Follow these steps to set up Firebase for your HabitBloom app:

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Name it (e.g., "HabitBloom")
4. Complete the setup wizard

### 2. Create a Web App
1. In your Firebase project, click "Add app" → "Web"
2. Register your app with a nickname (e.g., "HabitBloom Web")
3. Copy the Firebase config object

### 3. Enable Realtime Database
1. In Firebase Console, go to **Realtime Database** (left sidebar)
2. Click "Create Database"
3. Start in **test mode** (for development)
4. Choose location (closest to you)

### 4. Enable Authentication
1. Go to **Authentication** (left sidebar)
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method (optional but recommended)

### 5. Set Up Environment Variables
1. In the root of your project, create a file named `.env.local`
2. Copy your Firebase config values into it:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

3. Replace the values with your actual Firebase config
4. **IMPORTANT:** Don't commit `.env.local` to git (it's in .gitignore)

### 6. Test the Connection
Run your app:
```bash
npm run dev
```

Your HabitBloom app is now connected to Firebase!

## Current Implementation

- ✅ **Weekly Goals**: Set targets for the current week
- ✅ **Monthly Goals**: Set targets for the current month
- ✅ **Goal Tracking**: Automatic progress calculation based on logged habits
- ✅ **localStorage**: Goals saved locally by default
- 🔄 **Firebase Integration**: Coming soon for cloud sync and multi-device support

## Next Steps (Optional)

Once you're comfortable with the basics, you can:
1. Integrate Firebase Realtime Database for cloud storage
2. Add user authentication for multi-device sync
3. Deploy to Firebase Hosting (free tier available)

## Deploying to Vercel

If you deploy this project to Vercel, remember that `.env.local` is ignored by Git and will not be uploaded. You **must** manually configure your Firebase credentials under **Project Settings > Environment Variables** on the Vercel dashboard.

Ensure you include all 7 keys:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`

> [!WARNING]
> If these variables are not configured in Vercel, the Firebase SDK will fail to initialize. The app will fallback to local storage mode, and the login page will not redirect properly or display a configuration error.

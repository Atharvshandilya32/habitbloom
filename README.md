# HabitBloom 3.0 🌱

HabitBloom is a premium, performance-optimized, and highly accessible habit tracking platform built with Next.js 15 and React 19. It goes beyond simple checkboxes, offering deep analytics, gamification, behavioral DNA insights, and social "Spaces".

## 🚀 What's New in 3.0?

The 3.0 release represents a massive architectural and design consolidation:
- **Unified Design System**: A cohesive visual language utilizing glassmorphism, tailored Tailwind gradients, and interactive Framer Motion micro-animations (`motionTokens`).
- **Performance Optimizations**: Aggressive React memoization (`React.memo`, `useCallback`) and `next/dynamic` lazy-loading for complex statistical views.
- **Accessibility First**: Full keyboard navigation support (`Tab`, `Enter`, `Space`) and ARIA semantics integrated into all custom interactive elements and grid cells.
- **Deep Analytics Ecosystem**: 
  - **Habit Garden**: Watch your habits literally bloom into beautiful flowers as you maintain streaks.
  - **Behavioral DNA**: Get categorized into unique personas based on your consistency and diversity.
  - **Future Projections**: See where your current trajectory will take you in 90 days or a year.
- **Spaces 2.0 & Social Hub**: 
  - Join **Shared Spaces** to collaborate on group habits, install templates, and track real-time activity.
  - Build your **Social Identity** (Digital ID Pass, Universe Levels) and compete on global leaderboards.
- **Production Hardened (Phase 7)**:
  - Robust **Offline-first Sync Engine** for seamless background mutations.
  - Granular **React Error Boundaries** per-tab.
  - Strictly typed Firebase Rules preventing unauthorized reads/writes and race conditions.

## Tech Stack

- **Frontend Core**: Next.js 15 (App Router), React 19, TypeScript
- **State & Data**: Firebase Realtime Database with robust Offline Sync queueing (`offlineSyncEngine.ts`)
- **Styling**: Tailwind CSS + Custom Design System (`designSystem.tsx`)
- **Animations**: Framer Motion & Canvas Confetti
- **UI Components**: Lucide React icons, Headless accessible components

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/atharvshandilya32/habitbloom.git
cd habitbloom

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:4028](http://localhost:4028) to view the application.

## Project Architecture

```
src/
├── app/
│   ├── components/        # React components (DashboardView, HabitGardenView, etc.)
│   ├── auth/              # Firebase Authentication wrappers
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Central Hub (Dynamic view orchestrator)
├── lib/
│   ├── motion/            # Framer motion presets (motionTokens.ts)
│   ├── designSystem.tsx   # Core design primitives
│   ├── bloomScoreUtils.ts # Gamification logic
│   ├── habitDnaUtils.ts   # Behavioral analytics engine
│   └── offlineSyncEngine.ts # Optimistic Firebase writes
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and import your GitHub repository.
3. **Configure Environment Variables**: Before clicking Deploy, expand the **Environment Variables** section and add your Firebase credentials:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
   
   > [!IMPORTANT]
   > Make sure the keys are named exactly as shown above (including the `NEXT_PUBLIC_` prefix) so they are exposed to the client-side browser runtime.
4. Click **Deploy**.

## License

MIT

## Author

[atharvshandilya32](https://github.com/atharvshandilya32)

---

Built with ❤️ for better, accessible habit tracking.

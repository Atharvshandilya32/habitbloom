# HabitBloom 🌱

A modern habit tracking web application built with Next.js and React. Track your daily habits, visualize progress, and build better routines.

## Features

- 📊 **Habit Dashboard** - Track multiple habits in one place
- 📈 **Progress Charts** - Visualize monthly trends and overall statistics
- 📅 **Calendar View** - See your habit completion history at a glance
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Fast & Modern** - Built with Next.js 15 and React 19

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **UI Components**: Lucide React, Heroicons
- **Notifications**: Sonner

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

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Project Structure

```
src/
├── app/
│   ├── components/        # React components
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── styles/                # Additional styles
└── lib/
    ├── habitTypes.ts      # TypeScript types
    └── habitUtils.ts      # Utility functions
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Click Deploy
5. Your site will be live!

## License

MIT

## Author

[atharvshandilya32](https://github.com/atharvshandilya32)

---

Built with ❤️ for better habit tracking

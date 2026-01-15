# KetoMate

**Smart keto, simplified.**

KetoMate is your intelligent keto companion. Automate meal planning with AI-powered recipe generation, track fasting windows, analyze meals with photo recognition, and monitor ketone levels — all in one place.

🌐 **Live Site:** [ketomate.co.za](https://ketomate.co.za)

## Features

- 🍳 **AI Recipe Generator** - Generate keto recipes from your available ingredients
- 📸 **Visual Meal Logger** - Snap a photo and get instant macro analysis
- ⏰ **Fasting Tracker** - Track intermittent fasting with cycle-aware insights
- 📊 **Ketone Monitoring** - Log and track your ketone readings over time
- 📓 **Daily Journal** - Keep notes on energy, mood, and health metrics
- 📈 **Monthly Reports** - Visualize your progress with comprehensive reports
- 👥 **Community Recipes** - Share and discover recipes from the KetoMate community

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI:** Google Gemini (via Vercel AI SDK)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google AI (Gemini) API key

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google AI (Gemini) API Key
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here

# Site URL (for SEO and sitemap generation)
NEXT_PUBLIC_SITE_URL=https://ketomate.co.za
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase-schema.sql` and `supabase-migrations.sql`
3. Enable authentication providers in Supabase dashboard

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

### Custom Domain (GoDaddy)

To connect your domain (e.g., ketomate.co.za):

1. In Vercel, go to Project Settings → Domains
2. Add your custom domain
3. In GoDaddy DNS settings, add the following records:
   - **A Record:** @ → 76.76.21.21
   - **CNAME Record:** www → cname.vercel-dns.com

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # User dashboard
│   ├── journal/           # Daily journal
│   ├── meals/             # Meal logging
│   ├── recipes/           # Recipe pages
│   └── reports/           # Monthly reports
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard widgets
│   ├── meals/            # Meal logging components
│   ├── navigation/       # Navigation menus
│   ├── recipes/          # Recipe components
│   ├── reports/          # Report visualizations
│   └── ui/               # Shadcn UI components
├── lib/                   # Utility functions
│   ├── actions/          # Server actions
│   ├── ai/               # AI integrations
│   ├── supabase/         # Supabase clients
│   └── utils/            # Helper functions
└── types/                 # TypeScript types
```

## License

© 2026 KetoMate. All rights reserved.

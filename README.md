# The Session

Find the best pint prices in Dublin. A crowdsourced web application for tracking pub prices, reviews, and deals across Dublin.

## Features

- **Price Tracking**: Track prices for Guinness, Heineken, Coors Light, Bulmers, Rockshore, and Orchard Thieves
- **Reviews**: Rate pubs on pint quality, ambience, food, staff, safety, and value
- **Deals**: Find happy hours and special offers
- **Map View**: See all pubs on an interactive map
- **Leaderboards**: Find the cheapest pints and top-rated pubs
- **User Accounts**: Register to submit prices and reviews

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database + Auth)
- **Maps**: Google Maps API
- **Hosting**: Vercel (recommended)

## Setup Instructions

### Prerequisites

1. [Node.js](https://nodejs.org/) (v18 or later)
2. A [Supabase](https://supabase.com/) account (free tier works)
3. A [Google Maps API](https://console.cloud.google.com/) key (optional, for map feature)

### 1. Install Dependencies

```bash
cd the-session
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to **Settings > API** and copy your:
   - Project URL
   - Anon/Public key

3. Run the database migrations:
   - Go to **SQL Editor** in Supabase
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run it
   - Then copy and run `supabase/migrations/002_seed_data.sql`

4. Enable Email Auth:
   - Go to **Authentication > Providers**
   - Ensure Email is enabled

5. (Optional) Enable Google Auth:
   - Go to **Authentication > Providers > Google**
   - Add your Google OAuth credentials

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com/) and import your repository
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional)

## Project Structure

```
the-session/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── pubs/               # Pub listing and detail pages
│   │   ├── deals/              # Deals page
│   │   ├── leaderboard/        # Leaderboards
│   │   ├── map/                # Map view
│   │   ├── auth/               # Login/Register pages
│   │   └── profile/            # User profile
│   ├── components/             # React components
│   ├── lib/                    # Utility functions and Supabase client
│   └── types/                  # TypeScript type definitions
├── supabase/
│   └── migrations/             # SQL migrations
└── public/                     # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License

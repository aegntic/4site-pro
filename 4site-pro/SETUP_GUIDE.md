# 4site.pro Setup Guide

This guide will help you set up the complete 4site.pro platform with authentication, viral mechanics, and database persistence.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Google Gemini API key
- (Optional) GitHub token for enhanced API access

## Quick Start

### 1. Clone and Install

```bash
cd 4site-pro/project4site_-github-readme-to-site-generator/
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Once created, go to Settings → API and copy:
   - Project URL
   - Anon/Public Key

3. Run the database schema:
   - Go to SQL Editor in Supabase dashboard
   - Create a new query
   - Copy and paste the entire contents of `database/schema.sql`
   - Run the query

4. Enable Authentication Providers:
   - Go to Authentication → Providers
   - Enable Email/Password
   - Enable GitHub OAuth (optional)
   - Enable Google OAuth (optional)

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your keys:
```env
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional but recommended
VITE_GITHUB_TOKEN=your_github_token
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit http://localhost:5173 to see your 4site.pro instance running!

## Features Overview

### 🔐 Authentication System
- Email/password signup and login
- OAuth with GitHub and Google
- User profiles and dashboard
- Tiered access control (Free/Pro/Business/Enterprise)

### 🚀 Enhanced Viral Mechanics
- "Powered by 4site.pro" footer on generated sites
- **Pro Showcase Grid**: 3x3 grid of top Pro projects ordered by viral score
- **Share Tracking**: External shares boost viral score and featuring likelihood
- **Lifetime Commissions**: 20% → 25% → 40% rates increasing over time
- **Free Pro Milestone**: 10 successful referrals = 12 months free Pro
- **Viral Score Algorithm**: Combines engagement, shares, time decay, and tier bonuses
- Referral tracking with unique codes
- Double-sided rewards (referrer and referred)
- Social sharing integrations (Twitter, LinkedIn, Facebook, Email)

### 💾 Database Features
- Persistent website storage
- Usage tracking and analytics
- Referral management
- A/B testing framework
- Row-level security for data protection

### 📊 Enhanced User Dashboard
- Manage generated websites
- View analytics and metrics  
- Track referral performance
- **Commissions Tab**: Lifetime earnings breakdown by tier (20%/25%/40%)
- **Free Pro Progress**: Visual progress toward 10-referral milestone
- **Viral Growth Metrics**: Share tracking and boost multipliers
- Account settings

## Testing the System

### 1. Create a Test Account
- Click "Sign Up" on the homepage
- Use any email (can be fake for testing)
- You'll start with a Free tier account

### 2. Generate a Website
- Enter any GitHub repository URL
- Choose "Quick Generation" mode
- Your site will be saved automatically

### 3. Test Referral System
- Go to Dashboard → Referrals
- Copy your referral link
- Open in incognito/private browser
- Sign up with the referral link
- Check your referral stats update

### 4. Test Viral Features
- Generate a website while logged in
- View the generated site
- Look for "Powered by 4site.pro" footer (free tier only)
- Scroll down to see the Pro Showcase Grid (3x3 grid)
- Test upgrading to Pro to see automatic featuring

### 5. Test Enhanced Viral Features
- Generate sites as both Free and Pro users
- Notice Pro users automatically get featured in showcase grid
- Test external sharing to boost viral score (every 5 shares triggers auto-featuring)
- Check commission earnings in new Commissions dashboard tab
- Track progress toward 10-referral free Pro milestone
- Free users see upgrade prompts and viral mechanics explanation
- Enterprise users can opt out of appearing in showcase

## Production Deployment

### 1. Build for Production
```bash
npm run build
```

### 2. Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### 3. Update Environment Variables
- Add production Supabase credentials
- Enable RLS policies in Supabase
- Configure custom domain

## Troubleshooting

### "Invalid API Key" Error
- Verify `VITE_GEMINI_API_KEY` is set correctly
- Make sure you're using `.env.local` not `.env`
- Restart the dev server after changing env vars

### Authentication Not Working
- Check Supabase URL and Anon Key are correct
- Verify the database schema was applied
- Check browser console for specific errors

### Referrals Not Tracking
- Ensure the `?ref=CODE` parameter is in the URL
- Check that cookies/localStorage are enabled
- Verify the referral code exists in the database

## Advanced Configuration

### Custom Branding
Edit these files to customize:
- `src/constants.ts` - App name and tagline
- `src/styles/glassmorphism.css` - UI theme
- `src/components/ui/NeuralBranding.tsx` - Logo placement

### Add New Templates
1. Create a new component in `src/components/templates/`
2. Import in `src/services/geminiService.ts`
3. Add to template selection logic

### Analytics Integration
1. Sign up for PostHog
2. Add `VITE_POSTHOG_API_KEY` to environment
3. Analytics will auto-track events

### Seed Demo Data
1. Run the demo data seeder: `database/seed_demo_data.sql`
2. This creates 9 sample Pro showcase sites with realistic metrics
3. Useful for testing the Pro Showcase Grid and viral features

### Test Viral Features
1. Run the viral features test: `database/test_viral_features.sql`
2. This tests viral score calculation, commission rates, and share tracking
3. Verifies the enhanced viral mechanics are working correctly

## Next Steps

1. **Customize Templates**: Add industry-specific templates
2. **Enhance Analytics**: Connect Google Analytics or Mixpanel
3. **Add Payment Processing**: Integrate Stripe for Pro subscriptions
4. **Deploy to Production**: Use Vercel or Netlify for hosting
5. **Monitor Performance**: Set up error tracking with Sentry

## Support

- GitHub Issues: [Report bugs and request features](https://github.com/yourusername/4site-pro/issues)
- Documentation: Check `/docs` folder for detailed API docs
- Community: Join our Discord for help and discussions

---

Built with ❤️ by the 4site.pro team. Happy building! 🚀
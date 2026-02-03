# The Session - Domain, Hosting & Deployment Guide

## 🌐 Domain Registration (.ie)

### Should You Buy a .ie Domain?

**YES - Absolutely!** Here's why:

1. **Local Trust**: .ie domains signal you're Irish → builds trust with Dublin users
2. **SEO Benefit**: Google Ireland ranks .ie domains higher for Irish searches
3. **Availability**: thesession.ie is likely available (unlike .com)
4. **Prestige**: .ie is harder to get (requires Irish presence) → more legitimate
5. **Brand Protection**: Prevents squatters

### How to Register a .ie Domain

**Registrar Options:**
- **Blacknight.com** (€39.99/year) - Irish registrar, best support
- **Register365.ie** (€29.99/year) - Good prices
- **GoDaddy.ie** (€34.99/year) - International option

**Requirements for .ie:**
You need ONE of these to prove "Irish connection":
- Irish business registration number (CRO)
- Irish VAT number
- Irish trademark
- Irish address (personal or business)
- Irish charity number (CHY)

**Process:**
1. Go to Blacknight.com (recommended)
2. Search "thesession.ie"
3. Add to cart (€39.99/year)
4. During checkout, provide proof of Irish connection:
   - If you have a business: Enter CRO number
   - If you're an individual: Provide Irish address + ID scan
5. Wait 1-5 days for IEDR approval
6. Domain is yours!

**Alternative if .ie is taken:**
- thesession.dublin (€79/year)
- thesessiondublin.ie
- sessionpubs.ie
- pintprices.ie

---

## 🚀 Hosting Options

### Option 1: Vercel (RECOMMENDED for MVP)

**Why Vercel:**
- ✅ Built for Next.js (your framework)
- ✅ FREE tier: 100GB bandwidth, unlimited deployments
- ✅ Auto-deploys from Git
- ✅ Global CDN (fast in Ireland)
- ✅ Zero config needed
- ✅ Great for startups

**Pricing:**
- **Hobby (FREE)**: 100GB bandwidth/month - good for 0-5k users
- **Pro (€20/month)**: Unlimited bandwidth - scales to 50k+ users
- **Enterprise**: Custom pricing

**Setup (10 minutes):**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Connect domain
# In Vercel dashboard: Settings → Domains → Add thesession.ie
# Point DNS to Vercel's nameservers (they'll show you)
```

**Pros:**
- Easiest setup
- Free to start
- Scales automatically
- Perfect for Next.js

**Cons:**
- €20/month once you hit 100GB traffic
- Vendor lock-in (but easy to migrate)

---

### Option 2: Railway.app (Good Alternative)

**Why Railway:**
- ✅ €5/month flat rate (predictable)
- ✅ Includes database hosting
- ✅ Easy to use
- ✅ Good for side projects

**Pricing:**
- **Developer (€5/month)**: €5 credit/month included
- Overage: €0.000231/GB-hour (roughly €5-10/month for small app)

**Setup:**
```bash
# 1. Sign up at railway.app
# 2. Connect GitHub repo
# 3. Add Supabase env vars
# 4. Deploy automatically
# 5. Add custom domain in Railway dashboard
```

---

### Option 3: DigitalOcean App Platform

**Why DigitalOcean:**
- ✅ €5-10/month fixed pricing
- ✅ Reliable infrastructure
- ✅ Irish data center available (London)

**Pricing:**
- **Basic (€5/month)**: 1GB RAM, 512MB storage
- **Professional (€12/month)**: 2GB RAM, better for production

**Setup:**
```bash
# 1. Create DigitalOcean account
# 2. Create new App
# 3. Connect GitHub repo
# 4. Choose "Next.js" as framework
# 5. Add environment variables
# 6. Deploy
# 7. Add custom domain
```

---

### Option 4: Self-Hosted VPS (Advanced)

**Only if you're technical and want full control.**

**Best VPS Providers:**
- **Hetzner** (€4.50/month) - Best value, German servers
- **DigitalOcean** (€6/month) - Easy to use
- **Vultr** (€6/month) - Good performance

**Setup (requires Linux knowledge):**
```bash
# 1. Rent VPS
# 2. SSH into server
# 3. Install Node.js, Nginx, PM2
# 4. Clone repo
# 5. Build app: npm run build
# 6. Run with PM2: pm2 start npm --name "session" -- start
# 7. Configure Nginx as reverse proxy
# 8. Setup SSL with Let's Encrypt
# 9. Point domain DNS to VPS IP
```

**Not recommended unless you want to learn DevOps.**

---

## 📱 Mobile App Hosting (iOS/Android)

You already have Capacitor setup! Here's how to deploy:

### iOS App (Apple App Store)

**Requirements:**
- Mac computer (or Mac VM)
- Apple Developer Account (€99/year)
- Xcode installed

**Steps:**
```bash
# 1. Build web app
npm run build

# 2. Sync to iOS
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# 4. In Xcode:
#    - Set bundle ID: ie.thesession.app
#    - Add app icons (1024x1024px)
#    - Configure signing with your Apple Developer account
#    - Archive app (Product → Archive)
#    - Upload to App Store Connect
#    - Submit for review (takes 1-3 days)
```

**Cost:**
- Apple Developer: €99/year (mandatory)
- Hosting: FREE (PWA hosted on Vercel)

---

### Android App (Google Play Store)

**Requirements:**
- Any computer (Windows/Mac/Linux)
- Google Play Developer Account (€25 one-time fee)

**Steps:**
```bash
# 1. Build web app
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build APK/AAB
npx cap run android

# 4. In Android Studio:
#    - Set package name: ie.thesession.app
#    - Add app icons
#    - Generate signed AAB (Build → Generate Signed Bundle)
#    - Upload to Google Play Console
#    - Submit for review (takes a few hours)
```

**Cost:**
- Google Play: €25 one-time (cheaper than Apple!)
- Hosting: FREE

---

### Progressive Web App (PWA) - EASIEST!

**No app store needed!**

Users can "Add to Home Screen" directly from your website.

**Steps:**
1. Already done! Your Next.js app supports PWA
2. Just add a `manifest.json` file (I can create this)
3. Users visit thesession.ie on mobile
4. Tap "Share" → "Add to Home Screen"
5. Boom - app on their phone!

**Pros:**
- FREE
- No app store approval
- Instant updates
- Works on iOS + Android

**Cons:**
- Slightly less features than native app
- Harder to discover (not in app stores)

**Recommendation: Start with PWA, add native apps later if needed.**

---

## 🔧 Complete Setup Checklist

### Week 1: Get Online
- [ ] Register thesession.ie domain (€40)
- [ ] Sign up for Vercel (FREE)
- [ ] Connect GitHub repo to Vercel
- [ ] Add environment variables to Vercel
- [ ] Point domain DNS to Vercel
- [ ] Setup Google Analytics (FREE)
- [ ] Test everything works

### Week 2: Analytics & Monitoring
- [ ] Create Google Analytics account (FREE)
- [ ] Add GA tracking ID to `.env.local`:
  ```
  NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
  ```
- [ ] Setup Google Search Console (FREE)
- [ ] Submit sitemap to Google
- [ ] Add Facebook Pixel (optional)

### Week 3: Polish
- [ ] Create og:image for social sharing (1200x630px)
- [ ] Setup custom email (you@thesession.ie) via Google Workspace (€5/month) or Proton Mail (€4/month)
- [ ] Add privacy policy page
- [ ] Add terms of service page
- [ ] Add cookie consent banner (GDPR required)

### Month 2: Mobile
- [ ] Test PWA on iOS/Android
- [ ] Add app icons (512x512px)
- [ ] Add splash screens
- [ ] Optional: Build native iOS app (€99/year)
- [ ] Optional: Build native Android app (€25 one-time)

---

## 💰 Total Cost Breakdown

### Minimum Viable Product (0-1000 users):
- Domain (.ie): €40/year
- Hosting (Vercel Free): €0/month
- Database (Supabase Free): €0/month
- Google Analytics: €0
- Email (Gmail forwarding): €0
- **TOTAL: €40/year** = **€3.33/month**

### Growing (1000-10000 users):
- Domain: €40/year
- Hosting (Vercel Pro): €20/month
- Database (Supabase Pro): €25/month
- Google Workspace: €5/month
- **TOTAL: €50/month** = **€600/year**

### Scaling (10k+ users):
- Domain: €40/year
- Hosting (Vercel Pro): €20/month
- Database (Supabase Pro): €25/month
- Email: €5/month
- CDN/Images (Cloudflare): €20/month
- Monitoring (Sentry): €26/month
- **TOTAL: €96/month** = **€1,152/year**

**Recommendation: Start with FREE tier, upgrade as revenue grows.**

---

## 🚦 DNS Configuration

Once you have your domain, point it to Vercel:

### If using Vercel nameservers (easiest):
1. In Vercel dashboard: Add domain → "Use Vercel nameservers"
2. Vercel shows you nameservers like:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. In Blacknight.com (your registrar):
   - Go to "Manage DNS"
   - Change nameservers to Vercel's
4. Wait 24-48 hours for propagation
5. Done!

### If keeping your registrar's nameservers:
1. In Blacknight DNS settings, add these records:
   ```
   A     @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```
2. Wait 1-24 hours
3. Done!

---

## 📊 Adding Google Analytics

1. Go to analytics.google.com
2. Create account → Create property
3. Property name: "The Session"
4. Select "Ireland" timezone
5. Choose "Web" platform
6. Enter website URL: thesession.ie
7. Copy the Measurement ID (looks like `G-XXXXXXXXXX`)
8. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
9. Redeploy to Vercel
10. Visit your site → check Real-Time view in GA to confirm it works!

**Already implemented in your code! Just add the env variable.**

---

## 🎯 Recommended Setup for Launch

**Domain:**
- Buy thesession.ie (€40/year) from Blacknight.com

**Hosting:**
- Use Vercel Free tier (€0/month)
- Upgrade to Pro (€20/month) when you hit 5k users

**Database:**
- Keep Supabase Free tier (€0/month)
- Upgrade to Pro (€25/month) when you hit 10k rows or 500MB

**Email:**
- Start with Gmail forwarding (€0)
- Add Google Workspace (€5/month) when you need professional email

**Mobile:**
- Start with PWA (€0)
- Add iOS app (€99/year) if you get 1000+ active users
- Add Android app (€25 one-time) if iOS is successful

**Analytics:**
- Google Analytics 4 (€0)
- Google Search Console (€0)
- Plausible.io (€9/month) if you want privacy-focused analytics

**Total to launch:** €40 one-time + €0/month

**Total at 5k users:** €40/year + €20/month hosting

---

## ❓ FAQ

**Q: Do I need to buy the domain now?**
A: Yes! Domain names get snatched quickly. Buy it today before someone else does.

**Q: Can I change hosting later?**
A: Yes! Next.js apps are portable. Easy to switch from Vercel to Railway, DigitalOcean, etc.

**Q: Do I need a business registered to get .ie?**
A: No! You can use your personal Irish address + ID. But if you want to register a business, it's €20 online at cro.ie (takes 5 days).

**Q: Should I buy other domains too (.com, .eu)?**
A: Not necessary yet. Focus on .ie first. Buy others later if brand takes off.

**Q: What's the easiest path?**
A:
1. Buy thesession.ie today (10 mins)
2. Deploy to Vercel free tier (10 mins)
3. Add Google Analytics (5 mins)
4. Launch! 🚀

**Q: When should I make native mobile apps?**
A: Only after you have:
- 1000+ active monthly users on web
- Proof people want an app (ask them!)
- €200+ budget for app store fees

Start with PWA - it's free and works great!

---

## 🎬 Next Steps

1. **Buy domain NOW**: Go to Blacknight.com, search "thesession.ie", buy it (€40)

2. **Deploy to Vercel**:
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

3. **Add domain to Vercel**: Vercel dashboard → Settings → Domains → Add thesession.ie

4. **Setup Google Analytics**:
   - Get tracking ID
   - Add to `.env.local`
   - Redeploy

5. **You're live!** 🎉

---

Need help with any of this? Just ask!

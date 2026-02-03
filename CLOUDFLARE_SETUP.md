# Cloudflare Setup for The Session

Yes, you should definitely set up Cloudflare! It provides:
- ✅ Free spam/bot protection
- ✅ DDoS protection
- ✅ CDN (faster page loads globally)
- ✅ Free SSL certificates
- ✅ Analytics
- ✅ Rate limiting

## Setup Guide

### 1. Create Cloudflare Account

1. Go to https://cloudflare.com
2. Sign up for free account
3. Add your domain (thesession.ie)

### 2. Update Nameservers

Cloudflare will provide you with 2 nameservers like:
```
alina.ns.cloudflare.com
bryce.ns.cloudflare.com
```

Go to your domain registrar (.IE Domain Registry) and update the nameservers to Cloudflare's.

**Important:** DNS propagation can take 24-48 hours, but usually completes in 1-2 hours.

### 3. Configure DNS Records

Once nameservers are updated, add these DNS records in Cloudflare:

#### A Record (or CNAME for Vercel)

**If using Vercel:**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud ON)
```

```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud ON)
```

**Important:** In Vercel dashboard, add `thesession.ie` and `www.thesession.ie` as custom domains.

### 4. Enable Security Features

#### a) WAF (Web Application Firewall) - FREE

1. Go to **Security** > **WAF**
2. Enable **Managed Rules**
3. Set security level to **Medium** (can increase if needed)

#### b) Bot Fight Mode - FREE

1. Go to **Security** > **Bots**
2. Enable **Bot Fight Mode**
3. This blocks bad bots automatically

#### c) Rate Limiting - Paid ($5/month but worth it)

Create rules to block spam:

**Rule 1: Protect API routes**
```
If: Hostname equals thesession.ie
AND URI Path starts with /api/
AND Requests > 30 in 1 minute
Then: Block for 1 hour
```

**Rule 2: Protect login/signup**
```
If: URI Path equals /auth/login OR /auth/register
AND Requests > 5 in 5 minutes
Then: Challenge (CAPTCHA)
```

Note: You already have server-side rate limiting, but Cloudflare adds an extra layer.

#### d) DDoS Protection - FREE

1. Go to **Security** > **DDoS**
2. Enable **HTTP DDoS attack protection** (should be on by default)

### 5. Performance Optimizations

#### a) Auto Minify

1. Go to **Speed** > **Optimization**
2. Enable Auto Minify for:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

#### b) Brotli Compression

1. Go to **Speed** > **Optimization**
2. Enable **Brotli** compression

#### c) Caching

1. Go to **Caching** > **Configuration**
2. Set **Caching Level** to **Standard**
3. **Browser Cache TTL**: 4 hours (good balance)

**Create Page Rules for static assets:**
```
URL Pattern: thesession.ie/*.jpg
Cache Level: Cache Everything
Edge Cache TTL: 1 month
Browser Cache TTL: 1 month
```

Repeat for: `*.png`, `*.svg`, `*.css`, `*.js`

### 6. Email Protection (Optional but Recommended)

If you add email to your domain (e.g., contact@thesession.ie):

1. Go to **Email** > **Email Routing**
2. Set up forwarding to your personal email
3. FREE - no need for paid email hosting

### 7. Firewall Rules (Custom Protection)

Create custom rules for extra protection:

#### Block Known Bad IPs
```
If: IP Address is in [Known Bot IPs list]
Then: Block
```

#### Protect Against Scrapers
```
If: User Agent contains "curl" OR "wget" OR "scrapy"
AND NOT User Agent contains "Googlebot"
Then: Challenge
```

#### Country-Based (Optional)
If you only serve Dublin/Ireland, you could:
```
If: Country NOT in [IE, GB, EU countries]
Then: Challenge
```
Note: This might block tourists, so be careful.

### 8. Analytics

Enable **Web Analytics** (FREE):
1. Go to **Analytics & Logs** > **Web Analytics**
2. This gives you free analytics alternative to Google Analytics
3. GDPR-compliant, no cookies needed

### 9. Testing Your Setup

After setup, test:

1. **SSL Certificate**: https://thesession.ie should work with padlock
2. **Speed**: Use https://pagespeed.web.dev
3. **Security**: Try accessing your site rapidly to trigger rate limits
4. **CDN**: Use https://www.whatsmydns.net to check DNS propagation

### 10. Recommended Settings Summary

| Feature | Setting | Cost |
|---------|---------|------|
| Proxy Status | Proxied (Orange Cloud) | FREE |
| SSL/TLS Mode | Full (Strict) | FREE |
| Always Use HTTPS | ON | FREE |
| Bot Fight Mode | ON | FREE |
| WAF | Managed Rules ON | FREE |
| Auto Minify | JS/CSS/HTML | FREE |
| Brotli | ON | FREE |
| Rate Limiting | 5 rules | $5/month |

**Total Cost:** $0-5/month (rate limiting optional but recommended)

## Cloudflare + Vercel Integration

Vercel works great with Cloudflare, but follow these rules:

1. **Use Cloudflare nameservers** (not Vercel's)
2. **Set DNS to Proxied** (orange cloud)
3. **In Vercel**, add custom domain AFTER Cloudflare is set up
4. **SSL Mode**: Set to "Full (Strict)" in Cloudflare

## Common Issues & Solutions

### Issue: Redirect Loop
**Solution:** Set SSL/TLS mode to "Full (Strict)"

### Issue: Slow Initial Load
**Solution:** Wait for DNS propagation (up to 48 hours)

### Issue: Rate Limiting Too Aggressive
**Solution:** Whitelist your own IP in Cloudflare firewall

### Issue: Images Not Loading
**Solution:**
- Check image domains are in Cloudflare DNS
- Verify Supabase domains are allowed in CSP

## Alternative: Vercel Firewall (If Not Using Cloudflare)

If you don't want Cloudflare, Vercel has built-in protection:
- DDoS protection (automatic)
- Attack Challenge Mode (enable in project settings)
- Vercel Firewall (paid, $20/month)

**Recommendation:** Use Cloudflare free tier - it's better and costs nothing.

## Monitoring

After setup, monitor:

1. **Cloudflare Dashboard**: Check blocked requests
2. **Vercel Analytics**: Monitor page performance
3. **Supabase Logs**: Watch for unusual API patterns
4. **Google Analytics**: Track user behavior

Set up alerts for:
- Sudden traffic spikes (potential DDoS)
- High error rates (site issues)
- Unusual geographic patterns (potential abuse)

## Next Steps After Domain Purchase

1. ✅ Buy thesession.ie domain
2. ✅ Sign up for Cloudflare (free)
3. ✅ Update nameservers at .IE registry
4. ✅ Wait for DNS propagation (1-48 hours)
5. ✅ Add domain in Vercel
6. ✅ Configure Cloudflare security (30 minutes)
7. ✅ Test everything
8. ✅ Launch! 🎉

---

**Need Help?** Cloudflare has excellent documentation and 24/7 community support.

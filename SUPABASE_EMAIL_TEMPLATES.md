## Supabase Email Templates Configuration

This guide explains how to configure email templates in Supabase for The Session.

### Setup Instructions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** > **Email Templates**
4. Configure each template below

### Required Configuration

Before setting up templates, configure these settings in **Authentication** > **Settings**:

- **Site URL**: `https://thesession.ie` (or your domain)
- **Redirect URLs**: Add `https://thesession.ie/auth/callback`

---

## 1. Confirm Signup Template

**Subject:** Confirm your email for The Session

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #1a1410;
    }
    .container {
      background-color: #2d2418;
      border-radius: 8px;
      padding: 40px;
      border: 1px solid #3d3428;
    }
    h1 {
      color: #fef7e7;
      margin-bottom: 24px;
      font-size: 24px;
    }
    p {
      color: #e8d4b8;
      margin-bottom: 16px;
    }
    .button {
      display: inline-block;
      background-color: #16a34a;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      margin: 24px 0;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #3d3428;
      color: #9b8b6f;
      font-size: 14px;
    }
    .logo {
      font-size: 28px;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🍺</div>
    <h1>Welcome to The Session!</h1>
    <p>Thanks for signing up! We're excited to have you join Dublin's best pub community.</p>
    <p>Click the button below to confirm your email address and start discovering the best pint prices, reviews, and deals across Dublin:</p>
    <a href="{{ .ConfirmationURL }}" class="button">Confirm Your Email</a>
    <p>Once confirmed, you'll be able to:</p>
    <ul style="color: #e8d4b8;">
      <li>Submit and verify pint prices</li>
      <li>Write pub reviews and check in</li>
      <li>Earn points and climb the leaderboard</li>
      <li>Get personalized pub recommendations</li>
      <li>Track your favorite pubs</li>
    </ul>
    <div class="footer">
      <p>If you didn't create an account with The Session, you can safely ignore this email.</p>
      <p>Cheers,<br>The Session Team</p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Reset Password Template

**Subject:** Reset your password for The Session

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #1a1410;
    }
    .container {
      background-color: #2d2418;
      border-radius: 8px;
      padding: 40px;
      border: 1px solid #3d3428;
    }
    h1 {
      color: #fef7e7;
      margin-bottom: 24px;
      font-size: 24px;
    }
    p {
      color: #e8d4b8;
      margin-bottom: 16px;
    }
    .button {
      display: inline-block;
      background-color: #16a34a;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      margin: 24px 0;
    }
    .warning {
      background-color: #422006;
      border-left: 4px solid #dc2626;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #3d3428;
      color: #9b8b6f;
      font-size: 14px;
    }
    .logo {
      font-size: 28px;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🍺</div>
    <h1>Reset Your Password</h1>
    <p>We received a request to reset your password for your The Session account.</p>
    <p>Click the button below to create a new password:</p>
    <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
    <p style="color: #9b8b6f; font-size: 14px;">This link will expire in 1 hour.</p>
    <div class="warning">
      <p style="margin: 0;"><strong>⚠️ Security Notice</strong></p>
      <p style="margin: 8px 0 0 0;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>Cheers,<br>The Session Team</p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Magic Link Template

**Subject:** Your login link for The Session

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #1a1410;
    }
    .container {
      background-color: #2d2418;
      border-radius: 8px;
      padding: 40px;
      border: 1px solid #3d3428;
    }
    h1 {
      color: #fef7e7;
      margin-bottom: 24px;
      font-size: 24px;
    }
    p {
      color: #e8d4b8;
      margin-bottom: 16px;
    }
    .button {
      display: inline-block;
      background-color: #16a34a;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      margin: 24px 0;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #3d3428;
      color: #9b8b6f;
      font-size: 14px;
    }
    .logo {
      font-size: 28px;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🍺</div>
    <h1>Sign in to The Session</h1>
    <p>Click the button below to sign in to your account:</p>
    <a href="{{ .ConfirmationURL }}" class="button">Sign In</a>
    <p style="color: #9b8b6f; font-size: 14px;">This link will expire in 1 hour and can only be used once.</p>
    <div class="footer">
      <p>If you didn't request this login link, you can safely ignore this email.</p>
      <p>Cheers,<br>The Session Team</p>
    </div>
  </div>
</body>
</html>
```

---

## 4. Change Email Template

**Subject:** Confirm your new email address

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #1a1410;
    }
    .container {
      background-color: #2d2418;
      border-radius: 8px;
      padding: 40px;
      border: 1px solid #3d3428;
    }
    h1 {
      color: #fef7e7;
      margin-bottom: 24px;
      font-size: 24px;
    }
    p {
      color: #e8d4b8;
      margin-bottom: 16px;
    }
    .button {
      display: inline-block;
      background-color: #16a34a;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      margin: 24px 0;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #3d3428;
      color: #9b8b6f;
      font-size: 14px;
    }
    .logo {
      font-size: 28px;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🍺</div>
    <h1>Confirm Your New Email</h1>
    <p>You recently requested to change your email address for The Session.</p>
    <p>Click the button below to confirm this change:</p>
    <a href="{{ .ConfirmationURL }}" class="button">Confirm Email Change</a>
    <div class="footer">
      <p>If you didn't request this change, please contact us immediately at support@thesession.ie</p>
      <p>Cheers,<br>The Session Team</p>
    </div>
  </div>
</body>
</html>
```

---

## Testing Email Templates

After configuring templates:

1. Test signup flow:
   ```bash
   # Create a test account on your site
   # Check the email arrives and styling looks correct
   ```

2. Test password reset:
   ```bash
   # Use "Forgot Password" link
   # Verify email arrives within 1 minute
   ```

3. Check spam folders if emails don't arrive

---

## SMTP Configuration (Optional)

For better deliverability, configure custom SMTP in Supabase:

1. Go to **Project Settings** > **Authentication**
2. Enable **Custom SMTP**
3. Recommended providers:
   - **SendGrid**: Free tier, 100 emails/day
   - **Mailgun**: Free tier, 5,000 emails/month
   - **AWS SES**: Very cheap, requires setup

### SendGrid Configuration Example:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: YOUR_SENDGRID_API_KEY
Sender email: noreply@thesession.ie
Sender name: The Session
```

---

## Email Best Practices

1. **Always test** emails before launch
2. **Set up SPF/DKIM** records for your domain to avoid spam
3. **Monitor deliverability** in first week
4. **Keep emails concise** - users scan quickly
5. **Mobile-friendly** - 60%+ of emails opened on mobile

---

## Troubleshooting

**Emails not arriving?**
- Check spam folder
- Verify SMTP credentials
- Check Supabase logs for errors
- Test with different email providers (Gmail, Outlook, etc.)

**Links not working?**
- Verify Site URL in Supabase settings
- Check redirect URLs are correct
- Ensure auth callback route exists

**Styling broken?**
- Some email clients strip CSS
- Inline styles work best
- Test with Email on Acid or Litmus

# Environment Secrets Guide

## ⚡ REQUIRED (Must have for app to work)

### JWT_SECRET
**What it is:** Random secret key used to sign and verify login tokens
**Where to get it:** Generate any random 32+ character string
**How to generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Example output:**
```
a3f7b9c2e1d8f4a6b9c2e1d8f4a6b9c2e1d8f4a6b9c2e1d8f4a6b9c2e1d8f4
```
**What it does:** Protects user login sessions - if someone guesses this, they could forge login tokens
**Will app work without it?** NO - app will crash on startup

### JWT_REFRESH_SECRET
**What it is:** Another random secret key for refresh tokens
**Where to get it:** Generate another random 32+ character string (DIFFERENT from JWT_SECRET)
**How to generate:** Same as above - run it twice to get 2 different strings
**What it does:** Keeps users logged in longer - less secure than access token but longer lived
**Will app work without it?** NO - app will crash on startup

---

## 🔒 OPTIONAL (Nice to have - OAuth login)

### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
**What it is:** Credentials for "Sign in with Google" button
**Where to get it:**
1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - http://localhost:4000/api/auth/google/callback (development)
7. Copy Client ID and Secret

**Will app work without it?** YES - but "Sign in with Google" button won't work
**What happens if blank?** Login page works fine, just no Google button

### GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET
**What it is:** Credentials for "Sign in with GitHub" button
**Where to get it:**
1. Go to https://github.com/settings/developers
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - Application name: "TaskFlow"
   - Homepage URL: http://localhost:5173 (or your domain)
   - Authorization callback URL: http://localhost:4000/api/auth/github/callback
4. Copy Client ID and Secret

**Will app work without it?** YES - but "Sign in with GitHub" button won't work
**What happens if blank?** Login page works fine, just no GitHub button

---

## 📧 OPTIONAL (Email notifications)

### SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
**What it is:** Email server credentials for sending invite emails
**Where to get it (for testing):** Use https://ethereal.email
1. Go to https://ethereal.email/
2. Click "Create Ethereal Account"
3. Copy the credentials shown
4. Paste into .env

**Where to get it (production):**
- Gmail: https://myaccount.google.com/apppasswords
- SendGrid: https://sendgrid.com/
- Mailgun: https://www.mailgun.com/
- Any SMTP provider

**Will app work without it?** YES - but invite emails won't be sent
**What happens if blank?** App works fine, just can't send emails

---

## ✅ MINIMUM SETUP TO GET STARTED

Just fill in the REQUIRED fields to start using the app:

```env
JWT_SECRET=a3f7b9c2e1d8f4a6b9c2e1d8f4a6b9c2e1d8f4a6b9c2e1d8f4a6b9c2e1d8f4
JWT_REFRESH_SECRET=b4g8k0d3h9j5m1l7n9p2r4t6v8w0y2a4b6c8e0f2g4h6i8j0k2m4n6p8r0s2
```

Then you can:
- ✅ Login with alice@acme.com / password123
- ✅ Create tasks
- ✅ Invite members (emails won't send, but invites work)
- ✅ Test everything

---

## 🚀 PRODUCTION SETUP

For production deployment, set up:
1. **JWT_SECRET** ✅ (required)
2. **JWT_REFRESH_SECRET** ✅ (required)
3. **GOOGLE_CLIENT_ID/SECRET** (recommended for user convenience)
4. **GITHUB_CLIENT_ID/SECRET** (recommended for user convenience)
5. **SMTP_* vars** (recommended for email invites)

---

## ⚠️ SECURITY REMINDERS

- **NEVER** commit .env to git (it's in .gitignore for a reason!)
- **NEVER** share JWT_SECRET with anyone
- **NEVER** put actual production secrets in .env.example
- Use different secrets for dev, staging, and production
- Rotate secrets every 90 days in production
- Never log or expose secrets in error messages

---

## 🧪 QUICK START (Copy & Paste)

Generate secrets:
```bash
# Run this twice to get 2 different strings
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then paste into `.env`:
```env
JWT_SECRET=<paste-first-secret-here>
JWT_REFRESH_SECRET=<paste-second-secret-here>
```

That's it! App will work! 🎉

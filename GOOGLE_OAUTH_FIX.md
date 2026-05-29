# Google OAuth Login - Setup & Troubleshooting

## ❌ Problem: Google Login Throws Error

When clicking "Continue with Google", you get an error like:
```
"Provider Google is not enabled"
or
"OAuth provider configuration is missing"
or
Redirected to blank page
```

## ✅ Solution: Enable Google Provider in Supabase

### Step 1: Get Google OAuth Credentials

#### 1.1 Go to Google Cloud Console
1. Visit https://console.cloud.google.com
2. Create a new project (or select existing AROHA project)

#### 1.2 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, click **"Configure consent screen"** first:
   - Choose **External** user type
   - Fill in:
     - App name: `AROHA`
     - User support email: Your email
     - Developer contact: Your email
   - Click **"Save and Continue"**
4. Back to Credentials, click **"Create OAuth client ID"**
5. Select **Web application**
6. Under **Authorized redirect URIs**, add:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   (Replace `your-project` with your actual Supabase project name)
7. Click **Create**
8. Copy the **Client ID** and **Client Secret** (you'll need these)

---

### Step 2: Configure Google Provider in Supabase

#### 2.1 Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your **AROHA** project

#### 2.2 Enable Google Provider
1. Go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Click **Google** to expand it
4. Enable the toggle: **"Enable Google"**

#### 2.3 Add Google Credentials
1. Paste your **Client ID** from Google Cloud Console
2. Paste your **Client Secret** from Google Cloud Console
3. Click **"Save"**

---

### Step 3: Configure Redirect URLs in Supabase

#### 3.1 Add Redirect URLs
1. In Supabase, go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   http://localhost:5175
   http://localhost:5175/
   https://your-netlify-domain.netlify.app
   https://your-netlify-domain.netlify.app/
   https://your-custom-domain.com
   https://your-custom-domain.com/
   ```
3. Click **Add** for each URL
4. Click **Save**

---

### Step 4: Configure in Google Cloud Console

#### 4.1 Add Netlify Domain to Authorized Redirect URIs
1. Go back to Google Cloud Console
2. Go to **APIs & Services** → **Credentials**
3. Click your OAuth app (Client ID)
4. Under **Authorized redirect URIs**, also add:
   ```
   https://your-netlify-domain.netlify.app/auth/v1/callback
   https://your-custom-domain.com/auth/v1/callback
   ```
5. Click **Save**

---

## 🧪 Test Google Login

1. Go to your Netlify site
2. Scroll down to **"Continue with Google"** button
3. Click it
4. Sign in with your Google account
5. Should redirect back and show welcome message ✅

---

## 🐛 Troubleshooting

### Error: "Provider Google is not enabled"
**Cause**: Google provider not enabled in Supabase  
**Fix**: Follow Step 2 above to enable Google provider

### Error: "Invalid redirect URI"
**Cause**: Redirect URL not configured correctly  
**Fix**: 
1. Check Google Cloud Console has the exact redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
2. Check Supabase has your Netlify domain in redirect URLs:
   ```
   https://your-netlify-domain.netlify.app
   ```
3. URLs must match exactly (including http/https)

### Blank page after clicking Google button
**Cause**: Redirect loop or misconfigured URLs  
**Fix**:
1. Check browser console (F12) for error messages
2. Verify redirect URLs match exactly in both Supabase and Google Cloud
3. Try logging in from localhost first: `http://localhost:5175`

### "Client ID not found" or "Client Secret invalid"
**Cause**: Wrong credentials pasted  
**Fix**:
1. Go to Google Cloud Console
2. Copy **Client ID** and **Client Secret** again
3. Paste into Supabase provider settings
4. Make sure no extra spaces are copied

### Redirect to localhost after Netlify login
**Cause**: `redirectTo` is set to `window.location.origin` which works for localhost but fails on production  
**Fix**: Already handled in code - should work automatically

---

## 📝 Checklist

Before testing, verify:
- [ ] Google OAuth app created in Google Cloud Console
- [ ] Client ID & Secret copied to Supabase
- [ ] Google provider **enabled** in Supabase
- [ ] Redirect URI in Google Cloud: `https://your-project.supabase.co/auth/v1/callback`
- [ ] Redirect URLs in Supabase include your Netlify domain
- [ ] Redirect URLs in Google Cloud include your Netlify domain
- [ ] All URLs use exact match (no typos)

---

## 📊 Google OAuth Flow

```
User clicks "Continue with Google"
           ↓
App redirects to Google login page (google.com)
           ↓
User signs in with Google account
           ↓
Google redirects back to Supabase
  (using redirect URI: supabase.co/auth/v1/callback)
           ↓
Supabase creates session in your app
           ↓
App redirects to home page
           ↓
User logged in! ✅
```

---

## 🔐 Security Notes

- ✅ Never share your Client Secret
- ✅ Client Secret should only be in Google Cloud Console and Supabase (never in code)
- ✅ Redirect URIs must be from your own domains only
- ✅ Use HTTPS for production (Netlify auto-enables this)

---

## 🎯 Common Mistakes to Avoid

1. ❌ Forgetting to **enable** Google provider in Supabase
2. ❌ Redirect URI doesn't match exactly (extra spaces, typos, http vs https)
3. ❌ Using wrong Client ID/Secret
4. ❌ Not adding Netlify domain to redirect URLs
5. ❌ Testing from different domain than configured

---

## ✨ After Google Login Works

The flow should be:
1. User clicks "Continue with Google"
2. Redirected to Google login
3. User authenticates
4. Redirected back to your app
5. Profile auto-created in Supabase
6. User logged in with:
   - Email from Google account
   - Name from Google account
   - 1350 starting coins
7. Can access all features

---

## 📞 Still Having Issues?

If Google OAuth still doesn't work:

1. **Check browser console** (F12 → Console):
   - Copy exact error message
   - Send it to me with:
     - Your Supabase project name
     - Your Netlify domain

2. **Test with localhost first**:
   ```bash
   npm run dev
   # Open http://localhost:5175
   # Try Google login
   ```
   If it works on localhost but not Netlify, it's a domain/redirect URL issue.

3. **Verify credentials** in Supabase:
   - Go to Authentication → Providers → Google
   - Make sure Client ID and Secret are filled in
   - Make sure toggle is **enabled**

---

## 🚀 Next Steps

1. Follow steps 1-4 above carefully
2. Test on localhost first (`npm run dev`)
3. Test on Netlify production domain
4. Should work! ✨

---

**Version**: 1.0 | **Date**: May 29, 2026

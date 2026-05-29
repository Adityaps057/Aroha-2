# Google OAuth Error: "Unable to exchange external code" - Debugging Guide

## ❌ Error Details
```
error=server_error
error_code=unexpected_failure
error_description=Unable+to+exchange+external+code
```

**What this means**: Google authenticated you successfully, but Supabase couldn't complete the token exchange.

---

## 🔍 Root Cause Checklist

This error is 99% caused by one of these:
1. ❌ Redirect URI mismatch
2. ❌ Client ID or Secret is wrong
3. ❌ Supabase project name is wrong
4. ❌ Google provider not enabled in Supabase

---

## ✅ Step-by-Step Debugging

### **Step 1: Get Your Exact Supabase URL**

This is critical - it must be exact.

1. Go to https://supabase.com/dashboard
2. Click your **AROHA** project
3. Go to **Settings** → **API**
4. Copy your **Project URL** (looks like: `https://abc123xyz.supabase.co`)
5. **Save this** - you'll need it for everything below

---

### **Step 2: Fix Google Cloud Console Redirect URI**

This is the #1 cause of the error.

1. Go to https://console.cloud.google.com
2. Go to **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 app (Client ID)
4. Find **Authorized redirect URIs** section
5. **Delete all existing ones**
6. Add these **exact** URIs (copy-paste, no typos):
   ```
   https://abc123xyz.supabase.co/auth/v1/callback
   ```
   (Replace `abc123xyz` with YOUR project name from Step 1)
7. Click **Save**

> ⚠️ **Critical**: The redirect URI must be exactly:
> - `https://` (not http)
> - Your exact Supabase URL
> - `/auth/v1/callback` at the end
> - NO trailing slash, NO spaces

---

### **Step 3: Verify Supabase Google Provider Configuration**

1. Go to https://supabase.com/dashboard
2. Click your **AROHA** project
3. Go to **Authentication** → **Providers**
4. Click **Google** to expand

**Verify these fields are filled:**
- ✅ **Client ID**: Not empty (from Google Cloud Console)
- ✅ **Client Secret**: Not empty (from Google Cloud Console)
- ✅ **Enabled**: Toggle is turned ON (blue/enabled)

If any field is empty, go back to Google Cloud Console and copy them again.

---

### **Step 4: Verify Supabase Redirect URLs**

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   http://localhost:5175
   https://your-netlify-domain.netlify.app
   ```
3. Save

---

### **Step 5: Test Locally First**

Before testing on Netlify, test on localhost:

```bash
# Terminal
cd /path/to/Aroha-2
npm run dev
```

1. Open `http://localhost:5175` in browser
2. Click "Continue with Google"
3. Sign in with Google
4. Should redirect to your app ✅

**Why test locally?**
- Easier to debug
- URL mismatch errors are obvious
- No Netlify domain issues

If it **works on localhost**, the issue is with your **Netlify domain** (Step 6).

If it **fails on localhost too**, the issue is with your **Google/Supabase configuration** (Steps 1-4).

---

### **Step 6: Add Netlify Domain to Redirect URIs**

Once it works on localhost:

**In Google Cloud Console:**
1. Go to **APIs & Services** → **Credentials** → Your OAuth app
2. Under **Authorized redirect URIs**, also add:
   ```
   https://your-netlify-domain.netlify.app/auth/v1/callback
   ```
3. Save

**In Supabase:**
1. Go to **Authentication** → **URL Configuration**
2. Add:
   ```
   https://your-netlify-domain.netlify.app
   ```
3. Save

---

## 🧪 Exact Configuration Template

Use this template - replace placeholders:

### **Google Cloud Console - Authorized Redirect URIs**
```
https://abc123xyz.supabase.co/auth/v1/callback
https://my-site-12345.netlify.app/auth/v1/callback
```

### **Supabase - Redirect URLs**
```
http://localhost:5175
https://my-site-12345.netlify.app
```

### **Supabase - Google Provider**
```
Client ID: [your-google-client-id]
Client Secret: [your-google-client-secret]
Enabled: Toggle ON
```

---

## 🔧 Common Mistakes (Don't Do These!)

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `http://abc123xyz.supabase.co/auth/v1/callback` | `https://abc123xyz.supabase.co/auth/v1/callback` |
| `https://abc123xyz.supabase.co/auth/v1/callback/` | `https://abc123xyz.supabase.co/auth/v1/callback` |
| `https://abc123xyz.supabase.co/auth/callback` | `https://abc123xyz.supabase.co/auth/v1/callback` |
| Extra spaces copied | No extra spaces |
| Project ID instead of project name | Actual project name |
| Old/expired Client Secret | Current Client Secret |
| Google provider disabled | Google provider enabled |

---

## 📋 Verification Checklist

Before testing again:

- [ ] **Google Cloud Console** Authorized Redirect URIs:
  - [ ] Contains: `https://your-project.supabase.co/auth/v1/callback`
  - [ ] No `http://` (must be `https://`)
  - [ ] No trailing slash
  - [ ] No extra spaces
  - [ ] Exactly matches your Supabase URL

- [ ] **Supabase Google Provider**:
  - [ ] Client ID filled in
  - [ ] Client Secret filled in
  - [ ] Enabled toggle is ON
  - [ ] No extra spaces in credentials

- [ ] **Supabase URL Configuration**:
  - [ ] Contains: `http://localhost:5175`
  - [ ] Contains: `https://your-netlify-domain.netlify.app`
  - [ ] All saved

---

## 🧠 How OAuth Works (Why Redirect URIs Matter)

```
1. You click "Continue with Google"
   ↓
2. Your app opens Google login page
   ↓
3. You sign in with Google
   ↓
4. Google redirects back to Supabase with auth code
   (URL: https://your-project.supabase.co/auth/v1/callback?code=...)
   ↓
5. Supabase exchanges code for token with Google
   (Must happen on EXACT redirect URI)
   ↓
6. Supabase redirects to your app
   ↓
7. You're logged in! ✅
```

**If redirect URI doesn't match exactly at step 4, Google rejects it.**

---

## 🔍 How to Verify Your Supabase Project Name

1. Go to https://supabase.com/dashboard
2. Open your AROHA project
3. Look at the browser URL:
   ```
   https://app.supabase.com/project/[project-ref]/...
   ```
4. Your `[project-ref]` is what you use in redirect URIs

---

## 💡 Debug Tips

### **Check if Google Provider is Enabled**
1. Go to Supabase → Authentication → Providers
2. Is Google showing as **"Enabled"** with a green checkmark?
3. If not, click Google and toggle it ON

### **Check if Credentials are Correct**
1. Go to Google Cloud Console
2. Go to Credentials
3. Click your OAuth app
4. Check **Client ID** and **Client Secret** at the top
5. Make sure they match what's in Supabase

### **Check Redirect URI Format**
1. In Google Cloud Console, Authorized Redirect URIs should look like:
   ```
   https://XXXXX.supabase.co/auth/v1/callback
   ```
2. NOT: `https://XXXXX.supabase.co/auth/callback`
3. NOT: `http://XXXXX.supabase.co/auth/v1/callback`
4. Must have `/v1/` in the path

---

## 🚀 After Fixing, Test This

1. **Test on localhost:**
   ```bash
   npm run dev
   # Open http://localhost:5175
   # Click "Continue with Google"
   # Should work!
   ```

2. **Test on Netlify:**
   ```
   https://your-netlify-domain.netlify.app
   # Click "Continue with Google"
   # Should work!
   ```

3. **Verify login:**
   - Should see home page (not error)
   - Profile should auto-create
   - Should have 1350 coins

---

## 📞 Still Getting Error?

If "Unable to exchange external code" still appears:

1. **Take a screenshot of:**
   - Google Cloud Console → Authorized Redirect URIs (the list)
   - Supabase → Google Provider settings (Client ID field)
   - Supabase → URL Configuration (Redirect URLs list)

2. **Tell me:**
   - Your exact Supabase project name (from dashboard URL)
   - Your exact Netlify domain
   - What you see in each screenshot

3. **I can then spot the exact mismatch**

---

## 🎯 Most Likely Fix

90% of cases are fixed by ensuring this redirect URI in Google Cloud:

```
https://your-project.supabase.co/auth/v1/callback
```

is exactly correct with:
- ✅ Your actual Supabase project name
- ✅ `https://` not `http://`
- ✅ `/auth/v1/callback` not `/auth/callback`
- ✅ No trailing slash
- ✅ No spaces

---

**Try the steps above, then test. Google login should work!** ✨

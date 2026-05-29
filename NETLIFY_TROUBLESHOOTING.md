# Netlify Blank Page - Troubleshooting & Fix

## ❌ Problem: Blank White Page + MIME Type Error

```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "application/octet-stream"
```

## ✅ Solution: Fix Netlify Build Settings

### Step 1: Go to Netlify Dashboard
1. Visit https://app.netlify.com
2. Click on your site name (AROHA site)
3. Go to **Site Settings** (in top menu)

### Step 2: Fix Build & Deploy Settings
1. Click **"Build & Deploy"** in left sidebar
2. Under **"Build settings"** section, click **"Edit settings"**

### Step 3: Verify/Set These Values

**Build command** (exact):
```
npm run build
```

**Publish directory** (exact):
```
dist
```

**Node.js version** (set to):
```
18.x (or latest LTS)
```

> ⚠️ **Critical**: Make sure there are NO extra spaces or quotes around values!

### Step 4: Save & Trigger Rebuild
1. Click **"Save"**
2. You'll see a message: "Settings saved"
3. Go to **"Deploys"** tab
4. Click **"Trigger deploy"** → **"Deploy site"**
5. Wait 3-5 minutes for build to complete

### Step 5: Check Build Log
1. In Deploys tab, click the latest deploy
2. Click **"View deploy log"**
3. Look for:
   ```
   ✓ Build successful
   ```

If you see errors, check:
- `npm install` completed successfully
- `npm run build` ran without errors
- No "command not found" messages

---

## 🔍 Why This Happens

When Netlify's build settings are wrong:
1. ❌ `npm run build` doesn't run
2. ❌ `dist/` folder isn't created
3. ❌ Netlify serves source files instead
4. ❌ Browser receives wrong MIME types
5. ❌ Blank white page appears

When settings are correct:
1. ✅ `npm install` installs dependencies
2. ✅ `npm run build` creates `dist/` folder
3. ✅ Vite bundles JavaScript/CSS correctly
4. ✅ Netlify serves `dist/` folder
5. ✅ Browser loads correctly

---

## 📋 Complete Netlify Checklist

### Before Deploy
- [ ] Code pushed to GitHub
- [ ] `.env.local` NOT in git
- [ ] `.gitignore` includes `dist/`
- [ ] Local build works: `npm run build`

### Netlify Settings
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables set:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_GOOGLE_MAPS_API_KEY`
- [ ] Node.js version: 18.x or higher

### After Deploy
- [ ] Deploy log shows ✓ Build successful
- [ ] Site URL accessible (no blank page)
- [ ] Browser console has no MIME errors
- [ ] Features work:
  - [ ] Login/signup
  - [ ] Map loads
  - [ ] Can book hotel
  - [ ] Payment works

---

## 🚀 Quick Fix (Copy-Paste)

If settings look wrong, reset them:

**Build command:**
```
npm run build
```
(Copy this exactly, no extra spaces)

**Publish directory:**
```
dist
```
(Copy this exactly, no extra spaces)

Then click **"Save"** → **Trigger deploy**

---

## 🐛 If Still Blank After Rebuild

### Check 1: Build Log for Errors
```
Deploy log → Look for ❌ errors or ⚠️ warnings
```

Common errors:
- `npm: command not found` → Node.js not installed
- `Cannot find module` → Missing dependency
- `ENOENT: no such file or directory` → File path wrong

### Check 2: Environment Variables
1. Go to **Site Settings** → **Environment**
2. Verify all 3 variables are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`
3. If missing, add them

### Check 3: Check dist/ Folder
In build log, search for:
```
dist/
dist/index.html
dist/assets/
```

If missing, the build didn't complete.

### Check 4: Clear Cache & Hard Refresh
1. In browser, press **Ctrl+Shift+Del**
2. Clear cache & cookies
3. Go to your Netlify URL
4. Press **Ctrl+Shift+R** (hard refresh)

---

## 📞 If Issues Continue

### Option 1: Redeploy from Scratch
1. Go to **Deploys** tab
2. Find the successful deploy (or any old one)
3. Click **"Redeploy"** 
4. It will rebuild from that commit

### Option 2: Manual Rebuild
1. In Netlify, click **Trigger deploy** → **Clear cache and rebuild**
2. This clears Netlify's cache and rebuilds everything
3. Wait 3-5 minutes

### Option 3: Check logs Locally
```bash
# Build locally to see any errors
cd /path/to/Aroha-2
npm install
npm run build

# If build fails locally, fix it before pushing
```

---

## ✅ Verification

Once fixed, you should see:
```
✓ All dependencies installed
✓ No build errors
✓ dist/ folder created with:
  - dist/index.html
  - dist/assets/index-[hash].js
  - dist/assets/index-[hash].css
✓ Deploy successful
✓ Site loads (not blank)
✓ Features work
```

---

## 🎯 Most Common Fix

90% of cases are fixed by ensuring:
1. **Build command**: `npm run build`
2. **Publish directory**: `dist`
3. **Environment variables**: All 3 set correctly

If your settings match these exactly, trigger a rebuild.

---

**After fixing, your site will load properly!** ✨

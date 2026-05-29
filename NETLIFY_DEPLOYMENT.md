# Netlify Deployment Guide for AROHA

> Complete step-by-step guide to deploy AROHA to Netlify with automatic builds & deploys

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ GitHub account with AROHA repository pushed
- ✅ Netlify account (free at https://netlify.com)
- ✅ Google Maps API key
- ✅ Supabase URL & Anon Key
- ✅ Repository: https://github.com/Adityaps057/Aroha-2

---

## 🚀 Step 1: Connect GitHub to Netlify

### 1.1 Go to Netlify
1. Visit https://app.netlify.com
2. Sign in (or create account if needed)
3. Click **"Add new site"** → **"Import an existing project"**

### 1.2 Connect GitHub
1. Click **"GitHub"** button
2. Authorize Netlify to access your GitHub account
   - Click "Authorize Netlify by GitHub"
   - You'll be redirected to GitHub for permission
   - Click **"Authorize netlify"**
3. You're now connected!

### 1.3 Select Repository
1. Search for **"Aroha-2"** in the repository list
2. Click on **"Adityaps057/Aroha-2"**

---

## ⚙️ Step 2: Configure Build Settings

### 2.1 Basic Build Information
Netlify should auto-detect these, but verify:

**Build command:**
```bash
npm run build
```

**Publish directory:**
```
dist
```

**Runtime:**
- Leave as default (Node.js v18 or higher is fine)

### 2.2 Environment Variables
This is **CRITICAL** - add your API keys here:

1. Click **"Environment"** tab
2. Click **"Edit variables"**
3. Add these variables:

**Variable 1: Supabase URL**
```
VITE_SUPABASE_URL = https://your-project.supabase.co
```

**Variable 2: Supabase Anon Key**
```
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

**Variable 3: Google Maps API Key**
```
VITE_GOOGLE_MAPS_API_KEY = your-google-maps-api-key-here
```

> ⚠️ **Never commit these to GitHub!** Only add them in Netlify UI.

### 2.3 Add API Key Restrictions (Recommended)

Once deployed, add your Netlify domain to API key restrictions:

**Google Maps API:**
1. Go to https://console.cloud.google.com
2. Go to APIs & Services → Credentials
3. Click your API key
4. Under "Application restrictions" → "HTTP referrers"
5. Add: `https://your-netlify-domain.netlify.app/*`

**Supabase:**
1. Go to https://supabase.com/dashboard
2. Go to Settings → API
3. Add your Netlify domain to "Additional redirect URLs"

---

## 📝 Step 3: Complete Deployment

### 3.1 Review & Deploy
1. Scroll down to review all settings
2. Click **"Deploy site"**
3. Netlify will:
   - Download your code from GitHub
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Upload `dist/` folder to CDN
   - Assign a temporary domain name

### 3.2 Wait for Build
Building takes ~3-5 minutes. You'll see:
```
⚙️  Building
📦 Installing dependencies
🏗️  Building project
✅ Deploy complete!
```

### 3.3 Access Your Site
Once complete, you'll get a URL like:
```
https://aroha-app-12345.netlify.app
```

Open it in browser - your app is LIVE! 🎉

---

## 🌐 Step 4: Configure Custom Domain

### 4.1 Add Custom Domain
1. In Netlify dashboard, go to **Site Settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `aroha.com`)
4. Netlify will guide you to update DNS records

### 4.2 Enable HTTPS
Netlify auto-provisions Let's Encrypt SSL certificate - it's automatic!

---

## 🔄 Step 5: Enable Automatic Deployments

### 5.1 Auto-Deploy on Push
This is already enabled! Every time you push to GitHub:
1. GitHub notifies Netlify
2. Netlify automatically:
   - Pulls latest code
   - Installs dependencies
   - Builds project
   - Deploys to CDN
3. Your site updates in ~3-5 minutes

### 5.2 Deploy Previews
For pull requests:
1. Create a PR on GitHub
2. Netlify automatically:
   - Builds the PR
   - Creates preview URL
   - Posts preview link in PR comments
3. Great for testing before merging!

---

## 🧪 Step 6: Test Your Deployment

### 6.1 Verify Everything Works
1. Open your Netlify domain
2. Test all features:
   - ✅ Login/Signup works
   - ✅ Map loads with places
   - ✅ Search & filter works
   - ✅ Hotel booking loads
   - ✅ Payment methods display
   - ✅ Food ordering works
   - ✅ Coins update in real-time
   - ✅ Profile shows correct data

### 6.2 Check Browser Console
Press **F12** → **Console** to check for errors

### 6.3 Monitor Netlify Logs
In Netlify dashboard:
1. Click **"Deploys"** tab
2. Click latest deploy
3. Check **"Deploy log"** for any issues

---

## 🔐 Security Checklist

### Pre-Deployment
- [ ] Environment variables added in Netlify (not in git)
- [ ] API keys are production keys (not demo)
- [ ] HTTPS enabled (automatic)
- [ ] No `.env.local` file in repository
- [ ] No hardcoded credentials in code

### Post-Deployment
- [ ] Add Netlify domain to Google Maps API restrictions
- [ ] Add Netlify domain to Supabase allowed URLs
- [ ] Test HTTPS access (should redirect automatically)
- [ ] Verify all API calls work from live domain

---

## 📊 Monitoring & Analytics

### Netlify Dashboard Features
1. **Deploys** - View build history
2. **Analytics** - Track traffic
3. **Functions** - Serverless functions (advanced)
4. **Domains** - Manage custom domains
5. **Settings** - Configure build & environment

### Monitor Performance
1. Click **"Analytics"** tab in Netlify
2. View:
   - Page views
   - Unique visitors
   - Top pages
   - Referral sources

---

## 🐛 Troubleshooting

### Build Fails
**Error: "npm install failed"**
- Check if `package.json` and `package-lock.json` are in repository
- Solution: Run `npm install` locally, commit `package-lock.json`

**Error: "VITE_GOOGLE_MAPS_API_KEY is undefined"**
- Check environment variables in Netlify UI
- Make sure variables are set (not empty)
- Redeploy after adding variables

**Error: "Build command not found"**
- Netlify didn't auto-detect build command
- Go to Site Settings → Build & deploy
- Set Build command: `npm run build`
- Set Publish directory: `dist`

### Site Loads But Features Don't Work

**Maps don't load:**
- Check console (F12) for errors
- Verify `VITE_GOOGLE_MAPS_API_KEY` is set
- Add Netlify domain to Google Maps API restrictions

**Supabase not connecting:**
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Verify credentials are correct (copy from Supabase dashboard)
- Add Netlify domain to Supabase "Additional redirect URLs"

**Coins not updating:**
- Clear browser cache (Ctrl+Shift+Del)
- Check if Supabase connection is working
- Check browser console for errors

### Deployment Status

Check deployment status:
1. Go to **Deploys** tab
2. Each deploy shows:
   - ✅ **Success** - All good!
   - ⏳ **Building** - Still building
   - ❌ **Failed** - See error log
   - 🔄 **Rebuilding** - Manual rebuild

---

## 🎯 Performance Optimization

### Netlify Already Provides
- ✅ Global CDN (content delivered from closest server)
- ✅ Automatic GZIP compression
- ✅ Image optimization
- ✅ Cache busting (automatic)
- ✅ HTTP/2 & HTTP/3 support

### Load Time Targets
- First Contentful Paint (FCP): < 2 seconds
- Largest Contentful Paint (LCP): < 2.5 seconds
- Cumulative Layout Shift (CLS): < 0.1

Your build size (745 KB gzipped) should easily meet these targets!

---

## 📋 Deployment Checklist

Before deploying:
- [ ] All code pushed to GitHub main branch
- [ ] `.env.local` NOT in git
- [ ] `.env.example` template committed
- [ ] `.gitignore` includes `.env.local`
- [ ] `package.json` & `package-lock.json` committed
- [ ] Latest build tested locally (`npm run build`)

After deploying:
- [ ] Netlify account created
- [ ] Repository connected
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables added:
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
  - [ ] VITE_GOOGLE_MAPS_API_KEY
- [ ] First deploy successful
- [ ] Site loads without errors
- [ ] All features work
- [ ] API key restrictions configured

---

## 🚀 Next Steps

### Option 1: Custom Domain
```
1. Buy domain (GoDaddy, Namecheap, etc.)
2. In Netlify: Domain Settings → Add custom domain
3. Update DNS records
4. HTTPS auto-enabled in ~24 hours
```

### Option 2: Subdomain
```
1. In Netlify: Site settings → Change site name
2. Your site becomes: aroha-app.netlify.app
3. HTTPS auto-enabled
```

### Option 3: Keep Default
```
Keep default: https://your-random-domain.netlify.app
Still fully functional and secure!
```

---

## 📞 Support

### Netlify Issues
- **Netlify Docs**: https://docs.netlify.com
- **Netlify Support**: https://app.netlify.com/support

### AROHA Issues
- **Setup Help**: See SETUP_GUIDE.md
- **Feature Info**: See APP_DOCUMENTATION.md
- **Build Issues**: Check GITHUB_DEPLOYMENT.md

---

## 🎉 Final Steps

After deployment:

1. **Share your site**
   ```
   Your app is live at: https://your-app.netlify.app
   ```

2. **Monitor performance**
   - Netlify dashboard shows analytics
   - Check deployment logs for issues
   - Monitor API usage (Supabase & Google)

3. **Iterate & improve**
   - Push updates to GitHub
   - Netlify auto-deploys
   - Preview changes on pull requests
   - Merge to main to go live

4. **Scale if needed**
   - Netlify handles growth automatically
   - Global CDN serves all users
   - Serverless functions available (advanced)

---

## 📊 Deployment Summary

| Aspect | Details |
|--------|---------|
| **Platform** | Netlify |
| **Build Time** | ~3-5 minutes |
| **CDN** | Global (automatic) |
| **SSL/TLS** | Auto (Let's Encrypt) |
| **Deploys** | Auto on GitHub push |
| **Preview** | Auto on pull requests |
| **Cost** | Free tier includes 100+ GB bandwidth |
| **Scalability** | Automatic |
| **Uptime** | 99.99% SLA |

---

## ✨ You're All Set!

Your AROHA app is ready to deploy to Netlify:

1. ✅ Code is on GitHub
2. ✅ Credentials are secure (.env variables)
3. ✅ Documentation is complete
4. ✅ Build is production-ready
5. ✅ Deployment is automated

**Next action**: Follow the steps above to deploy! 🚀

---

**Version**: 1.0 | **Date**: May 29, 2026 | **Status**: ✅ Ready to Deploy

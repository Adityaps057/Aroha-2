# AROHA - Quick Start Guide (5 minutes)

## 🚀 Get Running Instantly

### Option 1: Local Development (Recommended for Testing)

```bash
# 1. Navigate to project
cd path/to/AROHA

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

**Output**:
```
➜ Local:   http://localhost:5175/
```

Open `http://localhost:5175` in browser → App is running!

---

### Option 2: Production Build

```bash
# Build for production
npm run build

# Output: dist/ folder ready to deploy
```

---

## 🔑 Minimal Setup (No Database)

The app **works offline** with:
- ✅ Mock authentication (email-based)
- ✅ localStorage for coin storage
- ✅ All UI features functional

**Just run**: `npm run dev` → Done!

---

## 📚 Features Available Now

- ✅ Browse 20+ tourist places on interactive map
- ✅ Book hotels with itemized bills
- ✅ Order food with delivery tracking
- ✅ Shop artisan products with Amazon-style tracking
- ✅ Earn coins from check-ins & activities
- ✅ Complete payment checkout flows (UPI QR, Card, Netbanking)
- ✅ User profile with reward balance

---

## 🔌 Enable Supabase (Optional - For Production)

Follow **SETUP_GUIDE.md** → Part 1 & 2 to:
1. Create Supabase project
2. Run SQL table creation scripts
3. Add `.env.local` with credentials

**Benefits**:
- Persistent database
- Multi-user support
- Cloud storage

---

## 🗺️ Test Key Features

### 1. **Browse Places**
- Click **"Places"** in sidebar
- Search: type "temple", "palace", "market"
- Filter: click category buttons (Temple, Heritage, Nature, Shopping)

### 2. **Book a Hotel**
- Click **"Hotels"** → Select any hotel → **"Book Now"**
- Fill dates & guests → See itemized bill
- Try payment methods (UPI QR has countdown timer!)

### 3. **Order Food**
- Click **"Order"** → **"Swaadh"** tab
- Add items → "Checkout" → Pay
- See delivery tracker with live status updates

### 4. **Earn Coins**
- Click **"Events"** (Plan My Day)
- Click **"Check in"** on any stop → +25 coins 🪙
- Open **"Profile"** → See coins updated in real-time

### 5. **Logout & Login**
- Click **"Profile"** → Scroll down → **"Logout"** button
- Should show login page
- Sign up with new email or login again

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| "localhost refused to connect" | Run `npm run dev` again |
| Map not showing | Check Google API key in index.html |
| Coins not updating | Hard refresh: Ctrl+Shift+Del, clear localStorage |
| Payment buttons not working | Try different payment method (UPI, Card, Netbanking) |
| Logout not working | Check browser console for errors (F12) |

---

## 📁 Important Files

```
AROHA/
├── src/
│   ├── components/
│   │   ├── HotelBookingModal.tsx       (7-step payment flow)
│   │   ├── ShopPage.tsx                (Food & products)
│   │   ├── MapPage.tsx                 (20+ places)
│   │   ├── PlanMyDayPage.tsx           (Check-ins, itineraries)
│   │   ├── ProfilePage.tsx             (User profile, logout)
│   │   └── [others...]
│   ├── utils/
│   │   └── rewards.ts                  (Coin system)
│   └── supabaseClient.ts               (Database connection)
├── .env.local                          (Your API keys - create if needed)
├── SETUP_GUIDE.md                      (Full setup with SQL)
├── APP_DOCUMENTATION.md                (Complete feature guide)
├── COMPLETION_SUMMARY.md               (What's done)
└── QUICK_START.md                      (This file)
```

---

## 💡 Pro Tips

1. **Test Multiple Users**: Clear localStorage → Sign up with different email
2. **Offline Testing**: Skip Supabase setup, use local coins in localStorage
3. **Check API Keys**: If maps don't load, verify Google API key is in index.html
4. **Browser Console**: Press F12 → Console tab to see any errors
5. **Payment Testing**: All 3 payment methods work in demo (UPI, Card, Netbanking)

---

## 🎉 What Happens Next?

### To Deploy (Make Live):
1. Follow SETUP_GUIDE.md → Part 1 to create Supabase database
2. Get your Supabase URL & API key
3. Create `.env.local` file
4. Run `npm run build`
5. Deploy `dist/` folder to Vercel, Netlify, or Firebase

### To Customize:
- Edit component files in `src/components/`
- Modify place data in `MapPage.tsx`
- Update hotel/food items in respective pages
- Change colors/styles via Tailwind CSS classes

---

## 📞 Need Help?

- **Setup issues**: See SETUP_GUIDE.md → Troubleshooting
- **Feature details**: See APP_DOCUMENTATION.md
- **Code questions**: Check component files (well-commented)

---

**Ready to run?** → Type: `npm run dev`

Let's go! 🚀

# AROHA Setup & Configuration Guide

## 🎯 Complete Setup Instructions

### Part 1: Supabase Database Setup

#### Step 1: Create Supabase Account & Project
1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Choose:
   - Name: `AROHA`
   - Database Password: Set strong password
   - Region: `Asia Pacific (Singapore)` - closest to India
4. Click "Create new project" and wait 2-3 minutes

#### Step 2: Get Your Credentials
1. After project loads, go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://[your-project].supabase.co`
   - **anon public key**: Your public API key
3. Save these - you'll need them in `.env.local`

#### Step 3: Create Database Tables
1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy-paste each SQL block below and execute:

**Table 1: Profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  coins INTEGER DEFAULT 1350,
  rewards_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy: Service role can insert
CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
WITH CHECK (true);
```

**Table 2: Hotel Bookings**
```sql
CREATE TABLE hotel_bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hotel_name VARCHAR(255) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  rooms INTEGER DEFAULT 1,
  total_price VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE hotel_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their bookings"
ON hotel_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their bookings"
ON hotel_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Table 3: Orders (Food & Products)**
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Table 4: Check-ins**
```sql
CREATE TABLE check_ins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  location_name VARCHAR(255) NOT NULL,
  coins_earned INTEGER DEFAULT 25,
  itinerary_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their check-ins"
ON check_ins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert check-ins"
ON check_ins FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Table 5: Coin Activities**
```sql
CREATE TABLE coin_activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(100),
  coins_earned INTEGER DEFAULT 0,
  coins_spent INTEGER DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE coin_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their activities"
ON coin_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert activities"
ON coin_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### Step 4: Enable Authentication
1. Go to **Authentication** → **Providers**
2. Ensure "Email" is enabled
3. Go to **Email Templates**
4. Optional: Customize welcome emails
5. Go to **URL Configuration**
6. Add your app URLs:
   - `http://localhost:5175` (dev)
   - `https://yourdomain.com` (production)

---

### Part 2: Google Maps API Setup

#### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Name it: `AROHA`
4. Click **Create**

#### Step 2: Enable Required APIs
1. Go to **APIs & Services** → **Library**
2. Search and enable each:
   - **Maps JavaScript API**
   - **Places API**
   - **Directions API**
   - **Geocoding API**
   - **Distance Matrix API**

#### Step 3: Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the key (you'll see it as `AIzaSy...`)
4. Click the key to set restrictions:
   - **Application restrictions**: HTTP referrers
   - **Add URL**: `localhost:5175`, `yourdomain.com`
   - **API restrictions**: Check only the 5 APIs above

#### Step 4: Add to Project
Edit `index.html` in your project root:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places,directions&language=en"></script>
```

Replace `YOUR_API_KEY_HERE` with your actual key from Step 3.

---

### Part 3: Local Project Setup

#### Step 1: Install Node.js
- Download from https://nodejs.org (v16 or higher)
- Install and verify: `node --version`

#### Step 2: Clone & Install
```bash
# Navigate to project folder
cd path/to/AROHA

# Install dependencies
npm install
```

#### Step 3: Create `.env.local`
Create a file `.env.local` in the project root with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual Supabase credentials from Part 1, Step 2.

#### Step 4: Update index.html
Open `index.html` and find:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=PLACEHOLDER"></script>
```

Replace `PLACEHOLDER` with your Google Maps API key from Part 2, Step 3.

#### Step 5: Start Development Server
```bash
npm run dev
```

Output will show:
```
➜  Local:   http://localhost:5175/
```

Open http://localhost:5175 in your browser!

---

## 🧪 Testing Checklist

### Authentication
- [ ] Signup with new email works
- [ ] Login with existing email works
- [ ] Profile auto-creates with 1350 coins
- [ ] Logout button appears & works
- [ ] Login screen appears after logout
- [ ] Session persists on page refresh

### Hotels
- [ ] Hotels page loads with 6+ hotels
- [ ] Click "Book Now" opens modal
- [ ] Date picker works for check-in/check-out
- [ ] Bill shows correct calculations:
  - [ ] Room charges with room type multiplier
  - [ ] SGST/CGST 9% each
  - [ ] Platform fee ₹199
  - [ ] One-time charges (pickup/checkin/checkout)
  - [ ] Coupon discount (try AROHA15)
- [ ] T&C dialog opens from bill page
- [ ] Payment methods display (UPI/Card/Netbanking)
- [ ] UPI QR loads & timer counts down 5 minutes
- [ ] Success screen shows coins earned
- [ ] Profile coins updated after booking

### Map & Places
- [ ] Map loads with Google Maps
- [ ] 20 places display on map
- [ ] Search works (type "temple", "market", etc)
- [ ] Categories filter works (Temple, Heritage, Nature, Shopping)
- [ ] Click marker shows place details
- [ ] Artisan shops visible on map
- [ ] Danger zones highlighted

### Plan My Day
- [ ] 4 itineraries display (3hr, half-day morning/evening, full-day)
- [ ] Check-in button adds +25 coins
- [ ] Save itinerary adds +100 coins
- [ ] Book itinerary adds +100 coins
- [ ] Profile coins updated after each action

### Shop (Food)
- [ ] Swaadh tab shows 7 food items
- [ ] Add to cart works
- [ ] Cart total calculates correctly
- [ ] Checkout button opens payment screen
- [ ] After payment, food-tracking screen shows
- [ ] Delivery partner info displays
- [ ] Live status updates every 5 seconds
- [ ] Coins earned display on tracking screen

### Shop (Products)
- [ ] Products tab shows 11 items
- [ ] Add to cart works
- [ ] Checkout opens payment screen
- [ ] After payment, Amazon-style tracking shows
- [ ] 6-step progress tracker displays
- [ ] Expected delivery date shows (4 days)
- [ ] Coins earned display on tracking screen

### Profile
- [ ] User info displays correctly
- [ ] Coins balance shows accurate total
- [ ] Recently visited places show
- [ ] Logout button visible
- [ ] Click logout → cleared session → login screen appears

### Payments
- [ ] UPI QR code generates correctly
- [ ] Card number auto-formats
- [ ] Netbanking bank list loads (25+ banks)
- [ ] Bank search filter works
- [ ] All 3 payment methods redirect to success

### Coins & Rewards
- [ ] Profile shows correct coin balance
- [ ] Coins update in real-time after actions
- [ ] Activity history shows recent coin changes
- [ ] Coins displayed on post-payment screens

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "localhost refused to connect" | Dev server crashed. Run `npm run dev` again |
| Map not loading | Google API key wrong or not enabled in index.html |
| Coins not updating | Clear localStorage & refresh: `F12 → Application → Clear` |
| Can't log out | Check browser console for errors; ensure onLogout prop wired in App.tsx |
| Payment QR blank | Check QR API endpoint: `api.qrserver.com` |
| Supabase auth fails | Verify URL configuration in Supabase dashboard |
| Places not showing | Check MapPage.tsx has 20+ places in array |

---

## 📊 Database Verification

To check if your database is set up correctly:

1. Go to Supabase **Table Editor**
2. You should see 5 tables:
   - profiles
   - hotel_bookings
   - orders
   - check_ins
   - coin_activities

3. Go to **Authentication** → **Users**
4. You should see test users you created

---

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```
Creates optimized files in `dist/` folder

### Deploy Options
- **Vercel** (Recommended): Push to GitHub, auto-deploys
- **Netlify**: Similar to Vercel
- **Firebase Hosting**: Simple deployment
- **AWS Amplify**: Enterprise option

### Pre-Deployment Checklist
- [ ] Update `index.html` Google Maps key for production domain
- [ ] Update `.env.local` with production Supabase URL
- [ ] Add production URL to Supabase **URL Configuration**
- [ ] Add production domain to Google Maps API restrictions
- [ ] Run `npm run build` and test `dist/` locally
- [ ] Set up HTTPS (required for Maps API)

---

## 📞 Support

If you encounter issues:
1. Check console errors: `F12 → Console`
2. Check Network tab for failed requests
3. Verify Supabase & Google API keys
4. Check `.env.local` exists and is correct
5. Clear browser cache & localStorage

---

**Version**: 1.0
**Last Updated**: May 2026
**Status**: ✅ Ready for Production

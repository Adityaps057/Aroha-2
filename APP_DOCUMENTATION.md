# AROHA - Heritage Travel App
## Complete Documentation & Implementation Guide

---

## 📋 Table of Contents
1. [App Overview](#app-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [API Configuration](#api-configuration)
6. [Authentication](#authentication)
7. [Reward System](#reward-system)
8. [Module-by-Module Guide](#module-by-module-guide)
9. [Payments & Checkout](#payments--checkout)
10. [How to Run](#how-to-run)
11. [Environment Setup](#environment-setup)

---

## 🎯 App Overview

**AROHA** (A Route Of Heritage Aspirations) is a comprehensive heritage city travel platform designed for Mysuru. It enables travelers to discover, plan, and book experiences while earning reward points for various activities.

**Primary Use Cases:**
- Discover heritage sites, temples, tourist attractions
- Plan multi-day itineraries with pre-designed trips
- Book hotels with itemized billing and multiple payment methods
- Order local food via Swaadh food delivery
- Browse and purchase artisan products
- Check in at locations to earn coins
- Track rewards and redemptions

---

## ✨ Features

### 1. **Home & Discovery**
- Trending news articles about Mysuru's heritage, culture, and tourism
- Quick access to all major features
- Real-time notifications

### 2. **Hotels Booking**
- Browse 6+ luxury and budget hotels
- Beautiful calendar date range picker
- Itemized bill breakdown with:
  - Room charges (based on room type & AC availability)
  - Breakfast charges (₹500/night if selected)
  - Airport pickup (₹1,500)
  - Early check-in (₹1,000)
  - Late checkout (₹800)
  - SGST & CGST (9% each, applied only to room charges)
  - Platform fee (₹199)
  - Coupon discounts (15% if AROHA15 applied)
- Multiple payment methods:
  - **UPI**: QR code with 5-minute countdown timer
  - **Credit/Debit Card**: Form with auto-formatting
  - **Net Banking**: 25+ Indian & foreign banks
- Post-booking coin rewards: **100 base coins + 1% of booking amount**
- Success screen with payment confirmation

### 3. **Places & Map**
- Interactive Google Map with:
  - 20+ tourist attractions (temples, markets, heritage sites, gardens)
  - Real-time artisan shops with locations
  - Danger zones highlighted (crime/crowd alerts)
  - Travel time & distance calculation
  - Custom place search with autocomplete
  - Artisan route planning
- Categories: Temples, Heritage, Shopping, Nature, Food, Artisan
- Artisan profiles: crafts, products, ratings, locations
- Artisan routing: visit multiple artisans on optimal route

### 4. **Plan My Day**
- Pre-designed itineraries:
  - 3-Hour Quick Escape (₹800-₹1,200)
  - Half-Day Explorer (₹1,500-₹2,000)
  - Full-Day Heritage Journey (₹2,500-₹4,000)
  - Multi-Day Explorer (₹5,000-₹15,000)
- Check-in functionality at each stop: **+25 coins per check-in**
- Save itinerary: **+100 coins**
- Book itinerary: **+100 coins**
- Real-time activity tracking

### 5. **Marketplace (Shop)**
- **Swaadh**: Local food ordering
  - 7 authentic dishes with images
  - Real-time delivery tracking (25-35 min ETA)
  - Delivery partner details (name, rating, vehicle)
  - Live status updates
  - Coins earned: **50 base + 5% of order amount**

- **Artisan Products**: Handcrafted items
  - Mysore silk sarees, sandalwood items, sweets, fragrances
  - 11 curated products
  - Amazon-style delivery tracking
  - Expected delivery in 4 days
  - 6-step progress tracker
  - Coins earned: **50 base + 5% of order amount**

### 6. **Rewards & Points**
- Coin-based system:
  - Hotel booking: 100 + (1% of booking)
  - Food order: 50 + (5% of order)
  - Product purchase: 50 + (5% of order)
  - Plan check-in: 25 coins per location
  - Save itinerary: 100 coins
  - Photo upload: 30 coins
  - Review posting: 40 coins
- Display: Coins shown in Profile, Shopping cart, post-payment screens
- Redemption: Profile page has redemption tracking

### 7. **Profile & Settings**
- User information management
- View coins balance & activity history
- Recently visited places
- **Logout button** (with proper session clearing)
- Notification & theme preferences
- Premium membership status

### 8. **Premium Features**
- ✅ Premium booking discount
- ✅ Exclusive artisan access
- ✅ Priority customer support
- ✅ Early access to new itineraries

### 9. **Security & Safety**
- SOS Page: Emergency contact, safety tips
- Reviews Page: Community feedback
- Danger zones map visualization
- Safe routing recommendations

---

## 🛠️ Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Lucide Icons** - Icon system
- **Sonner** - Toast notifications
- **date-fns** - Date formatting & calculations
- **react-day-picker** - Calendar component

### Backend & Services
- **Supabase** - PostgreSQL database + Auth
- **Google Maps API** - Maps, places, routing
- **Google Places API** - Place search & autocomplete
- **QR Server API** - UPI QR code generation

### Authentication
- Supabase Auth (Email/Password)
- Session persistence in localStorage
- Auto-login on app restart

---

## 💾 Database Schema

### Tables in Supabase

#### 1. **profiles** table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  coins INTEGER DEFAULT 1350,
  rewards_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **hotel_bookings** table
```sql
CREATE TABLE hotel_bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hotel_name VARCHAR(255),
  check_in DATE,
  check_out DATE,
  guests INTEGER,
  rooms INTEGER,
  total_price VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. **orders** table
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_name VARCHAR(255),
  price DECIMAL(10, 2),
  quantity INTEGER,
  total_price DECIMAL(10, 2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. **check_ins** table
```sql
CREATE TABLE check_ins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  location_name VARCHAR(255),
  coins_earned INTEGER,
  itinerary_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. **coin_activities** table
```sql
CREATE TABLE coin_activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity VARCHAR(255),
  coins_earned INTEGER,
  coins_spent INTEGER,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RLS (Row Level Security) Policies
- Users can only view/modify their own data
- Public profiles visible for ratings & reviews
- Hotel_bookings/orders/check_ins restricted to user

---

## 🔑 API Configuration

### Supabase Setup
1. Create account at https://supabase.com
2. Create new project (Region: Asia/India recommended)
3. Get credentials:
   - **Project URL**: `https://[your-project].supabase.co`
   - **API Key (anon)**: Publicly shareable key
   - **Service Role Key**: Keep secret, for admin operations

4. File: `src/supabaseClient.ts`
```typescript
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Google Maps API
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create new project or select existing
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. Create API key (public)
5. File: `index.html`
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,directions&language=en"></script>
```

### QR Server API (No authentication needed)
- Endpoint: `https://api.qrserver.com/v1/create-qr-code/`
- Free, no setup required
- Used for UPI QR generation

---

## 🔐 Authentication Flow

### Login Process
1. User enters email → Password
2. Supabase `signInWithPassword()` verifies credentials
3. Session token created in `auth.users` table
4. Profile auto-created if doesn't exist (1350 starting coins)
5. Session persisted in localStorage: `sb-[project]-auth-token`
6. Redirect to Home

### Logout Process
```typescript
await supabase.auth.signOut();
localStorage.removeItem("aroha_logged_in_persist");
localStorage.removeItem("aroha_logged_in_email");
// User redirected to Login screen
```

### Session Restoration
- On app load, check localStorage for auth token
- If found, verify with Supabase
- If valid, skip login screen
- If invalid, show login

---

## 🪙 Reward System Architecture

### Coin Earning
**Sources:**
- Hotel booking: 100 + (1% of total amount)
- Food order: 50 + (5% of order total)
- Product purchase: 50 + (5% of order total)
- Check-in at locations: 25 per check-in
- Save itinerary: 100
- Book itinerary: 100
- Photo upload: 30
- Review post: 40

### Implementation (`src/utils/rewards.ts`)
```typescript
export async function addCoins(amount: number, reason: string): Promise<number>
```
- Adds coins to local storage immediately
- Updates Supabase profiles.coins asynchronously
- Dispatches `window.event("aroha_rewards_updated")` for real-time UI sync
- Shows toast notification with coin amount

### Display & Sync
- Profile page listens to `aroha_rewards_updated` event
- Coins shown in:
  - Profile header
  - Cart/checkout screens
  - Post-payment success screens
  - Activity history

---

## 📱 Module-by-Module Guide

### **HomePage**
- **File**: `src/components/HomePage.tsx`
- **Features**:
  - News carousel (10 Mysuru heritage articles)
  - Feature cards (Hotels, Places, Food, Events)
  - Navigation bar with 8 tabs
  - Responsive grid layout
- **Data**: Hardcoded newsArticles array
- **Actions**: Tap any card → navigate to respective module

### **HotelsPage**
- **File**: `src/components/HotelsPage.tsx`
- **Features**:
  - 6 hotels with images & ratings
  - Search by name/location
  - Filter by category (Luxury, Budget, Family)
  - Click "Book Now" → HotelBookingModal
- **Data**: Static hotels array with amenities

### **HotelBookingModal** ⭐
- **File**: `src/components/HotelBookingModal.tsx`
- **7-Step Flow**:
  1. **Form**: Select dates, guests, room type, add-ons
  2. **Bill**: Itemized breakdown with taxes
  3. **T&C**: Nested dialog with hotel policies
  4. **Payment Select**: Choose UPI/Card/Netbanking
  5. **Payment Detail**: 
     - UPI: Scan QR, 5-min timer
     - Card: Enter card details
     - Netbanking: Select bank from list
  6. **Success**: Show confirmation + coins earned
  7. **Coins**: Update profile balance
- **Bill Calculation**:
  - Room charges = base price × room multiplier × nights
  - SGST/CGST = 9% × (room + breakfast only)
  - Platform fee = ₹199 (flat)
  - One-time charges = add-ons (NOT taxed)
  - Coupon discount = 15% of subtotal

### **MapPage** 
- **File**: `src/components/MapPage.tsx`
- **Features**:
  - Google Map with 20+ places
  - Categories: Temples, Heritage, Shopping, Nature, Food
  - Search with autocomplete
  - Danger zones visualization
  - Artisan shops & routes
  - Direction calculation
- **Data**: Static places & artisans arrays
- **Map**: Standard/Satellite view toggle

### **PlanMyDayPage**
- **File**: `src/components/PlanMyDayPage.tsx`
- **4 Itineraries**:
  1. **3-Hour Quick Escape**: Palace → Market → Coffee (₹800-₹1,200)
  2. **Half-Day Morning**: Chamundi Hills → Zoo → Lunch (₹1,500-₹2,000)
  3. **Half-Day Evening**: Palace → Gardens → Dinner (₹1,500-₹2,000)
  4. **Full-Day Journey**: 4+ stops covering heritage sites (₹2,500-₹4,000)
- **Check-in**: +25 coins per location
- **Save**: +100 coins
- **Book**: +100 coins

### **ShopPage**
- **File**: `src/components/ShopPage.tsx`
- **2 Tabs**:
  1. **Swaadh** (Food):
     - 7 authentic dishes
     - Cart management
     - Payment → Food tracking screen
     - Live status updates
     - Delivery partner info
  2. **Artisan Products**:
     - 11 products (sarees, handicrafts, sweets)
     - Product cards with prices
     - Payment → Amazon-style tracking
     - Expected delivery date
     - 6-step progress tracker
- **Coin Rewards**: Post-payment screen shows +coins earned & new balance

### **ProfilePage**
- **File**: `src/components/ProfilePage.tsx`
- **Sections**:
  - User info (avatar, name, level, premium status)
  - Coins display with activity breakdown
  - Recently visited places (5 items)
  - Settings: theme, notifications, language
  - **Logout button** (triggers `onLogout` callback in App.tsx)
- **Data**: Synced from Supabase profiles table

### **ReviewsPage**
- **File**: `src/components/ReviewsPage.tsx`
- **Features**:
  - Community reviews from travelers
  - Filter by rating & location
  - Write review (earn 40 coins)
  - Photos upload (earn 30 coins)

### **RewardsPage**
- **File**: `src/components/RewardsPage.tsx`
- **Sections**:
  - Coin balance display
  - Recent activities (check-ins, purchases, etc.)
  - Redemption options
  - Leaderboard (top travelers)

---

## 💳 Payments & Checkout

### Payment Flow (HotelBookingModal)
```
1. Form (Select dates/guests/options)
   ↓
2. Bill (Review itemized breakdown)
   ↓
3. T&C (Read terms & conditions)
   ↓
4. Payment Select (UPI/Card/Netbanking)
   ↓
5. Payment Detail (Enter payment info)
   ↓
6. Success (Confirmation + coins earned)
   ↓
7. DB Update (Supabase hotel_bookings insert)
```

### UPI Payment Details
- **QR Code**: Generated from `https://api.qrserver.com/v1/create-qr-code/`
- **UPI URI**: `upi://pay?pa=aroha@paytm&am={amount}`
- **Timer**: 5 minutes (300 seconds), auto-advances on expiry
- **Apps**: PhonePe, GPay, Paytm, etc.

### Card Payment
- **Number**: Auto-formats to "XXXX XXXX XXXX XXXX"
- **Expiry**: MM/YY format with auto-separation
- **CVV**: Masked (type="password")
- **Validation**: Basic check (numbers only)

### Netbanking
- **Popular Banks** (10): SBI, HDFC, ICICI, Axis, etc.
- **Other Banks** (8): Union, Central, IOB, etc.
- **Foreign Banks** (8): Citibank, HSBC, etc.
- **Search**: Real-time filter by bank name

---

## 🚀 How to Run

### Prerequisites
- Node.js 16+ (https://nodejs.org)
- npm or yarn
- Git

### Step 1: Clone & Install
```bash
cd AROHA
npm install
```

### Step 2: Create `.env.local`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Add Google Maps API Key
Edit `index.html`:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,directions"></script>
```

### Step 4: Run Dev Server
```bash
npm run dev
```
- Opens at `http://localhost:5175/`

### Step 5: Build for Production
```bash
npm run build
```
- Output in `dist/` folder

---

## ⚙️ Environment Setup

### Supabase Project Setup
1. **Create tables** (run in Supabase SQL editor):
   - profiles
   - hotel_bookings
   - orders
   - check_ins
   - coin_activities

2. **Enable authentication**:
   - Auth → Providers → Email
   - Enable email/password

3. **Set RLS policies**:
   - Each table: Only users can view own records

### Google Cloud Setup
1. **Create project** in Google Cloud Console
2. **Enable APIs**:
   - Maps JavaScript API
   - Places API
   - Directions API
3. **Create API key** (unrestricted or with domain restrictions)
4. **Add to index.html**

### Local Development
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Hot reload enabled automatically

---

## 📊 Data Flow Diagram

```
User Login
    ↓
Session Created (Supabase Auth)
    ↓
Profile Auto-Provisioned (1350 coins)
    ↓
App Loaded (Home Page)
    ↓
Browse Features:
  ├→ Hotels → Book → Payment → Coins Earned
  ├→ Places → Map → Search → Artisans
  ├→ Itineraries → Check-in → +25 Coins
  ├→ Food → Order → Payment → Delivery Tracking
  ├→ Products → Buy → Payment → Product Tracking
  └→ Profile → View Coins → Logout
    ↓
All Activities Synced to Supabase
    ↓
Coins Updated in Real-time
```

---

## 🔗 API Endpoints Reference

### Supabase REST API
- Base: `https://[project].supabase.co/rest/v1/`
- Auth: Supabase JS client (automatic)
- Example: `GET /profiles?select=*` (with auth)

### Google Maps API
- Maps embed: `maps.googleapis.com/maps/api/js`
- Places Autocomplete: Built-in JS library
- Directions: `maps.googleapis.com/maps/api/directions/json`

### QR Server
- Endpoint: `api.qrserver.com/v1/create-qr-code/`
- Params: `size=200x200&data={encoded-data}`
- No auth needed

---

## 🎨 Styling & Theming

### Tailwind Classes
- Primary color: `bg-primary`, `text-primary`
- Borders: `border-border`, `border-2`
- Cards: `bg-card`, `rounded-2xl`
- Hover: `hover:bg-accent`, `hover:shadow-lg`

### Dark Mode
- Automatic theme detection
- Toggle in ProfilePage settings
- Stored in localStorage: `theme`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Map not loading | Check Google API key in index.html |
| Coins not updating | Clear localStorage & refresh |
| Logout not working | Ensure `onLogout` prop passed to ProfilePage |
| Places not showing | Verify Supabase data loaded in MapPage |
| Payment not processing | Check UPI timer, ensure valid dates selected |

---

## 📞 Support & Contact

- **App Name**: AROHA
- **Target City**: Mysuru, Karnataka, India
- **Version**: 1.0
- **Built with**: React + Vite + Supabase + Google Maps

---

**Last Updated**: May 2026
**Status**: ✅ Production Ready

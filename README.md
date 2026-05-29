# 🌍 AROHA - Discover Mysore with Rewards

> A comprehensive travel & rewards platform for exploring Mysore with integrated hotel bookings, food ordering, artisan shopping, and a sophisticated coin-based reward system.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Adityaps057/Aroha-2)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![React](https://img.shields.io/badge/react-18.3-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.2-blue)](https://www.typescriptlang.org)
[![Status](https://img.shields.io/badge/status-production%20ready-success)](#-deployment)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Configuration](#-api-configuration)
- [Database](#-database)
- [Development](#-development)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [License](#-license)

---

## ✨ Features

### 🏨 Hotel Booking System
- Browse and search 7+ hotels in Mysore
- Interactive calendar date picker
- Itemized billing with:
  - Room charges with multipliers (Deluxe/Super Deluxe/Premium)
  - AC factor pricing
  - Breakfast charges
  - SGST/CGST taxes (9% each)
  - Platform fees and one-time charges
  - Coupon discount support (e.g., AROHA15 = 15% off)

### 💳 Multi-Method Payment System
- **UPI Payment**: QR code generation with 5-minute countdown timer
- **Card Payment**: Auto-formatting with CVV encryption
- **Net Banking**: 25+ Indian & foreign banks with search filter

### 🍽️ Food Ordering (Swaadh)
- 7 curated food items from local eateries
- Real-time delivery tracking with:
  - Animated status bar (Confirmed → Preparing → Picked Up → Delivered)
  - Live delivery partner details
  - ETA countdown (25-35 minutes)
  - Delivery truck animation on map

### 🛍️ Artisan Shopping
- 11 handcrafted artisan products
- Amazon-style order tracking with:
  - 6-step progress tracker
  - Expected delivery date
  - Order status updates
  - Support contact options

### 🗺️ Interactive Map & Places
- 20+ curated tourist destinations
- Real-time search and filtering by:
  - Heritage sites
  - Nature & wildlife
  - Temples
  - Shopping districts
  - Cuisine spots
- Danger zone visualization (crime hotspots)
- Distance calculation from current location
- Google Maps integration with directions

### 🎯 Plan My Day - Itineraries
- 4 itinerary types:
  - 3-hour quick escapes
  - Half-day morning/evening tours
  - Full-day heritage journeys
  - Multi-day expeditions
- Check-in rewards system
- Itinerary booking & saving

### 🪙 Coin Reward System
- **Starting balance**: 1350 coins per user
- **Earn coins from**:
  - Place check-ins: +25 coins
  - Save itinerary: +100 coins
  - Book itinerary: +100 coins
  - Hotel bookings: +100 base + 1% of booking amount
  - Food orders: +50 base + 5% of order amount
  - Product orders: +50 base + 5% of order amount
- Real-time balance updates
- Transaction history

### 👤 User Profile
- Editable profile with email, phone, bio
- Travel preference settings
- Coin balance display
- Recently visited places
- Saved itineraries
- Travel memories gallery
- Statistics dashboard (trips, gems visited, reviews)

### 🔐 Authentication
- Email/password authentication via Supabase
- Session persistence
- Auto-profile provisioning
- Secure logout

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18.3, TypeScript 5.2 |
| **Build Tool** | Vite 6.3.5 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | shadcn/ui, Lucide Icons |
| **State Management** | React Hooks, Context API |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Maps** | Google Maps API |
| **Notifications** | Sonner (Toast) |
| **Forms** | React Hook Form (implicit) |
| **HTTP Client** | Supabase Client |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Adityaps057/Aroha-2.git
cd Aroha-2
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

4. **Configure API Keys**
Edit `.env.local` and add:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

5. **Start development server**
```bash
npm run dev
```

Open [http://localhost:5175](http://localhost:5175) in your browser.

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
Aroha-2/
├── src/
│   ├── components/
│   │   ├── HotelBookingModal.tsx      # 7-step hotel payment flow
│   │   ├── ShopPage.tsx               # Food & product ordering
│   │   ├── MapPage.tsx                # Interactive map with 20+ places
│   │   ├── PlanMyDayPage.tsx          # Itineraries & check-ins
│   │   ├── ProfilePage.tsx            # User profile & settings
│   │   ├── LoginPage.tsx              # Authentication
│   │   ├── HotelsPage.tsx             # Hotel browsing
│   │   ├── PlacesPage.tsx             # Places directory
│   │   ├── ui/                        # Shadcn UI components
│   │   └── [other components...]
│   ├── utils/
│   │   └── rewards.ts                 # Coin system logic
│   ├── supabaseClient.ts              # Supabase configuration
│   ├── App.tsx                        # Main app component
│   └── main.tsx                       # Entry point
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
├── vite.config.ts                     # Vite configuration
├── package.json                       # Dependencies
└── README.md                          # This file
```

---

## 🔑 API Configuration

### Google Maps API

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project named "AROHA"
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
   - Distance Matrix API
4. Create an API key under Credentials
5. Restrict to HTTP referrers: `localhost:5175`, `yourdomain.com`
6. Add to `.env.local`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Supabase

**Setup Steps:**
1. Go to [Supabase](https://supabase.com)
2. Create a new project named "AROHA"
3. Choose Singapore region (closest to India)
4. Get credentials from Settings → API:
   - Project URL
   - Anon Key
5. Run SQL table creation scripts (see SETUP_GUIDE.md)
6. Add to `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**⚠️ Security Note**: Never commit `.env.local` - it's in `.gitignore` for your protection.

---

## 🗄️ Database

The app uses Supabase (PostgreSQL) with 5 tables:
- **profiles** - User data & coin balance
- **hotel_bookings** - Hotel reservations
- **orders** - Food & product orders
- **check_ins** - Place check-in records
- **coin_activities** - Transaction history

All tables have Row-Level Security (RLS) enabled for multi-tenant safety.

See **SETUP_GUIDE.md** for complete SQL schema.

---

## 💻 Development

### Built With
- **React Hooks** for functional components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for backend
- **Google Maps** for location services

### Key Components

- **HotelBookingModal.tsx** - 7-step payment flow
- **ShopPage.tsx** - Food & product ordering
- **MapPage.tsx** - Interactive map with 20+ places
- **PlanMyDayPage.tsx** - Itineraries & check-ins
- **ProfilePage.tsx** - User profile & settings

See **APP_DOCUMENTATION.md** for detailed module guide.

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output: Optimized files in `dist/` folder

### Deploy to Vercel (Recommended)
1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Deploy to Netlify, Firebase, or AWS
See **SETUP_GUIDE.md** → Production Deployment section.

---

## 📚 Documentation

Comprehensive guides included:

| Document | Purpose |
|----------|---------|
| **QUICK_START.md** | 5-minute setup guide |
| **SETUP_GUIDE.md** | Complete setup with SQL, troubleshooting, deployment |
| **APP_DOCUMENTATION.md** | Feature overview, module guide |
| **COMPLETION_SUMMARY.md** | Implementation checklist |
| **VERIFICATION_CHECKLIST.md** | Feature verification (200+ items) |

---

## 🔒 Security

- ✅ Row-Level Security (RLS) on database
- ✅ Environment variables for secrets
- ✅ Supabase Auth for authentication
- ✅ Session management with secure logout
- ✅ Never commit `.env.local` (in `.gitignore`)

---

## 📝 License

MIT License - see LICENSE file for details

---

## 💬 Support

- 📖 Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for setup issues
- 🔍 Review [APP_DOCUMENTATION.md](APP_DOCUMENTATION.md) for features
- 🐛 Open an issue on GitHub

---

**Version**: 1.0 | **Status**: ✅ Production Ready | **Updated**: May 29, 2026
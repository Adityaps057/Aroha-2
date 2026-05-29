-- AROHA Travel & Heritage Explorer
-- Supabase Schema Initialization SQL Script
-- Copy and paste this script directly into your Supabase SQL Editor (https://database.new) to provision your backend tables.

-- =========================================================================
-- 1. PROFILES TABLE (linked to Auth.Users)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    bio TEXT DEFAULT 'Travel enthusiast exploring India''s hidden gems. Love heritage sites and local cuisine!',
    avatar TEXT DEFAULT '👩',
    level TEXT DEFAULT 'Explorer Elite',
    is_premium BOOLEAN DEFAULT TRUE,
    coins INTEGER DEFAULT 1350,
    trips_completed INTEGER DEFAULT 12,
    hidden_gems_visited INTEGER DEFAULT 8,
    rewards_redeemed INTEGER DEFAULT 3,
    favorite_category TEXT DEFAULT 'Heritage',
    budget_preference TEXT DEFAULT 'Mid-range',
    travel_style TEXT DEFAULT 'Cultural Explorer',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS and create open security policies for demo execution convenience
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert/update their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Trigger to automatically create a profile record when a new user signs up in Auth!
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, avatar)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        COALESCE(new.raw_user_meta_data->>'phone', new.phone),
        '👩'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =========================================================================
-- 2. REVIEWS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGSERIAL PRIMARY KEY,
    user_name TEXT DEFAULT 'Explorer',
    user_avatar TEXT DEFAULT '👤',
    user_location TEXT DEFAULT 'India',
    place TEXT NOT NULL,
    category TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    is_top_explorer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS and setup open select/insert policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert to reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update/delete to reviews" ON public.reviews FOR ALL USING (true);

-- Insert Default Mock Reviews
INSERT INTO public.reviews (user_name, user_avatar, user_location, place, category, rating, content, likes, comments, is_top_explorer)
VALUES 
('Priya Sharma', '👩', 'Bangalore', 'Mysore Palace', 'Heritage', 5, 'Absolutely stunning! The architecture is breathtaking, especially during the evening light show. A must-visit for anyone coming to Mysore.', 124, 18, true),
('Raj Kumar', '👨', 'Chennai', 'Chamundi Hills', 'Nature', 5, 'Perfect spot for sunrise! The view from the top is incredible. The climb of 1000 steps is worth it. Don''t miss the giant Nandi statue on the way up!', 89, 12, false),
('Ananya Iyer', '👧', 'Mumbai', 'Guru Sweet Mart', 'Food', 4, 'The Mysore Pak here is legendary! Fresh, authentic, and melts in your mouth. Also tried their special masala dosa - absolutely delicious.', 156, 24, true);


-- =========================================================================
-- 3. HOTEL BOOKINGS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.hotel_bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    hotel_name TEXT NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    guests INTEGER DEFAULT 1,
    rooms INTEGER DEFAULT 1,
    total_price TEXT DEFAULT '0',
    status TEXT DEFAULT 'Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.hotel_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select bookings" ON public.hotel_bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert bookings" ON public.hotel_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public all bookings" ON public.hotel_bookings FOR ALL USING (true);


-- =========================================================================
-- 4. ORDERS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price INTEGER NOT NULL,
    status TEXT DEFAULT 'Processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public all orders" ON public.orders FOR ALL USING (true);

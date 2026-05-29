import { useState, useEffect } from "react";
import { Home, MapPin, Hotel, Map, Calendar, MessageSquare, Gift, User, Search, Clock, Crown, Newspaper, ArrowRight, Star, TrendingUp, Users, AlertCircle, ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { PlacesPage } from "./components/PlacesPage";
import { HotelsPage } from "./components/HotelsPage";
import { RewardsPage } from "./components/RewardsPage";
import { ReviewsPage } from "./components/ReviewsPage";
import { PlanMyDayPage } from "./components/PlanMyDayPage";
import { ProfilePage } from "./components/ProfilePage";
import { PremiumPage } from "./components/PremiumPage";
import { SOSPage } from "./components/SOSPage";
import { MapPage } from "./components/MapPage";
import { ShopPage } from "./components/ShopPage";
import { SplashScreen } from "./components/SplashScreen";
import { LoginPage } from "./components/LoginPage";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { supabase } from "./supabaseClient";

// Helper to check if we are in the middle of an OAuth redirect
const isAuthRedirectOrSession = () => {
  try {
    const hasHash = window.location.hash.includes("access_token=") ||
                    window.location.hash.includes("id_token=") ||
                    window.location.hash.includes("error=");
    const hasCode = window.location.search.includes("code=");

    let hasSession = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        hasSession = true;
        break;
      }
    }
    return hasHash || hasCode || hasSession;
  } catch (e) {
    return false;
  }
};

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !isAuthRedirectOrSession());
  const [showLogin, setShowLogin] = useState(() => !isAuthRedirectOrSession());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [placesFilter, setPlacesFilter] = useState<string>("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Restore user session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          setShowLogin(false);
          setShowSplash(false);
          setActiveNav("Home");
          localStorage.setItem("aroha_logged_in_persist", "true");
          toast.success(`Session restored: ${session.user.email}`);
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      }
    };
    checkSession();

    // Listen for auth state changes (sign-in, sign-out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setShowLogin(false);
        setShowSplash(false);
        setActiveNav("Home");
        localStorage.setItem("aroha_logged_in_persist", "true");

        // Immediate database profiles auto-provisioning check
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (!profile) {
            await supabase.from("profiles").insert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Explorer",
              phone: session.user.user_metadata?.phone || session.user.phone || "",
              coins: 1350
            });
          }
        } catch (e) {
          console.warn("Auto-provision profile check failed:", e);
        }
      } else {
        setIsLoggedIn(false);
        setShowLogin(true);
        localStorage.removeItem("aroha_logged_in_persist");
        localStorage.removeItem("aroha_logged_in_email");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Only show login if the user is not already logged in
    if (!isLoggedIn) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
      setActiveNav("Home");
    }
  };

  const handleLogin = () => {
    setShowLogin(false);
    setIsLoggedIn(true);
    setActiveNav("Home");
    localStorage.setItem("aroha_logged_in_persist", "true");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Touch handlers for swipe-to-close
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    // Close sidebar on left swipe
    if (isLeftSwipe && isSidebarOpen) {
      closeSidebar();
    }

    // Open sidebar on right swipe from left edge
    if (isRightSwipe && !isSidebarOpen && touchStart < 30) {
      toggleSidebar();
    }
  };

  const handleNavClick = (label: string) => {
    setActiveNav(label);
    // Reset places filter when navigating directly from sidebar
    if (label === "Places") {
      setPlacesFilter("All");
    }
    closeSidebar(); // Close sidebar after navigation on mobile
    toast.success(`Navigated to ${label}`);
  };

  const handleCategoryClick = (title: string) => {
    setSelectedCategory(title);
    // Map home categories to Places page categories
    const categoryMap: { [key: string]: string } = {
      "Heritage": "Heritage",
      "Palaces": "Heritage",
      "Nature": "Nature",
      "Cuisine": "Cuisine"
    };
    setPlacesFilter(categoryMap[title] || "All");
    setActiveNav("Places");
    toast.success(`Exploring ${title} in Mysuru`);
  };

  const handlePlaceClick = (placeName: string, latitude: number, longitude: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
    toast.success(`Opening ${placeName} on Google Maps`);
  };

  const navItems = [
    { section: "EXPLORE", items: [
      { icon: Home, label: "Home" },
      { icon: MapPin, label: "Places" },
      { icon: Hotel, label: "Hotels" },
      { icon: ShoppingBag, label: "Order" },
      { icon: Map, label: "Map" },
    ]},
    { section: "COMMUNITY", items: [
      { icon: Calendar, label: "Events" },
      { icon: MessageSquare, label: "Reviews" },
      { icon: Gift, label: "Rewards" },
      { icon: AlertCircle, label: "SOS" },
    ]},
    { section: "ACCOUNT", items: [
      { icon: Crown, label: "Premium" },
      { icon: User, label: "Profile" },
    ]},
  ];

  const categoryCards = [
    { icon: "🏛️", title: "Heritage", color: "bg-gradient-to-br from-purple-600 to-purple-800" },
    { icon: "🏰", title: "Palaces", color: "bg-gradient-to-br from-indigo-600 to-indigo-800" },
    { icon: "🌳", title: "Nature", color: "bg-gradient-to-br from-green-600 to-green-800" },
    { icon: "🍽️", title: "Cuisine", color: "bg-gradient-to-br from-orange-600 to-orange-800" },
  ];

  const mostCrowdedPlaces = [
    {
      id: 1,
      name: "Mysore Palace",
      location: "Sayyaji Rao Rd, Agrahara",
      category: "Heritage",
      rating: 4.8,
      visitors: "15K+ Daily",
      image: "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      color: "from-purple-600 to-purple-800",
      latitude: 12.3051,
      longitude: 76.6551
    },
    {
      id: 2,
      name: "Brindavan Gardens",
      location: "KRS Backwater, Mandya",
      category: "Nature",
      rating: 4.6,
      visitors: "12K+ Daily",
      image: "https://images.unsplash.com/photo-1764351776302-55cc518790cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      color: "from-green-600 to-green-800",
      latitude: 12.4244,
      longitude: 76.5752
    },
    {
      id: 3,
      name: "Chamundi Hills",
      location: "Chamundi Hill Rd",
      category: "Nature",
      rating: 4.7,
      visitors: "10K+ Daily",
      image: "https://images.unsplash.com/photo-1709389137241-af48d39f8b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      color: "from-orange-600 to-orange-800",
      latitude: 12.2725,
      longitude: 76.6731
    },
    {
      id: 4,
      name: "St. Philomena's Cathedral",
      location: "Ashoka Rd, Lakshmipuram",
      category: "Heritage",
      rating: 4.7,
      visitors: "8K+ Daily",
      image: "https://images.unsplash.com/photo-1618805804116-797ea9369cb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      color: "from-blue-600 to-blue-800",
      latitude: 12.3151,
      longitude: 76.6405
    },
  ];

  const newsArticles = [
    {
      id: 1,
      title: "Mysore Dasara 2026: 500 Years of Royal Grandeur Continues",
      description: "Experience India's most spectacular 10-day festival as Mysuru celebrates with 100+ cultural programs, majestic processions, and stunning illuminations. The Jamboo Savari with caparisoned elephants remains the crown jewel of this UNESCO-recognized heritage celebration.",
      date: "May 24, 2026",
      category: "Events",
      icon: "🎭",
      image: "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 2,
      title: "Walking Through Time: Chamundi Hills Heritage Trail Launch",
      description: "Discover the spiritual heart of Mysuru with expert-guided heritage walks through Chamundi Hills. Learn about 16th-century temple architecture, local legends, and panoramic views of the city. Led by certified heritage conservationists who share untold stories of the Wodeyar dynasty.",
      date: "May 22, 2026",
      category: "Heritage",
      icon: "⛰️",
      image: "https://images.unsplash.com/photo-1709389137241-af48d39f8b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 3,
      title: "Mysore Palace Shines Brighter: Extended Night Illumination Experience",
      description: "Witness the Indo-Saracenic marvel in its full glory with enhanced LED lighting showcasing intricate architecture until 9 PM on weekends. A mesmerizing display of 50,000+ lights that brings the 150-year-old palace's grandeur to life, creating unforgettable memories for 200,000+ annual visitors.",
      date: "May 20, 2026",
      category: "Tourism",
      icon: "🏰",
      image: "https://images.unsplash.com/photo-1659126574791-13313aa424bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 4,
      title: "Reviving Ancient Craft: Master Class in Traditional Mysore Silk Weaving",
      description: "Step into a living heritage center preserving 300+ years of Mysore silk tradition. Hands-on workshops teach the intricate process of creating world-renowned Mysore Silk Sarees on traditional looms. Support local artisans while learning an art form recognized globally for its lustrous quality and vibrant colors.",
      date: "May 18, 2026",
      category: "Culture",
      icon: "🧵",
      image: "https://images.unsplash.com/photo-1772460759097-ad68b3232a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 5,
      title: "Brindavan Gardens Transforms: Technology Meets Timeless Beauty",
      description: "The crown jewel of Mysuru's gardens evolves with state-of-the-art synchronized water fountains and laser light shows. Watch mesmerizing dance sequences choreographed to Indian classical music across 60+ water jets, making it one of South India's most enchanting attractions.",
      date: "May 15, 2026",
      category: "Attractions",
      icon: "⛲",
      image: "https://images.unsplash.com/photo-1764351776302-55cc518790cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 6,
      title: "Journey Royally: 1920s Maharaja Train Coach Restored & Displayed",
      description: "A meticulously restored 1920s private railway coach of the Wodeyar Maharajas is now the centerpiece of Mysore Railway Museum. Marvel at original furnishings, royal memorabilia, and travel artifacts that tell tales of luxury rail journeys during India's golden era. A testament to royal heritage preserved.",
      date: "May 12, 2026",
      category: "Heritage",
      icon: "🚂",
      image: "https://images.unsplash.com/photo-1600112356915-089abb8fc71a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 7,
      title: "Culinary Heritage: Mysore's Royal Recipes Come Alive in New Food Museum",
      description: "Explore the flavors of royalty at Mysuru's first dedicated food heritage museum. Learn how 200-year-old recipes like Mysore Pak, Boondi Laddu, and Royal Biryani were crafted in palace kitchens. Taste authentic preparations in interactive cooking demonstrations guided by master chefs.",
      date: "May 10, 2026",
      category: "Culture",
      icon: "🍪",
      image: "https://images.unsplash.com/photo-1605521842384-83f5b814b5a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 8,
      title: "Hidden Gems: Rediscovering Mysuru's Lesser-Known Temples & Arts",
      description: "Beyond the famous Chamundeshwari Temple lies a treasure trove of 50+ heritage temples featuring exquisite architecture and intricate carvings. Guided exploration reveals hidden murals, ancient inscriptions, and spiritual sanctuaries that showcase the depth of Mysuru's spiritual legacy and artistic excellence.",
      date: "May 8, 2026",
      category: "Heritage",
      icon: "🕉️",
      image: "https://images.unsplash.com/photo-1731260342612-9d7d81e37c9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 9,
      title: "Sandalwood Secrets: Mysore's Fragrant Legacy in Global Perfumery",
      description: "Discover why Mysore sandalwood is prized worldwide as 'white gold'. The Government Sandalwood Museum reveals centuries-old harvesting techniques, traditional distillation methods, and the sacred relationship between sandalwood and Indian spirituality. Breathe in the essence of a heritage craft.",
      date: "May 5, 2026",
      category: "Tourism",
      icon: "🌸",
      image: "https://images.unsplash.com/photo-1509349441914-c4456a5d9ac4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 10,
      title: "Art & Architecture: Mysore School of Painting Gets Global Recognition",
      description: "The distinctive Mysore School of Painting—known for intricate mythological themes on gold leaf—receives UNESCO Cultural Heritage recognition. Contemporary artists are reviving this 400-year tradition with modern interpretations while honoring classical techniques, attracting art enthusiasts from 40+ countries.",
      date: "May 2, 2026",
      category: "Culture",
      icon: "🎨",
      image: "https://images.unsplash.com/photo-1552671881-a86fb4a9e635?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    }
  ];

  const renderPage = () => {
    switch (activeNav) {
      case "Places":
        return <PlacesPage initialCategory={placesFilter} initialSearchQuery={searchQuery} />;
      case "Hotels":
        return <HotelsPage />;
      case "Order":
        return <ShopPage />;
      case "Rewards":
        return <RewardsPage />;
      case "Reviews":
        return <ReviewsPage />;
      case "Events":
        return <PlanMyDayPage />;
      case "Premium":
        return <PremiumPage />;
      case "Profile":
        return <ProfilePage onLogout={() => {
          setIsLoggedIn(false);
          setShowLogin(true);
        }} />;
      case "SOS":
        return <SOSPage />;
      case "Map":
        return <MapPage />;
      default:
        return renderHomePage();
    }
  };

  const renderHomePage = () => (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
          <span className="uppercase tracking-wide">WELCOME BACK, WANDERER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-foreground leading-tight">
          Discover Hidden <span className="font-black">Mysuru</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Uncover the best-kept secrets in the city</p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {categoryCards.map((card, i) => (
          <div
            key={i}
            onClick={() => handleCategoryClick(card.title)}
            className={`${card.color} rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center cursor-pointer hover:scale-105 transition-all shadow-lg ${
              selectedCategory === card.title ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : ""
            }`}
          >
            <div className="text-3xl sm:text-4xl mb-2">{card.icon}</div>
            <p className="font-medium text-white text-sm sm:text-base">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-6 sm:mb-8 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search for heritage sites, palaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 text-sm sm:text-base"
          />
          {searchQuery && (
            <Button
              onClick={() => {
                setActiveNav("Places");
                toast.success(`Searching for: ${searchQuery}`);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base px-3 sm:px-4"
            >
              Search
            </Button>
          )}
        </div>
      </div>

      {/* Explore Most Crowded Places */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">Explore Popular Spots</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Most visited attractions in Mysuru</p>
            </div>
          </div>
          <button
            onClick={() => {
              setPlacesFilter("All");
              setActiveNav("Places");
              toast.success("View all places!");
            }}
            className="text-primary text-xs sm:text-sm hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            View all <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {mostCrowdedPlaces.map((place) => (
            <div
              key={place.id}
              onClick={() => handlePlaceClick(place.name, place.latitude, place.longitude)}
              className="bg-card border border-border rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Place Image */}
              <div className="h-36 sm:h-40 overflow-hidden bg-gray-100 relative">
                <ImageWithFallback
                  src={place.image || ""}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white text-foreground shadow-md text-xs">
                  {place.category}
                </Badge>
              </div>

              {/* Place Content */}
              <div className="p-4 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-1">{place.name}</h3>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="line-clamp-1">{place.location}</span>
                </div>

                <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm">{place.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-muted-foreground">{place.visitors}</span>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaceClick(place.name, place.latitude, place.longitude);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base h-9 sm:h-10"
                >
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  View on Map
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mysore News Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
              <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">Latest from Mysuru</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Stay updated with heritage city news</p>
            </div>
          </div>
          <button
            onClick={() => toast.success("Opening all news articles!")}
            className="text-primary text-xs sm:text-sm hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            View all <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {newsArticles.map((article) => (
            <div
              key={article.id}
              className="bg-card border border-border rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => toast.success(`Reading: ${article.title}`)}
            >
              {/* News Image */}
              <div className="h-36 sm:h-40 overflow-hidden bg-gray-100 relative">
                <ImageWithFallback
                  src={article.image || ""}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white text-foreground shadow-md text-xs">
                  {article.category}
                </Badge>
              </div>

              {/* News Content */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{article.date}</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-2 leading-tight">{article.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-3 sm:mb-4">{article.description}</p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success(`Opening article: ${article.title}`);
                  }}
                  variant="outline"
                  className="w-full text-sm sm:text-base h-9 sm:h-10"
                >
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Read More
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show login page after splash
  if (showLogin) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // Show main app after login
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Top Header - Mobile Only */}
      <header className="md:hidden bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 py-3 z-30 sticky top-0">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-accent rounded-xl transition-all duration-200 active:bg-primary active:text-primary-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-lg">
            🕉️
          </div>
          <div>
            <h1 className="font-bold text-base">AROHA</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5 tracking-wider">HERITAGE EXPLORER</p>
          </div>
        </div>

        <div className="w-10"></div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Overlay */}
        {isSidebarOpen && (
          <div
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-[fadeIn_0.3s_ease-in-out]"
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40 shadow-2xl md:shadow-none transform transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isSidebarOpen ? "translate-x-0 duration-500" : "-translate-x-full md:translate-x-0 duration-300"
          }`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
        {/* Close Button - Mobile Only */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl hover:bg-accent flex items-center justify-center md:hidden transition-all duration-200 hover:scale-110 active:scale-95 bg-background/50 backdrop-blur-sm border border-border"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-xl">
              🕉️
            </div>
            <div>
              <h1 className="font-bold text-lg">AROHA</h1>
              <p className="text-xs text-muted-foreground">HERITAGE EXPLORER</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((section) => (
            <div key={section.section} className="mb-6">
              <p className="px-6 text-xs font-medium text-muted-foreground mb-2">{section.section}</p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.label;
                const isPremium = item.label === "Premium";
                const isSOS = item.label === "SOS";
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.label)}
                    className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-all ${
                      isActive
                        ? isPremium
                          ? "bg-gradient-to-r from-primary/20 to-purple-600/20 text-primary border-l-4 border-primary"
                          : isSOS
                          ? "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-600 border-l-4 border-red-600"
                          : "bg-sidebar-accent text-primary border-l-4 border-primary"
                        : isPremium
                        ? "text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-600/10"
                        : isSOS
                        ? "text-red-600 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${(isPremium && !isActive) ? "text-primary" : (isSOS && !isActive) ? "text-red-600" : ""}`} />
                    <span className={`${isPremium ? "font-medium" : ""} ${isSOS ? "font-bold" : ""}`}>{item.label}</span>
                    {isPremium && !isActive && (
                      <Badge className="ml-auto bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 text-xs px-2 py-0">
                        NEW
                      </Badge>
                    )}
                    {isSOS && !isActive && (
                      <Badge className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0 animate-pulse">
                        EMERGENCY
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

        {/* Main Content */}
        <main
          className={`flex-1 ${activeNav === "Map" ? "overflow-hidden" : "overflow-y-auto"}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {renderPage()}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

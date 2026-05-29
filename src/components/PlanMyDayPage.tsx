import { Clock, MapPin, Coffee, Utensils, Hotel, Save, Share2, Sun, Sunset, Moon, CloudSun, IndianRupee, Navigation, Crown, Lock, Sparkles, TrendingUp, Users, AlertCircle, Phone, Download, Calendar, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useState } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { addCoins } from "../utils/rewards";

export function PlanMyDayPage() {
  const [selectedDuration, setSelectedDuration] = useState("full-day");
  const [selectedDayPlan, setSelectedDayPlan] = useState("morning");
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);

  const tripDurations = [
    { id: "3-hour", title: "3 Hour Trip", icon: "⚡", duration: "3h", subtitle: "Quick Escape" },
    { id: "half-day", title: "Half Day Trip", icon: "🌤️", duration: "5h", subtitle: "Explorer" },
    { id: "full-day", title: "Full Day Trip", icon: "☀️", duration: "10h", subtitle: "Heritage Journey" },
    { id: "multi-day", title: "Multi Day Trip", icon: "🗓️", duration: "2-5 days", subtitle: "Complete Explorer" }
  ];

  // 3 Hour Quick Trip
  const quickTrip = {
    title: "3 Hour Quick Escape",
    description: "Perfect for travelers with limited time",
    totalCost: "₹800 - ₹1,200",
    totalDistance: "12 km",
    stops: [
      {
        id: 1,
        time: "10:00 AM",
        title: "Mysore Palace",
        description: "Marvel at Indo-Saracenic architecture",
        duration: "90 min",
        icon: "🏰",
        image: "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Heritage"
      },
      {
        id: 2,
        time: "11:45 AM",
        title: "Devaraja Market",
        description: "Vibrant local market experience",
        duration: "45 min",
        icon: "🌺",
        image: "https://images.unsplash.com/photo-1772460759097-ad68b3232a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Shopping"
      },
      {
        id: 3,
        time: "12:45 PM",
        title: "Local Coffee Stop",
        description: "Authentic filter coffee break",
        duration: "30 min",
        icon: "☕",
        image: "https://images.unsplash.com/photo-1758387941825-a6ecaec9c14d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Food"
      }
    ]
  };

  // Half Day Experience
  const halfDayMorning = {
    title: "Half Day Morning Explorer",
    stops: [
      {
        id: 1,
        time: "7:00 AM",
        title: "Chamundi Hills",
        description: "Sunrise temple visit & panoramic views",
        duration: "2 hours",
        icon: "⛰️",
        image: "https://images.unsplash.com/photo-1709389137241-af48d39f8b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Nature"
      },
      {
        id: 2,
        time: "9:30 AM",
        title: "Mysore Zoo",
        description: "One of India's oldest zoos",
        duration: "2 hours",
        icon: "🦁",
        image: "https://images.unsplash.com/photo-1615824996195-f780bba7cfab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Nature"
      },
      {
        id: 3,
        time: "12:00 PM",
        title: "Traditional Mysore Lunch",
        description: "Authentic meals on banana leaf",
        duration: "1 hour",
        icon: "🍛",
        image: "https://images.unsplash.com/photo-1742281257687-092746ad6021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Food"
      }
    ]
  };

  const halfDayEvening = {
    title: "Half Day Evening Explorer",
    stops: [
      {
        id: 1,
        time: "3:00 PM",
        title: "St. Philomena's Cathedral",
        description: "Neo-Gothic architectural marvel",
        duration: "1 hour",
        icon: "⛪",
        image: "https://images.unsplash.com/photo-1618805804116-797ea9369cb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Heritage"
      },
      {
        id: 2,
        time: "4:30 PM",
        title: "Shopping Street",
        description: "Silk sarees and handicrafts",
        duration: "1.5 hours",
        icon: "🛍️",
        image: "https://images.unsplash.com/photo-1772460759097-ad68b3232a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Shopping"
      },
      {
        id: 3,
        time: "6:30 PM",
        title: "Sunset Café Experience",
        description: "Rooftop café with city views",
        duration: "1.5 hours",
        icon: "🌅",
        image: "https://images.unsplash.com/photo-1758387941825-a6ecaec9c14d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Food"
      }
    ]
  };

  // Full Day Plan
  const fullDayTrip = {
    title: "Full Day Heritage Journey",
    description: "Complete Mysore experience from sunrise to night",
    totalCost: "₹2,500 - ₹3,500",
    totalDistance: "45 km",
    stops: [
      {
        id: 1,
        time: "6:30 AM",
        title: "Sunrise at Chamundi Hills",
        description: "Start with temple blessings and sunrise views",
        duration: "2 hours",
        icon: "🌄",
        image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Nature",
        section: "morning"
      },
      {
        id: 2,
        time: "9:00 AM",
        title: "Breakfast at Mylari",
        description: "Famous dosa and traditional breakfast",
        duration: "45 min",
        icon: "🍽️",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Food",
        section: "morning"
      },
      {
        id: 3,
        time: "10:30 AM",
        title: "Mysore Palace",
        description: "Explore the magnificent royal palace",
        duration: "2.5 hours",
        icon: "🏰",
        image: "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Heritage",
        section: "afternoon"
      },
      {
        id: 4,
        time: "1:30 PM",
        title: "Traditional Lunch",
        description: "Mysore meals on banana leaf",
        duration: "1 hour",
        icon: "🍛",
        image: "https://images.unsplash.com/photo-1742281257687-092746ad6021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Food",
        section: "afternoon"
      },
      {
        id: 5,
        time: "3:00 PM",
        title: "Railway Museum",
        description: "Vintage locomotives and heritage trains",
        duration: "1.5 hours",
        icon: "🚂",
        image: "https://images.unsplash.com/photo-1600112356915-089abb8fc71a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Heritage",
        section: "afternoon"
      },
      {
        id: 6,
        time: "5:30 PM",
        title: "Brindavan Gardens",
        description: "Musical fountain and illuminated landscapes",
        duration: "2.5 hours",
        icon: "🌳",
        image: "https://images.unsplash.com/photo-1764351776302-55cc518790cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Nature",
        section: "evening"
      },
      {
        id: 7,
        time: "8:30 PM",
        title: "Dinner & Return",
        description: "Fine dining with Mysore specialties",
        duration: "1.5 hours",
        icon: "🍷",
        image: "https://images.unsplash.com/photo-1665660710687-b44c50751054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        type: "Food",
        section: "night"
      }
    ]
  };

  // Multi Day Trip
  const multiDayTrip = [
    {
      day: 1,
      title: "Heritage & Culture Day",
      budget: "₹3,000 - ₹4,000",
      activities: [
        { time: "9:00 AM", title: "Mysore Palace Tour", icon: "🏰", image: "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "12:00 PM", title: "Devaraja Market Walk", icon: "🌺", image: "https://images.unsplash.com/photo-1772460759097-ad68b3232a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "2:00 PM", title: "Traditional Lunch", icon: "🍛", image: "https://images.unsplash.com/photo-1742281257687-092746ad6021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "4:00 PM", title: "Jaganmohan Palace Art Gallery", icon: "🎨", image: "https://images.unsplash.com/photo-1659126574791-13313aa424bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "7:00 PM", title: "Food Street Exploration", icon: "🍽️", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" }
      ],
      hotel: "Royal Orchid Metropole - ₹6,500/night"
    },
    {
      day: 2,
      title: "Nature & Adventure Day",
      budget: "₹2,500 - ₹3,500",
      activities: [
        { time: "6:00 AM", title: "Chamundi Hills Sunrise", icon: "⛰️", image: "https://images.unsplash.com/photo-1709389137241-af48d39f8b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "9:00 AM", title: "Mysore Zoo", icon: "🦁", image: "https://images.unsplash.com/photo-1615824996195-f780bba7cfab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "1:00 PM", title: "Karanji Lake & Butterfly Park", icon: "🦋", image: "https://images.unsplash.com/photo-1674381215749-89b450055bfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "5:00 PM", title: "Brindavan Gardens", icon: "🌳", image: "https://images.unsplash.com/photo-1764351776302-55cc518790cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "8:00 PM", title: "Musical Fountain Show", icon: "⛲", image: "https://images.unsplash.com/photo-1674381215749-89b450055bfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" }
      ],
      hotel: "Fortune JP Palace - ₹4,500/night"
    },
    {
      day: 3,
      title: "Hidden Gems & Local Culture",
      budget: "₹2,000 - ₹3,000",
      activities: [
        { time: "8:00 AM", title: "Srirangapatna Heritage Town", icon: "🕌", image: "https://images.unsplash.com/photo-1589352254486-4e1587272ea4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "11:00 AM", title: "Local Village Visit", icon: "🏘️", image: "https://images.unsplash.com/photo-1566915682737-3e97a7eed93b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "2:00 PM", title: "Silk Weaving Workshop", icon: "🧵", image: "https://images.unsplash.com/photo-1772460759097-ad68b3232a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "5:00 PM", title: "Café Hopping & Shopping", icon: "☕", image: "https://images.unsplash.com/photo-1758387941825-a6ecaec9c14d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
        { time: "8:00 PM", title: "Cultural Performance", icon: "🎭", image: "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" }
      ],
      hotel: "Radisson Blu Plaza - ₹5,800/night"
    }
  ];

  // Premium Plans
  const premiumPlans = [
    {
      id: 1,
      title: "Royal Mysore Luxury Tour",
      description: "VIP palace access with personal royal guide",
      highlights: ["Private Palace Tour", "Royal Lunch", "Luxury Transport", "Heritage Expert"],
      icon: "👑",
      duration: "Full Day",
      price: "₹15,000"
    },
    {
      id: 2,
      title: "Mysore Food Paradise",
      description: "Culinary journey with master chef",
      highlights: ["12 Food Stops", "Chef Guide", "Market Tour", "Cooking Class"],
      icon: "🍛",
      duration: "Full Day",
      price: "₹8,000"
    },
    {
      id: 3,
      title: "Hidden Gems Secret Trail",
      description: "Explore undiscovered Mysore locations",
      highlights: ["Secret Spots", "Local Guide", "Off-beat Places", "Village Tour"],
      icon: "💎",
      duration: "Full Day",
      price: "₹10,000"
    },
    {
      id: 4,
      title: "Couple Romantic Escape",
      description: "Perfect romantic day in Mysore",
      highlights: ["Private Tours", "Candlelight Dinner", "Couple Photography", "Luxury Cab"],
      icon: "❤️",
      duration: "Full Day",
      price: "₹12,000"
    }
  ];

  // Smart Features Data
  const smartFeatures = {
    weather: {
      temp: "28°C",
      condition: "Partly Cloudy",
      humidity: "65%",
      bestTime: "Morning (7-10 AM) or Evening (5-8 PM)"
    },
    crowdLevel: {
      palace: { level: "High", color: "text-red-500" },
      zoo: { level: "Medium", color: "text-yellow-500" },
      gardens: { level: "Low", color: "text-green-500" }
    },
    transport: [
      { type: "Auto Rickshaw", cost: "₹20-30/km", icon: "🛺" },
      { type: "Taxi/Cab", cost: "₹15-20/km", icon: "🚖" },
      { type: "Rental Bike", cost: "₹500/day", icon: "🏍️" }
    ],
    emergency: [
      { service: "Police", number: "100", icon: "🚓" },
      { service: "Ambulance", number: "108", icon: "🚑" },
      { service: "Tourist Helpline", number: "1363", icon: "📞" }
    ]
  };

  const toggleDay = (day: number) => {
    setExpandedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const currentHalfDayPlan = selectedDayPlan === "morning" ? halfDayMorning : halfDayEvening;

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Plan My Day</h1>
        <p className="text-muted-foreground">Create your perfect Mysuru itinerary with AI-powered smart planning</p>
      </div>

      {/* Trip Duration Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Choose Your Trip Duration</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tripDurations.map((trip) => (
            <div
              key={trip.id}
              onClick={() => {
                setSelectedDuration(trip.id);
                toast.success(`Selected ${trip.title}`);
              }}
              className={`cursor-pointer rounded-3xl p-6 text-center transition-all hover:scale-105 ${
                selectedDuration === trip.id
                  ? "bg-primary text-primary-foreground shadow-xl"
                  : "bg-card border border-border hover:shadow-lg"
              }`}
            >
              <div className="text-5xl mb-3">{trip.icon}</div>
              <h3 className="font-bold mb-1">{trip.title}</h3>
              <p className={`text-xs mb-1 ${selectedDuration === trip.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {trip.subtitle}
              </p>
              <Badge variant={selectedDuration === trip.id ? "secondary" : "outline"} className="mt-2">
                {trip.duration}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Features Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Weather */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CloudSun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="font-bold text-sm">Weather</p>
          </div>
          <p className="text-2xl font-bold mb-1">{smartFeatures.weather.temp}</p>
          <p className="text-xs text-muted-foreground">{smartFeatures.weather.condition}</p>
        </div>

        {/* Best Time */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="font-bold text-sm">Best Time</p>
          </div>
          <p className="text-xs leading-relaxed">{smartFeatures.weather.bestTime}</p>
        </div>

        {/* Crowd Level */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <p className="font-bold text-sm">Crowd Level</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs">Palace: <span className={smartFeatures.crowdLevel.palace.color + " font-medium"}>{smartFeatures.crowdLevel.palace.level}</span></p>
            <p className="text-xs">Zoo: <span className={smartFeatures.crowdLevel.zoo.color + " font-medium"}>{smartFeatures.crowdLevel.zoo.level}</span></p>
          </div>
        </div>

        {/* Emergency */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border border-red-200 dark:border-red-800 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="font-bold text-sm">Emergency</p>
          </div>
          <p className="text-xs mb-1">Police: <span className="font-bold">100</span></p>
          <p className="text-xs">Ambulance: <span className="font-bold">108</span></p>
        </div>
      </div>

      {/* 3 HOUR QUICK TRIP */}
      {selectedDuration === "3-hour" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-1">{quickTrip.title}</h2>
              <p className="text-muted-foreground">{quickTrip.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="text-xl font-bold text-primary">{quickTrip.totalCost}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {quickTrip.stops.map((stop, index) => (
              <div key={stop.id} className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                <div className="h-40 overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={stop.image || ""}
                    alt={stop.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-primary text-primary-foreground">{stop.time}</Badge>
                  <Badge variant="outline">{stop.type}</Badge>
                </div>
                <h3 className="font-bold text-lg mb-2">{stop.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{stop.description}</p>
                <div className="flex items-center justify-between mb-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{stop.duration}</span>
                  </div>
                  {index < quickTrip.stops.length - 1 && (
                    <div className="flex items-center gap-1 text-xs text-primary font-semibold uppercase tracking-wider">
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Next stop ahead</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => addCoins(25, `Checked in at ${stop.title} via 3-Hour Escape Day Plan`)}
                  className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs h-9"
                  variant="ghost"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  Check In & Claim +25 Coins
                </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 rounded-3xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Distance</p>
                <p className="text-2xl font-bold">{quickTrip.totalDistance}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Time</p>
                <p className="text-2xl font-bold">3 Hours</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Stops</p>
                <p className="text-2xl font-bold">{quickTrip.stops.length}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { addCoins(100, "Saved 3-Hour Escape Itinerary"); }} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="w-4 h-4 mr-2" />
                Save Trip (+100)
              </Button>
              <Button onClick={() => { addCoins(100, "Booked 3-Hour Quick Escape Trip"); }} className="flex-1" variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Quick Book (+100)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* HALF DAY EXPERIENCE */}
      {selectedDuration === "half-day" && (
        <div>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-4">Half Day Explorer</h2>
            <div className="flex gap-3 mb-6">
              <Button
                onClick={() => setSelectedDayPlan("morning")}
                variant={selectedDayPlan === "morning" ? "default" : "outline"}
                className={selectedDayPlan === "morning" ? "bg-primary text-primary-foreground" : ""}
              >
                <Sun className="w-4 h-4 mr-2" />
                Morning Plan
              </Button>
              <Button
                onClick={() => setSelectedDayPlan("evening")}
                variant={selectedDayPlan === "evening" ? "default" : "outline"}
                className={selectedDayPlan === "evening" ? "bg-primary text-primary-foreground" : ""}
              >
                <Sunset className="w-4 h-4 mr-2" />
                Evening Plan
              </Button>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-6">{currentHalfDayPlan.title}</h3>

          <div className="space-y-4 mb-6">
            {currentHalfDayPlan.stops.map((stop, index) => (
              <div key={stop.id} className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all">
                <div className="flex gap-6">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={stop.image || ""}
                      alt={stop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary text-primary-foreground">{stop.time}</Badge>
                        <h3 className="font-bold text-xl">{stop.title}</h3>
                      </div>
                      <Badge variant="outline">{stop.type}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{stop.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{stop.duration}</span>
                        </div>
                        <button
                          onClick={() => {
                            toast.success("Opening directions...");
                            addCoins(25, `Checked in at ${stop.title} via Day Plan directions`);
                          }}
                          className="flex items-center gap-2 text-sm text-primary hover:underline font-semibold"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Get Directions</span>
                        </button>
                      </div>
                      <Button
                        onClick={() => addCoins(25, `Checked in at ${stop.title} via Half Day Explorer`)}
                        className="bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs h-9 px-4"
                        variant="ghost"
                      >
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        Check In (+25 Coins)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={() => { addCoins(100, "Saved Half Day Explorer Itinerary"); }} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save Itinerary (+100)
            </Button>
            <Button onClick={() => toast.success("Shared itinerary!")} className="flex-1" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      )}

      {/* FULL DAY PLAN */}
      {selectedDuration === "full-day" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-1">{fullDayTrip.title}</h2>
              <p className="text-muted-foreground">{fullDayTrip.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="text-xl font-bold text-primary">{fullDayTrip.totalCost}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Morning */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-2xl">
                  <Sun className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold">Morning</h3>
                <Badge variant="outline">6:30 AM - 10:30 AM</Badge>
              </div>
              <div className="space-y-4 pl-4 border-l-4 border-primary/20">
                {fullDayTrip.stops.filter(s => s.section === "morning").map((stop) => (
                  <div key={stop.id} className="ml-6 bg-card border border-border rounded-3xl p-5 hover:shadow-lg transition-all">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={stop.image || ""}
                          alt={stop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary text-primary-foreground">{stop.time}</Badge>
                          <h4 className="font-bold text-lg">{stop.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{stop.description}</p>
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{stop.duration}</span>
                            </div>
                            <Badge variant="outline">{stop.type}</Badge>
                          </div>
                          <Button
                            onClick={() => addCoins(25, `Checked in at ${stop.title} via Full Day Heritage Journey`)}
                            className="bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs h-8 px-3"
                            variant="ghost"
                          >
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            Check In (+25 Coins)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Afternoon */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-2xl">
                  <Sun className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-bold">Afternoon</h3>
                <Badge variant="outline">10:30 AM - 5:30 PM</Badge>
              </div>
              <div className="space-y-4 pl-4 border-l-4 border-primary/20">
                {fullDayTrip.stops.filter(s => s.section === "afternoon").map((stop) => (
                  <div key={stop.id} className="ml-6 bg-card border border-border rounded-3xl p-5 hover:shadow-lg transition-all">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={stop.image || ""}
                          alt={stop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary text-primary-foreground">{stop.time}</Badge>
                          <h4 className="font-bold text-lg">{stop.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{stop.description}</p>
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{stop.duration}</span>
                            </div>
                            <Badge variant="outline">{stop.type}</Badge>
                          </div>
                          <Button
                            onClick={() => addCoins(25, `Checked in at ${stop.title} via Full Day Heritage Journey`)}
                            className="bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs h-8 px-3"
                            variant="ghost"
                          >
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            Check In (+25 Coins)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evening */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl">
                  <Sunset className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">Evening</h3>
                <Badge variant="outline">5:30 PM - 8:30 PM</Badge>
              </div>
              <div className="space-y-4 pl-4 border-l-4 border-primary/20">
                {fullDayTrip.stops.filter(s => s.section === "evening").map((stop) => (
                  <div key={stop.id} className="ml-6 bg-card border border-border rounded-3xl p-5 hover:shadow-lg transition-all">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={stop.image || ""}
                          alt={stop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary text-primary-foreground">{stop.time}</Badge>
                          <h4 className="font-bold text-lg">{stop.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{stop.description}</p>
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{stop.duration}</span>
                            </div>
                            <Badge variant="outline">{stop.type}</Badge>
                          </div>
                          <Button
                            onClick={() => addCoins(25, `Checked in at ${stop.title} via Full Day Heritage Journey`)}
                            className="bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs h-8 px-3"
                            variant="ghost"
                          >
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            Check In (+25 Coins)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Night */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-2xl">
                  <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold">Night</h3>
                <Badge variant="outline">8:30 PM onwards</Badge>
              </div>
              <div className="space-y-4 pl-4 border-l-4 border-primary/20">
                {fullDayTrip.stops.filter(s => s.section === "night").map((stop) => (
                  <div key={stop.id} className="ml-6 bg-card border border-border rounded-3xl p-5 hover:shadow-lg transition-all">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={stop.image || ""}
                          alt={stop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary text-primary-foreground">{stop.time}</Badge>
                          <h4 className="font-bold text-lg">{stop.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{stop.description}</p>
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{stop.duration}</span>
                            </div>
                            <Badge variant="outline">{stop.type}</Badge>
                          </div>
                          <Button
                            onClick={() => addCoins(25, `Checked in at ${stop.title} via Full Day Heritage Journey`)}
                            className="bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs h-8 px-3"
                            variant="ghost"
                          >
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            Check In (+25 Coins)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            <Button onClick={() => { addCoins(100, "Saved Full Day Heritage Journey Plan"); }} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save Full Day Plan (+100)
            </Button>
            <Button onClick={() => toast.success("Downloading PDF...")} className="flex-1" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={() => toast.success("Shared!")} variant="outline">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* MULTI DAY TRIP */}
      {selectedDuration === "multi-day" && (
        <div>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-1">Mysore Complete Explorer</h2>
            <p className="text-muted-foreground">2-5 day fully planned Mysore journey</p>
          </div>

          <div className="space-y-6 mb-8">
            {multiDayTrip.map((dayPlan) => (
              <div key={dayPlan.day} className="bg-card border-2 border-border rounded-3xl overflow-hidden">
                <button
                  onClick={() => toggleDay(dayPlan.day)}
                  className="w-full p-6 flex items-center justify-between hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg">
                      D{dayPlan.day}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-xl">{dayPlan.title}</h3>
                      <p className="text-sm text-muted-foreground">{dayPlan.activities.length} activities • {dayPlan.budget}</p>
                    </div>
                  </div>
                  {expandedDays.includes(dayPlan.day) ? (
                    <ChevronUp className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>

                {expandedDays.includes(dayPlan.day) && (
                  <div className="p-6 pt-0 space-y-4">
                    {dayPlan.activities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-accent/30 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <Badge className="bg-primary text-primary-foreground">{activity.time}</Badge>
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={activity.image || ""}
                              alt={activity.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="font-medium">{activity.title}</p>
                        </div>
                        <Button
                          onClick={() => addCoins(25, `Visited & checked in at ${activity.title} on Day ${dayPlan.day}`)}
                          className="bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs h-8 px-3 ml-4"
                          variant="ghost"
                        >
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          Check In (+25)
                        </Button>
                      </div>
                    ))}
                    <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-2xl border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Hotel className="w-5 h-5 text-primary" />
                        <p className="font-bold">Recommended Hotel</p>
                      </div>
                      <p className="text-sm">{dayPlan.hotel}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 rounded-3xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Complete Trip Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Days</p>
                <p className="text-2xl font-bold">{multiDayTrip.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Activities</p>
                <p className="text-2xl font-bold">{multiDayTrip.reduce((acc, day) => acc + day.activities.length, 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                <p className="text-2xl font-bold">₹18-24K</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Hotels</p>
                <p className="text-2xl font-bold">{multiDayTrip.length}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { addCoins(100, "Saved Complete Multi-Day Itinerary"); }} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="w-4 h-4 mr-2" />
                Save Complete Trip (+100)
              </Button>
              <Button onClick={() => toast.success("Downloading PDF...")} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Exclusive Trips */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold">Premium Experiences</h2>
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 border-0">
            <Crown className="w-3 h-3 mr-1" />
            Premium Exclusive
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {premiumPlans.map((plan) => (
            <div
              key={plan.id}
              className="relative bg-card border-2 border-primary/20 rounded-3xl p-6 overflow-hidden"
            >
              {/* Blur Overlay */}
              <div className="absolute inset-0 backdrop-blur-sm bg-white/40 dark:bg-black/40 z-10 rounded-3xl flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-primary to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm font-medium mb-3">Premium Only</p>
                  <Button
                    onClick={() => toast.success("Opening Premium subscription...")}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg"
                    size="sm"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Unlock
                  </Button>
                </div>
              </div>

              {/* Content (blurred) */}
              <div className="opacity-50">
                <div className="text-6xl mb-4">{plan.icon}</div>
                <h3 className="font-bold text-lg mb-2">{plan.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="space-y-2 mb-4">
                  {plan.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{plan.duration}</Badge>
                  <p className="font-bold text-primary">{plan.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transport Options */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Transport Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {smartFeatures.transport.map((option, i) => (
            <div key={i} className="bg-card border border-border rounded-3xl p-6 text-center hover:shadow-lg transition-all">
              <div className="text-5xl mb-3">{option.icon}</div>
              <h3 className="font-bold mb-1">{option.type}</h3>
              <p className="text-sm text-primary font-medium">{option.cost}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { MapPin, Star, IndianRupee, Navigation, Award } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { HotelBookingModal } from "./HotelBookingModal";
import { MapViewModal } from "./MapViewModal";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Hotel {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  distance: string;
  category: string;
  image: string;
  sponsored: boolean;
  amenities: string[];
}

export function HotelsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const hotels: Hotel[] = [
    {
      id: 1,
      name: "The Windflower Resorts & Spa",
      location: "Maharanapratap Road, Nazarbad",
      rating: 4.8,
      reviews: 1250,
      pricePerNight: 8500,
      distance: "3.2 km from Palace",
      category: "Luxury",
      image: "https://images.unsplash.com/photo-1724947053227-2335bf21d0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      sponsored: true,
      amenities: ["Pool", "Spa", "WiFi", "Restaurant"]
    },
    {
      id: 2,
      name: "Royal Orchid Metropole",
      location: "5 Jhansi Lakshmi Bai Road",
      rating: 4.7,
      reviews: 980,
      pricePerNight: 6500,
      distance: "1.8 km from Palace",
      category: "Luxury",
      image: "https://images.unsplash.com/photo-1724947052687-e580b3010aad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      sponsored: true,
      amenities: ["Heritage", "Pool", "WiFi", "Fine Dining"]
    },
    {
      id: 3,
      name: "Radisson Blu Plaza Hotel",
      location: "1-A, Vinoba Road, Yadavagiri",
      rating: 4.6,
      reviews: 856,
      pricePerNight: 5800,
      distance: "2.5 km from Palace",
      category: "Luxury",
      image: "https://images.unsplash.com/photo-1713186103033-60ff76a7b89d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      sponsored: false,
      amenities: ["Pool", "Gym", "WiFi", "Restaurant"]
    },
    {
      id: 4,
      name: "Hotel Sandesh The Prince",
      location: "3, Nazarbad Main Road",
      rating: 4.4,
      reviews: 645,
      pricePerNight: 3200,
      distance: "2.8 km from Palace",
      category: "Budget",
      image: "https://images.unsplash.com/photo-1694366454450-7979697bab21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      sponsored: false,
      amenities: ["WiFi", "Restaurant", "Parking"]
    },
    {
      id: 5,
      name: "Fortune JP Palace",
      location: "Ashoka Road, Lakshmipuram",
      rating: 4.5,
      reviews: 723,
      pricePerNight: 4500,
      distance: "1.5 km from Railway",
      category: "Family",
      image: "https://images.unsplash.com/photo-1711707246899-cf0d1a5d0472?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      sponsored: false,
      amenities: ["Pool", "Kids Play", "WiFi", "Restaurant"]
    },
    {
      id: 6,
      name: "Treebo Trend Rajmahal",
      location: "Near City Bus Stand, JLB Road",
      rating: 4.3,
      reviews: 512,
      pricePerNight: 2200,
      distance: "0.8 km from Railway",
      category: "Budget",
      image: "https://images.unsplash.com/photo-1701421016474-09b19faa9f77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      sponsored: false,
      amenities: ["WiFi", "Breakfast", "AC"]
    },
    {
      id: 7,
      name: "Lalitha Mahal Palace Hotel",
      location: "T. Narasipura Road, Siddhartha Nagar",
      rating: 4.9,
      reviews: 1420,
      pricePerNight: 12000,
      distance: "8.5 km from Palace",
      category: "Luxury",
      image: "https://images.unsplash.com/photo-1719391083606-da1dd6454a68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      sponsored: true,
      amenities: ["Heritage Palace", "Pool", "Spa", "Fine Dining"]
    },
    {
      id: 8,
      name: "Pai Vista",
      location: "Visveswaraya Road, Kalidasa Road",
      rating: 4.4,
      reviews: 589,
      pricePerNight: 3800,
      distance: "3.1 km from Palace",
      category: "Family",
      image: "https://images.unsplash.com/photo-1717489358244-01dd1c704afa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      sponsored: false,
      amenities: ["Pool", "WiFi", "Restaurant", "Parking"]
    }
  ];

  const filterCategories = [
    { label: "Budget", icon: "💰" },
    { label: "Luxury", icon: "✨" },
    { label: "Family", icon: "👨‍👩‍👧" },
    { label: "Near Palace", icon: "🏰" },
    { label: "Near Railway", icon: "🚂" }
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilters.length === 0) return matchesSearch;

    const matchesFilters = selectedFilters.some(filter => {
      if (filter === "Budget" || filter === "Luxury" || filter === "Family") {
        return hotel.category === filter;
      }
      if (filter === "Near Palace") return hotel.distance.includes("Palace");
      if (filter === "Near Railway") return hotel.distance.includes("Railway");
      return false;
    });

    return matchesSearch && matchesFilters;
  });

  const budgetPicks = hotels.filter(h => h.category === "Budget").slice(0, 3);
  const luxuryStays = hotels.filter(h => h.category === "Luxury").slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Hotels in Mysuru</h1>
        <p className="text-muted-foreground">Find the perfect stay for your heritage journey</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search hotels in Mysore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex gap-3 flex-wrap">
        {filterCategories.map((filter) => (
          <Badge
            key={filter.label}
            onClick={() => toggleFilter(filter.label)}
            variant={selectedFilters.includes(filter.label) ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
              selectedFilters.includes(filter.label)
                ? "bg-primary text-primary-foreground shadow-md"
                : "hover:bg-accent"
            }`}
          >
            <span className="mr-2">{filter.icon}</span>
            {filter.label}
          </Badge>
        ))}
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredHotels.length} hotels
        </p>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image */}
            <div className="h-48 overflow-hidden bg-gray-100 relative">
              <ImageWithFallback
                src={hotel.image || ""}
                alt={hotel.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {hotel.sponsored && (
                <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                  <Award className="w-3 h-3 mr-1" />
                  Sponsored
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="mb-3">
                <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{hotel.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{hotel.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({hotel.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Navigation className="w-4 h-4" />
                <span>{hotel.distance}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {hotel.amenities.slice(0, 3).map((amenity, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Per night</p>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    <span className="text-xl font-bold">{hotel.pricePerNight.toLocaleString()}</span>
                  </div>
                </div>
                <Badge variant="outline">{hotel.category}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    setSelectedHotel(hotel);
                    setIsBookingModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Book Now
                </Button>
                <Button
                  onClick={() => {
                    setSelectedHotel(hotel);
                    setIsMapModalOpen(true);
                  }}
                  variant="outline"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Map
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Sections */}
      <div className="space-y-8">
        {/* Budget Picks */}
        <div>
          <h2 className="text-2xl font-bold mb-4">💰 Budget Picks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {budgetPicks.map((hotel) => (
              <div key={hotel.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                <div className="h-40 overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={hotel.image || ""}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                <h3 className="font-bold mb-1">{hotel.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{hotel.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-lg font-bold mb-3">
                  <IndianRupee className="w-4 h-4" />
                  {hotel.pricePerNight.toLocaleString()}
                </div>
                <Button
                  onClick={() => {
                    setSelectedHotel(hotel);
                    setIsBookingModalOpen(true);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="sm"
                >
                  Book Now
                </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Luxury Stays */}
        <div>
          <h2 className="text-2xl font-bold mb-4">✨ Luxury Stays</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {luxuryStays.map((hotel) => (
              <div key={hotel.id} className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                <div className="h-40 overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={hotel.image || ""}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                <h3 className="font-bold mb-1">{hotel.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{hotel.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-lg font-bold mb-3">
                  <IndianRupee className="w-4 h-4" />
                  {hotel.pricePerNight.toLocaleString()}
                </div>
                <Button
                  onClick={() => {
                    setSelectedHotel(hotel);
                    setIsBookingModalOpen(true);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="sm"
                >
                  Book Now
                </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hotel Booking Modal */}
      <HotelBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedHotel(null);
        }}
        hotel={selectedHotel}
      />

      {/* Map View Modal */}
      <MapViewModal
        isOpen={isMapModalOpen}
        onClose={() => {
          setIsMapModalOpen(false);
          setSelectedHotel(null);
        }}
        hotel={selectedHotel}
      />
    </div>
  );
}

import { X, MapPin, Navigation, ExternalLink, Coffee, Utensils, ShoppingBag, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface Hotel {
  id: number;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

interface MapViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Hotel | null;
}

export function MapViewModal({ isOpen, onClose, hotel }: MapViewModalProps) {
  if (!isOpen || !hotel) return null;

  const nearbyAttractions = [
    { name: "Mysore Palace", distance: "1.8 km", type: "Heritage", icon: "🏰" },
    { name: "Devaraja Market", distance: "2.1 km", type: "Shopping", icon: "🌺" },
    { name: "St. Philomena's Cathedral", distance: "3.2 km", type: "Heritage", icon: "⛪" },
    { name: "Chamundi Hills", distance: "8.5 km", type: "Nature", icon: "⛰️" }
  ];

  const nearbyRestaurants = [
    { name: "RRR Restaurant", distance: "0.5 km", icon: "🍛" },
    { name: "Mylari Dosa", distance: "1.2 km", icon: "🍽️" },
    { name: "Café Aramane", distance: "0.8 km", icon: "☕" }
  ];

  const handleGetDirections = () => {
    const lat = hotel.latitude || 12.3051;
    const lng = hotel.longitude || 76.6551;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    toast.success("Opening Google Maps...");
  };

  const handleOpenInMaps = () => {
    const lat = hotel.latitude || 12.3051;
    const lng = hotel.longitude || 76.6551;
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    toast.success("Opening in Google Maps...");
  };

  const handleSaveLocation = () => {
    toast.success("Location saved to your favorites!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{hotel.name}</h2>
              <p className="text-sm text-muted-foreground">{hotel.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-accent transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Map Preview */}
          <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-3xl h-96 mb-6 overflow-hidden border-2 border-primary/20">
            {/* Simulated Map UI */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Map Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="border border-muted-foreground/20"></div>
                  ))}
                </div>

                {/* Hotel Pin */}
                <div className="relative z-10 animate-bounce">
                  <div className="bg-primary text-primary-foreground rounded-full p-4 shadow-2xl">
                    <MapPin className="w-8 h-8 fill-current" />
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-2xl px-4 py-2 shadow-lg whitespace-nowrap">
                    <p className="font-bold text-sm">{hotel.name}</p>
                  </div>
                </div>

                {/* Nearby Markers */}
                <div className="absolute -top-20 -left-32 text-2xl opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  🏰
                </div>
                <div className="absolute top-16 -right-28 text-2xl opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  🌺
                </div>
                <div className="absolute -bottom-24 left-20 text-2xl opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  ⛪
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="bg-card border border-border p-2 rounded-lg hover:bg-accent transition-colors shadow-lg">
                <span className="text-lg">+</span>
              </button>
              <button className="bg-card border border-border p-2 rounded-lg hover:bg-accent transition-colors shadow-lg">
                <span className="text-lg">−</span>
              </button>
            </div>

            {/* Distance Indicator */}
            <div className="absolute bottom-4 left-4 bg-card border border-border rounded-2xl px-4 py-2 shadow-lg">
              <p className="text-sm font-medium">📍 You are here</p>
              <p className="text-xs text-muted-foreground">2.5 km from hotel</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Button
              onClick={handleGetDirections}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            <Button
              onClick={handleOpenInMaps}
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Google Maps
            </Button>
            <Button
              onClick={handleSaveLocation}
              variant="outline"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Save Location
            </Button>
          </div>

          {/* Travel Time Info */}
          <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-3xl p-6 mb-6 border border-primary/20">
            <h3 className="font-bold mb-4">Estimated Travel Time</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🚗</div>
                <p className="text-sm text-muted-foreground">By Car</p>
                <p className="font-bold">8 mins</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛺</div>
                <p className="text-sm text-muted-foreground">By Auto</p>
                <p className="font-bold">12 mins</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🚶</div>
                <p className="text-sm text-muted-foreground">Walking</p>
                <p className="font-bold">30 mins</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nearby Attractions */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Nearby Attractions
              </h3>
              <div className="space-y-3">
                {nearbyAttractions.map((attraction, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => toast.success(`Viewing ${attraction.name}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{attraction.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium">{attraction.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{attraction.type}</Badge>
                          <span className="text-xs text-muted-foreground">{attraction.distance}</span>
                        </div>
                      </div>
                      <Navigation className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Restaurants */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                Nearby Restaurants & Cafés
              </h3>
              <div className="space-y-3">
                {nearbyRestaurants.map((restaurant, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => toast.success(`Viewing ${restaurant.name}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{restaurant.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium">{restaurant.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{restaurant.distance}</p>
                      </div>
                      <Navigation className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                ))}

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <p className="font-bold text-sm">Local Market</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Devaraja Market - 2.1 km</p>
                  <p className="text-xs mt-1">Fresh flowers, spices & local products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

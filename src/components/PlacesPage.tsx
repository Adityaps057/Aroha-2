import { MapPin, Star, Clock, Navigation } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Place {
  id: number;
  name: string;
  location: string;
  description: string;
  rating: number;
  category: string;
  distance: string;
  openTime: string;
  image: string;
  latitude: number;
  longitude: number;
}

interface PlacesPageProps {
  initialCategory?: string;
  initialSearchQuery?: string;
}

export function PlacesPage({ initialCategory = "All", initialSearchQuery = "" }: PlacesPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const places: Place[] = [
    {
      id: 1,
      name: "Mysore Palace",
      location: "Sayyaji Rao Rd, Agrahara, Chamrajpura",
      description: "The official residence of the Wadiyar dynasty, a stunning example of Indo-Saracenic architecture",
      rating: 4.8,
      category: "Heritage",
      distance: "2.3 km",
      openTime: "10:00 AM - 5:30 PM",
      image: "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.3051,
      longitude: 76.6551
    },
    {
      id: 2,
      name: "Chamundi Hills",
      location: "Chamundi Hill Rd, Mysuru",
      description: "Sacred hill with ancient Chamundeshwari Temple offering panoramic city views",
      rating: 4.7,
      category: "Nature",
      distance: "13 km",
      openTime: "7:00 AM - 7:00 PM",
      image: "https://images.unsplash.com/photo-1709389137241-af48d39f8b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.2725,
      longitude: 76.6731
    },
    {
      id: 3,
      name: "Brindavan Gardens",
      location: "KRS Backwater, Mandya District",
      description: "Beautiful terrace garden with musical fountain and illuminated landscapes",
      rating: 4.6,
      category: "Nature",
      distance: "21 km",
      openTime: "6:00 PM - 7:45 PM",
      image: "https://images.unsplash.com/photo-1764351776302-55cc518790cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.4244,
      longitude: 76.5752
    },
    {
      id: 4,
      name: "St. Philomena's Cathedral",
      location: "Ashoka Rd, Lakshmipuram, Mysuru",
      description: "Neo-Gothic church, one of the tallest churches in Asia",
      rating: 4.7,
      category: "Heritage",
      distance: "3.1 km",
      openTime: "5:00 AM - 6:00 PM",
      image: "https://images.unsplash.com/photo-1618805804116-797ea9369cb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.3151,
      longitude: 76.6405
    },
    {
      id: 5,
      name: "Mysore Zoo",
      location: "Indira Gandhi Rd, Zoo Park Road",
      description: "One of the oldest and most popular zoos in India",
      rating: 4.5,
      category: "Nature",
      distance: "2.8 km",
      openTime: "8:30 AM - 5:30 PM",
      image: "https://images.unsplash.com/photo-1609876634007-76c04c5863cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.3008,
      longitude: 76.6548
    },
    {
      id: 6,
      name: "Jaganmohan Palace",
      location: "Vinoba Rd, Jayalakshmipuram, Mysuru",
      description: "Art gallery housing paintings by Raja Ravi Varma and other renowned artists",
      rating: 4.4,
      category: "Heritage",
      distance: "1.8 km",
      openTime: "8:30 AM - 5:00 PM",
      image: "https://images.unsplash.com/photo-1659126574791-13313aa424bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.3095,
      longitude: 76.6524
    },
    {
      id: 7,
      name: "Karanji Lake",
      location: "Karanji Lake Nature Park, Mysuru",
      description: "Picturesque lake with butterfly park and walk-through aviary",
      rating: 4.5,
      category: "Nature",
      distance: "4.2 km",
      openTime: "8:30 AM - 5:30 PM",
      image: "https://images.unsplash.com/photo-1674381215749-89b450055bfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.2897,
      longitude: 76.6608
    },
    {
      id: 8,
      name: "Devaraja Market",
      location: "Sayyaji Rao Rd, Mandi Mohalla, Mysuru",
      description: "Vibrant traditional market selling flowers, spices, fruits and vegetables",
      rating: 4.3,
      category: "Cuisine",
      distance: "2.1 km",
      openTime: "6:00 AM - 9:00 PM",
      image: "https://images.unsplash.com/photo-1772460759097-ad68b3232a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.3069,
      longitude: 76.6545
    },
    {
      id: 9,
      name: "Railway Museum",
      location: "Krishnaraja Sagar Rd, Near KRS",
      description: "Heritage railway museum with vintage locomotives and carriages",
      rating: 4.2,
      category: "Heritage",
      distance: "3.5 km",
      openTime: "10:00 AM - 5:00 PM",
      image: "https://images.unsplash.com/photo-1600112356915-089abb8fc71a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.3205,
      longitude: 76.6296
    },
    {
      id: 10,
      name: "Kukkarahalli Lake",
      location: "University of Mysore Campus",
      description: "Serene lake popular for bird watching and morning walks",
      rating: 4.4,
      category: "Nature",
      distance: "5.1 km",
      openTime: "6:00 AM - 8:00 PM",
      image: "https://images.unsplash.com/photo-1665488479369-88a1ca88c1e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.3041,
      longitude: 76.6312
    },
    {
      id: 11,
      name: "Lalitha Mahal Palace",
      location: "Lalitha Mahal Palace Rd, Siddhartha Nagar",
      description: "Majestic white palace built in 1921, now a heritage hotel",
      rating: 4.6,
      category: "Heritage",
      distance: "8.5 km",
      openTime: "10:00 AM - 6:00 PM",
      image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.2634,
      longitude: 76.6402
    },
    {
      id: 12,
      name: "Srirangapatna",
      location: "Srirangapatna, Mandya District",
      description: "Historic town with Tipu Sultan's Summer Palace and Ranganathaswamy Temple",
      rating: 4.5,
      category: "Heritage",
      distance: "16 km",
      openTime: "9:00 AM - 6:00 PM",
      image: "https://images.unsplash.com/photo-1589352254486-4e1587272ea4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      latitude: 12.4185,
      longitude: 76.6947
    }
  ];

  const categories = ["All", "Heritage", "Nature", "Cuisine"];

  const filteredPlaces = places.filter((place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewLocation = (place: Place) => {
    toast.success(`Opening map for ${place.name}`);
    // In a real app, this would open Google Maps or similar
    window.open(`https://www.google.com/maps?q=${place.latitude},${place.longitude}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Explore Mysuru Places</h1>
        <p className="text-muted-foreground">Discover {places.length} amazing locations across the heritage city</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search places by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPlaces.length} of {places.length} places
        </p>
      </div>

      {/* Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="h-48 overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={place.image || ""}
                alt={place.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg">{place.name}</h3>
                <Badge variant="outline" className="ml-2">
                  {place.category}
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{place.location}</span>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {place.description}
              </p>

              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{place.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Navigation className="w-4 h-4" />
                  <span>{place.distance}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Clock className="w-3 h-3" />
                <span>{place.openTime}</span>
              </div>

              <Button
                onClick={() => handleViewLocation(place)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <MapPin className="w-4 h-4 mr-2" />
                View on Map
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredPlaces.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-bold text-xl mb-2">No places found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}

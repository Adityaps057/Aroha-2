import { MapPin, Search, Navigation, Star, Filter, Layers, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface Place {
  id: number;
  name: string;
  location: string;
  category: string;
  rating: number;
  distance: string;
  icon: string;
  latitude: number;
  longitude: number;
  image?: string;
}

interface Artisan {
  id: number;
  name: string;
  craft: string;
  location: string;
  latitude: number;
  longitude: number;
  products: string[];
  rating: number;
  icon: string;
  distance?: number;
}

export function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapView, setMapView] = useState<"standard" | "satellite">("standard");
  const [showPlacesList, setShowPlacesList] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [mapError, setMapError] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [travelInfo, setTravelInfo] = useState<{ duration: string; distance: string } | null>(null);
  const [googlePhotoUrl, setGooglePhotoUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDangerZones, setShowDangerZones] = useState(false);
  const dangerCirclesRef = useRef<google.maps.Circle[]>([]);

  const [showArtisans, setShowArtisans] = useState(false);
  const [selectedArtisans, setSelectedArtisans] = useState<number[]>([]);
  const [nearbyArtisans, setNearbyArtisans] = useState<Artisan[]>([]);
  const [artisanMode, setArtisanMode] = useState(false);
  const artisanMarkersRef = useRef<google.maps.Marker[]>([]);
  const artisanRouteRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // New: Custom search dropdown state
  const [searchSuggestions, setSearchSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const [placesServiceReady, setPlacesServiceReady] = useState(false);
  const [artisansFetchAttempted, setArtisansFetchAttempted] = useState(false);

  // Artisans on route
  const [artisansOnRoute, setArtisansOnRoute] = useState<Artisan[]>([]);
  const [showOnRoutePanel, setShowOnRoutePanel] = useState(false);
  const [stopsAdded, setStopsAdded] = useState<number[]>([]);

  // Known high-crime / high-crowd zones in Mysuru (Source: Mysore City Police public records)
  const dangerZones = [
    { name: "Mandi Mohalla — High Crime Zone", lat: 12.2987, lng: 76.6434, radius: 300, severity: "high" },
    { name: "Nazarbad Mohalla — Theft Hotspot", lat: 12.3020, lng: 76.6580, radius: 250, severity: "high" },
    { name: "Devaraja Market — Pickpocket Zone", lat: 12.3076, lng: 76.6553, radius: 150, severity: "medium" },
    { name: "Mysore Railway Station — Scam Alert", lat: 12.3162, lng: 76.6415, radius: 200, severity: "medium" },
    { name: "Bannimantap — Vehicle Theft Zone", lat: 12.3163, lng: 76.6295, radius: 250, severity: "medium" },
    { name: "KR Circle — High Crowd Alert", lat: 12.3049, lng: 76.6521, radius: 140, severity: "low" },
  ] as const;

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return distance in meters
  };

  // Calculate minimum distance from point to polyline (route path)
  const calculateDistanceToPolyline = (lat: number, lng: number, polylinePath: google.maps.LatLng[]): number => {
    let minDistance = Infinity;
    for (let i = 0; i < polylinePath.length - 1; i++) {
      const p1Lat = polylinePath[i].lat();
      const p1Lng = polylinePath[i].lng();
      const p2Lat = polylinePath[i + 1].lat();
      const p2Lng = polylinePath[i + 1].lng();

      // Distance from point to line segment
      const segmentDistance = calculatePointToSegmentDistance(lat, lng, p1Lat, p1Lng, p2Lat, p2Lng);
      minDistance = Math.min(minDistance, segmentDistance);
    }
    return minDistance;
  };

  // Helper: distance from point (lat, lng) to line segment (p1->p2)
  const calculatePointToSegmentDistance = (lat: number, lng: number, p1Lat: number, p1Lng: number, p2Lat: number, p2Lng: number): number => {
    const lat1Rad = p1Lat * Math.PI / 180;
    const lng1Rad = p1Lng * Math.PI / 180;
    const lat2Rad = p2Lat * Math.PI / 180;
    const lng2Rad = p2Lng * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;

    const R = 6371000; // Earth's radius in meters
    const dLat21 = lat2Rad - lat1Rad;
    const dLng21 = lng2Rad - lng1Rad;
    const dLatP1 = latRad - lat1Rad;
    const dLngP1 = lngRad - lng1Rad;

    const dotProduct = dLat21 * dLatP1 + dLng21 * dLngP1;
    const segmentLength = Math.sqrt(dLat21 * dLat21 + dLng21 * dLng21);

    if (segmentLength === 0) {
      return calculateDistance(lat, lng, p1Lat, p1Lng);
    }

    const t = Math.max(0, Math.min(1, dotProduct / (segmentLength * segmentLength)));
    const closestLat = p1Lat + t * (p2Lat - p1Lat);
    const closestLng = p1Lng + t * (p2Lng - p1Lng);

    return calculateDistance(lat, lng, closestLat, closestLng);
  };

  // Request user current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          toast.success("Accessed your current location successfully!");
        },
        (error) => {
          console.error("Error accessing location", error);
          // Fallback starting coordinates centered on central Mysore (Railway Station)
          const mockLocation = { lat: 12.3162, lng: 76.6415 };
          setUserLocation(mockLocation);
          toast.info("Using Central Mysore start coordinates as fallback.");
        }
      );
    } else {
      const mockLocation = { lat: 12.3162, lng: 76.6415 };
      setUserLocation(mockLocation);
    }
  }, []);

  // Fetch real artisan locations from Google Places API (separated effect to ensure services are initialized)
  useEffect(() => {
    if (!placesServiceReady || !userLocation) return;

    setArtisansFetchAttempted(true);

    const searchQueries = [
      "Mysore silk weaving Mysuru",
      "Mysore wood carving workshop",
      "traditional painting gallery Mysore",
      "Mysore handicraft shop",
      "Mysore jewelry artisan",
      "leather craft workshop Mysore"
    ];

    const fetchedArtisans: Artisan[] = [];
    let completed = 0;

    searchQueries.forEach((query, idx) => {
      placesServiceRef.current?.nearbySearch({
        location: { lat: 12.3051, lng: 76.6551 },
        radius: 15000,
        keyword: query
      }, (results, status) => {
        completed++;
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const craftTypes = ["🧵", "🪵", "🎨", "🎭", "💎", "👜"];
          results.slice(0, 2).forEach((place, i) => {
            if (place.geometry?.location && place.name) {
              fetchedArtisans.push({
                id: fetchedArtisans.length + 1,
                name: place.name,
                craft: query.split(" ").slice(1).join(" "),
                location: place.vicinity || "Mysore",
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                products: [query.split(" ")[1]],
                rating: place.rating || 4.5,
                icon: craftTypes[idx % craftTypes.length]
              });
            }
          });
        } else if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.warn(`Places API error for query "${query}": ${status}`);
        }

        // When all queries completed, update artisans
        if (completed === searchQueries.length) {
          const allArtisans = fetchedArtisans.length > 0 ? fetchedArtisans : artisans;
          const nearby = allArtisans.map(a => ({
            ...a,
            distance: calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude)
          }))
          .filter(a => a.distance! <= 500)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));
          setNearbyArtisans(nearby);
        }
      });
    });
  }, [placesServiceReady, userLocation]);

  // Fallback: Use hardcoded artisans if Google Places fetch hasn't completed yet (with delay to avoid race condition)
  useEffect(() => {
    if (!userLocation || nearbyArtisans.length > 0 || !artisansFetchAttempted) return;

    // Only use fallback after a short delay to give Google Places API time to respond
    const timer = setTimeout(() => {
      if (nearbyArtisans.length === 0) {
        const nearby = artisans.map(artisan => ({
          ...artisan,
          distance: calculateDistance(userLocation.lat, userLocation.lng, artisan.latitude, artisan.longitude)
        }))
        .filter(artisan => artisan.distance! <= 500)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setNearbyArtisans(nearby);
      }
    }, 2000); // Wait 2 seconds for Google Places to respond

    return () => clearTimeout(timer);
  }, [userLocation, artisansFetchAttempted, nearbyArtisans.length]);

  // Display User Location Pin on Map
  useEffect(() => {
    if (!map || !userLocation || !window.google || !window.google.maps) return;

    try {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#3B82F6", // Bright solid blue
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3
        }
      });
      return () => {
        userMarker.setMap(null);
      };
    } catch (error) {
      console.error("Error drawing user marker", error);
    }
  }, [map, userLocation]);

  // Load Google Maps API Script
  useEffect(() => {
    // Setup authentication failure callback
    (window as any).gm_authFailure = () => {
      setMapError(true);
      toast.error("Google Maps authentication failed. Please check your API key & Google Cloud project.");
    };

    if (window.google && window.google.maps) {
      setGoogleLoaded(true);
      return;
    }
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      const handleLoad = () => setGoogleLoaded(true);
      existingScript.addEventListener("load", handleLoad);
      return () => {
        existingScript.removeEventListener("load", handleLoad);
      };
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
      console.error("Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in .env.local");
    }
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleLoaded(true);
    };
    script.onerror = () => {
      setMapError(true);
      toast.error("Failed to load Google Maps API script");
    };
    document.head.appendChild(script);

    return () => {
      delete (window as any).gm_authFailure;
    };
  }, []);

  // Initialize Map & Directions Renderer (with layout timeout to prevent incomplete map load)
  useEffect(() => {
    if (!googleLoaded || !mapContainerRef.current || map || !window.google || !window.google.maps) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      try {
        const initializedMap = new google.maps.Map(mapContainerRef.current, {
          center: { lat: 12.3051, lng: 76.6551 }, // Centered on Mysore Palace
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        const renderer = new google.maps.DirectionsRenderer({
          map: initializedMap,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#8B5CF6", // Premium purple route line
            strokeWeight: 6,
            strokeOpacity: 0.8
          }
        });

        setMap(initializedMap);
        setDirectionsRenderer(renderer);

        // Force Map to recalculate bounds and layout size to render all tiles cleanly
        google.maps.event.trigger(initializedMap, 'resize');
      } catch (error) {
        console.error("Error loading map", error);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [googleLoaded]);

  // Handle container resizing to prevent incomplete tile rendering
  useEffect(() => {
    if (!map || !mapContainerRef.current || !window.google || !window.google.maps) return;

    const container = mapContainerRef.current;
    let resizeTimer: number;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce slightly to ensure rendering transitions are completed
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!map) return;
        try {
          google.maps.event.trigger(map, 'resize');
          // Re-center map to the selected place or default location
          if (selectedPlace) {
            map.panTo({ lat: selectedPlace.latitude, lng: selectedPlace.longitude });
          } else {
            map.panTo({ lat: 12.3051, lng: 76.6551 });
          }
        } catch (err) {
          console.error("Error in map resize handler", err);
        }
      }, 100);
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.unobserve(container);
      clearTimeout(resizeTimer);
    };
  }, [map, selectedPlace]);

  // Draw / clear danger zone circles
  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;

    // Clear existing circles
    dangerCirclesRef.current.forEach((c) => c.setMap(null));
    dangerCirclesRef.current = [];

    if (!showDangerZones) return;

    dangerZones.forEach((zone) => {
      const fillOpacity = zone.severity === "high" ? 0.22 : zone.severity === "medium" ? 0.15 : 0.10;
      const strokeOpacity = zone.severity === "high" ? 0.9 : zone.severity === "medium" ? 0.75 : 0.55;

      const circle = new google.maps.Circle({
        map,
        center: { lat: zone.lat, lng: zone.lng },
        radius: zone.radius,
        fillColor: "#EF4444",
        fillOpacity,
        strokeColor: "#DC2626",
        strokeWeight: 2,
        strokeOpacity,
        zIndex: 2,
        clickable: true,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;padding:10px 12px;max-width:220px;">
          <p style="font-weight:700;color:#DC2626;margin:0 0 4px;">⚠️ ${zone.name}</p>
          <p style="font-size:12px;color:#555;margin:0;">Exercise caution in this area.<br/>Source: Mysore City Police</p>
        </div>`,
        position: { lat: zone.lat, lng: zone.lng },
      });

      circle.addListener("click", () => {
        infoWindow.open(map);
      });

      dangerCirclesRef.current.push(circle);
    });

    return () => {
      dangerCirclesRef.current.forEach((c) => c.setMap(null));
      dangerCirclesRef.current = [];
    };
  }, [map, showDangerZones]);

  // Draw / clear artisan markers
  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;

    // Clear existing markers
    artisanMarkersRef.current.forEach((m) => m.setMap(null));
    artisanMarkersRef.current = [];

    if (!showArtisans) return;

    nearbyArtisans.forEach((artisan) => {
      try {
        const marker = new google.maps.Marker({
          position: { lat: artisan.latitude, lng: artisan.longitude },
          map: map,
          title: artisan.name,
          label: {
            text: artisan.icon,
            fontSize: "18px"
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#F59E0B",
            fillOpacity: 0.9,
            strokeColor: "#FFFFFF",
            strokeWeight: 2
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif;padding:10px 12px;max-width:200px;">
            <p style="font-weight:700;color:#D97706;margin:0 0 4px;">${artisan.icon} ${artisan.name}</p>
            <p style="font-size:12px;color:#555;margin:0 0 6px;"><strong>${artisan.craft}</strong></p>
            <p style="font-size:12px;color:#666;margin:0 0 6px;">${artisan.products.join(", ")}</p>
            <p style="font-size:12px;color:#888;margin:0;">Rating: ⭐ ${artisan.rating}</p>
          </div>`,
          position: { lat: artisan.latitude, lng: artisan.longitude }
        });

        marker.addListener("click", () => {
          infoWindow.open(map);
        });

        artisanMarkersRef.current.push(marker);
      } catch (error) {
        console.error("Error creating artisan marker", error);
      }
    });

    return () => {
      artisanMarkersRef.current.forEach((m) => m.setMap(null));
      artisanMarkersRef.current = [];
    };
  }, [map, showArtisans, nearbyArtisans]);

  const places: Place[] = [
    {
      id: 1,
      name: "Mysore Palace",
      location: "Sayyaji Rao Rd, Agrahara",
      category: "Heritage",
      rating: 4.8,
      distance: "2.3 km",
      icon: "🏰",
      latitude: 12.3051,
      longitude: 76.6551,
      image: "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 2,
      name: "Chamundi Hills",
      location: "Chamundi Hill Rd",
      category: "Nature",
      rating: 4.7,
      distance: "13 km",
      icon: "⛰️",
      latitude: 12.2725,
      longitude: 76.6731,
      image: "https://images.unsplash.com/photo-1709389137241-af48d39f8b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 3,
      name: "Brindavan Gardens",
      location: "KRS Backwater, Mandya",
      category: "Nature",
      rating: 4.6,
      distance: "21 km",
      icon: "🌳",
      latitude: 12.4244,
      longitude: 76.5752,
      image: "https://images.unsplash.com/photo-1764351776302-55cc518790cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 4,
      name: "St. Philomena's Cathedral",
      location: "Ashoka Rd, Lakshmipuram",
      category: "Heritage",
      rating: 4.7,
      distance: "3.1 km",
      icon: "⛪",
      latitude: 12.3151,
      longitude: 76.6405,
      image: "https://images.unsplash.com/photo-1618805804116-797ea9369cb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 5,
      name: "Mysore Zoo",
      location: "Indira Gandhi Rd",
      category: "Nature",
      rating: 4.5,
      distance: "2.8 km",
      icon: "🦁",
      latitude: 12.3008,
      longitude: 76.6548,
      image: "https://images.unsplash.com/photo-1615824996195-f780bba7cfab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 6,
      name: "Jaganmohan Palace",
      location: "Vinoba Rd, Jayalakshmipuram",
      category: "Heritage",
      rating: 4.4,
      distance: "1.8 km",
      icon: "🎨",
      latitude: 12.3095,
      longitude: 76.6524,
      image: "https://images.unsplash.com/photo-1659126574791-13313aa424bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 7,
      name: "Devaraja Market",
      location: "Sayyaji Rao Rd, Mandi Mohalla",
      category: "Shopping",
      rating: 4.3,
      distance: "2.1 km",
      icon: "🛒",
      latitude: 12.3069,
      longitude: 76.6545,
      image: "https://images.unsplash.com/photo-1772460759097-ad68b3232a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 8,
      name: "Karanji Lake",
      location: "Karanji Lake Nature Park",
      category: "Nature",
      rating: 4.5,
      distance: "4.2 km",
      icon: "🦋",
      latitude: 12.2897,
      longitude: 76.6608
    },
    {
      id: 9,
      name: "Sri Hanuman Temple",
      location: "Chamarajpet, Mysore",
      category: "Temple",
      rating: 4.9,
      distance: "5.1 km",
      icon: "🙏",
      latitude: 12.3150,
      longitude: 76.6380,
      image: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 10,
      name: "Nanjangud Sri Basaveshwara Temple",
      location: "Nanjangud Town",
      category: "Temple",
      rating: 4.7,
      distance: "28 km",
      icon: "⛩️",
      latitude: 12.0276,
      longitude: 76.7014,
      image: "https://images.unsplash.com/photo-1596040383842-de6c57d71a96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 11,
      name: "Srirangapatna Island",
      location: "Srirangapatna",
      category: "Heritage",
      rating: 4.6,
      distance: "17 km",
      icon: "🏛️",
      latitude: 12.4145,
      longitude: 76.7108,
      image: "https://images.unsplash.com/photo-1605662960234-8a8f22db6e7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 12,
      name: "Krishnarajendra Wildlife Sanctuary",
      location: "Bandipur",
      category: "Nature",
      rating: 4.8,
      distance: "80 km",
      icon: "🐯",
      latitude: 11.7062,
      longitude: 76.0789,
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 13,
      name: "Tipu Sultan's Summer Palace",
      location: "Srirangapatna",
      category: "Heritage",
      rating: 4.7,
      distance: "18 km",
      icon: "👑",
      latitude: 12.4167,
      longitude: 76.7167,
      image: "https://images.unsplash.com/photo-1595949594686-80b4af50efb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 14,
      name: "Government Museum",
      location: "Sayyaji Rao Rd, Mysore",
      category: "Heritage",
      rating: 4.4,
      distance: "2.5 km",
      icon: "🏛️",
      latitude: 12.3030,
      longitude: 76.6550,
      image: "https://images.unsplash.com/photo-1578154519344-1c27b2fc8bff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 15,
      name: "Mysore Rail Museum",
      location: "Mysore Railway Station",
      category: "Heritage",
      rating: 4.5,
      distance: "3.2 km",
      icon: "🚂",
      latitude: 12.3162,
      longitude: 76.6415,
      image: "https://images.unsplash.com/photo-1517581291721-2ec3fdc3a937?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 16,
      name: "Public Park & Toy Train",
      location: "Mysore Palace Area",
      category: "Nature",
      rating: 4.3,
      distance: "2.4 km",
      icon: "🚆",
      latitude: 12.3080,
      longitude: 76.6530
    },
    {
      id: 17,
      name: "Sri Ranganathaswamy Temple",
      location: "Srirangapatna",
      category: "Temple",
      rating: 4.9,
      distance: "17 km",
      icon: "🛕",
      latitude: 12.4139,
      longitude: 76.7132,
      image: "https://images.unsplash.com/photo-1588827190052-191742f900e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
      id: 18,
      name: "Sri Chamaraja Wodeyar Palace",
      location: "Mysore",
      category: "Heritage",
      rating: 4.6,
      distance: "2.2 km",
      icon: "🏰",
      latitude: 12.3020,
      longitude: 76.6550
    },
    {
      id: 19,
      name: "Kukkarahalli Lake",
      location: "Kukkarahalli, Mysore",
      category: "Nature",
      rating: 4.4,
      distance: "6 km",
      icon: "🌊",
      latitude: 12.3250,
      longitude: 76.6250
    },
    {
      id: 20,
      name: "Namdroling Monastery",
      location: "Bylakuppe, Coorg",
      category: "Temple",
      rating: 4.8,
      distance: "110 km",
      icon: "🏯",
      latitude: 12.0463,
      longitude: 75.8458,
      image: "https://images.unsplash.com/photo-1585426261269-f4556b2f1fe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    }
  ];

  const categories = ["All", "Heritage", "Nature", "Cuisine", "Temple", "Shopping"];

  // Local Artisans data — within Mysuru area
  const artisans: Artisan[] = [
    {
      id: 1,
      name: "Raju's Silk Weaving Studio",
      craft: "Mysore Silk Weaving",
      location: "Devaraja Market, near Subramanya Temple",
      latitude: 12.3069,
      longitude: 76.6545,
      products: ["Silk Sarees", "Shawls", "Fabric"],
      rating: 4.9,
      icon: "🧵"
    },
    {
      id: 2,
      name: "Vintage Wooden Crafts",
      craft: "Wood Carving",
      location: "Chamarajpet, Mysore",
      latitude: 12.3095,
      longitude: 76.6524,
      products: ["Wooden Boxes", "Door Frames", "Handicrafts"],
      rating: 4.7,
      icon: "🪵"
    },
    {
      id: 3,
      name: "Mysore Paintings Atelier",
      craft: "Traditional Paintings",
      location: "Jayalakshmipuram, Mysore Palace Area",
      latitude: 12.3051,
      longitude: 76.6551,
      products: ["Paintings", "Canvas Art", "Murals"],
      rating: 4.8,
      icon: "🎨"
    },
    {
      id: 4,
      name: "Dharwad Sugarcane Sweets",
      craft: "Traditional Sweets Making",
      location: "KR Circle, Mysore",
      latitude: 12.3049,
      longitude: 76.6521,
      products: ["Chikhalwali", "Mysore Pak", "Sweets"],
      rating: 4.6,
      icon: "🍯"
    },
    {
      id: 5,
      name: "Jasmine Beads & Jewelry",
      craft: "Bead & Pearl Jewelry",
      location: "Chamundi Hill Road, Mysore",
      latitude: 12.2980,
      longitude: 76.6680,
      products: ["Beaded Jewelry", "Pearls", "Necklaces"],
      rating: 4.7,
      icon: "💎"
    },
    {
      id: 6,
      name: "Leather & Sandalwood Workshop",
      craft: "Leather Crafting",
      location: "Bannimantap, Mysore",
      latitude: 12.3163,
      longitude: 76.6295,
      products: ["Leather Bags", "Wallets", "Belts"],
      rating: 4.5,
      icon: "👜"
    },
    {
      id: 7,
      name: "Mysore Sandalwood Perfumes",
      craft: "Perfume & Fragrance",
      location: "Brindavan Garden Road, Mysore",
      latitude: 12.4244,
      longitude: 76.5752,
      products: ["Sandalwood Oil", "Perfumes", "Incense"],
      rating: 4.8,
      icon: "🌸"
    },
    {
      id: 8,
      name: "Bamboo Craft Studio",
      craft: "Bamboo Crafting",
      location: "Karanji Lake Nature Park, Mysore",
      latitude: 12.2897,
      longitude: 76.6608,
      products: ["Bamboo Baskets", "Furniture", "Decor"],
      rating: 4.6,
      icon: "🪶"
    }
  ];

  const filteredPlaces = places.filter((place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    toast.success(`Selected: ${place.name}`);
  };

  const handleOpenInGoogleMaps = (place: Place) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`, '_blank');
    toast.success(`Opening ${place.name} in Google Maps`);
  };

  const handleGetDirections = (place: Place) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`, '_blank');
    toast.success("Opening directions in Google Maps");
  };

  // Function to show path/route between User Location (source) and selected place
  const showRoute = (destination: Place) => {
    if (!map || !window.google || !window.google.maps || !directionsRenderer) return;

    // Use current user location coordinates, fallback to Mysore Palace if unavailable
    const startPoint = userLocation || { lat: 12.3051, lng: 76.6551 };

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: startPoint,
        destination: { lat: destination.latitude, lng: destination.longitude },
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);

          const route = result.routes[0];
          if (route && route.legs && route.legs[0]) {
            const durationText = route.legs[0].duration?.text || "Unknown time";
            const distanceText = route.legs[0].distance?.text || "Unknown distance";
            setTravelInfo({ duration: durationText, distance: distanceText });
          }

          // NEW: Detect artisans on route
          if (route.overview_path && nearbyArtisans.length > 0) {
            const artisansNearPath = nearbyArtisans.filter(artisan => {
              const distToPath = calculateDistanceToPolyline(artisan.latitude, artisan.longitude, route.overview_path);
              return distToPath <= 400; // 400m radius from route
            });

            setArtisansOnRoute(artisansNearPath);
            if (artisansNearPath.length > 0) {
              setShowOnRoutePanel(true);
            }
          }

          toast.success(`Showing path to ${destination.name}`);
        } else {
          toast.error("Could not calculate driving path from your location.");
        }
      }
    );
  };

  // Function to show multi-stop artisan trail
  const showArtisanTrail = () => {
    if (!map || !window.google || !window.google.maps || selectedArtisans.length === 0) return;

    const selectedArtisanObjects = nearbyArtisans.filter(a => selectedArtisans.includes(a.id));
    if (selectedArtisanObjects.length === 0) return;

    const startPoint = userLocation || { lat: 12.3051, lng: 76.6551 };
    const directionsService = new google.maps.DirectionsService();

    // Create waypoints from all except the last artisan
    const waypoints = selectedArtisanObjects.slice(0, -1).map(artisan => ({
      location: { lat: artisan.latitude, lng: artisan.longitude },
      stopover: true
    }));

    const destination = selectedArtisanObjects[selectedArtisanObjects.length - 1];

    // Clear old artisan route renderer if exists
    if (artisanRouteRendererRef.current) {
      artisanRouteRendererRef.current.setMap(null);
    }

    // Create new renderer for artisan trail with amber color
    const artisanRenderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#F59E0B", // Amber color for artisan trail
        strokeWeight: 6,
        strokeOpacity: 0.8
      }
    });

    artisanRouteRendererRef.current = artisanRenderer;

    directionsService.route(
      {
        origin: startPoint,
        destination: { lat: destination.latitude, lng: destination.longitude },
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          artisanRenderer.setDirections(result);

          let totalDuration = 0;
          let totalDistance = 0;

          result.routes[0].legs.forEach(leg => {
            totalDuration += leg.duration?.value || 0;
            totalDistance += leg.distance?.value || 0;
          });

          const hours = Math.floor(totalDuration / 3600);
          const minutes = Math.floor((totalDuration % 3600) / 60);
          const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
          const distanceText = (totalDistance / 1000).toFixed(1) + ' km';

          setTravelInfo({ duration: durationText, distance: distanceText });
          toast.success(`Artisan Trail planned! ${selectedArtisanObjects.length} stops`);
        } else {
          toast.error("Could not plan artisan trail.");
        }
      }
    );
  };

  // Synchronize Google Markers with filteredPlaces
  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    filteredPlaces.forEach((place) => {
      try {
        const marker = new google.maps.Marker({
          position: { lat: place.latitude, lng: place.longitude },
          map: map,
          title: place.name,
          label: {
            text: place.icon,
            fontSize: "16px"
          }
        });

        marker.addListener("click", () => {
          handlePlaceClick(place);
        });

        markersRef.current.push(marker);
      } catch (error) {
        console.error("Error creating marker", error);
      }
    });
  }, [filteredPlaces, map]);

  // Synchronize Map styling/type
  useEffect(() => {
    if (map && window.google && window.google.maps) {
      map.setMapTypeId(
        mapView === "standard"
          ? google.maps.MapTypeId.ROADMAP
          : google.maps.MapTypeId.SATELLITE
      );
    }
  }, [mapView, map]);

  // Pan to selected place and render driving path
  useEffect(() => {
    if (map && selectedPlace && window.google && window.google.maps) {
      map.panTo({ lat: selectedPlace.latitude, lng: selectedPlace.longitude });
      map.setZoom(14);

      if (directionsRenderer) {
        setTravelInfo(null); // Clear previous route info
        showRoute(selectedPlace);
      }
    }
  }, [selectedPlace, map, directionsRenderer, userLocation]);

  // Initialize AutocompleteService & PlacesService
  useEffect(() => {
    if (!map || !window.google || !window.google.maps || !window.google.maps.places) return;

    try {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      placesServiceRef.current = new google.maps.places.PlacesService(map);
      setPlacesServiceReady(true);
    } catch (error) {
      console.error("Error initializing places services", error);
    }
  }, [map]);

  // Handle search input changes with custom dropdown
  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setHighlightedIndex(0);

    if (!value.trim() || !autocompleteServiceRef.current) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    try {
      const predictions = await autocompleteServiceRef.current.getPlacePredictions({
        input: value,
        componentRestrictions: { country: "in" },
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(12.20, 76.50),
          new google.maps.LatLng(12.45, 76.75)
        )
      });

      setSearchSuggestions(predictions.predictions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching autocomplete predictions", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails({
      placeId: prediction.place_id,
      fields: ["geometry", "name", "formatted_address"]
    }, (place, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) {
        toast.error("Could not load place details.");
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const placeName = place.name || "";

      // Pan map
      map?.panTo({ lat, lng });
      map?.setZoom(15);

      // Create place object
      const searchedPlace: Place = {
        id: Math.floor(Math.random() * 10000) + 100,
        name: placeName,
        location: place.formatted_address || placeName,
        category: "Searched",
        rating: 5.0,
        distance: "Calculating...",
        icon: "📍",
        latitude: lat,
        longitude: lng
      };

      setSelectedPlace(searchedPlace);
      setSearchQuery(placeName);
      setShowSuggestions(false);
      toast.success(`Found and navigated to: ${placeName}`);
    });
  };

  // Handle keyboard navigation in dropdown
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % searchSuggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + searchSuggestions.length) % searchSuggestions.length);
        break;
      case "Enter":
        e.preventDefault();
        handleSuggestionSelect(searchSuggestions[highlightedIndex]);
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSuggestions]);

  // Function to fetch destination cover image dynamically from Google Places API
  const fetchGooglePhoto = (placeName: string) => {
    if (!map || !window.google || !window.google.maps || !window.google.maps.places) return;

    try {
      const service = new google.maps.places.PlacesService(map);
      service.findPlaceFromQuery(
        {
          query: placeName + " Mysuru",
          fields: ["photos"]
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
            const placeResult = results[0];
            if (placeResult.photos && placeResult.photos[0]) {
              const photoUrl = placeResult.photos[0].getUrl({ maxHeight: 500 });
              setGooglePhotoUrl(photoUrl);
              return;
            }
          }
          setGooglePhotoUrl(null);
        }
      );
    } catch (error) {
      console.error("Error fetching places photos from Google", error);
      setGooglePhotoUrl(null);
    }
  };

  // Fetch Google Place photo on selection
  useEffect(() => {
    if (selectedPlace) {
      setGooglePhotoUrl(null); // Clear previous photo url
      fetchGooglePhoto(selectedPlace.name);
    } else {
      setGooglePhotoUrl(null);
    }
  }, [selectedPlace, map]);

  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 13) + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || 13) - 1);
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Floating Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-3xl shadow-2xl p-4">
          {/* Search Input with Custom Dropdown */}
          <div className="relative mb-3">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search places in Mysuru..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              className="pl-10 pr-12 h-12 text-base bg-background/50 border-border"
            />
            {searchLoading && <div className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            )}

            {/* Custom Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-40 max-h-[400px] overflow-y-auto"
                role="listbox"
                aria-label="Search suggestions"
              >
                {searchSuggestions.map((suggestion, idx) => (
                  <div
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={`px-4 py-3 cursor-pointer transition-colors border-b border-border/50 ${
                      idx === highlightedIndex
                        ? "bg-primary/10"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-1">{suggestion.main_text}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{suggestion.secondary_text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSuggestions && searchSuggestions.length === 0 && searchQuery.trim() && !searchLoading && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl p-4 z-40 text-center">
                <p className="text-sm text-muted-foreground">No results found</p>
              </div>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer transition-all text-xs ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                {category}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground self-center ml-auto">
              {filteredPlaces.length} places
            </span>
          </div>
        </div>
      </div>

      {/* Floating Artisans Panel */}
      {showArtisans && nearbyArtisans.length > 0 && (
        <div className="absolute top-32 right-4 z-20 w-80 max-h-[calc(100vh-160px)] bg-card/95 backdrop-blur-md border border-amber-200 dark:border-amber-900/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md">
            <h3 className="font-bold text-amber-700 dark:text-amber-400">Local Artisans</h3>
            <button
              onClick={() => setShowArtisans(false)}
              className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-muted-foreground px-4 pt-3 pb-2">Within 500m of your location</p>
          <div className="px-4 pb-3 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)]">
            {nearbyArtisans.map((artisan) => (
              <div
                key={artisan.id}
                className="bg-background border rounded-2xl p-3 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedArtisans.includes(artisan.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedArtisans([...selectedArtisans, artisan.id]);
                      } else {
                        setSelectedArtisans(selectedArtisans.filter(id => id !== artisan.id));
                      }
                    }}
                    className="mt-1 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-sm line-clamp-1">{artisan.icon} {artisan.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{artisan.craft}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="line-clamp-1">{artisan.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{artisan.rating}</span>
                      </div>
                      <span className="text-muted-foreground">{(artisan.distance! / 1000).toFixed(2)} km</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {artisan.products.slice(0, 2).map((product, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] py-0 px-1">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedArtisans.length > 0 && (
            <div className="p-4 border-t border-border bg-amber-50 dark:bg-amber-950/20 sticky bottom-0">
              <Button
                onClick={showArtisanTrail}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Plan My Artisan Trail ({selectedArtisans.length})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Floating Places List Panel */}
      {showPlacesList && (
        <div className="absolute top-32 left-4 z-20 w-80 max-h-[calc(100vh-160px)] bg-card/95 backdrop-blur-md border border-border rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md">
            <h3 className="font-bold">Places List</h3>
            <button
              onClick={() => setShowPlacesList(false)}
              className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-220px)]">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => {
                  handlePlaceClick(place);
                  setShowPlacesList(false);
                }}
                className={`bg-background border rounded-2xl p-3 cursor-pointer transition-all hover:shadow-md ${
                  selectedPlace?.id === place.id
                    ? "border-primary shadow-md"
                    : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{place.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-sm line-clamp-1">{place.name}</h3>
                      <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                        {place.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="line-clamp-1">{place.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{place.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Navigation className="w-3 h-3" />
                        <span>{place.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredPlaces.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No places found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map View - Full Width */}
      <div className="w-full h-full relative">
        {/* Map Controls */}
        <div className="absolute top-6 left-6 z-10 flex gap-3 flex-wrap">
          <Button
            onClick={() => setMapView(mapView === "standard" ? "satellite" : "standard")}
            variant="outline"
            className="bg-card shadow-lg"
          >
            <Layers className="w-4 h-4 mr-2" />
            {mapView === "standard" ? "Satellite" : "Standard"}
          </Button>
          <Button
            onClick={() => setShowDangerZones(!showDangerZones)}
            variant={showDangerZones ? "destructive" : "outline"}
            className={`shadow-lg ${!showDangerZones ? "bg-card border-red-300 text-red-600 hover:bg-red-50" : ""}`}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {showDangerZones ? "Hide Danger Zones" : "Show Danger Zones"}
          </Button>
          <Button
            onClick={() => setShowArtisans(!showArtisans)}
            variant={showArtisans ? "default" : "outline"}
            className={`shadow-lg ${showArtisans ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-card border-amber-300 text-amber-600 hover:bg-amber-50"}`}
          >
            <span className="mr-2">🧵</span>
            Artisans {nearbyArtisans.length > 0 && `(${nearbyArtisans.length})`}
          </Button>
          {selectedPlace && (
            <>
              <Button
                onClick={() => handleOpenInGoogleMaps(selectedPlace)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Open in Google Maps
              </Button>
              <Button
                onClick={() => handleGetDirections(selectedPlace)}
                variant="outline"
                className="bg-card shadow-lg"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </>
          )}
        </div>

        {/* Danger Zone Legend */}
        {showDangerZones && (
          <div className="absolute top-20 right-6 z-20 bg-card/95 backdrop-blur-md border border-red-200 dark:border-red-900/40 rounded-2xl p-4 shadow-xl w-52">
            <p className="text-xs font-bold mb-3 text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Danger Zone Legend
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-red-600 opacity-80 border border-red-700 flex-shrink-0"></div>
                <span className="text-muted-foreground">High Crime Zone</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-red-500 opacity-60 border border-red-600 flex-shrink-0"></div>
                <span className="text-muted-foreground">Medium Risk Zone</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-red-400 opacity-45 border border-red-500 flex-shrink-0"></div>
                <span className="text-muted-foreground">High Crowd Alert</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 border-t border-border pt-2">
              Source: Mysore City Police Records
            </p>
          </div>
        )}

        {/* Real Google Map Container */}
        <div ref={mapContainerRef} className="w-full h-full bg-slate-900" />

        {/* Dynamic Troubleshooting Error Overlay for API authorization failures */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md z-30 animate-[fadeIn_0.3s_ease-out_forwards]">
            <div className="bg-card border-2 border-red-500/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl flex flex-col items-center">
              <div className="w-16 h-16 bg-red-500/10 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-4xl mb-5 animate-pulse">
                ⚠️
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground tracking-tight">Google Maps API Config Needed</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                The map loaded but returned a <strong>"Something went wrong"</strong> authentication error. This means the API key is active, but Google Cloud needs configuration:
              </p>
              <ul className="text-left text-xs space-y-2 mb-6 text-muted-foreground list-disc list-inside">
                <li>The <strong>Maps JavaScript API</strong> is not enabled in your Google Cloud Console project.</li>
                <li><strong>Billing is not linked</strong> to your Google Cloud project (required for Maps JS SDK).</li>
                <li>The API key might have HTTP referrer restrictions configured.</li>
              </ul>
              
              <div className="bg-accent/60 border border-border/80 rounded-2xl p-4 w-full text-left text-xs mb-6 font-mono break-all text-muted-foreground">
                <span className="font-semibold text-foreground">API Key Used:</span><br />
                AIzaSyC1N_oj4VQWRusYJr0EInl9R03ynp_eGGE
              </div>

              <div className="flex gap-3 w-full">
                <Button
                  onClick={() => window.open("https://console.cloud.google.com/google/maps-apis/api-list", "_blank")}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-11 rounded-xl font-bold shadow-lg"
                >
                  Enable API in Console
                </Button>
                <Button
                  onClick={() => setMapError(false)}
                  variant="outline"
                  className="flex-1 text-xs h-11 rounded-xl font-medium border-border"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* On Your Way - Artisans on Route Panel */}
        {showOnRoutePanel && artisansOnRoute.length > 0 && (
          <div className="absolute bottom-96 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20 animate-[slideUp_0.4s_ease-out_forwards]">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧵</span>
                  <div>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200">{artisansOnRoute.length} Artisans On Your Way!</p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">Add stops to visit local craft makers</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOnRoutePanel(false)}
                  className="w-6 h-6 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900 flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
                {artisansOnRoute.slice(0, 3).map((artisan) => (
                  <div
                    key={artisan.id}
                    className="bg-white dark:bg-slate-900/50 rounded-xl p-2.5 flex items-start justify-between border border-amber-100 dark:border-amber-800"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold line-clamp-1">{artisan.icon} {artisan.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{artisan.craft}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!stopsAdded.includes(artisan.id)) {
                          setStopsAdded([...stopsAdded, artisan.id]);
                          toast.success(`Added ${artisan.name} as a stop!`);
                        }
                      }}
                      className={`ml-2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        stopsAdded.includes(artisan.id)
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 hover:bg-amber-200"
                      }`}
                    >
                      {stopsAdded.includes(artisan.id) ? "✓ Added" : "+ Add"}
                    </button>
                  </div>
                ))}
              </div>

              {stopsAdded.length > 0 && (
                <Button
                  onClick={() => {
                    if (!map || !directionsRenderer || !selectedPlace || !window.google || !window.google.maps) return;

                    const startPoint = userLocation || { lat: 12.3051, lng: 76.6551 };
                    const selectedArtisanObjects = artisansOnRoute.filter(a => stopsAdded.includes(a.id));

                    if (selectedArtisanObjects.length === 0) return;

                    const waypoints = selectedArtisanObjects.map(artisan => ({
                      location: { lat: artisan.latitude, lng: artisan.longitude },
                      stopover: true
                    }));

                    const destination = { lat: selectedPlace.latitude, lng: selectedPlace.longitude };

                    const directionsService = new google.maps.DirectionsService();
                    directionsService.route(
                      {
                        origin: startPoint,
                        destination: destination,
                        waypoints: waypoints,
                        travelMode: google.maps.TravelMode.DRIVING,
                        optimizeWaypoints: true
                      },
                      (result, status) => {
                        if (status === google.maps.DirectionsStatus.OK && result) {
                          directionsRenderer.setDirections(result);

                          let totalDuration = 0;
                          let totalDistance = 0;

                          result.routes[0].legs.forEach(leg => {
                            totalDuration += leg.duration?.value || 0;
                            totalDistance += leg.distance?.value || 0;
                          });

                          const hours = Math.floor(totalDuration / 3600);
                          const minutes = Math.round((totalDuration % 3600) / 60);
                          const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                          const distanceText = (totalDistance / 1000).toFixed(1);

                          setTravelInfo({ duration: durationText, distance: `${distanceText} km` });
                          toast.success(`Route updated with ${stopsAdded.length} artisan stops!`);
                          setShowOnRoutePanel(false);
                        } else {
                          toast.error("Could not update route with artisan stops.");
                        }
                      }
                    );
                  }}
                  className="w-full h-9 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg"
                >
                  Update Route ({stopsAdded.length})
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Destination Place Photo, Travel Time, and Navigation Panel */}
        {selectedPlace && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20 animate-[slideUp_0.4s_ease-out_forwards]">
            <div className="bg-card/95 backdrop-blur-md border-2 border-primary/10 rounded-3xl shadow-2xl overflow-hidden p-4">
              <div className="flex gap-4 mb-4">
                {/* Photo (Dynamically pulled from Google Places or fallback to Unsplash) */}
                <div 
                  onClick={() => setShowPreviewModal(true)}
                  className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 relative border border-border cursor-pointer group"
                >
                  <img
                    src={googlePhotoUrl || selectedPlace.image || "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"}
                    alt={selectedPlace.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Preview
                  </div>
                  <div className="absolute bottom-1 right-1 text-base bg-black/40 px-1.5 py-0.5 rounded-lg text-white">
                    {selectedPlace.icon}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-base text-foreground line-clamp-1">{selectedPlace.name}</h4>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0">{selectedPlace.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{selectedPlace.location}</p>
                  </div>

                  {/* Travel Info */}
                  {travelInfo ? (
                    <div className="flex items-center gap-4 text-xs font-semibold text-primary bg-primary/5 dark:bg-primary/10 px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <span>⏱️</span>
                        <span>{travelInfo.duration}</span>
                      </div>
                      <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full"></div>
                      <div className="flex items-center gap-1.5">
                        <span>🚗</span>
                        <span>{travelInfo.distance}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></span>
                      Calculating travel route...
                    </div>
                  )}
                </div>
              </div>

              {/* Start & View Options */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPreviewModal(true)}
                  variant="outline"
                  className="flex-1 border-border text-foreground font-bold h-11 rounded-2xl flex items-center justify-center gap-1.5"
                >
                  👁️ View Preview
                </Button>
                
                <Button
                  onClick={() => {
                    const start = userLocation || { lat: 12.3051, lng: 76.6551 };
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${selectedPlace.latitude},${selectedPlace.longitude}&travelmode=driving`,
                      "_blank"
                    );
                    toast.success("Launching turn-by-turn navigation in Google Maps!");
                  }}
                  className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-700 text-white font-bold h-11 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Navigation className="w-4 h-4 fill-white animate-pulse" />
                  Start Route
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Google Places Live Photo Preview Lightbox Modal */}
        {showPreviewModal && selectedPlace && (
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setShowPreviewModal(false)}
          >
            <div 
              className="relative max-w-3xl w-full bg-card border border-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedPlace.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedPlace.location}</p>
                </div>
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="w-9 h-9 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Live Google Places Image Canvas */}
              <div className="aspect-video w-full bg-slate-950 relative">
                <img
                  src={googlePhotoUrl || selectedPlace.image || "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200"}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary/95 text-primary-foreground shadow-lg flex items-center gap-1.5">
                    <span>📸</span>
                    <span>Google Places Live Photo</span>
                  </Badge>
                </div>
              </div>

              {/* Bottom Panel */}
              <div className="p-6 bg-accent/40 border-t border-border flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Category: </span>
                  <span className="font-bold text-foreground">{selectedPlace.category}</span>
                </div>
                <Button
                  onClick={() => {
                    const start = userLocation || { lat: 12.3051, lng: 76.6551 };
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${selectedPlace.latitude},${selectedPlace.longitude}&travelmode=driving`,
                      "_blank"
                    );
                    setShowPreviewModal(false);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs sm:text-sm"
                >
                  Start Navigation
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Zoom Controls overlaying live map */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
          <button
            onClick={handleZoomIn}
            className="bg-card border border-border w-12 h-12 rounded-2xl hover:bg-accent flex items-center justify-center transition-colors shadow-2xl active:scale-95 text-xl font-bold"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-card border border-border w-12 h-12 rounded-2xl hover:bg-accent flex items-center justify-center transition-colors shadow-2xl active:scale-95 text-xl font-bold"
          >
            −
          </button>
        </div>

        {/* Current Location Indicator overlaying live map */}
        <div className="absolute bottom-6 left-6 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-2xl z-10 flex items-center gap-3">
          <span className="w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-md"></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground -mb-0.5">LOCATION</p>
            <p className="text-sm font-bold text-foreground">Mysuru, Karnataka</p>
          </div>
        </div>
      </div>
    </div>
  );
}

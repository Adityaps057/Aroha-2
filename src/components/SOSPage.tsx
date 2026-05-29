import { Phone, Hospital, Shield, Flame, Ambulance, UserRound, MapPin, Clock, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface EmergencyContact {
  id: number;
  name: string;
  number: string;
  category: string;
  icon: string;
  description: string;
  available: string;
  color: string;
}

export function SOSPage() {
  const emergencyContacts: EmergencyContact[] = [
    {
      id: 1,
      name: "Police Emergency",
      number: "100",
      category: "Police",
      icon: "🚓",
      description: "For immediate police assistance and emergencies",
      available: "24/7",
      color: "from-blue-600 to-blue-800"
    },
    {
      id: 2,
      name: "Ambulance Service",
      number: "108",
      category: "Medical",
      icon: "🚑",
      description: "Emergency medical services and ambulance",
      available: "24/7",
      color: "from-red-600 to-red-800"
    },
    {
      id: 3,
      name: "Fire Brigade",
      number: "101",
      category: "Fire",
      icon: "🚒",
      description: "Fire emergency and rescue services",
      available: "24/7",
      color: "from-orange-600 to-orange-800"
    },
    {
      id: 4,
      name: "Women Helpline",
      number: "1091",
      category: "Safety",
      icon: "👮‍♀️",
      description: "24-hour helpline for women in distress",
      available: "24/7",
      color: "from-purple-600 to-purple-800"
    },
    {
      id: 5,
      name: "Tourist Police",
      number: "0821-2418339",
      category: "Police",
      icon: "🏛️",
      description: "Mysuru tourist police helpline",
      available: "9 AM - 6 PM",
      color: "from-teal-600 to-teal-800"
    },
    {
      id: 6,
      name: "District Hospital",
      number: "0821-2520674",
      category: "Medical",
      icon: "🏥",
      description: "K.R. Hospital Mysuru emergency",
      available: "24/7",
      color: "from-green-600 to-green-800"
    }
  ];

  const importantPlaces = [
    {
      name: "City Police Commissioner Office",
      address: "Nazarbad, Mysuru",
      phone: "0821-2444800"
    },
    {
      name: "K.R. Hospital",
      address: "Sayyaji Rao Rd, Mysuru",
      phone: "0821-2520674"
    },
    {
      name: "Railway Police Station",
      address: "Mysuru Railway Station",
      phone: "0821-2520680"
    }
  ];

  const handleEmergencyCall = (name: string, number: string) => {
    window.open(`tel:${number}`, '_self');
    toast.success(`Calling ${name} - ${number}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header with Warning */}
      <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-3xl p-6 mb-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl">
            <AlertTriangle className="w-10 h-10 animate-pulse" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Emergency SOS</h1>
            <p className="text-white/90">Quick access to emergency services in Mysuru</p>
          </div>
          <Button
            onClick={() => handleEmergencyCall("Police Emergency", "100")}
            className="bg-white text-red-600 hover:bg-white/90 font-bold px-8 py-6 text-lg"
          >
            <Phone className="w-5 h-5 mr-2" />
            Call 100
          </Button>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Button
          onClick={() => handleEmergencyCall("Police", "100")}
          className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white h-24 text-lg font-bold"
        >
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-8 h-8" />
            <span>Police - 100</span>
          </div>
        </Button>
        <Button
          onClick={() => handleEmergencyCall("Ambulance", "108")}
          className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white h-24 text-lg font-bold"
        >
          <div className="flex flex-col items-center gap-2">
            <Ambulance className="w-8 h-8" />
            <span>Ambulance - 108</span>
          </div>
        </Button>
        <Button
          onClick={() => handleEmergencyCall("Fire Brigade", "101")}
          className="bg-gradient-to-br from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white h-24 text-lg font-bold"
        >
          <div className="flex flex-col items-center gap-2">
            <Flame className="w-8 h-8" />
            <span>Fire - 101</span>
          </div>
        </Button>
      </div>

      {/* Emergency Contacts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Emergency Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Icon Header */}
              <div className={`bg-gradient-to-br ${contact.color} h-32 flex items-center justify-center text-6xl relative`}>
                {contact.icon}
                <Badge className="absolute top-3 right-3 bg-white text-foreground">
                  {contact.category}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">{contact.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {contact.description}
                </p>

                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{contact.available}</span>
                </div>

                <div className="bg-accent rounded-2xl p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="font-bold text-2xl">{contact.number}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleEmergencyCall(contact.name, contact.number)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Places */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Important Places</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {importantPlaces.map((place, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{place.name}</h3>
                  <p className="text-sm text-muted-foreground">{place.address}</p>
                </div>
              </div>
              <Button
                onClick={() => handleEmergencyCall(place.name, place.phone)}
                variant="outline"
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                {place.phone}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Safety Tips for Tourists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <p className="text-sm">Always keep emergency numbers saved in your phone</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <p className="text-sm">Share your location with family or friends when traveling</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <p className="text-sm">Keep hotel contact information handy at all times</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
              4
            </div>
            <p className="text-sm">Tourist Police can help with directions and safety concerns</p>
          </div>
        </div>
      </div>
    </div>
  );
}

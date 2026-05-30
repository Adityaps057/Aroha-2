import { Camera, MapPin, Star, Coins, Trophy, Heart, Settings, Bell, Globe, Moon, Lock, LogOut, Edit, TrendingUp, Users, Bookmark, Award, X, Save, Loader2, User, Mail, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getCoins } from "../utils/rewards";

interface ProfilePageProps {
  onLogout?: () => void;
}

export function ProfilePage({ onLogout }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [userProfile, setUserProfile] = useState(() => {
    const savedEmail = localStorage.getItem("aroha_logged_in_email") || "priya.sharma@email.com";
    const savedName = localStorage.getItem("aroha_logged_in_name") || savedEmail.split("@")[0];
    const savedPhone = localStorage.getItem("aroha_logged_in_phone") || "";
    const displayName = savedEmail === "priya.sharma@email.com" ? "Priya Sharma" : (savedName ? savedName.charAt(0).toUpperCase() + savedName.slice(1) : savedEmail.split("@")[0]);

    return {
      name: displayName,
      avatar: savedEmail === "guest@aroha.com" ? "👤" : "👩",
      email: savedEmail,
      phone: savedPhone,
      bio: "Travel enthusiast exploring India's hidden gems. Love heritage sites and local cuisine!",
      level: "Explorer Elite",
      isPremium: savedEmail !== "guest@aroha.com",
      coins: 1350,
      tripsCompleted: 12,
      hiddenGemsVisited: 8,
      rewardsRedeemed: 3,
      travelPreferences: {
        favoriteCategory: "Heritage",
        budget: "Mid-range",
        travelStyle: "Cultural Explorer"
      }
    };
  });

  const [editedProfile, setEditedProfile] = useState(userProfile);

  // Sync with Supabase Auth and rewards balance
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const coins = await getCoins();
        if (user) {
          // Fetch additional profile fields from Supabase profiles table
          let { data: profile, error: dbError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          // Auto-provision profile row in DB if missing
          if (!profile && !dbError) {
            const { data: newProfile } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Explorer",
                phone: user.user_metadata?.phone || user.phone || "",
                coins: coins
              })
              .select()
              .single();
            if (newProfile) {
              profile = newProfile;
            }
          }

          const profileData = {
            ...userProfile,
            name: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Explorer",
            email: user.email || "",
            phone: profile?.phone || user.user_metadata?.phone || user.phone || "",
            bio: profile?.bio || user.user_metadata?.bio || "Travel enthusiast exploring India's hidden gems. Love heritage sites and local cuisine!",
            avatar: profile?.avatar || user.user_metadata?.avatar || (user.email === "guest@aroha.com" ? "👤" : "👩"),
            level: profile?.level || "Explorer Elite",
            isPremium: profile?.is_premium !== undefined ? profile.is_premium : (user.email === "guest@aroha.com" ? false : true),
            coins: profile?.coins !== undefined ? profile.coins : coins,
            tripsCompleted: profile?.trips_completed !== undefined ? profile.trips_completed : 12,
            hiddenGemsVisited: profile?.hidden_gems_visited !== undefined ? profile.hidden_gems_visited : 8,
            rewardsRedeemed: profile?.rewards_redeemed !== undefined ? profile.rewards_redeemed : 3,
            travelPreferences: {
              favoriteCategory: profile?.favorite_category || "Heritage",
              budget: profile?.budget_preference || "Mid-range",
              travelStyle: profile?.travel_style || "Cultural Explorer"
            }
          };
          setUserProfile(profileData);
          setEditedProfile(profileData);
        } else {
          const savedEmail = localStorage.getItem("aroha_logged_in_email");
          if (savedEmail) {
            const savedName = savedEmail.split("@")[0];
            setUserProfile(prev => ({
              ...prev,
              email: savedEmail,
              name: savedEmail === "priya.sharma@email.com" ? "Priya Sharma" : savedName.charAt(0).toUpperCase() + savedName.slice(1),
              isPremium: savedEmail !== "guest@aroha.com",
              avatar: savedEmail === "guest@aroha.com" ? "👤" : "👩",
              coins: coins
            }));
            setEditedProfile(prev => ({
              ...prev,
              email: savedEmail,
              name: savedEmail === "priya.sharma@email.com" ? "Priya Sharma" : savedName.charAt(0).toUpperCase() + savedName.slice(1),
              isPremium: savedEmail !== "guest@aroha.com",
              avatar: savedEmail === "guest@aroha.com" ? "👤" : "👩",
              coins: coins
            }));
          } else {
            setUserProfile(prev => ({ ...prev, coins }));
            setEditedProfile(prev => ({ ...prev, coins }));
          }
        }
      } catch (error) {
        console.error("Error fetching Supabase user details:", error);
      }
    };
    fetchUser();

    const handleUpdate = async () => {
      const coins = await getCoins();
      setUserProfile(prev => ({ ...prev, coins }));
      setEditedProfile(prev => ({ ...prev, coins }));
    };

    window.addEventListener("aroha_rewards_updated", handleUpdate);
    return () => {
      window.removeEventListener("aroha_rewards_updated", handleUpdate);
    };
  }, []);

  const stats = [
    { icon: TrendingUp, label: "Distance Travelled", value: "285 km", color: "from-purple-500 to-purple-700" },
    { icon: Star, label: "Reviews Posted", value: "24", color: "from-blue-500 to-blue-700" },
    { icon: Bookmark, label: "Saved Places", value: "37", color: "from-green-500 to-green-700" },
    { icon: Heart, label: "Favorite Category", value: userProfile.travelPreferences.favoriteCategory, color: "from-pink-500 to-pink-700" }
  ];

  const recentVisits = [
    { id: 1, name: "Mysore Palace", date: "2 days ago", image: "🏰" },
    { id: 2, name: "Chamundi Hills", date: "1 week ago", image: "⛰️" },
    { id: 3, name: "Brindavan Gardens", date: "2 weeks ago", image: "🌳" },
    { id: 4, name: "St. Philomena's", date: "3 weeks ago", image: "⛪" }
  ];

  const savedItineraries = [
    { id: 1, name: "Full Day Heritage Tour", places: 6, duration: "10 hours" },
    { id: 2, name: "Nature & Temples", places: 4, duration: "5 hours" },
    { id: 3, name: "Food Trail Experience", places: 8, duration: "6 hours" }
  ];

  const travelPhotos = ["🏰", "⛰️", "🌳", "⛪", "🦋", "🏛️", "🌺", "🎨"];

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedProfile(userProfile);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile(userProfile);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true;
    return /^\+?[\d\s-]{10,15}$/.test(phone);
  };

  const handleSaveChanges = async () => {
    // Validate fields
    if (!editedProfile.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (!validateEmail(editedProfile.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validatePhone(editedProfile.phone)) {
      toast.error("Please enter a valid phone number (10-15 digits)");
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Update Supabase Auth user credentials and metadata
        const { error: authError } = await supabase.auth.updateUser({
          phone: editedProfile.phone,
          data: {
            full_name: editedProfile.name,
            phone: editedProfile.phone,
            bio: editedProfile.bio
          }
        });

        if (authError) {
          toast.error(authError.message || "Failed to update auth details.");
          setIsSaving(false);
          return;
        }

        // 2. Update Supabase public.profiles table
        const { error: dbError } = await supabase
          .from("profiles")
          .update({
            full_name: editedProfile.name,
            phone: editedProfile.phone,
            bio: editedProfile.bio,
            avatar: editedProfile.avatar,
            level: editedProfile.level,
            is_premium: editedProfile.isPremium,
            coins: editedProfile.coins,
            trips_completed: editedProfile.tripsCompleted,
            hidden_gems_visited: editedProfile.hiddenGemsVisited,
            rewards_redeemed: editedProfile.rewardsRedeemed,
            favorite_category: editedProfile.travelPreferences.favoriteCategory,
            budget_preference: editedProfile.travelPreferences.budget,
            travel_style: editedProfile.travelPreferences.travelStyle
          })
          .eq("id", user.id);

        if (dbError) {
          console.warn("Db error updating profile, continuing locally:", dbError);
        }

        setUserProfile(editedProfile);
        setIsEditing(false);
        toast.success("Profile Updated Successfully ✓", {
          description: "Your changes have been saved in Supabase"
        });
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account and track your journey</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 text-white mb-8 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-6xl border-4 border-white/30">
                {isEditing ? editedProfile.avatar : userProfile.avatar}
              </div>
              {!isEditing && (
                <button
                  onClick={() => toast.success("Photo upload feature coming soon!")}
                  className="absolute bottom-0 right-0 bg-white text-primary p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-xl font-bold"
                    placeholder="Your name"
                  />
                  <Input
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    placeholder="email@example.com"
                    type="email"
                  />
                  <Input
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">{userProfile.name}</h2>
                    {userProfile.isPremium && (
                      <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
                        <Award className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-white/80 mb-1">{userProfile.email}</p>
                  <p className="text-white/80 mb-2">{userProfile.phone}</p>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    {userProfile.level}
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button
                  onClick={handleEditClick}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut();
                      localStorage.removeItem("aroha_logged_in_persist");
                      localStorage.removeItem("aroha_logged_in_email");
                      localStorage.removeItem("aroha_logged_in_name");
                      localStorage.removeItem("aroha_logged_in_phone");
                      toast.success("Logged out successfully. Redirecting to login...");
                      if (onLogout) onLogout();
                    } catch (error: any) {
                      toast.error(error.message || "Failed to log out");
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="bg-white text-primary hover:bg-white/90"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bio Section */}
        {isEditing ? (
          <div className="mb-6">
            <label className="text-sm text-white/80 mb-2 block">Bio</label>
            <textarea
              value={editedProfile.bio}
              onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
              className="w-full bg-white/20 border border-white/30 text-white placeholder:text-white/60 rounded-2xl p-4 min-h-[100px] resize-none"
              placeholder="Tell us about yourself..."
              maxLength={200}
            />
            <p className="text-xs text-white/60 mt-1">{editedProfile.bio.length}/200 characters</p>
          </div>
        ) : (
          <p className="text-white/90 mb-6">{userProfile.bio}</p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Coins className="w-5 h-5" />
              <span className="text-2xl font-bold">{userProfile.coins}</span>
            </div>
            <p className="text-sm text-white/80">Coins Earned</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MapPin className="w-5 h-5" />
              <span className="text-2xl font-bold">{userProfile.tripsCompleted}</span>
            </div>
            <p className="text-sm text-white/80">Trips Completed</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-5 h-5" />
              <span className="text-2xl font-bold">{userProfile.hiddenGemsVisited}</span>
            </div>
            <p className="text-sm text-white/80">Hidden Gems</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="w-5 h-5" />
              <span className="text-2xl font-bold">{userProfile.rewardsRedeemed}</span>
            </div>
            <p className="text-sm text-white/80">Rewards Redeemed</p>
          </div>
        </div>
      </div>

      {/* Account Credentials Card */}
      {!isEditing && (
        <div className="bg-card border border-border rounded-3xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Account Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-2xl">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Full Name</p>
                <p className="font-semibold">{userProfile.name || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-2xl">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email Address</p>
                <p className="font-semibold">{userProfile.email || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-2xl">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Phone Number</p>
                <p className="font-semibold">{userProfile.phone || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Travel Preferences */}
      {isEditing && (
        <div className="bg-card border border-border rounded-3xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Travel Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Favorite Category</label>
              <select
                value={editedProfile.travelPreferences.favoriteCategory}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  travelPreferences: {...editedProfile.travelPreferences, favoriteCategory: e.target.value}
                })}
                className="w-full bg-input-background border border-border rounded-2xl p-3"
              >
                <option>Heritage</option>
                <option>Nature</option>
                <option>Food</option>
                <option>Adventure</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Budget Preference</label>
              <select
                value={editedProfile.travelPreferences.budget}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  travelPreferences: {...editedProfile.travelPreferences, budget: e.target.value}
                })}
                className="w-full bg-input-background border border-border rounded-2xl p-3"
              >
                <option>Budget</option>
                <option>Mid-range</option>
                <option>Luxury</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Travel Style</label>
              <select
                value={editedProfile.travelPreferences.travelStyle}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  travelPreferences: {...editedProfile.travelPreferences, travelStyle: e.target.value}
                })}
                className="w-full bg-input-background border border-border rounded-2xl p-3"
              >
                <option>Cultural Explorer</option>
                <option>Adventure Seeker</option>
                <option>Relaxation</option>
                <option>Photography</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all"
            >
              <div className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Settings */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Notification Settings</p>
                  <p className="text-sm text-muted-foreground">Manage email and push notifications</p>
                </div>
              </div>
              <Button
                onClick={() => toast.success("Opening notification settings...")}
                variant="ghost"
                size="sm"
              >
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">English (US)</p>
                </div>
              </div>
              <Button
                onClick={() => toast.success("Opening language settings...")}
                variant="ghost"
                size="sm"
              >
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                </div>
              </div>
              <Switch
                onCheckedChange={(checked) => {
                  toast.success(checked ? "Dark mode enabled" : "Light mode enabled");
                }}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Privacy Settings</p>
                  <p className="text-sm text-muted-foreground">Control your data and visibility</p>
                </div>
              </div>
              <Button
                onClick={() => toast.success("Opening privacy settings...")}
                variant="ghost"
                size="sm"
              >
                Manage
              </Button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Account Settings</p>
                  <p className="text-sm text-muted-foreground">Update your account information</p>
                </div>
              </div>
              <Button
                onClick={() => toast.success("Opening account settings...")}
                variant="ghost"
                size="sm"
              >
                Edit
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    localStorage.removeItem("aroha_logged_in_persist");
                    localStorage.removeItem("aroha_logged_in_email");
                    localStorage.removeItem("aroha_logged_in_name");
                    localStorage.removeItem("aroha_logged_in_phone");
                    toast.success("Logged out successfully. Redirecting to login...");
                    if (onLogout) onLogout();
                  } catch (error: any) {
                    toast.error(error.message || "Failed to log out");
                  }
                }}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Recently Visited */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recently Visited</h2>
          <div className="bg-card border border-border rounded-3xl p-6">
            <div className="space-y-4">
              {recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => toast.success(`Viewing ${visit.name}`)}
                >
                  <div className="text-4xl">{visit.image}</div>
                  <div className="flex-1">
                    <p className="font-medium">{visit.name}</p>
                    <p className="text-sm text-muted-foreground">{visit.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Travel Memories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Travel Memories</h2>
        <div className="bg-card border border-border rounded-3xl p-6">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {travelPhotos.map((photo, i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-5xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => toast.success("Opening photo")}
              >
                {photo}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Itineraries */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Saved Itineraries</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savedItineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => toast.success(`Opening ${itinerary.name}`)}
            >
              <h3 className="font-bold text-lg mb-3">{itinerary.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{itinerary.places} places</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{itinerary.duration}</span>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                View Plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

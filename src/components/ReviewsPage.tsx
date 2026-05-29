import { Star, Heart, MessageCircle, Camera, Plus, MapPin, ThumbsUp, Edit2, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { WriteReviewModal } from "./WriteReviewModal";
import { supabase } from "../supabaseClient";

interface Review {
  id: number;
  user: {
    name: string;
    avatar: string;
    location: string;
  };
  place: string;
  category: string;
  rating: number;
  date: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  isTopExplorer: boolean;
}

export function ReviewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [sortBy, setSortBy] = useState("Latest");

  const initialReviews: Review[] = [
    {
      id: 1,
      user: {
        name: "Priya Sharma",
        avatar: "👩",
        location: "Bangalore"
      },
      place: "Mysore Palace",
      category: "Heritage",
      rating: 5,
      date: "2 days ago",
      content: "Absolutely stunning! The architecture is breathtaking, especially during the evening light show. A must-visit for anyone coming to Mysore. The intricate carvings and historical significance make it truly special.",
      images: ["🏰", "✨", "🌟"],
      likes: 124,
      comments: 18,
      isTopExplorer: true
    },
    {
      id: 2,
      user: {
        name: "Raj Kumar",
        avatar: "👨",
        location: "Chennai"
      },
      place: "Chamundi Hills",
      category: "Nature",
      rating: 5,
      date: "4 days ago",
      content: "Perfect spot for sunrise! The view from the top is incredible. The climb of 1000 steps is worth it. Don't miss the giant Nandi statue on the way up!",
      images: ["⛰️", "🌅"],
      likes: 89,
      comments: 12,
      isTopExplorer: false
    },
    {
      id: 3,
      user: {
        name: "Ananya Iyer",
        avatar: "👧",
        location: "Mumbai"
      },
      place: "Guru Sweet Mart",
      category: "Food",
      rating: 4,
      date: "1 week ago",
      content: "The Mysore Pak here is legendary! Fresh, authentic, and melts in your mouth. Also tried their special masala dosa - absolutely delicious. Great service too!",
      images: ["🍰", "🍽️"],
      likes: 156,
      comments: 24,
      isTopExplorer: true
    },
    {
      id: 4,
      user: {
        name: "Vikram Singh",
        avatar: "👨‍🦱",
        location: "Delhi"
      },
      place: "Brindavan Gardens",
      category: "Nature",
      rating: 5,
      date: "1 week ago",
      content: "The musical fountain show is magical! Visit during evening for the best experience. Beautiful gardens, well maintained. Perfect for families and couples.",
      images: ["🌳", "⛲", "🎆"],
      likes: 203,
      comments: 31,
      isTopExplorer: true
    },
    {
      id: 5,
      user: {
        name: "Meera Reddy",
        avatar: "👩‍🦰",
        location: "Hyderabad"
      },
      place: "The Windflower Resorts",
      category: "Hotels",
      rating: 5,
      date: "2 weeks ago",
      content: "Luxury at its best! Beautiful property, excellent service, amazing spa. The staff went above and beyond to make our stay memorable. Highly recommended!",
      images: ["🏨", "🌸"],
      likes: 78,
      comments: 9,
      isTopExplorer: false
    },
    {
      id: 6,
      user: {
        name: "Arjun Patel",
        avatar: "👦",
        location: "Pune"
      },
      place: "Karanji Lake",
      category: "Nature",
      rating: 4,
      date: "2 weeks ago",
      content: "Peaceful and serene! Great for bird watching. The butterfly park is a nice addition. Perfect morning walk spot with family.",
      images: ["🦋", "🌿"],
      likes: 45,
      comments: 6,
      isTopExplorer: false
    }
  ];

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [likedReviews, setLikedReviews] = useState<number[]>([]);

  const categories = ["All", "Heritage", "Nature", "Food", "Hotels"];
  const sortOptions = ["Latest", "Highest Rated", "Trending"];

  // Fetch reviews from Supabase on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Could not load reviews from Supabase, using mock fallback:", error.message);
          return;
        }

        if (data && data.length > 0) {
          const mappedReviews: Review[] = data.map((r: any) => ({
            id: Number(r.id),
            user: {
              name: r.user_name || "Explorer",
              avatar: r.user_avatar || "👤",
              location: r.user_location || "India"
            },
            place: r.place,
            category: r.category,
            rating: Number(r.rating),
            date: new Date(r.created_at).toLocaleDateString() || "Today",
            content: r.content,
            images: [],
            likes: Number(r.likes || 0),
            comments: Number(r.comments || 0),
            isTopExplorer: Boolean(r.is_top_explorer)
          }));
          setReviews(mappedReviews);
        }
      } catch (err: any) {
        console.warn("Supabase fetch failed, falling back to mock:", err.message);
      }
    };

    fetchReviews();
  }, []);

  const handleAddReview = async (newReview: any) => {
    if (editingReview) {
      setReviews(reviews.map(r => r.id === newReview.id ? newReview : r));
      
      try {
        await supabase
          .from("reviews")
          .update({
            place: newReview.place,
            category: newReview.category,
            rating: newReview.rating,
            content: newReview.content
          })
          .eq("id", newReview.id);
      } catch (err) {
        console.error("Failed to update review in Supabase:", err);
      }
    } else {
      setReviews([newReview, ...reviews]);

      try {
        await supabase
          .from("reviews")
          .insert({
            user_name: newReview.user.name,
            user_avatar: newReview.user.avatar,
            user_location: newReview.user.location,
            place: newReview.place,
            category: newReview.category,
            rating: newReview.rating,
            content: newReview.content,
            likes: newReview.likes,
            comments: newReview.comments,
            is_top_explorer: newReview.isTopExplorer
          });
      } catch (err) {
        console.error("Failed to insert review in Supabase:", err);
      }
    }
    setEditingReview(null);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setIsWriteModalOpen(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    setReviews(reviews.filter(r => r.id !== reviewId));
    toast.success("Review deleted successfully");

    try {
      await supabase.from("reviews").delete().eq("id", reviewId);
    } catch (err) {
      console.error("Failed to delete review in Supabase:", err);
    }
  };

  const handleLikeReview = async (reviewId: number) => {
    let change = 1;
    if (likedReviews.includes(reviewId)) {
      setLikedReviews(likedReviews.filter(id => id !== reviewId));
      setReviews(reviews.map(r => r.id === reviewId ? {...r, likes: r.likes - 1} : r));
      change = -1;
      toast.success("Like removed");
    } else {
      setLikedReviews([...likedReviews, reviewId]);
      setReviews(reviews.map(r => r.id === reviewId ? {...r, likes: r.likes + 1} : r));
      toast.success("Liked!");
    }

    try {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        await supabase
          .from("reviews")
          .update({ likes: Math.max(0, review.likes + change) })
          .eq("id", reviewId);
      }
    } catch (err) {
      console.error("Failed to update likes in Supabase:", err);
    }
  };

  let filteredReviews = reviews.filter(review =>
    selectedCategory === "All" || review.category === selectedCategory
  );

  // Sort reviews
  if (sortBy === "Highest Rated") {
    filteredReviews = [...filteredReviews].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "Trending") {
    filteredReviews = [...filteredReviews].sort((a, b) => b.likes - a.likes);
  }

  const topExplorers = reviews.filter(r => r.isTopExplorer).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Travel Reviews</h1>
          <p className="text-muted-foreground">Share and discover authentic experiences</p>
        </div>
        <Button
          onClick={() => {
            setEditingReview(null);
            setIsWriteModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Write Review
        </Button>
      </div>

      {/* Category Filters and Sort */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-3 flex-wrap">
        {categories.map((category) => (
          <Badge
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer px-5 py-2.5 text-sm transition-all hover:scale-105 ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground shadow-md"
                : "hover:bg-accent"
            }`}
          >
            {category}
          </Badge>
        ))}
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-input-background border border-border rounded-2xl px-4 py-2 text-sm cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Explorers Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-primary" />
          Top Explorer Reviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topExplorers.map((review) => (
            <div key={review.id} className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{review.user.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{review.user.name}</p>
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      <Star className="w-3 h-3" />
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.user.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="font-medium text-sm">{review.place}</p>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{review.content}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{review.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{review.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Reviews */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Reviews ({filteredReviews.length})</h2>
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-card border border-border rounded-3xl p-6 hover:shadow-xl transition-all"
            >
              {/* User Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{review.user.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{review.user.name}</h3>
                      {review.isTopExplorer && (
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Top Explorer
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{review.user.location}</span>
                    </div>
                    <Badge variant="outline">{review.category}</Badge>
                  </div>
                </div>
              </div>

              {/* Place and Rating */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-lg">{review.place}</h4>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <p className="text-muted-foreground mb-4">{review.content}</p>

              {/* Images */}
              {review.images.length > 0 && (
                <div className="flex gap-3 mb-4">
                  {review.images.map((img, i) => (
                    <div
                      key={i}
                      className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-4xl hover:scale-105 transition-transform cursor-pointer"
                    >
                      {img}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLikeReview(review.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      likedReviews.includes(review.id)
                        ? "text-red-500"
                        : "text-muted-foreground hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${likedReviews.includes(review.id) ? "fill-red-500" : ""}`} />
                    <span className="font-medium">{review.likes}</span>
                  </button>
                  <button
                    onClick={() => toast.success("Opening comments...")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">{review.comments}</span>
                  </button>
                  <button
                    onClick={() => toast.success("Marked as helpful!")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="font-medium">Helpful</span>
                  </button>
                </div>
                {review.user.name === "Priya Sharma" && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleEditReview(review)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteReview(review.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Write Review Button (Mobile) */}
      <Button
        onClick={() => {
          setEditingReview(null);
          setIsWriteModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl hover:shadow-3xl transition-all md:hidden"
      >
        <Camera className="w-6 h-6" />
      </Button>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingReview(null);
        }}
        onSubmit={handleAddReview}
        editingReview={editingReview}
      />
    </div>
  );
}

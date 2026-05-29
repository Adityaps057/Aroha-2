import { X, Star, Upload, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: any) => void;
  editingReview?: any;
}

export function WriteReviewModal({ isOpen, onClose, onSubmit, editingReview }: WriteReviewModalProps) {
  const [rating, setRating] = useState(editingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(editingReview?.place || "");
  const [content, setContent] = useState(editingReview?.content || "");
  const [category, setCategory] = useState(editingReview?.category || "Heritage");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(editingReview?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Priya Sharma",
    avatar: "👩",
    location: "Bangalore"
  });

  // Load active user's details for review submission metadata
  useEffect(() => {
    if (!isOpen) return;
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser({
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Explorer",
            avatar: user.user_metadata?.avatar || "👤",
            location: user.user_metadata?.phone || "Mysuru"
          });
        }
      } catch (error) {
        console.error("Error loading user profile for review:", error);
      }
    };
    fetchUser();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please write your review");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newReview = {
      id: editingReview?.id || Date.now(),
      user: currentUser,
      place: title,
      category,
      rating,
      date: editingReview ? editingReview.date : "Just now",
      content,
      images: uploadedPhotos,
      likes: editingReview?.likes || 0,
      comments: editingReview?.comments || 0,
      isTopExplorer: true
    };

    onSubmit(newReview);
    setIsSubmitting(false);
    toast.success(editingReview ? "Review Updated Successfully ✓" : "Review Posted Successfully ✓");
    onClose();

    // Reset form
    setRating(0);
    setTitle("");
    setContent("");
    setCategory("Heritage");
    setUploadedPhotos([]);
  };

  const handleAddPhoto = () => {
    const emojis = ["🏰", "⛰️", "🌳", "⛪", "🦋", "🏛️", "🌺", "🎨", "🍛", "☕"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setUploadedPhotos([...uploadedPhotos, randomEmoji]);
    toast.success("Photo added!");
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold">{editingReview ? "Edit Review" : "Write a Review"}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-accent transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="text-sm font-medium mb-3 block">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Place Name *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mysore Palace, Chamundi Hills..."
              className="text-lg"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-3 block">Category *</label>
            <div className="flex gap-3 flex-wrap">
              {["Heritage", "Food", "Nature", "Hotel"].map((cat) => (
                <Badge
                  key={cat}
                  onClick={() => setCategory(cat)}
                  variant={category === cat ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Review Content */}
          <div>
            <label className="text-sm font-medium mb-2 block">Your Review *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience..."
              className="w-full bg-input-background border border-border rounded-2xl p-4 min-h-[150px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{content.length}/500 characters</p>
          </div>

          {/* Photos */}
          <div>
            <label className="text-sm font-medium mb-3 block">Photos (Optional)</label>
            <div className="grid grid-cols-4 gap-3">
              {uploadedPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-5xl">
                    {photo}
                  </div>
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {uploadedPhotos.length < 4 && (
                <button
                  onClick={handleAddPhoto}
                  className="aspect-square border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center hover:bg-accent transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-3 rounded-b-3xl">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {editingReview ? "Updating..." : "Posting..."}
              </>
            ) : (
              <>{editingReview ? "Update Review" : "Post Review"}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

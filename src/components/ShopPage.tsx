import { ShoppingCart, Heart, Star, Filter, Search, IndianRupee, Package, Truck, Shield, ArrowRight, Utensils, ShoppingBag, X, Trash2, Plus, Minus, Check, ChevronLeft, Clock, Loader2, MapPin, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { supabase } from "../supabaseClient";
import { addCoins } from "../utils/rewards";
import { format, addDays } from "date-fns";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  inStock: boolean;
  badge?: string;
}

type OrderViewState = 'cart' | 'payment' | 'food-tracking' | 'product-tracking';

export function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [foodCart, setFoodCart] = useState<{ [key: number]: number }>({});
  const [productCart, setProductCart] = useState<{ [key: number]: number }>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"swaadh" | "products">("swaadh");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Payment flow state
  const [orderView, setOrderView] = useState<OrderViewState>('cart');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [upiTimer, setUpiTimer] = useState(300);
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [orderId] = useState(`ARH${Math.floor(Math.random()*90000+10000)}`);
  const [liveStatus, setLiveStatus] = useState('Restaurant is preparing your order');
  const [currentCartTab, setCurrentCartTab] = useState<"swaadh" | "products">("swaadh");
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [newBalance, setNewBalance] = useState(0);

  // UPI Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (orderView === 'payment' && selectedPaymentMethod === 'upi' && upiTimer > 0) {
      timer = setInterval(() => {
        setUpiTimer(t => {
          if (t <= 1) {
            completePayment();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [orderView, selectedPaymentMethod, upiTimer]);

  // Food delivery status updater
  useEffect(() => {
    if (orderView === 'food-tracking') {
      const statuses = [
        'Restaurant is preparing your order',
        'Partner picked up your order',
        'On the way!',
        'Partner is on the way',
        'Arriving soon'
      ];
      const interval = setInterval(() => {
        setLiveStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [orderView]);

  const BANKS = {
    Popular: ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "Canara", "BOB", "Yes Bank", "IndusInd"],
    Others: ["Union Bank", "Central Bank", "IOB", "Syndicate", "Dena", "Vijaya", "IDFC", "Federal", "South Indian", "Karur Vysya", "DCB", "RBL", "CSB", "Dhanlaxmi", "Lakshmi Vilas", "Jammu & Kashmir", "UCO", "IDBI"],
    Foreign: ["Citibank", "HSBC", "Standard Chartered", "Deutsche", "Barclays", "DBS", "RBS", "BNP Paribas"]
  };

  const getFilteredBanks = () => {
    if (!bankSearchQuery) return BANKS;
    const query = bankSearchQuery.toLowerCase();
    const filtered: typeof BANKS = { Popular: [], Others: [], Foreign: [] };
    Object.entries(BANKS).forEach(([category, banks]) => {
      filtered[category as keyof typeof BANKS] = banks.filter(b => b.toLowerCase().includes(query));
    });
    return filtered;
  };

  const completePayment = async () => {
    setPaymentLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const cartItemsToProcess = currentCartTab === "swaadh" ? foodCart : productCart;
      const itemsArray = Object.keys(cartItemsToProcess).map(id => {
        const product = products.find(p => p.id === parseInt(id));
        return product ? { ...product, quantity: cartItemsToProcess[parseInt(id)] } : null;
      }).filter(Boolean);

      const total = itemsArray.reduce((sum, item) =>
        sum + (item ? item.price * item.quantity : 0), 0
      );

      const orderPromises = itemsArray.map(item => {
        if (!item) return Promise.resolve();
        return supabase
          .from("orders")
          .insert({
            user_id: userId,
            item_name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            total_price: Number(item.price * item.quantity),
            status: "Processing"
          });
      });

      await Promise.all(orderPromises);

      const coinsToAdd = 50 + Math.round(total * 0.05);
      const newCoinsBalance = await addCoins(coinsToAdd, `Ordered items worth ₹${total.toLocaleString()} from Marketplace`);
      setCoinsEarned(coinsToAdd);
      setNewBalance(newCoinsBalance);

      if (currentCartTab === "swaadh") {
        setOrderView('food-tracking');
      } else {
        setOrderView('product-tracking');
      }

      if (currentCartTab === "swaadh") {
        setFoodCart({});
      } else {
        setProductCart({});
      }
    } catch (err: any) {
      console.warn("Payment processing error:", err.message);
      const cartItemsToProcess = currentCartTab === "swaadh" ? foodCart : productCart;
      const total = Object.keys(cartItemsToProcess).reduce((sum, id) => {
        const product = products.find(p => p.id === parseInt(id));
        return sum + (product ? product.price * cartItemsToProcess[parseInt(id)] : 0);
      }, 0);

      const coinsToAdd = 50 + Math.round(total * 0.05);
      const newCoinsBalance = await addCoins(coinsToAdd, `Ordered items worth ₹${total.toLocaleString()} from Marketplace`);
      setCoinsEarned(coinsToAdd);
      setNewBalance(newCoinsBalance);

      if (currentCartTab === "swaadh") {
        setOrderView('food-tracking');
      } else {
        setOrderView('product-tracking');
      }

      if (currentCartTab === "swaadh") {
        setFoodCart({});
      } else {
        setProductCart({});
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  const products: Product[] = [
    {
      id: 1,
      name: "Mysore Masala Dosa",
      description: "Crispy dosa with spiced potato filling, served with chutney and sambar",
      price: 120,
      category: "Food",
      rating: 4.8,
      reviews: 892,
      image: "https://images.unsplash.com/photo-1694849789325-914b71ab4075?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true,
      badge: "Popular"
    },
    {
      id: 2,
      name: "Traditional Thali Meal",
      description: "Complete South Indian thali with rice, sambar, rasam, curries, and curd",
      price: 250,
      category: "Food",
      rating: 4.7,
      reviews: 567,
      image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true,
      badge: "Chef's Special"
    },
    {
      id: 3,
      name: "Filter Coffee",
      description: "Traditional South Indian filter coffee, freshly brewed and aromatic",
      price: 60,
      category: "Food",
      rating: 4.9,
      reviews: 1234,
      image: "https://images.unsplash.com/photo-1559496417-e7f25c8b9c0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true,
      badge: "Bestseller"
    },
    {
      id: 4,
      name: "Bisi Bele Bath",
      description: "Traditional Karnataka one-pot rice dish with lentils, vegetables and spices",
      price: 150,
      category: "Food",
      rating: 4.6,
      reviews: 445,
      image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true
    },
    {
      id: 5,
      name: "Mysore Bajji Combo",
      description: "Crispy fritters - banana, chili, and potato bajjis with coconut chutney",
      price: 90,
      category: "Food",
      rating: 4.5,
      reviews: 678,
      image: "https://images.unsplash.com/photo-1613764816537-a43baeb559c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true
    },
    {
      id: 6,
      name: "Idli Vada Combo",
      description: "Soft idlis and crispy vadas served with sambar and three chutneys",
      price: 110,
      category: "Food",
      rating: 4.7,
      reviews: 823,
      image: "https://images.unsplash.com/photo-1630383249896-424e482df921?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true,
      badge: "Fresh"
    },
    {
      id: 7,
      name: "Rava Kesari",
      description: "Sweet semolina pudding flavored with saffron and garnished with nuts",
      price: 80,
      category: "Food",
      rating: 4.6,
      reviews: 356,
      image: "https://images.unsplash.com/photo-1695568181310-41f4133d1279?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true
    },
    {
      id: 8,
      name: "Mysore Silk Saree - Royal Purple",
      description: "Authentic Mysore silk saree with traditional zari work",
      price: 12500,
      originalPrice: 15000,
      category: "Textiles",
      rating: 4.9,
      reviews: 245,
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true,
      badge: "Best Seller"
    },
    {
      id: 9,
      name: "Sandalwood Carved Elephant",
      description: "Handcrafted sandalwood sculpture, 6 inches",
      price: 3500,
      category: "Handicrafts",
      rating: 4.8,
      reviews: 189,
      image: "https://images.unsplash.com/photo-1550583074-288b9c016df5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true,
      badge: "Handmade"
    },
    {
      id: 10,
      name: "Mysore Pak Premium Box",
      description: "Original Mysore Pak from Guru Sweet Mart, 500g",
      price: 450,
      category: "Sweets",
      rating: 4.7,
      reviews: 567,
      image: "https://images.unsplash.com/photo-1695568180070-8b5acead5cf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true,
      badge: "Fresh"
    },
    {
      id: 11,
      name: "Sandalwood Incense Sticks",
      description: "Pure sandalwood agarbatti, pack of 100",
      price: 250,
      category: "Fragrances",
      rating: 4.6,
      reviews: 423,
      image: "https://images.unsplash.com/photo-1630833835852-aa4902568d93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true
    },
    {
      id: 12,
      name: "Mysore Silk Saree - Emerald Green",
      description: "Traditional Mysore silk with golden border",
      price: 13800,
      originalPrice: 16500,
      category: "Textiles",
      rating: 4.9,
      reviews: 312,
      image: "https://images.unsplash.com/photo-1619516388835-2b60acc4049e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true,
      badge: "Premium"
    },
    {
      id: 13,
      name: "Wooden Deity Sculpture",
      description: "Intricately carved traditional deity figure",
      price: 4200,
      category: "Handicrafts",
      rating: 4.8,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1765441864055-3f052ddf59dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true,
      badge: "Handmade"
    },
    {
      id: 14,
      name: "Mixed Sweets Assortment",
      description: "Variety pack of 8 traditional Mysore sweets",
      price: 650,
      category: "Sweets",
      rating: 4.7,
      reviews: 834,
      image: "https://images.unsplash.com/photo-1695568181363-af5c78f4d059?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true
    },
    {
      id: 15,
      name: "Sandalwood Oil - 10ml",
      description: "100% pure Mysore sandalwood essential oil",
      price: 1800,
      category: "Fragrances",
      rating: 4.9,
      reviews: 298,
      image: "https://images.unsplash.com/photo-1630833835852-aa4902568d93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true,
      badge: "Pure"
    },
    {
      id: 16,
      name: "Silk Shawl with Embroidery",
      description: "Lightweight Mysore silk shawl, perfect for gifting",
      price: 2800,
      category: "Textiles",
      rating: 4.6,
      reviews: 167,
      image: "https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true
    },
    {
      id: 17,
      name: "Wooden Jewelry Box",
      description: "Handcrafted sandalwood jewelry box with brass inlay",
      price: 2500,
      category: "Handicrafts",
      rating: 4.7,
      reviews: 134,
      image: "https://images.unsplash.com/photo-1765443254299-eb5f69ab85a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true
    },
    {
      id: 18,
      name: "Besan Ladoo Box",
      description: "Traditional besan ladoos, 500g",
      price: 380,
      category: "Sweets",
      rating: 4.6,
      reviews: 445,
      image: "https://images.unsplash.com/photo-1695568181440-aca4dac18650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true
    },
    {
      id: 19,
      name: "Sandalwood Soap Set",
      description: "Handmade sandalwood soaps, pack of 4",
      price: 450,
      category: "Fragrances",
      rating: 4.5,
      reviews: 289,
      image: "https://images.unsplash.com/photo-1630833835852-aa4902568d93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      inStock: true
    }
  ];

  const foodCategories = ["All", "Breakfast", "Main Course", "Snacks", "Beverages"];
  const productCategories = ["All", "Textiles", "Handicrafts", "Sweets", "Fragrances"];

  const categories = activeTab === "swaadh" ? foodCategories : productCategories;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "swaadh" ? product.category === "Food" : product.category !== "Food";
    // For Swaadh tab, show all food items without category filtering
    const matchesCategory = activeTab === "swaadh" ? true : (selectedCategory === "All" || product.category === selectedCategory);
    return matchesSearch && matchesTab && matchesCategory;
  });

  const currentCart = activeTab === "swaadh" ? foodCart : productCart;
  const setCurrentCart = activeTab === "swaadh" ? setFoodCart : setProductCart;

  const handleAddToCart = (productId: number) => {
    setCurrentCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    toast.success(`Added to ${activeTab === "swaadh" ? "food" : "product"} cart!`);
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      const newCart = { ...currentCart };
      delete newCart[productId];
      setCurrentCart(newCart);
      toast.success("Removed from cart");
    } else {
      setCurrentCart(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const removeFromCart = (productId: number) => {
    const newCart = { ...currentCart };
    delete newCart[productId];
    setCurrentCart(newCart);
    toast.success("Removed from cart");
  };

  const toggleWishlist = (productId: number) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      toast.success("Removed from wishlist");
    } else {
      setWishlist([...wishlist, productId]);
      toast.success("Added to wishlist!");
    }
  };

  const cartItems = Object.keys(currentCart).map(id => {
    const product = products.find(p => p.id === parseInt(id));
    return product ? { ...product, quantity: currentCart[parseInt(id)] } : null;
  }).filter(Boolean);

  const cartTotal = cartItems.reduce((sum, item) =>
    sum + (item ? item.price * item.quantity : 0), 0
  );

  const coinsToEarn = cartTotal > 0 ? 50 + Math.round(cartTotal * 0.05) : 0;

  const cartItemCount = Object.values(currentCart).reduce((sum, qty) => sum + qty, 0);
  const foodCartCount = Object.values(foodCart).reduce((sum, qty) => sum + qty, 0);
  const productCartCount = Object.values(productCart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">Mysuru Marketplace</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Authentic food, handicrafts, silk, and traditional products from the heritage city</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={() => {
            setActiveTab("swaadh");
            setSelectedCategory("All");
            toast.success("Welcome to Swaadh - Order delicious food!");
          }}
          className={`flex-1 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-300 relative ${
            activeTab === "swaadh"
              ? "bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-2xl sm:scale-105"
              : "bg-card border border-border hover:shadow-lg"
          }`}
        >
          {foodCartCount > 0 && (
            <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-orange-900 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center p-0 text-xs">
              {foodCartCount}
            </Badge>
          )}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Swaadh</h2>
            {activeTab === "swaadh" && (
              <Badge className="bg-yellow-400 text-orange-900 text-xs hidden sm:inline-flex">
                FOOD DELIVERY
              </Badge>
            )}
          </div>
          <p className={`text-xs sm:text-sm ${activeTab === "swaadh" ? "text-orange-100" : "text-muted-foreground"}`}>
            Traditional Mysuru cuisine delivered fresh
          </p>
        </button>

        <button
          onClick={() => {
            setActiveTab("products");
            setSelectedCategory("All");
            toast.success("Browse artisan products!");
          }}
          className={`flex-1 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-300 relative ${
            activeTab === "products"
              ? "bg-gradient-to-br from-primary to-purple-700 text-white shadow-2xl sm:scale-105"
              : "bg-card border border-border hover:shadow-lg"
          }`}
        >
          {productCartCount > 0 && (
            <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-primary text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center p-0 text-xs">
              {productCartCount}
            </Badge>
          )}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Artisan Products</h2>
          </div>
          <p className={`text-xs sm:text-sm ${activeTab === "products" ? "text-purple-100" : "text-muted-foreground"}`}>
            Handicrafts, silk, sweets & fragrances
          </p>
        </button>
      </div>

      {/* Search and Cart */}
      <div className="mb-5 sm:mb-6 flex gap-2 sm:gap-4 items-center">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={activeTab === "swaadh" ? "Search for dishes..." : "Search for products..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-10 text-sm sm:text-base h-10 sm:h-11"
          />
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
        </div>
        <Button
          onClick={() => setIsCartOpen(true)}
          variant="outline"
          className="relative px-3 sm:px-4 h-10 sm:h-11"
        >
          <ShoppingCart className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Cart</span>
          {cartItemCount > 0 && (
            <Badge className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center p-0 text-xs">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Category Filters - Only show for Products tab */}
      {activeTab === "products" && (
        <div className="mb-8 flex gap-3 flex-wrap">
          {categories.map((category) => (
            <Badge
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-accent"
              }`}
            >
              {category}
            </Badge>
          ))}
        </div>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {activeTab === "swaadh" ? (
          <>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <Utensils className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-orange-900">Fresh & Hot</p>
                <p className="text-xs text-orange-700">Prepared on order</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-orange-900">30 Min Delivery</p>
                <p className="text-xs text-orange-700">Fast & reliable</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-orange-900">Hygienic</p>
                <p className="text-xs text-orange-700">FSSAI certified</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Authentic Products</p>
                <p className="text-xs text-muted-foreground">100% Genuine</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Free Shipping</p>
                <p className="text-xs text-muted-foreground">Orders above ₹2,000</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Secure Payment</p>
                <p className="text-xs text-muted-foreground">Safe & Protected</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} {activeTab === "swaadh" ? "dishes" : "products"}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Product Image */}
            <div className="relative h-56 overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={product.image || ""}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <Badge className={`absolute top-3 left-3 ${
                  activeTab === "swaadh"
                    ? "bg-orange-600 text-white"
                    : "bg-primary text-primary-foreground"
                }`}>
                  {product.badge}
                </Badge>
              )}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  wishlist.includes(product.id)
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-600 hover:bg-red-50"
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-white" : ""}`} />
              </button>
            </div>

            {/* Product Content */}
            <div className="p-5">
              <Badge variant="outline" className="mb-2 text-xs">
                {product.category}
              </Badge>
              <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-sm">{product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              <div className="mb-3 px-3 py-2 bg-yellow-100 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-200 flex items-center gap-1">
                  <span>🪙</span>
                  Earn +{Math.round(product.price * 0.05)} coins
                </p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-5 h-5" />
                  <span className="text-2xl font-bold">{product.price.toLocaleString()}</span>
                </div>
                {product.originalPrice && (
                  <div className="flex items-center gap-1 text-muted-foreground line-through">
                    <IndianRupee className="w-3 h-3" />
                    <span className="text-sm">{product.originalPrice.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleAddToCart(product.id)}
                className={`w-full ${
                  activeTab === "swaadh"
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {activeTab === "swaadh" ? "Add to Cart" : "Add to Cart"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          {activeTab === "swaadh" ? (
            <Utensils className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          ) : (
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          )}
          <h3 className="font-bold text-xl mb-2">
            No {activeTab === "swaadh" ? "dishes" : "products"} found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Cart Header */}
            <div className={`p-6 border-b border-border flex items-center justify-between ${
              activeTab === "swaadh" ? "bg-gradient-to-r from-orange-50 to-orange-100" : ""
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  activeTab === "swaadh" ? "bg-orange-500/20" : "bg-primary/10"
                }`}>
                  {activeTab === "swaadh" ? (
                    <Utensils className="w-6 h-6 text-orange-600" />
                  ) : (
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${activeTab === "swaadh" ? "text-orange-900" : ""}`}>
                    {activeTab === "swaadh" ? "Swaadh Cart" : "Product Cart"}
                  </h2>
                  <p className={`text-sm ${activeTab === "swaadh" ? "text-orange-700" : "text-muted-foreground"}`}>
                    {cartItemCount} {activeTab === "swaadh" ? "dishes" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  {activeTab === "swaadh" ? (
                    <Utensils className="w-16 h-16 mx-auto text-orange-300 mb-4" />
                  ) : (
                    <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  )}
                  <h3 className="font-bold text-xl mb-2">
                    Your {activeTab === "swaadh" ? "food cart" : "cart"} is empty
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "swaadh"
                      ? "Add some delicious dishes to get started!"
                      : "Add some items to get started!"}
                  </p>
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    className={activeTab === "swaadh"
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }
                  >
                    {activeTab === "swaadh" ? "Browse Menu" : "Continue Shopping"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => item && (
                    <div
                      key={item.id}
                      className="bg-accent/50 border border-border rounded-2xl p-4 flex gap-4"
                    >
                      {/* Item Image */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <ImageWithFallback
                          src={item.image || ""}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base line-clamp-1">{item.name}</h3>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-2 w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-background rounded-full p-1 border border-border">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            <span className="text-xl font-bold">{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Selection View */}
            {orderView === 'payment' && (
              <div className="p-6 border-t border-border">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setOrderView('cart')}
                    className="w-10 h-10 rounded-full hover:bg-accent transition-colors flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-bold">Select Payment Method</h3>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { id: 'upi', icon: '📱', title: 'UPI', sub: 'PhonePe, GPay, Paytm' },
                    { id: 'card', icon: '💳', title: 'Credit / Debit Card', sub: 'Visa, Mastercard, Rupay' },
                    { id: 'netbanking', icon: '🏦', title: 'Net Banking', sub: 'All Indian & Foreign banks' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className="w-full p-4 border-2 border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-4"
                    >
                      <span className="text-3xl">{method.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold">{method.title}</p>
                        <p className="text-sm text-muted-foreground">{method.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedPaymentMethod && (
                  <Button
                    onClick={() => setOrderView(selectedPaymentMethod as OrderViewState)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Continue to {selectedPaymentMethod === 'upi' ? 'UPI' : selectedPaymentMethod === 'card' ? 'Card' : 'Net Banking'}
                  </Button>
                )}
              </div>
            )}

            {/* UPI Payment View */}
            {orderView === 'payment' && selectedPaymentMethod === 'upi' && (
              <div className="p-6 border-t border-border flex flex-col items-center gap-6">
                <div className="bg-white p-4 rounded-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=aroha@paytm&am=${cartTotal}`}
                    alt="UPI QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-center w-full">
                  <p className="text-sm text-muted-foreground mb-2">UPI ID</p>
                  <p className="font-bold text-lg mb-4">aroha@paytm</p>
                  <p className="text-lg font-bold">Amount: ₹{cartTotal.toLocaleString()}</p>
                </div>
                <div className="text-center bg-accent/50 p-4 rounded-2xl w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg">
                      {String(Math.floor(upiTimer / 60)).padStart(2, '0')}:{String(upiTimer % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Time remaining</p>
                </div>
                <Button
                  onClick={completePayment}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'I have paid'
                  )}
                </Button>
              </div>
            )}

            {/* Card & Netbanking View */}
            {orderView === 'payment' && (selectedPaymentMethod === 'card' || selectedPaymentMethod === 'netbanking') && (
              <div className="p-6 border-t border-border">
                {selectedPaymentMethod === 'card' && (
                  <div className="space-y-4 mb-6">
                    <h3 className="font-bold">Card Details</h3>
                    <Button
                      onClick={completePayment}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ₹${cartTotal.toLocaleString()}`
                      )}
                    </Button>
                  </div>
                )}
                {selectedPaymentMethod === 'netbanking' && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Search banks..."
                      value={bankSearchQuery}
                      onChange={(e) => setBankSearchQuery(e.target.value)}
                      className="mb-4"
                    />
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {Object.entries(getFilteredBanks()).map(([category, banks]) => (
                        <div key={category}>
                          <h4 className="text-sm font-bold text-muted-foreground mb-2">{category}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {banks.map((bank) => (
                              <button
                                key={bank}
                                onClick={() => {
                                  setSelectedBank(bank);
                                  setPaymentLoading(true);
                                  setTimeout(() => completePayment(), 1500);
                                }}
                                className="p-2 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium"
                              >
                                {bank}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Footer */}
            {orderView === 'cart' && cartItems.length > 0 && (
              <div className={`p-6 border-t border-border ${
                activeTab === "swaadh" ? "bg-orange-50" : "bg-accent/30"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    <span className="text-3xl font-bold">{cartTotal.toLocaleString()}</span>
                  </div>
                </div>
                {activeTab === "swaadh" && (
                  <p className="text-xs text-orange-600 mb-3 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Expected delivery in 30 minutes
                  </p>
                )}
                {(activeTab === "swaadh" && productCartCount > 0) && (
                  <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs text-purple-700">
                      You also have {productCartCount} items in Product Cart
                    </p>
                  </div>
                )}
                {(activeTab === "products" && foodCartCount > 0) && (
                  <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-orange-700">
                      You also have {foodCartCount} items in Swaadh Cart
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-950 dark:to-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-4 mb-4">
                    <p className="text-sm text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
                      <span className="text-lg">🪙</span>
                      <span className="font-semibold">You'll earn <span className="text-yellow-700 dark:text-yellow-400 text-base font-bold">+{coinsToEarn} coins</span> with this order!</span>
                    </p>
                    <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1 ml-6">Collect coins & unlock exclusive rewards</p>
                  </div>

                  <Button
                    onClick={() => setIsCartOpen(false)}
                    variant="outline"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentCartTab(activeTab);
                      setOrderView('payment');
                    }}
                    className={activeTab === "swaadh"
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }
                  >
                    {activeTab === "swaadh" ? "Place Order" : "Checkout"}
                  </Button>
                </div>
              </div>
            )}

            {/* Food Tracking View */}
            {orderView === 'food-tracking' && (
              <div className="flex flex-col h-full bg-white">
                <div className="p-6 border-b border-border flex-shrink-0">
                  <h2 className="text-2xl font-bold mb-2">Order Confirmed ✓</h2>
                  <p className="text-muted-foreground mb-4">ETA: 25-35 mins</p>

                  {/* Status Bar */}
                  <div className="flex justify-between mb-6 text-xs">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-1"></div>
                      <span>Confirmed</span>
                    </div>
                    <div className="flex-1 h-1 bg-green-500 mx-2 mt-4"></div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-1"></div>
                      <span>Preparing</span>
                    </div>
                    <div className="flex-1 h-1 bg-green-500 mx-2 mt-4"></div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-orange-400 rounded-full mx-auto mb-1"></div>
                      <span>Picked Up</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-300 mx-2 mt-4"></div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
                      <span>Delivered</span>
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div className="w-full h-32 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
                    <div className="absolute text-4xl animate-bounce">🏍️</div>
                  </div>

                  {/* Delivery Partner */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-2xl mb-4">
                    <h3 className="font-bold mb-3">Delivery Partner</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center text-2xl">🏍️</div>
                      <div className="flex-1">
                        <p className="font-bold">Raju Kumar</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <button className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Bajaj Pulsar KA-09 4521</p>
                  </div>

                  {/* Live Status */}
                  <div className="p-4 bg-accent rounded-2xl text-center mb-4">
                    <p className="text-sm font-medium">{liveStatus}</p>
                  </div>

                  {/* Coins Earned */}
                  {coinsEarned > 0 && (
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-950 dark:to-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-4">
                      <div className="space-y-2">
                        <p className="text-sm text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
                          <span className="text-2xl">🪙</span>
                          <span className="font-semibold">You earned <span className="text-yellow-700 dark:text-yellow-400 text-lg font-bold">+{coinsEarned} coins</span>!</span>
                        </p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-300 ml-8 font-medium">
                          New Balance: <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{newBalance}</span> 🪙
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 border-t border-border">
                  <h3 className="font-bold mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    {cartItems.filter(item => item && item.category === 'Food').map((item) => (
                      item && (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      )
                    ))}
                  </div>
                  <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-6 border-t border-border flex-shrink-0">
                  <Button
                    onClick={() => {
                      setOrderView('cart');
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}

            {/* Product Tracking View */}
            {orderView === 'product-tracking' && (
              <div className="flex flex-col h-full bg-white">
                <div className="p-6 border-b border-border flex-shrink-0">
                  <h2 className="text-2xl font-bold mb-2">Order Placed ✓</h2>
                  <p className="text-muted-foreground mb-2">Order ID: #{orderId}</p>
                  <p className="text-muted-foreground mb-6">Expected delivery: {format(addDays(new Date(), 4), 'EEEE, MMMM d')}</p>

                  {/* Delivery Steps */}
                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Order Placed', date: 'Today' },
                      { step: 2, title: 'Order Confirmed', date: 'Today' },
                      { step: 3, title: 'Packed & Dispatched', date: 'Tomorrow' },
                      { step: 4, title: 'Shipped', date: 'In 2 days' },
                      { step: 5, title: 'Out for Delivery', date: 'In 3 days' },
                      { step: 6, title: 'Delivered', date: format(addDays(new Date(), 4), 'MMM d') },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            idx <= 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {idx <= 1 ? '✓' : item.step}
                          </div>
                          {idx < 5 && <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>}
                        </div>
                        <div className="pb-4">
                          <p className="font-bold">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 border-t border-border">
                  <h3 className="font-bold mb-3">Items Ordered</h3>
                  <div className="space-y-2">
                    {cartItems.filter(item => item && item.category !== 'Food').map((item) => (
                      item && (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      )
                    ))}
                  </div>
                  <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-6 border-t border-border flex-shrink-0 space-y-3">
                  {coinsEarned > 0 && (
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-950 dark:to-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-4 mb-2">
                      <div className="space-y-2">
                        <p className="text-sm text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
                          <span className="text-2xl">🪙</span>
                          <span className="font-semibold">You earned <span className="text-yellow-700 dark:text-yellow-400 text-lg font-bold">+{coinsEarned} coins</span>!</span>
                        </p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-300 ml-8 font-medium">
                          New Balance: <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{newBalance}</span> 🪙
                        </p>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={() => toast.success("Track order at your convenience!")}
                    variant="outline"
                    className="w-full"
                  >
                    Track Your Delivery
                  </Button>
                  <Button
                    onClick={() => toast.success("Support team notified!")}
                    variant="outline"
                    className="w-full"
                  >
                    Contact Support
                  </Button>
                  <Button
                    onClick={() => {
                      setOrderView('cart');
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { X, Users, Utensils, Check, Percent, CreditCard, Loader2, MapPin, Star, Wifi, Car, Coffee, Sparkles, ChevronLeft, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { supabase } from "../supabaseClient";
import { format, differenceInDays } from "date-fns";
import { getCoins, addCoins } from "../utils/rewards";
import type { DateRange } from "react-day-picker";

interface Hotel {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  category: string;
  image: string;
  amenities: string[];
}

interface HotelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Hotel | null;
}

type ViewState = 'form' | 'bill' | 'payment-select' | 'upi' | 'card' | 'netbanking' | 'success';

interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

const BANKS = {
  Popular: ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "Canara", "BOB", "Yes Bank", "IndusInd"],
  Others: ["Union Bank", "Central Bank", "IOB", "Syndicate", "Dena", "Vijaya", "IDFC", "Federal", "South Indian", "Karur Vysya", "DCB", "RBL", "CSB", "Dhanlaxmi", "Lakshmi Vilas", "Jammu & Kashmir", "UCO", "IDBI"],
  Foreign: ["Citibank", "HSBC", "Standard Chartered", "Deutsche", "Barclays", "DBS", "RBS", "BNP Paribas"]
};

export function HotelBookingModal({ isOpen, onClose, hotel }: HotelBookingModalProps) {
  // Form state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState("Deluxe");
  const [isAC, setIsAC] = useState(true);
  const [freeBreakfast, setFreeBreakfast] = useState(false);
  const [airportPickup, setAirportPickup] = useState(false);
  const [earlyCheckin, setEarlyCheckin] = useState(false);
  const [lateCheckout, setLateCheckout] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);

  // View state
  const [view, setView] = useState<ViewState>('form');
  const [showTnC, setShowTnC] = useState(false);

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [upiTimer, setUpiTimer] = useState(300);
  const [cardDetails, setCardDetails] = useState<CardDetails>({ number: '', expiry: '', cvv: '', name: '' });
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [newBalance, setNewBalance] = useState(0);

  const roomTypes = ["Standard", "Deluxe", "Premium", "Suite"];
  const hotelImages = !hotel ? [] : [hotel.image, "🏨", "🛏️", "🌟"];

  // Timer effect for UPI
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (view === 'upi' && upiTimer > 0) {
      timer = setInterval(() => {
        setUpiTimer(t => {
          if (t <= 1) {
            setView('success');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, upiTimer]);

  const calculateNights = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from);
  };

  const calculateRoomCharges = () => {
    const roomMultiplier = {
      "Standard": 1,
      "Deluxe": 1.3,
      "Premium": 1.6,
      "Suite": 2
    }[roomType] || 1;

    let roomChargesPerNight = hotel.pricePerNight * roomMultiplier;
    if (!isAC) roomChargesPerNight *= 0.7;

    return roomChargesPerNight;
  };

  const calculateBill = () => {
    const nights = calculateNights();
    const roomChargesPerNight = calculateRoomCharges();

    const roomSubtotal = roomChargesPerNight * nights;
    const breakfastCharge = freeBreakfast ? 500 * nights : 0;
    const roomChargesWithBreakfast = roomSubtotal + breakfastCharge;
    const SGST = roomChargesWithBreakfast * 0.09;
    const CGST = roomChargesWithBreakfast * 0.09;
    const platformFee = 199;
    const oneTimeCharges = (airportPickup ? 1500 : 0) + (earlyCheckin ? 1000 : 0) + (lateCheckout ? 800 : 0);
    const couponDiscount = appliedCoupon ? roomChargesWithBreakfast * 0.15 : 0;

    const grandTotal = roomSubtotal + breakfastCharge + SGST + CGST + platformFee + oneTimeCharges - couponDiscount;

    return {
      roomSubtotal,
      breakfastCharge,
      SGST,
      CGST,
      platformFee,
      airportPickup: airportPickup ? 1500 : 0,
      earlyCheckin: earlyCheckin ? 1000 : 0,
      lateCheckout: lateCheckout ? 800 : 0,
      couponDiscount,
      grandTotal
    };
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "AROHA15") {
      setAppliedCoupon(true);
      toast.success("Coupon applied! 15% discount");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleProceedToBill = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (calculateNights() <= 0) {
      toast.error("Check-out date must be after check-in date");
      return;
    }
    setView('bill');
  };

  const handleConfirmBooking = async () => {
    setPaymentLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      const bill = calculateBill();

      const { error } = await supabase
        .from("hotel_bookings")
        .insert({
          user_id: userId,
          hotel_name: hotel.name,
          check_in: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
          check_out: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
          guests: Number(guests),
          rooms: 1,
          total_price: `₹${bill.grandTotal.toLocaleString()}`,
          status: "Confirmed"
        });

      if (error) {
        console.warn("Could not save hotel booking:", error.message);
      }

      // Add coins for booking
      const coinsToAdd = 100 + Math.round(bill.grandTotal * 0.01); // 100 base + 1% of bill
      const newCoinsBalance = await addCoins(coinsToAdd, `Hotel booking at ${hotel.name} for ₹${bill.grandTotal.toLocaleString()}`);
      setCoinsEarned(coinsToAdd);
      setNewBalance(newCoinsBalance);
    } catch (err: any) {
      console.warn("Hotel booking DB insertion failed:", err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      toast.error("Please fill all card details");
      return;
    }
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      handleConfirmBooking();
      setView('success');
    }, 2000);
  };

  const handleNetbankingPayment = async () => {
    if (!selectedBank) {
      toast.error("Please select a bank");
      return;
    }
    setPaymentLoading(true);
    toast.loading(`Redirecting to ${selectedBank}...`);
    setTimeout(() => {
      setPaymentLoading(false);
      handleConfirmBooking();
      setView('success');
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
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

  // Early return after all hooks
  if (!isOpen || !hotel) return null;

  // Success Screen
  if (view === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">Your booking has been confirmed</p>

            <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-2xl p-6 mb-6 text-left">
              <h3 className="font-bold mb-3">{hotel.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in:</span>
                  <span className="font-medium">{dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out:</span>
                  <span className="font-medium">{dateRange?.to ? format(dateRange.to, 'MMM d, yyyy') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests:</span>
                  <span className="font-medium">{guests} {guests === 1 ? "guest" : "guests"}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold">Total Paid:</span>
                  <span className="font-bold text-primary">₹{calculateBill().grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-950 dark:to-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-4 mb-6">
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

            <Button
              onClick={() => {
                setView('form');
                onClose();
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            {view !== 'form' && view !== 'success' && (
              <button
                onClick={() => {
                  if (view === 'upi' || view === 'card' || view === 'netbanking') {
                    setView('payment-select');
                  } else if (view === 'payment-select') {
                    setView('bill');
                  } else if (view === 'bill') {
                    setView('form');
                  }
                }}
                className="w-10 h-10 rounded-full hover:bg-accent transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold">{hotel.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{hotel.location}</p>
              </div>
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
          {view === 'form' && (
            <>
              {/* Hotel Images */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {hotelImages.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-6xl hover:scale-105 transition-transform cursor-pointer overflow-hidden"
                  >
                    {img.startsWith("http") ? (
                      <ImageWithFallback src={img} className="w-full h-full object-cover" />
                    ) : (
                      img
                    )}
                  </div>
                ))}
              </div>

              {/* Hotel Info */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{hotel.rating}</span>
                    <span className="text-sm text-muted-foreground">({hotel.reviews} reviews)</span>
                  </div>
                  <Badge>{hotel.category}</Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {hotel.amenities.map((amenity, i) => (
                    <Badge key={i} variant="outline" className="gap-1">
                      {amenity === "Pool" && <Sparkles className="w-3 h-3" />}
                      {amenity === "WiFi" && <Wifi className="w-3 h-3" />}
                      {amenity === "Restaurant" && <Utensils className="w-3 h-3" />}
                      {amenity === "Parking" && <Car className="w-3 h-3" />}
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Check-in Date *</label>
                  <Input
                    type="date"
                    value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = new Date(e.target.value);
                        setDateRange({
                          from: newDate,
                          to: dateRange?.to
                        });
                      }
                    }}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Check-out Date *</label>
                  <Input
                    type="date"
                    value={dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = new Date(e.target.value);
                        setDateRange({
                          from: dateRange?.from,
                          to: newDate
                        });
                      }
                    }}
                    min={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Number of Guests</label>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    variant="outline"
                    size="sm"
                  >
                    -
                  </Button>
                  <span className="font-bold text-xl">{guests}</span>
                  <Button
                    onClick={() => setGuests(Math.min(10, guests + 1))}
                    variant="outline"
                    size="sm"
                  >
                    +
                  </Button>
                  <Users className="w-5 h-5 text-muted-foreground ml-2" />
                </div>
              </div>

              {/* Room Type */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Room Type</label>
                <div className="grid grid-cols-4 gap-3">
                  {roomTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setRoomType(type)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        roomType === type
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-sm">{type}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Coffee className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Air Conditioning</p>
                      <p className="text-xs text-muted-foreground">Cool comfort</p>
                    </div>
                  </div>
                  <Switch
                    checked={isAC}
                    onCheckedChange={setIsAC}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Utensils className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Free Breakfast</p>
                      <p className="text-xs text-muted-foreground">+₹500/night</p>
                    </div>
                  </div>
                  <Switch
                    checked={freeBreakfast}
                    onCheckedChange={setFreeBreakfast}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Airport Pickup</p>
                      <p className="text-xs text-muted-foreground">+₹1,500</p>
                    </div>
                  </div>
                  <Switch
                    checked={airportPickup}
                    onCheckedChange={setAirportPickup}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-sm">Early Check-in</p>
                      <p className="text-xs text-muted-foreground">+₹1,000</p>
                    </div>
                    <Switch
                      checked={earlyCheckin}
                      onCheckedChange={setEarlyCheckin}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-sm">Late Checkout</p>
                      <p className="text-xs text-muted-foreground">+₹800</p>
                    </div>
                    <Switch
                      checked={lateCheckout}
                      onCheckedChange={setLateCheckout}
                    />
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Coupon Code</label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code (try: AROHA15)"
                    disabled={appliedCoupon}
                  />
                  <Button
                    onClick={applyCoupon}
                    variant="outline"
                    disabled={appliedCoupon}
                  >
                    {appliedCoupon ? (
                      <>
                        <Check className="w-4 h-4 mr-1 text-green-500" />
                        Applied
                      </>
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    15% discount applied!
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => toast.success("Hotel saved to your favorites!")}
                  variant="outline"
                  className="flex-1"
                >
                  Save for Later
                </Button>
                <Button
                  onClick={handleProceedToBill}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Review Bill & Pay
                </Button>
              </div>
            </>
          )}

          {view === 'bill' && (
            <>
              <h3 className="text-2xl font-bold mb-6">Booking Summary</h3>

              <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-3xl p-6 mb-6 border border-primary/20 space-y-3">
                {(() => {
                  const bill = calculateBill();
                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Room Charges ({calculateNights()} nights × ₹{calculateRoomCharges().toLocaleString()})</span>
                        <span className="font-medium">₹{bill.roomSubtotal.toLocaleString()}</span>
                      </div>
                      {bill.breakfastCharge > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Free Breakfast ({calculateNights()} nights)</span>
                          <span className="font-medium">₹{bill.breakfastCharge.toLocaleString()}</span>
                        </div>
                      )}
                      {bill.airportPickup > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Airport Pickup</span>
                          <span className="font-medium">₹{bill.airportPickup.toLocaleString()}</span>
                        </div>
                      )}
                      {bill.earlyCheckin > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Early Check-in</span>
                          <span className="font-medium">₹{bill.earlyCheckin.toLocaleString()}</span>
                        </div>
                      )}
                      {bill.lateCheckout > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Late Checkout</span>
                          <span className="font-medium">₹{bill.lateCheckout.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm pt-3 border-t border-border">
                        <span className="text-muted-foreground">SGST (9%)</span>
                        <span className="font-medium">₹{bill.SGST.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">CGST (9%)</span>
                        <span className="font-medium">₹{bill.CGST.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Platform Fee</span>
                        <span className="font-medium">₹{bill.platformFee.toLocaleString()}</span>
                      </div>
                      {bill.couponDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Coupon Discount (15%)</span>
                          <span className="font-medium text-green-600">-₹{bill.couponDiscount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 border-t border-border">
                        <span className="font-bold text-lg">Grand Total</span>
                        <span className="font-bold text-2xl text-primary">₹{bill.grandTotal.toLocaleString()}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <button
                onClick={() => setShowTnC(true)}
                className="text-primary hover:underline text-sm mb-6 block"
              >
                Terms & Conditions applied (link opens dialog)
              </button>

              <div className="flex gap-3">
                <Button
                  onClick={() => setView('form')}
                  variant="outline"
                  className="flex-1"
                >
                  Edit Details
                </Button>
                <Button
                  onClick={() => setView('payment-select')}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </>
          )}

          {view === 'payment-select' && (
            <>
              <h3 className="text-2xl font-bold mb-6">Select Payment Method</h3>
              <div className="space-y-3">
                {[
                  { id: 'upi', icon: '📱', title: 'UPI', sub: 'PhonePe, GPay, Paytm' },
                  { id: 'card', icon: '💳', title: 'Credit / Debit Card', sub: 'Visa, Mastercard, Rupay' },
                  { id: 'netbanking', icon: '🏦', title: 'Net Banking', sub: 'All Indian & Foreign banks' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedPaymentMethod(method.id);
                      setView(method.id as ViewState);
                    }}
                    className="w-full p-4 border-2 border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-4"
                  >
                    <span className="text-4xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold">{method.title}</p>
                      <p className="text-sm text-muted-foreground">{method.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {view === 'upi' && (
            <>
              <h3 className="text-2xl font-bold mb-6">UPI Payment</h3>
              <div className="flex flex-col items-center gap-6">
                <div className="bg-white p-8 rounded-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=aroha@paytm&am=${calculateBill().grandTotal}`}
                    alt="UPI QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">UPI ID</p>
                  <p className="font-bold text-lg mb-4">aroha@paytm</p>
                  <p className="text-lg font-bold">Amount: ₹{calculateBill().grandTotal.toLocaleString()}</p>
                </div>
                <div className="text-center bg-accent/50 p-4 rounded-2xl w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg">
                      {String(Math.floor(upiTimer / 60)).padStart(2, '0')}:{String(upiTimer % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Time remaining to complete payment</p>
                </div>
                <Button
                  onClick={() => {
                    setView('success');
                    handleConfirmBooking();
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  I have paid
                </Button>
              </div>
            </>
          )}

          {view === 'card' && (
            <>
              <h3 className="text-2xl font-bold mb-6">Card Payment</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Card Number</label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Expiry (MM/YY)</label>
                    <Input
                      placeholder="12/25"
                      value={cardDetails.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        setCardDetails({ ...cardDetails, expiry: val });
                      }}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">CVV</label>
                    <Input
                      type="password"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                      maxLength={3}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Name on Card</label>
                  <Input
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCardPayment}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${calculateBill().grandTotal.toLocaleString()}`
                  )}
                </Button>
              </div>
            </>
          )}

          {view === 'netbanking' && (
            <>
              <h3 className="text-2xl font-bold mb-6">Net Banking</h3>
              <div className="mb-4">
                <Input
                  placeholder="Search banks..."
                  value={bankSearchQuery}
                  onChange={(e) => setBankSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {Object.entries(getFilteredBanks()).map(([category, banks]) => (
                  <div key={category}>
                    <h4 className="text-sm font-bold text-muted-foreground mb-2">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {banks.map((bank) => (
                        <button
                          key={bank}
                          onClick={() => {
                            setSelectedBank(bank);
                            handleNetbankingPayment();
                          }}
                          className="p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-left"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* T&C Dialog Overlay */}
        {showTnC && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
                <h3 className="text-2xl font-bold">Terms & Conditions</h3>
                <button
                  onClick={() => setShowTnC(false)}
                  className="w-10 h-10 rounded-full hover:bg-accent transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div>
                  <h4 className="font-bold mb-2">Room Availability</h4>
                  <p className="text-muted-foreground">Room availability is subject to hotel vacancy and booking status at the time of confirmation.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Refund Policy</h4>
                  <p className="text-muted-foreground">If no vacancy is available after booking confirmation, full refund will be processed within 7-8 business days.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Check-in & Check-out</h4>
                  <p className="text-muted-foreground">Standard check-in time is 2:00 PM and check-out time is 12:00 PM. Early check-in and late checkout are subject to availability.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Cancellation Policy</h4>
                  <p className="text-muted-foreground">Free cancellation is available up to 48 hours before check-in date. Cancellations within 48 hours will incur full charges.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Force Majeure</h4>
                  <p className="text-muted-foreground">The hotel is not responsible for any losses or damages due to unforeseen circumstances including natural disasters, war, or government actions.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Taxes</h4>
                  <p className="text-muted-foreground">GST applied is non-refundable and platform fees are non-refundable under any circumstances.</p>
                </div>
              </div>
              <div className="p-6 border-t border-border">
                <Button
                  onClick={() => setShowTnC(false)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  I Agree & Continue
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

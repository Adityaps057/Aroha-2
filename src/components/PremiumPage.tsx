import { Crown, Check, Star, Sparkles, Zap, Shield, Gift, Calendar, MapPin, TrendingUp, MessageCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

export function PremiumPage() {
  const benefits = [
    { icon: Zap, title: "Ad-free Experience", description: "Enjoy distraction-free browsing" },
    { icon: MapPin, title: "Customize Your Day Plan", description: "Create unlimited custom itineraries" },
    { icon: Crown, title: "Premium Full-Day Trips", description: "Access exclusive heritage tours" },
    { icon: Sparkles, title: "AI Personalized Itineraries", description: "Smart recommendations tailored for you" },
    { icon: Gift, title: "Free Delivery All Over India", description: "Get souvenirs delivered nationwide" },
    { icon: Shield, title: "Priority Customer Support", description: "24/7 dedicated premium support" },
    { icon: Star, title: "Exclusive Discounts", description: "Up to 30% off on hotels & restaurants" },
    { icon: Calendar, title: "Early Event Access", description: "Book events before public release" },
    { icon: TrendingUp, title: "Premium Hotel Offers", description: "Special rates at partner hotels" },
    { icon: MessageCircle, title: "Faster Booking", description: "Skip the queue with instant bookings" }
  ];

  const plans = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: "₹499",
      period: "/month",
      description: "Perfect for weekend explorers",
      features: [
        "All premium features",
        "Unlimited itineraries",
        "Priority support",
        "Early event access",
        "Cancel anytime"
      ],
      recommended: false
    },
    {
      id: "yearly",
      name: "Yearly Plan",
      price: "₹3,999",
      period: "/year",
      description: "Best value for frequent travelers",
      features: [
        "All premium features",
        "Unlimited itineraries",
        "Priority support",
        "Early event access",
        "Save ₹2,000 annually",
        "Exclusive annual gifts"
      ],
      recommended: true,
      savings: "Save 33%"
    },
    {
      id: "family",
      name: "Family Plan",
      price: "₹5,999",
      period: "/year",
      description: "Share with up to 5 family members",
      features: [
        "All premium features",
        "5 user accounts",
        "Unlimited itineraries",
        "Priority support",
        "Family trip planning",
        "Shared memories gallery"
      ],
      recommended: false
    }
  ];

  const freeVsPremium = [
    { feature: "Access to Places", free: true, premium: true },
    { feature: "Basic Itinerary Planning", free: true, premium: true },
    { feature: "Read Reviews", free: true, premium: true },
    { feature: "Earn Coins & Rewards", free: true, premium: true },
    { feature: "Ad-free Experience", free: false, premium: true },
    { feature: "Unlimited Custom Plans", free: false, premium: true },
    { feature: "Premium Full-Day Trips", free: false, premium: true },
    { feature: "AI Personalized Routes", free: false, premium: true },
    { feature: "Priority Support", free: false, premium: true },
    { feature: "Exclusive Discounts", free: false, premium: true }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Rajesh Kumar",
      avatar: "👨",
      location: "Delhi",
      rating: 5,
      text: "Premium membership made my Mysore trip unforgettable! The AI itinerary was spot-on and saved me hours of planning."
    },
    {
      id: 2,
      name: "Anita Desai",
      avatar: "👩",
      location: "Mumbai",
      rating: 5,
      text: "The premium full-day experiences are worth every penny. Hidden gems I would never have found on my own!"
    },
    {
      id: 3,
      name: "Vikram Patel",
      avatar: "👨‍🦱",
      location: "Bangalore",
      rating: 5,
      text: "Family plan is perfect! We planned a 3-day trip together and the discounts covered the membership cost."
    }
  ];

  const faqs = [
    {
      question: "Can I cancel my premium subscription anytime?",
      answer: "Yes! You can cancel your premium subscription at any time. You'll continue to have access until the end of your billing period."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI, net banking, and popular digital wallets like PayTM, PhonePe, and Google Pay."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a 7-day free trial for new users. No credit card required to start your trial."
    },
    {
      question: "Can I upgrade from monthly to yearly plan?",
      answer: "Absolutely! You can upgrade anytime and we'll prorate your existing subscription."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-600/10 px-6 py-3 rounded-full mb-6">
          <Crown className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">AROHA PREMIUM</span>
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Unlock the Complete<br />Mysore Experience
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get unlimited access to premium features, exclusive tours, and personalized AI itineraries
        </p>
        <Button
          onClick={() => toast.success("Starting 7-day free trial!")}
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg"
          size="lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start Free Trial
        </Button>
      </div>

      {/* Benefits Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Premium Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div
                key={i}
                className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all text-center"
              >
                <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 transition-all ${
                plan.recommended
                  ? "bg-gradient-to-br from-primary to-purple-600 text-white shadow-2xl scale-105"
                  : "bg-card border border-border hover:shadow-xl"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-yellow-400 text-yellow-900 px-4 py-1 hover:bg-yellow-400">
                    <Star className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}
              {plan.savings && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-green-500 text-white">
                    {plan.savings}
                  </Badge>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${plan.recommended ? "text-white" : ""}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.recommended ? "text-white/80" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className={`text-lg ${plan.recommended ? "text-white/80" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.recommended ? "text-white" : "text-primary"}`} />
                    <span className={`text-sm ${plan.recommended ? "text-white" : ""}`}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => toast.success(`Selected ${plan.name}!`)}
                className={`w-full ${
                  plan.recommended
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
                size="lg"
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Free vs Premium</h2>
        <div className="bg-card border border-border rounded-3xl overflow-hidden max-w-4xl mx-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-6 font-bold">Feature</th>
                <th className="text-center p-6 font-bold">Free</th>
                <th className="text-center p-6 font-bold bg-gradient-to-r from-primary/10 to-purple-600/10">
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Premium
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {freeVsPremium.map((item, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="p-6">{item.feature}</td>
                  <td className="text-center p-6">
                    {item.free ? (
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-6 h-6 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="text-center p-6 bg-gradient-to-r from-primary/5 to-purple-600/5">
                    {item.premium ? (
                      <Check className="w-6 h-6 text-primary mx-auto" />
                    ) : (
                      <X className="w-6 h-6 text-gray-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Premium Members Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div className="flex-1">
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 text-center text-white">
        <Crown className="w-16 h-16 mx-auto mb-6 opacity-90" />
        <h2 className="text-4xl font-bold mb-4">Ready to Explore Like Never Before?</h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of premium travelers discovering Mysore's hidden treasures
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => toast.success("Starting free trial!")}
            className="bg-white text-primary hover:bg-white/90 shadow-xl px-8 py-6 text-lg"
            size="lg"
          >
            Start 7-Day Free Trial
          </Button>
          <Button
            onClick={() => toast.success("Opening plan comparison...")}
            variant="outline"
            className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
            size="lg"
          >
            Compare Plans
          </Button>
        </div>
        <p className="text-sm text-white/70 mt-6">
          No credit card required • Cancel anytime • 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
}

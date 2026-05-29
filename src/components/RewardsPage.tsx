import { Coins, Trophy, Gift, MapPin, Camera, Star, Target, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getCoins, getLocalActivities, spendCoins } from "../utils/rewards";

const REDEEMED_KEY = "aroha_redeemed_rewards";

export function RewardsPage() {
  const [userCoins, setUserCoins] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [redeemedIds, setRedeemedIds] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(REDEEMED_KEY) || "[]"); } catch { return []; }
  });

  const nextRewardAt = 1500;
  const progressPercent = Math.min((userCoins / nextRewardAt) * 100, 100);

  useEffect(() => {
    const loadRewards = async () => {
      const coins = await getCoins();
      setUserCoins(coins);
      setRecentActivity(getLocalActivities());
    };
    loadRewards();

    const handleUpdate = () => { loadRewards(); };
    window.addEventListener("aroha_rewards_updated", handleUpdate);
    return () => { window.removeEventListener("aroha_rewards_updated", handleUpdate); };
  }, []);

  const achievements = [
    { id: 1, icon: "🏛️", title: "Heritage Hunter", description: "Visited 5 heritage sites", earned: true, coins: 100 },
    { id: 2, icon: "📸", title: "Photo Explorer", description: "Uploaded 10 photos", earned: true, coins: 150 },
    { id: 3, icon: "⭐", title: "Review Master", description: "Posted 5 reviews", earned: true, coins: 100 },
    { id: 4, icon: "🗺️", title: "Map Navigator", description: "Checked in 15 times", earned: false, coins: 200 },
    { id: 5, icon: "🌟", title: "Hidden Gem Finder", description: "Discovered 3 hidden spots", earned: true, coins: 250 },
    { id: 6, icon: "🎭", title: "Cultural Enthusiast", description: "Attended 2 events", earned: false, coins: 150 },
  ];

  const rewardTiers = [
    { id: 1, coins: 500,  title: "Free Local Ride",        description: "Complimentary auto/cab ride within Mysore", icon: "🚗" },
    { id: 2, coins: 1000, title: "Hotel Discount Coupon",  description: "15% off on partner hotels",                icon: "🏨" },
    { id: 3, coins: 1500, title: "Sponsored Meal",         description: "Free meal at select restaurants",          icon: "🍽️" },
    { id: 4, coins: 2500, title: "Free Heritage Tour",     description: "Guided tour of Mysore Palace & more",      icon: "🏰" },
  ].map((r) => ({
    ...r,
    unlocked: userCoins >= r.coins,
    redeemed: redeemedIds.includes(r.id),
  }));


  const handleRedeem = async (reward: any) => {
    if (reward.redeemed) {
      toast.info("Already redeemed!");
      return;
    }
    if (!reward.unlocked) {
      toast.error(`Need ${reward.coins - userCoins} more coins to unlock!`);
      return;
    }
    const newCoins = await spendCoins(reward.coins, `Redeemed: ${reward.title}`);
    setUserCoins(newCoins);
    const updated = [...redeemedIds, reward.id];
    setRedeemedIds(updated);
    localStorage.setItem(REDEEMED_KEY, JSON.stringify(updated));
    setRecentActivity(getLocalActivities());
    toast.success(`🎉 Successfully redeemed: ${reward.title}!`);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Rewards & Achievements</h1>
        <p className="text-muted-foreground">Earn coins by exploring Mysuru and unlock amazing rewards</p>
      </div>

      {/* Coin Balance Card */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 text-white mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/80 mb-1">Your Balance</p>
            <div className="flex items-center gap-3">
              <Coins className="w-10 h-10" />
              <span className="text-5xl font-bold">{userCoins}</span>
              <span className="text-2xl">coins</span>
            </div>
          </div>
          <Trophy className="w-16 h-16 text-white/30" />
        </div>

        {/* Progress to Next Reward */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/90">Next reward at {nextRewardAt} coins</p>
            <p className="text-sm font-bold">{nextRewardAt - userCoins} more needed</p>
          </div>
          <Progress value={progressPercent} className="h-3 bg-white/20" />
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Your Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`border rounded-2xl p-5 transition-all ${
                achievement.earned
                  ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 shadow-md"
                  : "bg-card border-border opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{achievement.icon}</div>
                {achievement.earned ? (
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Earned
                  </Badge>
                ) : (
                  <Badge variant="outline">Locked</Badge>
                )}
              </div>
              <h3 className="font-bold mb-1">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
              <div className="flex items-center gap-1 text-primary font-medium">
                <Coins className="w-4 h-4" />
                <span>+{achievement.coins} coins</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reward Tiers */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          Redeem Rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewardTiers.map((reward) => (
            <div
              key={reward.id}
              className={`border rounded-3xl p-6 transition-all ${
                reward.unlocked
                  ? "bg-card border-border hover:shadow-xl"
                  : "bg-muted/50 border-border/50"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-6xl">{reward.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{reward.title}</h3>
                    {reward.unlocked ? (
                      <Badge className="bg-green-500 text-white">Unlocked</Badge>
                    ) : (
                      <Badge variant="outline">Locked</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Coins className="w-5 h-5" />
                    <span>{reward.coins} coins</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleRedeem(reward)}
                disabled={!reward.unlocked || reward.redeemed}
                className={`w-full ${
                  reward.redeemed
                    ? "bg-green-600 text-white opacity-80 cursor-not-allowed"
                    : reward.unlocked
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {reward.redeemed ? (
                  <><CheckCircle className="w-4 h-4 mr-2" />Redeemed</>
                ) : reward.unlocked ? (
                  "Redeem Now"
                ) : (
                  `Need ${reward.coins - userCoins} more coins`
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* How to Earn */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          How to Earn Coins
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-lg transition-all">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-bold mb-1">Check-in</h3>
            <p className="text-sm text-muted-foreground mb-2">Visit locations</p>
            <div className="text-primary font-bold">+25 coins</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-lg transition-all">
            <Camera className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-bold mb-1">Upload Photos</h3>
            <p className="text-sm text-muted-foreground mb-2">Share memories</p>
            <div className="text-primary font-bold">+30 coins</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-lg transition-all">
            <Star className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-bold mb-1">Write Reviews</h3>
            <p className="text-sm text-muted-foreground mb-2">Help travelers</p>
            <div className="text-primary font-bold">+40 coins</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-lg transition-all">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-bold mb-1">Complete Trips</h3>
            <p className="text-sm text-muted-foreground mb-2">Finish itineraries</p>
            <div className="text-primary font-bold">+100 coins</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <Coins className="w-4 h-4" />
                  <span>+{activity.coins}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

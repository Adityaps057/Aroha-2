import { supabase } from "../supabaseClient";
import { toast } from "sonner";

const COINS_KEY = "aroha_user_coins";
const ACTIVITIES_KEY = "aroha_recent_activities";
const DEFAULT_COINS = 1350;

const defaultActivities = [
  { id: 1, action: "Visited Chamundi Hills", coins: 50, time: "2 hours ago" },
  { id: 2, action: "Uploaded photo at Mysore Palace", coins: 30, time: "1 day ago" },
  { id: 3, action: "Posted review for Brindavan Gardens", coins: 40, time: "2 days ago" },
  { id: 4, action: "Checked in at Railway Museum", coins: 25, time: "3 days ago" },
];

export async function getCoins(): Promise<number> {
  const localCoins = localStorage.getItem(COINS_KEY);
  let coins = localCoins ? parseInt(localCoins) : DEFAULT_COINS;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();
      
      if (profile && typeof profile.coins === "number") {
        coins = profile.coins;
        localStorage.setItem(COINS_KEY, coins.toString());
      }
    }
  } catch (err) {
    console.warn("Could not fetch coins from Supabase, using local:", err);
  }

  return coins;
}

export async function addCoins(amount: number, reason: string): Promise<number> {
  const currentCoins = await getCoins();
  const newCoins = currentCoins + amount;
  
  localStorage.setItem(COINS_KEY, newCoins.toString());

  // Save activity
  const localActivities = localStorage.getItem(ACTIVITIES_KEY);
  const activities = localActivities ? JSON.parse(localActivities) : [...defaultActivities];
  const newActivity = {
    id: Date.now(),
    action: reason,
    coins: amount,
    time: "Just now"
  };
  activities.unshift(newActivity);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities.slice(0, 15)));

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ coins: newCoins })
        .eq("id", user.id);
    }
  } catch (err) {
    console.warn("Could not sync coins with Supabase:", err);
  }

  toast.success(`Earned +${amount} Coins! 🪙`, {
    description: reason
  });

  // Dispatch storage event so other components know to update
  window.dispatchEvent(new Event("aroha_rewards_updated"));

  return newCoins;
}

export async function spendCoins(amount: number, reason: string): Promise<number> {
  const currentCoins = await getCoins();
  if (currentCoins < amount) {
    toast.error(`Not enough coins! Need ${amount - currentCoins} more.`);
    return currentCoins;
  }

  const newCoins = currentCoins - amount;
  localStorage.setItem(COINS_KEY, newCoins.toString());

  const localActivities = localStorage.getItem(ACTIVITIES_KEY);
  const activities = localActivities ? JSON.parse(localActivities) : [...defaultActivities];
  activities.unshift({
    id: Date.now(),
    action: reason,
    coins: -amount,
    time: "Just now"
  });
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities.slice(0, 15)));

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ coins: newCoins }).eq("id", user.id);
    }
  } catch (err) {
    console.warn("Could not sync coins with Supabase:", err);
  }

  window.dispatchEvent(new Event("aroha_rewards_updated"));
  return newCoins;
}

export function getLocalActivities(): any[] {
  const localActivities = localStorage.getItem(ACTIVITIES_KEY);
  return localActivities ? JSON.parse(localActivities) : defaultActivities;
}

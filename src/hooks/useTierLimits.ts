import { useApp } from "@/contexts/AppContext";
import { useDashboard } from "@/contexts/DashboardContext";

export type ProducerTier = "free" | "standard";

export interface TierLimits {
  tier: ProducerTier;
  commissionPercent: number;
  // Limits
  maxSubscribers: number | null; // null = unlimited
  maxPlans: number | null;
  maxContacts: number | null;
  maxBroadcastsPerMonth: number | null;
  canCreateDrops: boolean;
  canGateContent: boolean;
  canAutoReminders: boolean;
  // Current usage
  subscriberCount: number;
  planCount: number;
  // Checks
  isAtSubscriberLimit: boolean;
  isNearSubscriberLimit: boolean;
  isAtPlanLimit: boolean;
  isFree: boolean;
  isStandard: boolean;
}

export function useTierLimits(): TierLimits {
  const { session, demoActive } = useApp();
  const { subscribers, plans } = useDashboard();

  const tier: ProducerTier = (session.profile?.subscription_tier as ProducerTier) || "free";
  const isFree = tier === "free" && !demoActive;
  const isStandard = tier === "standard" || demoActive;

  const commissionPercent = isStandard ? 5 : 8;
  const maxSubscribers = isFree ? 25 : null;
  const maxPlans = isFree ? 1 : null;
  const maxContacts = isFree ? 50 : null;
  const maxBroadcastsPerMonth = isFree ? 3 : null;

  const activeSubscribers = subscribers.filter(s => s.status === "active").length;
  const activePlans = plans.length;

  return {
    tier,
    commissionPercent,
    maxSubscribers,
    maxPlans,
    maxContacts,
    maxBroadcastsPerMonth,
    canCreateDrops: isStandard,
    canGateContent: isStandard,
    canAutoReminders: isStandard,
    subscriberCount: activeSubscribers,
    planCount: activePlans,
    isAtSubscriberLimit: isFree && activeSubscribers >= 25,
    isNearSubscriberLimit: isFree && activeSubscribers >= 20,
    isAtPlanLimit: isFree && activePlans >= 1,
    isFree,
    isStandard,
  };
}

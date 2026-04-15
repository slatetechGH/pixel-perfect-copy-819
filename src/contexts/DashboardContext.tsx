import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import {
  planToRow, rowToPlan, dropToRow, rowToDrop, contentToRow, rowToContent,
  subscriberToRow, rowToSubscriber, conversationToRow, rowToConversation,
  messageToRow, profileToSettings, settingsToProfile,
} from "@/lib/dashboard-helpers";

// ===== TYPES =====
export interface Plan {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  subscribers: number;
  isFree: boolean;
  benefits: string[];
  description: string;
  active: boolean;
  showOnPublicPage: boolean;
  subscriberLimit?: number;
  collectionsPerMonth: number;
}

export interface DropItem {
  name: string;
  quantity: string;
}

export interface Drop {
  id: string;
  title: string;
  description: string;
  status: "draft" | "scheduled" | "live" | "ended" | "sold_out";
  total: number;
  remaining: number;
  price: string;
  priceNum: number;
  revenue: string;
  endsIn: string;
  dropDate: string;
  dropTime: string;
  endDate: string;
  endTime: string;
  eligiblePlans: string[];
  items: DropItem[];
  notify: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  type: "Recipe" | "Update" | "Story" | "Tip";
  body: string;
  status: "published" | "draft";
  tier: string;
  views: number;
  date: string;
  ai: boolean;
  prepTime?: string;
  cookTime?: string;
  serves?: string;
  ingredients?: { quantity: string; name: string }[];
  methodSteps?: string[];
  eligiblePlans: string[];
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: "active" | "paused" | "cancelled" | "past_due";
  joined: string;
  revenue: string;
}

export interface Message {
  id: string;
  text: string;
  sender: "producer" | "subscriber";
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  plan: string;
  avatar: string;
  unread: boolean;
  messages: Message[];
}

export interface BusinessSettings {
  businessName: string;
  businessType: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  urlSlug: string;
  publicVisible: boolean;
  accentColor: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  notifications: {
    newSubscriber: boolean;
    cancellation: boolean;
    dropSoldOut: boolean;
    newMessage: boolean;
    weeklyRevenue: boolean;
  };
  currentPlan: string;
  currentPlanPrice: string;
  cardLast4: string;
  billingHistory: { date: string; amount: string; status: string; invoice: string }[];
  producerId: string;
  stripeConnectId: string | null;
  stripeConnectStatus: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface KPIData {
  mrr: string;
  mrrChange: string;
  totalSubs: string;
  subsChange: string;
  churn: string;
  churnChange: string;
  arpu: string;
  arpuChange: string;
  ltv: string;
  ltvChange: string;
  dropConversion: string;
  dropConversionChange: string;
  contentEngagement: string;
  contentEngagementChange: string;
}

export interface ActivityItem {
  id: number;
  type: "subscribe" | "drop" | "cancel" | "recipe";
  name: string;
  detail: string;
  time: string;
  link: string;
}

export interface SubscriberGrowthData {
  month: string;
  new: number;
  churned: number;
}

// ===== INITIAL / DEFAULT DATA =====
const defaultSettings: BusinessSettings = {
  businessName: "",
  businessType: "",
  description: "",
  email: "",
  phone: "",
  website: "",
  instagram: "",
  facebook: "",
  twitter: "",
  urlSlug: "",
  publicVisible: true,
  accentColor: "#1E293B",
  logoUrl: null,
  coverUrl: null,
  notifications: {
    newSubscriber: true,
    cancellation: true,
    dropSoldOut: true,
    newMessage: true,
    weeklyRevenue: true,
  },
  currentPlan: "Free",
  currentPlanPrice: "Free",
  cardLast4: "0000",
  billingHistory: [],
  producerId: "",
  stripeConnectId: null,
  stripeConnectStatus: "not_connected",
};

const emptyKPI: KPIData = {
  mrr: "£0", mrrChange: "+0%",
  totalSubs: "0", subsChange: "+0%",
  churn: "0%", churnChange: "+0%",
  arpu: "£0", arpuChange: "+0%",
  ltv: "£0", ltvChange: "+0%",
  dropConversion: "0%", dropConversionChange: "+0%",
  contentEngagement: "0", contentEngagementChange: "+0%",
};

// ===== MOCK DATA (for demo mode only) =====
const mockPlans: Plan[] = [
  {
    id: "mock-plan-1", name: "Free Tier", price: "Free", priceNum: 0, subscribers: 64, isFree: true,
    benefits: ["Weekly email newsletter", "Public recipe access", "Shop news & updates"],
    description: "Basic access for casual followers", active: true, showOnPublicPage: true, collectionsPerMonth: 0,
  },
  {
    id: "mock-plan-2", name: "The Standard Catch", price: "£15/mo", priceNum: 15, subscribers: 89, isFree: false,
    benefits: ["10% in-store discount", "Exclusive recipes", "Early product drop access", "Monthly catch report"],
    description: "Perfect for regular customers who want more", active: true, showOnPublicPage: true, collectionsPerMonth: 2,
  },
  {
    id: "mock-plan-3", name: "Chef's Catch Club", price: "£35/mo", priceNum: 35, subscribers: 34, isFree: false,
    benefits: ["15% in-store discount", "Monthly premium fish box", "All exclusive content", "Priority product drops", "Seasonal tasting events", "Direct line to fishmonger"],
    description: "The ultimate experience for seafood enthusiasts", active: true, showOnPublicPage: true, collectionsPerMonth: 4,
  },
];

const mockDrops: Drop[] = [
  {
    id: "mock-drop-1", title: "Weekend Smokehouse Selection", description: "Our signature smokehouse selection featuring the finest smoked fish.",
    status: "live", total: 25, remaining: 7, price: "£28.00", priceNum: 28, revenue: "£504", endsIn: "2 days",
    dropDate: "2026-03-16", dropTime: "09:00", endDate: "2026-03-20", endTime: "18:00",
    eligiblePlans: ["The Standard Catch", "Chef's Catch Club"],
    items: [{ name: "Hot smoked salmon", quantity: "200g" }, { name: "Smoked mackerel pâté", quantity: "150g" }, { name: "Smoked haddock", quantity: "2 fillets" }],
    notify: true,
  },
  {
    id: "mock-drop-2", title: "Oyster & Champagne Valentine's Box", description: "A luxurious Valentine's box with fresh Whitstable oysters and a bottle of champagne.",
    status: "ended", total: 25, remaining: 0, price: "£45.00", priceNum: 45, revenue: "£1,125", endsIn: "Ended",
    dropDate: "2026-02-12", dropTime: "09:00", endDate: "2026-02-14", endTime: "18:00",
    eligiblePlans: ["Chef's Catch Club"],
    items: [{ name: "Whitstable oysters", quantity: "12 pieces" }, { name: "Champagne", quantity: "1 bottle" }],
    notify: true,
  },
  {
    id: "mock-drop-3", title: "Spring Catch Taster", description: "A curated selection of the best spring catches from our boats.",
    status: "scheduled", total: 30, remaining: 30, price: "£22.00", priceNum: 22, revenue: "£0", endsIn: "Starts in 3 days",
    dropDate: "2026-03-21", dropTime: "09:00", endDate: "2026-03-25", endTime: "18:00",
    eligiblePlans: ["The Standard Catch", "Chef's Catch Club"],
    items: [{ name: "Sea bass fillet", quantity: "2 pieces" }, { name: "Lemon sole", quantity: "1 whole" }],
    notify: true,
  },
  {
    id: "mock-drop-4", title: "Friday Night Fish Supper", description: "Everything you need for a classic British fish supper at home.",
    status: "live", total: 20, remaining: 8, price: "£18.00", priceNum: 18, revenue: "£216", endsIn: "4 days",
    dropDate: "2026-03-14", dropTime: "09:00", endDate: "2026-03-22", endTime: "18:00",
    eligiblePlans: ["Free Tier", "The Standard Catch", "Chef's Catch Club"],
    items: [{ name: "Cod fillets", quantity: "4 pieces" }, { name: "Tartare sauce", quantity: "1 pot" }],
    notify: true,
  },
  {
    id: "mock-drop-5", title: "Sustainable Sourcing Sampler", description: "A selection of sustainably sourced fish from local day boats.",
    status: "draft", total: 15, remaining: 15, price: "£32.00", priceNum: 32, revenue: "£0", endsIn: "—",
    dropDate: "", dropTime: "", endDate: "", endTime: "",
    eligiblePlans: ["Chef's Catch Club"],
    items: [{ name: "Line-caught mackerel", quantity: "4 fillets" }, { name: "Hand-dived scallops", quantity: "6 pieces" }],
    notify: false,
  },
];

const mockContent: ContentItem[] = [
  {
    id: "mock-content-1", title: "Pan-Seared Sea Bass with Samphire & Lemon Butter", type: "Recipe",
    body: "A simple yet elegant dish that lets the quality of the fish shine through...",
    status: "published", tier: "Standard", views: 142, date: "12 Mar 2026", ai: false,
    prepTime: "10 mins", cookTime: "15 mins", serves: "2",
    ingredients: [{ quantity: "2", name: "sea bass fillets" }, { quantity: "100g", name: "samphire" }, { quantity: "50g", name: "butter" }, { quantity: "1", name: "lemon" }],
    methodSteps: ["Score the sea bass skin.", "Heat oil in a pan until smoking.", "Cook skin-side down for 3-4 minutes.", "Flip and cook for 2 more minutes.", "Serve with samphire and lemon butter."],
    eligiblePlans: ["The Standard Catch", "Chef's Catch Club"],
  },
  {
    id: "mock-content-2", title: "Classic Whitstable Fish Pie", type: "Recipe",
    body: "Our take on the British classic, using only the freshest catch from our boats...",
    status: "published", tier: "Free", views: 289, date: "8 Mar 2026", ai: false,
    prepTime: "20 mins", cookTime: "35 mins", serves: "4",
    ingredients: [{ quantity: "400g", name: "mixed white fish" }, { quantity: "200g", name: "smoked haddock" }, { quantity: "800g", name: "Maris Piper potatoes" }],
    methodSteps: ["Poach the fish in milk.", "Make the mash.", "Combine fish and sauce.", "Top with mash and bake at 200°C for 25 minutes."],
    eligiblePlans: ["Free Tier", "The Standard Catch", "Chef's Catch Club"],
  },
  {
    id: "mock-content-3", title: "Bank Holiday Opening Hours & New Season Crab", type: "Update",
    body: "Just a quick update to let you know our opening hours over the bank holiday weekend...",
    status: "published", tier: "Free", views: 198, date: "5 Mar 2026", ai: false,
    eligiblePlans: ["Free Tier", "The Standard Catch", "Chef's Catch Club"],
  },
  {
    id: "mock-content-4", title: "Why We Only Fish Sustainably: Our Story", type: "Story",
    body: "When we started The Harbour Fish Co. five years ago, we made a promise...",
    status: "draft", tier: "Free", views: 0, date: "—", ai: false,
    eligiblePlans: ["Free Tier", "The Standard Catch", "Chef's Catch Club"],
  },
];

const mockSubscribers: Subscriber[] = [
  { id: "mock-sub-1", name: "Sarah Mitchell", email: "sarah.mitchell@email.com", phone: "07700 900123", plan: "Chef's Catch Club", status: "active", joined: "12 Jan 2026", revenue: "£384" },
  { id: "mock-sub-2", name: "James Chen", email: "james.chen@email.com", phone: "07700 900456", plan: "The Standard Catch", status: "active", joined: "3 Feb 2026", revenue: "£120" },
  { id: "mock-sub-3", name: "Emma Davies", email: "emma.d@email.com", phone: "07700 900789", plan: "The Standard Catch", status: "cancelled", joined: "15 Nov 2025", revenue: "£195" },
  { id: "mock-sub-4", name: "Oliver Thompson", email: "oliver.t@email.com", phone: "07700 900234", plan: "Chef's Catch Club", status: "active", joined: "22 Dec 2025", revenue: "£310" },
  { id: "mock-sub-5", name: "Amelia Wright", email: "amelia@email.com", phone: "07700 900567", plan: "Free Tier", status: "active", joined: "8 Mar 2026", revenue: "£0" },
  { id: "mock-sub-6", name: "William Harris", email: "will.h@email.com", phone: "07700 900890", plan: "Chef's Catch Club", status: "active", joined: "1 Oct 2025", revenue: "£520" },
  { id: "mock-sub-7", name: "Isabelle Foster", email: "isabelle.f@email.com", phone: "07700 900345", plan: "The Standard Catch", status: "paused", joined: "14 Feb 2026", revenue: "£75" },
  { id: "mock-sub-8", name: "George Baker", email: "george.b@email.com", phone: "07700 900678", plan: "The Standard Catch", status: "active", joined: "20 Jan 2026", revenue: "£150" },
  { id: "mock-sub-9", name: "Charlotte Wilson", email: "charlotte.w@email.com", phone: "07700 900901", plan: "Chef's Catch Club", status: "active", joined: "5 Sep 2025", revenue: "£630" },
  { id: "mock-sub-10", name: "Henry Clark", email: "henry.c@email.com", phone: "07700 900112", plan: "The Standard Catch", status: "active", joined: "18 Nov 2025", revenue: "£240" },
  { id: "mock-sub-11", name: "Sophia Taylor", email: "sophia.t@email.com", phone: "07700 900223", plan: "Free Tier", status: "active", joined: "2 Mar 2026", revenue: "£0" },
  { id: "mock-sub-12", name: "Jack Robinson", email: "jack.r@email.com", phone: "07700 900334", plan: "The Standard Catch", status: "cancelled", joined: "10 Oct 2025", revenue: "£180" },
  { id: "mock-sub-13", name: "Mia Evans", email: "mia.e@email.com", phone: "07700 900445", plan: "Chef's Catch Club", status: "active", joined: "28 Nov 2025", revenue: "£455" },
  { id: "mock-sub-14", name: "Thomas White", email: "thomas.w@email.com", phone: "07700 900556", plan: "The Standard Catch", status: "active", joined: "7 Dec 2025", revenue: "£210" },
  { id: "mock-sub-15", name: "Emily Johnson", email: "emily.j@email.com", phone: "07700 900667", plan: "The Standard Catch", status: "paused", joined: "1 Jan 2026", revenue: "£105" },
  { id: "mock-sub-16", name: "Daniel Brown", email: "daniel.b@email.com", phone: "07700 900778", plan: "Free Tier", status: "active", joined: "15 Mar 2026", revenue: "£0" },
  { id: "mock-sub-17", name: "Lucy Martin", email: "lucy.m@email.com", phone: "07700 900889", plan: "Chef's Catch Club", status: "active", joined: "20 Aug 2025", revenue: "£735" },
  { id: "mock-sub-18", name: "Oscar Lee", email: "oscar.l@email.com", phone: "07700 900990", plan: "The Standard Catch", status: "active", joined: "4 Feb 2026", revenue: "£90" },
];

const mockConversations: Conversation[] = [
  {
    id: "mock-conv-1", name: "Sarah Mitchell", plan: "Chef's Catch Club", avatar: "SM", unread: true,
    messages: [
      { id: "1a", text: "Hi! Can you tell me about your delivery areas? I've just moved to Canterbury.", sender: "subscriber", time: "10:23 AM" },
      { id: "1b", text: "Hi Sarah! We deliver across Kent — Canterbury is well within our range. Orders placed before 2pm get next-day delivery.", sender: "producer", time: "10:45 AM" },
      { id: "1c", text: "That's brilliant, thank you! Can I also add extra oysters to my next box?", sender: "subscriber", time: "10:52 AM" },
    ],
  },
  {
    id: "mock-conv-2", name: "James Chen", plan: "The Standard Catch", avatar: "JC", unread: false,
    messages: [
      { id: "2a", text: "I loved the last fish box — the sea bass was amazing! Best I've ever had.", sender: "subscriber", time: "Yesterday" },
      { id: "2b", text: "Thanks James! That was line-caught from our Whitstable boats. Glad you enjoyed it!", sender: "producer", time: "Yesterday" },
    ],
  },
  {
    id: "mock-conv-3", name: "Oliver Thompson", plan: "Chef's Catch Club", avatar: "OT", unread: true,
    messages: [
      { id: "3a", text: "Is it possible to upgrade my plan? I'd love access to the tasting events.", sender: "subscriber", time: "2 hours ago" },
    ],
  },
  {
    id: "mock-conv-4", name: "Isabelle Foster", plan: "The Standard Catch", avatar: "IF", unread: false,
    messages: [
      { id: "4a", text: "Do you have any allergens in your smoked products? My daughter has a nut allergy.", sender: "subscriber", time: "Mar 15" },
      { id: "4b", text: "Great question — none of our smoked products contain nuts. We process in a nut-free facility. I'll attach our full allergen sheet.", sender: "producer", time: "Mar 15" },
      { id: "4c", text: "That's really reassuring, thank you so much!", sender: "subscriber", time: "Mar 15" },
    ],
  },
  {
    id: "mock-conv-5", name: "Charlotte Wilson", plan: "Chef's Catch Club", avatar: "CW", unread: false,
    messages: [
      { id: "5a", text: "Can I request a specific fish for next month's premium box? I'd love some monkfish.", sender: "subscriber", time: "Mar 12" },
      { id: "5b", text: "Absolutely Charlotte! I'll make a note. Monkfish season is just starting so the timing is perfect.", sender: "producer", time: "Mar 12" },
      { id: "5c", text: "Amazing! You're the best. Looking forward to it.", sender: "subscriber", time: "Mar 12" },
    ],
  },
  {
    id: "mock-conv-6", name: "Mia Evans", plan: "Chef's Catch Club", avatar: "ME", unread: false,
    messages: [
      { id: "6a", text: "Hi! I'm hosting a dinner party for 8 next Saturday. Can you put together a special selection?", sender: "subscriber", time: "Mar 10" },
      { id: "6b", text: "Of course! I'd suggest our party platter: whole sea bream, king prawns, and crab claws. I'll add it to your order.", sender: "producer", time: "Mar 10" },
    ],
  },
];

const mockSettings: BusinessSettings = {
  businessName: "The Harbour Fish Co.",
  businessType: "Fishmonger",
  description: "Premium sustainable fish, caught daily from the Kent coast. Delivered to your door or collected from our Whitstable shop.",
  email: "hello@harbourfishco.com",
  phone: "01227 770XXX",
  website: "harbourfishco.com",
  instagram: "@harbourfishco",
  facebook: "harbourfishco",
  twitter: "@harbourfishco",
  urlSlug: "harbour-fish-co",
  publicVisible: true,
  accentColor: "#1E293B",
  logoUrl: null,
  coverUrl: null,
  notifications: { newSubscriber: true, cancellation: true, dropSoldOut: true, newMessage: true, weeklyRevenue: true },
  currentPlan: "Growth",
  currentPlanPrice: "£79/mo",
  cardLast4: "4242",
  billingHistory: [
    { date: "1 Mar 2026", amount: "£79.00", status: "Paid", invoice: "INV-006" },
    { date: "1 Feb 2026", amount: "£79.00", status: "Paid", invoice: "INV-005" },
    { date: "1 Jan 2026", amount: "£79.00", status: "Paid", invoice: "INV-004" },
    { date: "1 Dec 2025", amount: "£79.00", status: "Paid", invoice: "INV-003" },
    { date: "1 Nov 2025", amount: "£79.00", status: "Paid", invoice: "INV-002" },
    { date: "1 Oct 2025", amount: "£29.00", status: "Paid", invoice: "INV-001" },
  ],
  producerId: "",
  stripeConnectId: null,
  stripeConnectStatus: "not_connected",
};

const mockKPI: KPIData = {
  mrr: "£4,850", mrrChange: "+15.5%",
  totalSubs: "187", subsChange: "+12.3%",
  churn: "3.2%", churnChange: "-0.8%",
  arpu: "£25.90", arpuChange: "+2.1%",
  ltv: "£186", ltvChange: "+8.2%",
  dropConversion: "72%", dropConversionChange: "+5.1%",
  contentEngagement: "3.2k", contentEngagementChange: "+22%",
};

const mockRevenueChart: RevenueData[] = [
  { month: "Sep", revenue: 800 }, { month: "Oct", revenue: 1200 }, { month: "Nov", revenue: 1800 },
  { month: "Dec", revenue: 2400 }, { month: "Jan", revenue: 3100 }, { month: "Feb", revenue: 3800 }, { month: "Mar", revenue: 4850 },
];

const mockSubscriberGrowth: SubscriberGrowthData[] = [
  { month: "Sep", new: 12, churned: 3 }, { month: "Oct", new: 18, churned: 4 },
  { month: "Nov", new: 22, churned: 5 }, { month: "Dec", new: 28, churned: 6 },
  { month: "Jan", new: 35, churned: 7 }, { month: "Feb", new: 30, churned: 5 },
  { month: "Mar", new: 38, churned: 6 },
];

const mockActivity: ActivityItem[] = [
  { id: 1, type: "subscribe", name: "Sarah Mitchell", detail: "Chef's Catch Club", time: "2 min ago", link: "/dashboard/subscribers" },
  { id: 2, type: "drop", name: "Weekend Smokehouse Selection", detail: "18/25 sold", time: "15 min ago", link: "/dashboard/drops" },
  { id: 3, type: "subscribe", name: "James Chen", detail: "The Standard Catch", time: "1 hr ago", link: "/dashboard/subscribers" },
  { id: 4, type: "cancel", name: "Emma Davies", detail: "The Standard Catch", time: "3 hr ago", link: "/dashboard/subscribers" },
  { id: 5, type: "subscribe", name: "Oliver Thompson", detail: "Chef's Catch Club", time: "5 hr ago", link: "/dashboard/subscribers" },
  { id: 6, type: "recipe", name: "Pan-Seared Sea Bass", detail: "142 views", time: "6 hr ago", link: "/dashboard/content" },
];

const mockRevenueDataSets: Record<string, RevenueData[]> = {
  "7d": [
    { month: "Mon", revenue: 680 }, { month: "Tue", revenue: 720 }, { month: "Wed", revenue: 690 },
    { month: "Thu", revenue: 810 }, { month: "Fri", revenue: 920 }, { month: "Sat", revenue: 1050 }, { month: "Sun", revenue: 780 },
  ],
  "30d": [
    { month: "W1", revenue: 1100 }, { month: "W2", revenue: 1250 }, { month: "W3", revenue: 1180 }, { month: "W4", revenue: 1320 },
  ],
  "3m": [
    { month: "Jan", revenue: 3600 }, { month: "Feb", revenue: 4200 }, { month: "Mar", revenue: 4850 },
  ],
  "6m": [
    { month: "Oct", revenue: 1800 }, { month: "Nov", revenue: 2400 }, { month: "Dec", revenue: 3100 },
    { month: "Jan", revenue: 3600 }, { month: "Feb", revenue: 4200 }, { month: "Mar", revenue: 4850 },
  ],
  "12m": [
    { month: "Apr", revenue: 0 }, { month: "May", revenue: 0 }, { month: "Jun", revenue: 0 },
    { month: "Jul", revenue: 0 }, { month: "Aug", revenue: 0 }, { month: "Sep", revenue: 800 },
    { month: "Oct", revenue: 1200 }, { month: "Nov", revenue: 1800 }, { month: "Dec", revenue: 2400 },
    { month: "Jan", revenue: 3100 }, { month: "Feb", revenue: 3800 }, { month: "Mar", revenue: 4850 },
  ],
  "all": [
    { month: "Sep", revenue: 800 }, { month: "Oct", revenue: 1200 }, { month: "Nov", revenue: 1800 },
    { month: "Dec", revenue: 2400 }, { month: "Jan", revenue: 3100 }, { month: "Feb", revenue: 3800 }, { month: "Mar", revenue: 4850 },
  ],
};

const mockTierBreakdown = [
  { name: "Free", value: 64, color: "hsl(213, 27%, 62%)" },
  { name: "Standard", value: 89, color: "hsl(217, 33%, 17%)" },
  { name: "Premium", value: 34, color: "hsl(38, 92%, 50%)" },
];

// ===== CONTEXT TYPE =====
interface DashboardContextType {
  // Data
  plans: Plan[];
  drops: Drop[];
  content: ContentItem[];
  subscribers: Subscriber[];
  conversations: Conversation[];
  settings: BusinessSettings;

  // CRUD mutations (auto-sync to Supabase in non-demo mode)
  savePlan: (plan: Plan) => Promise<void>;
  removePlan: (id: string) => Promise<void>;
  saveDrop: (drop: Drop) => Promise<void>;
  removeDrop: (id: string) => Promise<void>;
  saveContent: (item: ContentItem) => Promise<void>;
  removeContent: (id: string) => Promise<void>;
  saveSubscriber: (sub: Subscriber) => Promise<void>;
  updateSubscriber: (id: string, updates: Partial<Subscriber>) => Promise<void>;
  removeSubscriber: (id: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;
  saveSettings: () => Promise<void>;

  // Raw setters (for DemoSetup compatibility)
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  setDrops: React.Dispatch<React.SetStateAction<Drop[]>>;
  setContent: React.Dispatch<React.SetStateAction<ContentItem[]>>;
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;

  // Analytics (mock/computed)
  revenueDataSets: Record<string, RevenueData[]>;
  setRevenueDataSets: React.Dispatch<React.SetStateAction<Record<string, RevenueData[]>>>;
  kpiData: KPIData;
  setKpiData: React.Dispatch<React.SetStateAction<KPIData>>;
  revenueChartData: RevenueData[];
  setRevenueChartData: React.Dispatch<React.SetStateAction<RevenueData[]>>;
  subscriberGrowthData: SubscriberGrowthData[];
  setSubscriberGrowthData: React.Dispatch<React.SetStateAction<SubscriberGrowthData[]>>;
  activityFeed: ActivityItem[];
  setActivityFeed: React.Dispatch<React.SetStateAction<ActivityItem[]>>;
  tierBreakdown: { name: string; value: number; color: string }[];
  setTierBreakdown: React.Dispatch<React.SetStateAction<{ name: string; value: number; color: string }[]>>;

  // Utility
  loading: boolean;
  resetToDefaults: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

// ===== PROVIDER =====
export function DashboardProvider({ children }: { children: ReactNode }) {
  const { session, demoActive } = useApp();
  const producerId = session.supabaseUser?.id;

  // Core data state — empty for real users, populated from Supabase
  const [plans, setPlans] = useState<Plan[]>([]);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);

  // Analytics state
  const [revenueDataSets, setRevenueDataSets] = useState<Record<string, RevenueData[]>>({});
  const [kpiData, setKpiData] = useState<KPIData>(emptyKPI);
  const [revenueChartData, setRevenueChartData] = useState<RevenueData[]>([]);
  const [subscriberGrowthData, setSubscriberGrowthData] = useState<SubscriberGrowthData[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [tierBreakdown, setTierBreakdown] = useState<{ name: string; value: number; color: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  // ===== FETCH FROM SUPABASE =====
  useEffect(() => {
    if (demoActive || !producerId) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [plansRes, dropsRes, contentRes, subsRes, convosRes, profileRes] = await Promise.all([
          supabase.from("plans").select("*").eq("producer_id", producerId),
          supabase.from("drops").select("*").eq("producer_id", producerId),
          supabase.from("content").select("*").eq("producer_id", producerId),
          supabase.from("subscribers").select("*").eq("producer_id", producerId),
          supabase.from("conversations").select("*, messages(*)").eq("producer_id", producerId),
          supabase.from("profiles").select("*").eq("id", producerId).single(),
        ]);

        // Count subscribers per plan
        const subs = (subsRes.data || []).map(rowToSubscriber);
        const fetchedDrops = (dropsRes.data || []).map(rowToDrop);
        const fetchedContent = (contentRes.data || []).map(rowToContent);
        const planSubCounts: Record<string, number> = {};
        subs.filter(s => s.status === "active").forEach(s => {
          planSubCounts[s.plan] = (planSubCounts[s.plan] || 0) + 1;
        });

        const fetchedPlans = (plansRes.data || []).map(row => ({
          ...rowToPlan(row),
          subscribers: planSubCounts[row.name] || 0,
        }));

        setPlans(fetchedPlans);
        setDrops(fetchedDrops);
        setContent(fetchedContent);
        setSubscribers(subs);
        setConversations((convosRes.data || []).map(rowToConversation));

        // Map profile to settings
        if (profileRes.data) {
          setSettings(prev => ({
            ...profileToSettings(profileRes.data, prev),
            currentPlan: profileRes.data.plan || prev.currentPlan,
          }));
        }

        // Compute KPIs from real data
        const activeSubs = subs.filter(s => s.status === "active");
        const mrr = activeSubs.reduce((sum, s) => {
          const plan = fetchedPlans.find(p => p.name === s.plan);
          return sum + (plan?.priceNum || 0);
        }, 0);

        // LTV: sum of all subscriber revenue
        const totalRevenue = subs.reduce((sum, s) => {
          const num = parseFloat(s.revenue.replace(/[^0-9.]/g, '')) || 0;
          return sum + num;
        }, 0);
        const ltv = activeSubs.length > 0 ? totalRevenue / activeSubs.length : 0;

        // Drop conversion: sold / total across all non-draft drops
        const nonDraftDrops = fetchedDrops.filter(d => d.status !== "draft");
        const totalDropQty = nonDraftDrops.reduce((s, d) => s + d.total, 0);
        const soldDropQty = nonDraftDrops.reduce((s, d) => s + (d.total - d.remaining), 0);
        const dropConversion = totalDropQty > 0 ? Math.round((soldDropQty / totalDropQty) * 100) : 0;

        // Content engagement: sum of views
        const totalViews = fetchedContent.reduce((s, c) => s + (c.views || 0), 0);
        const engagementStr = totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : String(totalViews);

        setKpiData({
          mrr: `£${mrr.toLocaleString()}`,
          mrrChange: "+0%",
          totalSubs: String(activeSubs.length),
          subsChange: "+0%",
          churn: "0%",
          churnChange: "+0%",
          arpu: activeSubs.length > 0 ? `£${(mrr / activeSubs.length).toFixed(2)}` : "£0",
          arpuChange: "+0%",
          ltv: `£${Math.round(ltv).toLocaleString()}`,
          ltvChange: "+0%",
          dropConversion: `${dropConversion}%`,
          dropConversionChange: "+0%",
          contentEngagement: engagementStr,
          contentEngagementChange: "+0%",
        });

        // Compute tier breakdown from real plans
        const pieColors = ["hsl(213, 27%, 62%)", "hsl(217, 33%, 17%)", "hsl(38, 92%, 50%)", "hsl(280, 60%, 50%)", "hsl(160, 60%, 40%)"];
        if (fetchedPlans.length > 0) {
          setTierBreakdown(fetchedPlans.map((p, i) => ({
            name: p.name,
            value: p.subscribers,
            color: pieColors[i % pieColors.length],
          })));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [producerId, demoActive]);

  // Reset fetch ref when user changes or demo deactivates
  useEffect(() => {
    fetchedRef.current = false;
  }, [producerId, demoActive]);

  // ===== CRUD MUTATIONS =====
  const savePlan = useCallback(async (plan: Plan) => {
    const isNew = !plans.some(p => p.id === plan.id);
    
    setPlans(prev => {
      const exists = prev.some(p => p.id === plan.id);
      return exists ? prev.map(p => p.id === plan.id ? plan : p) : [...prev, plan];
    });

    if (demoActive) return;

    try {
      if (isNew) {
        const { error } = await supabase.rpc('create_plan', {
          p_name: plan.name,
          p_price_num: plan.priceNum,
          p_is_free: plan.isFree,
          p_benefits: plan.benefits.filter(b => b.trim() !== ''),
          p_description: plan.description || '',
          p_show_on_public_page: plan.showOnPublicPage,
          p_collections_per_month: plan.collectionsPerMonth || 0,
        });
        if (error) {
          console.error("create_plan RPC error:", error.message);
          toast.error("Failed to save plan: " + error.message);
        } else {
          toast.success("Plan saved!");
        }
      } else {
        const { error } = await supabase.rpc('update_plan', {
          p_id: plan.id,
          p_name: plan.name,
          p_price_num: plan.priceNum,
          p_is_free: plan.isFree,
          p_benefits: plan.benefits.filter(b => b.trim() !== ''),
          p_description: plan.description || '',
          p_show_on_public_page: plan.showOnPublicPage,
          p_collections_per_month: plan.collectionsPerMonth || 0,
        });
        if (error) {
          console.error("update_plan RPC error:", error.message);
          toast.error("Failed to update plan: " + error.message);
        } else {
          toast.success("Plan updated!");
        }
      }
    } catch (err: any) {
      console.error("savePlan exception:", err);
      toast.error("Failed to save plan.");
    }
  }, [demoActive, plans]);

  const removePlan = useCallback(async (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    if (demoActive) return;
    try {
      const { error } = await supabase.rpc('delete_plan', { p_id: id });
      if (error) {
        console.error("delete_plan RPC error:", error.message);
        toast.error("Failed to delete plan: " + error.message);
      } else {
        toast.success("Plan deleted!");
      }
    } catch (err: any) {
      console.error("removePlan exception:", err);
    }
  }, [demoActive]);

  const saveDrop = useCallback(async (drop: Drop) => {
    setDrops(prev => {
      const exists = prev.some(d => d.id === drop.id);
      return exists ? prev.map(d => d.id === drop.id ? drop : d) : [...prev, drop];
    });
    if (demoActive) return;
    const pid = producerId || session.supabaseUser?.id;
    if (!pid) { toast.error("Unable to save — please refresh the page."); return; }
    try {
      const { error } = await supabase.from("drops").upsert(dropToRow(drop, pid) as any);
      if (error) { console.error("saveDrop failed:", error.message); toast.error("Failed to save: " + error.message); }
    } catch (err: any) { console.error("saveDrop exception:", err); toast.error("Failed to save. Please try again."); }
  }, [demoActive, producerId, session.supabaseUser?.id]);

  const removeDrop = useCallback(async (id: string) => {
    setDrops(prev => prev.filter(d => d.id !== id));
    if (demoActive) return;
    const pid = producerId || session.supabaseUser?.id;
    if (!pid) return;
    try {
      const { error } = await supabase.from("drops").delete().eq("id", id);
      if (error) { console.error("removeDrop failed:", error.message); toast.error("Failed to delete: " + error.message); }
    } catch (err: any) { console.error("removeDrop exception:", err); }
  }, [demoActive, producerId, session.supabaseUser?.id]);

  const saveContent = useCallback(async (item: ContentItem) => {
    setContent(prev => {
      const exists = prev.some(c => c.id === item.id);
      return exists ? prev.map(c => c.id === item.id ? item : c) : [...prev, item];
    });
    if (demoActive) return;
    const pid = producerId || session.supabaseUser?.id;
    if (!pid) { toast.error("Unable to save — please refresh the page."); return; }
    try {
      const { error } = await supabase.from("content").upsert(contentToRow(item, pid) as any);
      if (error) { console.error("saveContent failed:", error.message); toast.error("Failed to save: " + error.message); }
    } catch (err: any) { console.error("saveContent exception:", err); toast.error("Failed to save. Please try again."); }
  }, [demoActive, producerId, session.supabaseUser?.id]);

  const removeContent = useCallback(async (id: string) => {
    setContent(prev => prev.filter(c => c.id !== id));
    if (demoActive) return;
    const pid = producerId || session.supabaseUser?.id;
    if (!pid) return;
    try {
      const { error } = await supabase.from("content").delete().eq("id", id);
      if (error) { console.error("removeContent failed:", error.message); toast.error("Failed to delete: " + error.message); }
    } catch (err: any) { console.error("removeContent exception:", err); }
  }, [demoActive, producerId, session.supabaseUser?.id]);

  const saveSubscriber = useCallback(async (sub: Subscriber) => {
    setSubscribers(prev => {
      const exists = prev.some(s => s.id === sub.id);
      return exists ? prev.map(s => s.id === sub.id ? sub : s) : [...prev, sub];
    });
    if (demoActive) return;
    const pid = producerId || session.supabaseUser?.id;
    if (!pid) { toast.error("Unable to save — please refresh the page."); return; }
    try {
      const { error } = await supabase.from("subscribers").upsert(subscriberToRow(sub, pid) as any);
      if (error) { console.error("saveSubscriber failed:", error.message); toast.error("Failed to save: " + error.message); }
    } catch (err: any) { console.error("saveSubscriber exception:", err); toast.error("Failed to save. Please try again."); }
  }, [demoActive, producerId, session.supabaseUser?.id]);

  const updateSubscriber = useCallback(async (id: string, updates: Partial<Subscriber>) => {
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    if (demoActive) return;
    const pid = producerId || session.supabaseUser?.id;
    if (!pid) return;
    const sub = subscribers.find(s => s.id === id);
    if (sub) {
      const updated = { ...sub, ...updates };
      await supabase.from("subscribers").upsert(subscriberToRow(updated, pid) as any);
    }
  }, [demoActive, producerId, session.supabaseUser?.id, subscribers]);

  const removeSubscriber = useCallback(async (id: string) => {
    setSubscribers(prev => prev.filter(s => s.id !== id));
    if (demoActive) return;
    const pid = producerId || session.supabaseUser?.id;
    if (!pid) return;
    await supabase.from("subscribers").delete().eq("id", id);
  }, [demoActive, producerId, session.supabaseUser?.id]);

  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    const msg: Message = { id: crypto.randomUUID(), text: text.trim(), sender: "producer", time: "Just now" };
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, messages: [...c.messages, msg] } : c
    ));
    if (demoActive) return;
    const pid = producerId || session.supabaseUser?.id;
    if (!pid) return;
    await supabase.from("messages").insert(messageToRow(msg, conversationId) as any);
  }, [demoActive, producerId, session.supabaseUser?.id]);

  const markRead = useCallback(async (conversationId: string) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, unread: false } : c
    ));
    if (demoActive) return;
    const pid = producerId || session.supabaseUser?.id;
    if (!pid) return;
    await supabase.from("conversations").update({ unread: false } as any).eq("id", conversationId);
  }, [demoActive, producerId, session.supabaseUser?.id]);

  const saveSettingsFn = useCallback(async () => {
    if (demoActive) return;
    const pid = producerId || session.supabaseUser?.id;
    if (!pid) {
      toast.error("Failed to save settings — please refresh and try again");
      return;
    }
    const { error } = await supabase.from("profiles").update(settingsToProfile(settings) as any).eq("id", pid);
    if (error) {
      console.error("Failed to save settings:", error.message);
      toast.error("Failed to save settings: " + error.message);
    } else {
      toast.success("Settings saved!");
    }
  }, [demoActive, producerId, session.supabaseUser?.id, settings]);

  // ===== RESET TO DEFAULTS (demo mode) =====
  const resetToDefaults = useCallback(() => {
    setPlans(mockPlans);
    setDrops(mockDrops);
    setContent(mockContent);
    setSubscribers(mockSubscribers);
    setConversations(mockConversations);
    setSettings(mockSettings);
    setRevenueDataSets(mockRevenueDataSets);
    setKpiData(mockKPI);
    setRevenueChartData(mockRevenueChart);
    setSubscriberGrowthData(mockSubscriberGrowth);
    setActivityFeed(mockActivity);
    setTierBreakdown(mockTierBreakdown);
  }, []);

  return (
    <DashboardContext.Provider value={{
      plans, drops, content, subscribers, conversations, settings,
      savePlan, removePlan, saveDrop, removeDrop,
      saveContent, removeContent,
      saveSubscriber, updateSubscriber, removeSubscriber,
      sendMessage, markRead, saveSettings: saveSettingsFn,
      setPlans, setDrops, setContent, setSubscribers, setConversations, setSettings,
      revenueDataSets, setRevenueDataSets,
      kpiData, setKpiData,
      revenueChartData, setRevenueChartData,
      subscriberGrowthData, setSubscriberGrowthData,
      activityFeed, setActivityFeed,
      tierBreakdown, setTierBreakdown,
      loading, resetToDefaults,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

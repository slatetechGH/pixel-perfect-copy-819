import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

// ===== TYPES =====
export interface Plan {
  id: number;
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
}

export interface DropItem {
  name: string;
  quantity: string;
}

export interface Drop {
  id: number;
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
  id: number;
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
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: "active" | "paused" | "cancelled";
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
  id: number;
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

// ===== INITIAL DATA =====
const initialPlans: Plan[] = [
  {
    id: 1, name: "Free Tier", price: "Free", priceNum: 0, subscribers: 64, isFree: true,
    benefits: ["Weekly email newsletter", "Public recipe access", "Shop news & updates"],
    description: "Basic access for casual followers", active: true, showOnPublicPage: true,
  },
  {
    id: 2, name: "The Standard Catch", price: "£15/mo", priceNum: 15, subscribers: 89, isFree: false,
    benefits: ["10% in-store discount", "Exclusive recipes", "Early product drop access", "Monthly catch report"],
    description: "Perfect for regular customers who want more", active: true, showOnPublicPage: true,
  },
  {
    id: 3, name: "Chef's Catch Club", price: "£35/mo", priceNum: 35, subscribers: 34, isFree: false,
    benefits: ["15% in-store discount", "Monthly premium fish box", "All exclusive content", "Priority product drops", "Seasonal tasting events", "Direct line to fishmonger"],
    description: "The ultimate experience for seafood enthusiasts", active: true, showOnPublicPage: true,
  },
];

const initialDrops: Drop[] = [
  {
    id: 1, title: "Weekend Smokehouse Selection", description: "Our signature smokehouse selection featuring the finest smoked fish.",
    status: "live", total: 25, remaining: 7, price: "£28.00", priceNum: 28, revenue: "£504", endsIn: "2 days",
    dropDate: "2026-03-16", dropTime: "09:00", endDate: "2026-03-20", endTime: "18:00",
    eligiblePlans: ["The Standard Catch", "Chef's Catch Club"],
    items: [{ name: "Hot smoked salmon", quantity: "200g" }, { name: "Smoked mackerel pâté", quantity: "150g" }, { name: "Smoked haddock", quantity: "2 fillets" }],
    notify: true,
  },
  {
    id: 2, title: "Oyster & Champagne Valentine's Box", description: "A luxurious Valentine's box with fresh Whitstable oysters and a bottle of champagne.",
    status: "ended", total: 25, remaining: 0, price: "£45.00", priceNum: 45, revenue: "£1,125", endsIn: "Ended",
    dropDate: "2026-02-12", dropTime: "09:00", endDate: "2026-02-14", endTime: "18:00",
    eligiblePlans: ["Chef's Catch Club"],
    items: [{ name: "Whitstable oysters", quantity: "12 pieces" }, { name: "Champagne", quantity: "1 bottle" }],
    notify: true,
  },
  {
    id: 3, title: "Spring Catch Taster", description: "A curated selection of the best spring catches from our boats.",
    status: "scheduled", total: 30, remaining: 30, price: "£22.00", priceNum: 22, revenue: "£0", endsIn: "Starts in 3 days",
    dropDate: "2026-03-21", dropTime: "09:00", endDate: "2026-03-25", endTime: "18:00",
    eligiblePlans: ["The Standard Catch", "Chef's Catch Club"],
    items: [{ name: "Sea bass fillet", quantity: "2 pieces" }, { name: "Lemon sole", quantity: "1 whole" }],
    notify: true,
  },
  {
    id: 4, title: "Friday Night Fish Supper", description: "Everything you need for a classic British fish supper at home.",
    status: "live", total: 20, remaining: 8, price: "£18.00", priceNum: 18, revenue: "£216", endsIn: "4 days",
    dropDate: "2026-03-14", dropTime: "09:00", endDate: "2026-03-22", endTime: "18:00",
    eligiblePlans: ["Free Tier", "The Standard Catch", "Chef's Catch Club"],
    items: [{ name: "Cod fillets", quantity: "4 pieces" }, { name: "Tartare sauce", quantity: "1 pot" }],
    notify: true,
  },
  {
    id: 5, title: "Sustainable Sourcing Sampler", description: "A selection of sustainably sourced fish from local day boats.",
    status: "draft", total: 15, remaining: 15, price: "£32.00", priceNum: 32, revenue: "£0", endsIn: "—",
    dropDate: "", dropTime: "", endDate: "", endTime: "",
    eligiblePlans: ["Chef's Catch Club"],
    items: [{ name: "Line-caught mackerel", quantity: "4 fillets" }, { name: "Hand-dived scallops", quantity: "6 pieces" }],
    notify: false,
  },
];

const initialContent: ContentItem[] = [
  {
    id: 1, title: "Pan-Seared Sea Bass with Samphire & Lemon Butter", type: "Recipe",
    body: "A simple yet elegant dish that lets the quality of the fish shine through...",
    status: "published", tier: "Standard", views: 142, date: "12 Mar 2026", ai: false,
    prepTime: "10 mins", cookTime: "15 mins", serves: "2",
    ingredients: [{ quantity: "2", name: "sea bass fillets" }, { quantity: "100g", name: "samphire" }, { quantity: "50g", name: "butter" }, { quantity: "1", name: "lemon" }],
    methodSteps: ["Score the sea bass skin.", "Heat oil in a pan until smoking.", "Cook skin-side down for 3-4 minutes.", "Flip and cook for 2 more minutes.", "Serve with samphire and lemon butter."],
    eligiblePlans: ["The Standard Catch", "Chef's Catch Club"],
  },
  {
    id: 2, title: "Classic Whitstable Fish Pie", type: "Recipe",
    body: "Our take on the British classic, using only the freshest catch from our boats...",
    status: "published", tier: "Free", views: 289, date: "8 Mar 2026", ai: false,
    prepTime: "20 mins", cookTime: "35 mins", serves: "4",
    ingredients: [{ quantity: "400g", name: "mixed white fish" }, { quantity: "200g", name: "smoked haddock" }, { quantity: "800g", name: "Maris Piper potatoes" }],
    methodSteps: ["Poach the fish in milk.", "Make the mash.", "Combine fish and sauce.", "Top with mash and bake at 200°C for 25 minutes."],
    eligiblePlans: ["Free Tier", "The Standard Catch", "Chef's Catch Club"],
  },
  {
    id: 3, title: "Bank Holiday Opening Hours & New Season Crab", type: "Update",
    body: "Just a quick update to let you know our opening hours over the bank holiday weekend...",
    status: "published", tier: "Free", views: 198, date: "5 Mar 2026", ai: false,
    eligiblePlans: ["Free Tier", "The Standard Catch", "Chef's Catch Club"],
  },
  {
    id: 4, title: "Why We Only Fish Sustainably: Our Story", type: "Story",
    body: "When we started The Harbour Fish Co. five years ago, we made a promise...",
    status: "draft", tier: "Free", views: 0, date: "—", ai: false,
    eligiblePlans: ["Free Tier", "The Standard Catch", "Chef's Catch Club"],
  },
];

const initialSubscribers: Subscriber[] = [
  { id: 1, name: "Sarah Mitchell", email: "sarah.mitchell@email.com", phone: "07700 900123", plan: "Chef's Catch Club", status: "active", joined: "12 Jan 2026", revenue: "£384" },
  { id: 2, name: "James Chen", email: "james.chen@email.com", phone: "07700 900456", plan: "The Standard Catch", status: "active", joined: "3 Feb 2026", revenue: "£120" },
  { id: 3, name: "Emma Davies", email: "emma.d@email.com", phone: "07700 900789", plan: "The Standard Catch", status: "cancelled", joined: "15 Nov 2025", revenue: "£195" },
  { id: 4, name: "Oliver Thompson", email: "oliver.t@email.com", phone: "07700 900234", plan: "Chef's Catch Club", status: "active", joined: "22 Dec 2025", revenue: "£310" },
  { id: 5, name: "Amelia Wright", email: "amelia@email.com", phone: "07700 900567", plan: "Free Tier", status: "active", joined: "8 Mar 2026", revenue: "£0" },
  { id: 6, name: "William Harris", email: "will.h@email.com", phone: "07700 900890", plan: "Chef's Catch Club", status: "active", joined: "1 Oct 2025", revenue: "£520" },
  { id: 7, name: "Isabelle Foster", email: "isabelle.f@email.com", phone: "07700 900345", plan: "The Standard Catch", status: "paused", joined: "14 Feb 2026", revenue: "£75" },
  { id: 8, name: "George Baker", email: "george.b@email.com", phone: "07700 900678", plan: "The Standard Catch", status: "active", joined: "20 Jan 2026", revenue: "£150" },
  { id: 9, name: "Charlotte Wilson", email: "charlotte.w@email.com", phone: "07700 900901", plan: "Chef's Catch Club", status: "active", joined: "5 Sep 2025", revenue: "£630" },
  { id: 10, name: "Henry Clark", email: "henry.c@email.com", phone: "07700 900112", plan: "The Standard Catch", status: "active", joined: "18 Nov 2025", revenue: "£240" },
  { id: 11, name: "Sophia Taylor", email: "sophia.t@email.com", phone: "07700 900223", plan: "Free Tier", status: "active", joined: "2 Mar 2026", revenue: "£0" },
  { id: 12, name: "Jack Robinson", email: "jack.r@email.com", phone: "07700 900334", plan: "The Standard Catch", status: "cancelled", joined: "10 Oct 2025", revenue: "£180" },
  { id: 13, name: "Mia Evans", email: "mia.e@email.com", phone: "07700 900445", plan: "Chef's Catch Club", status: "active", joined: "28 Nov 2025", revenue: "£455" },
  { id: 14, name: "Thomas White", email: "thomas.w@email.com", phone: "07700 900556", plan: "The Standard Catch", status: "active", joined: "7 Dec 2025", revenue: "£210" },
  { id: 15, name: "Emily Johnson", email: "emily.j@email.com", phone: "07700 900667", plan: "The Standard Catch", status: "paused", joined: "1 Jan 2026", revenue: "£105" },
  { id: 16, name: "Daniel Brown", email: "daniel.b@email.com", phone: "07700 900778", plan: "Free Tier", status: "active", joined: "15 Mar 2026", revenue: "£0" },
  { id: 17, name: "Lucy Martin", email: "lucy.m@email.com", phone: "07700 900889", plan: "Chef's Catch Club", status: "active", joined: "20 Aug 2025", revenue: "£735" },
  { id: 18, name: "Oscar Lee", email: "oscar.l@email.com", phone: "07700 900990", plan: "The Standard Catch", status: "active", joined: "4 Feb 2026", revenue: "£90" },
];

const initialConversations: Conversation[] = [
  {
    id: 1, name: "Sarah Mitchell", plan: "Chef's Catch Club", avatar: "SM", unread: true,
    messages: [
      { id: "1a", text: "Hi! Can you tell me about your delivery areas? I've just moved to Canterbury.", sender: "subscriber", time: "10:23 AM" },
      { id: "1b", text: "Hi Sarah! We deliver across Kent — Canterbury is well within our range. Orders placed before 2pm get next-day delivery.", sender: "producer", time: "10:45 AM" },
      { id: "1c", text: "That's brilliant, thank you! Can I also add extra oysters to my next box?", sender: "subscriber", time: "10:52 AM" },
    ],
  },
  {
    id: 2, name: "James Chen", plan: "The Standard Catch", avatar: "JC", unread: false,
    messages: [
      { id: "2a", text: "I loved the last fish box — the sea bass was amazing! Best I've ever had.", sender: "subscriber", time: "Yesterday" },
      { id: "2b", text: "Thanks James! That was line-caught from our Whitstable boats. Glad you enjoyed it!", sender: "producer", time: "Yesterday" },
    ],
  },
  {
    id: 3, name: "Oliver Thompson", plan: "Chef's Catch Club", avatar: "OT", unread: true,
    messages: [
      { id: "3a", text: "Is it possible to upgrade my plan? I'd love access to the tasting events.", sender: "subscriber", time: "2 hours ago" },
    ],
  },
  {
    id: 4, name: "Isabelle Foster", plan: "The Standard Catch", avatar: "IF", unread: false,
    messages: [
      { id: "4a", text: "Do you have any allergens in your smoked products? My daughter has a nut allergy.", sender: "subscriber", time: "Mar 15" },
      { id: "4b", text: "Great question — none of our smoked products contain nuts. We process in a nut-free facility. I'll attach our full allergen sheet.", sender: "producer", time: "Mar 15" },
      { id: "4c", text: "That's really reassuring, thank you so much!", sender: "subscriber", time: "Mar 15" },
    ],
  },
  {
    id: 5, name: "Charlotte Wilson", plan: "Chef's Catch Club", avatar: "CW", unread: false,
    messages: [
      { id: "5a", text: "Can I request a specific fish for next month's premium box? I'd love some monkfish.", sender: "subscriber", time: "Mar 12" },
      { id: "5b", text: "Absolutely Charlotte! I'll make a note. Monkfish season is just starting so the timing is perfect.", sender: "producer", time: "Mar 12" },
      { id: "5c", text: "Amazing! You're the best. Looking forward to it.", sender: "subscriber", time: "Mar 12" },
    ],
  },
  {
    id: 6, name: "Mia Evans", plan: "Chef's Catch Club", avatar: "ME", unread: false,
    messages: [
      { id: "6a", text: "Hi! I'm hosting a dinner party for 8 next Saturday. Can you put together a special selection?", sender: "subscriber", time: "Mar 10" },
      { id: "6b", text: "Of course! I'd suggest our party platter: whole sea bream, king prawns, and crab claws. I'll add it to your order.", sender: "producer", time: "Mar 10" },
    ],
  },
];

const initialSettings: BusinessSettings = {
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
  notifications: {
    newSubscriber: true,
    cancellation: true,
    dropSoldOut: true,
    newMessage: true,
    weeklyRevenue: true,
  },
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
};

const initialKPI: KPIData = {
  mrr: "£4,850", mrrChange: "+15.5%",
  totalSubs: "187", subsChange: "+12.3%",
  churn: "3.2%", churnChange: "-0.8%",
  arpu: "£25.90", arpuChange: "+2.1%",
};

const initialRevenueChart: RevenueData[] = [
  { month: "Sep", revenue: 800 }, { month: "Oct", revenue: 1200 }, { month: "Nov", revenue: 1800 },
  { month: "Dec", revenue: 2400 }, { month: "Jan", revenue: 3100 }, { month: "Feb", revenue: 3800 }, { month: "Mar", revenue: 4850 },
];

const initialSubscriberGrowth: SubscriberGrowthData[] = [
  { month: "Sep", new: 12, churned: 3 }, { month: "Oct", new: 18, churned: 4 },
  { month: "Nov", new: 22, churned: 5 }, { month: "Dec", new: 28, churned: 6 },
  { month: "Jan", new: 35, churned: 7 }, { month: "Feb", new: 30, churned: 5 },
  { month: "Mar", new: 38, churned: 6 },
];

const initialActivity: ActivityItem[] = [
  { id: 1, type: "subscribe", name: "Sarah Mitchell", detail: "Chef's Catch Club", time: "2 min ago", link: "/dashboard/subscribers" },
  { id: 2, type: "drop", name: "Weekend Smokehouse Selection", detail: "18/25 sold", time: "15 min ago", link: "/dashboard/drops" },
  { id: 3, type: "subscribe", name: "James Chen", detail: "The Standard Catch", time: "1 hr ago", link: "/dashboard/subscribers" },
  { id: 4, type: "cancel", name: "Emma Davies", detail: "The Standard Catch", time: "3 hr ago", link: "/dashboard/subscribers" },
  { id: 5, type: "subscribe", name: "Oliver Thompson", detail: "Chef's Catch Club", time: "5 hr ago", link: "/dashboard/subscribers" },
  { id: 6, type: "recipe", name: "Pan-Seared Sea Bass", detail: "142 views", time: "6 hr ago", link: "/dashboard/content" },
];

const initialRevenueDataSets: Record<string, RevenueData[]> = {
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

const initialTierBreakdown = [
  { name: "Free", value: 64, color: "hsl(213, 27%, 62%)" },
  { name: "Standard", value: 89, color: "hsl(217, 33%, 17%)" },
  { name: "Premium", value: 34, color: "hsl(38, 92%, 50%)" },
];

// ===== CONTEXT =====
interface DashboardContextType {
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  drops: Drop[];
  setDrops: React.Dispatch<React.SetStateAction<Drop[]>>;
  content: ContentItem[];
  setContent: React.Dispatch<React.SetStateAction<ContentItem[]>>;
  subscribers: Subscriber[];
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
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
  resetToDefaults: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [drops, setDrops] = useState<Drop[]>(initialDrops);
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
  const [revenueDataSets, setRevenueDataSets] = useState<Record<string, RevenueData[]>>(initialRevenueDataSets);
  const [kpiData, setKpiData] = useState<KPIData>(initialKPI);
  const [revenueChartData, setRevenueChartData] = useState<RevenueData[]>(initialRevenueChart);
  const [subscriberGrowthData, setSubscriberGrowthData] = useState<SubscriberGrowthData[]>(initialSubscriberGrowth);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(initialActivity);
  const [tierBreakdown, setTierBreakdown] = useState(initialTierBreakdown);

  const resetToDefaults = useCallback(() => {
    setPlans(initialPlans);
    setDrops(initialDrops);
    setContent(initialContent);
    setSubscribers(initialSubscribers);
    setConversations(initialConversations);
    setSettings(initialSettings);
    setRevenueDataSets(initialRevenueDataSets);
    setKpiData(initialKPI);
    setRevenueChartData(initialRevenueChart);
    setSubscriberGrowthData(initialSubscriberGrowth);
    setActivityFeed(initialActivity);
    setTierBreakdown(initialTierBreakdown);
  }, []);

  return (
    <DashboardContext.Provider value={{
      plans, setPlans, drops, setDrops, content, setContent,
      subscribers, setSubscribers, conversations, setConversations,
      settings, setSettings, revenueDataSets, setRevenueDataSets,
      kpiData, setKpiData, revenueChartData, setRevenueChartData,
      subscriberGrowthData, setSubscriberGrowthData,
      activityFeed, setActivityFeed, tierBreakdown, setTierBreakdown,
      resetToDefaults,
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

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp, DemoPlan, DemoDrop, DemoContent, DemoProfile } from "@/contexts/AppContext";
import { type Conversation, type Message } from "@/contexts/DashboardContext";
import { toast } from "sonner";
import {
  Beef, CakeSlice, Fish, Milk, Tractor, Beer, X, Plus, Loader2, Save, RotateCcw, Rocket, UserPlus,
} from "lucide-react";
import SlateLogo from "@/components/SlateLogo";
import { AssignToProducerModal } from "@/components/AssignToProducerModal";

const DEFAULT_ACCENT = "#F59E0B";

// ===== COLOR PRESETS =====
const colorPresets = [
  { hex: "#F59E0B", name: "Amber" }, { hex: "#DC2626", name: "Red" }, { hex: "#2563EB", name: "Blue" },
  { hex: "#16A34A", name: "Green" }, { hex: "#7C3AED", name: "Purple" }, { hex: "#DB2777", name: "Pink" },
  { hex: "#EA580C", name: "Orange" }, { hex: "#0D9488", name: "Teal" }, { hex: "#4F46E5", name: "Indigo" },
  { hex: "#E11D48", name: "Rose" }, { hex: "#0284C7", name: "Sky" }, { hex: "#1E293B", name: "Slate" },
];

const businessTypes = [
  "Butcher", "Baker", "Fishmonger", "Cheesemonger", "Farm Shop",
  "Brewery / Distillery", "Market Stall", "Café / Restaurant", "Deli", "Other",
];

const typeIcons: Record<string, React.ReactNode> = {
  Butcher: <Beef size={20} />, Baker: <CakeSlice size={20} />, Fishmonger: <Fish size={20} />,
  Cheesemonger: <Milk size={20} />, "Farm Shop": <Tractor size={20} />, "Brewery / Distillery": <Beer size={20} />,
};

// ===== TEMPLATE DATA =====
const templates: Record<string, Partial<DemoProfile>> = {
  Butcher: {
    businessType: "Butcher", tagline: "Quality cuts from the heart of Kent since 1987",
    plans: [
      { name: "The Basics", price: 0, isFree: true, features: ["Weekly email newsletter", "Shop news & updates", "Recipe of the week"], projectedSubscribers: 60 },
      { name: "The Weekly Box", price: 25, isFree: false, features: ["10% in-store discount", "Weekly recipe card", "Shop news", "Early access to specials"], projectedSubscribers: 85 },
      { name: "The BBQ Club", price: 45, isFree: false, features: ["15% discount", "Monthly premium meat box", "Exclusive cuts", "BBQ masterclass invites", "Priority ordering", "Direct butcher line"], projectedSubscribers: 30 },
    ],
    drops: [
      { name: "Bank Holiday BBQ Pack", price: 32, status: "live", quantity: 20, sold: 14 },
      { name: "Sunday Roast Box", price: 22, status: "live", quantity: 30, sold: 18 },
      { name: "Valentine's Steak Night", price: 38, status: "scheduled", quantity: 15, sold: 0 },
      { name: "Sausage Making Workshop", price: 55, status: "draft", quantity: 10, sold: 0 },
    ],
    content: [
      { title: "Perfect Reverse-Seared Ribeye", type: "Recipe", status: "published", prepTime: "5 mins", cookTime: "45 mins", serves: "2" },
      { title: "Low & Slow Pulled Pork", type: "Recipe", status: "published", prepTime: "15 mins", cookTime: "8 hrs", serves: "8" },
      { title: "New Season Lamb Has Arrived", type: "Update", status: "published" },
      { title: "Why We Source From Local Farms", type: "Story", status: "draft" },
    ],
  },
  Baker: {
    businessType: "Baker", tagline: "Artisan breads & pastries baked fresh daily",
    plans: [
      { name: "The Taster", price: 0, isFree: true, features: ["Weekly newsletter", "Recipe tips", "Shop news"], projectedSubscribers: 70 },
      { name: "The Bread Run", price: 18, isFree: false, features: ["10% discount", "Weekly bread selection", "Early ordering", "New flavour previews"], projectedSubscribers: 95 },
      { name: "Baker's Dozen Club", price: 38, isFree: false, features: ["15% discount", "Monthly pastry box", "Baking class invites", "All recipes", "Priority ordering", "Seasonal specials"], projectedSubscribers: 25 },
    ],
    drops: [
      { name: "Easter Hot Cross Bun Box", price: 15, status: "live", quantity: 40, sold: 28 },
      { name: "Christmas Stollen Special", price: 28, status: "ended", quantity: 25, sold: 25 },
      { name: "Sourdough Starter Kit", price: 22, status: "scheduled", quantity: 30, sold: 0 },
    ],
    content: [
      { title: "Sourdough Masterclass", type: "Recipe", status: "published", prepTime: "30 mins", cookTime: "45 mins", serves: "1 loaf" },
      { title: "Perfect Croissants at Home", type: "Recipe", status: "published", prepTime: "2 hrs", cookTime: "20 mins", serves: "12" },
      { title: "Our New Wood-Fired Oven", type: "Update", status: "published" },
    ],
  },
  Fishmonger: {
    businessType: "Fishmonger", tagline: "Premium sustainable fish, caught daily from the coast",
    plans: [
      { name: "Catch of the Day", price: 0, isFree: true, features: ["Weekly newsletter", "Public recipes", "Shop news"], projectedSubscribers: 64 },
      { name: "The Standard Catch", price: 15, isFree: false, features: ["10% discount", "Exclusive recipes", "Early drop access", "Monthly catch report"], projectedSubscribers: 89 },
      { name: "Captain's Club", price: 35, isFree: false, features: ["15% discount", "Monthly premium fish box", "All content", "Priority drops", "Tasting events", "Direct line"], projectedSubscribers: 34 },
    ],
    drops: [
      { name: "Weekend Smokehouse Selection", price: 28, status: "live", quantity: 25, sold: 18 },
      { name: "Friday Night Fish Supper", price: 18, status: "live", quantity: 20, sold: 12 },
      { name: "Spring Catch Taster", price: 22, status: "scheduled", quantity: 30, sold: 0 },
    ],
    content: [
      { title: "Pan-Seared Sea Bass with Samphire", type: "Recipe", status: "published", prepTime: "10 mins", cookTime: "15 mins", serves: "2" },
      { title: "Classic Fish Pie", type: "Recipe", status: "published", prepTime: "20 mins", cookTime: "35 mins", serves: "4" },
      { title: "Bank Holiday Opening Hours", type: "Update", status: "published" },
    ],
  },
  Cheesemonger: {
    businessType: "Cheesemonger", tagline: "Fine artisan cheeses from British makers",
    plans: [
      { name: "The Nibble", price: 0, isFree: true, features: ["Weekly newsletter", "Cheese tips", "Shop news"], projectedSubscribers: 55 },
      { name: "The Cheese Board", price: 22, isFree: false, features: ["10% discount", "Monthly tasting notes", "Early access", "Pairing guides"], projectedSubscribers: 70 },
      { name: "Affineur's Selection", price: 42, isFree: false, features: ["15% discount", "Monthly premium cheese box", "All content", "Tasting events", "Priority ordering", "Expert hotline"], projectedSubscribers: 20 },
    ],
    drops: [
      { name: "Christmas Cheese Hamper", price: 45, status: "ended", quantity: 30, sold: 30 },
      { name: "Fondue Night Kit", price: 28, status: "live", quantity: 20, sold: 14 },
      { name: "British Cheese Discovery Box", price: 35, status: "scheduled", quantity: 25, sold: 0 },
    ],
    content: [
      { title: "Perfect Cheese Board Assembly", type: "Recipe", status: "published" },
      { title: "How to Store Cheese Properly", type: "Tip", status: "published" },
    ],
  },
  "Farm Shop": {
    businessType: "Farm Shop", tagline: "Seasonal produce straight from our fields to your kitchen",
    plans: [
      { name: "The Sampler", price: 0, isFree: true, features: ["Weekly newsletter", "Seasonal tips", "Farm news"], projectedSubscribers: 80 },
      { name: "The Seasonal Box", price: 28, isFree: false, features: ["10% discount", "Monthly seasonal box", "Recipes", "Early access"], projectedSubscribers: 60 },
      { name: "The Full Harvest", price: 52, isFree: false, features: ["15% discount", "Premium weekly box", "All content", "Farm tours", "Priority ordering", "Direct farmer line"], projectedSubscribers: 15 },
    ],
    drops: [
      { name: "Christmas Hamper", price: 65, status: "ended", quantity: 20, sold: 20 },
      { name: "Preserves Collection", price: 32, status: "live", quantity: 25, sold: 16 },
      { name: "Spring Veg Box", price: 18, status: "scheduled", quantity: 40, sold: 0 },
    ],
    content: [
      { title: "Seasonal Eating Guide: Spring", type: "Tip", status: "published" },
      { title: "Farm-to-Table Sunday Roast", type: "Recipe", status: "published", prepTime: "20 mins", cookTime: "2 hrs", serves: "6" },
    ],
  },
  "Brewery / Distillery": {
    businessType: "Brewery / Distillery", tagline: "Small-batch craft drinks with character",
    plans: [
      { name: "The Taster", price: 0, isFree: true, features: ["Weekly newsletter", "Tasting notes", "Event news"], projectedSubscribers: 90 },
      { name: "The Monthly Pour", price: 24, isFree: false, features: ["10% discount", "Monthly selection", "Tasting notes", "Early releases"], projectedSubscribers: 75 },
      { name: "The Cask Club", price: 48, isFree: false, features: ["15% discount", "Premium monthly box", "All content", "Brewery tours", "Limited editions", "Blending sessions"], projectedSubscribers: 20 },
    ],
    drops: [
      { name: "Limited Edition IPA Case", price: 36, status: "live", quantity: 30, sold: 22 },
      { name: "Gin Advent Calendar", price: 85, status: "ended", quantity: 15, sold: 15 },
      { name: "Brewery Tour + Tasting", price: 45, status: "scheduled", quantity: 20, sold: 0 },
    ],
    content: [
      { title: "How We Brew Our Flagship IPA", type: "Story", status: "published" },
      { title: "Perfect Beer & Food Pairings", type: "Tip", status: "published" },
    ],
  },
};

// ===== UK NAME GENERATOR =====
const firstNames = ["Sarah", "James", "Emma", "Oliver", "Amelia", "William", "Isabelle", "George", "Charlotte", "Henry", "Sophia", "Jack", "Mia", "Thomas", "Emily", "Daniel", "Lucy", "Oscar", "Grace", "Harry", "Lily", "Alfie", "Chloe", "Noah", "Ella", "Leo", "Freya", "Ethan", "Poppy", "Charlie"];
const lastNames = ["Mitchell", "Chen", "Davies", "Thompson", "Wright", "Harris", "Foster", "Baker", "Wilson", "Clark", "Taylor", "Robinson", "Evans", "White", "Johnson", "Brown", "Martin", "Lee", "Walker", "King", "Green", "Hill", "Wood", "Turner", "Scott"];

function generateNames(count: number): string[] {
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    names.push(`${fn} ${ln}`);
  }
  return names;
}

// ===== MESSAGE TEMPLATES BY BUSINESS TYPE =====
const messageTemplates: Record<string, { subscriber: string; producer: string }[]> = {
  Butcher: [
    { subscriber: "Hi! What cuts do you recommend for a weekend BBQ for 6 people?", producer: "Great question! I'd suggest our BBQ pack: 12 sausages, 6 burgers, and 4 rib-eye steaks. Want me to set one aside?" },
    { subscriber: "The lamb shanks in my last box were incredible! Best I've ever had.", producer: "Thank you! Those were from a local farm in Kent — grass-fed and dry-aged for 21 days. Glad you enjoyed!" },
    { subscriber: "Do you do anything for Christmas? Looking to pre-order a turkey.", producer: "Absolutely! We'll have our Christmas order form up in November. I'll make sure you get early access as a premium member." },
    { subscriber: "Can I swap the pork chops in my next box for chicken thighs?", producer: "Of course! I've made a note on your account. Your next box will have free-range chicken thighs instead." },
    { subscriber: "Is the mince in the weekly box suitable for freezing?", producer: "Yes, all our mince freezes beautifully for up to 3 months. We vacuum-pack it specifically for that reason." },
  ],
  Baker: [
    { subscriber: "Can I get my sourdough delivery on Saturdays instead of Fridays?", producer: "Of course! I've updated your delivery day. You'll get fresh bread every Saturday morning from next week." },
    { subscriber: "Your croissants are honestly the best I've ever had. What's the secret?", producer: "Thank you! It's all about the butter — we use French AOC butter and do a 3-day lamination process. Glad you can taste the difference!" },
    { subscriber: "Do you do gluten-free options? My partner has coeliac disease.", producer: "We're working on a GF range! We should have sourdough and rolls available next month. I'll add you to the waitlist." },
    { subscriber: "I'd love to book one of your baking workshops for my birthday.", producer: "Happy to help! We have croissant and bread-making workshops on Saturdays. I'll send you the booking link." },
  ],
  Fishmonger: [
    { subscriber: "Hi! Can you tell me about your delivery areas? I've just moved to Canterbury.", producer: "Hi! We deliver across Kent — Canterbury is well within our range. Orders placed before 2pm get next-day delivery." },
    { subscriber: "The sea bass was amazing! Best I've ever had.", producer: "That was line-caught from our day boats. Glad you enjoyed it!" },
    { subscriber: "Can I request monkfish for next month's premium box?", producer: "Absolutely! Monkfish season is just starting so the timing is perfect. I'll make a note." },
    { subscriber: "Do you have allergen info for your smoked products?", producer: "Great question — all our smoked products are processed in a nut-free, gluten-free facility. I'll send the full allergen sheet." },
    { subscriber: "I'm hosting a dinner party for 8. Can you suggest a selection?", producer: "I'd recommend our party platter: whole sea bream, king prawns, and crab claws. Shall I add it to your next order?" },
  ],
  default: [
    { subscriber: "Hi! I'm interested in upgrading my subscription. What extra benefits do I get?", producer: "Great question! The premium tier gives you priority access to all drops, exclusive content, and a monthly curated box. Want me to switch you over?" },
    { subscriber: "Your products are fantastic quality. Keep up the great work!", producer: "Thank you so much! We put a lot of care into sourcing the best. Really appreciate the kind words." },
    { subscriber: "Can I pause my subscription for a couple of weeks while I'm on holiday?", producer: "Of course! I've paused your account. Just drop me a message when you're back and I'll reactivate it straight away." },
    { subscriber: "Do you deliver outside your usual area? I'm about 30 miles away.", producer: "We can arrange special deliveries! There's a small delivery charge for areas outside our core zone. Let me check the exact cost for you." },
    { subscriber: "I'd love to gift a subscription to my mum for her birthday. Is that possible?", producer: "What a lovely idea! We do gift subscriptions — I can set one up with a personalised card. How many months were you thinking?" },
  ],
};

// ===== COMPONENT =====
const emptyPlan = (): DemoPlan => ({ name: "", price: 0, isFree: false, features: [""], projectedSubscribers: 0 });
const emptyDrop = (): DemoDrop => ({ name: "", price: 0, status: "draft", quantity: 0, sold: 0 });
const emptyContent = (): DemoContent => ({ title: "", type: "Recipe", status: "draft" });

const DemoSetup = () => {
  const navigate = useNavigate();
  const { demoConfig, setDemoConfig, demoActive } = useApp();
  const [launching, setLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_ACCENT);
  const [customHex, setCustomHex] = useState("");
  const [plans, setPlans] = useState<DemoPlan[]>([
    { name: "Free", price: 0, isFree: true, features: ["Weekly newsletter", "Shop news", "Public recipes"], projectedSubscribers: 50 },
    { name: "Standard", price: 15, isFree: false, features: ["10% discount", "Exclusive content", "Early access", "Monthly report"], projectedSubscribers: 80 },
    { name: "Premium", price: 35, isFree: false, features: ["15% discount", "Monthly box", "All content", "Priority ordering", "Events access", "Direct line"], projectedSubscribers: 25 },
  ]);
  const [drops, setDrops] = useState<DemoDrop[]>([
    { name: "Weekend Selection", price: 28, status: "live", quantity: 25, sold: 18 },
    { name: "Special Box", price: 45, status: "scheduled", quantity: 20, sold: 0 },
    { name: "Taster Pack", price: 18, status: "draft", quantity: 15, sold: 0 },
  ]);
  const [content, setContent] = useState<DemoContent[]>([
    { title: "Signature Recipe", type: "Recipe", status: "published", prepTime: "10 mins", cookTime: "20 mins", serves: "4" },
    { title: "New Season Update", type: "Update", status: "published" },
  ]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [autoNames, setAutoNames] = useState(true);
  const [monthsActive, setMonthsActive] = useState(6);
  const [growthRate, setGrowthRate] = useState(15);
  const [autoMessages, setAutoMessages] = useState(true);

  // Pre-fill from active demo config when returning via "Edit demo"
  useEffect(() => {
    if (demoConfig) {
      setBusinessName(demoConfig.businessName);
      setBusinessType(demoConfig.businessType);
      setTagline(demoConfig.tagline);
      setLocation(demoConfig.location);
      setEmail(demoConfig.email);
      setPhone(demoConfig.phone);
      setWebsite(demoConfig.website);
      setLogoUrl(demoConfig.logoUrl);
      setCoverUrl(demoConfig.coverUrl);
      setSelectedColor(demoConfig.accentColor);
      setPlans(demoConfig.plans);
      setDrops(demoConfig.drops);
      setContent(demoConfig.content);
      setTotalSubscribers(demoConfig.totalSubscribers);
      setMonthsActive(demoConfig.monthsActive);
      setGrowthRate(demoConfig.growthRate);
      setAutoNames(demoConfig.autoGenerateNames);
      setAutoMessages(demoConfig.autoGenerateMessages);
    }
  }, []);

  // Saved profiles
  const [savedProfiles, setSavedProfiles] = useState<DemoProfile[]>(() => {
    try { return JSON.parse(localStorage.getItem("slate-demo-profiles") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("slate-demo-profiles", JSON.stringify(savedProfiles));
  }, [savedProfiles]);

  // Computed
  const calcMRR = useMemo(() => plans.reduce((sum, p) => sum + p.price * p.projectedSubscribers, 0), [plans]);
  const calcTotalSubs = useMemo(() => totalSubscribers || plans.reduce((sum, p) => sum + p.projectedSubscribers, 0), [totalSubscribers, plans]);

  const inputCls = "w-full h-10 px-3.5 rounded-lg border border-border bg-white text-[14px] text-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all";

  // Load template
  const loadTemplate = (type: string) => {
    const t = templates[type];
    if (!t) return;
    setBusinessType(t.businessType || type);
    setTagline(t.tagline || "");
    if (t.plans) setPlans(t.plans);
    if (t.drops) setDrops(t.drops);
    if (t.content) setContent(t.content);
    toast.success(`${type} template loaded — customise the details below`);
  };

  // Save profile
  const saveProfile = () => {
    if (!businessName) { toast.error("Enter a business name first"); return; }
    if (savedProfiles.length >= 20) { toast.error("Maximum 20 profiles — delete one first"); return; }
    const profile: DemoProfile = {
      id: `dp-${Date.now()}`, name: businessName, businessName, businessType, tagline, location,
      email, phone, website, logoUrl, coverUrl, accentColor: selectedColor, plans, drops, content,
      totalSubscribers: calcTotalSubs, monthsActive, growthRate, startingMRR: calcMRR,
      autoGenerateNames: autoNames, autoGenerateMessages: autoMessages, lastUsed: new Date().toISOString(),
    };
    setSavedProfiles(prev => [profile, ...prev]);
    toast.success("Profile saved");
  };

  const loadProfile = (p: DemoProfile) => {
    setBusinessName(p.businessName); setBusinessType(p.businessType); setTagline(p.tagline);
    setLocation(p.location); setEmail(p.email); setPhone(p.phone); setWebsite(p.website);
    setLogoUrl(p.logoUrl); setCoverUrl(p.coverUrl); setSelectedColor(p.accentColor);
    setPlans(p.plans); setDrops(p.drops); setContent(p.content);
    setTotalSubscribers(p.totalSubscribers); setMonthsActive(p.monthsActive); setGrowthRate(p.growthRate);
    setAutoNames(p.autoGenerateNames); setAutoMessages(p.autoGenerateMessages);
    toast.success(`Loaded: ${p.businessName}`);
  };

  const deleteProfile = (id: string) => {
    setSavedProfiles(prev => prev.filter(p => p.id !== id));
    toast.success("Profile deleted");
  };

  // File upload helper
  const handleUpload = (setter: (url: string | null) => void) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) { setter(URL.createObjectURL(file)); toast.success("Image uploaded"); }
    };
    input.click();
  };

  // Generate revenue data curves
  const generateRevenueData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const data: { month: string; revenue: number }[] = [];
    for (let i = monthsActive - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const progress = (monthsActive - i) / monthsActive;
      const base = calcMRR * progress;
      const jitter = base * (0.9 + Math.random() * 0.2);
      data.push({ month: months[mIdx], revenue: Math.round(jitter) });
    }
    return data;
  };

  const generateSubscriberGrowth = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const data: { month: string; new: number; churned: number }[] = [];
    const avgNewPerMonth = Math.max(Math.round(calcTotalSubs / monthsActive * (1 + growthRate / 100)), 5);
    for (let i = monthsActive - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const progress = (monthsActive - i) / monthsActive;
      const newSubs = Math.round(avgNewPerMonth * progress * (0.7 + Math.random() * 0.6));
      const churned = Math.round(newSubs * (0.1 + Math.random() * 0.1));
      data.push({ month: months[mIdx], new: Math.max(newSubs, 3), churned: Math.max(churned, 1) });
    }
    return data;
  };

  const generateRevenueDataSets = (baseData: { month: string; revenue: number }[]) => {
    const lastRev = baseData[baseData.length - 1]?.revenue || calcMRR;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyAvg = Math.round(lastRev / 30);
    
    return {
      "7d": days.map(d => ({ month: d, revenue: Math.round(dailyAvg * (0.7 + Math.random() * 0.6)) })),
      "30d": [
        { month: "W1", revenue: Math.round(lastRev * 0.22) },
        { month: "W2", revenue: Math.round(lastRev * 0.25) },
        { month: "W3", revenue: Math.round(lastRev * 0.24) },
        { month: "W4", revenue: Math.round(lastRev * 0.29) },
      ],
      "3m": baseData.slice(-3),
      "6m": baseData.slice(-6),
      "12m": baseData.length >= 12 ? baseData : [
        ...Array.from({ length: 12 - baseData.length }, (_, i) => ({ month: ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i] || "—", revenue: 0 })),
        ...baseData,
      ],
      "all": baseData,
    };
  };

  // Generate conversations
  const generateConversations = (subNames: string[], planNames: string[]): Conversation[] => {
    const tpls = messageTemplates[businessType] || messageTemplates["default"];
    const convCount = Math.min(subNames.length, 5);
    const convos: Conversation[] = [];
    
    for (let i = 0; i < convCount; i++) {
      const name = subNames[i];
      const plan = planNames[i % planNames.length] || "Standard";
      const tpl = tpls[i % tpls.length];
      const initials = name.split(" ").map(n => n[0]).join("");
      const times = ["10:23 AM", "Yesterday", "2 hours ago", "Mar 15", "Mar 12"];
      
      const messages: Message[] = [
        { id: `${i}a`, text: tpl.subscriber, sender: "subscriber", time: times[i % times.length] },
        { id: `${i}b`, text: tpl.producer, sender: "producer", time: times[i % times.length] },
      ];
      
      convos.push({
        id: crypto.randomUUID(),
        name,
        plan,
        avatar: initials,
        unread: i < 2,
        messages,
      });
    }
    return convos;
  };

  // Generate activity feed
  const generateActivityFeed = (subNames: string[], planNames: string[], dropNames: string[], contentTitles: string[]) => {
    const times = ["2 min ago", "15 min ago", "1 hr ago", "3 hr ago", "5 hr ago", "6 hr ago"];
    const items: { id: number; type: "subscribe" | "drop" | "cancel" | "recipe"; name: string; detail: string; time: string; link: string }[] = [];
    let id = 1;

    // Mix of signups, drops, cancels, recipes
    if (subNames.length > 0) items.push({ id: id++, type: "subscribe", name: subNames[0], detail: planNames[1] || planNames[0], time: times[0], link: "/dashboard/subscribers" });
    if (dropNames.length > 0) {
      const liveDrop = drops.find(d => d.status === "live");
      items.push({ id: id++, type: "drop", name: dropNames[0], detail: liveDrop ? `${liveDrop.sold}/${liveDrop.quantity} sold` : "Active", time: times[1], link: "/dashboard/drops" });
    }
    if (subNames.length > 1) items.push({ id: id++, type: "subscribe", name: subNames[1], detail: planNames[0] || "Standard", time: times[2], link: "/dashboard/subscribers" });
    if (subNames.length > 2) items.push({ id: id++, type: "cancel", name: subNames[2], detail: planNames[1] || planNames[0], time: times[3], link: "/dashboard/subscribers" });
    if (subNames.length > 3) items.push({ id: id++, type: "subscribe", name: subNames[3], detail: planNames[planNames.length - 1] || "Premium", time: times[4], link: "/dashboard/subscribers" });
    if (contentTitles.length > 0) items.push({ id: id++, type: "recipe", name: contentTitles[0], detail: `${Math.floor(Math.random() * 200 + 50)} views`, time: times[5], link: "/dashboard/content" });

    return items;
  };

  // Launch demo
  const handleLaunch = () => {
    if (!businessName) { toast.error("Business name is required"); return; }
    if (!plans.some(p => p.name)) { toast.error("At least one plan is required"); return; }

    setLaunching(true);
    setLaunchProgress(0);

    const interval = setInterval(() => {
      setLaunchProgress(prev => Math.min(prev + 5, 100));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setLaunchProgress(100);

      // Generate subscriber data
      const subNames = autoNames ? generateNames(calcTotalSubs) : [];
      const validPlans = plans.filter(p => p.name);
      const planNames = validPlans.map(p => p.name);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const generatedSubscribers = subNames.slice(0, Math.min(calcTotalSubs, 30)).map((name, i) => {
        // Distribute proportionally across plans
        let cumulative = 0;
        let planForSub = validPlans[0];
        const totalProjected = validPlans.reduce((s, p) => s + p.projectedSubscribers, 0);
        const targetIdx = (i / Math.min(calcTotalSubs, 30)) * totalProjected;
        for (const p of validPlans) {
          cumulative += p.projectedSubscribers;
          if (targetIdx < cumulative) { planForSub = p; break; }
        }

        const joinMonth = Math.floor(Math.random() * monthsActive);
        const joinDate = new Date();
        joinDate.setMonth(joinDate.getMonth() - joinMonth);

        return {
          id: crypto.randomUUID(), name, email: `${name.toLowerCase().replace(" ", ".")}@email.com`,
          phone: `07700 ${String(900000 + i).slice(0, 6)}`, plan: planForSub.name,
          status: Math.random() > 0.1 ? "active" as const : Math.random() > 0.5 ? "paused" as const : "cancelled" as const,
          joined: `${Math.floor(Math.random() * 28) + 1} ${monthNames[joinDate.getMonth()]} ${joinDate.getFullYear()}`,
          revenue: planForSub.isFree ? "£0" : `£${Math.floor(planForSub.price * (joinMonth + 1))}`,
        };
      });

      // Generate plans for dashboard
      const dashPlans = validPlans.map((p, i) => ({
        id: crypto.randomUUID(), name: p.name, price: p.isFree ? "Free" : `£${p.price}/mo`, priceNum: p.price,
        subscribers: p.projectedSubscribers, isFree: p.isFree, benefits: p.features,
        description: "", active: true, showOnPublicPage: true,
      }));

      // Generate drops for dashboard
      const dashDrops = drops.filter(d => d.name).map((d, i) => ({
        id: crypto.randomUUID(), title: d.name, description: "",
        status: d.status as any, total: d.quantity, remaining: d.quantity - d.sold,
        price: `£${d.price.toFixed(2)}`, priceNum: d.price,
        revenue: `£${(d.sold * d.price).toLocaleString()}`, endsIn: d.status === "live" ? "3 days" : d.status === "ended" ? "Ended" : "—",
        dropDate: "", dropTime: "", endDate: "", endTime: "",
        eligiblePlans: planNames,
        items: [], notify: true,
      }));

      // Generate content for dashboard
      const dashContent = content.filter(c => c.title).map((c, i) => ({
        id: crypto.randomUUID(), title: c.title, type: c.type, body: "",
        status: c.status as any, tier: "Free", views: Math.floor(Math.random() * 300),
        date: c.status === "published" ? "12 Mar 2026" : "—", ai: false,
        prepTime: c.prepTime, cookTime: c.cookTime, serves: c.serves,
        eligiblePlans: planNames,
      }));

      // Revenue data
      const revData = generateRevenueData();
      const subGrowth = generateSubscriberGrowth();
      const revDataSets = generateRevenueDataSets(revData);

      // KPI calculations
      const churnRate = (2 + Math.random() * 3).toFixed(1);
      const arpu = calcTotalSubs > 0 ? (calcMRR / calcTotalSubs).toFixed(2) : "0";

      const kpi = {
        mrr: `£${calcMRR.toLocaleString()}`,
        mrrChange: `+${growthRate}%`,
        totalSubs: String(calcTotalSubs),
        subsChange: `+${Math.round(growthRate * 0.8)}%`,
        churn: `${churnRate}%`,
        churnChange: `-${(Math.random() * 1.5).toFixed(1)}%`,
        arpu: `£${arpu}`,
        arpuChange: `+${(Math.random() * 4 + 1).toFixed(1)}%`,
        ltv: `£${Math.round(parseFloat(arpu) * 7.2)}`,
        ltvChange: `+${(Math.random() * 10 + 2).toFixed(1)}%`,
        dropConversion: `${Math.round(60 + Math.random() * 25)}%`,
        dropConversionChange: `+${(Math.random() * 8 + 1).toFixed(1)}%`,
        contentEngagement: `${(Math.random() * 4 + 1).toFixed(1)}k`,
        contentEngagementChange: `+${Math.round(10 + Math.random() * 20)}%`,
      };

      // Activity feed
      const dropNames = drops.filter(d => d.name).map(d => d.name);
      const contentTitles = content.filter(c => c.title).map(c => c.title);
      const activity = generateActivityFeed(subNames, planNames, dropNames, contentTitles);

      // Conversations
      const conversations = autoMessages
        ? generateConversations(subNames, planNames)
        : [];

      // Tier breakdown for analytics
      const pieColors = ["hsl(213, 27%, 62%)", "hsl(217, 33%, 17%)", "hsl(38, 92%, 50%)", "hsl(280, 60%, 50%)", "hsl(160, 60%, 40%)"];
      const tierData = validPlans.map((p, i) => ({
        name: p.name,
        value: p.projectedSubscribers,
        color: pieColors[i % pieColors.length],
      }));

      // Save demo config to localStorage for the preview tab
      const demoPreviewData = {
        settings: {
          businessName,
          businessType,
          description: tagline,
          email,
          phone,
          website,
          urlSlug: businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          accentColor: selectedColor,
          logoUrl,
          coverUrl,
        },
        plans: dashPlans,
        drops: dashDrops,
        content: dashContent,
        subscribers: generatedSubscribers,
        conversations,
        kpi,
        revenueChartData: revData,
        subscriberGrowthData: subGrowth,
        revenueDataSets: revDataSets,
        activityFeed: activity,
        tierBreakdown: tierData,
      };

      localStorage.setItem("slate_demo_preview", JSON.stringify(demoPreviewData));

      // Save demo config for "Edit demo" pre-fill
      const config: DemoProfile = {
        id: `active-${Date.now()}`, name: businessName, businessName, businessType, tagline, location,
        email, phone, website, logoUrl, coverUrl, accentColor: selectedColor, plans, drops, content,
        totalSubscribers: calcTotalSubs, monthsActive, growthRate, startingMRR: calcMRR,
        autoGenerateNames: autoNames, autoGenerateMessages: autoMessages,
      };
      setDemoConfig(config);

      // Open demo in a NEW TAB — admin's current tab stays untouched
      const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      setTimeout(() => {
        setLaunching(false);
        window.open(`/demo-preview/${slug}`, "_blank");
        toast.success("Demo launched in a new tab!");
      }, 300);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4"><SlateLogo size={22} /></div>
          <h1 className="text-[28px] font-bold text-foreground tracking-[-0.01em]">Demo Configurator</h1>
          <p className="text-[16px] text-muted-foreground mt-1">
            Customise the dashboard for a prospect before a sales call. Changes only affect the dashboard view.
          </p>
        </div>

        {/* Template Presets */}
        <div className="mb-8">
          <h2 className="text-[15px] font-medium text-foreground mb-3">Quick Start Templates</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.keys(templates).map(type => (
              <button
                key={type}
                onClick={() => loadTemplate(type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-white hover:border-foreground/30 hover:shadow-card transition-all cursor-pointer"
              >
                <span className="text-muted-foreground">{typeIcons[type] || <Tractor size={20} />}</span>
                <span className="text-[13px] font-medium text-foreground">{type}</span>
                <span className="text-[11px] text-muted-foreground">Use template</span>
              </button>
            ))}
          </div>
        </div>

        {/* Saved Profiles */}
        {savedProfiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[15px] font-medium text-foreground mb-3">Saved Profiles</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {savedProfiles.map(p => (
                <div key={p.id} className="flex-shrink-0 w-52 p-4 rounded-xl border border-border bg-white">
                  <p className="text-[14px] font-medium text-foreground truncate">{p.businessName}</p>
                  <span className="text-[11px] text-muted-foreground">{p.businessType}</span>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => loadProfile(p)} className="text-[12px] font-medium text-foreground hover:underline cursor-pointer">Load</button>
                    <button onClick={() => deleteProfile(p.id)} className="text-[12px] text-destructive/70 hover:text-destructive cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form - 3 cols */}
          <div className="lg:col-span-3 space-y-6">
            {/* Business Details */}
            <Card className="border-0 shadow-card">
              <CardHeader className="px-6 pt-6 pb-3"><CardTitle className="text-[15px] font-medium">Business Details</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Business Name <span className="text-destructive">*</span></label>
                    <input value={businessName} onChange={e => setBusinessName(e.target.value)} className={inputCls} placeholder="e.g. Thompson's Butchers" />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Business Type <span className="text-destructive">*</span></label>
                    <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={inputCls + " appearance-none"}>
                      <option value="">Select...</option>
                      {businessTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Tagline</label>
                  <input value={tagline} onChange={e => setTagline(e.target.value)} className={inputCls} placeholder="Optional" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Location</label><input value={location} onChange={e => setLocation(e.target.value)} className={inputCls} placeholder="Optional" /></div>
                  <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Email</label><input value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="Optional" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="Optional" /></div>
                  <div><label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Website</label><input value={website} onChange={e => setWebsite(e.target.value)} className={inputCls} placeholder="Optional" /></div>
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card className="border-0 shadow-card">
              <CardHeader className="px-6 pt-6 pb-3"><CardTitle className="text-[15px] font-medium">Branding</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Logo</label>
                    <div onClick={() => handleUpload(setLogoUrl)} className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground hover:border-foreground/30 cursor-pointer overflow-hidden">
                      {logoUrl ? <img src={logoUrl} className="h-full w-full object-contain p-2" alt="" /> : <span className="text-[13px]">Upload logo</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Cover Photo</label>
                    <div onClick={() => handleUpload(setCoverUrl)} className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground hover:border-foreground/30 cursor-pointer overflow-hidden">
                      {coverUrl ? <img src={coverUrl} className="h-full w-full object-cover" alt="" /> : <span className="text-[13px]">Upload cover</span>}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-muted-foreground block mb-2">Brand Accent Colour</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {colorPresets.map(c => (
                      <button
                        key={c.hex}
                        onClick={() => { setSelectedColor(c.hex); setCustomHex(""); }}
                        className={`w-8 h-8 rounded-full transition-all cursor-pointer ${selectedColor === c.hex ? "ring-2 ring-foreground ring-offset-2" : "hover:scale-110"}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-muted-foreground">Custom:</span>
                    <input
                      value={customHex}
                      onChange={e => {
                        setCustomHex(e.target.value);
                        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setSelectedColor(e.target.value);
                      }}
                      className={inputCls + " w-32"}
                      placeholder="#hex"
                    />
                    {selectedColor !== DEFAULT_ACCENT && (
                      <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: selectedColor }} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plans */}
            <Card className="border-0 shadow-card">
              <CardHeader className="px-6 pt-6 pb-3"><CardTitle className="text-[15px] font-medium">Subscription Plans</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                {plans.map((plan, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-foreground">Plan {idx + 1}{plan.isFree ? " (Free)" : ""}</span>
                      {plans.length > 1 && !plan.isFree && (
                        <button onClick={() => setPlans(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive cursor-pointer"><X size={14} /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><input value={plan.name} onChange={e => { const n = [...plans]; n[idx] = { ...n[idx], name: e.target.value }; setPlans(n); }} className={inputCls} placeholder="Plan name" /></div>
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] text-muted-foreground">£</span>
                        <input type="number" value={plan.price} onChange={e => { const n = [...plans]; n[idx] = { ...n[idx], price: Number(e.target.value) }; setPlans(n); }} className={inputCls} disabled={plan.isFree} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] text-muted-foreground whitespace-nowrap">Proj. subs:</span>
                        <input type="number" value={plan.projectedSubscribers} onChange={e => { const n = [...plans]; n[idx] = { ...n[idx], projectedSubscribers: Number(e.target.value) }; setPlans(n); }} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Features</label>
                      {plan.features.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-1 mb-1">
                          <input value={f} onChange={e => { const n = [...plans]; n[idx].features[fi] = e.target.value; setPlans([...n]); }} className={inputCls + " text-[13px]"} placeholder="Feature" />
                          <button onClick={() => { const n = [...plans]; n[idx].features = n[idx].features.filter((_, i) => i !== fi); setPlans(n); }} className="text-muted-foreground hover:text-destructive cursor-pointer shrink-0"><X size={12} /></button>
                        </div>
                      ))}
                      <button onClick={() => { const n = [...plans]; n[idx].features.push(""); setPlans([...n]); }} className="text-[12px] text-muted-foreground hover:text-foreground cursor-pointer mt-1">+ Add feature</button>
                    </div>
                  </div>
                ))}
                {plans.length < 5 && (
                  <Button variant="outline" size="sm" onClick={() => setPlans(prev => [...prev, emptyPlan()])}><Plus size={14} className="mr-1" /> Add plan</Button>
                )}
              </CardContent>
            </Card>

            {/* Product Drops */}
            <Card className="border-0 shadow-card">
              <CardHeader className="px-6 pt-6 pb-3"><CardTitle className="text-[15px] font-medium">Product Drops</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-3">
                {drops.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input value={d.name} onChange={e => { const n = [...drops]; n[idx] = { ...n[idx], name: e.target.value }; setDrops(n); }} className={inputCls + " flex-1"} placeholder="Drop name" />
                    <div className="flex items-center gap-1 w-20"><span className="text-[13px] text-muted-foreground">£</span><input type="number" value={d.price} onChange={e => { const n = [...drops]; n[idx] = { ...n[idx], price: Number(e.target.value) }; setDrops(n); }} className={inputCls} /></div>
                    <select value={d.status} onChange={e => { const n = [...drops]; n[idx] = { ...n[idx], status: e.target.value as any }; setDrops(n); }} className={inputCls + " w-28 appearance-none"}>
                      <option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="live">Live</option><option value="ended">Ended</option>
                    </select>
                    <input type="number" value={d.quantity} onChange={e => { const n = [...drops]; n[idx] = { ...n[idx], quantity: Number(e.target.value) }; setDrops(n); }} className={inputCls + " w-16"} placeholder="Qty" />
                    <input type="number" value={d.sold} onChange={e => { const n = [...drops]; n[idx] = { ...n[idx], sold: Number(e.target.value) }; setDrops(n); }} className={inputCls + " w-16"} placeholder="Sold" />
                    <button onClick={() => setDrops(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive cursor-pointer"><X size={14} /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setDrops(prev => [...prev, emptyDrop()])}><Plus size={14} className="mr-1" /> Add drop</Button>
              </CardContent>
            </Card>

            {/* Content */}
            <Card className="border-0 shadow-card">
              <CardHeader className="px-6 pt-6 pb-3"><CardTitle className="text-[15px] font-medium">Content / Recipes</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-3">
                {content.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input value={c.title} onChange={e => { const n = [...content]; n[idx] = { ...n[idx], title: e.target.value }; setContent(n); }} className={inputCls + " flex-1"} placeholder="Title" />
                    <select value={c.type} onChange={e => { const n = [...content]; n[idx] = { ...n[idx], type: e.target.value as any }; setContent(n); }} className={inputCls + " w-28 appearance-none"}>
                      <option>Recipe</option><option>Update</option><option>Story</option><option>Tip</option>
                    </select>
                    <select value={c.status} onChange={e => { const n = [...content]; n[idx] = { ...n[idx], status: e.target.value as any }; setContent(n); }} className={inputCls + " w-28 appearance-none"}>
                      <option value="published">Published</option><option value="draft">Draft</option>
                    </select>
                    <button onClick={() => setContent(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive cursor-pointer"><X size={14} /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setContent(prev => [...prev, emptyContent()])}><Plus size={14} className="mr-1" /> Add content</Button>
              </CardContent>
            </Card>

            {/* Subscriber Simulation */}
            <Card className="border-0 shadow-card">
              <CardHeader className="px-6 pt-6 pb-3"><CardTitle className="text-[15px] font-medium">Subscriber Simulation</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Total Subscribers (override)</label>
                    <input type="number" value={totalSubscribers || ""} onChange={e => setTotalSubscribers(Number(e.target.value))} className={inputCls} placeholder={`Auto: ${calcTotalSubs}`} />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Months Active</label>
                    <input type="number" value={monthsActive} onChange={e => setMonthsActive(Number(e.target.value))} min={1} max={24} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Monthly Growth Rate (%)</label>
                    <input type="number" value={growthRate} onChange={e => setGrowthRate(Number(e.target.value))} className={inputCls} />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <button onClick={() => setAutoNames(!autoNames)} className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${autoNames ? "bg-foreground" : "bg-muted-foreground/30"}`}>
                      <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${autoNames ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
                    </button>
                    <span className="text-[13px] text-muted-foreground">Auto-generate names</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setAutoMessages(!autoMessages)} className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${autoMessages ? "bg-foreground" : "bg-muted-foreground/30"}`}>
                    <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${autoMessages ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
                  </button>
                  <span className="text-[13px] text-muted-foreground">Auto-generate demo messages</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={saveProfile}><Save size={14} className="mr-1.5" /> Save profile</Button>
              <Button variant="ghost" size="sm" onClick={() => {
                if (confirm("Reset all fields to default?")) {
                  setBusinessName(""); setBusinessType(""); setTagline(""); setLocation("");
                  setEmail(""); setPhone(""); setWebsite(""); setLogoUrl(null); setCoverUrl(null);
                  setSelectedColor(DEFAULT_ACCENT); setPlans([
                    { name: "Free", price: 0, isFree: true, features: ["Weekly newsletter", "Shop news", "Public recipes"], projectedSubscribers: 50 },
                    { name: "Standard", price: 15, isFree: false, features: ["10% discount", "Exclusive content", "Early access", "Monthly report"], projectedSubscribers: 80 },
                    { name: "Premium", price: 35, isFree: false, features: ["15% discount", "Monthly box", "All content", "Priority ordering", "Events access", "Direct line"], projectedSubscribers: 25 },
                  ]);
                  setDrops([
                    { name: "Weekend Selection", price: 28, status: "live", quantity: 25, sold: 18 },
                    { name: "Special Box", price: 45, status: "scheduled", quantity: 20, sold: 0 },
                    { name: "Taster Pack", price: 18, status: "draft", quantity: 15, sold: 0 },
                  ]);
                  setContent([
                    { title: "Signature Recipe", type: "Recipe", status: "published" },
                    { title: "New Season Update", type: "Update", status: "published" },
                  ]);
                  toast.success("Reset to defaults");
                }
              }}>
                <RotateCcw size={14} className="mr-1.5" /> Reset
              </Button>
            </div>

            {/* Launch */}
            <div className="pb-10 space-y-3">
              {launching ? (
                <div className="w-full p-6 bg-foreground rounded-[10px] text-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin mx-auto mb-3" />
                  <p className="text-[16px] font-bold text-white mb-2">Building {businessName}'s dashboard...</p>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-100" style={{ width: `${launchProgress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleLaunch}
                    className="w-full py-3.5 px-8 bg-foreground hover:bg-[#0F172A] text-white text-[18px] font-bold rounded-[10px] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Rocket size={20} /> {demoActive ? "Re-launch Demo" : "Launch Demo"}
                  </button>
                  {demoActive && businessName && (
                    <a
                      href={`/store/${businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-8 border-2 text-[16px] font-semibold rounded-[10px] transition-colors cursor-pointer flex items-center justify-center gap-2 hover:opacity-80"
                      style={{ borderColor: selectedColor, color: selectedColor }}
                    >
                      View Customer Storefront ↗
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (!businessName) { toast.error("Business name is required"); return; }
                      setAssignModalOpen(true);
                    }}
                    className="w-full py-3 px-8 border-2 border-foreground/20 text-foreground/70 hover:border-foreground hover:text-foreground text-[16px] font-semibold rounded-[10px] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} /> Assign to Producer
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Live Preview Panel - 2 cols */}
          <div className="lg:col-span-2">
            <div className="sticky top-10">
              <Card className="border-0 shadow-card overflow-hidden">
                <div className="bg-foreground p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <SlateLogo size={12} dark asLink={false} />
                    <div className="flex-1" />
                    <span className="text-[9px] text-white/40">Dashboard</span>
                  </div>
                  <div className="mt-3 space-y-1.5 px-2">
                    {["Dashboard", "Subscribers", "Plans", "Content", "Drops"].map(item => (
                      <div key={item} className="text-[9px] text-white/40 py-1">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="bg-secondary p-4">
                  <p className="text-[11px] font-bold text-foreground mb-1 truncate">{businessName || "Business Name"}</p>
                  <p className="text-[9px] text-muted-foreground mb-3">{tagline || "Your tagline here"}</p>
                  {/* Mini KPI cards */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-[8px] text-muted-foreground">MRR</p>
                      <p className="text-[13px] font-bold text-foreground">£{calcMRR.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-[8px] text-muted-foreground">Subscribers</p>
                      <p className="text-[13px] font-bold text-foreground">{calcTotalSubs}</p>
                    </div>
                  </div>
                  {/* Mini chart */}
                  <div className="bg-white rounded-lg p-2 mb-3">
                    <p className="text-[8px] text-muted-foreground mb-1">Revenue</p>
                    <div className="flex items-end gap-0.5 h-8">
                      {Array.from({ length: Math.min(monthsActive, 8) }).map((_, i) => {
                        const h = 20 + (60 * (i + 1)) / Math.max(monthsActive, 1);
                        return <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, backgroundColor: selectedColor, opacity: 0.4 + (0.6 * i) / monthsActive }} />;
                      })}
                    </div>
                  </div>
                  {/* Plans preview */}
                  {plans.filter(p => p.name).slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                      <span className="text-[9px] text-foreground">{p.name}</span>
                      <span className="text-[9px] font-medium" style={{ color: selectedColor }}>{p.isFree ? "Free" : `£${p.price}/mo`}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <p className="text-[12px] text-muted-foreground text-center mt-2">Preview — launch the demo to see the full dashboard</p>
            </div>
          </div>
        </div>
      </div>
      <AssignToProducerModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        businessName={businessName}
        businessType={businessType}
        tagline={tagline}
        accentColor={selectedColor}
        logoUrl={logoUrl}
        coverUrl={coverUrl}
        description={tagline}
        plans={plans}
        drops={drops}
        content={content}
      />
    </div>
  );
};

export default DemoSetup;

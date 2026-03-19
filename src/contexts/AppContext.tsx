import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// ===== TYPES =====
export interface Lead {
  id: string;
  type: "signup" | "contact" | "newsletter";
  status: "new" | "reviewed" | "contacted";
  timestamp: string;
  notes: string;
  email: string;
  name?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  hearAbout?: string;
  message?: string;
  newsletter?: boolean;
  website?: string;
  customerCount?: string;
  interests?: string[];
  additionalNotes?: string;
  interestedPlan?: string;
  terms?: boolean;
}

export interface SessionState {
  isLoggedIn: boolean;
  currentUser: string;
}

export interface DemoPlan {
  name: string;
  price: number;
  isFree: boolean;
  features: string[];
  projectedSubscribers: number;
}

export interface DemoDrop {
  name: string;
  price: number;
  status: "draft" | "scheduled" | "live" | "ended";
  quantity: number;
  sold: number;
}

export interface DemoContent {
  title: string;
  type: "Recipe" | "Update" | "Story" | "Tip";
  status: "published" | "draft";
  prepTime?: string;
  cookTime?: string;
  serves?: string;
}

export interface DemoProfile {
  id: string;
  name: string;
  businessName: string;
  businessType: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string | null;
  coverUrl: string | null;
  accentColor: string;
  plans: DemoPlan[];
  drops: DemoDrop[];
  content: DemoContent[];
  totalSubscribers: number;
  monthsActive: number;
  growthRate: number;
  startingMRR: number;
  autoGenerateNames: boolean;
  autoGenerateMessages: boolean;
  lastUsed?: string;
}

// ===== DEFAULT ACCENT =====
const DEFAULT_ACCENT = "#F59E0B";

// ===== INITIAL MOCK LEADS =====
const initialLeads: Lead[] = [
  {
    id: "sig-1", type: "signup", status: "new", timestamp: "2026-03-18T14:30:00",
    email: "tom@greenfieldsfarm.co.uk", name: "Tom Greenfield", phone: "07812 345678",
    businessName: "Greenfields Farm Shop", businessType: "Farm Shop",
    website: "greenfieldsfarm.co.uk", customerCount: "50–200", interests: ["Subscription boxes", "Product drops"],
    notes: "",
  },
  {
    id: "sig-2", type: "signup", status: "reviewed", timestamp: "2026-03-15T09:15:00",
    email: "lisa@craftbakery.com", name: "Lisa Baker", phone: "07900 111222",
    businessName: "The Craft Bakery", businessType: "Baker",
    website: "instagram.com/craftbakery", customerCount: "200–500", interests: ["Subscription boxes", "Recipe & content sharing", "Analytics & insights"],
    notes: "Very keen, wants to start with sourdough subscriptions",
  },
  {
    id: "sig-3", type: "signup", status: "contacted", timestamp: "2026-03-10T16:45:00",
    email: "james@smokeandoak.co", name: "James Harlow", phone: "",
    businessName: "Smoke & Oak Charcuterie", businessType: "Butcher",
    website: "smokeandoak.co", customerCount: "Under 50", interests: ["All of the above"],
    interestedPlan: "growth", notes: "Call scheduled for next week",
  },
  {
    id: "con-1", type: "contact", status: "new", timestamp: "2026-03-17T11:20:00",
    email: "hello@cheesecellar.co.uk", name: "Margaret White",
    businessName: "The Cheese Cellar", businessType: "Cheesemaker",
    message: "We're interested in setting up a cheese subscription box. Can we arrange a demo?",
    notes: "",
  },
  {
    id: "con-2", type: "contact", status: "reviewed", timestamp: "2026-03-12T08:30:00",
    email: "info@hopyard.beer", name: "Dan Hopper", phone: "01234 567890",
    businessName: "Hopyard Brewing", businessType: "Brewery / Distillery",
    hearAbout: "Social Media",
    message: "Love the concept! We'd like to explore a beer subscription and limited-edition drops for seasonal brews.",
    notes: "Sent intro email with pricing deck",
  },
  { id: "news-1", type: "newsletter", status: "new", timestamp: "2026-03-19T08:00:00", email: "curious@gmail.com", notes: "" },
  { id: "news-2", type: "newsletter", status: "new", timestamp: "2026-03-18T19:30:00", email: "foodie.fan@outlook.com", notes: "" },
  { id: "news-3", type: "newsletter", status: "new", timestamp: "2026-03-17T12:00:00", email: "market.lover@yahoo.com", notes: "" },
  { id: "news-4", type: "newsletter", status: "reviewed", timestamp: "2026-03-15T10:00:00", email: "chef.pat@gmail.com", notes: "" },
  { id: "news-5", type: "newsletter", status: "reviewed", timestamp: "2026-03-12T15:45:00", email: "localfood@proton.me", notes: "" },
];

// ===== CONTEXT =====
interface AppContextType {
  session: SessionState;
  setSession: React.Dispatch<React.SetStateAction<SessionState>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  addLead: (lead: Omit<Lead, "id" | "timestamp" | "status" | "notes">) => boolean;
  accentColor: string;
  setAccentColor: (color: string) => void;
  resetAccentColor: () => void;
  demoActive: boolean;
  demoBusinessName: string;
  activateDemo: (businessName: string, accent: string) => void;
  deactivateDemo: () => void;
  demoConfig: DemoProfile | null;
  setDemoConfig: (config: DemoProfile | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({ isLoggedIn: false, currentUser: "" });
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [accentColor, setAccentColorState] = useState<string>(DEFAULT_ACCENT);
  const [demoActive, setDemoActive] = useState(false);
  const [demoBusinessName, setDemoBusinessName] = useState("");
  const [demoConfig, setDemoConfig] = useState<DemoProfile | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent-dynamic", accentColor);
  }, [accentColor]);

  const setAccentColor = (color: string) => setAccentColorState(color);
  const resetAccentColor = () => setAccentColorState(DEFAULT_ACCENT);

  const activateDemo = (businessName: string, accent: string) => {
    setDemoActive(true);
    setDemoBusinessName(businessName);
    setAccentColorState(accent);
  };

  const deactivateDemo = () => {
    setDemoActive(false);
    setDemoBusinessName("");
    setDemoConfig(null);
    setAccentColorState(DEFAULT_ACCENT);
  };

  const addLead = (lead: Omit<Lead, "id" | "timestamp" | "status" | "notes">): boolean => {
    if (lead.type === "signup" && leads.some(l => l.type === "signup" && l.email === lead.email)) return false;
    if (lead.type === "newsletter" && leads.some(l => l.type === "newsletter" && l.email === lead.email)) return false;

    const newLead: Lead = {
      ...lead,
      id: `${lead.type.slice(0, 3)}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "new",
      notes: "",
    };
    setLeads(prev => [newLead, ...prev]);
    return true;
  };

  return (
    <AppContext.Provider value={{
      session, setSession, leads, setLeads, addLead,
      accentColor, setAccentColor, resetAccentColor,
      demoActive, demoBusinessName, activateDemo, deactivateDemo,
      demoConfig, setDemoConfig,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

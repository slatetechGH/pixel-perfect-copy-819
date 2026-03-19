import React, { createContext, useContext, useState, ReactNode } from "react";

// ===== TYPES =====
export interface Lead {
  id: string;
  type: "signup" | "contact" | "newsletter";
  status: "new" | "reviewed" | "contacted";
  timestamp: string;
  notes: string;
  // Common fields
  email: string;
  name?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  // Contact-specific
  hearAbout?: string;
  message?: string;
  newsletter?: boolean;
  // Signup-specific
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

// ===== INITIAL MOCK DATA =====
const initialLeads: Lead[] = [
  // Signup requests
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
  // Contact enquiries
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
  // Newsletter signups
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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({ isLoggedIn: false, currentUser: "" });
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const addLead = (lead: Omit<Lead, "id" | "timestamp" | "status" | "notes">): boolean => {
    // Duplicate check for signup and newsletter
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
    <AppContext.Provider value={{ session, setSession, leads, setLeads, addLead }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

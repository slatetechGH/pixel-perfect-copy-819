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

export type UserRole = "admin" | "producer" | "customer";

export interface SessionState {
  isLoggedIn: boolean;
  currentUser: string;
  supabaseUser: User | null;
  supabaseSession: Session | null;
  profile: Record<string, any> | null;
  role: UserRole | null;
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

// ===== LEAD ↔ ROW TRANSFORMERS =====
function leadToRow(lead: Omit<Lead, "id" | "timestamp" | "status" | "notes"> & Partial<Pick<Lead, "id" | "timestamp" | "status" | "notes">>) {
  return {
    type: lead.type,
    status: lead.status || "new",
    email: lead.email,
    name: lead.name || null,
    phone: lead.phone || null,
    business_name: lead.businessName || null,
    business_type: lead.businessType || null,
    hear_about: lead.hearAbout || null,
    message: lead.message || null,
    newsletter: lead.newsletter || null,
    website: lead.website || null,
    customer_count: lead.customerCount || null,
    interests: lead.interests || null,
    additional_notes: lead.additionalNotes || null,
    interested_plan: lead.interestedPlan || null,
    terms: lead.terms || null,
    notes: lead.notes || "",
  };
}

function rowToLead(row: any): Lead {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    timestamp: row.created_at,
    email: row.email,
    name: row.name,
    phone: row.phone,
    businessName: row.business_name,
    businessType: row.business_type,
    hearAbout: row.hear_about,
    message: row.message,
    newsletter: row.newsletter,
    website: row.website,
    customerCount: row.customer_count,
    interests: row.interests,
    additionalNotes: row.additional_notes,
    interestedPlan: row.interested_plan,
    terms: row.terms,
    notes: row.notes || "",
  };
}

// ===== CONTEXT =====
interface AppContextType {
  session: SessionState;
  setSession: React.Dispatch<React.SetStateAction<SessionState>>;
  authLoading: boolean;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  addLead: (lead: Omit<Lead, "id" | "timestamp" | "status" | "notes">) => boolean;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  accentColor: string;
  setAccentColor: (color: string) => void;
  resetAccentColor: () => void;
  demoActive: boolean;
  demoBusinessName: string;
  activateDemo: (businessName: string, accent: string) => void;
  deactivateDemo: () => void;
  demoConfig: DemoProfile | null;
  setDemoConfig: (config: DemoProfile | null) => void;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({
    isLoggedIn: false, currentUser: "", supabaseUser: null, supabaseSession: null, profile: null, role: null,
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [accentColor, setAccentColorState] = useState<string>(DEFAULT_ACCENT);
  const [demoActive, setDemoActive] = useState(false);
  const [demoBusinessName, setDemoBusinessName] = useState("");
  const [demoConfig, setDemoConfig] = useState<DemoProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch profile helper
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    return data;
  };

  // Supabase auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, supaSession) => {
      if (supaSession?.user) {
        const profile = await fetchProfile(supaSession.user.id);
        setSession({
          isLoggedIn: true,
          currentUser: profile?.business_name || supaSession.user.email || "",
          supabaseUser: supaSession.user,
          supabaseSession: supaSession,
          profile,
        });
      } else {
        setSession({
          isLoggedIn: false, currentUser: "", supabaseUser: null, supabaseSession: null, profile: null,
        });
      }
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session: existing } }) => {
      if (existing?.user) {
        const profile = await fetchProfile(existing.user.id);
        setSession({
          isLoggedIn: true,
          currentUser: profile?.business_name || existing.user.email || "",
          supabaseUser: existing.user,
          supabaseSession: existing,
          profile,
        });
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch leads from Supabase when authenticated
  useEffect(() => {
    if (!session.supabaseUser) return;

    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (data && !error) {
        setLeads(data.map(rowToLead));
      }
    };

    fetchLeads();
  }, [session.supabaseUser?.id]);

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

    // Insert into Supabase (works for both anon and authenticated)
    const row = leadToRow(lead);
    supabase.from("leads").insert(row as any).select().single().then(({ data, error }) => {
      if (data && !error) {
        const newLead = rowToLead(data);
        setLeads(prev => [newLead, ...prev]);
      } else {
        // Fallback: add locally with generated id
        const fallbackLead: Lead = {
          ...lead,
          id: `${lead.type.slice(0, 3)}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: "new",
          notes: "",
        };
        setLeads(prev => [fallbackLead, ...prev]);
      }
    });

    return true;
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    if (session.supabaseUser) {
      const dbUpdates: Record<string, any> = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      await supabase.from("leads").update(dbUpdates).eq("id", id);
    }
  };

  const deleteLead = async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    if (session.supabaseUser) {
      await supabase.from("leads").delete().eq("id", id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession({ isLoggedIn: false, currentUser: "", supabaseUser: null, supabaseSession: null, profile: null });
  };

  return (
    <AppContext.Provider value={{
      session, setSession, authLoading, leads, setLeads, addLead, updateLead, deleteLead,
      accentColor, setAccentColor, resetAccentColor,
      demoActive, demoBusinessName, activateDemo, deactivateDemo,
      demoConfig, setDemoConfig, signOut,
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

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BroadcastsTab } from "@/components/broadcasts/BroadcastsTab";
import { ContactsTab } from "@/components/broadcasts/ContactsTab";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { useDashboard } from "@/contexts/DashboardContext";

export interface Broadcast {
  id: string;
  subject: string;
  body: string;
  target_segments: any[];
  recipient_count: number;
  status: string;
  sent_at: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  source: string;
  status: string;
  plan_id: string | null;
  invited_at: string | null;
  subscribed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

const Broadcasts = () => {
  const { session, demoActive } = useApp();
  const { plans, subscribers } = useDashboard();
  const producerId = session.supabaseUser?.id;
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("broadcasts");

  const fetchData = useCallback(async () => {
    if (!producerId || demoActive) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [bRes, cRes] = await Promise.all([
      supabase.from("broadcasts").select("*").eq("producer_id", producerId).order("created_at", { ascending: false }),
      supabase.from("contacts").select("*").eq("producer_id", producerId).order("created_at", { ascending: false }),
    ]);
    setBroadcasts((bRes.data as any[]) || []);
    setContacts((cRes.data as any[]) || []);
    setLoading(false);
  }, [producerId, demoActive]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <DashboardLayout title="Broadcasts" subtitle="Reach your audience with email broadcasts">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts
            {contacts.length > 0 && (
              <span className="ml-1.5 text-[11px] bg-muted rounded-full px-1.5 py-0.5">{contacts.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="broadcasts">
          <BroadcastsTab
            broadcasts={broadcasts}
            contacts={contacts}
            plans={plans}
            subscribers={subscribers}
            producerId={producerId || ""}
            loading={loading}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsTab
            contacts={contacts}
            plans={plans}
            producerId={producerId || ""}
            loading={loading}
            onRefresh={fetchData}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Broadcasts;

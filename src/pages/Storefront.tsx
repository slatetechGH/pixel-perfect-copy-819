import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Check, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SlateLogo from "@/components/SlateLogo";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

interface StorefrontProfile {
  id: string;
  business_name: string;
  description: string | null;
  accent_color: string;
  logo_url: string | null;
  cover_url: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  url_slug: string | null;
  business_type: string | null;
  stripe_connect_id: string | null;
  stripe_connect_status: string;
}

interface StorefrontPlan {
  id: string;
  name: string;
  price_num: number;
  is_free: boolean;
  benefits: string[];
  description: string | null;
  active: boolean;
  show_on_public_page: boolean;
  sort_order: number | null;
  collections_per_month: number;
}

interface StorefrontDrop {
  id: string;
  title: string;
  description: string | null;
  status: string;
  total: number;
  remaining: number;
  price_num: number;
  drop_date: string | null;
  eligible_plans: string[];
}

interface StorefrontContent {
  id: string;
  title: string;
  type: string;
  body: string | null;
  status: string;
  tier: string | null;
}

const Storefront = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [profile, setProfile] = useState<StorefrontProfile | null>(null);
  const [plans, setPlans] = useState<StorefrontPlan[]>([]);
  const [drops, setDrops] = useState<StorefrontDrop[]>([]);
  const [content, setContent] = useState<StorefrontContent[]>([]);
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);

  // Fetch all storefront data by slug — no auth required
  useEffect(() => {
    if (!businessSlug) { setNotFound(true); setLoading(false); return; }

    const fetchStorefront = async () => {
      try {
        // 1. Resolve slug to producer profile via public_profiles view
        const { data: pubProfile, error: profileErr } = await supabase
          .from("public_profiles")
          .select("*")
          .eq("url_slug", businessSlug)
          .eq("public_visible", true)
          .single();

        if (profileErr || !pubProfile?.id) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const producerId = pubProfile.id;

        // Build profile object from public_profiles (no PII exposed)
        // We need stripe info for checkout — fetch via profiles if user is the producer,
        // otherwise we pass producerId to the edge function which handles it server-side
        setProfile({
          id: producerId,
          business_name: pubProfile.business_name || "Untitled",
          description: pubProfile.description,
          accent_color: pubProfile.accent_color || "#1E293B",
          logo_url: pubProfile.logo_url,
          cover_url: pubProfile.cover_url,
          website: pubProfile.website,
          instagram: pubProfile.instagram,
          facebook: pubProfile.facebook,
          twitter: pubProfile.twitter,
          url_slug: pubProfile.url_slug,
          business_type: null,
          stripe_connect_id: null, // handled server-side in checkout
          stripe_connect_status: "unknown",
        });

        // 2. Fetch public plans, drops, content in parallel
        const [plansRes, dropsRes, contentRes] = await Promise.all([
          supabase
            .from("plans")
            .select("id, name, price_num, is_free, benefits, description, active, show_on_public_page, sort_order, collections_per_month")
            .eq("producer_id", producerId)
            .eq("active", true)
            .eq("show_on_public_page", true)
            .order("sort_order", { ascending: true }),
          supabase
            .from("drops")
            .select("id, title, description, status, total, remaining, price_num, drop_date, eligible_plans")
            .eq("producer_id", producerId)
            .in("status", ["scheduled", "live"]),
          supabase
            .from("content")
            .select("id, title, type, body, status, tier")
            .eq("producer_id", producerId)
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

        setPlans((plansRes.data || []) as StorefrontPlan[]);
        setDrops((dropsRes.data || []).slice(0, 3) as StorefrontDrop[]);
        setContent((contentRes.data || []) as StorefrontContent[]);
      } catch (err) {
        console.error("Storefront fetch error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefront();
  }, [businessSlug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not found
  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Store not found</h1>
          <p className="text-muted-foreground">This storefront doesn't exist yet.</p>
        </div>
      </div>
    );
  }

  const accentColor = profile.accent_color;

  const scrollToPlans = () => {
    document.getElementById("storefront-plans")?.scrollIntoView({ behavior: "smooth" });
  };

  const formatPrice = (priceNum: number) => `£${priceNum}/mo`;

  const handleSubscribe = async (plan: StorefrontPlan) => {
    if (plan.is_free) {
      navigate(`/store/${businessSlug}/join`);
      return;
    }

    setSubscribingPlan(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke("checkout-session", {
        body: {
          plan_id: plan.id,
          producer_id: profile.id,
          success_url: `${window.location.origin}/store/${businessSlug}/welcome?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/store/${businessSlug}`,
        },
      });

      if (error || data?.error) {
        toast.error(data?.error || "Something went wrong. Please try again.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setSubscribingPlan(null);
    }
  };

  // Find "most popular" plan (middle tier)
  const paidPlans = plans.filter(p => !p.is_free);
  const mostPopularIndex = Math.floor(paidPlans.length / 2);
  const mostPopularName = paidPlans[mostPopularIndex]?.name;

  // Countdown helper
  const getCountdown = (drop: StorefrontDrop) => {
    if (drop.status === "scheduled" && drop.drop_date) {
      const diff = new Date(drop.drop_date).getTime() - Date.now();
      if (diff > 0) {
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return `Starts in ${days} day${days !== 1 ? "s" : ""}`;
      }
    }
    return null;
  };

  // Social links
  const socialLinks = [
    profile.instagram && { label: "Instagram", url: `https://instagram.com/${profile.instagram.replace("@", "")}` },
    profile.facebook && { label: "Facebook", url: `https://facebook.com/${profile.facebook}` },
    profile.twitter && { label: "Twitter", url: `https://twitter.com/${profile.twitter.replace("@", "")}` },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <div className="min-h-screen bg-white" style={{ "--store-accent": accentColor } as React.CSSProperties}>
      {/* ===== SECTION A: Hero ===== */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 420 }}>
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10 flex flex-col items-center justify-end h-full px-6 pb-12 pt-32 text-center">
          {profile.logo_url ? (
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 shadow-lg mb-5 bg-white">
              <img src={profile.logo_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg mb-5"
              style={{ backgroundColor: accentColor }}
            >
              <span className="text-white font-bold text-3xl" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                {profile.business_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <motion.h1
            className="text-white font-bold tracking-tight leading-tight"
            style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {profile.business_name}
          </motion.h1>

          {profile.description && (
            <motion.p
              className="text-white/80 mt-3 max-w-lg text-base md:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {profile.description}
            </motion.p>
          )}

          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={scrollToPlans}
              className="h-12 px-8 text-base font-semibold rounded-full shadow-lg"
              style={{ backgroundColor: accentColor, color: "#fff" }}
            >
              View Plans & Subscribe
            </Button>
          </motion.div>

          {profile.website && (
            <motion.p
              className="text-white/50 text-sm mt-4 flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <MapPin className="w-3.5 h-3.5" />
              {profile.website}
            </motion.p>
          )}
        </div>
      </section>

      {/* ===== SECTION B: About ===== */}
      {profile.description && (
        <motion.section
          className="max-w-3xl mx-auto px-6 py-16 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">Welcome</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            {profile.description}
          </p>
        </motion.section>
      )}

      {/* ===== SECTION C: Subscription Plans ===== */}
      {plans.length > 0 && (
        <section id="storefront-plans" className="py-16 px-6" style={{ backgroundColor: "#FAFAFA" }}>
          <div className="max-w-5xl mx-auto">
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
            >
              Choose Your Plan
            </motion.h2>

            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
              {plans.map((plan, i) => {
                const isPopular = plan.name === mostPopularName;
                return (
                  <motion.div
                    key={plan.id}
                    className="snap-center shrink-0 w-[280px] md:w-auto bg-white rounded-2xl border p-6 flex flex-col relative"
                    style={{
                      borderColor: isPopular ? accentColor : "hsl(214, 20%, 88%)",
                      boxShadow: isPopular ? `0 4px 20px ${accentColor}20` : "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                  >
                    {isPopular && (
                      <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white px-3 py-1 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      >
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {plan.is_free ? "Free" : formatPrice(plan.price_num)}
                    </p>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                    )}
                    <ul className="mt-5 space-y-2.5 flex-1">
                      {(plan.benefits || []).map((b, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accentColor }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-6 h-11 rounded-lg font-semibold"
                      style={
                        isPopular
                          ? { backgroundColor: accentColor, color: "#fff" }
                          : { backgroundColor: "transparent", border: `1.5px solid ${accentColor}`, color: accentColor }
                      }
                      onClick={() => handleSubscribe(plan)}
                      disabled={subscribingPlan === plan.id}
                    >
                      {subscribingPlan === plan.id ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Processing...</>
                      ) : plan.is_free ? "Join Free" : "Subscribe"}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== SECTION D: Upcoming Drops ===== */}
      {drops.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
            >
              Coming Soon
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {drops.map((drop, i) => {
                const countdown = getCountdown(drop);
                return (
                  <motion.div
                    key={drop.id}
                    className="bg-white rounded-2xl border border-border p-5 flex flex-col"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                  >
                    <div
                      className="w-full h-32 rounded-xl mb-4 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}30)` }}
                    >
                      <Calendar className="w-8 h-8" style={{ color: accentColor, opacity: 0.5 }} />
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-foreground">{drop.title}</h3>
                      {countdown && (
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                        >
                          {countdown}
                        </span>
                      )}
                    </div>

                    {drop.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{drop.description}</p>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">£{drop.price_num.toFixed(2)}</span>
                      {drop.status === "live" && (
                        <span className="text-muted-foreground text-xs">
                          {drop.remaining}/{drop.total} remaining
                        </span>
                      )}
                    </div>

                    {(drop.eligible_plans || []).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Available to {drop.eligible_plans.join(" & ")} members
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== SECTION E: Latest Content ===== */}
      {content.length > 0 && (
        <section className="py-16 px-6" style={{ backgroundColor: "#FAFAFA" }}>
          <div className="max-w-5xl mx-auto">
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
            >
              Latest Recipes & Updates
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {content.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="bg-white rounded-2xl border border-border overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/store/${businessSlug}/content/${item.id}`)}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                >
                  <div
                    className="w-full h-36 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}25)` }}
                  >
                    <span className="text-3xl opacity-30">
                      {item.type === "Recipe" ? "🍽" : item.type === "Update" ? "📢" : item.type === "Story" ? "📖" : "💡"}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.tier === "Free" ? "Free for all" : `${item.tier} members`}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground group-hover:underline decoration-1 underline-offset-2">
                      {item.title}
                    </h3>
                    {item.body && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.body}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SECTION F: Footer ===== */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-foreground">{profile.business_name}</p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-2 justify-center md:justify-start">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href="/" className="flex items-center gap-1.5 opacity-40 hover:opacity-60 transition-opacity">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <SlateLogo size={12} asLink={false} />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Storefront;

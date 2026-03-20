import { useParams, useNavigate } from "react-router-dom";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { MapPin, Check, Clock, Users, Calendar, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SlateLogo from "@/components/SlateLogo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Storefront = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const { settings, plans, drops, content, subscribers } = useDashboard();
  const { accentColor, demoActive } = useApp();

  // Check if the slug matches the current settings
  const currentSlug = settings.urlSlug || settings.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Allow access if: demo mode is on, user is logged in (viewing own store), or slug matches
  const isOwnStore = !!session.isLoggedIn;
  const slugMatches = currentSlug && currentSlug === businessSlug;

  if (!demoActive && !isOwnStore && !slugMatches) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Store not found</h1>
          <p className="text-muted-foreground">This storefront doesn't exist yet.</p>
        </div>
      </div>
    );
  }

  const activePlans = plans.filter(p => p.active && p.showOnPublicPage);
  const upcomingDrops = drops.filter(d => d.status === "live" || d.status === "scheduled").slice(0, 3);
  const publishedContent = content.filter(c => c.status === "published").slice(0, 3);
  const activeSubscriberCount = subscribers.filter(s => s.status === "active").length;

  const scrollToPlans = () => {
    document.getElementById("storefront-plans")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubscribe = (planName: string) => {
    toast("Checkout coming soon", {
      description: `Subscribing to ${planName} will be available when payments are enabled.`,
    });
  };

  // Find "most popular" plan (middle tier by default)
  const paidPlans = activePlans.filter(p => !p.isFree);
  const mostPopularIndex = Math.floor(paidPlans.length / 2);
  const mostPopularName = paidPlans[mostPopularIndex]?.name;

  // Countdown helper
  const getCountdown = (drop: typeof drops[0]) => {
    if (drop.status === "scheduled" && drop.dropDate) {
      const diff = new Date(drop.dropDate).getTime() - Date.now();
      if (diff > 0) {
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return `Starts in ${days} day${days !== 1 ? "s" : ""}`;
      }
    }
    return null;
  };

  // Social links
  const socialLinks = [
    settings.instagram && { label: "Instagram", url: `https://instagram.com/${settings.instagram.replace("@", "")}` },
    settings.facebook && { label: "Facebook", url: `https://facebook.com/${settings.facebook}` },
    settings.twitter && { label: "Twitter", url: `https://twitter.com/${settings.twitter.replace("@", "")}` },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <div className="min-h-screen bg-white" style={{ "--store-accent": accentColor } as React.CSSProperties}>
      {/* ===== SECTION A: Hero ===== */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 420 }}>
        {/* Cover photo */}
        {settings.coverUrl ? (
          <img src={settings.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)` }} />
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10 flex flex-col items-center justify-end h-full px-6 pb-12 pt-32 text-center">
          {/* Logo */}
          {settings.logoUrl ? (
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 shadow-lg mb-5 bg-white">
              <img src={settings.logoUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg mb-5"
              style={{ backgroundColor: accentColor }}
            >
              <span className="text-white font-bold text-3xl" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                {settings.businessName.charAt(0).toUpperCase()}
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
            {settings.businessName}
          </motion.h1>

          {settings.description && (
            <motion.p
              className="text-white/80 mt-3 max-w-lg text-base md:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {settings.description}
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

          {settings.website && (
            <motion.p
              className="text-white/50 text-sm mt-4 flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <MapPin className="w-3.5 h-3.5" />
              {settings.website}
            </motion.p>
          )}
        </div>
      </section>

      {/* ===== SECTION B: About ===== */}
      {settings.description && (
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
            {settings.description}
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            {settings.businessType && (
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-base font-semibold text-foreground">{settings.businessType}</p>
              </div>
            )}
            {activeSubscriberCount > 0 && (
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Subscribers</p>
                <p className="text-base font-semibold text-foreground">{activeSubscriberCount}+</p>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* ===== SECTION C: Subscription Plans ===== */}
      {activePlans.length > 0 && (
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

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
              {activePlans.map((plan, i) => {
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
                      {plan.isFree ? "Free" : plan.price}
                    </p>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                    )}
                    <ul className="mt-5 space-y-2.5 flex-1">
                      {plan.benefits.map((b, j) => (
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
                      onClick={() => handleSubscribe(plan.name)}
                    >
                      {plan.isFree ? "Join Free" : "Subscribe"}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== SECTION D: Upcoming Drops ===== */}
      {upcomingDrops.length > 0 && (
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
              {upcomingDrops.map((drop, i) => {
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
                    {/* Placeholder image area */}
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
                      <span className="font-semibold text-foreground">{drop.price}</span>
                      {drop.status === "live" && (
                        <span className="text-muted-foreground text-xs">
                          {drop.remaining}/{drop.total} remaining
                        </span>
                      )}
                    </div>

                    {drop.eligiblePlans.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Available to {drop.eligiblePlans.join(" & ")} members
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
      {publishedContent.length > 0 && (
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
              {publishedContent.map((item, i) => (
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
                  {/* Placeholder hero */}
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

      {/* ===== SECTION F: Social Proof ===== */}
      {activeSubscriberCount > 10 && (
        <motion.section
          className="py-12 px-6 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            {/* Placeholder avatar circles */}
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-medium text-white"
                  style={{ backgroundColor: `hsl(${200 + i * 30}, 40%, ${55 + i * 5}%)` }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
          </div>
          <p className="text-muted-foreground text-base">
            Join <span className="font-semibold text-foreground">{activeSubscriberCount}+</span> subscribers
          </p>
        </motion.section>
      )}

      {/* ===== SECTION G: Footer ===== */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-foreground">{settings.businessName}</p>
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

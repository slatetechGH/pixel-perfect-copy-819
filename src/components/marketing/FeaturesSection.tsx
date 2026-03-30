import AnimatedSection from "./AnimatedSection";
import { Repeat, Flame, BarChart3, BookOpen, Layers, MessageCircle } from "lucide-react";
import FeatureMockupSubscriptions from "./FeatureMockupSubscriptions";
import FeatureMockupDrops from "./FeatureMockupDrops";
import FeatureMockupDashboard from "./FeatureMockupDashboard";
import FeatureMockupContent from "./FeatureMockupContent";
import FeatureMockupPlans from "./FeatureMockupPlans";
import FeatureMockupMessaging from "./FeatureMockupMessaging";

const features = [
  {
    icon: Repeat,
    eyebrow: "Subscriptions",
    title: "Subscription Management",
    desc: "Let customers subscribe to weekly, fortnightly, or monthly boxes. You set the rules — Slate handles the rest.",
    mockup: <FeatureMockupSubscriptions />,
  },
  {
    icon: Flame,
    eyebrow: "Drops",
    title: "Limited Releases",
    desc: "Launch exclusive products with countdown timers. Create urgency and reward your best customers first.",
    mockup: <FeatureMockupDrops />,
  },
  {
    icon: BarChart3,
    eyebrow: "Reports",
    title: "Your Dashboard",
    desc: "See your monthly income, customer growth, and activity in one clean view. Know exactly how your business is performing.",
    mockup: <FeatureMockupDashboard />,
  },
  {
    icon: BookOpen,
    eyebrow: "Content",
    title: "Recipes & Updates",
    desc: "Post recipes, stories, and updates. Keep customers engaged between deliveries and build a real community.",
    mockup: <FeatureMockupContent />,
  },
  {
    icon: Layers,
    eyebrow: "Plans",
    title: "Flexible Plans",
    desc: "Offer Standard, Premium, VIP — whatever works for your business. Customers upgrade themselves.",
    mockup: <FeatureMockupPlans />,
  },
  {
    icon: MessageCircle,
    eyebrow: "Email Updates",
    title: "Built-in Messaging",
    desc: "Talk directly to your customers. Announce new products, share updates — no third-party tools needed.",
    mockup: <FeatureMockupMessaging />,
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 md:py-32 bg-secondary">
    <div className="max-w-[1200px] mx-auto px-6 md:px-8">
      <AnimatedSection>
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-amber mb-3">
          Features
        </p>
        <h2 className="text-[32px] md:text-[40px] font-bold text-foreground leading-tight tracking-[-0.01em] mb-16 max-w-xl">
          Everything you need. Nothing you don't.
        </h2>
      </AnimatedSection>

      <div className="space-y-20">
        {features.map((f, i) => (
          <AnimatedSection key={f.title} delay={0.1}>
            <div
              className={`flex flex-col ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-10 md:gap-16 items-center`}
            >
              {/* Text */}
              <div className="flex-1">
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-amber mb-2">
                  {f.eyebrow}
                </p>
                <h3 className="text-[24px] md:text-[28px] font-bold text-foreground mb-3 tracking-[-0.01em]">
                  {f.title}
                </h3>
                <p className="text-[16px] text-slate-mid leading-relaxed max-w-md">
                  {f.desc}
                </p>
              </div>
              {/* Visual */}
              <div className="flex-1 w-full">
                <div className="bg-white rounded-2xl shadow-card p-5 flex items-center justify-center min-h-[220px]">
                  {f.mockup ? (
                    f.mockup
                  ) : (
                    <f.icon size={48} strokeWidth={1.2} className="text-slate-light/40" />
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;

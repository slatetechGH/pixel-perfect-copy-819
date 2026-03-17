import AnimatedSection from "./AnimatedSection";
import { Repeat, Flame, BarChart3, BookOpen, Layers, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Repeat,
    eyebrow: "Subscriptions",
    title: "Subscription Management",
    desc: "Let customers subscribe to weekly, fortnightly, or monthly boxes. You set the rules — Slate handles the rest.",
  },
  {
    icon: Flame,
    eyebrow: "Drops",
    title: "Product Drops",
    desc: "Launch limited-edition drops with countdown timers. Create urgency and reward your best customers first.",
  },
  {
    icon: BarChart3,
    eyebrow: "Analytics",
    title: "Subscriber Dashboard",
    desc: "See your MRR, churn, growth, and activity in one clean view. Know exactly how your business is performing.",
  },
  {
    icon: BookOpen,
    eyebrow: "Content",
    title: "Recipe & Content Sharing",
    desc: "Post recipes, stories, and updates. Keep subscribers engaged between deliveries and build a real community.",
  },
  {
    icon: Layers,
    eyebrow: "Plans",
    title: "Flexible Plans & Tiers",
    desc: "Offer Standard, Premium, VIP — whatever works for your business. Customers upgrade themselves.",
  },
  {
    icon: MessageCircle,
    eyebrow: "Messaging",
    title: "Built-in Messaging",
    desc: "Talk directly to your subscribers. Announce new products, share updates — no third-party tools needed.",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-20 md:py-28 bg-background">
    <div className="max-w-[1200px] mx-auto px-6 md:px-8">
      <AnimatedSection>
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-primary mb-3">
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
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-primary mb-2">
                  {f.eyebrow}
                </p>
                <h3 className="text-[24px] md:text-[28px] font-bold text-foreground mb-3 tracking-[-0.01em]">
                  {f.title}
                </h3>
                <p className="text-[16px] text-muted-foreground leading-relaxed max-w-md">
                  {f.desc}
                </p>
              </div>
              {/* Visual placeholder */}
              <div className="flex-1 w-full">
                <div className="bg-card rounded-2xl shadow-card p-8 flex items-center justify-center min-h-[220px]">
                  <f.icon size={48} strokeWidth={1.2} className="text-muted-foreground/30" />
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

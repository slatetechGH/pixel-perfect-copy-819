import AnimatedSection from "./AnimatedSection";
import { TrendingDown, MapPin, CalendarOff } from "lucide-react";

const pains = [
  {
    icon: TrendingDown,
    title: "Inconsistent revenue",
    desc: "One great week followed by three quiet ones. Your income shouldn't feel like a lottery.",
  },
  {
    icon: MapPin,
    title: "Relying on walk-ins",
    desc: "When customers can't come to you, you lose the sale — and maybe the customer forever.",
  },
  {
    icon: CalendarOff,
    title: "Gaps between purchases",
    desc: "Weeks pass between orders. No way to stay in touch or keep customers buying regularly.",
  },
];

const ProblemSection = () => (
  <section className="py-24 md:py-32 bg-white">
    <div className="max-w-[1200px] mx-auto px-6 md:px-8">
      <AnimatedSection>
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-amber mb-3">
          The Problem
        </p>
        <h2 className="text-[32px] md:text-[40px] font-bold text-foreground leading-tight tracking-[-0.01em] mb-12 max-w-2xl">
          You make incredible products. Selling them shouldn't be the hard part.
        </h2>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8">
        {pains.map(({ icon: Icon, title, desc }, i) => (
          <AnimatedSection key={title} delay={i * 0.1}>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Icon size={24} strokeWidth={1.5} className="text-slate-mid" />
              </div>
              <h3 className="text-[18px] font-bold text-foreground">{title}</h3>
              <p className="text-[16px] text-slate-mid leading-relaxed">{desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={0.4}>
        <p className="text-[18px] font-medium text-amber mt-12">Slate changes that.</p>
      </AnimatedSection>
    </div>
  </section>
);

export default ProblemSection;

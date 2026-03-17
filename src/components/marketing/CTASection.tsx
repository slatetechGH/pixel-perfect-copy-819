import AnimatedSection from "./AnimatedSection";
import { Button } from "@/components/ui/button";

const CTASection = () => (
  <section className="py-20 md:py-28 bg-sidebar">
    <div className="max-w-[1200px] mx-auto px-6 md:px-8 text-center">
      <AnimatedSection>
        <h2 className="text-[36px] md:text-[44px] font-bold text-white leading-tight tracking-[-0.02em] mb-4">
          Ready to build something worth subscribing to?
        </h2>
        <p className="text-[18px] text-slate-light mb-10 max-w-lg mx-auto">
          Join hundreds of independent producers already growing with Slate.
        </p>
        <Button
          size="lg"
          className="text-[15px] px-8 py-6 shadow-[0_0_24px_rgba(245,158,11,0.15)]"
        >
          Start for free
        </Button>
        <p className="text-[14px] text-slate-light mt-6">
          Free for your first 50 subscribers · Set up in under 10 minutes
        </p>
      </AnimatedSection>
    </div>
  </section>
);

export default CTASection;

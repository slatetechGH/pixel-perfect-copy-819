import AnimatedSection from "./AnimatedSection";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-32 bg-sidebar">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center">
        <AnimatedSection>
          <h2 className="text-[24px] md:text-[44px] font-bold text-white leading-tight tracking-[-0.02em] mb-4">
            Ready to build something worth subscribing to?
          </h2>
          <p className="text-[18px] text-slate-light mb-10 max-w-lg mx-auto">
            Join hundreds of independent producers already growing with Slate. Zero upfront cost — we only succeed when you do.
          </p>
          <Button
            variant="slate"
            size="lg"
            className="text-[15px] px-8 py-6 bg-white text-foreground hover:bg-white/90"
            onClick={() => navigate("/get-started")}
          >
            Get started
          </Button>
          <p className="text-[14px] text-slate-light mt-6">
            Free forever · 8% commission on what you earn · No hidden fees
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CTASection;

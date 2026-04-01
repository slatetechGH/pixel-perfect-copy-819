import AnimatedSection from "./AnimatedSection";

const TestimonialsSection = () => (
  <section id="testimonials" className="py-16 md:py-32 bg-white">
    <div className="max-w-[1200px] mx-auto px-6 md:px-8 text-center">
      <AnimatedSection>
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-amber mb-3">
          Who It's For
        </p>
        <h2 className="text-[32px] md:text-[40px] font-bold text-foreground leading-tight tracking-[-0.01em] mb-5">
          Built for producers like you
        </h2>
        <p className="text-[18px] md:text-[20px] text-slate-mid leading-relaxed max-w-2xl mx-auto">
          Slate is designed for independent food producers who want to build direct relationships with their customers through subscriptions.
        </p>
      </AnimatedSection>
    </div>
  </section>
);

export default TestimonialsSection;

import AnimatedSection from "./AnimatedSection";

const steps = [
  {
    num: "1",
    title: "Sign up free",
    desc: "Create your account in under two minutes. No credit card, no commitment.",
  },
  {
    num: "2",
    title: "Set your prices",
    desc: "Create subscription plans at whatever price works for your business. You're in control.",
  },
  {
    num: "3",
    title: "Share your page",
    desc: "Share your store link with customers. They subscribe and pay directly through Stripe.",
  },
  {
    num: "4",
    title: "Get paid",
    desc: "Money goes straight to your bank account. We take 8% — you keep the rest.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-16 md:py-32 bg-white">
    <div className="max-w-[1200px] mx-auto px-4 md:px-8">
      <AnimatedSection>
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-amber mb-3">
          How It Works
        </p>
        <h2 className="text-[32px] md:text-[40px] font-bold text-foreground leading-tight tracking-[-0.01em] mb-16">
          Up and running in minutes.
        </h2>
      </AnimatedSection>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
        {steps.map((s, i) => (
          <AnimatedSection key={s.num} delay={i * 0.1}>
            <div className="relative">
              <span className="text-[48px] font-bold text-amber/20 leading-none">{s.num}</span>
              <h3 className="text-[18px] font-medium text-foreground mt-2 mb-2">{s.title}</h3>
              <p className="text-[15px] text-slate-mid leading-relaxed">{s.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;

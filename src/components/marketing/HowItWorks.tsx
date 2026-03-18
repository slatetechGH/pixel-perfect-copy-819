import AnimatedSection from "./AnimatedSection";

const steps = [
  {
    num: "1",
    title: "Set up your slate",
    desc: "Create your profile, add your products, and set your subscription tiers.",
  },
  {
    num: "2",
    title: "Share your link",
    desc: "Send customers to your Slate page from your stall, social media, or website.",
  },
  {
    num: "3",
    title: "Watch it grow",
    desc: "Subscribers roll in, revenue becomes predictable, and you focus on what you do best.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 md:py-32 bg-white">
    <div className="max-w-[1200px] mx-auto px-6 md:px-8">
      <AnimatedSection>
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-amber mb-3">
          How It Works
        </p>
        <h2 className="text-[32px] md:text-[40px] font-bold text-foreground leading-tight tracking-[-0.01em] mb-16">
          Up and running in minutes.
        </h2>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-10">
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

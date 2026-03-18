import AnimatedSection from "./AnimatedSection";

const testimonials = [
  {
    quote: "Slate doubled my monthly income in three months. My regulars became subscribers overnight.",
    name: "Sarah Mitchell",
    role: "Mitchell's Smokehouse, Bristol",
  },
  {
    quote: "I used to dread quiet market days. Now I have 140 subscribers who order every week — rain or shine.",
    name: "James Thornton",
    role: "Thornton's Bakery, Edinburgh",
  },
  {
    quote: "The product drops feature is a game-changer. My limited-edition jams sell out in hours, not weeks.",
    name: "Anya Kapoor",
    role: "Hedgerow Preserves, Bath",
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 md:py-32 bg-white">
    <div className="max-w-[1200px] mx-auto px-6 md:px-8">
      <AnimatedSection>
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-amber mb-3">
          From Our Producers
        </p>
        <h2 className="text-[32px] md:text-[40px] font-bold text-foreground leading-tight tracking-[-0.01em] mb-16">
          Don't take our word for it.
        </h2>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <AnimatedSection key={t.name} delay={i * 0.1}>
            <div className="bg-card rounded-2xl p-8 shadow-card h-full flex flex-col">
              <span className="text-[64px] leading-none text-amber/15 font-bold">"</span>
              <p className="text-[17px] text-foreground leading-relaxed mb-6 -mt-4 flex-1">
                {t.quote}
              </p>
              <div>
                <p className="text-[15px] font-medium text-foreground">{t.name}</p>
                <p className="text-[14px] text-slate-light">{t.role}</p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;

import AnimatedSection from "./AnimatedSection";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const metrics = [
  { value: 2.4, prefix: "£", suffix: "M+", label: "Revenue processed" },
  { value: 12000, prefix: "", suffix: "+", label: "Active subscribers" },
  { value: 340, prefix: "", suffix: "+", label: "Independent producers" },
  { value: 98, prefix: "", suffix: "%", label: "Producer satisfaction" },
];

function CountUp({ target, prefix, suffix }: { target: number; prefix: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  const display = target >= 100 ? Math.round(val).toLocaleString() : val.toFixed(1);

  return (
    <span ref={ref} className="text-[36px] md:text-[48px] font-bold text-white">
      {prefix}{display}{suffix}
    </span>
  );
}

const MetricsSection = () => (
  <section className="py-24 md:py-32 bg-sidebar">
    <div className="max-w-[1200px] mx-auto px-6 md:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
        {metrics.map((m, i) => (
          <AnimatedSection key={m.label} delay={i * 0.1}>
            <CountUp target={m.value} prefix={m.prefix} suffix={m.suffix} />
            <p className="text-[15px] text-slate-light mt-2">{m.label}</p>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default MetricsSection;

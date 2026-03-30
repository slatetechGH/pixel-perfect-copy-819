import { Store, Palette, PoundSterling } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "1",
    icon: Store,
    title: "Sign up free",
    desc: "Create your account in 60 seconds",
  },
  {
    num: "2",
    icon: Palette,
    title: "Set up your store page",
    desc: "Add plans, recipes, and exclusive products",
  },
  {
    num: "3",
    icon: PoundSterling,
    title: "Start earning",
    desc: "Share your link and watch subscriptions roll in",
  },
];

const HowItWorksStrip = () => (
  <section className="bg-secondary py-12 md:py-14">
    <div className="max-w-[1200px] mx-auto px-6 md:px-8">
      <div className="grid md:grid-cols-3 gap-8 md:gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-foreground flex items-center justify-center relative">
              <s.icon size={18} className="text-white" strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber text-white text-[10px] font-bold flex items-center justify-center">
                {s.num}
              </span>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground mb-0.5">{s.title}</h3>
              <p className="text-[13px] text-slate-mid leading-relaxed">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksStrip;

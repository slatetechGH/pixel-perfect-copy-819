import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HeroSection = () => (
  <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-white overflow-hidden">
    {/* Subtle amber gradient wash */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent pointer-events-none" />

    <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Text */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[13px] font-medium uppercase tracking-[0.08em] text-primary mb-4"
          >
            For Independent Producers
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[40px] md:text-[64px] font-bold text-foreground leading-[1.05] tracking-[-0.02em] mb-6"
          >
            Your produce deserves a platform.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[18px] md:text-[20px] text-muted-foreground leading-relaxed mb-8 max-w-lg"
          >
            Slate helps independent producers build recurring revenue through subscriptions, product drops, and a direct line to their customers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <Button size="lg" className="text-[15px] px-7">Start for free</Button>
            <Button variant="outline" size="lg" className="text-[15px] px-7">
              See how it works
            </Button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-[14px] text-slate-light flex items-center gap-2"
          >
            <span className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="inline-block w-7 h-7 rounded-full bg-muted border-2 border-white"
                />
              ))}
            </span>
            Trusted by 200+ independent producers
          </motion.p>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="bg-sidebar rounded-2xl shadow-2xl p-1 overflow-hidden"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
            {/* Dashboard preview */}
            <div className="bg-background rounded-xl mx-1 mb-1 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-28 bg-foreground/10 rounded" />
                <div className="h-8 w-24 bg-primary/20 rounded-lg" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["£4,280", "312", "2.1%"].map((val, i) => (
                  <div key={i} className="bg-card rounded-xl p-4">
                    <div className="h-3 w-12 bg-muted-foreground/15 rounded mb-2" />
                    <p className="text-[18px] font-bold text-foreground">{val}</p>
                  </div>
                ))}
              </div>
              <div className="h-32 bg-muted/50 rounded-xl flex items-end px-4 pb-4 gap-2">
                {[40, 55, 45, 65, 70, 60, 80, 75, 90, 85, 95, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-foreground/60 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;

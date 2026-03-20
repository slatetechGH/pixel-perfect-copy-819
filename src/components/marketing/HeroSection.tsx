import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative">
        <div className="grid md:grid-cols-2 gap-16 md:gap-20 items-center">
          {/* Text */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[13px] font-medium uppercase tracking-[0.08em] text-amber mb-5"
            >
              For Independent Producers
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[40px] md:text-[64px] font-bold text-foreground leading-[1.05] tracking-[-0.02em] mb-7"
            >
              The free subscription platform for independent producers.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[18px] md:text-[20px] text-slate-mid leading-relaxed mb-10 max-w-lg"
            >
              Build recurring revenue with zero upfront cost. We only succeed when you do — taking just 6% of what you earn.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Button variant="slate" size="lg" className="text-[15px] px-7" onClick={() => navigate("/get-started")}>
                Get started free
              </Button>
              <Button variant="slate-outline" size="lg" className="text-[15px] px-7" onClick={scrollToHowItWorks}>
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
                    className="inline-block w-7 h-7 rounded-full bg-secondary border-2 border-white"
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
              className="bg-card rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-1 overflow-hidden"
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-light/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-light/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-light/30" />
              </div>
              {/* Dashboard preview */}
              <div className="bg-secondary rounded-xl mx-1 mb-1 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-28 bg-foreground/10 rounded" />
                  <div className="h-8 w-24 bg-foreground/10 rounded-lg" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["£4,280", "312", "2.1%"].map((val, i) => (
                    <div key={i} className="bg-white rounded-xl p-4">
                      <div className="h-3 w-12 bg-slate-light/20 rounded mb-2" />
                      <p className="text-[18px] font-bold text-foreground">{val}</p>
                    </div>
                  ))}
                </div>
                <div className="h-32 bg-white rounded-xl flex items-end px-4 pb-4 gap-2">
                  {[40, 55, 45, 65, 70, 60, 80, 75, 90, 85, 95, 88].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${i === 10 || i === 8 ? "bg-amber/50" : "bg-foreground/60"}`}
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
};

export default HeroSection;

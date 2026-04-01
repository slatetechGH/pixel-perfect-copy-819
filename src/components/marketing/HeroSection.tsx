import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, Package, Eye } from "lucide-react";

const miniBarHeights = [32, 45, 38, 52, 58, 72];

const DashboardPreview = () => (
  <div className="bg-card rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-1 overflow-hidden">
    {/* Browser chrome */}
    <div className="flex items-center gap-1.5 px-4 py-2.5">
      <span className="w-2.5 h-2.5 rounded-full bg-slate-light/30" />
      <span className="w-2.5 h-2.5 rounded-full bg-slate-light/30" />
      <span className="w-2.5 h-2.5 rounded-full bg-slate-light/30" />
    </div>
    {/* Cards grid */}
    <div className="bg-secondary rounded-xl mx-1 mb-1 p-4 md:p-5 grid grid-cols-2 gap-3">
      {/* Revenue */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp size={13} className="text-slate-light" strokeWidth={1.5} />
          <span className="text-[11px] font-medium text-slate-light">Monthly Income</span>
        </div>
        <p className="text-[22px] md:text-[26px] font-bold text-foreground leading-none mb-2">£4,280</p>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-full">
          <TrendingUp size={10} /> +18% vs last month
        </span>
        {/* Mini bar chart */}
        <div className="flex items-end gap-1 mt-3 h-8">
          {miniBarHeights.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all ${i === miniBarHeights.length - 1 ? "bg-amber" : "bg-foreground/15"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Customers */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Users size={13} className="text-slate-light" strokeWidth={1.5} />
          <span className="text-[11px] font-medium text-slate-light">Active Customers</span>
        </div>
        <p className="text-[22px] md:text-[26px] font-bold text-foreground leading-none mb-2">312</p>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-full">
          <TrendingUp size={10} /> +24 this month
        </span>
      </div>

      {/* Next Drop */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Package size={13} className="text-slate-light" strokeWidth={1.5} />
          <span className="text-[11px] font-medium text-slate-light">Next Drop</span>
        </div>
        <p className="text-[14px] font-semibold text-foreground leading-snug mb-1">Weekend Seafood Box</p>
        <p className="text-[11px] text-slate-mid mb-2">Launches in 3 days</p>
        <div className="w-full bg-foreground/10 rounded-full h-1.5">
          <div className="bg-amber rounded-full h-1.5" style={{ width: "68%" }} />
        </div>
        <p className="text-[10px] text-slate-light mt-1">68% reserved</p>
      </div>

      {/* Top Content */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Eye size={13} className="text-slate-light" strokeWidth={1.5} />
          <span className="text-[11px] font-medium text-slate-light">Most Popular Recipe</span>
        </div>
        <p className="text-[14px] font-semibold text-foreground leading-snug mb-1">Pan-Seared Sea Bass</p>
        <p className="text-[11px] text-slate-mid">1.2k views this month</p>
      </div>
    </div>
  </div>
);

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-28 pb-16 md:pt-44 md:pb-32 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center">
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
              className="text-[36px] md:text-[56px] font-bold text-foreground leading-[1.08] tracking-[-0.02em] mb-6"
            >
              Turn your regulars into subscribers.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[17px] md:text-[19px] text-slate-mid leading-relaxed mb-8 max-w-lg"
            >
              Slate gives independent producers a simple way to sell subscriptions, launch exclusive products, and reward loyal customers.
              <br /><br />
              Build predictable income and grow your business.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-4"
            >
              <Button variant="slate" size="lg" className="text-[15px] px-7 w-full sm:w-auto" onClick={() => navigate("/get-started")}>
                Get started
              </Button>
              <Button variant="slate-outline" size="lg" className="text-[15px] px-7 w-full sm:w-auto" onClick={scrollToHowItWorks}>
                See how it works
              </Button>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-[13px] text-slate-light"
            >
              No credit card required. No monthly fees. We only earn when you do.
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
              className="md:[transform:perspective(1000px)_rotateY(-5deg)]"
            >
              <DashboardPreview />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

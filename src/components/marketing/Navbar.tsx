import { useState, useEffect } from "react";
import { Menu, X, Layers, CreditCard, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SlateLogo from "@/components/SlateLogo";

const navLinks = [
  { label: "Features", href: "#features", icon: Layers },
  { label: "Pricing", href: "#pricing", icon: CreditCard },
  { label: "Testimonials", href: "#testimonials", icon: MessageSquare },
  { label: "Contact", href: "/contact", isRoute: true, icon: Mail },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string, isRoute?: boolean) => {
    setMobileOpen(false);
    if (isRoute) {
      navigate(href);
      return;
    }
    if (location.pathname === "/") {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/" + href);
    }
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1200px] mx-auto px-8 h-full flex items-center justify-between">
          <SlateLogo size={26} />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href, link.isRoute)}
                className="text-[15px] font-medium text-slate-mid hover:text-foreground relative group transition-colors duration-150 cursor-pointer"
              >
                {link.label}
                <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-amber group-hover:w-full transition-all duration-200" />
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate("/login"); }}
              className="text-[15px] font-medium text-slate-mid hover:text-foreground transition-colors cursor-pointer"
            >
              Log In
            </button>
            <Button type="button" variant="slate" size="sm" className="rounded-lg px-5" onClick={() => navigate("/get-started")}>
              Get Started
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex flex-col overflow-hidden"
            style={{
              background: "radial-gradient(ellipse at 50% 30%, hsl(217 33% 22%) 0%, hsl(217 33% 17%) 50%, hsl(222 47% 11%) 100%)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 h-16">
              <SlateLogo size={24} dark asLink={false} />
              <motion.button
                onClick={() => setMobileOpen(false)}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.25 }}
              >
                <X size={24} strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Divider */}
            <div className="mx-8 h-px bg-white/10" />

            {/* Nav links */}
            <div className="flex flex-col items-stretch px-6 mt-8 gap-1 flex-1">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.button
                    key={link.label}
                    onClick={() => handleNavClick(link.href, link.isRoute)}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.3, ease: "easeOut" }}
                    className="flex items-center gap-4 px-5 py-3.5 rounded-xl text-[17px] font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
                  >
                    <Icon size={18} strokeWidth={1.5} className="text-white/40" />
                    {link.label}
                  </motion.button>
                );
              })}

              {/* Spacer */}
              <div className="flex-1 min-h-8" />

              {/* Auth actions */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="flex flex-col items-center gap-3 pb-6"
              >
                <Button
                  size="lg"
                  className="w-full rounded-xl bg-amber text-white font-semibold hover:bg-amber-hover hover:shadow-lg transition-all duration-200"
                  onClick={() => { setMobileOpen(false); navigate("/get-started"); }}
                >
                  Get Started
                </Button>
                <button
                  onClick={() => { setMobileOpen(false); navigate("/login"); }}
                  className="text-[15px] font-medium text-white/50 hover:text-white/80 transition-colors cursor-pointer"
                >
                  Log In
                </button>
              </motion.div>

              {/* Footer tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="text-center text-[11px] text-white/20 pb-8 tracking-wide"
              >
                The free platform for independent producers
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

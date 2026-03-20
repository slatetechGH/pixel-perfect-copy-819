import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import SlateLogo from "@/components/SlateLogo";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "/contact", isRoute: true },
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
    // Anchor scroll — if on homepage, smooth scroll; otherwise navigate to / then scroll
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
              onClick={() => navigate("/login")}
              className="text-[15px] font-medium text-slate-mid hover:text-foreground transition-colors cursor-pointer"
            >
              Log In
            </button>
            <Button variant="slate" size="sm" className="rounded-lg px-5" onClick={() => navigate("/get-started")}>
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
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-sidebar flex flex-col">
          <div className="flex items-center justify-between px-8 h-16">
            <SlateLogo size={22} dark asLink={false} />
            <button onClick={() => setMobileOpen(false)} className="text-white">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href, link.isRoute)}
                className="text-[20px] font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <Button variant="slate" size="lg" className="mt-4 w-48" onClick={() => { setMobileOpen(false); navigate("/get-started"); }}>
              Get Started
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

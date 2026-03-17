import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <a href="/marketing" className="text-[22px] font-bold text-foreground tracking-tight">
            slate<span className="text-primary">.</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium text-muted-foreground hover:text-foreground relative group transition-colors duration-150"
              >
                {link.label}
                <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-200" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/" className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log In
            </a>
            <Button size="sm" className="rounded-lg px-5">
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
            <span className="text-[22px] font-bold text-white tracking-tight">
              slate<span className="text-primary">.</span>
            </span>
            <button onClick={() => setMobileOpen(false)} className="text-white">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[20px] font-medium text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button size="lg" className="mt-4 w-48" onClick={() => setMobileOpen(false)}>
              Get Started
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

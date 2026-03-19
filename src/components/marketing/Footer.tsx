import { Twitter, Instagram, Linkedin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import SlateLogo from "@/components/SlateLogo";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (hash: string) => {
    if (location.pathname === "/") {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate("/" + hash);
  };

  const columns = [
    {
      title: "Product",
      links: [
        { label: "Features", onClick: () => handleScroll("#features") },
        { label: "Pricing", onClick: () => handleScroll("#pricing") },
        { label: "Demo", onClick: () => toast("Demo video coming soon — watch this space") },
        { label: "Changelog", onClick: () => toast("Changelog coming soon") },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", onClick: () => toast("Blog coming soon — watch this space") },
        { label: "Help Centre", onClick: () => toast("Help Centre coming soon") },
        { label: "Careers", onClick: () => toast("No open positions right now — check back soon!") },
        { label: "Contact", onClick: () => navigate("/contact") },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", onClick: () => navigate("/privacy") },
        { label: "Terms", onClick: () => navigate("/terms") },
        { label: "Cookies", onClick: () => toast("Cookie policy coming soon") },
      ],
    },
  ];

  return (
    <footer className="bg-[hsl(222,47%,8%)] pt-16 pb-10">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3">
              <SlateLogo size={22} dark />
            </div>
            <p className="text-[14px] text-slate-light leading-relaxed mb-4 max-w-xs">
              The subscription platform for independent producers.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, url: "https://instagram.com" },
                { Icon: Twitter, url: "https://twitter.com" },
                { Icon: Linkedin, url: "https://linkedin.com" },
              ].map(({ Icon, url }) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-slate-light hover:text-white transition-colors">
                  <Icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[14px] font-medium text-white mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.onClick}
                      className="text-[14px] text-slate-light hover:text-white transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.08] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-slate-light">
            © {new Date().getFullYear()} Slate. All rights reserved.
          </p>
          <div className="flex gap-6">
            <button onClick={() => navigate("/privacy")} className="text-[12px] text-slate-light hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigate("/terms")} className="text-[12px] text-slate-light hover:text-white transition-colors cursor-pointer">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

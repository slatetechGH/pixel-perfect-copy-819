import { Twitter, Instagram, Linkedin } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Demo", "Changelog"],
  },
  {
    title: "Resources",
    links: ["Blog", "Help Centre", "API Docs", "Producers"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Cookies"],
  },
];

const Footer = () => (
  <footer id="contact" className="bg-[hsl(222,47%,8%)] pt-16 pb-10">
    <div className="max-w-[1200px] mx-auto px-6 md:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <p className="text-[22px] font-bold text-white tracking-tight mb-3">
            slate<span className="text-primary">.</span>
          </p>
          <p className="text-[14px] text-slate-light leading-relaxed mb-4 max-w-xs">
            The subscription platform for independent producers.
          </p>
          <div className="flex gap-3">
            {[Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="text-slate-light hover:text-white transition-colors">
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
                <li key={link}>
                  <a href="#" className="text-[14px] text-slate-light hover:text-white transition-colors">
                    {link}
                  </a>
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
          <a href="#" className="text-[12px] text-slate-light hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-[12px] text-slate-light hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

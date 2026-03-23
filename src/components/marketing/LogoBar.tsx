import AnimatedSection from "./AnimatedSection";
import { Beef, Fish, CakeSlice, Cherry, Wheat, Beer } from "lucide-react";

const producers = [
  { icon: Fish, label: "Fishmongers" },
  { icon: Beef, label: "Butchers" },
  { icon: CakeSlice, label: "Bakers" },
  { icon: Cherry, label: "Jam Makers" },
  { icon: Wheat, label: "Grain Mills" },
  { icon: Beer, label: "Breweries" },
];

const LogoBar = () => (
  <section className="bg-secondary py-10">
    <AnimatedSection>
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <p className="text-[14px] text-slate-light text-center mb-6">
          Trusted by independent producers across the UK
        </p>
        <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
          {producers.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-slate-light/50">
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[13px] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  </section>
);

export default LogoBar;

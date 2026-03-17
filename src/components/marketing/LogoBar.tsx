import AnimatedSection from "./AnimatedSection";
import { Store, Beef, Fish, CakeSlice, Cherry, Wheat } from "lucide-react";

const producers = [
  { icon: Beef, label: "Butchers" },
  { icon: Store, label: "Bakers" },
  { icon: Fish, label: "Fishmongers" },
  { icon: CakeSlice, label: "Patisseries" },
  { icon: Cherry, label: "Jam Makers" },
  { icon: Wheat, label: "Grain Mills" },
];

const LogoBar = () => (
  <section className="bg-background py-10">
    <AnimatedSection>
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <p className="text-[14px] text-slate-light text-center mb-6">
          Powering local producers across the UK
        </p>
        <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
          {producers.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-muted-foreground/50">
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

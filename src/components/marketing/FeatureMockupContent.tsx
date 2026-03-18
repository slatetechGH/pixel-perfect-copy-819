import { UtensilsCrossed, FileText, Plus } from "lucide-react";

const FeatureMockupContent = () => (
  <div className="w-full px-2 py-1 space-y-2.5">
    {/* Card 1 */}
    <div className="flex gap-3 items-start">
      <div className="w-[60px] h-[60px] shrink-0 rounded-md bg-secondary flex items-center justify-center">
        <UtensilsCrossed size={20} className="text-slate-light" strokeWidth={1.5} />
      </div>
      <div className="pt-0.5">
        <p className="text-[12px] font-medium text-foreground leading-tight">Pan-Seared Sea Bass</p>
        <span
          className="inline-block mt-1 text-[8px] font-medium px-1.5 py-0.5 rounded-sm"
          style={{ backgroundColor: "hsl(160 60% 45% / 0.1)", color: "#10B981" }}
        >
          Recipe
        </span>
        <p className="text-[9px] text-muted-foreground/60 mt-1">Prep: 15 min · Cook: 30 min</p>
      </div>
    </div>

    {/* Card 2 */}
    <div className="flex gap-3 items-start">
      <div className="w-[60px] h-[60px] shrink-0 rounded-md bg-secondary flex items-center justify-center">
        <FileText size={20} className="text-slate-light" strokeWidth={1.5} />
      </div>
      <div className="pt-0.5">
        <p className="text-[12px] font-medium text-foreground leading-tight">Bank Holiday Opening Hours</p>
        <span
          className="inline-block mt-1 text-[8px] font-medium px-1.5 py-0.5 rounded-sm"
          style={{ backgroundColor: "hsl(38 92% 50% / 0.1)", color: "#F59E0B" }}
        >
          Update
        </span>
        <p className="text-[9px] text-muted-foreground/60 mt-1">Posted 2 days ago</p>
      </div>
    </div>

    {/* Ghost button */}
    <div className="flex justify-center pt-1">
      <div className="flex items-center gap-1 border border-slate-light/40 rounded px-3 py-1.5">
        <Plus size={12} className="text-slate-mid" strokeWidth={2} />
        <span className="text-[10px] font-medium text-slate-mid">New post</span>
      </div>
    </div>
  </div>
);

export default FeatureMockupContent;

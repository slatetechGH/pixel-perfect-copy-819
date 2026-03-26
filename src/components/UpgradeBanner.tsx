import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeBannerProps {
  message: string;
  compact?: boolean;
}

export function UpgradeBanner({ message, compact }: UpgradeBannerProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber/10 border border-amber/20">
        <Sparkles className="h-3.5 w-3.5 text-amber shrink-0" />
        <p className="text-[12px] text-amber flex-1">{message}</p>
        <button
          onClick={() => navigate("/dashboard/upgrade")}
          className="text-[12px] font-medium text-amber hover:text-amber/80 transition-colors cursor-pointer whitespace-nowrap"
        >
          Upgrade →
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-amber/5 border border-amber/20 mb-5">
      <Sparkles className="h-5 w-5 text-amber shrink-0" />
      <p className="text-[14px] text-foreground flex-1">{message}</p>
      <button
        onClick={() => navigate("/dashboard/upgrade")}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber text-white text-[13px] font-medium hover:bg-amber/90 transition-colors cursor-pointer whitespace-nowrap"
      >
        Upgrade <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

import { useProducerLabels } from "@/hooks/useProducerLabels";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface LabelWithTooltipProps {
  term: string;
  className?: string;
}

export function LabelWithTooltip({ term, className }: LabelWithTooltipProps) {
  const { getLabel, getTooltip } = useProducerLabels();
  const label = getLabel(term);
  const tooltip = getTooltip(term);

  if (!tooltip) {
    return <span className={className}>{label}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className || ""}`}>
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-[12px]">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

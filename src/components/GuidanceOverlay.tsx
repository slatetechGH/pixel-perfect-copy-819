import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { GuidanceStep } from "@/hooks/usePageGuidance";

interface GuidanceOverlayProps {
  steps: GuidanceStep[];
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
}

export function GuidanceOverlay({ steps, currentStep, onNext, onSkip }: GuidanceOverlayProps) {
  if (steps.length === 0) return null;
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-colors duration-200 ${
                i <= currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <h3 className="text-[17px] font-semibold text-foreground mb-2">{step.title}</h3>
        <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">{step.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
          <Button size="sm" onClick={onNext} className="bg-foreground hover:bg-foreground/90 text-white">
            {isLast ? "Got it" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

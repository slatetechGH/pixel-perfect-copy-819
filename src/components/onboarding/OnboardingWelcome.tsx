import { Palette, CreditCard, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Props {
  onContinue: () => void;
}

export default function OnboardingWelcome({ onContinue }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-center"
    >
      <h1 className="text-[32px] md:text-[40px] font-bold text-foreground tracking-[-0.01em] mb-2">
        Welcome to Slate!
      </h1>
      <p className="text-[17px] text-muted-foreground mb-8 max-w-md">
        Let's get your storefront set up. This takes about 2 minutes.
      </p>

      {/* Mini storefront preview mockup */}
      <div className="w-full max-w-xs bg-secondary rounded-xl border border-border p-5 mb-8 shadow-sm">
        <div className="h-16 bg-muted rounded-lg mb-3" />
        <div className="h-3 w-2/3 bg-muted-foreground/15 rounded mb-2" />
        <div className="h-3 w-1/2 bg-muted-foreground/10 rounded mb-4" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 bg-amber/10 rounded-lg border border-amber/20" />
          <div className="h-14 bg-amber/10 rounded-lg border border-amber/20" />
        </div>
      </div>

      <div className="space-y-3 mb-10 text-left w-full max-w-xs">
        {[
          { icon: Palette, label: "Set your brand" },
          { icon: CreditCard, label: "Create your plans" },
          { icon: Link2, label: "Share your link" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-[15px] text-foreground">
            <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-amber" />
            </div>
            {label}
          </div>
        ))}
      </div>

      <Button variant="slate" className="w-full max-w-xs h-11 text-[15px]" onClick={onContinue}>
        Let's go →
      </Button>
    </motion.div>
  );
}

import { useState } from "react";
import { Copy, Check, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

interface Props {
  profile: Record<string, any>;
  userId: string;
}

export default function OnboardingShare({ profile, userId }: Props) {
  const navigate = useNavigate();
  const { setSession } = useApp();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const slug = profile?.url_slug ||
    (profile?.business_name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const storeUrl = `${window.location.origin}/store/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      // Update DB with timeout
      const dbUpdate = supabase.from("profiles").update({
        onboarding_completed: true,
        onboarding_step: 5,
      } as any).eq("id", userId);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timed out")), 5000)
      );

      await Promise.race([dbUpdate, timeout]).catch((err) => {
        console.warn("Onboarding DB update issue:", err);
        // Continue anyway — don't block the user
      });

      // CRITICAL: Update AppContext profile so RoleBasedDashboard doesn't redirect back
      setSession((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          onboarding_completed: true,
          onboarding_step: 5,
        },
      }));

      toast.success("You're all set! Your storefront is live.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Onboarding finish error:", err);
      toast.error("Something went wrong, but we're taking you to your dashboard.");
      // Still update context and navigate
      setSession((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          onboarding_completed: true,
          onboarding_step: 5,
        },
      }));
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <h1 className="text-[28px] md:text-[32px] font-bold text-foreground tracking-[-0.01em] mb-1">
        You're live! 🎉
      </h1>
      <p className="text-[16px] text-muted-foreground mb-8">
        Your storefront is ready. Share this link with your customers and watch the subscriptions roll in.
      </p>

      {/* URL display */}
      <div className="bg-secondary rounded-xl border border-border p-4 mb-6">
        <p className="text-[13px] text-muted-foreground mb-2">Your storefront link</p>
        <p className="text-[16px] font-medium text-foreground break-all">{storeUrl}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <Button variant="outline" className="flex-1" onClick={handleCopy}>
          {copied ? <Check size={16} className="mr-1.5" /> : <Copy size={16} className="mr-1.5" />}
          {copied ? "Copied!" : "Copy link"}
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => setShowQR(!showQR)}>
          <QrCode size={16} className="mr-1.5" /> QR code
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => window.open(storeUrl, "_blank")}>
          <ExternalLink size={16} className="mr-1.5" /> Preview
        </Button>
      </div>

      {/* QR code */}
      {showQR && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6 inline-block">
          <QRCodeSVG value={storeUrl} size={180} />
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber/5 rounded-lg border border-amber/20 p-4 mb-8 text-left">
        <p className="text-[13px] font-medium text-foreground mb-2">Quick tips</p>
        <ul className="space-y-1.5 text-[14px] text-muted-foreground">
          <li>• Add this link to your Instagram bio</li>
          <li>• Include it in your next email newsletter</li>
          <li>• Print the QR code for your shop counter</li>
        </ul>
      </div>

      <Button variant="slate" className="w-full h-11 text-[15px]" onClick={handleFinish} disabled={finishing}>
        {finishing ? "Setting up..." : "Go to my dashboard →"}
      </Button>
    </motion.div>
  );
}

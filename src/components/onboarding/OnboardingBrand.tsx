import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const businessTypes = [
  "Butcher", "Baker", "Fishmonger", "Cheesemonger", "Farm Shop",
  "Brewery", "Café / Restaurant", "Other",
];

const presetColors = [
  "#D97706", "#EF4444", "#10B981", "#0EA5E9", "#8B5CF6",
  "#EC4899", "#14B8A6", "#1E293B",
];

interface Props {
  profile: Record<string, any>;
  userId: string;
  onContinue: () => void;
  onSkip: () => void;
}

export default function OnboardingBrand({ profile, userId, onContinue, onSkip }: Props) {
  const [businessName, setBusinessName] = useState(profile?.business_name || "");
  const [businessType, setBusinessType] = useState(profile?.business_type || "");
  const [tagline, setTagline] = useState(profile?.tagline || "");
  const [accentColor, setAccentColor] = useState(profile?.accent_color || "#D97706");
  const [customHex, setCustomHex] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(profile?.logo_url || null);
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const path = `${userId}_logo_${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
      if (error) { toast.error("Upload failed"); return; }
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      setLogoUrl(urlData.publicUrl);
      toast.success("Logo uploaded");
    };
    input.click();
  };

  const handleContinue = async () => {
    if (!businessName.trim()) { toast.error("Business name is required"); return; }
    if (!businessType) { toast.error("Business type is required"); return; }
    setSaving(true);
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await supabase.from("profiles").update({
      business_name: businessName,
      business_type: businessType,
      tagline: tagline || null,
      accent_color: accentColor,
      logo_url: logoUrl,
      url_slug: slug,
      onboarding_step: 3,
    } as any).eq("id", userId);
    setSaving(false);
    onContinue();
  };

  const inputCls = "w-full h-11 px-4 rounded-lg border border-border bg-white text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all";

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <h1 className="text-[28px] md:text-[32px] font-bold text-foreground tracking-[-0.01em] mb-1 text-center">
        Make it yours
      </h1>
      <p className="text-[16px] text-muted-foreground mb-8 text-center">
        Add your business details so customers know who you are.
      </p>

      <div className="space-y-5">
        <div>
          <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Business Name <span className="text-amber">*</span></label>
          <input value={businessName} onChange={e => setBusinessName(e.target.value)} className={inputCls} placeholder="Your business name" />
        </div>
        <div>
          <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Business Type <span className="text-amber">*</span></label>
          <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={inputCls + " appearance-none"}>
            <option value="">Select...</option>
            {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Tagline</label>
          <input value={tagline} onChange={e => setTagline(e.target.value)} className={inputCls} placeholder="e.g. Premium sustainable fish, caught daily from the coast" />
        </div>
        <div>
          <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">Logo</label>
          <div
            onClick={handleLogoUpload}
            className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground hover:border-foreground/30 transition-colors cursor-pointer overflow-hidden"
          >
            {logoUrl ? (
              <img src={logoUrl} className="h-full w-full object-contain p-2" alt="Logo" />
            ) : (
              <span className="flex items-center gap-2 text-[14px]"><Upload size={18} /> Upload logo</span>
            )}
          </div>
        </div>
        <div>
          <label className="text-[13px] font-medium text-muted-foreground block mb-2">Accent Colour</label>
          <div className="flex items-center gap-2 flex-wrap">
            {presetColors.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { setAccentColor(c); setCustomHex(""); }}
                className={`w-8 h-8 rounded-full transition-all cursor-pointer ${accentColor === c ? "ring-2 ring-foreground ring-offset-2" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              value={customHex}
              onChange={e => {
                setCustomHex(e.target.value);
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setAccentColor(e.target.value);
              }}
              className="w-24 h-8 px-2 rounded-lg border border-border text-[13px] text-foreground"
              placeholder="#hex"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Button variant="slate" className="w-full h-11 text-[15px]" onClick={handleContinue} disabled={saving}>
          {saving ? "Saving..." : "Continue →"}
        </Button>
        <button onClick={onSkip} className="w-full text-center text-[14px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          I'll do this later
        </button>
      </div>
    </motion.div>
  );
}

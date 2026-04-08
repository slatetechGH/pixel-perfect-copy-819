import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Printer, Download, ExternalLink, MessageCircle, Mail, Instagram, MessageSquare, Check } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { toast } from "sonner";
import SlateLogo from "@/components/SlateLogo";
import { QRCodeSVG } from "qrcode.react";

const DOMAIN = "slatetech.co.uk";

const ShareMySlate = () => {
  const { session, demoActive } = useApp();
  const { settings } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [bioCopied, setBioCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const profileBusinessName = session.profile?.business_name || "";
  const slug =
    settings.urlSlug ||
    settings.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ||
    session.profile?.url_slug ||
    (profileBusinessName
      ? profileBusinessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : "");

  const storefrontUrl = `https://${DOMAIN}/store/${slug}`;
  const accentColor = session.profile?.accent_color || settings.accentColor || "#F59E0B";
  const businessName = settings.businessName || profileBusinessName || "My Business";
  const tagline = settings.description || session.profile?.description || "";
  const logoUrl = settings.logoUrl || session.profile?.logo_url || null;

  const copyLink = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    // Use canvas approach to render the card as PNG
    try {
      const card = cardRef.current;
      if (!card) return;
      // Simple SVG-based download using the QR code
      const svg = card.querySelector("svg");
      if (!svg) { toast.error("Could not generate image"); return; }
      
      // Create a canvas with the card contents
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = card.offsetWidth * scale;
      canvas.height = card.offsetHeight * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, card.offsetWidth, card.offsetHeight);

      // Draw text content
      const centerX = card.offsetWidth / 2;
      let y = 60;

      // Business name
      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 28px Satoshi, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(businessName, centerX, y);
      y += 30;

      // Tagline
      if (tagline) {
        ctx.fillStyle = "#64748B";
        ctx.font = "16px Satoshi, sans-serif";
        ctx.fillText(tagline.length > 50 ? tagline.slice(0, 50) + "…" : tagline, centerX, y);
        y += 40;
      } else {
        y += 20;
      }

      // QR Code — render SVG to canvas
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const qrSize = 200;
          ctx.drawImage(img, centerX - qrSize / 2, y, qrSize, qrSize);
          y += qrSize + 24;

          ctx.fillStyle = "#1E293B";
          ctx.font = "bold 16px Satoshi, sans-serif";
          ctx.fillText("Scan to subscribe", centerX, y);
          y += 22;

          ctx.fillStyle = "#94A3B8";
          ctx.font = "14px Satoshi, sans-serif";
          ctx.fillText(storefrontUrl.replace("https://", ""), centerX, y);
          y += 40;

          // Powered by
          ctx.fillStyle = "#94A3B8";
          ctx.font = "12px Satoshi, sans-serif";
          ctx.fillText("Powered by Slate", centerX, y);

          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });

      const link = document.createElement("a");
      link.download = `${slug}-share-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Card downloaded!");
    } catch {
      toast.error("Failed to download card");
    }
  };

  const shareWhatsApp = () => {
    const text = `Check out my page on Slate! Subscribe for exclusive deals and member perks: ${storefrontUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`Subscribe to ${businessName}`);
    const body = encodeURIComponent(
      `Hey! I've set up a subscription page where you can get exclusive deals, priority access, and member perks. Check it out: ${storefrontUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const smsText = `Hey! I've just launched memberships at ${businessName}. Scan the QR or visit ${storefrontUrl.replace("https://", "")} to subscribe and get exclusive perks!`;

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    toast.success("Copied!");
    setTimeout(() => setter(false), 2000);
  };

  return (
    <DashboardLayout title="Share My Slate" subtitle="Everything you need to promote your storefront">
      {/* Storefront URL */}
      <div className="mb-8 p-4 rounded-xl border border-border bg-card">
        <p className="text-sm font-medium text-muted-foreground mb-2">Your storefront</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <code className="text-sm text-foreground font-medium break-all flex-1">
            {storefrontUrl.replace("https://", "")}
          </code>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyLink} className="gap-1.5 min-h-[44px]">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" variant="outline" asChild className="gap-1.5 min-h-[44px]">
              <a href={`/store/${slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" /> View
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Branded Share Card */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">Your Share Card</h2>
        <p className="text-sm text-muted-foreground mb-4">Print this card and display it at your stall, or share it digitally.</p>

        {/* Print-optimized card */}
        <div
          ref={cardRef}
          className="mx-auto bg-white rounded-2xl border border-border shadow-sm p-8 sm:p-10 flex flex-col items-center print-card"
          style={{ maxWidth: 420 }}
        >
          {logoUrl ? (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border mb-4">
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: accentColor }}
            >
              <span className="text-white font-bold text-2xl">{businessName.charAt(0).toUpperCase()}</span>
            </div>
          )}

          <h3 className="text-2xl font-bold text-foreground text-center">{businessName}</h3>
          {tagline && (
            <p className="text-sm text-muted-foreground text-center mt-1 max-w-[280px]">{tagline}</p>
          )}

          <div className="my-6">
            <QRCodeSVG value={storefrontUrl} size={200} level="H" />
          </div>

          <p className="text-base font-semibold text-foreground">Scan to subscribe</p>
          <p className="text-sm text-muted-foreground mt-1">{storefrontUrl.replace("https://", "")}</p>

          <div className="w-full border-t border-border mt-6 pt-4 flex items-center justify-center gap-1.5">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <SlateLogo size={12} asLink={false} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 max-w-[420px] mx-auto">
          <Button variant="outline" onClick={handlePrint} className="flex-1 gap-2 min-h-[48px]">
            <Printer className="w-4 h-4" /> Print Card
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex-1 gap-2 min-h-[48px]">
            <Download className="w-4 h-4" /> Download PNG
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-3 max-w-[420px] mx-auto">
          <Button variant="outline" onClick={copyLink} className="flex-1 gap-2 min-h-[48px]">
            <Copy className="w-4 h-4" /> Copy Link
          </Button>
          <Button variant="outline" onClick={shareWhatsApp} className="flex-1 gap-2 min-h-[48px]">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </Button>
          <Button variant="outline" onClick={shareEmail} className="flex-1 gap-2 min-h-[48px]">
            <Mail className="w-4 h-4" /> Email
          </Button>
        </div>
      </div>

      {/* More ways to share */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">More ways to share</h2>

        {/* Instagram Bio Link */}
        <Card className="p-4 border-0 shadow-card">
          <div className="flex items-start gap-3">
            <Instagram className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">Instagram Bio Link</p>
              <p className="text-xs text-muted-foreground mb-2">Paste this in your Instagram bio</p>
              <div className="flex items-center gap-2">
                <code className="text-sm text-foreground bg-muted px-3 py-1.5 rounded-lg break-all flex-1">
                  {storefrontUrl.replace("https://", "")}
                </code>
                <Button size="sm" variant="outline" onClick={() => copyText(storefrontUrl, setBioCopied)} className="shrink-0 min-h-[44px]">
                  {bioCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Text Message */}
        <Card className="p-4 border-0 shadow-card">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">Text Message</p>
              <p className="text-xs text-muted-foreground mb-2">Copy and send to your customers</p>
              <div className="bg-muted rounded-lg p-3 mb-2">
                <p className="text-sm text-foreground">{smsText}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => copyText(smsText, setTextCopied)} className="gap-1.5 min-h-[44px]">
                {textCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {textCopied ? "Copied" : "Copy Text"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Market Stall Signage */}
        <Card className="p-4 border-0 shadow-card">
          <div className="flex items-start gap-3">
            <Printer className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">Market Stall Signage</p>
              <p className="text-sm text-muted-foreground">
                Print the card above and display it at your stall. Customers can scan the QR code with their phone camera to subscribe instantly.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-card, .print-card * { visibility: visible !important; }
          .print-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            border: none !important;
            box-shadow: none !important;
            max-width: none !important;
            width: 148mm !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default ShareMySlate;

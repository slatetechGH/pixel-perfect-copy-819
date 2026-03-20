import { useParams, useNavigate } from "react-router-dom";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, CreditCard, MessageSquare, ArrowUpDown, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const StorefrontAccount = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const { settings } = useDashboard();
  const { accentColor } = useApp();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back */}
        <button
          onClick={() => navigate(`/store/${businessSlug}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {settings.businessName}
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-2">My Account</h1>
        <p className="text-muted-foreground mb-10">Manage your subscription with {settings.businessName}</p>

        {/* Coming soon card */}
        <div
          className="rounded-2xl border border-border p-10 text-center"
          style={{ backgroundColor: `${accentColor}05` }}
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <CreditCard className="w-7 h-7" style={{ color: accentColor }} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Manage your subscription, view order history, and contact {settings.businessName} — all from one place.
            This page will be available once payments are enabled.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { icon: ArrowUpDown, label: "Upgrade / Downgrade" },
              { icon: Pause, label: "Pause subscription" },
              { icon: X, label: "Cancel subscription" },
              { icon: MessageSquare, label: `Message ${settings.businessName}` },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground"
              >
                <Icon className="w-4 h-4" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorefrontAccount;

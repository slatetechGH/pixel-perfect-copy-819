import { useParams, useNavigate } from "react-router-dom";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users as UsersIcon, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const StorefrontContent = () => {
  const { businessSlug, contentId } = useParams<{ businessSlug: string; contentId: string }>();
  const navigate = useNavigate();
  const { settings, content, plans } = useDashboard();
  const { accentColor } = useApp();

  const item = content.find(c => c.id === contentId);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Content not found</h1>
          <p className="text-muted-foreground mb-4">This page doesn't exist.</p>
          <Button variant="outline" onClick={() => navigate(`/store/${businessSlug}`)}>
            Back to {settings.businessName}
          </Button>
        </div>
      </div>
    );
  }

  // Simulate tier gating — for demo, show content if tier is "Free" or show gated view
  const isFree = item.tier === "Free" || item.eligiblePlans.some(p => {
    const plan = plans.find(pl => pl.name === p);
    return plan?.isFree;
  });

  const handleSubscribeCTA = () => {
    toast("Checkout coming soon", {
      description: "Subscribing will be available when payments are enabled.",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div
        className="w-full h-56 md:h-72 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}35)` }}
      >
        <span className="text-6xl opacity-20">
          {item.type === "Recipe" ? "🍽" : item.type === "Update" ? "📢" : item.type === "Story" ? "📖" : "💡"}
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back link */}
        <button
          onClick={() => navigate(`/store/${businessSlug}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {settings.businessName}
        </button>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
          >
            {item.type}
          </span>
          {item.date && item.date !== "—" && (
            <span className="text-sm text-muted-foreground">{item.date}</span>
          )}
        </div>

        {/* Title */}
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-foreground leading-tight"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {item.title}
        </motion.h1>

        {/* Recipe meta */}
        {item.type === "Recipe" && (item.prepTime || item.cookTime || item.serves) && (
          <div className="flex flex-wrap gap-5 mt-5 text-sm text-muted-foreground">
            {item.prepTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Prep: {item.prepTime}
              </div>
            )}
            {item.cookTime && (
              <div className="flex items-center gap-1.5">
                <ChefHat className="w-4 h-4" />
                Cook: {item.cookTime}
              </div>
            )}
            {item.serves && (
              <div className="flex items-center gap-1.5">
                <UsersIcon className="w-4 h-4" />
                Serves: {item.serves}
              </div>
            )}
          </div>
        )}

        {/* Content body — gated or full */}
        {isFree ? (
          <div className="mt-8 space-y-6">
            {item.body && (
              <p className="text-base text-foreground leading-relaxed">{item.body}</p>
            )}

            {/* Ingredients */}
            {item.ingredients && item.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Ingredients</h3>
                <ul className="space-y-1.5">
                  {item.ingredients.map((ing, i) => (
                    <li key={i} className="text-sm text-foreground flex items-baseline gap-2">
                      <span className="font-medium" style={{ color: accentColor }}>{ing.quantity}</span>
                      <span>{ing.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Method steps */}
            {item.methodSteps && item.methodSteps.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Method</h3>
                <ol className="space-y-3">
                  {item.methodSteps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground">
                      <span
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ) : (
          /* Gated content */
          <div className="mt-8 relative">
            <p className="text-base text-foreground leading-relaxed blur-sm select-none">
              {item.body || "This exclusive content is packed with detailed instructions, tips, and insights that will help you create something truly special at home. Our premium members get access to all of our carefully crafted content..."}
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-border max-w-sm">
                <p className="text-base font-semibold text-foreground mb-2">
                  This {item.type.toLowerCase()} is exclusive to {item.tier} members
                </p>
                <p className="text-sm text-muted-foreground mb-5">
                  Subscribe to unlock all exclusive content
                </p>
                <Button
                  className="h-11 px-6 rounded-full font-semibold"
                  style={{ backgroundColor: accentColor, color: "#fff" }}
                  onClick={handleSubscribeCTA}
                >
                  Subscribe to unlock
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{ backgroundColor: `${accentColor}08` }}
        >
          <p className="text-lg font-bold text-foreground mb-2">
            Want more {item.type === "Recipe" ? "recipes" : "content"} like this?
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Subscribe to {settings.businessName} for exclusive access
          </p>
          <Button
            className="h-11 px-8 rounded-full font-semibold"
            style={{ backgroundColor: accentColor, color: "#fff" }}
            onClick={() => navigate(`/store/${businessSlug}#storefront-plans`)}
          >
            View Plans
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StorefrontContent;

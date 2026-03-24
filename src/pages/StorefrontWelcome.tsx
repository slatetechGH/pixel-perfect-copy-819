import { useParams, useNavigate } from "react-router-dom";
import { useDashboard } from "@/contexts/DashboardContext";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { CheckCircle, BookOpen, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import SlateLogo from "@/components/SlateLogo";

const StorefrontWelcome = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const { settings } = useDashboard();
  const { accentColor } = useApp();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          className="max-w-lg w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: accentColor }} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            Welcome to {settings.businessName}!
          </h1>
          <p className="text-muted-foreground text-base mb-8">
            Your subscription is now active. You're all set to enjoy exclusive content, drops, and more.
          </p>

          <div className="bg-secondary/50 rounded-xl p-6 text-left mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-4">What happens next:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 mt-0.5 shrink-0" style={{ color: accentColor }} />
                <div>
                  <p className="text-sm font-medium text-foreground">Exclusive content</p>
                  <p className="text-xs text-muted-foreground">Access recipes, updates, and stories reserved for subscribers.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="w-5 h-5 mt-0.5 shrink-0" style={{ color: accentColor }} />
                <div>
                  <p className="text-sm font-medium text-foreground">Product drops</p>
                  <p className="text-xs text-muted-foreground">Get early access to limited-edition product drops.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <User className="w-5 h-5 mt-0.5 shrink-0" style={{ color: accentColor }} />
                <div>
                  <p className="text-sm font-medium text-foreground">Your account</p>
                  <p className="text-xs text-muted-foreground">Manage your subscription and preferences anytime.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate(`/store/${businessSlug}`)}
              className="h-11 px-6 rounded-lg font-semibold"
              style={{ backgroundColor: accentColor, color: "#fff" }}
            >
              Browse Content
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/store/${businessSlug}/account`)}
              className="h-11 px-6 rounded-lg"
            >
              Your Account
            </Button>
          </div>
        </motion.div>
      </div>

      <footer className="py-6 text-center">
        <a href="/" className="flex items-center gap-1.5 justify-center opacity-40 hover:opacity-60 transition-opacity">
          <span className="text-xs text-muted-foreground">Powered by</span>
          <SlateLogo size={12} asLink={false} />
        </a>
      </footer>
    </div>
  );
};

export default StorefrontWelcome;

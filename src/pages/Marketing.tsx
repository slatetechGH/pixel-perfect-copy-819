import Navbar from "@/components/marketing/Navbar";
import HeroSection from "@/components/marketing/HeroSection";
import LogoBar from "@/components/marketing/LogoBar";
import ProblemSection from "@/components/marketing/ProblemSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import HowItWorks from "@/components/marketing/HowItWorks";
import MetricsSection from "@/components/marketing/MetricsSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import PricingSection from "@/components/marketing/PricingSection";
import CTASection from "@/components/marketing/CTASection";
import Footer from "@/components/marketing/Footer";

const Marketing = () => (
  <div className="min-h-screen bg-white">
    <Navbar />
    <HeroSection />
    <LogoBar />
    <ProblemSection />
    <FeaturesSection />
    <HowItWorks />
    <MetricsSection />
    <TestimonialsSection />
    <PricingSection />
    <CTASection />
    <Footer />
  </div>
);

export default Marketing;

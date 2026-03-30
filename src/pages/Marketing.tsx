import Navbar from "@/components/marketing/Navbar";
import HeroSection from "@/components/marketing/HeroSection";
import HowItWorks from "@/components/marketing/HowItWorks";
import PricingSection from "@/components/marketing/PricingSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import CTASection from "@/components/marketing/CTASection";
import EmailCapture from "@/components/marketing/EmailCapture";
import Footer from "@/components/marketing/Footer";

const Marketing = () => (
  <div className="min-h-screen bg-white">
    <Navbar />
    <HeroSection />
    <HowItWorks />
    <PricingSection />
    <FeaturesSection />
    <TestimonialsSection />
    <CTASection />
    <EmailCapture />
    <Footer />
  </div>
);

export default Marketing;

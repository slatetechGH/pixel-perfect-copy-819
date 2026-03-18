import { useNavigate } from "react-router-dom";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

const Terms = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-24 max-w-[640px] mx-auto px-6">
        <h1 className="text-[36px] font-bold text-foreground tracking-[-0.01em] mb-6">Terms of Service</h1>
        <p className="text-[16px] text-slate-mid leading-relaxed mb-6">
          Our terms of service are being finalised. For any questions, please contact us at{" "}
          <a href="mailto:hello@getslate.co" className="text-amber hover:underline">hello@getslate.co</a>.
        </p>
        <button onClick={() => navigate("/contact")} className="text-[15px] font-medium text-amber hover:text-amber-hover transition-colors cursor-pointer">
          Contact us →
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;

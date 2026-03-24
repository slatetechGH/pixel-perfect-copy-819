import { useNavigate } from "react-router-dom";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { ArrowLeft } from "lucide-react";

const Cookies = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-24 max-w-[800px] mx-auto px-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <h1 className="text-[36px] font-bold text-foreground tracking-[-0.01em] mb-2">Cookie Policy</h1>
        <p className="text-[14px] text-muted-foreground mb-10">Last updated: March 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website operators information about how the site is being used.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">2. Essential Cookies</h2>
            <p>We use the following essential cookies that are necessary for the platform to function correctly:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li><strong>Authentication tokens:</strong> Supabase authentication session tokens that keep you logged in and maintain your session securely. These cookies are strictly necessary and cannot be disabled.</li>
              <li><strong>Session management:</strong> cookies that remember your preferences and settings during your visit.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">3. Analytics Cookies</h2>
            <p>We do not currently use any analytics cookies or third-party tracking tools. If we introduce analytics in the future, we will update this policy and seek your consent where required.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">4. Third-Party Cookies</h2>
            <p>When you make a payment through our platform, Stripe may set cookies on your device to facilitate payment processing, prevent fraud, and comply with their security requirements. These cookies are governed by <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">Stripe's Cookie Policy</a>.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">5. Managing Cookies</h2>
            <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>View what cookies are stored and delete them individually.</li>
              <li>Block third-party cookies.</li>
              <li>Block cookies from specific websites.</li>
              <li>Block all cookies from being set.</li>
              <li>Delete all cookies when you close your browser.</li>
            </ul>
            <p className="mt-2">Please note that if you block essential cookies, you may not be able to use certain features of the platform, such as logging in or making payments.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">6. Contact</h2>
            <p>If you have any questions about our use of cookies, please contact us at <a href="mailto:sales@slatetech.co.uk" className="text-amber hover:underline">sales@slatetech.co.uk</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cookies;

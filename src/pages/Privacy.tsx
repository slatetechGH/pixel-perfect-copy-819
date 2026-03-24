import { useNavigate } from "react-router-dom";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-24 max-w-[800px] mx-auto px-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <h1 className="text-[36px] font-bold text-foreground tracking-[-0.01em] mb-2">Privacy Policy</h1>
        <p className="text-[14px] text-muted-foreground mb-10">Last updated: March 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">1. Who We Are</h2>
            <p>Slate Technologies Ltd ("Slate", "we", "us", "our") is a company registered in England and Wales. We operate the Slate platform, a subscription management service for independent producers. You can contact us at <a href="mailto:sales@slatetech.co.uk" className="text-amber hover:underline">sales@slatetech.co.uk</a>.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">2. What Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li><strong>Account information:</strong> name, email address, business name, phone number, and business type.</li>
              <li><strong>Payment information:</strong> payment card details are collected and processed securely by Stripe. We do not store your full card number.</li>
              <li><strong>Usage data:</strong> information about how you interact with the platform, including pages visited, features used, and device information.</li>
              <li><strong>Communications:</strong> messages sent through the platform and enquiries submitted via our contact forms.</li>
              <li><strong>Business data:</strong> subscription plans, product drops, content, and subscriber information that producers manage through the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">3. Why We Collect It</h2>
            <p>We process your personal data for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>To provide and operate the Slate platform and its features.</li>
              <li>To process payments and manage subscriptions through Stripe.</li>
              <li>To send transactional emails (e.g. account confirmation, payment receipts).</li>
              <li>To respond to enquiries and provide customer support.</li>
              <li>To improve and develop the platform.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">4. Legal Basis for Processing</h2>
            <p>We process your data on the following legal bases under the UK GDPR:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li><strong>Contract performance:</strong> processing necessary to fulfil our obligations to you as a user of the platform.</li>
              <li><strong>Legitimate interest:</strong> to improve our services, ensure security, and prevent fraud.</li>
              <li><strong>Consent:</strong> where you have given explicit consent, such as for marketing communications.</li>
              <li><strong>Legal obligation:</strong> to comply with applicable laws and regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">5. Third-Party Processors</h2>
            <p>We share your data with the following trusted third-party service providers who process data on our behalf:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li><strong>Supabase:</strong> database hosting, authentication, and backend infrastructure.</li>
              <li><strong>Stripe:</strong> payment processing for subscriptions and transactions.</li>
              <li><strong>Resend:</strong> transactional email delivery.</li>
              <li><strong>Vercel / Lovable:</strong> website hosting and deployment.</li>
            </ul>
            <p className="mt-2">Each provider has their own privacy policy and processes data in accordance with their respective terms. We ensure all processors provide adequate data protection guarantees.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active or as needed to provide our services. If you request deletion of your account, we will delete or anonymise your personal data within 30 days, except where we are required to retain it for legal, tax, or regulatory purposes.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">7. Your Rights Under GDPR</h2>
            <p>As a data subject, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li><strong>Right of access:</strong> request a copy of the personal data we hold about you.</li>
              <li><strong>Right to rectification:</strong> request correction of inaccurate or incomplete data.</li>
              <li><strong>Right to erasure:</strong> request deletion of your personal data ("right to be forgotten").</li>
              <li><strong>Right to data portability:</strong> request a copy of your data in a structured, commonly used format.</li>
              <li><strong>Right to object:</strong> object to processing based on legitimate interest.</li>
              <li><strong>Right to restriction:</strong> request restriction of processing in certain circumstances.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, please contact us at <a href="mailto:sales@slatetech.co.uk" className="text-amber hover:underline">sales@slatetech.co.uk</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">8. Cookies</h2>
            <p>For information about the cookies we use, please see our <button onClick={() => navigate("/cookies")} className="text-amber hover:underline cursor-pointer">Cookie Policy</button>.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify users of material changes by email or through a notice on the platform. Your continued use of the platform after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">10. Contact</h2>
            <p>If you have any questions about this privacy policy or our data practices, please contact us at <a href="mailto:sales@slatetech.co.uk" className="text-amber hover:underline">sales@slatetech.co.uk</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;

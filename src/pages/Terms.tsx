import { useNavigate } from "react-router-dom";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-24 max-w-[800px] mx-auto px-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <h1 className="text-[36px] font-bold text-foreground tracking-[-0.01em] mb-2">Terms of Service</h1>
        <p className="text-[14px] text-muted-foreground mb-10">Last updated: March 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">1. The Service</h2>
            <p>Slate Technologies Ltd ("Slate", "we", "us") provides a subscription management platform for independent producers ("the Service"). The Service enables producers to create storefronts, manage subscriptions, publish content, and sell product drops to their customers. By accessing or using the Service, you agree to be bound by these terms.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">2. Account Registration</h2>
            <p>To use certain features of the Service, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Maintain the security of your password and account credentials.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
              <li>Notify us immediately of any unauthorised use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">3. Producer Terms</h2>
            <p>If you register as a producer on the platform, you agree that:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>You are responsible for setting your own subscription prices and product pricing.</li>
              <li>You are responsible for fulfilling all subscriptions and orders to your customers.</li>
              <li>You must comply with all applicable laws, including consumer protection, food safety (where relevant), and data protection regulations.</li>
              <li>You will provide accurate descriptions of your products and services.</li>
              <li>You are solely responsible for disputes between you and your customers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">4. Customer Terms</h2>
            <p>If you subscribe to a producer through the platform:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Your subscription is directly with the producer, not with Slate.</li>
              <li>Payment is processed securely by Stripe, subject to Stripe's terms of service.</li>
              <li>You may cancel your subscription at any time through your account settings or the Stripe customer portal.</li>
              <li>Refund policies are determined by the individual producer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">5. Commission & Fees</h2>
            <p>Slate charges a 6% commission on all subscription revenue processed through the platform. This commission is automatically deducted from each payment before funds are transferred to the producer. Stripe's standard processing fees (approximately 2.2% + 30p per transaction) also apply and are deducted separately.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">6. Payments</h2>
            <p>All payments are processed by Stripe and are subject to <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">Stripe's Terms of Service</a>. Slate does not store full payment card details. By using the payment features of the Service, you agree to Stripe's terms in addition to these terms.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">7. Cancellation</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Producers:</strong> You may cancel your Slate account at any time. Upon cancellation, your storefront will be deactivated and your subscribers will be notified.</li>
              <li><strong>Customers:</strong> You may cancel any subscription at any time. Cancellation takes effect at the end of your current billing period.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>The Service is provided "as is" without warranties of any kind, express or implied. To the fullest extent permitted by law:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Slate is not liable for any disputes between producers and their customers.</li>
              <li>Slate is not liable for any indirect, incidental, special, or consequential damages.</li>
              <li>Our total liability shall not exceed the amount paid by you to Slate in the 12 months preceding the claim.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">9. Intellectual Property</h2>
            <p>Slate owns all rights to the platform, including its design, code, and branding. Producers retain ownership of all content, images, recipes, and other materials they upload to the platform. By uploading content, producers grant Slate a limited licence to display that content on the platform as part of the Service.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">10. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or are otherwise harmful to the platform or its users. We will provide reasonable notice where possible.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">11. Governing Law</h2>
            <p>These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-foreground mb-3">12. Contact</h2>
            <p>If you have questions about these terms, please contact us at <a href="mailto:sales@slatetech.co.uk" className="text-amber hover:underline">sales@slatetech.co.uk</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;

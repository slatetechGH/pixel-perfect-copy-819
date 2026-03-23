import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EmailCapture = () => {
  const [email, setEmail] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Save lead directly to Supabase
    const { error: leadErr } = await supabase.from("leads").insert({
      type: "newsletter",
      email,
      status: "new",
    });
    console.log("Newsletter lead insert:", leadErr ? leadErr.message : "success");

    if (leadErr?.message?.includes("duplicate") || leadErr?.code === "23505") {
      toast("You're already subscribed!");
      setEmail("");
      return;
    }

    // Send notification email
    try {
      await supabase.functions.invoke("send-enquiry-email", {
        body: { type: "newsletter", data: { email } },
      });
    } catch {
      console.warn("Newsletter notification email failed");
    }

    setSubmitted(true);
    setEmail("");
    toast.success("You're in! Welcome to Slate.");
  };

  return (
    <section className="py-20 bg-sidebar">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {submitted ? (
          <div className="flex items-center justify-center gap-3">
            <Check size={20} className="text-amber" />
            <p className="text-[16px] font-medium text-white">You're in! Welcome to Slate.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-[28px] font-bold text-white mb-1">Stay in the loop.</h3>
              <p className="text-[15px] text-slate-light">
                Producer tips, platform updates, and early access to new features.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex w-full md:w-auto">
              <div className="flex flex-1 md:flex-none">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@yourbusiness.co.uk"
                  className="h-12 px-4 rounded-l-lg border-0 bg-white text-foreground text-[15px] placeholder:text-slate-light w-full md:w-[320px] focus:outline-none focus:ring-2 focus:ring-amber/30"
                />
                <button
                  type="submit"
                  className="h-12 px-6 bg-amber text-foreground font-medium text-[15px] rounded-r-lg hover:bg-amber-hover transition-colors whitespace-nowrap cursor-pointer"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        )}
        {error && <p className="text-[13px] text-destructive mt-2 text-center md:text-right">{error}</p>}
        {!submitted && (
          <p className="text-[12px] text-slate-light/60 mt-4 text-center md:text-right">
            No spam, ever. Unsubscribe anytime.
          </p>
        )}
      </div>
    </section>
  );
};

export default EmailCapture;

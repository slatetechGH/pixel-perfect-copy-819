import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Instagram, Twitter, Linkedin, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

const businessTypes = [
  "Butcher", "Baker", "Fishmonger", "Cheesemaker", "Farm Shop",
  "Brewery / Distillery", "Market Stall", "Café / Restaurant",
  "Other Artisan Producer", "I'm a Customer",
];

const hearAbout = [
  "Google Search", "Social Media", "Word of Mouth", "Blog / Article", "Event / Market", "Other",
];

const Contact = () => {
  const navigate = useNavigate();
  const { addLead } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", business: "", businessType: "", hearAbout: "", message: "", newsletter: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName || form.fullName.length < 2) e.fullName = "Required (min 2 characters)";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.business) e.business = "Required";
    if (!form.businessType) e.businessType = "Required";
    if (!form.message || form.message.length < 10) e.message = "Required (min 10 characters)";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);
    
    addLead({
      type: "contact",
      email: form.email,
      name: form.fullName,
      phone: form.phone,
      businessName: form.business,
      businessType: form.businessType,
      hearAbout: form.hearAbout,
      message: form.message,
      newsletter: form.newsletter,
    });

    if (form.newsletter) {
      addLead({ type: "newsletter", email: form.email });
    }

    // Send notification email
    try {
      await supabase.functions.invoke("send-enquiry-email", {
        body: {
          type: "contact",
          data: {
            name: form.fullName,
            email: form.email,
            company: form.business,
            phone: form.phone,
            message: form.message,
          },
        },
      });
    } catch {
      // Email send failed — lead is still saved
      console.warn("Email notification failed");
    }

    setFirstName(form.fullName.split(" ")[0]);
    setLoading(false);
    setSubmitted(true);
    toast.success("Thanks! We'll be in touch within 24 hours.");
  };

  const inputCls = (field: string) =>
    `w-full h-11 px-4 rounded-lg border bg-white text-[15px] text-foreground placeholder:text-slate-light focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all ${errors[field] ? "border-destructive" : "border-slate-light/40"}`;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-24 max-w-[1200px] mx-auto px-6 md:px-8">
        <h1 className="text-[36px] md:text-[40px] font-bold text-foreground tracking-[-0.01em] mb-2">Get in touch</h1>
        <p className="text-[18px] text-slate-mid mb-12 max-w-xl">
          Whether you're a producer looking to get started or just have a question, we'd love to hear from you.
        </p>

        <div className="grid md:grid-cols-5 gap-16">
          {/* Form */}
          <div className="md:col-span-3">
            {submitted ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-amber" />
                </div>
                <p className="text-[20px] font-medium text-foreground">
                  Thanks, {firstName}. We've received your message and will be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Full Name <span className="text-amber">*</span></label>
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} onBlur={() => setErrors(prev => { const n = { ...prev }; delete n.fullName; return n; })} className={inputCls("fullName")} placeholder="Your name" />
                    {errors.fullName && <p className="text-[13px] text-destructive mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Email Address <span className="text-amber">*</span></label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls("email")} placeholder="you@yourbusiness.co.uk" />
                    {errors.email && <p className="text-[13px] text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls("")} placeholder="Optional" />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Business Name <span className="text-amber">*</span></label>
                    <input value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} className={inputCls("business")} placeholder="Your business name" />
                    {errors.business && <p className="text-[13px] text-destructive mt-1">{errors.business}</p>}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Business Type <span className="text-amber">*</span></label>
                    <select value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} className={inputCls("businessType") + " appearance-none"}>
                      <option value="">Select...</option>
                      {businessTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.businessType && <p className="text-[13px] text-destructive mt-1">{errors.businessType}</p>}
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-mid block mb-1.5">How did you hear about Slate?</label>
                    <select value={form.hearAbout} onChange={(e) => setForm({ ...form, hearAbout: e.target.value })} className={inputCls("") + " appearance-none"}>
                      <option value="">Select...</option>
                      {hearAbout.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Message <span className="text-amber">*</span></label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className={inputCls("message") + " h-auto py-3 resize-none"} placeholder="Tell us a bit about your business and what you're looking for..." />
                  {errors.message && <p className="text-[13px] text-destructive mt-1">{errors.message}</p>}
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.newsletter} onChange={(e) => setForm({ ...form, newsletter: e.target.checked })} className="w-[18px] h-[18px] rounded border-slate-light/40 accent-foreground" />
                  <span className="text-[14px] text-slate-mid">Keep me updated with Slate news and producer tips</span>
                </label>
                <Button variant="slate" className="h-11 px-7 text-[15px] md:w-auto w-full" type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : "Send message"}
                </Button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="md:col-span-2">
            <div className="bg-secondary rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Mail size={18} className="text-slate-mid" />
                <a href="mailto:sales@slatetech.co.uk" className="text-[15px] font-medium text-foreground hover:text-amber transition-colors">sales@slatetech.co.uk</a>
              </div>
              <p className="text-[14px] text-slate-light mb-1">We typically respond within 24 hours</p>
              <p className="text-[14px] text-slate-light mb-8">Monday – Friday, 9am – 6pm GMT</p>
              <div className="flex gap-4">
                {[
                  { Icon: Instagram, url: "https://instagram.com" },
                  { Icon: Twitter, url: "https://twitter.com" },
                  { Icon: Linkedin, url: "https://linkedin.com" },
                ].map(({ Icon, url }) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-slate-light hover:text-foreground transition-colors">
                    <Icon size={18} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;

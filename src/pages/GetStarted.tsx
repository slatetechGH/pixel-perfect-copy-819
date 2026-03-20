import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import SlateLogo from "@/components/SlateLogo";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const businessTypes = [
  "Butcher", "Baker", "Fishmonger", "Cheesemaker", "Farm Shop",
  "Brewery / Distillery", "Market Stall", "Café / Restaurant", "Other Artisan Producer",
];

const customerCounts = ["Just getting started", "Under 50", "50–200", "200–500", "500+"];

const interests = [
  "Subscription boxes", "One-off product drops", "Recipe & content sharing",
  "Customer messaging", "Analytics & insights", "All of the above",
];

const GetStarted = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // planFromUrl removed — no more tier selection
  const { addLead } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", businessName: "", businessType: "",
    website: "", customerCount: "", interests: [] as string[], notes: "",
    terms: false, newsletter: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.length < 2) e.name = "Required (min 2 characters)";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.businessName) e.businessName = "Required";
    if (!form.businessType) e.businessType = "Required";
    if (!form.terms) e.terms = "You must agree to the terms";
    if (showPasswordFields) {
      if (!password || password.length < 6) e.password = "Min 6 characters";
      if (password !== confirmPassword) e.confirmPassword = "Passwords don't match";
    }
    return e;
  };

  const toggleInterest = (i: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(i) ? prev.interests.filter(x => x !== i) : [...prev.interests, i],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // First submission: show password fields
    if (!showPasswordFields) {
      const v = validate();
      if (Object.keys(v).length) { setErrors(v); return; }
      setShowPasswordFields(true);
      return;
    }

    // Second submission: validate all including password, then sign up
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);

    // Save lead to AppContext (will wire to Supabase in Phase 2)
    const success = addLead({
      type: "signup",
      email: form.email,
      name: form.name,
      phone: form.phone,
      businessName: form.businessName,
      businessType: form.businessType,
      website: form.website,
      customerCount: form.customerCount,
      interests: form.interests,
      additionalNotes: form.notes,
      newsletter: form.newsletter,
    });

    if (!success) {
      setLoading(false);
      setDuplicate(true);
      return;
    }

    if (form.newsletter) {
      addLead({ type: "newsletter", email: form.email });
    }

    // Sign up with Supabase Auth
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: form.email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: form.name,
          business_name: form.businessName,
          business_type: form.businessType,
        },
      },
    });

    if (error) {
      setLoading(false);
      if (error.message.includes("already registered")) {
        setDuplicate(true);
      } else {
        setErrors({ password: error.message });
      }
      return;
    }

    // Save business details to the profile row created by the trigger
    if (signUpData.user) {
      await supabase.from("profiles").update({
        business_name: form.businessName,
        business_type: form.businessType,
        phone: form.phone || null,
        website: form.website || null,
      }).eq("id", signUpData.user.id);
    }

    setLoading(false);
    
    setFirstName(form.name.split(" ")[0]);
    setSubmitted(true);
    toast.success("Check your email to confirm your account!");
  };

  const inputCls = (field: string) =>
    `w-full h-11 px-4 rounded-lg border bg-white text-[15px] text-foreground placeholder:text-slate-light focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all ${errors[field] ? "border-destructive" : "border-slate-light/40"}`;

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="pt-32 pb-24 max-w-[560px] mx-auto px-6">
        {duplicate ? (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-amber" />
            </div>
            <h2 className="text-[24px] font-bold text-foreground mb-2">Looks like you've already signed up!</h2>
            <p className="text-[16px] text-slate-mid mb-6">We'll be in touch soon. If you need to update your details, email us at <a href="mailto:hello@getslate.co" className="text-amber hover:underline">hello@getslate.co</a></p>
            <Button variant="slate-outline" onClick={() => navigate("/")}>Back to homepage</Button>
          </div>
        ) : submitted ? (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-amber" />
            </div>
            <h2 className="text-[28px] font-bold text-foreground mb-2">Check your email, {firstName}!</h2>
            <p className="text-[16px] text-slate-mid mb-6">We've sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.</p>
            <Button variant="slate-outline" onClick={() => navigate("/")}>Back to homepage</Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="mb-4 cursor-pointer inline-block" onClick={() => navigate("/")}>
                <SlateLogo size={28} />
              </div>
              <h1 className="text-[36px] md:text-[44px] font-bold text-foreground tracking-[-0.01em] mb-2">Start your Slate</h1>
              <p className="text-[18px] text-slate-mid">Tell us about your business and we'll get you set up. Takes less than 2 minutes.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Your Name <span className="text-amber">*</span></label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls("name")} placeholder="Your name" />
                  {errors.name && <p className="text-[13px] text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Email Address <span className="text-amber">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls("email")} placeholder="you@yourbusiness.co.uk" />
                  {errors.email && <p className="text-[13px] text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls("")} placeholder="Optional" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Business Name <span className="text-amber">*</span></label>
                  <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className={inputCls("businessName")} placeholder="Your business name" />
                  {errors.businessName && <p className="text-[13px] text-destructive mt-1">{errors.businessName}</p>}
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Business Type <span className="text-amber">*</span></label>
                  <select value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} className={inputCls("businessType") + " appearance-none"}>
                    <option value="">Select...</option>
                    {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.businessType && <p className="text-[13px] text-destructive mt-1">{errors.businessType}</p>}
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Website or Social Media Link</label>
                  <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputCls("")} placeholder="instagram.com/yourbusiness or your website" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Approximate number of existing customers</label>
                  <select value={form.customerCount} onChange={(e) => setForm({ ...form, customerCount: e.target.value })} className={inputCls("") + " appearance-none"}>
                    <option value="">Select...</option>
                    {customerCounts.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-2">What are you most interested in?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {interests.map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleInterest(i)}
                        className={`text-left px-3 py-2.5 rounded-lg border text-[14px] transition-all cursor-pointer ${
                          form.interests.includes(i)
                            ? "border-foreground bg-foreground/5 text-foreground font-medium"
                            : "border-slate-light/40 bg-card text-slate-mid hover:border-slate-light"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Anything else?</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputCls("") + " h-auto py-3 resize-none"} placeholder="Optional" />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} className="w-[18px] h-[18px] rounded border-slate-light/40 accent-foreground mt-0.5" />
                  <span className="text-[14px] text-slate-mid">
                    I agree to Slate's{" "}
                    <button type="button" onClick={() => navigate("/terms")} className="text-amber hover:underline">Terms of Service</button> and{" "}
                    <button type="button" onClick={() => navigate("/privacy")} className="text-amber hover:underline">Privacy Policy</button>
                  </span>
                </label>
                {errors.terms && <p className="text-[13px] text-destructive -mt-2">{errors.terms}</p>}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.newsletter} onChange={(e) => setForm({ ...form, newsletter: e.target.checked })} className="w-[18px] h-[18px] rounded border-slate-light/40 accent-foreground" />
                  <span className="text-[14px] text-slate-mid">Send me tips on growing a subscription business</span>
                </label>
                {showPasswordFields && (
                  <>
                    <div>
                      <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Create a Password <span className="text-amber">*</span></label>
                      <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors(prev => { const n = { ...prev }; delete n.password; return n; }); }} className={inputCls("password")} placeholder="Min 6 characters" />
                      {errors.password && <p className="text-[13px] text-destructive mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-slate-mid block mb-1.5">Confirm Password <span className="text-amber">*</span></label>
                      <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => { const n = { ...prev }; delete n.confirmPassword; return n; }); }} className={inputCls("confirmPassword")} placeholder="Re-enter password" />
                      {errors.confirmPassword && <p className="text-[13px] text-destructive mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </>
                )}
                <Button variant="slate" className="w-full h-11 text-[15px]" type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account...</> : showPasswordFields ? "Create account" : "Continue"}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default GetStarted;

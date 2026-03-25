import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "slate-guided-pages";

export interface GuidanceStep {
  title: string;
  description: string;
}

// Page guidance definitions
const pageGuidance: Record<string, GuidanceStep[]> = {
  "/dashboard": [
    { title: "Welcome to your Dashboard", description: "This is your command centre — see key metrics like monthly income, customer count, and recent activity at a glance." },
    { title: "Quick Actions", description: "Use the buttons at the top to create new product drops or post content for your subscribers." },
    { title: "Storefront Link", description: "Share your storefront URL with customers so they can browse your plans and subscribe." },
  ],
  "/dashboard/subscribers": [
    { title: "Your Customers", description: "Here you can see everyone who's subscribed to your plans. Search, filter by plan or status, and manage individual subscriptions." },
    { title: "Customer Details", description: "Click on any customer to see their full profile, change their plan, or manage their subscription." },
  ],
  "/dashboard/plans": [
    { title: "Subscription Plans", description: "Create and manage the plans your customers can subscribe to. Set prices, benefits, and control visibility." },
    { title: "Pricing Breakdown", description: "Each plan shows a breakdown of what you'll earn after payment processing fees and Slate's commission." },
  ],
  "/dashboard/content": [
    { title: "Your Content Library", description: "Post recipes, updates, stories and tips exclusively for your subscribers. Content keeps customers engaged and reduces cancellations." },
    { title: "Content Access", description: "You can restrict content to specific plans, so premium subscribers get exclusive access." },
  ],
  "/dashboard/drops": [
    { title: "Product Drops", description: "Drops are limited-edition products or experiences you can offer to subscribers. Set quantities, dates, and pricing." },
    { title: "Drop Status", description: "Track how each drop is performing — see how many have been claimed and manage availability." },
  ],
  "/dashboard/broadcasts": [
    { title: "Broadcasts & Contacts", description: "Send email updates to your subscribers and manage your contact list. Import contacts or add them manually." },
    { title: "Compose & Send", description: "Write your message, choose which subscriber segments to target, and send or schedule your broadcast." },
  ],
  "/dashboard/analytics": [
    { title: "Performance Insights", description: "Track your income over time, see how your customer base is growing, and understand which plans are most popular." },
    { title: "Financial Breakdown", description: "See exactly how your income is split between what you keep, payment fees, and Slate's commission." },
  ],
  "/dashboard/settings": [
    { title: "Your Settings", description: "Customise your business profile, storefront appearance, notification preferences, and payment setup." },
  ],
  "/dashboard/leads": [
    { title: "Lead Management", description: "Track and manage enquiries from potential producers who want to join the platform." },
  ],
};

export function usePageGuidance(path: string) {
  const [guidedPages, setGuidedPages] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch { return []; }
  });

  const steps = pageGuidance[path] || [];
  const hasBeenGuided = guidedPages.includes(path);
  const [showGuidance, setShowGuidance] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-show on first visit
  useEffect(() => {
    if (steps.length > 0 && !hasBeenGuided) {
      setCurrentStep(0);
      setShowGuidance(true);
    }
  }, [path, hasBeenGuided, steps.length]);

  const markAsGuided = useCallback(() => {
    const updated = [...new Set([...guidedPages, path])];
    setGuidedPages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setShowGuidance(false);
    setCurrentStep(0);
  }, [guidedPages, path]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      markAsGuided();
    }
  }, [currentStep, steps.length, markAsGuided]);

  const skipGuidance = useCallback(() => {
    markAsGuided();
  }, [markAsGuided]);

  const replayGuidance = useCallback(() => {
    if (steps.length > 0) {
      setCurrentStep(0);
      setShowGuidance(true);
    }
  }, [steps.length]);

  return {
    steps,
    showGuidance,
    currentStep,
    nextStep,
    skipGuidance,
    replayGuidance,
    hasSteps: steps.length > 0,
  };
}

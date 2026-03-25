import { useApp } from "@/contexts/AppContext";

// Maps jargon → plain language for producers
const producerLabels: Record<string, { label: string; tooltip: string }> = {
  "MRR": { label: "Monthly Income", tooltip: "How much you earn each month from active subscriptions" },
  "Monthly Recurring Revenue": { label: "Monthly Income", tooltip: "How much you earn each month from active subscriptions" },
  "ARR": { label: "Yearly Income", tooltip: "Your estimated annual earnings based on current subscriptions" },
  "Churn Rate": { label: "Customers Lost", tooltip: "The percentage of customers who cancelled this month" },
  "Churn": { label: "Customers Lost", tooltip: "The percentage of customers who cancelled this month" },
  "LTV": { label: "Avg. Customer Value", tooltip: "The average total amount a customer pays over their entire subscription" },
  "Lifetime Value": { label: "Avg. Customer Value", tooltip: "The average total amount a customer pays over their entire subscription" },
  "Conversion Rate": { label: "Sign-up Rate", tooltip: "The percentage of visitors who became paying customers" },
  "Active Subscribers": { label: "Current Customers", tooltip: "People currently subscribed to one of your plans" },
  "Total Subscribers": { label: "Current Customers", tooltip: "People currently subscribed to one of your plans" },
  "Cancelled Subscriptions": { label: "Cancelled Customers", tooltip: "Customers who ended their subscription" },
  "Revenue": { label: "Income", tooltip: "Money earned from your subscriptions and drops" },
  "Gross Revenue": { label: "Total Income", tooltip: "Your total earnings before any fees are taken" },
  "Net Revenue": { label: "Your Take-Home", tooltip: "What you actually receive after fees and commission" },
  "Avg. Revenue Per User": { label: "Avg. Per Customer", tooltip: "The average amount each customer pays you per month" },
  "ARPU": { label: "Avg. Per Customer", tooltip: "The average amount each customer pays you per month" },
  "Drop Conversion": { label: "Drop Sign-up Rate", tooltip: "How many people who saw your drop actually purchased it" },
  "Subscriber Growth": { label: "Customer Growth", tooltip: "How your customer numbers are changing over time" },
  "Revenue Breakdown (Current Month)": { label: "Income Breakdown (This Month)", tooltip: "A detailed look at where your money goes this month" },
};

const ADMIN_EMAIL = "sales@slatetech.co.uk";

export function useProducerLabels() {
  const { session } = useApp();
  const isAdmin = session.profile?.email === ADMIN_EMAIL || session.role === "admin";

  function getLabel(jargon: string): string {
    if (isAdmin) return jargon;
    return producerLabels[jargon]?.label || jargon;
  }

  function getTooltip(jargon: string): string | null {
    if (isAdmin) return null;
    return producerLabels[jargon]?.tooltip || null;
  }

  return { getLabel, getTooltip, isAdmin };
}

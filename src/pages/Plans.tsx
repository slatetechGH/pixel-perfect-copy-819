import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Check } from "lucide-react";

const plans = [
  {
    id: 1,
    name: "Free Tier",
    price: "Free",
    subscribers: 64,
    isFree: true,
    benefits: ["Weekly email newsletter", "Public recipe access", "Shop news & updates"],
  },
  {
    id: 2,
    name: "The Standard Catch",
    price: "£15/mo",
    subscribers: 89,
    isFree: false,
    benefits: ["10% in-store discount", "Exclusive recipes", "Early product drop access", "Monthly catch report"],
  },
  {
    id: 3,
    name: "Chef's Catch Club",
    price: "£35/mo",
    subscribers: 34,
    isFree: false,
    benefits: [
      "15% in-store discount",
      "Monthly premium fish box",
      "All exclusive content",
      "Priority product drops",
      "Seasonal tasting events",
      "Direct line to fishmonger",
    ],
  },
];

const Plans = () => (
  <DashboardLayout
    title="Plans"
    subtitle="Manage your membership tiers"
    actions={
      <Button size="sm">
        <Plus className="h-4 w-4 mr-1.5" /> Create Plan
      </Button>
    }
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {plans.map((plan) => (
        <Card key={plan.id} className="relative overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-shadow duration-200">
          {!plan.isFree && plan.price === "£35/mo" && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[11px] font-medium px-3 py-1 rounded-bl-lg">
              Popular
            </div>
          )}
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-medium">{plan.name}</CardTitle>
            <p className="text-metric text-foreground">{plan.price}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 mb-4 text-[13px] text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{plan.subscribers} subscribers</span>
            </div>
            <ul className="space-y-2.5 mb-5">
              {plan.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] text-foreground">
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">Edit</Button>
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-success/10 text-success">
                Active
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </DashboardLayout>
);

export default Plans;

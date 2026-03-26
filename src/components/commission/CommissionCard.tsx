import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent } from "lucide-react";
import { useTierLimits } from "@/hooks/useTierLimits";

interface CommissionCardProps {
  mrr: number;
}

export function CommissionCard({ mrr }: CommissionCardProps) {
  const { commissionPercent } = useTierLimits();
  const commission = mrr * (commissionPercent / 100);

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-2 px-7 pt-7">
        <CardTitle className="text-[15px] font-medium text-foreground flex items-center gap-2">
          <Percent className="h-4 w-4 text-muted-foreground" />
          Slate Commission
        </CardTitle>
      </CardHeader>
      <CardContent className="px-7 pb-7">
        <p className="text-[13px] text-muted-foreground mb-3">
          {commissionPercent}% of your subscriber revenue
        </p>
        <div className="bg-secondary rounded-xl p-4">
          <p className="text-[13px] text-muted-foreground mb-1">
            Based on your current MRR
          </p>
          <p className="text-[15px] text-foreground leading-relaxed">
            If you earn{" "}
            <span className="font-semibold">£{mrr.toLocaleString()}/month</span>,
            Slate earns{" "}
            <span className="font-semibold">£{commission.toFixed(2)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

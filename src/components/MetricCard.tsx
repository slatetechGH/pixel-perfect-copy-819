import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  delay?: number;
}

export function MetricCard({ title, value, change, trend, delay = 0 }: MetricCardProps) {
  return (
    <Card
      className="opacity-0 animate-fade-in border-0 shadow-card hover:shadow-card-hover transition-shadow duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <p className="text-label text-muted-foreground uppercase tracking-[0.05em]">{title}</p>
        <p className="text-metric text-foreground mt-2">{value}</p>
        <div className="flex items-center gap-1.5 mt-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] font-medium",
              trend === "up"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive/80"
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {change}
          </span>
          <span className="text-caption text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

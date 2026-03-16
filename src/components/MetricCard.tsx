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
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-display font-bold text-foreground mt-1">{value}</p>
        <div className="flex items-center gap-1 mt-2">
          {trend === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" ? "text-success" : "text-destructive"
            )}
          >
            {change}
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

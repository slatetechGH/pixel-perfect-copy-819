interface PriceCalculatorProps {
  priceNum: number;
}

export function PriceCalculator({ priceNum }: PriceCalculatorProps) {
  if (priceNum <= 0) return null;

  const stripeFee = priceNum * 0.022 + 0.30;
  const slateCommission = priceNum * 0.06;
  const net = priceNum - stripeFee - slateCommission;

  return (
    <div className="bg-secondary rounded-xl p-4 mt-3">
      <p className="text-[13px] font-medium text-muted-foreground mb-2">Per subscriber breakdown</p>
      <div className="space-y-1.5 text-[14px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Customer pays</span>
          <span className="font-medium text-foreground">£{priceNum.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Stripe fees (2.2% + 30p)</span>
          <span className="text-muted-foreground">−£{stripeFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Slate commission (6%)</span>
          <span className="text-muted-foreground">−£{slateCommission.toFixed(2)}</span>
        </div>
        <div className="border-t border-border pt-1.5 flex justify-between">
          <span className="font-medium text-foreground">You receive</span>
          <span className="font-bold text-foreground">£{net.toFixed(2)}/mo</span>
        </div>
      </div>
    </div>
  );
}

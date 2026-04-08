import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Pause, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CancellationFlowProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  businessName: string;
  joinedAt: string | null;
  benefits: string[];
  periodEnd: string | null;
  onPause: () => void;
  onCancel: (reason: string, details: string) => void;
  pauseLoading?: boolean;
  cancelLoading?: boolean;
}

const reasons = [
  "Too expensive",
  "I don't use it enough",
  "The quality wasn't what I expected",
  "I'm moving away",
  "I found an alternative",
  "Other",
];

export function CancellationFlow({
  open, onClose, planName, businessName, joinedAt, benefits, periodEnd,
  onPause, onCancel, pauseLoading, cancelLoading,
}: CancellationFlowProps) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setStep(1);
    setReason("");
    setDetails("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl border border-border shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-foreground">We're sorry to see you go</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">If you cancel, you'll lose access to:</p>
              <ul className="space-y-2 mb-6">
                <li className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-destructive mt-0.5">✕</span>
                  {planName} perks{benefits.length > 0 ? ` including ${benefits.slice(0, 2).join(", ")}` : ""}
                </li>
                {joinedAt && (
                  <li className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">✕</span>
                    Your membership since {joinedAt}
                  </li>
                )}
                <li className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-destructive mt-0.5">✕</span>
                  Access to exclusive content and drops
                </li>
              </ul>
              <div className="flex flex-col gap-3">
                <Button
                  variant="destructive"
                  onClick={() => setStep(2)}
                  className="w-full min-h-[48px]"
                >
                  I still want to cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full min-h-[48px]"
                >
                  Never mind, keep my subscription
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pause className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-foreground">Would you like to pause instead?</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                You can pause your subscription for a month instead of cancelling. You won't be charged, and you can resume anytime.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="slate"
                  onClick={onPause}
                  disabled={pauseLoading}
                  className="w-full min-h-[48px]"
                >
                  {pauseLoading ? "Pausing..." : "Pause for 1 month"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setStep(3)}
                  className="w-full min-h-[48px]"
                >
                  No, cancel my subscription
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full min-h-[48px]"
                >
                  Keep my subscription
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Help us improve</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Before you go, could you tell us why you're cancelling?
              </p>
              <div className="space-y-2 mb-5">
                {reasons.map(r => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      reason === r ? "border-foreground bg-muted" : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="w-4 h-4 accent-foreground"
                    />
                    <span className="text-sm text-foreground">{r}</span>
                  </label>
                ))}
              </div>
              <div className="mb-5">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Anything else you'd like to share?
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all resize-none"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  variant="destructive"
                  onClick={() => onCancel(reason, details)}
                  disabled={!reason || cancelLoading}
                  className="w-full min-h-[48px]"
                >
                  {cancelLoading ? "Cancelling..." : "Cancel subscription"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full min-h-[48px]"
                >
                  Keep my subscription
                </Button>
              </div>
              {periodEnd && (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Your subscription will end on {new Date(periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. You'll still have access until then.
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

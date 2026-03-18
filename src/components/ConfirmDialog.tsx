interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  destructive?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmText = "Confirm", destructive = false }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-[480px] w-full mx-4 p-6">
        <h3 className="text-[18px] font-bold text-foreground mb-2">{title}</h3>
        <p className="text-[15px] text-muted-foreground mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-[14px] font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-[14px] font-medium text-white rounded-lg transition-colors cursor-pointer ${
              destructive ? "bg-destructive/90 hover:bg-destructive" : "bg-foreground hover:bg-foreground/90"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

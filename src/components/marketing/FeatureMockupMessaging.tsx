import { SendHorizontal } from "lucide-react";

const FeatureMockupMessaging = () => (
  <div className="w-full px-2 py-1 space-y-2">
    {/* Chat bubbles */}
    <div className="space-y-2">
      {/* Left bubble */}
      <div className="flex justify-start">
        <div className="bg-secondary rounded-md px-3 py-2 max-w-[75%]">
          <span className="text-[9px] text-slate-mid">Is the sea bass fresh today?</span>
        </div>
      </div>
      {/* Right bubble */}
      <div className="flex justify-end">
        <div className="bg-foreground rounded-md px-3 py-2 max-w-[75%]">
          <span className="text-[9px] text-white">Caught this morning!</span>
        </div>
      </div>
      {/* Left bubble */}
      <div className="flex justify-start">
        <div className="bg-secondary rounded-md px-3 py-2 max-w-[75%]">
          <span className="text-[9px] text-slate-mid">Amazing, I'll take two</span>
        </div>
      </div>
    </div>

    {/* Input bar */}
    <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
      <span className="text-[9px] text-muted-foreground/50 flex-1">Type a message...</span>
      <SendHorizontal size={12} className="text-slate-mid shrink-0" strokeWidth={1.5} />
    </div>
  </div>
);

export default FeatureMockupMessaging;

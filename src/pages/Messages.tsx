import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Search, Send } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";

const Messages = () => {
  const { conversations, setConversations } = useDashboard();
  const [activeId, setActiveId] = useState(conversations[0]?.id || "");
  const [search, setSearch] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const filtered = conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const active = conversations.find(c => c.id === activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length]);

  const sendMessage = () => {
    if (!newMsg.trim() || !active) return;
    setConversations(prev => prev.map(c => c.id === activeId ? {
      ...c,
      messages: [...c.messages, { id: `${Date.now()}`, text: newMsg.trim(), sender: "producer", time: "Just now" }],
    } : c));
    setNewMsg("");
  };

  const selectConversation = (id: number) => {
    setActiveId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c));
  };

  return (
    <DashboardLayout title="Messages" subtitle="Conversations with your members">
      <div className="flex h-[calc(100vh-180px)] bg-white rounded-[14px] shadow-card overflow-hidden">
        {/* Left panel */}
        <div className="w-[300px] border-r border-border flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-[14px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer ${c.id === activeId ? "bg-secondary" : "hover:bg-secondary/50"}`}
              >
                <div className="w-9 h-9 rounded-full bg-foreground text-white flex items-center justify-center text-[13px] font-medium shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-medium text-foreground truncate">{c.name}</p>
                    {c.unread && <span className="w-2 h-2 rounded-full bg-amber shrink-0" />}
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate">{c.messages[c.messages.length - 1]?.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{c.messages[c.messages.length - 1]?.time}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {active ? (
            <>
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-medium text-foreground">{active.name}</p>
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-secondary text-muted-foreground">{active.plan}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {active.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "producer" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                      msg.sender === "producer"
                        ? "bg-foreground text-white rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}>
                      <p className="text-[14px] leading-relaxed">{msg.text}</p>
                      <p className={`text-[11px] mt-1 ${msg.sender === "producer" ? "text-white/60" : "text-muted-foreground"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="px-5 py-3 border-t border-border">
                <div className="flex gap-2">
                  <input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 h-12 px-4 rounded-lg border border-border bg-white text-[15px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-[3px] focus:ring-foreground/10 transition-all"
                  />
                  <button onClick={sendMessage} className="h-12 w-12 rounded-lg bg-foreground text-white flex items-center justify-center hover:bg-foreground/90 transition-colors cursor-pointer">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;

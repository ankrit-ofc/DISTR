"use client";

import { useEffect, useRef, useState } from "react";
import { X, MessageCircle, Send, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Message {
  id: string;
  body: string;
  senderRole: "BUYER" | "ADMIN";
  createdAt: string;
  readAt?: string | null;
}

interface ConversationData {
  id: string;
  unreadByBuyer: number;
}

export default function ChatWidget() {
  const { token, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  // Load history when opened
  useEffect(() => {
    if (!open || !token) return;
    api.get("/chat/history").then((res) => {
      setConversation(res.data.conversation);
      setMessages(res.data.messages ?? []);
      setUnread(0);
      if (res.data.conversation) {
        api.patch("/chat/read", { conversationId: res.data.conversation.id }).catch(() => {});
      }
    });
  }, [open, token]);

  // SSE connection
  useEffect(() => {
    if (!token) return;

    const es = new EventSource(`${API_BASE}/chat/stream?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    es.addEventListener("message", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "connected") return;
        const msg: Message = data.message;
        if (msg.senderRole === "ADMIN") {
          setMessages((prev) => [...prev, msg]);
          if (!open) setUnread((u) => u + 1);
        }
      } catch {
        // ignore parse errors
      }
    });

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [token]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await api.post("/chat/send", { body: text });
      setMessages((prev) => [...prev, res.data.message]);
      if (!conversation) {
        const histRes = await api.get("/chat/history");
        setConversation(histRes.data.conversation);
      }
    } catch {
      setInput(text); // restore on error
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-[300px] h-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white font-semibold text-sm font-grotesk">DISTRO Support</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Guest prompt */}
          {!token && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-6 bg-off-white">
              <MessageCircle size={32} className="text-blue opacity-60" />
              <p className="text-sm font-semibold text-ink text-center">Chat with DISTRO Support</p>
              <p className="text-xs text-gray-400 text-center">Sign in to start a conversation with our team.</p>
              <Link
                href="/login"
                className="flex items-center gap-2 mt-1 bg-blue text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-dark transition-colors"
              >
                <LogIn size={14} />
                Sign in to chat
              </Link>
            </div>
          )}

          {/* Messages + input (logged-in users only) */}
          {token && (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-off-white">
                {messages.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Send us a message — we reply fast!
                  </p>
                )}
                {messages.map((msg) => {
                  const isMine = msg.senderRole === "BUYER";
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] px-3 py-2 text-sm leading-snug ${
                          isMine
                            ? "bg-blue text-white rounded-[10px] rounded-br-[3px]"
                            : "bg-white text-ink border border-gray-200 rounded-[10px] rounded-bl-[3px]"
                        }`}
                      >
                        <p>{msg.body}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex items-end gap-2 px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue transition-colors max-h-[80px] overflow-auto"
                  style={{ height: "36px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 rounded-full bg-blue text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 hover:bg-blue-dark transition-colors"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => { setOpen((v) => !v); setUnread(0); }}
        className="w-14 h-14 rounded-full bg-blue text-white shadow-lg flex items-center justify-center hover:bg-blue-dark transition-colors relative"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}

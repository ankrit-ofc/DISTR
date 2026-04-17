"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, MessageCircle, Send, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { motion, AnimatePresence, type Variants } from "framer-motion";

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

const panelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transformOrigin: "bottom right",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },
};

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

  const toggleOpen = useCallback(() => {
    setOpen((v) => {
      if (!v) setUnread(0);
      return !v;
    });
  }, []);

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
      setInput(text);
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* ── Chat panel ──────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-[340px] sm:w-[380px] overflow-hidden rounded-2xl border border-[color:var(--gray)]/40 bg-white/60 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 flex flex-col"
            style={{ height: 460 }}
          >
            {/* Header */}
            <div className="relative border-b border-[color:var(--gray)]/40 overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--blue)] to-[color:var(--blue-dark)] opacity-95" />
              <div className="relative flex items-center justify-between p-4 z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-display font-bold text-sm backdrop-blur-sm border-2 border-white/30">
                      D
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[color:var(--blue)] bg-[color:var(--green)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-display">
                      DISTRO Support
                    </h3>
                    <span className="text-xs text-blue-200">
                      We reply fast
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Guest prompt */}
            {!token && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-8 bg-[color:var(--off)]">
                <div className="w-14 h-14 rounded-2xl bg-[color:var(--blue-light)] flex items-center justify-center">
                  <MessageCircle size={28} className="text-[color:var(--blue)] opacity-70" />
                </div>
                <p className="text-sm font-semibold text-[color:var(--ink)] text-center">
                  Chat with DISTRO Support
                </p>
                <p className="text-xs text-[color:var(--gray2)] text-center max-w-[220px]">
                  Sign in to start a conversation with our team.
                </p>
                <Link
                  href="/login"
                  className="flex items-center gap-2 mt-2 bg-[color:var(--blue)] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[color:var(--blue-dark)] transition-colors shadow-md"
                >
                  <LogIn size={14} />
                  Sign in to chat
                </Link>
              </div>
            )}

            {/* Messages + input (logged-in) */}
            {token && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-[color:var(--off)] to-white/40">
                  {messages.length === 0 && (
                    <motion.div
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-[color:var(--blue-light)] flex items-center justify-center flex-shrink-0 text-[color:var(--blue)] font-display text-xs font-bold border border-[color:var(--gray)]/40">
                        D
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-[color:var(--gray2)]">
                          DISTRO Support
                        </span>
                        <div className="rounded-2xl rounded-tl-none bg-white/80 px-4 py-2.5 text-sm shadow-sm backdrop-blur-sm border border-[color:var(--gray)]/30 text-[color:var(--ink)]">
                          <p>Namaste! Send us a message — we reply fast!</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {messages.map((msg) => {
                    const isMine = msg.senderRole === "BUYER";
                    return (
                      <motion.div
                        key={msg.id}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        className={`flex ${isMine ? "flex-row-reverse" : ""} gap-2`}
                      >
                        {!isMine && (
                          <div className="w-8 h-8 rounded-full bg-[color:var(--blue-light)] flex items-center justify-center flex-shrink-0 text-[color:var(--blue)] font-display text-xs font-bold border border-[color:var(--gray)]/40">
                            D
                          </div>
                        )}
                        <div className={`flex flex-col ${isMine ? "items-end" : ""} gap-1 max-w-[80%]`}>
                          <div
                            className={`px-4 py-2.5 text-sm shadow-sm ${
                              isMine
                                ? "rounded-2xl rounded-tr-none bg-[color:var(--blue)] text-white shadow-md"
                                : "rounded-2xl rounded-tl-none bg-white/80 backdrop-blur-sm border border-[color:var(--gray)]/30 text-[color:var(--ink)]"
                            }`}
                          >
                            <p>{msg.body}</p>
                          </div>
                          <span className={`text-[10px] px-1 ${isMine ? "text-[color:var(--gray2)]" : "text-[color:var(--gray2)]"}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input area */}
                <div className="border-t border-[color:var(--gray)]/40 bg-white/60 p-3 backdrop-blur-md flex-shrink-0">
                  <form
                    className="flex items-end gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 resize-none text-sm border border-[color:var(--gray)]/40 bg-white/50 rounded-full px-4 py-2.5 outline-none transition-all placeholder:text-[color:var(--gray2)] focus:border-[color:var(--blue)]/50 focus:bg-white focus:ring-2 focus:ring-[color:var(--blue)]/10 max-h-[80px] overflow-auto"
                      style={{ height: "40px" }}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || sending}
                      className="w-10 h-10 rounded-full bg-[color:var(--blue)] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 shadow-lg transition-transform hover:scale-105 hover:shadow-[color:var(--blue)]/25"
                    >
                      {sending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating action button ──────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className={`group relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
          open
            ? "bg-red-500 text-white rotate-90"
            : "bg-[color:var(--blue)] text-white hover:shadow-[color:var(--blue)]/25"
        }`}
      >
        <span className="absolute inset-0 -z-10 rounded-full bg-inherit opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-40" />
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>
    </div>
  );
}

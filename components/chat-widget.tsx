"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are Darryl, an expert beekeeping assistant for The Hive-Tool App. You provide practical advice on:\n\n• Colony health & disease management (varroa, nosema, AFB/EFB, viruses)\n• Seasonal hive management & inspection protocols\n• Queen rearing, swarm prevention, splits\n• Honey production, extraction, storage\n• Equipment selection & maintenance\n• Bee biology & behavior\n• Record-keeping & data interpretation\n\nBe concise but thorough. Ask clarifying questions about location, hive type, colony strength, and season when relevant. Prioritize actionable guidance. Support integrated pest management and treatment-free methods where appropriate. Reference The Hive-Tool App features when they can help track or analyze the user's situation.",
            },
            ...newMessages,
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();

      const botMsg: Message = {
        role: "assistant",
        content:
          data.reply || "I couldn't generate a response. Please try again.",
      };
      setMessages([...newMessages, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again. 🐝",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-amber-500 text-white rounded-full p-5 shadow-2xl hover:bg-amber-600 transition-all z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-2xl">🐝</span>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white w-full sm:w-[420px] h-[75vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-4 shadow-md">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  aria-label="Close chat"
                >
                  <span className="text-xl font-light">×</span>
                </button>

                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐝</span>
                    <span className="font-bold text-xl">Darryl</span>
                  </div>
                  <span className="text-sm">Your Hive-Tool Assistant</span>
                </div>
              </div>

              {/* Chat body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-amber-50 to-white">
                {messages.length === 0 && (
                  <div className="text-gray-600 text-sm text-center mt-12 px-4">
                    <div className="text-4xl mb-3">🍯</div>
                    <p className="font-medium mb-2">
                      Hi! I&apos;m Darryl, your Hive-Tool Assistant.
                    </p>
                    <p>
                      Ask me about hive health, honey harvest timing, or bee
                      behavior.
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${
                        msg.role === "user"
                          ? "bg-amber-500 text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-2xl rounded-bl-sm shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                        <span
                          className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loading}
                    className="flex-1 border-2 border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:border-amber-500 text-gray-800 placeholder-gray-500 transition-colors disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    {loading ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

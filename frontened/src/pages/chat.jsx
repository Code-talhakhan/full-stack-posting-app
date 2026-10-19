import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Sparkles, RefreshCw, ArrowLeft, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../core";
import { toast } from "sonner";

const Chat = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "ai",
            text: "Welcome to Bayan AI! How can I help you design posts, brainstorm ideas, or navigate the platform?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userPrompt = input.trim();
        const userMessage = {
            id: Date.now(),
            sender: "user",
            text: userPrompt,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${baseUrl}/api/v1/agent/chat`,
                { prompt: userPrompt },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        token: token
                    }
                }
            );

            const aiReply = res.data?.reply || "Unable to generate response. Please try again.";

            const aiMessage = {
                id: Date.now() + 1,
                sender: "ai",
                text: aiReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI Agent Error:", error);
            toast.error("Failed to connect with Bayan AI.");
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: Date.now(),
                sender: "ai",
                text: "Chat history has been reset. Feel free to ask a new question!",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
        toast.info("Chat cleared");
    };

    return (
        <div className="min-h-screen bg-[#FAF8F9] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#851D52]/10 via-[#FAF8F9] to-[#FAF8F9] flex flex-col justify-between p-3 sm:p-6 font-sans">
            
            {/* Top Navigation Header */}
            <div className="max-w-5xl w-full mx-auto bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl p-3.5 sm:p-4 shadow-xl shadow-[#851D52]/5 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-2xl bg-gray-50 hover:bg-[#851D52]/10 text-gray-600 hover:text-[#851D52] transition-all outline-none cursor-pointer border border-gray-100"
                        title="Go Back"
                    >
                        <ArrowLeft size={19} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#601238] via-[#851D52] to-[#E25865] flex items-center justify-center text-white shadow-md shadow-[#851D52]/20">
                            <Bot size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h2 className="text-base font-extrabold text-[#2A081A] tracking-tight">
                                    Bayan AI
                                </h2>
                                <span className="bg-[#851D52]/10 text-[#851D52] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#851D52]/20">
                                    <Sparkles size={11} className="fill-[#851D52]" /> Intelligent
                                </span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium">Conversational Assistant</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleClearChat}
                    className="p-2.5 rounded-2xl text-gray-400 hover:text-[#851D52] hover:bg-gray-100/60 transition-all outline-none cursor-pointer"
                    title="Reset Chat"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Chat Body Box */}
            <div className="max-w-5xl w-full mx-auto flex-1 bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl p-4 sm:p-6 overflow-y-auto shadow-2xl shadow-[#851D52]/5 space-y-5 h-[calc(100vh-210px)]">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`group flex gap-3 max-w-[90%] sm:max-w-[78%] ${
                            msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                    >
                        {/* Avatar Icon */}
                        <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
                                msg.sender === "user"
                                    ? "bg-gradient-to-r from-[#601238] via-[#851D52] to-[#E25865] text-white"
                                    : "bg-gray-100/80 text-[#851D52] border border-gray-200/50"
                            }`}
                        >
                            {msg.sender === "user" ? <User size={18} /> : <Bot size={18} />}
                        </div>

                        {/* Message Bubble */}
                        <div className="space-y-1 relative">
                            <div
                                className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                                    msg.sender === "user"
                                        ? "bg-gradient-to-r from-[#601238] via-[#851D52] to-[#E25865] text-white rounded-tr-xs shadow-lg shadow-[#851D52]/20 font-medium"
                                        : "bg-gray-50/80 text-gray-800 border border-gray-100 rounded-tl-xs shadow-xs font-normal"
                                }`}
                            >
                                {msg.text}
                            </div>

                            <div className={`flex items-center gap-2 px-1 ${
                                msg.sender === "user" ? "justify-end" : "justify-start"
                            }`}>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {msg.time}
                                </span>

                                {msg.sender === "ai" && (
                                    <button
                                        onClick={() => handleCopy(msg.id, msg.text)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
                                        title="Copy response"
                                    >
                                        {copiedId === msg.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Thinking / Loading Animation */}
                {loading && (
                    <div className="flex gap-3 mr-auto max-w-[80%] items-end">
                        <div className="w-9 h-9 rounded-2xl bg-gray-100 text-[#851D52] border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                            <Bot size={18} />
                        </div>
                        <div className="p-4 rounded-3xl rounded-tl-xs bg-gray-50/80 border border-gray-100 text-xs text-gray-500 flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#851D52] animate-pulse" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 rounded-full bg-[#851D52] animate-pulse" style={{ animationDelay: '200ms' }} />
                                <span className="w-2 h-2 rounded-full bg-[#851D52] animate-pulse" style={{ animationDelay: '400ms' }} />
                            </div>
                            <span className="font-semibold text-gray-500">Bayan AI is thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="max-w-5xl w-full mx-auto mt-4 flex gap-3">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Bayan AI anything..."
                        className="w-full bg-white/90 border border-gray-200/80 focus:border-[#851D52] focus:ring-4 focus:ring-[#851D52]/10 rounded-2xl px-5 py-4 text-xs sm:text-sm outline-none transition-all shadow-lg shadow-gray-200/30 text-gray-800 placeholder-gray-400 font-medium"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-[#601238] via-[#851D52] to-[#E25865] hover:opacity-95 text-white px-7 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#851D52]/25 cursor-pointer flex-shrink-0"
                >
                    <Send size={19} />
                </button>
            </form>
        </div>
    );
};

export default Chat;
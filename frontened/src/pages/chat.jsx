import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Sparkles, RefreshCw, ArrowLeft, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../core";
import showToast from "../component/CustomToast";

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

    const triggerToast = (type, message) => {
        if (showToast && typeof showToast[type] === 'function') {
            showToast[type](message);
        } else if (showToast && typeof showToast.success === 'function') {
            showToast.success(message);
        } else if (typeof showToast === 'function') {
            showToast(message);
        }
    };

    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        triggerToast("success", "Copied to clipboard!");
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
            triggerToast("error", "Failed to connect with Bayan AI.");
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
        triggerToast("info", "Chat cleared");
    };

    return (
        <div className="h-[100dvh] bg-[#FAF8F9] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#851D52]/10 via-[#FAF8F9] to-[#FAF8F9] flex flex-col p-2.5 sm:p-5 md:p-6 font-sans overflow-hidden">
            
            {/* Main Wrapper */}
            <div className="max-w-5xl w-full mx-auto flex flex-col h-full gap-2.5 sm:gap-3.5">
                
                {/* Top Navigation Header */}
                <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-xl shadow-[#851D52]/5 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gray-50 hover:bg-[#851D52]/10 text-gray-600 hover:text-[#851D52] transition-all outline-none cursor-pointer border border-gray-100 flex-shrink-0"
                            title="Go Back"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#601238] via-[#851D52] to-[#E25865] flex items-center justify-center text-white shadow-md shadow-[#851D52]/20 flex-shrink-0">
                                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                                    <h2 className="text-sm sm:text-base font-extrabold text-[#2A081A] tracking-tight truncate">
                                        Bayan AI
                                    </h2>
                                    <span className="bg-[#851D52]/10 text-[#851D52] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 border border-[#851D52]/20 flex-shrink-0">
                                        <Sparkles className="w-2.5 h-2.5 fill-[#851D52]" /> Intelligent
                                    </span>
                                </div>
                                <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium truncate">Conversational Assistant</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleClearChat}
                        className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-gray-400 hover:text-[#851D52] hover:bg-gray-100/60 transition-all outline-none cursor-pointer flex-shrink-0"
                        title="Reset Chat"
                    >
                        <RefreshCw className="w-4 h-4 sm:w-4 sm:h-4" />
                    </button>
                </div>

                {/* Chat Body Box */}
                <div className="flex-1 bg-white/80 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl p-3 sm:p-6 overflow-y-auto shadow-2xl shadow-[#851D52]/5 space-y-3.5 sm:space-y-5 min-h-0">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`group flex gap-2 sm:gap-3 max-w-[92%] sm:max-w-[80%] ${
                                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            }`}
                        >
                            {/* Avatar Icon */}
                            <div
                                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
                                    msg.sender === "user"
                                        ? "bg-gradient-to-r from-[#601238] via-[#851D52] to-[#E25865] text-white"
                                        : "bg-gray-100/80 text-[#851D52] border border-gray-200/50"
                                }`}
                            >
                                {msg.sender === "user" ? <User className="w-4 h-4 sm:w-4 sm:h-4" /> : <Bot className="w-4 h-4 sm:w-4 sm:h-4" />}
                            </div>

                            {/* Message Bubble */}
                            <div className="space-y-1 relative min-w-0">
                                <div
                                    className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                        msg.sender === "user"
                                            ? "bg-gradient-to-r from-[#601238] via-[#851D52] to-[#E25865] text-white rounded-tr-xs shadow-lg shadow-[#851D52]/20 font-medium"
                                            : "bg-gray-50/80 text-gray-800 border border-gray-100 rounded-tl-xs shadow-xs font-normal"
                                    }`}
                                >
                                    {msg.text}
                                </div>

                                <div className={`flex items-center gap-1.5 sm:gap-2 px-1 ${
                                    msg.sender === "user" ? "justify-end" : "justify-start"
                                }`}>
                                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">
                                        {msg.time}
                                    </span>

                                    {msg.sender === "ai" && (
                                        <button
                                            onClick={() => handleCopy(msg.id, msg.text)}
                                            className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
                                            title="Copy response"
                                        >
                                            {copiedId === msg.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Thinking / Loading Animation */}
                    {loading && (
                        <div className="flex gap-2 sm:gap-3 mr-auto max-w-[85%] sm:max-w-[80%] items-end">
                            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gray-100 text-[#851D52] border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                                <Bot className="w-4 h-4 sm:w-4 sm:h-4" />
                            </div>
                            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl rounded-tl-xs bg-gray-50/80 border border-gray-100 text-xs text-gray-500 flex items-center gap-2 sm:gap-3">
                                <div className="flex gap-1 sm:gap-1.5">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#851D52] animate-pulse" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#851D52] animate-pulse" style={{ animationDelay: '200ms' }} />
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#851D52] animate-pulse" style={{ animationDelay: '400ms' }} />
                                </div>
                                <span className="font-semibold text-gray-500 text-[11px] sm:text-xs">Bayan AI is thinking...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSend} className="flex gap-2 sm:gap-3 flex-shrink-0">
                    <div className="flex-1 min-w-0 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Bayan AI anything..."
                            className="w-full bg-white/90 border border-gray-200/80 focus:border-[#851D52] focus:ring-4 focus:ring-[#851D52]/10 rounded-xl sm:rounded-2xl px-3.5 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm outline-none transition-all shadow-lg shadow-gray-200/30 text-gray-800 placeholder-gray-400 font-medium"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-gradient-to-r from-[#601238] via-[#851D52] to-[#E25865] hover:opacity-95 text-white px-4 sm:px-7 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#851D52]/25 cursor-pointer flex-shrink-0"
                    >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Chat;
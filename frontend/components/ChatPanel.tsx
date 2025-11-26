"use client";
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { Send, Bot } from 'lucide-react';

interface ChatPanelProps {
    ticker: string;
}

interface Message {
    role: 'user' | 'bot';
    text: string;
}

export default function ChatPanel({ ticker }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: `안녕하세요! ${ticker} 투자 가이드입니다. 무엇이 궁금하신가요? (예: 개요, 가격, 투자 전망)` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.chatGuide(ticker, userMsg);
            setMessages(prev => [...prev, { role: 'bot', text: res.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: "오류가 발생했습니다. 다시 시도해주세요." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] glass-card rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-white">AI 투자 가이드</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white/10 text-gray-200 rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="질문을 입력하세요..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="p-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}

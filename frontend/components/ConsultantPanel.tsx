"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, CheckCircle } from 'lucide-react';

interface ConsultantPanelProps {
    ticker: string;
}

export default function ConsultantPanel({ ticker }: ConsultantPanelProps) {
    const [advice, setAdvice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getConsultation(ticker)
            .then(data => {
                setAdvice(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [ticker]);

    if (loading) {
        return (
            <div className="p-6 rounded-2xl glass-card animate-pulse h-full">
                <div className="h-6 bg-white/5 rounded w-1/3 mb-4"></div>
                <div className="h-20 bg-white/5 rounded mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!advice) return null;

    const getActionColor = (action: string) => {
        if (action.includes('BUY') || action.includes('매수')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.2)]';
        if (action.includes('SELL') || action.includes('매도')) return 'text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(251,113,133,0.2)]';
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]';
    };

    return (
        <div className="p-8 rounded-3xl glass-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
                    AI 투자 컨설턴트
                </h2>
                <div className={`px-6 py-2.5 rounded-xl border font-bold text-lg tracking-wider backdrop-blur-md ${getActionColor(advice.action)}`}>
                    {advice.action}
                </div>
            </div>

            <div className="space-y-8 flex-1">
                {/* Reasons */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        핵심 분석 요약
                    </h3>
                    <ul className="space-y-4">
                        {advice.reasons.map((reason: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-200 bg-white/5 p-3 rounded-xl border border-white/5">
                                <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{reason}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 mt-auto">
                    <div className="text-center p-4 bg-black/20 rounded-2xl border border-white/5">
                        <div className="text-xs text-gray-500 mb-2">RSI (14)</div>
                        <div className={`font-mono text-xl font-bold ${advice.analysis.technical.rsi > 70 || advice.analysis.technical.rsi < 30 ? 'text-amber-400' : 'text-white'}`}>
                            {advice.analysis.technical.rsi.toFixed(1)}
                        </div>
                    </div>
                    <div className="text-center p-4 bg-black/20 rounded-2xl border border-white/5">
                        <div className="text-xs text-gray-500 mb-2">펀더멘털</div>
                        <div className="font-bold text-white text-sm break-keep">
                            {advice.analysis.fundamental.valuation.split(' ')[0]}
                        </div>
                    </div>
                    <div className="text-center p-4 bg-black/20 rounded-2xl border border-white/5">
                        <div className="text-xs text-gray-500 mb-2">뉴스 감성</div>
                        <div className={`font-bold text-sm break-keep ${advice.analysis.sentiment.sentiment_label.includes('Positive') || advice.analysis.sentiment.sentiment_label.includes('긍정') ? 'text-emerald-400' : advice.analysis.sentiment.sentiment_label.includes('Negative') || advice.analysis.sentiment.sentiment_label.includes('부정') ? 'text-rose-400' : 'text-gray-300'}`}>
                            {advice.analysis.sentiment.sentiment_label.split(' ')[0]}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

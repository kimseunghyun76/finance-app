"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AnalysisResult {
    ticker: string;
    action: string;
    score: number;
    reasons: string[];
    analysis: {
        technical: {
            rsi: number;
            trend: string;
        };
        fundamental: {
            pe_ratio: number;
            valuation: string;
        };
        sentiment: {
            sentiment_label: string;
            sentiment_score: number;
        };
    };
}

interface InvestmentOutlookProps {
    ticker: string;
}

export default function InvestmentOutlook({ ticker }: InvestmentOutlookProps) {
    const [data, setData] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getConsultation(ticker)
            .then(result => {
                setData(result);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [ticker]);

    if (loading) return <div className="animate-pulse h-64 bg-white/5 rounded-3xl"></div>;
    if (!data) return null;

    const getActionColor = (action: string) => {
        if (action.includes("BUY")) return "text-emerald-400";
        if (action.includes("SELL")) return "text-rose-400";
        return "text-yellow-400";
    };

    const getScoreColor = (score: number) => {
        if (score >= 3) return "bg-emerald-500";
        if (score <= -2) return "bg-rose-500";
        return "bg-yellow-500";
    };

    return (
        <div className="glass-card rounded-3xl p-8 h-full flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                AI 투자 전망 보고서
            </h3>

            <div className="flex-1 flex flex-col gap-6">
                {/* Main Verdict */}
                <div className="text-center py-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-gray-400 text-sm mb-2">종합 투자 의견</div>
                    <div className={`text-3xl font-bold ${getActionColor(data.action)} mb-2`}>
                        {data.action}
                    </div>
                    <div className="flex justify-center items-center gap-2">
                        <div className="h-2 w-32 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getScoreColor(data.score)} transition-all duration-1000`}
                                style={{ width: `${Math.min(Math.max((data.score + 5) * 10, 0), 100)}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-400">Score: {data.score}</span>
                    </div>
                </div>

                {/* Key Reasons */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        핵심 분석 근거
                    </h4>
                    {data.reasons.length > 0 ? (
                        data.reasons.map((reason, idx) => (
                            <div key={idx} className="text-sm text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
                                {reason}
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500 italic">특별한 특이사항이 없습니다.</div>
                    )}
                </div>

                {/* Detailed Metrics (Mini) */}
                <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-white/10">
                    <div className="text-center">
                        <div className="text-xs text-gray-500">RSI</div>
                        <div className="font-mono text-sm text-white">{data.analysis.technical.rsi?.toFixed(1) || '-'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500">PER</div>
                        <div className="font-mono text-sm text-white">{data.analysis.fundamental.pe_ratio?.toFixed(1) || '-'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500">감성</div>
                        <div className="font-mono text-sm text-white">{data.analysis.sentiment?.sentiment_label?.split(' ')[0] || '-'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

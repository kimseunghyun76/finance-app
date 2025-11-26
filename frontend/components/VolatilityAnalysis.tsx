"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AlertCircle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

interface VolatilityData {
    ticker: string;
    change_percent: number;
    move_type: string;
    cause: string;
    related_news: any[];
}

interface Props {
    ticker: string;
}

export default function VolatilityAnalysis({ ticker }: Props) {
    const [data, setData] = useState<VolatilityData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [ticker]);

    const fetchData = async () => {
        try {
            const result = await api.getVolatilityAnalysis(ticker);
            setData(result);
        } catch (error) {
            console.error("Failed to fetch volatility analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSkeleton className="h-40 rounded-2xl mb-6" />;
    if (!data) return null;

    const isPositive = data.change_percent > 0;
    const isSignificant = Math.abs(data.change_percent) > 3;

    return (
        <div className="glass-card p-6 rounded-2xl mb-6 border border-white/10 relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                        {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">AI 변동성 분석</h3>
                        <div className="text-xs text-gray-400">최근 5일 기준</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {data.move_type}
                            </span>
                            <span className="text-sm text-gray-400">
                                ({data.change_percent > 0 ? '+' : ''}{data.change_percent.toFixed(2)}%)
                            </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            {data.cause}
                        </p>
                    </div>

                    {data.related_news.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                <Info className="w-3 h-3" /> 관련 뉴스
                            </div>
                            <ul className="space-y-2">
                                {data.related_news.map((news, idx) => (
                                    <li key={idx} className="text-sm text-gray-300 truncate hover:text-white transition-colors cursor-pointer">
                                        • {news.title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Compass, TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface MarketRegime {
    regime: string;
    advice: string;
    indicators: {
        usd_krw: number;
        kospi_change: number;
    };
}

export default function MarketRegimeWidget() {
    const [data, setData] = useState<MarketRegime | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getMarketRegime().then(res => {
            setData(res);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="h-48 bg-white/5 rounded-3xl animate-pulse"></div>;
    if (!data) return null;

    return (
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Compass className="w-24 h-24 text-white" />
            </div>

            <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                시장 국면 가이드 (Market Regime)
            </h3>

            <div className="mb-6">
                <div className="text-2xl font-bold text-white mb-2">{data.regime}</div>
                <div className="text-sm text-gray-400 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                    <Info className="w-4 h-4 inline mr-1 text-blue-400" />
                    {data.advice}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">USD/KRW 환율</span>
                    <span className={`text-lg font-mono font-bold ${data.indicators.usd_krw > 1400 ? 'text-rose-400' : 'text-white'}`}>
                        ₩{data.indicators.usd_krw.toLocaleString()}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">KOSPI 변동</span>
                    <span className={`text-lg font-mono font-bold ${data.indicators.kospi_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {data.indicators.kospi_change >= 0 ? '+' : ''}{data.indicators.kospi_change.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    );
}

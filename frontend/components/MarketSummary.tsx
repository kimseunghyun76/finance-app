"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Globe } from 'lucide-react';

export default function MarketSummary() {
    const [data, setData] = useState<Record<string, { price: number; change: number; change_percent: number }> | null>(null);

    useEffect(() => {
        api.getMarketSummary().then(setData).catch(console.error);
    }, []);

    if (!data) return null;

    const usIndices = [
        { name: "S&P 500", key: "S&P 500" },
        { name: "Nasdaq", key: "Nasdaq" },
        { name: "Dow Jones", key: "Dow Jones" },
    ];

    const krIndices = [
        { name: "KOSPI", key: "KOSPI" },
        { name: "KOSDAQ", key: "KOSDAQ" },
        { name: "USD/KRW", key: "USD/KRW" },
    ];

    const otherIndices = [
        { name: "Bitcoin", key: "Bitcoin" },
        { name: "Gold", key: "Gold" },
        { name: "WTI Crude Oil", key: "WTI Crude Oil" },
    ];

    const renderIndex = (name: string, key: string) => {
        const item = data[key] || { price: 0, change: 0, change_percent: 0 };
        const isPositive = item.change >= 0;
        const color = isPositive ? "text-emerald-400" : "text-rose-400";

        return (
            <div key={key} className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <span className="text-gray-400 text-sm">{name}</span>
                <div className="text-right">
                    <div className="font-mono font-bold text-white">
                        ${item.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs font-mono ${color}`}>
                        {isPositive ? "+" : ""}{item.change?.toFixed(2)} ({isPositive ? "+" : ""}{item.change_percent?.toFixed(2)}%)
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="glass-card rounded-3xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                시장 요약
            </h3>

            <div className="space-y-6">
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">미국 증시 (US Market)</h4>
                    <div className="space-y-2">
                        {usIndices.map(idx => renderIndex(idx.name, idx.key))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">한국 증시 (KR Market)</h4>
                    <div className="space-y-2">
                        {krIndices.map(idx => renderIndex(idx.name, idx.key))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">기타 (Crypto & Commodities)</h4>
                    <div className="space-y-2">
                        {otherIndices.map(idx => renderIndex(idx.name, idx.key))}
                    </div>
                </div>
            </div>
        </div>
    );
}

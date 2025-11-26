"use client";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function EconomicIndicators() {
    // Mock Data
    const indicators = [
        { name: 'GDP 성장률', value: '2.9%', change: 0.1, trend: 'up' },
        { name: 'CPI (소비자물가지수)', value: '3.2%', change: -0.1, trend: 'down' },
        { name: '실업률', value: '3.9%', change: 0.0, trend: 'neutral' },
        { name: '기준금리 (Fed Rate)', value: '5.50%', change: 0.0, trend: 'neutral' },
    ];

    return (
        <div className="glass-card p-6 rounded-3xl h-full">
            <h3 className="text-lg font-bold text-gray-300 mb-4">주요 경제 지표</h3>
            <div className="grid grid-cols-2 gap-4">
                {indicators.map((item) => (
                    <div key={item.name} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-xs text-gray-400 mb-1">{item.name}</div>
                        <div className="text-xl font-bold text-white flex items-center gap-2">
                            {item.value}
                            {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                            {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-400" />}
                            {item.trend === 'neutral' && <Minus className="w-4 h-4 text-gray-400" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { TrendingUp, TrendingDown, DollarSign, Droplet, Globe, Activity } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

interface MarketData {
    [key: string]: {
        price: number;
        change: number;
        change_percent: number;
    };
}

export default function MacroOverview() {
    const [data, setData] = useState<MarketData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const result = await api.getMarketSummary();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch macro data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSkeleton className="h-32 w-full rounded-2xl" />;
    if (!data) return null;

    const items = [
        { label: 'USD/KRW', value: data['USD/KRW'], icon: DollarSign, color: 'text-green-400', suffix: '₩' },
        { label: 'Gold', value: data['Gold'], icon: Globe, color: 'text-yellow-400', suffix: '$' },
        { label: 'WTI Oil', value: data['WTI Crude Oil'], icon: Droplet, color: 'text-red-400', suffix: '$' },
        { label: 'KOSPI', value: data['KOSPI'], icon: Activity, color: 'text-blue-400', suffix: '' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {items.map((item) => (
                <div key={item.label} className="glass-card p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <item.icon className={`w-12 h-12 ${item.color}`} />
                    </div>

                    <div className="text-sm text-gray-400 font-medium mb-1">{item.label}</div>
                    <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold text-white">
                            {item.label === 'USD/KRW' ? (
                                <>
                                    {item.value?.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    <span className="text-sm text-gray-500 ml-1">{item.suffix}</span>
                                </>
                            ) : (
                                <>
                                    {item.suffix}{item.value?.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </>
                            )}
                        </div>
                        <div className={`text-xs font-bold mb-1 ${item.value?.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.value?.change >= 0 ? '+' : ''}{item.value?.change_percent?.toFixed(2)}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

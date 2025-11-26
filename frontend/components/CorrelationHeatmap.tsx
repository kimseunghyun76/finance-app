"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Info } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

interface CorrelationData {
    assets: string[];
    matrix: Array<{
        asset: string;
        [key: string]: number | string;
    }>;
}

export default function CorrelationHeatmap() {
    const [data, setData] = useState<CorrelationData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const result = await api.getPortfolioCorrelation();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch correlation data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSkeleton className="h-64 rounded-3xl mb-8" />;
    if (!data || data.assets.length === 0) return null;

    const getColor = (value: number) => {
        if (value === 1) return 'bg-blue-500/20 text-blue-400';
        if (value > 0.5) return 'bg-emerald-500/30 text-emerald-400';
        if (value > 0) return 'bg-emerald-500/10 text-emerald-500/70';
        if (value < -0.5) return 'bg-rose-500/30 text-rose-400';
        if (value < 0) return 'bg-rose-500/10 text-rose-500/70';
        return 'bg-gray-500/10 text-gray-400';
    };

    return (
        <div className="glass-card rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-400" />
                    자산 상관관계 분석 (Correlation Matrix)
                </h3>
                <div className="text-xs text-gray-500">
                    * 1.0에 가까울수록 함께 움직임, -1.0에 가까울수록 반대로 움직임
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr>
                            <th className="p-2"></th>
                            {data.assets.map(asset => (
                                <th key={asset} className="p-2 text-gray-400 font-medium text-center min-w-[80px]">
                                    {asset}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.matrix.map((row) => (
                            <tr key={row.asset}>
                                <td className="p-2 text-gray-400 font-medium whitespace-nowrap">
                                    {row.asset}
                                </td>
                                {data.assets.map((colAsset) => {
                                    const val = row[colAsset] as number;
                                    return (
                                        <td key={colAsset} className="p-1">
                                            <div className={`w-full h-10 rounded-lg flex items-center justify-center font-mono text-xs ${getColor(val)}`}>
                                                {val > 0 ? '+' : ''}{val}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

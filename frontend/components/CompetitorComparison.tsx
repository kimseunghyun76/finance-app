"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';

interface Competitor {
    ticker: string;
    name: string;
    price: number;
    market_cap: number;
    pe_ratio: number;
}

interface CompetitorComparisonProps {
    ticker: string;
}

export default function CompetitorComparison({ ticker }: CompetitorComparisonProps) {
    const router = useRouter();
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getCompetitors(ticker)
            .then(data => {
                setCompetitors(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [ticker]);

    if (loading) return <div className="animate-pulse h-40 bg-white/5 rounded-3xl"></div>;
    if (competitors.length === 0) return null;

    const formatMarketCap = (val: number) => {
        if (!val) return '-';
        return `$${(val / 1e9).toFixed(1)}B`;
    };

    return (
        <div className="glass-card rounded-3xl p-8 mt-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-400" />
                경쟁사 비교 분석
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                            <th className="py-4 font-medium">종목명</th>
                            <th className="py-4 font-medium text-right">현재가</th>
                            <th className="py-4 font-medium text-right">시가총액</th>
                            <th className="py-4 font-medium text-right">PER (주가수익비율)</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-200">
                        {competitors.map((comp) => (
                            <tr
                                key={comp.ticker}
                                onClick={() => router.push(`/?ticker=${comp.ticker}`)}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <td className="py-4">
                                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{comp.name}</div>
                                    <div className="text-xs text-gray-500">{comp.ticker}</div>
                                </td>
                                <td className="py-4 text-right font-mono">
                                    ${comp.price.toFixed(2)}
                                </td>
                                <td className="py-4 text-right font-mono text-gray-400">
                                    {formatMarketCap(comp.market_cap)}
                                </td>
                                <td className="py-4 text-right">
                                    <span className={`px-2 py-1 rounded text-sm font-bold ${comp.pe_ratio > 0 && comp.pe_ratio < 15
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : comp.pe_ratio > 30
                                            ? 'bg-rose-500/20 text-rose-400'
                                            : 'bg-white/10 text-gray-300'
                                        }`}>
                                        {comp.pe_ratio ? comp.pe_ratio.toFixed(1) : 'N/A'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

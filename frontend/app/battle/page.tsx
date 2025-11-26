"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Trophy, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface PortfolioItem {
    ticker: string;
    name: string;
    return: number;
    price: number;
}

interface FundManager {
    id: string;
    name: string;
    style: string;
    desc: string;
    avatar: string;
    color: string;
    return: number;
    rank: number;
    portfolio: PortfolioItem[];
}

export default function BattlePage() {
    const [managers, setManagers] = useState<FundManager[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getBattleStatus().then(data => {
            setManagers(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    return (
        <div className="space-y-8 py-8">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                    <span className="text-5xl">⚔️</span> AI 투자 배틀 (AI Fund Battle)
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    서로 다른 투자 철학을 가진 3명의 AI 펀드매니저가 가상 수익률 대결을 펼칩니다.<br />
                    현재 시장 상황에서 어떤 스타일이 가장 우수한 성과를 내고 있을까요?
                </p>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Array(3).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-96 rounded-3xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {managers.map((manager) => (
                        <div key={manager.id} className={`glass-card rounded-3xl overflow-hidden border-2 ${manager.rank === 1 ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-transparent'}`}>
                            {/* Header */}
                            <div className="p-6 text-center relative">
                                {manager.rank === 1 && (
                                    <div className="absolute top-4 right-4 text-yellow-500 animate-bounce">
                                        <Trophy className="w-8 h-8 fill-yellow-500" />
                                    </div>
                                )}
                                <div className="text-6xl mb-4">{manager.avatar}</div>
                                <h2 className={`text-2xl font-bold ${manager.color} mb-1`}>{manager.name}</h2>
                                <div className="text-sm text-gray-400 font-medium mb-2">{manager.style}</div>
                                <p className="text-xs text-gray-500 h-10">{manager.desc}</p>
                            </div>

                            {/* Performance */}
                            <div className="bg-white/5 p-4 text-center border-y border-white/10">
                                <div className="text-xs text-gray-400 mb-1">최근 1개월 수익률</div>
                                <div className={`text-3xl font-bold font-mono ${manager.return >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {manager.return >= 0 ? '+' : ''}{manager.return.toFixed(2)}%
                                </div>
                            </div>

                            {/* Portfolio */}
                            <div className="p-6">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-gray-400" />
                                    현재 보유 종목 (Top Picks)
                                </h3>
                                <div className="space-y-3">
                                    {manager.portfolio.map((stock) => (
                                        <div key={stock.ticker} className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                            <div>
                                                <div className="font-bold text-white text-sm">{stock.name}</div>
                                                <div className="text-xs text-gray-500">{stock.ticker}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-white text-sm">${stock.price.toFixed(2)}</div>
                                                <div className={`text-xs font-bold ${stock.return >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {stock.return >= 0 ? '+' : ''}{stock.return.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-12 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div className="text-sm text-gray-300 leading-relaxed">
                    <strong className="text-white block mb-1">알림</strong>
                    본 대결은 AI가 과거 데이터를 기반으로 시뮬레이션한 결과입니다. 실제 투자를 권유하는 것이 아니며, 각 AI의 투자 스타일이 현재 시장에서 어떻게 작동하는지 보여주는 참고용 지표로만 활용하세요.
                </div>
            </div>
        </div>
    );
}

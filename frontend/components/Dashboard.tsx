"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { TrendingUp, TrendingDown, Globe, Newspaper, Info, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EconomicCalendar from './EconomicCalendar';
import MarketNews from './MarketNews';
import FearGreedGauge from './FearGreedGauge';
import MarketRegimeWidget from './MarketRegimeWidget';
import LoadingSkeleton from './LoadingSkeleton';
import SectorRotation from './SectorRotation';

interface Recommendation {
    ticker: string;
    name: string;
    action: string;
    score: number;
    reasons: string[];
    price: number;
}

export default function Dashboard() {
    const router = useRouter();
    const [marketData, setMarketData] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [movers, setMovers] = useState<{ gainers: any[], losers: any[] }>({ gainers: [], losers: [] });
    const [loading, setLoading] = useState(true);
    const [showModelInfo, setShowModelInfo] = useState(false);

    useEffect(() => {
        Promise.all([
            api.getMarketSummary(),
            api.getRecommendations(),
            api.getMarketMovers()
        ]).then(([market, recs, moversData]) => {
            setMarketData(market);
            setRecommendations(recs);
            setMovers(moversData);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    // if (loading) return <div className="animate-pulse h-96 bg-white/5 rounded-3xl"></div>;

    const indices = [
        { name: "S&P 500", key: "S&P 500" },
        { name: "Nasdaq", key: "Nasdaq" },
        { name: "Dow Jones", key: "Dow Jones" },
        { name: "Gold", key: "Gold" },
        { name: "Bitcoin", key: "Bitcoin" },
        { name: "10Y Yield", key: "10Y Treasury Yield" },
        { name: "Crude Oil", key: "WTI Crude Oil" },
        { name: "USD/KRW", key: "USD/KRW" },
    ];

    return (
        <div className="space-y-8">
            {/* Market Overview */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-400" />
                    시장 현황 (Market Overview)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        Array(8).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-24 rounded-2xl" />)
                    ) : (
                        indices.map((idx) => {
                            const item = marketData?.[idx.key] || { price: 0, change: 0, change_percent: 0 };
                            const isPositive = item.change >= 0;
                            const color = isPositive ? "text-emerald-400" : "text-rose-400";

                            return (
                                <div key={idx.name} className="glass-card p-6 rounded-2xl">
                                    <div className="text-gray-400 text-sm mb-2">{idx.name}</div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-2xl font-bold font-mono text-white">
                                            ${item.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </div>
                                        <div className={`text-xs font-mono font-bold ${color} mb-1`}>
                                            {isPositive ? "+" : ""}{item.change_percent?.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {/* AI Strategy & Recommendations */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Strategy */}
                <div className="lg:col-span-1 space-y-6">
                    <MarketRegimeWidget />
                    {loading ? (
                        <LoadingSkeleton className="h-48 rounded-3xl" />
                    ) : (
                        <FearGreedGauge value={marketData?.['Fear & Greed']?.price ? Math.round(marketData['Fear & Greed'].price) : 50} />
                    )}
                </div>

                {/* Right: Recommendations */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                            오늘의 AI 추천 종목
                        </h2>
                        <button
                            onClick={() => setShowModelInfo(true)}
                            className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                        >
                            <Info className="w-4 h-4" />
                            AI 모델 정보
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array(2).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-48 rounded-2xl" />)}
                        </div>
                    ) : recommendations.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">
                            현재 추천할 만한 확실한 종목을 찾지 못했습니다. 잠시 후 다시 시도해주세요.
                        </div>
                    ) : (
                        <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {recommendations.map((stock) => (
                                    <div
                                        key={stock.ticker}
                                        onClick={() => router.push(`/?ticker=${stock.ticker}`)}
                                        className="glass-card p-6 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{stock.name}</div>
                                                <div className="text-sm text-gray-500">{stock.ticker}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold inline-block mb-1">
                                                    {stock.action} (Score: {stock.score})
                                                </div>
                                                <div className="text-white font-mono">${stock.price.toFixed(2)}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            {stock.reasons.map((reason, idx) => (
                                                <div key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                                    {reason}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Model Info Modal */}
            {
                showModelInfo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-lg w-full p-8 relative">
                            <button
                                onClick={() => setShowModelInfo(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-400" />
                                Aladdin AI 분석 모델
                            </h3>

                            <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                                <p>
                                    본 추천 시스템은 3가지 핵심 요소를 종합적으로 분석하여 종목을 선정합니다.
                                </p>

                                <div className="bg-white/5 p-4 rounded-xl">
                                    <strong className="text-white block mb-1">1. 기술적 분석 (Technical)</strong>
                                    이동평균선(SMA) 추세, RSI(상대강도지수), MACD 등을 분석하여 매수/매도 타이밍을 포착합니다.
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl">
                                    <strong className="text-white block mb-1">2. 펀더멘털 분석 (Fundamental)</strong>
                                    PER(주가수익비율), PBR, PEG 등을 분석하여 기업의 내재 가치 대비 저평가 여부를 판단합니다.
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl">
                                    <strong className="text-white block mb-1">3. 감성 분석 (Sentiment)</strong>
                                    최신 뉴스 기사의 긍정/부정 키워드를 AI가 분석하여 시장의 심리를 파악합니다.
                                </div>

                                <p className="text-xs text-gray-500 mt-4">
                                    * 본 추천은 참고용이며, 투자의 책임은 전적으로 투자자 본인에게 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Top Gainers & Losers & Sector Rotation */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                    시장 주도주 및 섹터 (Market Movers)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gainers */}
                    <div className="glass-card p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> 급등주 (Top Gainers)
                        </h3>
                        <div className="space-y-3">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-12 rounded-xl" />)
                            ) : (
                                movers.gainers.map((stock) => (
                                    <div key={stock.ticker} onClick={() => router.push(`/?ticker=${stock.ticker}`)} className="flex justify-between items-center p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                        <div>
                                            <div className="font-bold text-white text-sm">{stock.name}</div>
                                            <div className="text-xs text-gray-500">{stock.ticker}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-white text-sm">${stock.price.toFixed(2)}</div>
                                            <div className="text-xs font-bold text-emerald-400">+{stock.change.toFixed(2)}%</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Losers */}
                    <div className="glass-card p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" /> 급락주 (Top Losers)
                        </h3>
                        <div className="space-y-3">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-12 rounded-xl" />)
                            ) : (
                                movers.losers.map((stock) => (
                                    <div key={stock.ticker} onClick={() => router.push(`/?ticker=${stock.ticker}`)} className="flex justify-between items-center p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                        <div>
                                            <div className="font-bold text-white text-sm">{stock.name}</div>
                                            <div className="text-xs text-gray-500">{stock.ticker}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-white text-sm">${stock.price.toFixed(2)}</div>
                                            <div className="text-xs font-bold text-rose-400">{stock.change.toFixed(2)}%</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sector Rotation (Filling the gap) */}
                    <div className="h-full">
                        <SectorRotation />
                    </div>
                </div>
            </section>

            {/* News & Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Economic Calendar (Expanded) */}
                <section className="lg:col-span-2 h-[500px]">
                    <EconomicCalendar />
                </section>

                {/* Market News (Sidebar) */}
                <section className="lg:col-span-1 h-[500px]">
                    <MarketNews />
                </section>
            </div>
        </div >
    );
}

"use client";

import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import MarketHeatmap from '@/components/MarketHeatmap';
import MarketBreadth from '@/components/MarketBreadth';
import SectorRotation from '@/components/SectorRotation';
import EconomicIndicators from '@/components/EconomicIndicators';
import MarketSentimentAnalysis from '@/components/MarketSentimentAnalysis';
import AIMarketOutlook from '@/components/AIMarketOutlook';
import MacroOverview from '@/components/MacroOverview';
import LoadingSkeleton from '@/components/LoadingSkeleton';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Insights() {
    const [marketData, setMarketData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getMarketSummary().then(data => {
            setMarketData(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    // Data
    const vix = marketData?.['VIX (Volatility)'] || 0;
    const fearGreed = marketData?.['Fear & Greed']?.price ? Math.round(marketData['Fear & Greed'].price) : 50;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">시장 인사이트</h1>

            {/* Macro Overview */}
            <MacroOverview />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Row 1: Heatmap */}
                <div className="lg:col-span-3">
                    {loading ? <LoadingSkeleton className="h-[500px] rounded-3xl" /> : <MarketHeatmap />}
                </div>

                {/* Row 2: Economic & AI */}
                <div className="lg:col-span-1">
                    {loading ? <LoadingSkeleton className="h-full rounded-3xl" /> : <EconomicIndicators />}
                </div>
                <div className="lg:col-span-2">
                    {loading ? <LoadingSkeleton className="h-full rounded-3xl" /> : <AIMarketOutlook />}
                </div>

                {/* Row 3: Charts */}
                <div className="lg:col-span-1">
                    {loading ? <LoadingSkeleton className="h-64 rounded-3xl" /> : <MarketBreadth />}
                </div>
                <div className="lg:col-span-1">
                    {loading ? <LoadingSkeleton className="h-64 rounded-3xl" /> : <MarketSentimentAnalysis />}
                </div>
                <div className="lg:col-span-1">
                    {loading ? <LoadingSkeleton className="h-64 rounded-3xl" /> : <SectorRotation />}
                </div>

                {/* Row 4: Sentiment & VIX */}
                <div className="lg:col-span-1">
                    {loading ? (
                        <LoadingSkeleton className="h-full rounded-3xl" />
                    ) : (
                        <div className="glass-card p-8 rounded-3xl h-full">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-orange-400" />
                                시장 공포/탐욕 지수
                            </h3>
                            <div className="relative pt-4 pb-8">
                                <div className="h-4 bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500 rounded-full w-full"></div>
                                <div
                                    className="absolute top-0 w-1 h-12 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-1000"
                                    style={{ left: `${fearGreed}%` }}
                                ></div>
                                <div className="flex justify-between mt-2 text-xs text-gray-400 font-bold uppercase">
                                    <span>공포 (Extreme Fear)</span>
                                    <span>중립 (Neutral)</span>
                                    <span>탐욕 (Extreme Greed)</span>
                                </div>
                                <div className="text-center mt-6">
                                    <div className="text-4xl font-bold text-emerald-400">{fearGreed}</div>
                                    <div className="text-sm text-gray-400">Greed (탐욕)</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    {loading ? (
                        <LoadingSkeleton className="h-full rounded-3xl" />
                    ) : (
                        <div className="glass-card p-8 rounded-3xl h-full flex flex-col justify-center">
                            <h3 className="text-xl font-bold mb-4 text-gray-300">VIX (변동성 지수)</h3>
                            <div className="text-5xl font-bold font-mono text-white mb-2">
                                {vix?.price?.toFixed(2) || "0.00"}
                            </div>
                            <div className="text-sm text-gray-400">
                                <span className="text-emerald-400 font-bold">안정적</span> (20 이하)
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

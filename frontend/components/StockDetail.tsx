"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';
import CompetitorComparison from './CompetitorComparison';
import NewsBriefing from './NewsBriefing';
import InvestmentOutlook from './InvestmentOutlook';
import CandlestickChart from './CandlestickChart';
import VolatilityAnalysis from './VolatilityAnalysis';
import SeasonalityChart from './SeasonalityChart';

interface StockDetailProps {
    ticker: string;
    onWatchlistChange?: () => void;
}

export default function StockDetail({ ticker, onWatchlistChange }: StockDetailProps) {
    const [data, setData] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [isWatchlisted, setIsWatchlisted] = useState(false);

    useEffect(() => {
        api.getStockDetails(ticker).then(setData).catch(console.error);
        api.getStockEvents(ticker).then(setEvents).catch(console.error);

        // Check if watchlisted
        api.getWatchlist().then((list: any[]) => {
            const found = list.find((item: any) => item.ticker === ticker);
            setIsWatchlisted(!!found);
        });
    }, [ticker]);

    const toggleWatchlist = async () => {
        try {
            if (isWatchlisted) {
                await api.removeWatchlist(ticker);
                setIsWatchlisted(false);
            } else {
                await api.addWatchlist(ticker);
                setIsWatchlisted(true);
            }
            // Dispatch event for sibling components
            window.dispatchEvent(new Event('watchlist-change'));

            if (onWatchlistChange) onWatchlistChange();
        } catch (err) {
            console.error(err);
        }
    };

    if (!data) return <div className="text-center py-40 text-gray-500 animate-pulse">데이터를 불러오는 중입니다...</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between pb-6 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-5xl font-bold text-white tracking-tight">{data.ticker}</h1>
                        <button
                            onClick={toggleWatchlist}
                            className={`p-2 rounded-full transition-all ${isWatchlisted ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            <Star className={`w-6 h-6 ${isWatchlisted ? 'fill-yellow-400' : ''}`} />
                        </button>
                    </div>
                    <p className="text-xl text-gray-400 font-light">{data.company_name}</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        ${data.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-400 font-medium uppercase tracking-widest mt-1 px-3 py-1 bg-blue-500/10 rounded-full inline-block border border-blue-500/20">
                        {data.sector}
                    </div>
                </div>
            </div>

            {/* AI Volatility Analysis */}
            <VolatilityAnalysis ticker={ticker} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Chart & Summary */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Chart */}
                    <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <CandlestickChart data={data.history} events={events} />
                    </div>

                    {/* Seasonality Chart (New Feature) */}
                    {data.seasonality && (
                        <SeasonalityChart
                            data={data.seasonality.seasonality}
                            bestDay={data.seasonality.best_day}
                            worstDay={data.seasonality.worst_day}
                            summary={data.seasonality.summary}
                        />
                    )}

                    {/* Summary */}
                    <div className="glass-card p-8 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-gray-500 rounded-full"></span>
                            기업 개요
                        </h3>
                        <p className="text-gray-300 leading-loose text-sm font-light mb-6">
                            {data.summary}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">섹터</div>
                                <div className="text-white text-sm">{data.details?.sector || '-'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">산업</div>
                                <div className="text-white text-sm">{data.details?.industry || '-'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">시가총액</div>
                                <div className="text-white text-sm">
                                    {data.details?.market_cap ? `$${(data.details.market_cap / 1e9).toFixed(2)}B` : '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">직원 수</div>
                                <div className="text-white text-sm">
                                    {data.details?.employees ? `${data.details.employees.toLocaleString()}명` : '-'}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-xs text-gray-500 mb-1">웹사이트</div>
                                <a href={data.details?.website} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline truncate block">
                                    {data.details?.website || '-'}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: AI Investment Outlook */}
                <div className="lg:col-span-1 h-full">
                    <InvestmentOutlook ticker={ticker} />
                </div>
            </div>

            {/* Competitor Comparison */}
            <CompetitorComparison ticker={ticker} />

            {/* AI News Briefing */}
            <NewsBriefing ticker={ticker} />
        </div>
    );
}

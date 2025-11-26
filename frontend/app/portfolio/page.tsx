"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Plus, Trash2, X, RefreshCw, Calendar, TrendingUp, DollarSign, Activity } from 'lucide-react';
import StockSearchInput from '@/components/StockSearchInput';
import PortfolioAnalysis from '@/components/PortfolioAnalysis';
import CorrelationHeatmap from '@/components/CorrelationHeatmap';

interface Holding {
    ticker: string;
    name: string;
    shares: number;
    avg_price: number;
    current_price: number;
    current_value: number;
    pl: number;
    pl_percent: number;
    purchase_date?: string;
}

export default function Portfolio() {
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [ticker, setTicker] = useState('');
    const [shares, setShares] = useState('');
    const [avgPrice, setAvgPrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');

    const fetchPortfolio = () => {
        setLoading(true);
        api.getPortfolio().then(data => {
            setHoldings(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addPortfolioItem(ticker.toUpperCase(), Number(shares), Number(avgPrice), purchaseDate);
            setIsModalOpen(false);
            setTicker('');
            setShares('');
            setAvgPrice('');
            setPurchaseDate('');
            fetchPortfolio();
        } catch (err) {
            console.error(err);
            alert('Failed to add holding');
        }
    };

    const handleRemove = async (ticker: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await api.removePortfolioItem(ticker);
            fetchPortfolio();
        } catch (err) {
            console.error(err);
        }
    };

    const totalValue = holdings.reduce((acc, h) => acc + h.current_value, 0);
    const totalCost = holdings.reduce((acc, h) => acc + (h.shares * h.avg_price), 0);
    const totalReturn = totalValue - totalCost;
    const returnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    const COLORS = ['#60A5FA', '#34D399', '#F87171', '#FBBF24', '#A78BFA', '#EC4899', '#8B5CF6'];

    return (
        <div>
            <div className="mb-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">내 포트폴리오</h1>
                    <button
                        onClick={fetchPortfolio}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Summary Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                <div>
                                    <div className="text-gray-400 text-sm mb-1">총 자산</div>
                                    <div className="text-4xl font-bold font-mono">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm mb-1">총 수익금</div>
                                    <div className={`text-2xl font-bold font-mono flex items-center gap-2 ${totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {totalReturn >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                                        ${Math.abs(totalReturn).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm mb-1">수익률</div>
                                    <div className={`text-2xl font-bold font-mono ${returnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {returnPercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Holdings List */}
                        <div className="glass-card rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-bold">보유 종목</h3>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    <Plus className="w-4 h-4" /> 종목 추가
                                </button>
                            </div>
                            <div className="space-y-8">
                                {/* Domestic Stocks */}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 px-2">국내 주식 (Domestic)</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">종목</th>
                                                    <th className="px-6 py-4 font-medium text-right">수량</th>
                                                    <th className="px-6 py-4 font-medium text-right">평단가</th>
                                                    <th className="px-6 py-4 font-medium text-right">현재가</th>
                                                    <th className="px-6 py-4 font-medium text-right">평가손익</th>
                                                    <th className="px-6 py-4 font-medium text-center">관리</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {holdings.filter(h => h.ticker.endsWith('.KS') || h.ticker.endsWith('.KQ')).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                                                            보유 중인 국내 주식이 없습니다.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    holdings.filter(h => h.ticker.endsWith('.KS') || h.ticker.endsWith('.KQ')).map((h) => (
                                                        <tr key={h.ticker} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-white">{h.name}</div>
                                                                <div className="text-xs text-gray-500">{h.ticker}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-mono text-gray-300">{h.shares}</td>
                                                            <td className="px-6 py-4 text-right font-mono text-gray-400">{h.avg_price.toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-right font-mono text-white">{h.current_price.toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-right font-mono">
                                                                <div className={h.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                                                    {Math.abs(h.pl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                                </div>
                                                                <div className={`text-xs ${h.pl >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                                                                    {h.pl_percent.toFixed(2)}%
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <button
                                                                    onClick={() => handleRemove(h.ticker)}
                                                                    className="text-gray-500 hover:text-rose-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Overseas Stocks */}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 px-2">해외 주식 (Overseas)</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">종목</th>
                                                    <th className="px-6 py-4 font-medium text-right">수량</th>
                                                    <th className="px-6 py-4 font-medium text-right">평단가 ($)</th>
                                                    <th className="px-6 py-4 font-medium text-right">현재가 ($)</th>
                                                    <th className="px-6 py-4 font-medium text-right">평가손익 ($)</th>
                                                    <th className="px-6 py-4 font-medium text-center">관리</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {holdings.filter(h => !h.ticker.endsWith('.KS') && !h.ticker.endsWith('.KQ')).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                                                            보유 중인 해외 주식이 없습니다.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    holdings.filter(h => !h.ticker.endsWith('.KS') && !h.ticker.endsWith('.KQ')).map((h) => (
                                                        <tr key={h.ticker} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-white">{h.name}</div>
                                                                <div className="text-xs text-gray-500">{h.ticker}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-mono text-gray-300">{h.shares}</td>
                                                            <td className="px-6 py-4 text-right font-mono text-gray-400">${h.avg_price.toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-right font-mono text-white">${h.current_price.toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-right font-mono">
                                                                <div className={h.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                                                    ${Math.abs(h.pl).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                                </div>
                                                                <div className={`text-xs ${h.pl >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                                                                    {h.pl_percent.toFixed(2)}%
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <button
                                                                    onClick={() => handleRemove(h.ticker)}
                                                                    className="text-gray-500 hover:text-rose-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="space-y-8">
                        <div className="glass-card p-6 rounded-3xl">
                            <h3 className="text-lg font-bold mb-4 text-gray-300">자산 구성</h3>
                            <div className="h-64 relative">
                                {holdings.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPie>
                                            <Pie
                                                data={holdings as any[]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="pl"
                                            >
                                                {holdings.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                                                itemStyle={{ color: '#fff' }}
                                                formatter={(value: number) => `$${value.toLocaleString()}`}
                                            />
                                        </RechartsPie>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                                        데이터 없음
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                {holdings.map((h, i) => (
                                    <div key={h.ticker} className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        {h.ticker}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* AI Analysis */}
                <div className="mt-8">
                    <PortfolioAnalysis />
                </div>

                {/* Correlation Matrix */}
                <div className="mt-8">
                    <CorrelationHeatmap />
                </div>
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold mb-6">종목 추가</h2>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">종목 검색</label>
                                <StockSearchInput onSelect={setTicker} placeholder="종목명 또는 티커 검색..." />
                                {ticker && <div className="text-xs text-blue-400 mt-1 ml-1">선택됨: {ticker}</div>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">수량</label>
                                    <input
                                        type="number"
                                        value={shares}
                                        onChange={(e) => setShares(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">평단가 ($)</label>
                                    <input
                                        type="number"
                                        value={avgPrice}
                                        onChange={(e) => setAvgPrice(e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">매수일</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="date"
                                        value={purchaseDate}
                                        onChange={(e) => setPurchaseDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-4 transition-colors"
                            >
                                포트폴리오에 추가
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

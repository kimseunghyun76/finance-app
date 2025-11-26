"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Star, Trash2, TrendingUp, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WatchlistItem {
    ticker: string;
    name: string;
    price: number;
}

export default function Watchlist() {
    const router = useRouter();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchWatchlist = (isInitial = false) => {
        if (!isInitial) setLoading(true);
        api.getWatchlist()
            .then(data => {
                setWatchlist(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        setTimeout(() => fetchWatchlist(true), 0);

        // Listen for updates from other components
        const handleUpdate = () => setRefreshTrigger(prev => prev + 1);
        window.addEventListener('watchlist-change', handleUpdate);

        return () => {
            window.removeEventListener('watchlist-change', handleUpdate);
        };
    }, [refreshTrigger]);

    const removeFromWatchlist = async (e: React.MouseEvent, ticker: string) => {
        e.stopPropagation();
        try {
            await api.removeWatchlist(ticker);
            // Dispatch event for sibling components
            window.dispatchEvent(new Event('watchlist-change'));
        } catch (err) {
            console.error(err);
        }
    };

    const formatPrice = (ticker: string, price: number) => {
        if (ticker.endsWith('.KS') || ticker.endsWith('.KQ')) {
            return `₩${price.toLocaleString()}`;
        }
        return `$${price.toFixed(2)}`;
    };

    return (
        <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    관심 종목
                </h3>
                <button
                    onClick={() => fetchWatchlist()}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {watchlist.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        관심 종목이 없습니다.<br />
                        별 아이콘을 눌러 추가해보세요.
                    </div>
                ) : (
                    watchlist.map((item) => (
                        <div
                            key={item.ticker}
                            onClick={() => router.push(`/?ticker=${item.ticker}`)}
                            className="group p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10 relative"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {item.name}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono mt-1">
                                        {item.ticker}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-white">
                                        {formatPrice(item.ticker, item.price)}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => removeFromWatchlist(e, item.ticker)}
                                className="absolute top-2 right-2 p-2 text-gray-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
    title: string;
    original_title: string;
    link: string;
    published: string;
    thumbnail: string;
    provider: string;
}

export default function MarketNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getMarketNews().then(data => {
            setNews(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="animate-pulse h-64 bg-white/5 rounded-3xl"></div>;

    return (
        <div className="glass-card p-6 rounded-3xl h-full flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-purple-400" />
                주요 시장 뉴스
            </h2>
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {news.length === 0 ? (
                    <div className="text-gray-500 text-center py-10">
                        최신 뉴스를 불러오지 못했습니다.
                    </div>
                ) : (
                    news.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-4 group cursor-pointer"
                        >
                            {/* Thumbnail */}
                            <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 relative">
                                {item.thumbnail ? (
                                    <img
                                        src={item.thumbnail}
                                        alt="News Thumbnail"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Newspaper className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                                        {item.provider}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                        {new Date(item.published).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-white text-sm font-bold leading-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>
    );
}

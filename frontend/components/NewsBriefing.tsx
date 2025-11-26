"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Newspaper, ExternalLink, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface NewsItem {
    title: string;
    summary: string;
    link: string;
    published: string;
    sentiment: string;
    polarity: number;
}

interface NewsBriefingProps {
    ticker: string;
}

export default function NewsBriefing({ ticker }: NewsBriefingProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getNewsBriefing(ticker)
            .then(data => {
                setNews(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [ticker]);

    if (loading) return <div className="animate-pulse h-40 bg-white/5 rounded-3xl mt-8"></div>;
    if (news.length === 0) return null;

    const getSentimentIcon = (sentiment: string) => {
        if (sentiment === '긍정') return <ThumbsUp className="w-4 h-4 text-emerald-400" />;
        if (sentiment === '부정') return <ThumbsDown className="w-4 h-4 text-rose-400" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="glass-card rounded-3xl p-8 mt-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-blue-400" />
                AI 뉴스 브리핑 (3줄 요약)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {news.map((item, idx) => (
                    <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-all flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${item.sentiment === '긍정' ? 'bg-emerald-500/20 text-emerald-400' :
                                item.sentiment === '부정' ? 'bg-rose-500/20 text-rose-400' :
                                    'bg-gray-500/20 text-gray-400'
                                }`}>
                                {getSentimentIcon(item.sentiment)}
                                {item.sentiment}
                            </span>
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        <h4 className="font-bold text-white mb-2 line-clamp-2 leading-snug">
                            {item.title}
                        </h4>

                        <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-4 flex-1">
                            {item.summary || "요약 내용이 없습니다."}
                        </p>

                        <div className="text-xs text-gray-600 mt-auto pt-3 border-t border-white/5">
                            {new Date(item.published).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

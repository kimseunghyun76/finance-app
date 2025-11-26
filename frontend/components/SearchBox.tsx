"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { api } from '@/lib/api';

interface SearchResult {
    ticker: string;
    name_kr: string;
    name_en: string;
}

export default function SearchBox() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length > 0) {
                try {
                    const data = await api.searchStocks(query);
                    setResults(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (ticker: string) => {
        setQuery('');
        setIsOpen(false);
        router.push(`/?ticker=${ticker}`);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 transition duration-200 blur"></div>
                <div className="relative flex items-center bg-black rounded-full border border-gray-800">
                    <Search className="ml-4 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="주식 검색 (예: 삼성, TSLA)..."
                        className="w-full bg-transparent text-white px-4 py-2.5 rounded-full focus:outline-none placeholder-gray-500"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="mr-3 text-gray-500 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute w-full mt-2 bg-black/90 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <ul>
                        {results.map((stock) => (
                            <li
                                key={stock.ticker}
                                onClick={() => handleSelect(stock.ticker)}
                                className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-gray-800/50 last:border-none"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-white">{stock.name_kr}</span>
                                    <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                                        {stock.ticker}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">{stock.name_en}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

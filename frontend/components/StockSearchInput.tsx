"use client";
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { api } from '@/lib/api';

interface StockSearchInputProps {
    onSelect: (ticker: string) => void;
    placeholder?: string;
}

export default function StockSearchInput({ onSelect, placeholder = "주식 검색..." }: StockSearchInputProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
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
        setQuery(ticker);
        onSelect(ticker);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative flex items-center bg-white/5 rounded-xl border border-white/10 focus-within:border-blue-500 transition-colors">
                <Search className="ml-4 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onSelect(e.target.value); // Allow manual typing
                    }}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-white px-4 py-3 rounded-xl focus:outline-none placeholder-gray-500 uppercase"
                />
                {query && (
                    <button onClick={() => { setQuery(''); onSelect(''); }} className="mr-3 text-gray-500 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute w-full mt-2 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                    <ul>
                        {results.map((stock) => (
                            <li
                                key={stock.ticker}
                                onClick={() => handleSelect(stock.ticker)}
                                className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-none"
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

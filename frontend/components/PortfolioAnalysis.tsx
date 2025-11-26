"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

interface AnalysisResult {
    score: number;
    summary: string;
    advice: string[];
    risk_level: string;
}

export default function PortfolioAnalysis() {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const fetchAnalysis = async () => {
        try {
            const data = await api.getPortfolioAnalysis();
            setAnalysis(data);
        } catch (error) {
            console.error("Failed to fetch portfolio analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSkeleton className="h-48 rounded-3xl mb-8" />;
    if (!analysis) return null;

    return (
        <div className="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Score Section */}
                    <div className="flex-shrink-0 text-center md:text-left">
                        <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold">
                            <Brain className="w-5 h-5" /> AI Portfolio Score
                        </div>
                        <div className="text-6xl font-bold text-white mb-2">
                            {analysis.score}
                            <span className="text-lg text-gray-500 font-normal ml-1">/ 100</span>
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${analysis.score >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                                analysis.score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-rose-500/20 text-rose-400'
                            }`}>
                            {analysis.score >= 70 ? 'Excellent' : analysis.score >= 40 ? 'Fair' : 'Needs Improvement'}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px bg-white/10 self-stretch"></div>

                    {/* Details Section */}
                    <div className="flex-grow space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">포트폴리오 요약</h3>
                            <p className="text-gray-400 text-sm">{analysis.summary}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Risk Level
                                </div>
                                <div className="font-bold text-white">{analysis.risk_level}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Action
                                </div>
                                <div className="font-bold text-emerald-400">
                                    {analysis.score >= 50 ? '유지 (HOLD)' : '리밸런싱 필요'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {analysis.advice.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
import { Bot, Sparkles } from 'lucide-react';

export default function AIMarketOutlook() {
    return (
        <div className="glass-card p-6 rounded-3xl h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        AI 시장 분석가
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                    </h3>
                    <div className="text-xs text-gray-400">실시간 분석 (Real-time Analysis)</div>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <h4 className="text-sm font-bold text-blue-400 mb-2">📈 시장 전망: 긍정적 (Bullish)</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        최근 인플레이션 지표의 둔화와 연준의 금리 동결 가능성이 시장에 긍정적인 영향을 미치고 있습니다. 기술주를 중심으로 한 상승세가 지속될 것으로 보이며, 특히 AI 관련 섹터의 강세가 두드러집니다.
                    </p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <h4 className="text-sm font-bold text-purple-400 mb-2">🔍 주목할 점</h4>
                    <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                        <li>다음 주 발표될 CPI 데이터에 주목</li>
                        <li>기술적 반등 구간에 진입한 에너지 섹터</li>
                        <li>달러 인덱스의 하락세 지속 여부</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

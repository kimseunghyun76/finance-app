"use client";
import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';

export default function NewsTicker() {
    // Mock breaking news for now
    const newsItems = [
        "연준, 기준금리 동결 시사... '인플레이션 둔화 확인 필요'",
        "나스닥, 기술주 강세에 힘입어 사상 최고치 경신",
        "삼성전자, 차세대 HBM 메모리 양산 시작",
        "국제유가, 중동 지정학적 리스크 완화에 2% 하락",
        "테슬라, 자율주행 소프트웨어 FSD v12 배포 시작",
        "비트코인, 현물 ETF 승인 기대감에 4만 달러 돌파",
        "애플, 아이폰 16 시리즈 출시일 발표 임박",
        "현대차, 전기차 전용 공장 조기 가동 추진"
    ];

    return (
        <div className="bg-blue-600 text-white overflow-hidden py-2 relative z-40 border-b border-blue-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="flex items-center gap-2 font-bold bg-blue-700 px-3 py-1 rounded-lg mr-4 text-xs whitespace-nowrap z-10 shadow-lg">
                    <Newspaper className="w-3 h-3" />
                    BREAKING NEWS
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <div className="animate-marquee whitespace-nowrap flex gap-12">
                        {/* Duplicate items for seamless loop */}
                        {[...newsItems, ...newsItems].map((item, idx) => (
                            <span key={idx} className="text-sm font-medium text-blue-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}

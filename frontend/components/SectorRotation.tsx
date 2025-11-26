"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SectorRotation() {
    // Mock Data for Sector Rotation
    const data = [
        { name: '기술', w1: 2.5, m1: 5.2 },
        { name: '헬스케어', w1: -0.5, m1: 1.2 },
        { name: '금융', w1: 1.2, m1: -0.8 },
        { name: '에너지', w1: -1.5, m1: 3.5 },
        { name: '소비재', w1: 0.8, m1: 2.1 },
        { name: '유틸리티', w1: 0.2, m1: -1.5 },
    ];

    return (
        <div className="glass-card p-6 rounded-3xl h-full">
            <h3 className="text-lg font-bold text-gray-300 mb-4">섹터 로테이션 (1주 vs 1개월)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#666" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Legend />
                        <Bar dataKey="w1" name="1주" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="m1" name="1개월" fill="#34D399" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

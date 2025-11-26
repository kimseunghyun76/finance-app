"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SeasonalityData {
    day: string;
    avg_return: number;
    win_rate: number;
}

interface SeasonalityChartProps {
    data: SeasonalityData[];
    bestDay: string;
    worstDay: string;
    summary: string;
}

export default function SeasonalityChart({ data, bestDay, worstDay, summary }: SeasonalityChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="glass-card p-6 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-2">요일별 수익률 패턴 (Seasonality)</h3>
            <p className="text-sm text-gray-400 mb-6">{summary}</p>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="day"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => {
                                const map: { [key: string]: string } = {
                                    'Monday': '월', 'Tuesday': '화', 'Wednesday': '수',
                                    'Thursday': '목', 'Friday': '금'
                                };
                                return map[val] || val;
                            }}
                        />
                        <YAxis
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `${val.toFixed(2)}%`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '12px' }}
                            itemStyle={{ color: '#E5E7EB' }}
                            formatter={(value: number) => [`${value.toFixed(2)}%`, '평균 수익률']}
                            labelFormatter={(label) => {
                                const map: { [key: string]: string } = {
                                    'Monday': '월요일', 'Tuesday': '화요일', 'Wednesday': '수요일',
                                    'Thursday': '목요일', 'Friday': '금요일'
                                };
                                return map[label as string] || label;
                            }}
                        />
                        <Bar dataKey="avg_return" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.avg_return >= 0 ? '#34D399' : '#F87171'}
                                    opacity={entry.day === bestDay ? 1 : 0.6}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-xs text-gray-400 mb-1">매수 추천 요일</div>
                    <div className="text-lg font-bold text-emerald-400">
                        {bestDay === 'N/A' ? '-' : {
                            'Monday': '월요일', 'Tuesday': '화요일', 'Wednesday': '수요일',
                            'Thursday': '목요일', 'Friday': '금요일'
                        }[bestDay] || bestDay}
                    </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-xs text-gray-400 mb-1">매도 추천 요일</div>
                    <div className="text-lg font-bold text-rose-400">
                        {worstDay === 'N/A' ? '-' : {
                            'Monday': '월요일', 'Tuesday': '화요일', 'Wednesday': '수요일',
                            'Thursday': '목요일', 'Friday': '금요일'
                        }[worstDay] || worstDay}
                    </div>
                </div>
            </div>
        </div>
    );
}

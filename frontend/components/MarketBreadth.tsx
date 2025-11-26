"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function MarketBreadth() {
    // Mock Data for Market Breadth
    const data = [
        { name: 'Advancing (상승)', value: 320, color: '#34D399' },
        { name: 'Declining (하락)', value: 150, color: '#F87171' },
        { name: 'Unchanged (보합)', value: 30, color: '#9CA3AF' },
    ];

    const total = data.reduce((acc, cur) => acc + cur.value, 0);

    return (
        <div className="glass-card p-6 rounded-3xl h-full">
            <h3 className="text-lg font-bold text-gray-300 mb-4">시장 등락 (Market Breadth)</h3>
            <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-3xl font-bold text-white">
                        {((data[0].value / total) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-emerald-400">상승 우위</div>
                </div>
            </div>
        </div>
    );
}

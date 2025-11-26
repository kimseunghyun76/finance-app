"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface FearGreedProps {
    value: number; // 0 to 100
}

export default function FearGreedGauge({ value }: FearGreedProps) {
    const data = [
        { name: 'Extreme Fear', value: 25, color: '#EF4444' },
        { name: 'Fear', value: 25, color: '#F87171' },
        { name: 'Greed', value: 25, color: '#34D399' },
        { name: 'Extreme Greed', value: 25, color: '#10B981' },
    ];

    const cx = "50%";
    const cy = "70%";
    const iR = 50;
    const oR = 80;

    const needle = (value: number, cx: any, cy: any, iR: any, oR: any, color: string) => {
        const total = 100;
        const ang = 180.0 * (1 - value / total);
        const length = (iR + 2 * oR) / 3;
        const sin = Math.sin(-ang * Math.PI / 180);
        const cos = Math.cos(-ang * Math.PI / 180);
        const r = 5;
        const x0 = cx + 5;
        const y0 = cy + 5;
        const xba = x0 + r * sin;
        const yba = y0 - r * cos;
        const xbb = x0 - r * sin;
        const ybb = y0 + r * cos;
        const xp = x0 + length * cos;
        const yp = y0 + length * sin;

        return [
            <circle key="circle" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
            <path key="path" d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`} stroke="none" fill={color} />,
        ];
    };

    let status = "Neutral";
    let color = "#9CA3AF";
    if (value < 25) { status = "Extreme Fear"; color = "#EF4444"; }
    else if (value < 50) { status = "Fear"; color = "#F87171"; }
    else if (value < 75) { status = "Greed"; color = "#34D399"; }
    else { status = "Extreme Greed"; color = "#10B981"; }

    return (
        <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center h-full">
            <h3 className="text-lg font-bold text-gray-300 mb-2">공포 & 탐욕 지수</h3>
            <div className="h-40 w-full relative min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            dataKey="value"
                            startAngle={180}
                            endAngle={0}
                            data={data}
                            cx={cx}
                            cy={cy}
                            innerRadius={iR}
                            outerRadius={oR}
                            fill="#8884d8"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        {needle(value, data[0].value, data[0].value, iR, oR, '#d0d000')}
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="text-3xl font-bold text-white">{value}</div>
                    <div className="text-sm font-bold" style={{ color: color }}>{status}</div>
                </div>
            </div>
        </div>
    );
}

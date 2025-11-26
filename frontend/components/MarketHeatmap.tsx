"use client";
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

const data = [
    {
        name: 'Technology',
        children: [
            { name: 'AAPL', size: 3000, change: 1.2 },
            { name: 'MSFT', size: 2800, change: 0.8 },
            { name: 'NVDA', size: 2000, change: 2.5 },
            { name: 'GOOGL', size: 1800, change: -0.5 },
            { name: 'META', size: 1200, change: 1.5 },
        ],
    },
    {
        name: 'Consumer Cyclical',
        children: [
            { name: 'AMZN', size: 1600, change: 0.2 },
            { name: 'TSLA', size: 800, change: -1.2 },
            { name: 'HD', size: 400, change: 0.5 },
        ],
    },
    {
        name: 'Communication Services',
        children: [
            { name: 'NFLX', size: 300, change: 3.2 },
            { name: 'DIS', size: 200, change: -0.8 },
        ],
    },
    {
        name: 'Financials',
        children: [
            { name: 'JPM', size: 500, change: 0.1 },
            { name: 'V', size: 450, change: 0.3 },
            { name: 'MA', size: 400, change: -0.2 },
        ],
    },
    {
        name: 'Healthcare',
        children: [
            { name: 'LLY', size: 600, change: 1.8 },
            { name: 'JNJ', size: 400, change: -0.1 },
            { name: 'UNH', size: 450, change: -0.5 },
        ],
    },
];

const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name, change } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: change > 0 ? '#10B981' : change < 0 ? '#EF4444' : '#6B7280',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {width > 30 && height > 30 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 7}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={14}
                    fontWeight="bold"
                    style={{ pointerEvents: 'none', textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
                >
                    {name}
                </text>
            ) : null}
            {width > 30 && height > 30 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 24}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                    style={{ pointerEvents: 'none', textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
                >
                    {change > 0 ? '+' : ''}{change}%
                </text>
            ) : null}
        </g>
    );
};

export default function MarketHeatmap() {
    return (
        <div className="h-[500px] w-full glass-card rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">S&P 500 Map</h3>
            <ResponsiveContainer width="100%" height="100%">
                <Treemap
                    data={data}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                    content={<CustomizedContent />}
                >
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-black/80 border border-white/10 p-3 rounded-xl backdrop-blur-md">
                                        <div className="font-bold text-white">{data.name}</div>
                                        <div className={`text-sm ${data.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {data.change > 0 ? '+' : ''}{data.change}%
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
}

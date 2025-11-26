"use client";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ReferenceDot } from 'recharts';

interface CandlestickProps {
    data: any[];
    events?: any[];
}

const CandlestickShape = (props: any) => {
    const { x, y, width, height, low, high, open, close } = props;
    const isGrowing = close > open;
    const color = isGrowing ? '#34D399' : '#F87171';
    const ratio = Math.abs(height / (open - close)); // pixels per unit

    // Calculate y positions
    // Recharts coordinates: y increases downwards
    // We need to map values to pixels manually or rely on props passed by Recharts if we use ErrorBar? 
    // Actually, custom shape receives x, y, width, height based on the value.
    // But for candlestick, we need high/low/open/close.
    // A trick is to use a Bar chart where [min(open, close), max(open, close)] is the bar,
    // and use ErrorBar or another shape for the wick.

    // Better approach for Recharts:
    // Use a ComposedChart.
    // The "Bar" represents the body (Open to Close).
    // But Recharts Bar takes a single value or [min, max].
    // If we pass [min, max], it draws the bar.
    // Then we need lines for the wicks.

    // Let's try a simpler custom shape approach often used with Recharts:
    // We pass the entire data point to the shape.

    // Coordinates calculation is tricky inside custom shape without scale.
    // However, Recharts passes `y` (top of bar) and `height` (height of bar).
    // If we bind the Bar to [min(open, close), max(open, close)], 
    // `y` corresponds to max(open, close) and `height` corresponds to abs(open-close).
    // We still need high and low pixel positions.

    // Alternative: Use a library like `apexcharts` which has native candlestick.
    // But to stick to Recharts as requested:
    // We will use the "Bar with Error Bar" trick or just a custom shape that draws everything relative to the bar.
    // But we don't have the scale for high/low inside the shape easily unless we pass it.

    // Let's use a simplified approach:
    // We will render a Bar for the body.
    // And we will render a separate "Line" or "ErrorBar" for the wicks? No, that's hard to align.

    // Let's use the "Custom Shape" on a Bar that covers the whole range [Low, High]?
    // No, that makes the body wrong.

    // OK, let's try the most robust Recharts way:
    // Data preparation:
    // bodyMin = min(open, close)
    // bodyMax = max(open, close)
    // wickMin = low
    // wickMax = high

    // We can use a Bar for the body.
    // And we can use ErrorBar for the wicks?
    // ErrorBar in Recharts is for confidence intervals.

    // Let's try drawing the whole candle in one custom shape.
    // We need the Y-axis scale.
    // Actually, if we use `Bar` with dataKey="high", the bar goes from 0 to high. That's wrong.
    // If we use `Bar` with dataKey=[low, high], it draws a bar from low to high.
    // Then inside the custom shape, we can draw the body (open/close) and the wick (low/high).
    // Since the bar covers low to high, `y` is at `high` (visually top), and `height` is `high - low`.
    // So we can calculate relative positions of open and close within this range.

    const yHigh = y;
    const yLow = y + height;

    // We need to map open and close to pixels within [yHigh, yLow].
    // The range in value is (high - low).
    // The range in pixels is height.
    // pixelPerUnit = height / (high - low)

    const pixelPerUnit = height / (high - low);

    const yOpen = yHigh + (high - open) * pixelPerUnit;
    const yClose = yHigh + (high - close) * pixelPerUnit;

    const bodyTop = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(1, Math.abs(yOpen - yClose)); // Min 1px

    return (
        <g>
            {/* Wick */}
            <line x1={x + width / 2} y1={yHigh} x2={x + width / 2} y2={yLow} stroke={color} strokeWidth={1} />
            {/* Body */}
            <rect x={x} y={bodyTop} width={width} height={bodyHeight} fill={color} />
        </g>
    );
};

export default function CandlestickChart({ data, events = [] }: CandlestickProps) {
    // Prepare data for the chart
    // We need to pass [low, high] to the Bar so it reserves the space.
    const processedData = data.map(d => ({
        ...d,
        range: [d.low, d.high], // For the bar to cover the full wick range
        // Calculate MA
        // (MA calculation should ideally be done in backend or use a library, doing simple one here is expensive if data is large)
        // Let's assume backend or we do it efficiently. For 100 points it's fine.
    }));

    // Calculate MAs
    const calculateMA = (period: number) => {
        return processedData.map((d, i) => {
            if (i < period - 1) return { ...d, [`ma${period}`]: null };
            const slice = processedData.slice(i - period + 1, i + 1);
            const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
            return { ...d, [`ma${period}`]: sum / period };
        });
    };

    let chartData = calculateMA(20);
    // Need to recalculate for MA60 based on the result of MA20? No, just map again or merge.
    // Better:
    for (let i = 0; i < chartData.length; i++) {
        // MA20
        if (i >= 19) {
            const sum = chartData.slice(i - 19, i + 1).reduce((acc: any, curr: any) => acc + curr.close, 0);
            chartData[i].ma20 = sum / 20;
        }
        // MA60
        if (i >= 59) {
            const sum = chartData.slice(i - 59, i + 1).reduce((acc: any, curr: any) => acc + curr.close, 0);
            chartData[i].ma60 = sum / 60;
        }
    }

    return (
        <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#666"
                        tickFormatter={(str) => new Date(str).toLocaleDateString()}
                        minTickGap={50}
                    />
                    <YAxis
                        yAxisId="price"
                        stroke="#666"
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => `$${val}`}
                    />
                    <YAxis
                        yAxisId="volume"
                        orientation="right"
                        stroke="#666"
                        tickFormatter={(val) => `${(val / 1e6).toFixed(0)}M`}
                        opacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#999' }}
                    />

                    {/* Volume */}
                    <Bar yAxisId="volume" dataKey="volume" fill="#3b82f6" opacity={0.15} barSize={20} />

                    {/* Candlestick - using Bar with custom shape */}
                    {/* We bind it to 'range' which is [low, high] */}
                    <Bar
                        yAxisId="price"
                        dataKey="range"
                        shape={<CandlestickShape />}
                        barSize={10}
                    >
                        {
                            chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.close > entry.open ? '#34D399' : '#F87171'} />
                            ))
                        }
                    </Bar>

                    {/* Moving Averages */}
                    {/* Use Line for MAs */}
                    {/* We need to make sure Line uses the same 'price' axis */}
                    {/* Note: Line expects a single value key */}
                    {/* We added ma20 and ma60 to data */}

                    {/* Recharts Line doesn't like nulls sometimes, but usually skips them */}
                    <Line type="monotone" dataKey="ma20" stroke="#FBBF24" strokeWidth={1} dot={false} yAxisId="price" />
                    <Line type="monotone" dataKey="ma60" stroke="#60A5FA" strokeWidth={1} dot={false} yAxisId="price" />

                    {/* Event Markers */}
                    {events.map((event, idx) => {
                        // Find closest data point price for y-position
                        const closestPoint = chartData.find(d => d.date.startsWith(event.date.split('T')[0]));
                        const yPos = closestPoint ? closestPoint.high * 1.02 : 0; // Slightly above high

                        if (!closestPoint) return null;

                        return (
                            <ReferenceDot
                                key={idx}
                                yAxisId="price"
                                x={closestPoint.date}
                                y={yPos}
                                r={6}
                                fill="#3B82F6"
                                stroke="#fff"
                            >
                                {/* We can't easily put custom tooltip on ReferenceDot in Recharts directly without custom shape or label */}
                                {/* But we can use Label */}
                            </ReferenceDot>
                        );
                    })}

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

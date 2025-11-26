"use client";
import ClientWatchlistWrapper from './ClientWatchlistWrapper';
import MarketSummary from './MarketSummary';

export default function Sidebar() {
    return (
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            <ClientWatchlistWrapper />
            <MarketSummary />
        </div>
    );
}

"use client";
import { useRouter } from 'next/navigation';
import Watchlist from './Watchlist';

export default function ClientWatchlistWrapper() {
    const router = useRouter();

    const handleSelect = (ticker: string) => {
        router.push(`/?ticker=${ticker}`);
    };

    return <Watchlist onSelect={handleSelect} />;
}

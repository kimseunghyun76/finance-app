import StockDetail from '@/components/StockDetail';
import Dashboard from '@/components/Dashboard';
import NewsTicker from '@/components/NewsTicker';

export default async function Home({ searchParams }: { searchParams: Promise<{ ticker?: string }> }) {
  const { ticker } = await searchParams;

  return (
    <>
      <NewsTicker />
      {ticker ? (
        <StockDetail ticker={ticker} />
      ) : (
        <Dashboard />
      )}
    </>
  );
}

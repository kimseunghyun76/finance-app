from app.services.data_fetcher import MarketDataFetcher
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

def test_fetcher():
    fetcher = MarketDataFetcher()
    
    print("Testing Ticker Data (AAPL)...")
    df = fetcher.get_ticker_data("AAPL", period="1mo")
    print(f"Rows: {len(df)}")
    print(df.head(2))
    
    print("\nTesting Current Price (AAPL)...")
    price = fetcher.get_current_price("AAPL")
    print(f"Price: {price}")
    
    print("\nTesting Market Summary...")
    summary = fetcher.get_market_summary()
    print(summary)
    
    print("\nTesting News (AAPL)...")
    news = fetcher.get_news("AAPL")
    print(f"News items: {len(news)}")
    if news:
        print(f"First news item keys: {news[0].keys()}")
        print(news[0])

if __name__ == "__main__":
    test_fetcher()

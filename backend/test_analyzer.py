from app.services.data_fetcher import MarketDataFetcher
from app.services.analyzer import ConsultantAgent
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

def test_analyzer():
    fetcher = MarketDataFetcher()
    agent = ConsultantAgent()
    
    ticker = "AAPL"
    print(f"Fetching data for {ticker}...")
    history = fetcher.get_ticker_data(ticker, period="2y")
    info = fetcher.get_company_info(ticker)
    news = fetcher.get_news(ticker)
    
    print("Analyzing...")
    advice = agent.get_advice(ticker, history, info, news)
    
    print("\n=== Consultant Advice ===")
    print(f"Action: {advice['action']}")
    print(f"Score: {advice['score']}")
    print("Reasons:")
    for reason in advice['reasons']:
        print(f"- {reason}")
        
    print("\nDetailed Analysis:")
    print(f"RSI: {advice['analysis']['technical']['rsi']:.2f}")
    print(f"Trend: {advice['analysis']['technical']['trend']}")
    print(f"Valuation: {advice['analysis']['fundamental']['valuation']}")
    print(f"Sentiment: {advice['analysis']['sentiment']['sentiment_label']}")

if __name__ == "__main__":
    test_analyzer()

from fastapi import APIRouter, HTTPException
from app.services.data_fetcher import MarketDataFetcher
from app.services.analyzer import ConsultantAgent

router = APIRouter(prefix="/api/market", tags=["market"])

fetcher = MarketDataFetcher()
agent = ConsultantAgent()

@router.get("/summary")
def get_market_summary():
    try:
        summary = fetcher.get_market_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news")
def get_market_news():
    try:
        news = fetcher.get_market_news()
        return news
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/movers")
def get_market_movers():
    try:
        # Re-implement logic from main.py
        import random
        from app.data.stocks import STOCK_DICT
        
        candidates = random.sample(STOCK_DICT, k=min(len(STOCK_DICT), 15))
        
        movers = []
        for stock in candidates:
            ticker = stock['ticker']
            try:
                hist = fetcher.get_ticker_data(ticker, period="5d")
                if not hist.empty and len(hist) >= 2:
                    prev_close = hist['Close'].iloc[-2]
                    curr_close = hist['Close'].iloc[-1]
                    change_p = ((curr_close - prev_close) / prev_close) * 100
                    
                    movers.append({
                        "ticker": ticker,
                        "name": stock['name_kr'],
                        "price": curr_close,
                        "change": change_p
                    })
            except:
                continue
        
        movers.sort(key=lambda x: x['change'], reverse=True)
        
        return {
            "gainers": movers[:5],
            "losers": movers[-5:][::-1]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/regime")
def get_market_regime():
    try:
        market_data = fetcher.get_market_summary()
        regime = agent.analyze_market_regime(market_data)
        return regime
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException
from app.services.data_fetcher import MarketDataFetcher
from app.services.analyzer import ConsultantAgent
from app.data.stocks import STOCK_DICT
from pydantic import BaseModel
import random

router = APIRouter(tags=["stock"])

fetcher = MarketDataFetcher()
agent = ConsultantAgent()
db = fetcher.db

@router.get("/api/stock/{ticker}")
def get_stock_details(ticker: str, period: str = "1y"):
    try:
        price = fetcher.get_current_price(ticker)
        company_data = fetcher.get_translated_company_info(ticker)
        details = company_data['details']
        
        history = fetcher.get_ticker_data(ticker, period=period)
        
        history_data = []
        if not history.empty:
            history = history.reset_index()
            for _, row in history.iterrows():
                history_data.append({
                    "date": row['Date'].isoformat(),
                    "open": row['Open'],
                    "high": row['High'],
                    "low": row['Low'],
                    "close": row['Close'],
                    "volume": row['Volume']
                })
        
        long_history = fetcher.get_ticker_data(ticker, period="5y")
        seasonality = agent.analyze_seasonality(long_history)

        return {
            "ticker": ticker,
            "price": price,
            "company_name": details.get('name', ticker),
            "sector": details.get('sector', 'Unknown'),
            "summary": company_data['summary_kr'],
            "details": details,
            "history": history_data,
            "seasonality": seasonality
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/search")
def search_stocks(query: str):
    query = query.lower()
    results = []
    for stock in STOCK_DICT:
        if (query in stock['ticker'].lower() or 
            query in stock['name_en'].lower() or 
            query in stock['name_kr']):
            results.append(stock)
    return results[:10]

@router.get("/api/consult/{ticker}")
def consult_stock(ticker: str):
    try:
        history = fetcher.get_ticker_data(ticker, period="2y")
        info = fetcher.get_company_info(ticker)
        news = fetcher.get_news(ticker)
        advice = agent.get_advice(ticker, history, info, news)
        return advice
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    ticker: str
    message: str

@router.post("/api/chat/guide")
def chat_guide(request: ChatRequest):
    try:
        msg = request.message.lower()
        ticker = request.ticker
        
        if "안녕" in msg:
             return {"response": "안녕하세요! 투자에 대해 무엇이 궁금하신가요?"}

        if "개요" in msg or "소개" in msg or "뭐하는" in msg:
            data = fetcher.get_translated_company_info(ticker)
            return {"response": f"**{ticker} 기업 개요**\n\n{data['summary_kr']}"}
        
        if "가격" in msg or "얼마" in msg:
            price = fetcher.get_current_price(ticker)
            return {"response": f"현재 {ticker}의 가격은 **${price:.2f}** 입니다."}
            
        if "투자" in msg or "살까" in msg or "팔까" in msg or "전망" in msg or "가이드" in msg:
            history = fetcher.get_ticker_data(ticker, period="1y")
            info = fetcher.get_company_info(ticker)
            news = fetcher.get_news(ticker)
            advice = agent.get_advice(ticker, history, info, news)
            
            reasons = "\n".join([f"- {r}" for r in advice['reasons']])
            return {"response": f"**투자 분석 결과: {advice['action']}**\n\n이유:\n{reasons}\n\n종합 점수: {advice['score']}"}

        return {"response": "죄송합니다. 기업 개요, 가격, 또는 투자 전망에 대해 물어봐주세요."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/watchlist")
def get_watchlist():
    try:
        watchlist_items = db.get_watchlist()
        results = []
        for item in watchlist_items:
            ticker = item['ticker']
            name = item['name']
            price = fetcher.get_current_price(ticker)
            results.append({
                "ticker": ticker,
                "name": name,
                "price": price
            })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/watchlist/{ticker}")
def add_watchlist(ticker: str):
    try:
        db.add_to_watchlist(ticker)
        return {"status": "success", "message": f"{ticker} added to watchlist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/watchlist/{ticker}")
def remove_watchlist(ticker: str):
    try:
        db.remove_from_watchlist(ticker)
        return {"status": "success", "message": f"{ticker} removed from watchlist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/stock/{ticker}/competitors")
def get_competitors(ticker: str):
    try:
        competitors = fetcher.get_competitors(ticker)
        return competitors
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/stock/{ticker}/news")
def get_stock_news(ticker: str):
    try:
        news = fetcher.get_news(ticker)
        return news
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/stock/{ticker}/events")
def get_stock_events(ticker: str):
    try:
        events = fetcher.get_stock_events(ticker)
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/recommendations")
def get_recommendations():
    try:
        candidates = random.sample(STOCK_DICT, k=min(len(STOCK_DICT), 8))
        analyzed_results = []
        for stock in candidates:
            ticker = stock['ticker']
            try:
                history = fetcher.get_ticker_data(ticker, period="6mo")
                info = fetcher.get_company_info(ticker)
                news = fetcher.get_news(ticker)
                advice = agent.get_advice(ticker, history, info, news)
                
                if advice['score'] > 0:
                    analyzed_results.append({
                        "ticker": ticker,
                        "name": stock['name_kr'],
                        "action": advice['action'],
                        "score": advice['score'],
                        "reasons": advice['reasons'],
                        "price": fetcher.get_current_price(ticker)
                    })
            except Exception as e:
                print(f"Error analyzing {ticker}: {e}")
                continue
        
        analyzed_results.sort(key=lambda x: x['score'], reverse=True)
        return analyzed_results[:3]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analyze/volatility/{ticker}")
def analyze_volatility(ticker: str):
    try:
        history = fetcher.get_ticker_data(ticker, period="5d")
        news = fetcher.get_news(ticker)
        analysis = agent.analyze_volatility(ticker, history, news)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

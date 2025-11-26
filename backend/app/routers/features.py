from fastapi import APIRouter, HTTPException
from app.services.data_fetcher import MarketDataFetcher
from app.services.fund_manager import AIFundManager
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["features"])

fetcher = MarketDataFetcher()
fund_manager = AIFundManager()
db = fetcher.db

@router.get("/battle")
def get_battle_status():
    try:
        status = fund_manager.get_battle_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendar/smart")
def get_smart_calendar():
    try:
        watchlist = db.get_watchlist()
        tickers = [item['ticker'] for item in watchlist]
        calendar = fetcher.get_smart_calendar(tickers)
        return calendar
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TimeMachineRequest(BaseModel):
    ticker: str
    amount: float
    date: str

@router.post("/time-machine")
def calculate_time_machine(request: TimeMachineRequest):
    try:
        past_price = fetcher.get_historical_price(request.ticker, request.date)
        if past_price == 0:
             raise HTTPException(status_code=404, detail="Historical price not found")

        current_price = fetcher.get_current_price(request.ticker)
        
        shares = request.amount / past_price
        current_value = shares * current_price
        profit = current_value - request.amount
        roi = (profit / request.amount) * 100
        
        return {
            "ticker": request.ticker,
            "past_date": request.date,
            "past_price": past_price,
            "current_price": current_price,
            "shares": shares,
            "initial_investment": request.amount,
            "current_value": current_value,
            "profit": profit,
            "roi": roi
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

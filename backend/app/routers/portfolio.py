from fastapi import APIRouter, HTTPException
from app.services.data_fetcher import MarketDataFetcher
from app.services.analyzer import ConsultantAgent
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

fetcher = MarketDataFetcher()
agent = ConsultantAgent()
db = fetcher.db

class PortfolioItem(BaseModel):
    ticker: str
    shares: int
    avg_price: float
    purchase_date: Optional[str] = None

@router.get("")
def get_portfolio():
    try:
        holdings = db.get_holdings()
        result = []
        
        for item in holdings:
            ticker = item['ticker']
            shares = item['shares']
            avg_price = item['avg_price']
            
            current_price = fetcher.get_current_price(ticker)
            
            current_value = shares * current_price
            cost_basis = shares * avg_price
            pl = current_value - cost_basis
            pl_percent = (pl / cost_basis * 100) if cost_basis > 0 else 0
            
            name = item['name']
            purchase_date = item['purchase_date']
            
            result.append({
                "ticker": ticker,
                "name": name,
                "shares": shares,
                "avg_price": avg_price,
                "purchase_date": purchase_date,
                "current_price": current_price,
                "current_value": current_value,
                "pl": pl,
                "pl_percent": pl_percent
            })
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
def add_portfolio_item(item: PortfolioItem):
    try:
        db.add_holding(item.ticker, item.shares, item.avg_price, item.purchase_date)
        return {"status": "success", "message": f"{item.ticker} added to portfolio"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ticker}")
def remove_portfolio_item(ticker: str):
    try:
        db.remove_holding(ticker)
        return {"status": "success", "message": f"{ticker} removed from portfolio"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze")
def analyze_portfolio():
    try:
        holdings = db.get_holdings()
        enriched_holdings = []
        for item in holdings:
            ticker = item['ticker']
            shares = item['shares']
            avg_price = item['avg_price']
            current_price = fetcher.get_current_price(ticker)
            
            current_value = shares * current_price
            cost_basis = shares * avg_price
            pl = current_value - cost_basis
            
            enriched_holdings.append({
                "ticker": ticker,
                "shares": shares,
                "avg_price": avg_price,
                "current_price": current_price,
                "current_value": current_value,
                "pl": pl
            })
            
        analysis = agent.analyze_portfolio(enriched_holdings)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/correlation")
def get_portfolio_correlation():
    try:
        holdings = db.get_holdings()
        macro_data = fetcher.get_economic_data()
        correlation = agent.calculate_correlation(holdings, macro_data)
        return correlation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

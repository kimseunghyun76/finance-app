import random
from typing import List, Dict, Any
from app.services.data_fetcher import MarketDataFetcher
from app.data.stocks import STOCK_DICT

class AIFundManager:
    def __init__(self):
        self.fetcher = MarketDataFetcher()

    def get_battle_status(self) -> List[Dict[str, Any]]:
        """
        Generates portfolios for 3 AI personas and calculates their performance.
        """
        # 1. Define Personas
        personas = [
            {
                "id": "warren",
                "name": "워렌 (Warren)",
                "style": "가치 투자 (Value)",
                "desc": "저평가된 우량주와 배당주를 선호합니다.",
                "avatar": "🐢",
                "color": "text-emerald-400"
            },
            {
                "id": "elon",
                "name": "일론 (Elon)",
                "style": "성장 투자 (Growth)",
                "desc": "높은 변동성과 미래 기술(Tech)에 베팅합니다.",
                "avatar": "🚀",
                "color": "text-blue-400"
            },
            {
                "id": "quant",
                "name": "퀀트 (Quant)",
                "style": "모멘텀 (Momentum)",
                "desc": "최근 추세가 강력한 종목을 기계적으로 매수합니다.",
                "avatar": "🤖",
                "color": "text-purple-400"
            }
        ]

        results = []

        # 2. Select Stocks & Calculate Return for each Persona
        for persona in personas:
            picks = self._select_stocks(persona['id'])
            
            total_return = 0
            portfolio_items = []
            
            for stock in picks:
                ticker = stock['ticker']
                try:
                    # Fetch 1mo history to calculate return
                    hist = self.fetcher.get_ticker_data(ticker, period="1mo")
                    if not hist.empty:
                        start_price = hist['Close'].iloc[0]
                        end_price = hist['Close'].iloc[-1]
                        ret = ((end_price - start_price) / start_price) * 100
                        
                        total_return += ret
                        portfolio_items.append({
                            "ticker": ticker,
                            "name": stock['name_kr'],
                            "return": ret,
                            "price": end_price
                        })
                except Exception as e:
                    print(f"Error processing {ticker} for {persona['id']}: {e}")
            
            avg_return = total_return / len(portfolio_items) if portfolio_items else 0
            
            results.append({
                **persona,
                "return": avg_return,
                "portfolio": portfolio_items
            })

        # 3. Sort by Return (Ranking)
        results.sort(key=lambda x: x['return'], reverse=True)
        
        # Assign Ranks
        for i, res in enumerate(results):
            res['rank'] = i + 1

        return results

    def _select_stocks(self, persona_id: str) -> List[Dict[str, Any]]:
        """
        Selects 3 stocks based on persona logic.
        Note: In a real app, this would use full fundamental/technical data.
        Here we use sector/mock logic for demonstration.
        """
        candidates = []
        
        if persona_id == "warren":
            # Value: Finance, Consumer, Healthcare (Stable)
            # Mock logic: Pick from specific sectors
            candidates = [s for s in STOCK_DICT if s.get('sector') in ['Financial Services', 'Consumer Defensive', 'Healthcare', 'Energy']]
            
        elif persona_id == "elon":
            # Growth: Technology, Communication (High Risk)
            candidates = [s for s in STOCK_DICT if s.get('sector') in ['Technology', 'Communication Services', 'Consumer Cyclical']]
            
        elif persona_id == "quant":
            # Momentum: Random selection but we simulate "Trend"
            # In reality, we would calculate RSI/MACD here.
            # For demo speed, we just pick random stocks and let the return calculation decide the winner.
            candidates = STOCK_DICT

        # Shuffle and pick 3
        if not candidates:
            candidates = STOCK_DICT
            
        return random.sample(candidates, k=min(len(candidates), 3))

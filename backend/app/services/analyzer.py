import pandas as pd
import numpy as np
from textblob import TextBlob
from typing import Dict, Any, List

class TechnicalAnalyzer:
    def analyze(self, history: pd.DataFrame) -> Dict[str, Any]:
        if history.empty:
            return {}
        
        # Calculate RSI
        delta = history['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        # Calculate MACD
        exp1 = history['Close'].ewm(span=12, adjust=False).mean()
        exp2 = history['Close'].ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        
        # Calculate SMA/EMA
        sma_50 = history['Close'].rolling(window=50).mean()
        sma_200 = history['Close'].rolling(window=200).mean()
        
        current_rsi = rsi.iloc[-1]
        current_macd = macd.iloc[-1]
        current_signal = signal.iloc[-1]
        current_price = history['Close'].iloc[-1]
        
        trend = "중립 (Neutral)"
        if current_price > sma_50.iloc[-1] and sma_50.iloc[-1] > sma_200.iloc[-1]:
            trend = "상승세 (Bullish)"
        elif current_price < sma_50.iloc[-1] and sma_50.iloc[-1] < sma_200.iloc[-1]:
            trend = "하락세 (Bearish)"
            
        return {
            "rsi": current_rsi,
            "macd": current_macd,
            "macd_signal": current_signal,
            "trend": trend,
            "sma_50": sma_50.iloc[-1],
            "sma_200": sma_200.iloc[-1]
        }

class FundamentalAnalyzer:
    def analyze(self, info: Dict[str, Any]) -> Dict[str, Any]:
        if not info:
            return {}
            
        pe_ratio = info.get('trailingPE')
        forward_pe = info.get('forwardPE')
        peg_ratio = info.get('pegRatio')
        price_to_book = info.get('priceToBook')
        beta = info.get('beta')
        
        valuation = "적정 주가 (Fair)"
        if pe_ratio and pe_ratio < 15:
            valuation = "저평가 (Undervalued)"
        elif pe_ratio and pe_ratio > 30:
            valuation = "고평가 (Overvalued)"
            
        return {
            "pe_ratio": pe_ratio,
            "forward_pe": forward_pe,
            "peg_ratio": peg_ratio,
            "price_to_book": price_to_book,
            "beta": beta,
            "valuation": valuation
        }

class SentimentAnalyzer:
    def analyze(self, news: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not news:
            return {"sentiment_score": 0, "sentiment_label": "중립 (Neutral)"}
            
        total_polarity = 0
        count = 0
        
        for item in news:
            title = item.get('title', '')
            summary = item.get('summary', '')
            text = f"{title} {summary}"
            blob = TextBlob(text)
            total_polarity += blob.sentiment.polarity
            count += 1
            
        avg_polarity = total_polarity / count if count > 0 else 0
        
        label = "중립 (Neutral)"
        if avg_polarity > 0.1:
            label = "긍정적 (Positive)"
        elif avg_polarity < -0.1:
            label = "부정적 (Negative)"
            
        return {
            "sentiment_score": avg_polarity,
            "sentiment_label": label,
            "news_count": count
        }

class ConsultantAgent:
    def __init__(self):
        self.tech_analyzer = TechnicalAnalyzer()
        self.fund_analyzer = FundamentalAnalyzer()
        self.sent_analyzer = SentimentAnalyzer()
        
    def get_advice(self, ticker: str, history: pd.DataFrame, info: Dict[str, Any], news: List[Dict[str, Any]]) -> Dict[str, Any]:
        tech_result = self.tech_analyzer.analyze(history)
        fund_result = self.fund_analyzer.analyze(info)
        sent_result = self.sent_analyzer.analyze(news)
        
        # Simple Logic for Recommendation
        score = 0
        reasons = []
        
        # Technical
        if "Bullish" in tech_result.get('trend', ''):
            score += 2
            reasons.append("기술적 분석상 상승 추세입니다.")
        elif "Bearish" in tech_result.get('trend', ''):
            score -= 2
            reasons.append("기술적 분석상 하락 추세입니다.")
            
        rsi = tech_result.get('rsi', 50)
        if rsi < 30:
            score += 1
            reasons.append("RSI 지표가 과매도 구간입니다. 반등 가능성이 있습니다.")
        elif rsi > 70:
            score -= 1
            reasons.append("RSI 지표가 과매수 구간입니다. 조정 가능성이 있습니다.")
            
        # Fundamental
        valuation = fund_result.get('valuation', '')
        if "Undervalued" in valuation:
            score += 2
            reasons.append("펀더멘털 분석상 저평가 상태입니다.")
        elif "Overvalued" in valuation:
            score -= 1
            reasons.append("펀더멘털 분석상 고평가 상태일 수 있습니다.")
            
        # Sentiment
        sent_label = sent_result.get('sentiment_label', '')
        if "Positive" in sent_label:
            score += 1
            reasons.append("최근 뉴스 감성이 긍정적입니다.")
        elif "Negative" in sent_label:
            score -= 1
            reasons.append("최근 뉴스 감성이 부정적입니다.")
            
        # Final Decision
        action = "관망 (HOLD)"
        if score >= 3:
            action = "매수 (BUY)"
        elif score <= -2:
            action = "매도 (SELL)"
            
        return {
            "ticker": ticker,
            "action": action,
            "score": score,
            "reasons": reasons,
            "analysis": {
                "technical": tech_result,
                "fundamental": fund_result,
                "sentiment": sent_result
            }
        }

    def analyze_portfolio(self, holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not holdings:
            return {
                "score": 0,
                "summary": "포트폴리오가 비어있습니다.",
                "advice": ["종목을 추가하여 포트폴리오를 구성해보세요."],
                "risk_level": "N/A"
            }
            
        total_value = sum(h['current_value'] for h in holdings)
        total_pl = sum(h['pl'] for h in holdings)
        pl_percent = (total_pl / (total_value - total_pl) * 100) if (total_value - total_pl) > 0 else 0
        
        # Diversity Check
        sectors = set()
        # Ideally we would check sectors for each holding, but we might not have that info readily available in the simple dict
        # We can infer diversity from count for now
        count = len(holdings)
        
        score = 50 # Base score
        advice = []
        
        # Performance Score
        if pl_percent > 10:
            score += 20
            advice.append("전체 수익률이 매우 훌륭합니다! (10% 이상)")
        elif pl_percent > 0:
            score += 10
            advice.append("전체 수익률이 긍정적입니다.")
        elif pl_percent < -10:
            score -= 20
            advice.append("전체 수익률이 저조합니다. 손절매를 고려하거나 물타기 전략을 점검하세요.")
        else:
            advice.append("수익률이 보합세입니다.")
            
        # Diversity Score
        if count < 3:
            score -= 10
            advice.append("보유 종목이 너무 적습니다. 리스크 분산을 위해 3개 이상의 종목을 보유하는 것을 추천합니다.")
        elif count > 10:
            score -= 5
            advice.append("보유 종목이 너무 많아 관리가 어려울 수 있습니다. 핵심 종목 위주로 정리를 고려하세요.")
        else:
            score += 10
            advice.append("적절한 수의 종목을 보유하고 있습니다.")
            
        # Risk Assessment (Simple)
        risk_level = "보통 (Moderate)"
        if count < 3:
            risk_level = "높음 (High) - 집중 투자"
        elif pl_percent < -20:
             risk_level = "매우 높음 (Very High) - 손실 확대"
             
        return {
            "score": min(100, max(0, score)),
            "summary": f"총 자산 가치 ${total_value:,.2f}, 수익률 {pl_percent:.2f}%",
            "advice": advice,
            "risk_level": risk_level
        }

    def analyze_volatility(self, ticker: str, history: pd.DataFrame, news: List[Dict[str, Any]]) -> Dict[str, Any]:
        if history.empty:
            return {"cause": "데이터 부족", "explanation": "주가 데이터가 충분하지 않습니다."}
            
        # 1. Detect significant move
        current_close = history['Close'].iloc[-1]
        prev_close = history['Close'].iloc[-2]
        change_percent = ((current_close - prev_close) / prev_close) * 100
        
        move_type = "보합"
        if change_percent > 3:
            move_type = "급등"
        elif change_percent < -3:
            move_type = "급락"
        elif change_percent > 1:
            move_type = "상승"
        elif change_percent < -1:
            move_type = "하락"
            
        # 2. Correlate with news
        # Simple keyword matching for now. In a real system, we'd use LLM or embedding similarity.
        explanation = "특이 사항 없음"
        related_news = []
        
        keywords = {
            "earnings": ["실적", "매출", "이익", "earnings", "revenue", "profit"],
            "macro": ["금리", "인플레이션", "CPI", "FOMC", "fed", "inflation", "rate"],
            "product": ["출시", "공개", "launch", "release", "unveil"],
            "merger": ["인수", "합병", "M&A", "acquisition", "merger"],
            "contract": ["계약", "수주", "contract", "deal"]
        }
        
        detected_factors = []
        
        for item in news:
            title = item.get('title', '').lower()
            summary = item.get('summary', '').lower()
            text = f"{title} {summary}"
            
            for category, words in keywords.items():
                if any(w in text for w in words):
                    detected_factors.append(category)
                    related_news.append(item)
                    break
                    
        if detected_factors:
            factor_counts = {f: detected_factors.count(f) for f in set(detected_factors)}
            primary_factor = max(factor_counts, key=factor_counts.get)
            
            factor_map = {
                "earnings": "실적 발표 또는 재무 성과",
                "macro": "거시 경제 지표 또는 금리 정책",
                "product": "신제품 출시 또는 기술 공개",
                "merger": "인수 합병(M&A) 이슈",
                "contract": "대규모 계약 또는 수주"
            }
            
            explanation = f"최근 {factor_map.get(primary_factor, '뉴스')} 관련 소식이 주가 변동의 주요 원인으로 추정됩니다."
        else:
            if abs(change_percent) > 3:
                explanation = "뚜렷한 뉴스 없이 수급에 의한 변동이거나, 시장 전체의 영향일 수 있습니다."
            else:
                explanation = "일반적인 시장 변동성 범위 내의 움직임입니다."

        return {
            "ticker": ticker,
            "change_percent": change_percent,
            "move_type": move_type,
            "cause": explanation,
            "cause": explanation,
            "related_news": related_news[:2] # Top 2 related news
        }

    def calculate_correlation(self, holdings: List[Dict[str, Any]], macro_data: Dict[str, float]) -> Dict[str, Any]:
        """
        Calculates correlation between portfolio holdings and macro indicators.
        Note: In a real app, we need historical data for all assets to calculate correlation.
        Here we will simulate it or use a simplified approach if history is not available.
        For this demo, we'll return mock correlations based on sector logic to show the UI.
        """
        matrix = []
        
        # Assets: Holdings + Macro
        assets = [h['ticker'] for h in holdings]
        macros = ["USD/KRW", "Gold", "WTI Crude Oil"]
        all_assets = assets + macros
        
        # Mock Correlation Logic based on Sector/Asset Class
        # Tech -> High correlation with Nasdaq (not here), Inverse with Yield/Rates
        # Energy -> High with Oil
        # Gold -> Inverse with Dollar
        
        for row_asset in all_assets:
            row_data = {"asset": row_asset}
            for col_asset in all_assets:
                if row_asset == col_asset:
                    corr = 1.0
                else:
                    # Generate deterministic mock correlation
                    # Hash strings to get a consistent number between -1 and 1
                    seed = hash(row_asset + col_asset)
                    # Normalize to -0.8 to 0.8 range for realism
                    corr = (seed % 160 - 80) / 100.0
                    
                    # Apply some logic overrides
                    if "KRW" in row_asset and "KRW" in col_asset: corr = 1.0
                    if "Gold" in row_asset and "KRW" in col_asset: corr = 0.3 # Gold/Dollar inverse usually, but KRW...
                    
                row_data[col_asset] = round(corr, 2)
            matrix.append(row_data)
            
        return {
            "assets": all_assets,
            "matrix": matrix
        }

    def analyze_seasonality(self, history: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyzes average return and win rate by day of the week.
        """
        if history.empty:
            return {}
            
        # Ensure index is datetime
        df = history.copy()
        df.index = pd.to_datetime(df.index)
        
        # Calculate daily returns
        df['Return'] = df['Close'].pct_change() * 100
        df['DayOfWeek'] = df.index.day_name()
        df['DayIndex'] = df.index.dayofweek # 0=Mon, 6=Sun
        
        # Group by day
        stats = df.groupby('DayOfWeek')['Return'].agg(['mean', 'count', lambda x: (x > 0).mean() * 100])
        stats.columns = ['avg_return', 'count', 'win_rate']
        
        # Sort by day index (Mon-Fri)
        days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        stats = stats.reindex(days_order)
        
        results = []
        for day in days_order:
            if day in stats.index:
                row = stats.loc[day]
                results.append({
                    "day": day,
                    "avg_return": float(row['avg_return']) if not pd.isna(row['avg_return']) else 0.0,
                    "win_rate": float(row['win_rate']) if not pd.isna(row['win_rate']) else 0.0
                })
                
        # Find best buy/sell days
        if not stats.empty:
            best_day = stats['avg_return'].idxmax()
            worst_day = stats['avg_return'].idxmin()
        else:
            best_day = "N/A"
            worst_day = "N/A"
            
        return {
            "seasonality": results,
            "best_day": best_day,
            "worst_day": worst_day,
            "summary": f"역사적으로 {best_day}에 매수하는 것이 가장 유리했습니다."
        }

    def analyze_market_regime(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes market regime based on USD/KRW and Market Trend.
        """
        usd_krw = market_data.get('USD/KRW', {}).get('price', 1300)
        kospi_change = market_data.get('KOSPI', {}).get('change_percent', 0)
        
        regime = "중립 (Neutral)"
        advice = "시장 상황을 주시하며 분산 투자를 유지하세요."
        
        # Simple Regime Logic
        if usd_krw > 1400:
            regime = "고환율 주의 (High Exchange Rate)"
            advice = "환율이 매우 높습니다. 외국인 수급이 불안정할 수 있으니 수출주 위주의 접근이 유리합니다."
        elif usd_krw < 1200:
            regime = "저환율 (Low Exchange Rate)"
            advice = "환율이 안정적입니다. 내수주 및 금융주에 긍정적인 환경일 수 있습니다."
            
        if kospi_change < -1.5:
            regime += " / 급락장 (Bear Market)"
            advice += " 시장 변동성이 큽니다. 현금 비중을 늘리고 저점 매수 기회를 엿보세요."
        elif kospi_change > 1.5:
            regime += " / 급등장 (Bull Market)"
            advice += " 상승세가 강합니다. 추세 추종 전략이 유효할 수 있습니다."
            
        return {
            "regime": regime,
            "advice": advice,
            "indicators": {
                "usd_krw": usd_krw,
                "kospi_change": kospi_change
            }
        }

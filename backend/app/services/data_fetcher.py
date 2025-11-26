import yfinance as yf
import pandas as pd
from typing import Dict, Any, Optional
from deep_translator import GoogleTranslator
from app.services.db_service import DBService
from app.data.stocks import STOCK_DICT
from textblob import TextBlob
import requests
from datetime import datetime, timedelta
import calendar

class MarketDataFetcher:
    def __init__(self):
        self.db = DBService()
        self.cache = {} # Simple in-memory cache
        self.cache_ttl = 300 # 300 seconds (5 minutes)

    def _get_cached_data(self, key: str, fetch_func, ttl: int = None):
        """
        Helper to get data from cache or fetch it.
        """
        import time
        current_time = time.time()
        ttl = ttl or self.cache_ttl
        
        if key in self.cache:
            data, timestamp = self.cache[key]
            if current_time - timestamp < ttl:
                return data
        
        # Fetch fresh data
        data = fetch_func()
        if data:
            self.cache[key] = (data, current_time)
        return data

    def get_ticker_data(self, ticker: str, period: str = "1y") -> pd.DataFrame:
        """
        Fetches historical data for a given ticker.
        """
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period=period)
            return hist
        except Exception as e:
            print(f"Error fetching data for {ticker}: {e}")
            return pd.DataFrame()

    def get_current_price(self, ticker: str) -> float:
        """
        Gets the current price (or last close).
        """
        try:
            stock = yf.Ticker(ticker)
            # fast_info is often faster/more reliable for current price
            return stock.fast_info.last_price
        except Exception as e:
            # Fallback for indices like ^IXIC which sometimes fail on fast_info
            try:
                hist = stock.history(period="1d")
                if not hist.empty:
                    return hist['Close'].iloc[-1]
            except Exception:
                pass
            print(f"Error fetching price for {ticker}: {e}")
            return 0.0

    def get_historical_price(self, ticker: str, date: str) -> float:
        """
        Gets the closing price on a specific date (or nearest previous trading day).
        Date format: YYYY-MM-DD
        """
        try:
            stock = yf.Ticker(ticker)
            # Fetch data for a small window around the date to ensure we find a trading day
            target_date = datetime.strptime(date, "%Y-%m-%d")
            start_date = target_date - timedelta(days=5)
            end_date = target_date + timedelta(days=1)
            
            hist = stock.history(start=start_date.strftime("%Y-%m-%d"), end=end_date.strftime("%Y-%m-%d"))
            
            if not hist.empty:
                # Return the price closest to the target date (last available in the window)
                return hist['Close'].iloc[-1]
            return 0.0
        except Exception as e:
            print(f"Error fetching historical price for {ticker} on {date}: {e}")
            return 0.0

    def get_company_info(self, ticker: str) -> Dict[str, Any]:
        """
        Gets company profile/info.
        """
        try:
            stock = yf.Ticker(ticker)
            return stock.info
        except Exception as e:
            print(f"Error fetching info for {ticker}: {e}")
            return {}

    def get_translated_company_info(self, ticker: str) -> Dict[str, Any]:
        """
        Gets company info with translated summary and details, using cache.
        """
        # Check cache
        cached = self.db.get_company_cache(ticker)
        if cached:
            return cached

        # Fetch fresh
        info = self.get_company_info(ticker)
        if not info:
            return {}

        # Translate Summary
        summary_en = info.get('longBusinessSummary', '')
        summary_kr = summary_en
        if summary_en:
            try:
                # Split into chunks if too long (Google Translate has limits), but deep_translator handles some.
                # For safety, let's just try translating.
                summary_kr = GoogleTranslator(source='auto', target='ko').translate(summary_en)
            except Exception as e:
                print(f"Translation failed for {ticker}: {e}")

        # Extract Details
        details = {
            "name": info.get('longName', ticker),
            "sector": info.get('sector', 'N/A'),
            "industry": info.get('industry', 'N/A'),
            "website": info.get('website', 'N/A'),
            "employees": info.get('fullTimeEmployees', 'N/A'),
            "city": info.get('city', 'N/A'),
            "country": info.get('country', 'N/A'),
            "market_cap": info.get('marketCap', 'N/A'),
            "dividend_yield": info.get('dividendYield', 'N/A'),
            "fifty_two_week_high": info.get('fiftyTwoWeekHigh', 'N/A'),
            "fifty_two_week_low": info.get('fiftyTwoWeekLow', 'N/A')
        }

        # Save to Cache
        self.db.save_company_cache(ticker, summary_kr, details)

        return {
            "summary_kr": summary_kr,
            "details": details,
            "last_updated": "Just Now"
        }

    def get_competitors(self, ticker: str) -> list:
        """
        Finds competitors in the same sector and fetches their basic data.
        """
        # Find current stock's sector
        current_stock = next((s for s in STOCK_DICT if s['ticker'] == ticker), None)
        if not current_stock:
            return []
        
        sector = current_stock.get('sector')
        if not sector:
            return []

        competitors = []
        for stock in STOCK_DICT:
            if stock['ticker'] != ticker and stock.get('sector') == sector:
                try:
                    info = self.get_company_info(stock['ticker'])
                    price = self.get_current_price(stock['ticker'])
                    market_cap = info.get('marketCap', 0)
                    pe_ratio = info.get('trailingPE', 0)
                    
                    competitors.append({
                        "ticker": stock['ticker'],
                        "name": stock['name_kr'],
                        "price": price,
                        "market_cap": market_cap,
                        "pe_ratio": pe_ratio
                    })
                except Exception as e:
                    print(f"Error fetching competitor {stock['ticker']}: {e}")
        
        return competitors

    def get_news_briefing(self, ticker: str) -> list:
        """
        Fetches news, translates to Korean, analyzes sentiment, and returns top 3.
        """
        try:
            # 1. Fetch News
            raw_news = self.get_news(ticker)
            if not raw_news:
                return []

            processed_news = []
            translator = GoogleTranslator(source='auto', target='ko')

            # Process only top 3 to save time/resources
            for item in raw_news[:3]:
                title_en = item.get('title', '')
                summary_en = item.get('summary', '')
                
                # 2. Sentiment Analysis (on English text)
                blob = TextBlob(f"{title_en} {summary_en}")
                polarity = blob.sentiment.polarity
                
                sentiment = "중립"
                if polarity > 0.1:
                    sentiment = "긍정"
                elif polarity < -0.1:
                    sentiment = "부정"

                # 3. Translation
                try:
                    title_kr = translator.translate(title_en)
                    
                    summary_kr = ""
                    if summary_en:
                        try:
                            # Try translating full summary (up to 1000 chars)
                            summary_kr = translator.translate(summary_en[:1000])
                        except Exception:
                            # Retry with shorter chunk if failed
                            try:
                                summary_kr = translator.translate(summary_en[:200])
                            except Exception:
                                summary_kr = summary_en # Fallback to English
                except Exception as e:
                    print(f"Translation failed for news: {e}")
                    title_kr = title_en
                    summary_kr = summary_en

                processed_news.append({
                    "title": title_kr,
                    "summary": summary_kr,
                    "link": item.get('link', ''),
                    "published": item.get('published', ''),
                    "sentiment": sentiment,
                    "polarity": polarity
                })
            
            return processed_news

        except Exception as e:
            print(f"Error getting news briefing for {ticker}: {e}")
            return []

    def get_market_summary(self) -> Dict[str, float]:
        """
        Fetches data for major indices and Gold.
        """
        def fetch_summary():
            indices = {
                "^GSPC": "S&P 500",
                "^IXIC": "Nasdaq",
                "^DJI": "Dow Jones",
                "^KS11": "KOSPI",
                "^KQ11": "KOSDAQ",
                "GC=F": "Gold",
                "CL=F": "WTI Crude Oil",
                "KRW=X": "USD/KRW",
                "BTC-USD": "Bitcoin",
                "^TNX": "10Y Treasury Yield",
                "^VIX": "VIX (Volatility)"
            }
            summary = {}
            for ticker, name in indices.items():
                try:
                    stock = yf.Ticker(ticker)
                    # Try fast_info first
                    price = stock.fast_info.last_price
                    prev_close = stock.fast_info.previous_close
                    
                    # Fallback if fast_info fails (common for indices)
                    if price is None or prev_close is None:
                        hist = stock.history(period="5d")
                        if not hist.empty:
                            price = hist['Close'].iloc[-1]
                            prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else price
                    
                    change = price - prev_close
                    change_percent = (change / prev_close) * 100 if prev_close else 0
                    
                    summary[name] = {
                        "price": price,
                        "change": change,
                        "change_percent": change_percent
                    }
                except Exception as e:
                    print(f"Error fetching {name}: {e}")
                    summary[name] = {"price": 0.0, "change": 0.0, "change_percent": 0.0}
                
            # Add Fear & Greed Index
            summary['Fear & Greed'] = {
                "price": self.get_fear_and_greed_index(),
                "change": 0,
                "change_percent": 0
            }
            return summary

        return self._get_cached_data('market_summary', fetch_summary)

    def get_fear_and_greed_index(self) -> float:
        """
        Fetches the Fear & Greed Index from CNN or calculates a fallback using VIX.
        """
        try:
            # Try fetching from CNN
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            response = requests.get("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                # The data structure usually contains 'fear_and_greed' object with 'score'
                return float(data['fear_and_greed']['score'])
        except Exception as e:
            print(f"Error fetching Fear & Greed from CNN: {e}")
        
        # Fallback: Calculate based on VIX
        # VIX 10 => Extreme Greed (100)
        # VIX 40 => Extreme Fear (0)
        # Linear interpolation: Score = 100 - (VIX - 10) * (100 / 30)
        try:
            vix = self.get_current_price("^VIX")
            if vix > 0:
                score = 100 - (vix - 10) * (100 / 30)
                return max(0, min(100, score)) # Clamp between 0 and 100
        except Exception as e:
            print(f"Error calculating Fear & Greed fallback: {e}")
            
        return 50.0 # Default Neutral

    def get_news(self, ticker: str) -> list:
        """
        Fetches news for a ticker via yfinance.
        Returns a list of dicts with 'title', 'summary', 'link', 'published'.
        """
        try:
            stock = yf.Ticker(ticker)
            raw_news = stock.news
            formatted_news = []
            for item in raw_news:
                if not item:
                    continue
                    
                # Handle cases where content might be None or missing
                content = item.get('content')
                if content is None:
                    content = item
                
                # Safe link extraction
                link = ''
                click_through = content.get('clickThroughUrl')
                if click_through and isinstance(click_through, dict):
                    link = click_through.get('url', '')
                elif isinstance(click_through, str):
                    link = click_through
                elif 'link' in content:
                    link = content['link']
                
                formatted_news.append({
                    "title": content.get('title', 'No Title'),
                    "summary": content.get('summary', ''),
                    "link": link,
                    "published": content.get('pubDate', '')
                })
            return formatted_news
            return formatted_news
        except Exception as e:
            print(f"Error fetching news for {ticker}: {e}")
            return []

    def get_stock_events(self, ticker: str) -> list:
        """
        Fetches significant events (Earnings, News) for the timeline.
        """
        events = []
        try:
            stock = yf.Ticker(ticker)
            
            # 1. Earnings (Calendar)
            try:
                calendar = stock.calendar
                if calendar is not None and not calendar.empty:
                    # yfinance calendar structure varies, usually has 'Earnings Date' or similar
                    # For simplicity, we'll try to extract dates.
                    # Note: yf.calendar might return future dates. We want past/near future.
                    pass 
            except Exception:
                pass

            # 2. News as Events
            # We reuse get_news but format it for the timeline
            # AND Translate it
            news_items = self.get_news(ticker)
            translator = GoogleTranslator(source='auto', target='ko')
            
            for item in news_items:
                title = item['title']
                summary = item['summary']
                
                try:
                    title = translator.translate(title)
                    if summary:
                        summary = translator.translate(summary[:200]) # Translate first 200 chars
                except Exception:
                    pass

                events.append({
                    "date": item['published'], # ISO string
                    "type": "news",
                    "title": title,
                    "description": summary
                })
                
            # Sort by date
            events.sort(key=lambda x: x['date'], reverse=True)
            
            return events[:10] # Return top 10 recent events
            
        except Exception as e:
            print(f"Error fetching events for {ticker}: {e}")
            return []

    def get_economic_data(self) -> Dict[str, float]:
        """
        Fetches key economic indicators.
        """
        def fetch_economic():
            indicators = {
                "10Y Treasury Yield": "^TNX",
                "VIX (Volatility)": "^VIX",
                "Crude Oil": "CL=F",
                "USD/KRW": "KRW=X"
            }
            data = {}
            for name, ticker in indicators.items():
                data[name] = self.get_current_price(ticker)
            return data

        return self._get_cached_data('economic_data', fetch_economic)

    def get_market_news(self) -> list:
        """
        Fetches general market news (using S&P 500 as proxy).
        """
        def fetch_news():
            try:
                # Use S&P 500 ticker for general market news
                stock = yf.Ticker("^GSPC")
                raw_news = stock.news
                
                processed_news = []
                translator = GoogleTranslator(source='auto', target='ko')
                
                for item in raw_news:
                    if not item:
                        continue
                    
                    content = item.get('content', item)
                    
                    # Extract thumbnail
                    thumbnail = ""
                    if 'thumbnail' in content and 'resolutions' in content['thumbnail']:
                        resolutions = content['thumbnail']['resolutions']
                        if resolutions:
                            thumbnail = resolutions[-1]['url'] # Use largest
                    
                    # Safe link extraction
                    link = ''
                    click_through = content.get('clickThroughUrl')
                    if click_through and isinstance(click_through, dict):
                        link = click_through.get('url', '')
                    elif isinstance(click_through, str):
                        link = click_through
                    elif 'link' in content:
                        link = content['link']

                    title_en = content.get('title', 'No Title')
                    
                    # Translate Title
                    try:
                        title_kr = translator.translate(title_en)
                    except:
                        title_kr = title_en

                    processed_news.append({
                        "title": title_kr,
                        "original_title": title_en,
                        "link": link,
                        "published": content.get('pubDate', ''),
                        "thumbnail": thumbnail,
                        "provider": content.get('provider', {}).get('displayName', 'Unknown')
                    })
                
                return processed_news
            except Exception as e:
                print(f"Error fetching market news: {e}")
                return []

        return self._get_cached_data('market_news', fetch_news)

    def get_smart_calendar(self, watchlist_tickers: list) -> list:
        """
        Generates a smart calendar with Macro events, Option Expiration, and Watchlist events.
        """
        events = []
        today = datetime.now()
        
        # 1. Macro Events (Static for Demo)
        macro_events = [
            {"date": "2025-11-27", "time": "22:30", "country": "US", "event": "GDP 성장률 (Q3)", "impact": "High", "forecast": "4.9%", "previous": "2.1%"},
            {"date": "2025-11-28", "time": "22:30", "country": "US", "event": "PCE 물가지수", "impact": "High", "forecast": "3.5%", "previous": "3.7%"},
            {"date": "2025-12-12", "time": "04:00", "country": "US", "event": "FOMC 금리결정", "impact": "High", "forecast": "5.50%", "previous": "5.50%"},
            {"date": "2025-12-13", "time": "22:30", "country": "US", "event": "CPI 소비자물가지수", "impact": "High", "forecast": "3.1%", "previous": "3.2%"},
        ]
        events.extend(macro_events)
        
        # 2. Option Expiration Dates (Calculated)
        # US: 3rd Friday
        # KR: 2nd Thursday
        
        def get_nth_weekday(year, month, n, weekday):
            # weekday: 0=Mon, ..., 6=Sun
            c = calendar.monthcalendar(year, month)
            count = 0
            for week in c:
                if week[weekday] != 0:
                    count += 1
                    if count == n:
                        return week[weekday]
            return None

        # Calculate for this month and next month
        for i in range(2):
            target_month = today.month + i
            target_year = today.year
            if target_month > 12:
                target_month -= 12
                target_year += 1
                
            # US Option Expiration (3rd Friday)
            us_day = get_nth_weekday(target_year, target_month, 3, 4) # 4=Friday
            if us_day:
                date_str = f"{target_year}-{target_month:02d}-{us_day:02d}"
                events.append({
                    "date": date_str,
                    "time": "06:00", # Close time roughly
                    "country": "US",
                    "event": "미국 옵션 만기일 (Triple Witching)",
                    "impact": "High",
                    "type": "expiration"
                })
                
            # KR Option Expiration (2nd Thursday)
            kr_day = get_nth_weekday(target_year, target_month, 2, 3) # 3=Thursday
            if kr_day:
                date_str = f"{target_year}-{target_month:02d}-{kr_day:02d}"
                events.append({
                    "date": date_str,
                    "time": "15:30",
                    "country": "KR",
                    "event": "한국 옵션 만기일",
                    "impact": "High",
                    "type": "expiration"
                })

        # 3. Watchlist Events (Simulated Earnings/Dividends)
        # Since we don't have a paid API for future earnings, we simulate them for the demo.
        # We use a deterministic hash to generate "consistent" random dates for each ticker.
        for ticker in watchlist_tickers:
            # Generate a pseudo-random day offset (0-60 days)
            seed = sum(ord(c) for c in ticker)
            offset = seed % 60
            event_date = today + timedelta(days=offset)
            date_str = event_date.strftime("%Y-%m-%d")
            
            # Determine event type based on ticker char
            if seed % 2 == 0:
                events.append({
                    "date": date_str,
                    "time": "After Close",
                    "country": "US",
                    "event": f"{ticker} 실적 발표 (Earnings)",
                    "impact": "Medium",
                    "type": "earnings",
                    "ticker": ticker
                })
            else:
                 events.append({
                    "date": date_str,
                    "time": "Market Open",
                    "country": "US",
                    "event": f"{ticker} 배당락일 (Ex-Dividend)",
                    "impact": "Medium",
                    "type": "dividend",
                    "ticker": ticker
                })
                
        # Sort by date
        events.sort(key=lambda x: x['date'])
        
        # Filter out past events (keep today)
        today_str = today.strftime("%Y-%m-%d")
        events = [e for e in events if e['date'] >= today_str]
        
        return events[:15] # Return top 15 upcoming

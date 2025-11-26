# 🧞‍♂️ Aladdin 2.0 (Finance App)

**Aladdin 2.0**은 개인 투자자를 위한 올인원 AI 금융 플랫폼입니다.
블랙록의 알라딘(Aladdin)에서 영감을 받아, 복잡한 금융 데이터를 직관적인 시각화와 AI 분석을 통해 제공합니다.

## 🚀 주요 기능 (Key Features)

### 1. 📊 스마트 대시보드 (Smart Dashboard)
*   **시장 요약**: S&P 500, 나스닥, 코스피, 비트코인 등 주요 지수와 공포/탐욕 지수를 한눈에 확인.
*   **AI 추천 종목**: AI가 분석한 오늘의 유망 종목 Top 3 제공.
*   **실시간 뉴스**: 글로벌 시장의 주요 뉴스를 한국어로 번역하여 제공.

### 2. 💼 포트폴리오 관리 (Portfolio Management)
*   **보유 종목 분석**: 국내/해외 주식을 통합 관리하고 수익률을 실시간으로 계산.
*   **AI 포트폴리오 진단**: 내 포트폴리오의 위험도, 분산 투자 수준, 개선점을 AI가 분석.
*   **상관관계 히트맵**: 보유 종목 간의 상관관계를 시각적으로 분석하여 리스크 관리.

### 3. ⚔️ AI 투자 배틀 (AI Fund Battle)
*   **3인의 AI 펀드매니저**: 워렌 버핏, 조지 소로스, 짐 사이먼스 스타일의 AI가 가상 수익률 대결.
*   **투자 스타일 비교**: 가치 투자, 매크로 투자, 퀀트 투자의 성과를 실시간으로 비교.

### 4. 🕰️ FOMO 타임머신 (Time Machine)
*   **인생 역전 계산기**: "그때 엔비디아를 샀더라면?" 과거 시점의 투자를 시뮬레이션.
*   **재미있는 비교**: 수익금을 치킨 🍗, 포르쉐 🏎️, 아파트 🏠 등으로 환산하여 보여줌.

### 5. 📅 스마트 캘린더 (Smart Calendar)
*   **경제 일정**: CPI, FOMC 등 주요 거시경제 이벤트 일정 제공.
*   **개인화 알림**: 보유 종목의 실적 발표일, 배당락일 자동 표시.

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Styling**: TailwindCSS (Midnight Pro Theme)
*   **Charts**: Recharts, Lightweight Charts

### Backend
*   **Framework**: FastAPI (Python)
*   **Data**: yfinance (Yahoo Finance API)
*   **Analysis**: Pandas, NumPy, TextBlob (Sentiment Analysis)
*   **Translation**: Google Translator (deep-translator)

---

## 📦 설치 및 실행 방법 (Installation)

### 1. 저장소 클론 (Clone)
```bash
git clone https://github.com/kimseunghyun76/finance-app.git
cd finance-app
```

### 2. 백엔드 실행 (Backend)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 9000
```

### 3. 프론트엔드 실행 (Frontend)
```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

---

## 🎨 테마 (Design)
*   **Midnight Pro**: 눈이 편안하고 고급스러운 다크 모드 기반의 글래스모피즘(Glassmorphism) 디자인을 적용했습니다.

---

## 📝 라이선스 (License)
This project is licensed under the MIT License.

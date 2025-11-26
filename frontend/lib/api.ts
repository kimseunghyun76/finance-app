import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000/api';

export const api = {
  getMarketSummary: async () => {
    const response = await axios.get(`${API_BASE_URL}/market/summary`);
    return response.data;
  },
  getStockDetails: async (ticker: string) => {
    const response = await axios.get(`${API_BASE_URL}/stock/${ticker}`);
    return response.data;
  },
  getConsultation: async (ticker: string) => {
    const response = await axios.get(`${API_BASE_URL}/consult/${ticker}`);
    return response.data;
  },
  searchStocks: async (query: string) => {
    const response = await axios.get(`${API_BASE_URL}/search`, { params: { query } });
    return response.data;
  },
  chatGuide: async (ticker: string, message: string) => {
    const response = await axios.post(`${API_BASE_URL}/chat/guide`, { ticker, message });
    return response.data;
  },
  getWatchlist: async () => {
    const response = await axios.get(`${API_BASE_URL}/watchlist`);
    return response.data;
  },
  addWatchlist: async (ticker: string) => {
    const response = await axios.post(`${API_BASE_URL}/watchlist/${ticker}`);
    return response.data;
  },
  removeWatchlist: async (ticker: string) => {
    const response = await axios.delete(`${API_BASE_URL}/watchlist/${ticker}`);
    return response.data;
  },
  getCompetitors: async (ticker: string) => {
    const response = await axios.get(`${API_BASE_URL}/stock/${ticker}/competitors`);
    return response.data;
  },
  getNewsBriefing: async (ticker: string) => {
    const response = await axios.get(`${API_BASE_URL}/stock/${ticker}/news`);
    return response.data;
  },
  getRecommendations: async () => {
    const response = await axios.get(`${API_BASE_URL}/recommendations`);
    return response.data;
  },
  getMarketMovers: async () => {
    const response = await axios.get(`${API_BASE_URL}/market/movers`);
    return response.data;
  },
  getPortfolio: async () => {
    const response = await axios.get(`${API_BASE_URL}/portfolio`);
    return response.data;
  },
  addPortfolioItem: async (ticker: string, shares: number, avg_price: number, purchase_date?: string) => {
    const response = await axios.post(`${API_BASE_URL}/portfolio`, { ticker, shares, avg_price, purchase_date });
    return response.data;
  },
  removePortfolioItem: async (ticker: string) => {
    const response = await axios.delete(`${API_BASE_URL}/portfolio/${ticker}`);
    return response.data;
  },
  getMarketNews: async () => {
    const response = await axios.get(`${API_BASE_URL}/market/news`);
    return response.data;
  },
  getPortfolioAnalysis: async () => {
    const response = await axios.get(`${API_BASE_URL}/portfolio/analyze`);
    return response.data;
  },
  getVolatilityAnalysis: async (ticker: string) => {
    const response = await axios.get(`${API_BASE_URL}/analyze/volatility/${ticker}`);
    return response.data;
  },
  getStockEvents: async (ticker: string) => {
    const response = await axios.get(`${API_BASE_URL}/stock/${ticker}/events`);
    return response.data;
  },
  getPortfolioCorrelation: async () => {
    const response = await axios.get(`${API_BASE_URL}/portfolio/correlation`);
    return response.data;
  },

  getMarketRegime: async () => {
    const response = await axios.get(`${API_BASE_URL}/market/regime`);
    return response.data;
  },

  getBattleStatus: async () => {
    const response = await axios.get(`${API_BASE_URL}/battle`);
    return response.data;
  },

  getSmartCalendar: async () => {
    const response = await axios.get(`${API_BASE_URL}/calendar/smart`);
    return response.data;
  },

  getTimeMachineCalculation: async (ticker: string, amount: number, date: string) => {
    const response = await axios.post(`${API_BASE_URL}/time-machine`, { ticker, amount, date });
    return response.data;
  }
};

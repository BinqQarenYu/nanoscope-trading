export interface RiskParams {
  stopLoss: number; // in %
  takeProfit: number; // in %
  maxDrawdown: number; // in %
  leverage: number; // x1 to x20
  minVpinThreshold: number; // 0 to 1
}

export type BotStrategy = 'VPIN_TOXICITY_BREAKOUT' | 'SPOOFING_REVERSAL' | 'MARKET_MAKER_REBATE' | 'SENTIMENT_MOMENTUM';

export interface TradingBot {
  id: string;
  name: string;
  exchange: 'htx' | 'binance' | 'bybit' | 'kraken';
  pair: string;
  status: 'active' | 'paused';
  strategy: BotStrategy;
  balance: number;
  startingBalance: number;
  numTrades: number;
  profitPct: number;
  riskParams: RiskParams;
  createdAt: number;
}

export interface TradeFeedItem {
  id: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
  vpin: number; // Volume-Synchronized Probability of Toxicity
  toxicity: number; // 0 to 1
  sentiment: number; // -1 to 1
  anomalies: string[]; // ['SPOOFING', 'WASH_TRADE', 'LIQUIDITY_GAP', 'TOXIC_IMBALANCE']
  exchange: 'htx' | 'binance' | 'bybit' | 'kraken';
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  cumulativeAmount: number;
  orderCount: number;
  spoofingValue: number; // 0 to 1 (likelihood of spoofing)
}

export interface MarketState {
  exchange: 'htx' | 'binance' | 'bybit' | 'kraken';
  pair: string;
  midPrice: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  vpin: number;
  orderImbalance: number; // -1 to 1
  orderflowToxicity: number; // 0 to 1
  detectedAnomalies: {
    type: 'SPOOFING' | 'WASH_TRADE' | 'LIQUIDITY_GAP' | 'MANIPULATION' | 'FALSE_TRADE' | 'HIGH_TOXICITY';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: number;
  }[];
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  exchange: string;
  pair: string;
  type: 'trade' | 'anomaly' | 'system' | 'risk';
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export interface BacktestConfig {
  strategy: BotStrategy;
  exchange: 'htx' | 'binance' | 'bybit' | 'kraken';
  pair: string;
  days: number;
  initialCapital: number;
  riskParams: RiskParams;
}

export interface BacktestTrade {
  timestamp: number;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  profit: number;
  vpin: number;
  type: string;
  anomaliesDetected: string[];
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  netProfit: number;
  netProfitPct: number;
  maxDrawdown: number;
  sharpeRatio: number;
  spoofingIncidentsAvoided: number;
  manipulationDetections: number;
  initialBalance: number;
  finalBalance: number;
  trades: BacktestTrade[];
}

export interface OrangePiTelemetry {
  timestamp: number;
  exchange: string;
  midPrice: number;
  vpin: number;
  orderImbalance: number;
  orderflowToxicity: number;
  bidsCount: number;
  asksCount: number;
}

export interface OrangePiStatus {
  ip: string;
  isAlive: boolean;
  lastSeen: number;
  totalReceivedPackets: number;
  recentTelemetry: OrangePiTelemetry[];
  feederMode: 'simulated' | 'orange_pi';
}


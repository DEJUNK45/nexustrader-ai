export interface Signal {
  action: string;
  actionColor: string;
  confidence: number;
  entryZone: string;
  stopLoss: string;
  takeProfit: string;
  reason: string;
}

export interface Asset {
  id: string;
  type: 'Crypto' | 'Stock' | 'Commodity';
  name: string;
  symbol: string;
  price: number;
  changePct: number;
  sentiment: number;
  sentimentLabel: string;
  aiPrediction: string;
  keyCatalyst: string;
  technicalPattern: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  signal: Signal;
}

export interface AssetMap {
  [key: string]: Asset;
}

export interface NewsItem {
  id: number;
  source: string;
  title: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'High' | 'Medium' | 'Low';
  time: string;
}

export interface Notification {
  id: number;
  title: string;
  msg: string;
  time: string;
  type: 'success' | 'danger' | 'info';
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

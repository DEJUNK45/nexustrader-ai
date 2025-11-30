import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, Zap, Cpu, Bell, 
  DollarSign, BarChart2, PieChart, Newspaper, 
  RefreshCw, Filter, User, Settings, LogOut, ChevronRight, Send,
  TrendingUp, Globe, AlertTriangle
} from 'lucide-react';

import TradingViewWidget from './components/TradingViewWidget';
import SignalCard from './components/SignalCard';
import SentimentGauge from './components/SentimentGauge';
import SentimentChart from './components/SentimentChart';
import { AssetMap, NewsItem, Notification, ChatMessage, Asset } from './types';
import { sendChatMessage } from './services/geminiService';

// --- CONSTANTS ---
const TV_SYMBOL_MAP: { [key: string]: string } = {
  BTC: 'BINANCE:BTCUSD',
  ETH: 'BINANCE:ETHUSD',
  NVDA: 'NASDAQ:NVDA',
  AAPL: 'NASDAQ:AAPL',
  TSLA: 'NASDAQ:TSLA',
  XAU: 'OANDA:XAUUSD'
};

const INITIAL_ASSETS: AssetMap = {
  BTC: {
    id: 'bitcoin',
    type: 'Crypto',
    name: 'Bitcoin',
    symbol: 'BTC/USD',
    price: 64230.50,
    changePct: 2.4,
    sentiment: 78,
    sentimentLabel: 'Very Bullish',
    aiPrediction: 'Testing 68k Resistance',
    keyCatalyst: 'ETF Inflows & Halving Aftermath',
    technicalPattern: 'Bullish Flag',
    riskLevel: 'Medium',
    signal: {
      action: 'STRONG BUY',
      actionColor: 'bg-green-500',
      confidence: 88,
      entryZone: '63,800 - 64,100',
      stopLoss: '61,500',
      takeProfit: '68,200',
      reason: 'Volume breakout confirmed above EMA 50.'
    }
  },
  ETH: {
    id: 'ethereum',
    type: 'Crypto',
    name: 'Ethereum',
    symbol: 'ETH/USD',
    price: 3450.20,
    changePct: 1.5,
    sentiment: 65,
    sentimentLabel: 'Bullish',
    aiPrediction: 'Testing Resistance 3500',
    keyCatalyst: 'Layer 2 Volume Spike',
    technicalPattern: 'Cup & Handle',
    riskLevel: 'High',
    signal: {
      action: 'BUY',
      actionColor: 'bg-green-500',
      confidence: 75,
      entryZone: '3,400 - 3,420',
      stopLoss: '3,250',
      takeProfit: '3,600',
      reason: 'Positive momentum ahead of Pectra upgrade.'
    }
  },
  NVDA: {
    id: 'nvidia',
    type: 'Stock',
    name: 'NVIDIA Corp',
    symbol: 'NVDA',
    price: 920.15,
    changePct: 1.1,
    sentiment: 85,
    sentimentLabel: 'Extreme Greed',
    aiPrediction: 'Consolidation 900-950',
    keyCatalyst: 'AI Chip Demand Sustained',
    technicalPattern: 'Ascending Triangle',
    riskLevel: 'High',
    signal: {
      action: 'HOLD',
      actionColor: 'bg-yellow-500',
      confidence: 65,
      entryZone: 'Wait 900',
      stopLoss: '880',
      takeProfit: '1050',
      reason: 'RSI Divergence, wait for pullback.'
    }
  },
  AAPL: {
    id: 'apple',
    type: 'Stock',
    name: 'Apple Inc',
    symbol: 'AAPL',
    price: 175.50,
    changePct: -1.4,
    sentiment: 40,
    sentimentLabel: 'Bearish',
    aiPrediction: 'Dip to Support 170',
    keyCatalyst: 'China Sales Data',
    technicalPattern: 'Head & Shoulders',
    riskLevel: 'Low',
    signal: {
      action: 'SELL',
      actionColor: 'bg-red-500',
      confidence: 70,
      entryZone: '176.00',
      stopLoss: '180.00',
      takeProfit: '168.00',
      reason: 'Bearish reversal pattern validated.'
    }
  },
  TSLA: {
    id: 'tesla',
    type: 'Stock',
    name: 'Tesla Inc',
    symbol: 'TSLA',
    price: 180.20,
    changePct: 3.2,
    sentiment: 72,
    sentimentLabel: 'Bullish',
    aiPrediction: 'Rebound from Support',
    keyCatalyst: 'FSD Update Rollout',
    technicalPattern: 'Double Bottom',
    riskLevel: 'High',
    signal: {
      action: 'STRONG BUY',
      actionColor: 'bg-green-500',
      confidence: 82,
      entryZone: '178 - 180',
      stopLoss: '165',
      takeProfit: '200',
      reason: 'Massive buy volume at major support.'
    }
  },
  XAU: {
    id: 'gold',
    type: 'Commodity',
    name: 'Gold Spot',
    symbol: 'XAU/USD',
    price: 2340.10,
    changePct: -0.5,
    sentiment: 60,
    sentimentLabel: 'Neutral',
    aiPrediction: 'Sideways',
    keyCatalyst: 'Fed Policy Minutes',
    technicalPattern: 'Double Top',
    riskLevel: 'Low',
    signal: {
      action: 'SELL SHORT',
      actionColor: 'bg-red-500',
      confidence: 72,
      entryZone: '2,345',
      stopLoss: '2,365',
      takeProfit: '2,300',
      reason: 'Negative RSI divergence on H4.'
    }
  }
};

const NEWS_DATA: NewsItem[] = [
  { id: 1, source: 'Bloomberg', title: 'Fed signals potential rate cuts in Q3 if inflation cools further.', sentiment: 'positive', impact: 'High', time: '10m ago' },
  { id: 2, source: 'Reuters', title: 'Geopolitical tensions rise in Middle East, oil and gold volatile.', sentiment: 'negative', impact: 'Medium', time: '15m ago' },
  { id: 3, source: 'CoinDesk', title: 'Bitcoin Whales accumulate 10,000 BTC in last 24h.', sentiment: 'positive', impact: 'High', time: '32m ago' },
  { id: 4, source: 'CNBC', title: 'Tech Sector earnings report beats analyst expectations.', sentiment: 'positive', impact: 'Medium', time: '1h ago' },
];

const NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'Target Hit: BTC/USD', msg: 'Bitcoin hit profit target at 68,000.', time: '2m ago', type: 'success' },
  { id: 2, title: 'Stop Loss Alert: AAPL', msg: 'Apple touched stop loss at 170.00.', time: '1h ago', type: 'danger' },
  { id: 3, title: 'New Signal: TSLA', msg: 'AI detected Double Bottom pattern on Tesla.', time: '3h ago', type: 'info' },
];

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
};

// --- SUB-COMPONENTS ---

const NavItem = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-400 hover:text-white hover:bg-gray-800"
  >
    {label}
  </button>
);

const ChatMessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isAi = msg.sender === 'ai';
  return (
    <div className={`flex gap-3 mb-4 animate-fade-in ${isAi ? '' : 'flex-row-reverse'}`}>
      {isAi && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <Cpu size={16} className="text-white" />
        </div>
      )}
      <div className={`p-3 rounded-xl max-w-[85%] text-sm leading-relaxed ${
        isAi 
        ? 'bg-gray-800 border border-gray-700 text-gray-300 rounded-tl-none' 
        : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-none shadow-md'
      }`}>
        {msg.text}
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [activeAsset, setActiveAsset] = useState<string>('BTC');
  const [assetData, setAssetData] = useState<AssetMap>(INITIAL_ASSETS);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLive, setIsLive] = useState(false);
  
  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToChatBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToChatBottom();
  }, [chatMessages, isChatLoading]);

  // Initial Chat Greeting
  useEffect(() => {
    const currentAsset = assetData[activeAsset];
    setChatMessages([
        { sender: 'ai', text: `Hello! I'm monitoring ${currentAsset.name} (${currentAsset.symbol}).` },
        { sender: 'ai', text: `Current Signal: ${currentAsset.signal.action}. How can I assist with your analysis?` }
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAsset]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    const currentAsset = assetData[activeAsset];
    const contextData = JSON.stringify(currentAsset);

    const aiResponseText = await sendChatMessage(userMsg.text, contextData);
    
    setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponseText }]);
    setIsChatLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // Simulation Engine
  useEffect(() => {
    const marketInterval = setInterval(() => {
      setAssetData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
          const item = newData[key];
          const volatility = item.type === 'Crypto' ? 0.002 : 0.0005; 
          const change = item.price * volatility * (Math.random() - 0.5);
          const newPrice = item.price + change;
          newData[key] = {
            ...item,
            price: newPrice,
            changePct: ((newPrice - 64000) / 64000) * 100, // Mock calc
          };
        });
        return newData;
      });
      setIsLive(true);
    }, 5000); 

    return () => clearInterval(marketInterval);
  }, []);

  const currentAsset = assetData[activeAsset];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500 selection:text-white" onClick={() => {if(showNotif) setShowNotif(false); if(showProfile) setShowProfile(false)}}>
      
      {/* Navbar */}
      <header className="h-16 border-b border-gray-800 bg-gray-900/90 backdrop-blur-md fixed top-0 w-full z-50 flex items-center justify-between px-6 shadow-lg">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => scrollToSection('dashboard-section')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
            <Zap className="text-white fill-current" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            NexusTrader AI
          </span>
        </div>
        
        <nav className="hidden md:flex gap-1 text-sm font-medium text-gray-400 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
          <NavItem label="Dashboard" onClick={() => scrollToSection('dashboard-section')} />
          <NavItem label="Signals" onClick={() => scrollToSection('signals-section')} />
          <NavItem label="Screener" onClick={() => scrollToSection('screener-section')} />
          <NavItem label="News" onClick={() => scrollToSection('news-section')} />
        </nav>

        <div className="flex items-center gap-4">
           {/* Live Status */}
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-xs shadow-inner">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-gray-400 hidden sm:inline font-mono">LIVE FEED</span>
          </div>

          {/* Notifications */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
                onClick={() => setShowNotif(!showNotif)}
                className={`p-2 rounded-full relative transition-colors ${showNotif ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
            >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            </button>
            {showNotif && (
                <div className="absolute right-0 mt-3 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-down ring-1 ring-black/5">
                    <div className="p-3 border-b border-gray-700 font-bold text-sm bg-gray-900/50">Recent Alerts</div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {NOTIFICATIONS.map(notif => (
                            <div key={notif.id} className="p-3 hover:bg-gray-700/50 border-b border-gray-700/50 cursor-pointer transition-colors">
                                <div className="flex justify-between mb-1">
                                    <span className={`text-xs font-bold ${notif.type === 'success' ? 'text-green-400' : notif.type === 'danger' ? 'text-red-400' : 'text-blue-400'}`}>
                                        {notif.title}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{notif.time}</span>
                                </div>
                                <p className="text-xs text-gray-300">{notif.msg}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <div 
                onClick={() => setShowProfile(!showProfile)}
                className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-gray-900 transition-all flex items-center justify-center text-xs font-bold text-white"
            >
              NP
            </div>
            {showProfile && (
                <div className="absolute right-0 mt-3 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-down">
                     <div className="p-4 border-b border-gray-700 bg-gray-900/50">
                        <p className="text-sm font-bold text-white">Nexus Pro</p>
                        <p className="text-xs text-gray-400">trader@nexus.ai</p>
                    </div>
                    <div className="p-2 space-y-1">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-3 transition-colors"><User size={16}/> Profile</button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-3 transition-colors"><Settings size={16}/> Settings</button>
                        <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded flex items-center gap-3 transition-colors"><LogOut size={16}/> Sign Out</button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </header>

      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Market Watch */}
        <div className="lg:col-span-3 space-y-6 hidden lg:block">
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 sticky top-24 shadow-xl">
            <h3 className="text-gray-400 text-xs uppercase font-bold mb-4 flex justify-between items-center tracking-wider">
                Market Watch 
                <RefreshCw size={12} className={`text-gray-500 ${isLive ? 'animate-spin' : ''}`} style={{animationDuration: '3s'}} />
            </h3>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
              {Object.keys(assetData).map((key) => {
                const item = assetData[key];
                const isActive = activeAsset === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setActiveAsset(key); scrollToSection('dashboard-section'); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                      isActive
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                      : 'bg-gray-800/40 hover:bg-gray-700/60 border-transparent hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                        {item.type === 'Crypto' ? <Cpu size={16} /> : item.type === 'Commodity' ? <PieChart size={16} /> : <DollarSign size={16} />}
                      </div>
                      <div className="text-left">
                        <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>{item.symbol}</div>
                        <div className="text-[10px] text-gray-500">{item.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white mb-0.5">
                            {formatCurrency(item.price)}
                        </div>
                        <div className={`text-[10px] font-medium ${item.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                        </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Mini Sentiment Chart in Sidebar */}
            <div className="mt-6 pt-4 border-t border-gray-700">
               <h4 className="text-gray-500 text-[10px] uppercase font-bold mb-2">Overall Sentiment Trend</h4>
               <SentimentChart />
            </div>
          </div>
        </div>

        {/* Center: Main Content */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Dashboard Section */}
          <div id="dashboard-section" className="scroll-mt-24">
            <div className="flex flex-wrap items-end gap-4 mb-4 animate-fade-in">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-5xl font-bold text-white tracking-tighter tabular-nums">
                        {formatCurrency(currentAsset.price)}
                        </h1>
                        <span className="flex h-3 w-3 relative mt-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center ${currentAsset.changePct >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                           <TrendingUp size={12} className="mr-1" /> {currentAsset.changePct >= 0 ? '+' : ''}{currentAsset.changePct.toFixed(2)}% Today
                        </span>
                        <span className="text-gray-500 text-xs">Real-time • {currentAsset.symbol}</span>
                    </div>
                </div>
            </div>

            <SignalCard signal={currentAsset.signal} />

            {/* TradingView Widget Wrapper */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden relative mb-6 h-[450px] shadow-2xl">
                <TradingViewWidget symbol={TV_SYMBOL_MAP[activeAsset]} />
            </div>

            {/* AI Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/30 border border-gray-700 p-4 rounded-xl hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-blue-400">
                        <BarChart2 size={18} />
                        <h3 className="font-bold text-sm">Technical AI Analysis</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                            <span className="text-gray-400 text-xs">Pattern Detected</span>
                            <span className="text-white font-mono text-xs bg-blue-500/20 px-2 py-1 rounded">{currentAsset.technicalPattern}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">Key Levels</span>
                            <span className="text-gray-300 font-mono text-xs">S: {formatCurrency(currentAsset.price * 0.95)} <span className="text-gray-600">|</span> R: {formatCurrency(currentAsset.price * 1.05)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/30 border border-gray-700 p-4 rounded-xl hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-purple-400">
                        <Globe size={18} />
                        <h3 className="font-bold text-sm">Fundamental Drivers</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                            <span className="text-gray-400 text-xs">Main Catalyst</span>
                            <span className="text-white font-medium text-right text-xs max-w-[150px] truncate">{currentAsset.keyCatalyst}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">Macro Risk</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${currentAsset.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{currentAsset.riskLevel}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Signals Section */}
          <div id="signals-section" className="animate-fade-in space-y-4 pt-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                <Zap className="text-yellow-400" size={20} /> Active AI Signals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(assetData).map(key => {
                    const asset = assetData[key];
                    return (
                        <div 
                            key={key}
                            onClick={() => { setActiveAsset(key); scrollToSection('dashboard-section'); }}
                            className="bg-gray-800 hover:bg-gray-700/80 border border-gray-700 hover:border-blue-500/50 rounded-xl p-4 cursor-pointer transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="z-10">
                                    <h3 className="font-bold text-base text-white">{asset.name}</h3>
                                    <p className="text-[10px] text-gray-400">{asset.symbol}</p>
                                </div>
                                <span className={`z-10 px-2 py-1 rounded text-[10px] font-bold text-white ${asset.signal.actionColor} shadow-lg`}>
                                    {asset.signal.action}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-300 mb-2 z-10 relative">
                                <span className="font-mono">{formatCurrency(asset.price)}</span>
                                <span className={asset.changePct >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {asset.changePct >= 0 ? '+' : ''}{asset.changePct.toFixed(2)}%
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 italic border-t border-gray-700 pt-2 mt-2 z-10 relative">
                                "{asset.signal.reason}"
                            </p>
                            
                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                    )
                })}
            </div>
          </div>

          {/* Screener Section */}
          <div id="screener-section" className="animate-fade-in pt-4 scroll-mt-24">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Filter className="text-blue-400" size={20} /> AI Market Screener
                </h2>
                <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">
                    <button className="px-3 py-1 bg-gray-700 rounded text-[10px] text-white shadow font-medium">All</button>
                    <button className="px-3 py-1 hover:bg-gray-700 rounded text-[10px] text-gray-400 transition-colors">Crypto</button>
                    <button className="px-3 py-1 hover:bg-gray-700 rounded text-[10px] text-gray-400 transition-colors">Stocks</button>
                </div>
            </div>
            
            <div className="overflow-hidden bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-900/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                            <th className="p-4">Instrument</th>
                            <th className="p-4 text-right">Price</th>
                            <th className="p-4 text-right">24h Change</th>
                            <th className="p-4 text-center">AI Signal</th>
                            <th className="p-4 text-center">Sentiment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {Object.values(assetData).map((asset: Asset) => (
                            <tr 
                                key={asset.id} 
                                onClick={() => { setActiveAsset(Object.keys(assetData).find(k => assetData[k].id === asset.id) || 'BTC'); scrollToSection('dashboard-section'); }}
                                className="hover:bg-gray-700/30 cursor-pointer transition-colors"
                            >
                                <td className="p-4 font-medium text-white flex items-center gap-2">
                                    <div className={`w-1 h-8 rounded-full ${asset.changePct >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <div>{asset.symbol}</div>
                                        <div className="text-[10px] text-gray-500 font-normal">{asset.name}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-right text-gray-200 font-mono">{formatCurrency(asset.price)}</td>
                                <td className={`p-4 text-right font-bold ${asset.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {asset.changePct >= 0 ? '+' : ''}{asset.changePct.toFixed(2)}%
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold text-white ${asset.signal.actionColor}`}>
                                        {asset.signal.action}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div className={`h-full ${asset.sentiment > 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${asset.sentiment}%`}}></div>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{asset.sentiment}/100</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>

          {/* News Section */}
          <div id="news-section" className="animate-fade-in pt-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-3">
                <Newspaper className="text-purple-400" size={20} /> Global Market News
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {NEWS_DATA.map((news) => (
                    <div key={news.id} className="bg-gray-800/40 p-5 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer group hover:bg-gray-800/60">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wide">{news.source}</span>
                                <span className="text-gray-500 text-[10px] flex items-center gap-1"><Activity size={10}/> {news.time}</span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${news.sentiment === 'positive' ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                                {news.sentiment}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-200 group-hover:text-white mb-2 leading-relaxed">{news.title}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                             Impact Rating: <span className={news.impact === 'High' ? 'text-red-400 font-bold' : 'text-yellow-400'}>{news.impact}</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: AI Chat */}
        <div className="lg:col-span-3 space-y-6 hidden lg:block">
           <SentimentGauge score={currentAsset.sentiment} label={currentAsset.sentimentLabel} />

           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 flex flex-col h-[500px] sticky top-24 shadow-2xl">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30 rounded-t-xl">
                <h3 className="font-bold text-sm flex items-center gap-2 text-blue-100">
                    <Cpu size={16} className="text-blue-500"/> Nexus Assistant
                </h3>
                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20 animate-pulse">Online</span>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col">
                {chatMessages.map((msg, idx) => (
                    <ChatMessageBubble key={idx} msg={msg} />
                ))}
                {isChatLoading && (
                  <div className="flex gap-3 mb-4 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Cpu size={16} className="text-white" />
                    </div>
                    <div className="bg-gray-800 p-3 rounded-xl rounded-tl-none text-xs text-gray-400 italic">
                      Analyzing market data...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-gray-700 bg-gray-900/30 rounded-b-xl">
                <div className="relative flex gap-2">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about this asset..." 
                        disabled={isChatLoading}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-3 pr-2 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-600 disabled:opacity-50"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={isChatLoading || !chatInput.trim()}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white p-2 rounded-lg transition-colors shadow-lg"
                    >
                        <Send size={16} />
                    </button>
                </div>
              </div>
           </div>
           
           <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-blue-300 text-xs font-bold uppercase">
                <AlertTriangle size={12} /> Pro Tip
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Divergence between Price and Sentiment often precedes a reversal. Watch the gauge closely when price hits resistance.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;
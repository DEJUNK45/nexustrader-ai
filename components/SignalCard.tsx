import React from 'react';
import { Zap, Crosshair, ShieldAlert, Target } from 'lucide-react';
import { Signal } from '../types';

interface SignalCardProps {
  signal: Signal;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal }) => (
  <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-5 mb-6 relative overflow-hidden transition-all duration-500 hover:border-blue-500/30 shadow-lg">
    <div className={`absolute -right-10 -top-10 w-40 h-40 ${signal.actionColor} opacity-10 rounded-full blur-3xl animate-pulse`}></div>
    
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 relative z-10">
      <div>
        <h3 className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2 mb-1">
          <Zap size={14} className="text-yellow-400" /> AI Strategy Signal
        </h3>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-black px-3 py-1 rounded ${signal.actionColor} text-white shadow-lg tracking-tight`}>
            {signal.action}
          </span>
          <span className="text-sm text-gray-400 font-medium bg-gray-900/50 px-2 py-1 rounded">
            Confidence: <span className="text-white">{signal.confidence}%</span>
          </span>
        </div>
      </div>
      <div className="text-right w-full md:w-auto">
         <p className="text-xs text-gray-400 max-w-xs ml-auto italic border-l-2 border-gray-600 pl-3">"{signal.reason}"</p>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 border-t border-gray-700/50 pt-4 relative z-10">
      <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/30 hover:bg-gray-700/30 transition-colors">
        <div className="flex items-center gap-2 text-blue-400 text-[10px] uppercase font-bold mb-1">
          <Crosshair size={12} /> Entry Zone
        </div>
        <div className="text-white font-mono font-bold text-sm sm:text-base">{signal.entryZone}</div>
      </div>
      <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/30 hover:bg-gray-700/30 transition-colors">
        <div className="flex items-center gap-2 text-red-400 text-[10px] uppercase font-bold mb-1">
          <ShieldAlert size={12} /> Stop Loss
        </div>
        <div className="text-white font-mono font-bold text-sm sm:text-base">{signal.stopLoss}</div>
      </div>
      <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/30 hover:bg-gray-700/30 transition-colors">
        <div className="flex items-center gap-2 text-green-400 text-[10px] uppercase font-bold mb-1">
          <Target size={12} /> Take Profit
        </div>
        <div className="text-white font-mono font-bold text-sm sm:text-base">{signal.takeProfit}</div>
      </div>
    </div>
  </div>
);

export default SignalCard;
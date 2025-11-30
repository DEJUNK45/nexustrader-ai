import React from 'react';

interface SentimentGaugeProps {
  score: number;
  label: string;
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({ score, label }) => {
  const color = score > 70 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">AI Market Sentiment</h3>
      <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between w-full mt-2 text-xs font-bold uppercase">
        <span className="text-red-400">Extreme Fear</span>
        <span className="text-white text-sm">{score}</span>
        <span className="text-green-400">Extreme Greed</span>
      </div>
      <p className={`mt-2 text-sm font-medium tracking-wide ${score > 70 ? 'text-green-400' : score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
        {label}
      </p>
    </div>
  );
};

export default SentimentGauge;
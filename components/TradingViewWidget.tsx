import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = container.current;
    if (!currentContainer) return;

    // Clean up previous widget
    currentContainer.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol, 
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "backgroundColor": "rgba(31, 41, 55, 0)", // Transparent to blend
      "gridColor": "rgba(55, 65, 81, 0.3)",
      "allow_symbol_change": false,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "hide_top_toolbar": false,
      "hide_side_toolbar": true
    });

    currentContainer.appendChild(widgetContainer);
    currentContainer.appendChild(script);

    return () => {
        if (currentContainer) {
            currentContainer.innerHTML = "";
        }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-full w-full rounded-xl overflow-hidden" ref={container} />
  );
};

export default TradingViewWidget;
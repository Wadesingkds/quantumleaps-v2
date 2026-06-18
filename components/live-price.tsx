"use client";

import { useEffect, useRef } from "react";

// ponytail: TradingView ticker widget — no API, free, real-time XAUUSD
export function LivePrice() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean previous widget
    containerRef.current.innerHTML = "";

    // TradingView ticker tape widget
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        {
          proName: "OANDA:XAUUSD",
          title: "XAU/USD",
        },
        {
          proName: "TVC:GOLD",
          title: "GOLD",
        },
        {
          proName: "FX_IDC:EURUSD",
          title: "EUR/USD",
        },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "id",
    });

    // Wrap in container
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container";
    widget.style.width = "100%";
    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    widget.appendChild(inner);
    widget.appendChild(script);
    containerRef.current.appendChild(widget);
  }, []);

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
        <p className="font-mono text-xs text-zinc-400">LIVE · TRADINGVIEW</p>
        <a
          href="https://www.tradingview.com/symbols/OANDA-XAUUSD/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-[#D4AF37] hover:text-[#F0D060]"
        >
          Chart →
        </a>
      </div>
      <div ref={containerRef} className="bg-zinc-900" />
    </div>
  );
}
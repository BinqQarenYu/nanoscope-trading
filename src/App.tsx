import React, { useState, useEffect } from 'react';
import { TradingBot, MarketState, ActivityLog, TradeFeedItem, BacktestConfig, BacktestResult, OrangePiStatus } from './types';
import ThreeDGraph from './components/ThreeDGraph';
import OrderflowDissector from './components/OrderflowDissector';
import BotDashboard from './components/BotDashboard';
import Backtester from './components/Backtester';
import AiAdvisor from './components/AiAdvisor';
import OrangePiMonitor from './components/OrangePiMonitor';
import { Compass, Bot, Layers, TrendingUp, Cpu, Moon, Activity, AlertOctagon, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeSegment, setActiveSegment] = useState<'microscope' | 'fleet' | 'backtest' | 'socrates' | 'orangepi'>('microscope');
  
  // Dynamic market and execution stats pulled from simulated API
  const [selectedExchange, setSelectedExchange] = useState<'binance' | 'bybit' | 'htx' | 'kraken'>('binance');
  const [marketResponse, setMarketResponse] = useState<{
    exchanges: Record<string, MarketState>;
    recentTrades: TradeFeedItem[];
    portfolio: {
      totalUsdValue: number;
      initialUsdValue: number;
      netProfit: number;
      profitPct: number;
      balances: Record<string, { usd: number, btc: number, eth: number }>;
    };
    orangePi?: OrangePiStatus;
  } | null>(null);

  const [bots, setBots] = useState<TradingBot[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Fetch initial collections
  const loadPlatformState = async () => {
    try {
      // 1. Fetch Market Tickers
      const mRes = await fetch('/api/market-state');
      if (mRes.ok) {
        const mData = await mRes.json();
        setMarketResponse(mData);
      }

      // 2. Fetch Bots Registry
      const bRes = await fetch('/api/bots');
      if (bRes.ok) {
        const bData = await bRes.json();
        setBots(bData);
      }

      // 3. Fetch Activity logs
      const lRes = await fetch('/api/logs');
      if (lRes.ok) {
        const lData = await lRes.json();
        setLogs(lData);
      }
    } catch (err) {
      console.error("Platform polling telemetry error:", err);
    }
  };

  // Setup periodic refresh loops
  useEffect(() => {
    loadPlatformState();
    const intervalId = setInterval(loadPlatformState, 2500); // Poll every 2.5s corresponding with tick rate
    return () => clearInterval(intervalId);
  }, []);

  // Bot operations handlers
  const handleCreateBot = async (botData: any) => {
    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botData)
      });
      if (res.ok) {
        loadPlatformState(); // refresh immediately
      }
    } catch (err) {
      console.error("Failed to construct quantum bot:", err);
    }
  };

  const handleToggleBot = async (id: string) => {
    try {
      const res = await fetch(`/api/bots/${id}/toggle`, {
        method: 'PUT'
      });
      if (res.ok) {
        loadPlatformState();
      }
    } catch (err) {
      console.error("Failed to toggle bot run bounds:", err);
    }
  };

  const handleDeleteBot = async (id: string) => {
    try {
      const res = await fetch(`/api/bots/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadPlatformState();
      }
    } catch (err) {
      console.error("Failed to decommissioning target bot:", err);
    }
  };

  // Backtester endpoint handler
  const handleRunBacktest = async (config: BacktestConfig, callback: (result: BacktestResult) => void) => {
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        const resultData = await res.json();
        callback(resultData);
      }
    } catch (err) {
      console.error("Backtest simulation failure:", err);
    }
  };

  // Switch Orange Pi feeder modes
  const handleToggleOrangePiMode = async (mode: 'simulated' | 'orange_pi') => {
    try {
      const res = await fetch('/api/orange-pi/toggle-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      if (res.ok) {
        loadPlatformState();
      }
    } catch (err) {
      console.error("Failed to switch router input priorities:", err);
    }
  };

  // Resolve focused state variables
  const marketState: MarketState | undefined = marketResponse?.exchanges[selectedExchange];
  const totalTradesList = marketResponse?.recentTrades.filter(t => t.exchange === selectedExchange) || [];
  const defaultPortfolio = marketResponse?.portfolio || {
    totalUsdValue: 24850.15,
    initialUsdValue: 24000.00,
    netProfit: 850.15,
    profitPct: 3.54,
    balances: {
      binance: { usd: 10450.25, btc: 0.15, eth: 2.1 },
      bybit: { usd: 5120.40, btc: 0.08, eth: 1.2 },
      htx: { usd: 4280.50, btc: 0.05, eth: 0.8 },
      kraken: { usd: 4999.00, btc: 0.07, eth: 0.5 }
    }
  };

  // Assemble dynamic values for displaying headers
  const focusPrice = marketState?.midPrice || 94850;
  const vpinIndex = marketState?.vpin || 0.45;
  const anomaliesCount = marketState?.detectedAnomalies.length || 0;

  return (
    <div id="quantum-app-container" className="min-h-screen bg-[#030408] text-slate-200 font-sans flex flex-col justify-between selection:bg-emerald-500/30 selection:text-white">
      
      {/* Prime Header HUD console info ticker */}
      <header className="border-b border-slate-900 bg-[#07090f]/90 sticky top-0 z-50 backdrop-blur px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Microscopic Logo & focused stats */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/20 shadow-md">
            <Cpu className="w-6 h-6 text-emerald-400 rotate-90" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-extrabold flex items-center gap-1.5 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Institutional Level
            </span>
            <h1 className="text-sm font-bold tracking-tight text-white mt-0.5 select-none font-mono">
              QUANTUM NANOSCOPE <span className="text-gray-500">v1.2</span>
            </h1>
          </div>
        </div>

        {/* Global focused variables toggles */}
        <div id="focused-exchange-badge" className="flex items-center gap-2.5 font-mono text-[10px]">
          <span className="text-gray-500 uppercase font-semibold">Microscope Core Ticker:</span>
          <div className="flex bg-[#0a0c12] border border-gray-800 rounded-lg p-0.5">
            {(['binance', 'bybit', 'htx', 'kraken'] as const).map((ex) => {
              const capMap = { binance: 'Binance', bybit: 'Bybit', htx: 'HTX', kraken: 'Kraken' };
              return (
                <button
                  key={ex}
                  id={`header-ex-toggle-${ex}`}
                  onClick={() => setSelectedExchange(ex)}
                  className={`px-3 py-1 rounded cursor-pointer transition font-bold ${selectedExchange === ex ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' : 'text-gray-500 hover:text-slate-300'}`}
                >
                  {capMap[ex]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Console stats right alignment */}
        <div id="quick-telemetry-hud" className="hidden lg:flex gap-5 font-mono text-[10px]">
          <div className="text-right">
            <span className="text-gray-500 uppercase block">Mid-Index Price</span>
            <span className="text-white font-bold text-xs">${focusPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="text-right border-l border-slate-900 pl-4">
            <span className="text-gray-500 uppercase block">VPIN Toxicity</span>
            <span className={`font-bold text-xs ${vpinIndex > 0.65 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {(vpinIndex * 100).toFixed(0)}% Adverse
            </span>
          </div>
          <div className="text-right border-l border-slate-900 pl-4 flex items-center gap-2">
            <div>
              <span className="text-gray-500 uppercase block">Orange Pi Node</span>
              <span className={`font-bold text-xs uppercase ${marketResponse?.orangePi?.isAlive ? 'text-orange-400' : 'text-gray-600'}`}>
                {marketResponse?.orangePi?.isAlive ? '192.168.1.32' : 'OFFLINE'}
              </span>
            </div>
            <span className={`w-2 h-2 rounded-full ${marketResponse?.orangePi?.isAlive ? 'bg-orange-400 animate-pulse' : 'bg-gray-700'}`}></span>
          </div>
          <div className="text-right border-l border-slate-900 pl-4">
            <span className="text-gray-500 uppercase block">Alert Anomalies</span>
            <span className={`font-bold text-xs ${anomaliesCount > 0 ? 'text-amber-400 animate-bounce' : 'text-gray-400'}`}>
              {anomaliesCount} Signaling
            </span>
          </div>
        </div>

      </header>

      {/* Main Console Tab Controls & Layout Grid */}
      <main className="flex-1 w-full max-w-[1450px] mx-auto px-6 py-6 flex flex-col gap-6">
        
        {/* Navigation Core Panel bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#07090f] border border-slate-900 rounded-xl p-3 shrink-0 gap-3">
          
          <div className="flex gap-1 bg-[#030408] border border-gray-800 rounded-lg p-1 text-[10px] font-mono select-none w-full sm:w-auto overflow-x-auto justify-start">
            
            <button
              id="seg-toggle-microscope"
              onClick={() => setActiveSegment('microscope')}
              className={`flex items-center gap-1.5 px-4 py-1.5 font-bold rounded cursor-pointer transition uppercase tracking-wider shrink-0 ${activeSegment === 'microscope' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Compass className="w-4 h-4" />
              Nanoscope Projections
            </button>
            
            <button
              id="seg-toggle-fleet"
              onClick={() => setActiveSegment('fleet')}
              className={`flex items-center gap-1.5 px-4 py-1.5 font-bold rounded cursor-pointer transition uppercase tracking-wider shrink-0 ${activeSegment === 'fleet' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Bot className="w-4 h-4" />
              Manage Fleet ({bots.length})
            </button>
            
            <button
              id="seg-toggle-backtest"
              onClick={() => setActiveSegment('backtest')}
              className={`flex items-center gap-1.5 px-4 py-1.5 font-bold rounded cursor-pointer transition uppercase tracking-wider shrink-0 ${activeSegment === 'backtest' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <TrendingUp className="w-4 h-4" />
              Test Workbench
            </button>

            <button
              id="seg-toggle-socrates"
              onClick={() => setActiveSegment('socrates')}
              className={`flex items-center gap-1.5 px-4 py-1.5 font-bold rounded cursor-pointer transition uppercase tracking-wider shrink-0 ${activeSegment === 'socrates' ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Cpu className="w-4 h-4" />
              Socrates AI Advisor
            </button>

            <button
              id="seg-toggle-orangepi"
              onClick={() => setActiveSegment('orangepi')}
              className={`flex items-center gap-1.5 px-4 py-1.5 font-bold rounded cursor-pointer transition uppercase tracking-wider shrink-0 ${activeSegment === 'orangepi' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Cpu className="w-4 h-4 text-orange-400 animate-pulse" />
              Orange Pi Gatherer
            </button>
          </div>

          <div className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            ENGINE SPEED: 24/7 CORE DISSECTOR ACTIVE
          </div>
        </div>

        {/* Dashboard Panels viewport */}
        {marketState ? (
          <div id="main-workbench-viewport" className="flex-1">
            
            {/* Panel 1: Draggable 3D hologram trade pipeline and core LOB analysis science */}
            {activeSegment === 'microscope' && (
              <div id="microscope-split-panel" className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full items-stretch">
                <div className="h-[480px] xl:h-[620px]">
                  <ThreeDGraph trades={totalTradesList} midPrice={focusPrice} />
                </div>
                <div className="h-full">
                  <OrderflowDissector marketState={marketState} />
                </div>
              </div>
            )}

            {/* Panel 2: Bot Fleet creation builders and consolidated balances */}
            {activeSegment === 'fleet' && (
              <div id="fleet-workbench-panel" className="animate-fadeIn">
                <BotDashboard 
                  bots={bots} 
                  portfolio={defaultPortfolio} 
                  logs={logs}
                  onCreateBot={handleCreateBot}
                  onToggleBot={handleToggleBot}
                  onDeleteBot={handleDeleteBot}
                />
              </div>
            )}

            {/* Panel 3: Statistical backtest historical workbench graphs */}
            {activeSegment === 'backtest' && (
              <div id="backtest-workbench-panel" className="animate-fadeIn">
                <Backtester onRunBacktest={handleRunBacktest} />
              </div>
            )}

            {/* Panel 4: Socrates AI Quant analyst Chat */}
            {activeSegment === 'socrates' && (
              <div id="socrates-advisor-panel" className="h-[480px] xl:h-[580px] max-w-4xl mx-auto w-full animate-fadeIn">
                <AiAdvisor currentMarketState={marketState} />
              </div>
            )}

            {/* Panel 5: Orange Pi Gatherer dashboard control panel */}
            {activeSegment === 'orangepi' && (
              <div id="orange-pi-panel" className="animate-fadeIn">
                <OrangePiMonitor 
                  status={marketResponse?.orangePi || null} 
                  onToggleMode={handleToggleOrangePiMode} 
                />
              </div>
            )}

          </div>
        ) : (
          <div id="loading-epoch-states" className="flex-1 flex flex-col items-center justify-center p-20 font-mono text-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
            <div>
              <h5 className="font-bold text-white text-xs">Awaiting Quant Frame Sync</h5>
              <p className="text-gray-500 text-[9.5px] mt-1 max-w-md mx-auto leading-relaxed">Connecting with Binance, Bybit, HTX, and Kraken memory routers. Resolving synthetic orderbook weights and telemetry arrays.</p>
            </div>
          </div>
        )}

      </main>

      {/* Humble Standard Page margin & status guidelines */}
      <footer className="border-t border-[#1e293b]/20 bg-[#05070a] px-6 py-3.5 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-gray-500 mt-6 shrink-0 gap-2">
        <div>
          <span>MICROSECOND PROJECTION PROTOCOL &bull; HTX BINANCE BYBIT KRAKEN SIMULATOR</span>
        </div>
        <div className="flex gap-4">
          <span>Socrates AI v1.2</span>
          <span>Status: Consolidated Stream Online</span>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { BacktestConfig, BacktestResult, RiskParams, BotStrategy } from '../types';
import { Play, ArrowDownLeft, ArrowUpRight, BarChart3, TrendingUp, AlertTriangle, HelpCircle, CheckCircle } from 'lucide-react';

interface BacktesterProps {
  onRunBacktest: (config: BacktestConfig, callback: (result: BacktestResult) => void) => void;
}

export default function Backtester({ onRunBacktest }: BacktesterProps) {
  const [strategy, setStrategy] = useState<BotStrategy>('VPIN_TOXICITY_BREAKOUT');
  const [exchange, setExchange] = useState<'htx' | 'binance' | 'bybit' | 'kraken'>('binance');
  const [pair, setPair] = useState('BTC/USDT');
  const [days, setDays] = useState(30);
  const [initialCapital, setInitialCapital] = useState(10000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<BacktestResult | null>(null);

  // Indicator constraints
  const [stopLoss, setStopLoss] = useState(1.2);
  const [takeProfit, setTakeProfit] = useState(3.5);
  const [maxDrawdown, setMaxDrawdown] = useState(4.5);
  const [leverage, setLeverage] = useState(3);
  const [minVpinThreshold, setMinVpinThreshold] = useState(0.70);

  const triggerSimulation = () => {
    setIsSimulating(true);
    setResults(null);

    const config: BacktestConfig = {
      strategy,
      exchange,
      pair,
      days,
      initialCapital,
      riskParams: {
        stopLoss,
        takeProfit,
        maxDrawdown,
        leverage,
        minVpinThreshold
      }
    };

    // Simulate duration
    setTimeout(() => {
      onRunBacktest(config, (res) => {
        setResults(res);
        setIsSimulating(false);
      });
    }, 1500); // realistic load wait is visually premium
  };

  // Compute SVG Plot coordinates for equity curve graph
  const getEquityPlotPoints = (trades: any[]) => {
    if (trades.length === 0) return "";
    let currentBal = initialCapital;
    const balances = [currentBal];
    trades.forEach(t => {
      currentBal += t.profit;
      balances.push(currentBal);
    });

    const minB = Math.min(...balances);
    const maxB = Math.max(...balances);
    const range = maxB - minB || 1.0;

    const width = 500;
    const height = 110;

    return balances.map((bal, idx) => {
      const x = (idx / (balances.length - 1)) * (width - 20) + 10;
      const y = height - (((bal - minB) / range) * (height - 20) + 10);
      return `${x},${y}`;
    }).join(" ");
  };

  const getStrategyLabel = (strat: string) => {
    switch (strat) {
      case 'VPIN_TOXICITY_BREAKOUT': return 'VPIN Toxic Breakout Flow';
      case 'SPOOFING_REVERSAL': return 'Anti-Spoofing Order Reverser';
      case 'MARKET_MAKER_REBATE': return 'Direct Spread Maker';
      case 'SENTIMENT_MOMENTUM': return 'Sentiment Micro-Surger';
      default: return strat;
    }
  };

  return (
    <div id="historical-backtest-workbench" className="bg-[#07090e] border border-[#1e293b]/60 rounded-xl overflow-hidden p-5 shadow-xl font-mono text-[10px] text-gray-300">
      
      {/* Tab Header title */}
      <div className="flex items-center gap-2 mb-4 border-b border-[#1e2930]/40 pb-3">
        <TrendingUp className="w-5 h-5 text-emerald-400" />
        <div>
          <h4 className="text-xs tracking-wider text-emerald-400 uppercase font-semibold">Institutional Quantitative Backtest Workbench</h4>
          <p className="text-[9px] text-gray-500">Exhaustive Microsecond Back-testing Traversal Engine</p>
        </div>
      </div>

      {/* Grid section split: Left (configuration form), Right (analytical report outputs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Configuration Setup Form -- cols 4 */}
        <div className="lg:col-span-4 bg-[#0a0c10] border border-gray-800/60 p-4 rounded-xl space-y-3.5">
          <div className="font-bold text-white uppercase text-[10px] pb-1 border-b border-gray-800 flex items-center gap-1">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Simulation Parameters
          </div>

          <div>
            <label className="text-gray-500 block mb-1">Target Strategy Profile:</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as BotStrategy)}
              className="w-full bg-[#07090e] border border-gray-800 rounded px-2 py-1.5 focus:outline-none"
            >
              <option value="VPIN_TOXICITY_BREAKOUT">VPIN Micro-Toxicity Breakout</option>
              <option value="SPOOFING_REVERSAL">Anti-Spoofing Level Reversal</option>
              <option value="MARKET_MAKER_REBATE">Bid-Ask Microspread Collector</option>
              <option value="SENTIMENT_MOMENTUM">Orderbook Delta Momentum</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 block mb-1">Ex Interface:</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value as any)}
                className="w-full bg-[#07090e] border border-gray-800 rounded px-2 py-1.5 focus:outline-none"
              >
                <option value="binance">BINANCE</option>
                <option value="bybit">BYBIT</option>
                <option value="htx">HTX</option>
                <option value="kraken">KRAKEN</option>
              </select>
            </div>
            <div>
              <label className="text-gray-500 block mb-1">Contract pair:</label>
              <select
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="w-full bg-[#07090e] border border-gray-800 rounded px-2 py-1.5 focus:outline-none"
              >
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="ETH/USDT">ETH/USDT</option>
                <option value="SOL/USDT">SOL/USDT</option>
                <option value="BTC/EUR">BTC/EUR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 block mb-1">Test Scale Capital ($):</label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(parseInt(e.target.value) || 5000)}
                className="w-full bg-[#07090e] border border-gray-800 rounded px-2 py-1 focus:outline-none text-white font-semibold"
              />
            </div>
            <div>
              <label className="text-gray-500 block mb-1">Epoch Scale scope:</label>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 30)}
                className="w-full bg-[#07090e] border border-gray-800 rounded px-2 py-1.5 focus:outline-none"
              >
                <option value="7">7 Days (Short High Frequency)</option>
                <option value="30">30 Days (Standard Cycle)</option>
                <option value="90">90 Days (Quarter Season)</option>
              </select>
            </div>
          </div>

          {/* Indicator risk modifiers */}
          <div className="border-t border-gray-800/80 pt-3.5 space-y-3">
            <span className="text-[#a5b4fc] font-bold block text-[9px] uppercase tracking-wider">
              Technical Indicators & Risk Constraints
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 block mb-1">Stop Loss (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-[#07090e] border border-gray-800 rounded px-2 py-1 focus:outline-none text-white text-[9px]"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Take Profit (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 3.0)}
                  className="w-full bg-[#07090e] border border-gray-800 rounded px-2 py-1 focus:outline-none text-white text-[9px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 block mb-1">Max Level Leverage:</label>
                <input
                  type="number"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value) || 3)}
                  className="w-full bg-[#07090e] border border-gray-800 rounded px-2 py-1 focus:outline-none text-white text-[9px]"
                  min="1"
                  max="20"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Min VPIN boundary:</label>
                <input
                  type="number"
                  step="0.05"
                  value={minVpinThreshold}
                  onChange={(e) => setMinVpinThreshold(parseFloat(e.target.value) || 0.70)}
                  className="w-full bg-[#07090e] border border-gray-800 rounded px-2 py-1 focus:outline-none text-white text-[9px]"
                  min="0.10"
                  max="0.95"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            id="backtest-btn-simulate"
            onClick={triggerSimulation}
            disabled={isSimulating}
            className={`w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer uppercase transition ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSimulating ? 'Processing Micro ticks...' : 'Execute Backtest Traversal'}
          </button>
        </div>

        {/* Tactical Backtest outputs analytical panel -- cols 8 */}
        <div className="lg:col-span-8 flex flex-col justify-center min-h-[300px]">
          {isSimulating && (
            <div id="backtest-simulating-prompt" className="text-center p-10 bg-[#0c0f17] border border-gray-800 rounded-xl space-y-4 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
              <div>
                <h5 className="font-bold text-white text-xs">Simulating Histopath Block Traversals</h5>
                <p className="text-gray-500 text-[9px] mt-1">Reconstructing 30 days of microsecond limit order books, measuring VPIN index metrics, adverse flow levels, and spoof decoy sequences. Patience requested...</p>
              </div>
            </div>
          )}

          {!isSimulating && !results && (
            <div id="backtest-ready-prompt" className="text-center py-16 px-5 border border-dashed border-gray-800 bg-[#0c0f17]/40 rounded-xl">
              <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <h5 className="font-bold text-slate-400 text-xs">Historical Bench Is Idle</h5>
              <p className="text-gray-500 text-[9px] max-w-sm mx-auto mt-1">
                Configure strategy target criteria, then click "Execute Backtest Traversal". High-fidelity simulations will reconstruct metric trades instantly to show detailed portfolio outputs.
              </p>
            </div>
          )}

          {!isSimulating && results && (
            <div id="backtest-results-matrix" className="space-y-4 animate-fadeIn">
              
              {/* Backtest KPI Row card */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#0c0f17] border border-[#1e2930] p-3 rounded-xl">
                  <span className="text-gray-500 text-[8px] uppercase block tracking-wider mb-0.5">Yield Performance</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    +${results.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[9px] text-gray-400">({results.netProfitPct}% absolute return)</span>
                </div>
                
                <div className="bg-[#0c0f17] border border-[#1e2930] p-3 rounded-xl">
                  <span className="text-gray-500 text-[8px] uppercase block tracking-wider mb-0.5">Execution win count</span>
                  <div className="text-lg font-bold text-white font-mono">
                    {results.winRate.toFixed(1)}%
                  </div>
                  <span className="text-[9px] text-gray-400">{results.totalTrades} order matches executed</span>
                </div>

                <div className="bg-[#0c0f17] border border-[#1e2930] p-3 rounded-xl">
                  <span className="text-gray-500 text-[8px] uppercase block tracking-wider mb-0.5">Max Drawdown index</span>
                  <div className="text-lg font-bold text-red-400 font-mono">
                    -{results.maxDrawdown.toFixed(2)}%
                  </div>
                  <span className="text-[9px] text-gray-500">Sharpe ratio index: <strong className="text-white font-semibold">{results.sharpeRatio}</strong></span>
                </div>

                <div className="bg-[#0c0f17] border border-[#1e2930] p-3 rounded-xl">
                  <span className="text-gray-500 text-[8px] uppercase block tracking-wider mb-0.5">Risk signals avoided</span>
                  <div className="text-lg font-bold text-indigo-400 font-mono">
                    {results.spoofingIncidentsAvoided + results.manipulationDetections}
                  </div>
                  <span className="text-[9px] text-gray-500">Decoy spoofs: <strong className="text-indigo-300 font-semibold">{results.spoofingIncidentsAvoided}</strong></span>
                </div>
              </div>

              {/* Interactive Equity Chart SVG */}
              <div className="bg-[#0c0f17] border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-300">Equity Curve Simulation Trajectory</span>
                  <span className="text-[8px] uppercase text-gray-500">Initial: <strong className="text-slate-300">${results.initialBalance}</strong> / Final: <strong className="text-emerald-400">${results.finalBalance}</strong></span>
                </div>
                <div className="h-28 w-full bg-[#08090d] border border-gray-900 rounded p-1">
                  <svg className="w-full h-full" viewBox="0 0 500 110" preserveAspectRatio="none">
                    {/* Grids */}
                    <line x1="0" y1="10" x2="500" y2="10" stroke="#111827" strokeWidth="0.5" />
                    <line x1="0" y1="55" x2="500" y2="55" stroke="#111827" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#111827" strokeWidth="0.5" />
                    
                    {/* Equity Line */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.8"
                      points={getEquityPlotPoints(results.trades)}
                    />
                  </svg>
                </div>
              </div>

              {/* Executed Trades ledger table inside backtest */}
              <div className="bg-[#0c0f17] border border-gray-800 rounded-xl p-4 flex flex-col">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-bold text-slate-300">Detailed Backtest Trade Transcripts (Latest 5 of {results.trades.length})</span>
                  <span className="text-[8px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 border border-indigo-500/20 rounded font-semibold uppercase">Microscope logs synchronized</span>
                </div>
                <div className="overflow-y-auto max-h-[140px] space-y-2">
                  {results.trades.slice(-5).reverse().map((t, idx) => {
                    const isProfit = t.profit >= 0;
                    return (
                      <div 
                        key={`b_trade_${idx}`} 
                        className="bg-[#07090e] border border-[#1e2930]/40 rounded p-2 flex justify-between items-center"
                      >
                        <div className="flex gap-2 items-center">
                          <span className={`px-1 rounded uppercase font-bold text-[8px] ${t.side === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {t.side}
                          </span>
                          <div>
                            <span className="text-white font-semibold block">${t.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <span className="text-gray-500 text-[8px] block">Size: {t.amount.toFixed(4)} UNITS</span>
                          </div>
                        </div>

                        {/* Middle anomalies avoid tracking */}
                        <div className="hidden md:flex gap-1">
                          {t.anomaliesDetected.map((an: string) => (
                            <span key={an} className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[7px] font-bold px-1 rounded">
                              SHIELDED:{an}
                            </span>
                          ))}
                          {t.anomaliesDetected.length === 0 && (
                            <span className="text-gray-600 text-[8px]">Clean structural feed</span>
                          )}
                        </div>

                        {/* Right: absolute return logs */}
                        <div className="text-right">
                          <span className={`font-bold block ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}${t.profit.toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-[8px]">VPIN index: <strong className="text-slate-300">{(t.vpin * 100).toFixed(0)}%</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

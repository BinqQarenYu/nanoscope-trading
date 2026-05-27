import React, { useState } from 'react';
import { TradingBot, BotStrategy, RiskParams, ActivityLog } from '../types';
import { PlusCircle, Bot, Globe, ShieldCheck, ToggleLeft, ToggleRight, Trash2, Shield, TrendingUp, AlertCircle } from 'lucide-react';

interface BotDashboardProps {
  bots: TradingBot[];
  portfolio: {
    totalUsdValue: number;
    initialUsdValue: number;
    netProfit: number;
    profitPct: number;
    balances: Record<string, { usd: number, btc: number, eth: number }>;
  };
  logs: ActivityLog[];
  onCreateBot: (botData: any) => void;
  onToggleBot: (id: string) => void;
  onDeleteBot: (id: string) => void;
}

export default function BotDashboard({
  bots,
  portfolio,
  logs,
  onCreateBot,
  onToggleBot,
  onDeleteBot
}: BotDashboardProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [exchange, setExchange] = useState<'htx' | 'binance' | 'bybit' | 'kraken'>('binance');
  const [pair, setPair] = useState('BTC/USDT');
  const [strategy, setStrategy] = useState<BotStrategy>('VPIN_TOXICITY_BREAKOUT');
  const [startingBalance, setStartingBalance] = useState('5000');
  
  // Risk Params
  const [stopLoss, setStopLoss] = useState('1.5');
  const [takeProfit, setTakeProfit] = useState('4.0');
  const [maxDrawdown, setMaxDrawdown] = useState('5.0');
  const [leverage, setLeverage] = useState('3');
  const [minVpinThreshold, setMinVpinThreshold] = useState('0.72');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateBot({
      name,
      exchange,
      pair,
      strategy,
      startingBalance,
      riskParams: {
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit),
        maxDrawdown: parseFloat(maxDrawdown),
        leverage: parseInt(leverage),
        minVpinThreshold: parseFloat(minVpinThreshold)
      }
    });

    // Reset Form
    setName('');
    setShowCreateForm(false);
  };

  const getExchangeLogoClass = (exch: string) => {
    switch (exch) {
      case 'binance': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'bybit': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'htx': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'kraken': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      
      {/* LEFT COLUMN: Real-time Multi-exchange Portfolio tracker & Bot builder -- cols 7 */}
      <div className="xl:col-span-7 flex flex-col gap-5">
        
        {/* Real-time Multi-Exchange Portfolio Balances */}
        <div id="portfolio-monitor-card" className="bg-[#07090e] border border-[#1e293b]/60 rounded-xl overflow-hidden p-5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-xs font-mono tracking-wider text-emerald-400 uppercase font-semibold">Real-Time Multi-Exchange Portfolio</h4>
                <p className="text-[10px] text-gray-500 font-mono">24/7 Consolidated Execution Balances</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-gray-500 text-[10px] uppercase">Microsecond Net Value</span>
              <div className="text-2xl font-bold font-mono text-white">
                ${portfolio.totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Core high-level profits timeline */}
          <div className="grid grid-cols-3 gap-3 font-mono text-[10px] border-b border-[#1e2930]/40 pb-4 mb-4">
            <div className="bg-[#0c0f17] p-2 rounded-lg border border-gray-800/40">
              <span className="text-gray-500 uppercase text-[9px]">Consolidated Profit:</span>
              <div className={`text-sm font-bold mt-0.5 ${portfolio.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {portfolio.netProfit >= 0 ? '+' : ''}${portfolio.netProfit.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#0c0f17] p-2 rounded-lg border border-gray-800/40">
              <span className="text-gray-500 uppercase text-[9px]">Absolute yield pct:</span>
              <div className={`text-sm font-bold mt-0.5 ${portfolio.profitPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {portfolio.profitPct >= 0 ? '+' : ''}{portfolio.profitPct.toFixed(2)}%
              </div>
            </div>
            <div className="bg-[#0c0f17] p-2 rounded-lg border border-gray-800/40 animate-pulse">
              <span className="text-gray-500 uppercase text-[9px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                API Heartbeats / Connection:
              </span>
              <div className="text-sm font-bold text-white mt-0.5">HTX / BIN / BYB / KRK</div>
            </div>
          </div>

          {/* Specific balance splits per exchange grid */}
          <div id="exchange-balance-blocks" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono text-[10px]">
            {Object.entries(portfolio.balances).map(([exchangeName, item]) => {
              const activeOnThis = bots.filter(b => b.exchange === exchangeName && b.status === 'active').length;
              return (
                <div 
                  key={exchangeName} 
                  className="bg-[#0c0f17]/85 border border-[#1e2930]/60 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="capitalize font-bold text-slate-300 tracking-wide text-[11px]">{exchangeName}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded border ${getExchangeLogoClass(exchangeName)}`}>
                      {activeOnThis} Live Bot
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block">Available margin index</span>
                    <span className="text-white font-semibold text-xs">${item.usd.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                  </div>
                  <div className="mt-2 border-t border-slate-800 pt-1.5 flex justify-between text-gray-400 text-[8px]">
                    <span>{item.btc.toFixed(2)} BTC</span>
                    <span>{item.eth.toFixed(1)} ETH</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Existing Created Bots list and Control panel */}
        <div id="automated-scheduler-card" className="bg-[#07090e] border border-[#1e293b]/60 rounded-xl overflow-hidden p-5 shadow-xl flex-1">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-xs font-mono tracking-wider text-indigo-400 uppercase font-semibold">Automated AI Bot Registers</h4>
                <p className="text-[10px] text-gray-500 font-mono">Microsecond Quantitative Risk Managers</p>
              </div>
            </div>
            
            <button 
              id="dashboard-btn-toggle-create"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white font-mono rounded-lg text-[10px] font-bold cursor-pointer uppercase tracking-tight transition duration-150 shadow-md shadow-indigo-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              {showCreateForm ? 'Abort Setup' : 'Create Bot'}
            </button>
          </div>

          {/* Form to construct new automated trader bot */}
          {showCreateForm && (
            <form id="create-bot-form" onSubmit={handleSubmit} className="bg-[#0c0f17] border border-indigo-500/20 rounded-xl p-4 font-mono text-[10px] text-gray-300 space-y-3.5 mb-5 animate-fadeIn">
              <div className="font-bold text-[#b4c6ef] border-b border-[#1e293b]/50 pb-1 text-xs uppercase tracking-wide">
                Initialize Automated 24/7 Quantum Microsecond Trader
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label id="lbl-bot-name" className="text-gray-500 block mb-1">Algorithmic Title Name:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. BTC Spoof Hunter" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#07090e] border border-gray-800 rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label id="lbl-bot-exch" className="text-gray-500 block mb-1">Target Exchange Interface:</label>
                  <select 
                    value={exchange}
                    onChange={(e) => setExchange(e.target.value as any)}
                    className="w-full bg-[#07090e] border border-gray-800 rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="binance">BINANCE (LOB Active)</option>
                    <option value="bybit">BYBIT (VPIN Optimized)</option>
                    <option value="htx">HTX (High Latency Delta)</option>
                    <option value="kraken">KRAKEN (SRE Cushioned)</option>
                  </select>
                </div>
                <div>
                  <label id="lbl-bot-pair" className="text-gray-500 block mb-1">Currency Pair Contract:</label>
                  <select
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    className="w-full bg-[#07090e] border border-gray-800 rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="BTC/USDT">BTC/USDT (Dynamic)</option>
                    <option value="ETH/USDT">ETH/USDT (Dynamic)</option>
                    <option value="SOL/USDT">SOL/USDT (Anomaly-Heavy)</option>
                    <option value="BTC/EUR">BTC/EUR (Cushioned)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label id="lbl-bot-strat" className="text-gray-500 block mb-1">Automated Strategy Core:</label>
                  <select 
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value as any)}
                    className="w-full bg-[#07090e] border border-gray-800 rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="VPIN_TOXICITY_BREAKOUT">VPIN Micro-Toxicity Breakout</option>
                    <option value="SPOOFING_REVERSAL">Anti-Spoofing Level Reversal</option>
                    <option value="MARKET_MAKER_REBATE">Bid-Ask Microspread Collector</option>
                    <option value="SENTIMENT_MOMENTUM">Orderbook Delta Momentum</option>
                  </select>
                </div>
                <div>
                  <label id="lbl-bot-cap" className="text-gray-500 block mb-1">Starting Allocation Capital (USD):</label>
                  <input 
                    type="number" 
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(e.target.value)}
                    className="w-full bg-[#07090e] border border-gray-800 rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-indigo-500"
                    min="100"
                    max="100000"
                    required
                  />
                </div>
                <div>
                  <label id="lbl-bot-vpin" className="text-gray-500 block mb-1">VPIN Adverse Safe Threshold (0.01-0.95):</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    value={minVpinThreshold}
                    onChange={(e) => setMinVpinThreshold(e.target.value)}
                    className="w-full bg-[#07090e] border border-gray-800 rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-indigo-500"
                    min="0.10"
                    max="0.95"
                  />
                </div>
              </div>

              {/* Automated Risk parameters controls */}
              <div className="bg-[#07090e] p-3 rounded-lg border border-indigo-500/10 space-y-2">
                <span className="text-emerald-400 font-bold block pb-1 border-b border-gray-800/40 text-[9px] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Automated Pre-Execution Risk Management limits
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label id="lbl-risk-sl" className="text-gray-500 block text-[9px] mb-1">Stop Loss limit (%):</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full bg-[#0c0f17] border border-gray-800 rounded px-1.5 py-1 font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label id="lbl-risk-tp" className="text-gray-500 block text-[9px] mb-1">Take Profit trigger (%):</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="w-full bg-[#0c0f17] border border-gray-800 rounded px-1.5 py-1 font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label id="lbl-risk-dd" className="text-gray-500 block text-[9px] mb-1">Max Drawdown risk stop (%):</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      value={maxDrawdown}
                      onChange={(e) => setMaxDrawdown(e.target.value)}
                      className="w-full bg-[#0c0f17] border border-gray-800 rounded px-1.5 py-1 font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label id="lbl-risk-lev" className="text-gray-500 block text-[9px] mb-1">Target Leverage multiplier:</label>
                    <input 
                      type="number" 
                      value={leverage}
                      onChange={(e) => setLeverage(e.target.value)}
                      className="w-full bg-[#0c0f17] border border-gray-800 rounded px-1.5 py-1 font-mono text-white focus:outline-none"
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end">
                <button 
                  type="button" 
                  id="bot-form-cancel"
                  onClick={() => setShowCreateForm(false)} 
                  className="px-3 py-1.5 border border-slate-700 bg-[#07090e] rounded cursor-pointer hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  id="bot-form-submit"
                  className="px-4 py-1.5 bg-emerald-600 font-bold text-white rounded cursor-pointer hover:bg-emerald-700 transition"
                >
                  Launch Quantum Trader
                </button>
              </div>
            </form>
          )}

          {/* Bots dynamic grid deck */}
          <div id="bots-grid-deck" className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {bots.length > 0 ? (
              bots.map((bot) => {
                const isProfitable = bot.profitPct >= 0;
                return (
                  <div 
                    key={bot.id} 
                    className={`bg-[#0c0f17] border rounded-xl p-4 font-mono text-[10px] transition duration-150 ${bot.status === 'active' ? 'border-[#1e293b]/80' : 'border-gray-800 opacity-60'}`}
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 border-b border-gray-800/40 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${bot.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                        <span className="text-white font-bold text-[11px] tracking-wide">{bot.name}</span>
                        <span className="text-[8px] bg-[#1a2333] px-1.5 rounded uppercase font-semibold text-indigo-400">
                          {bot.strategy.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold border rounded uppercase ${getExchangeLogoClass(bot.exchange)}`}>
                          {bot.exchange} / {bot.pair}
                        </span>

                        <div className="flex gap-2">
                          <button 
                            id={`bot-[${bot.id}]-toggle`}
                            onClick={() => onToggleBot(bot.id)}
                            className="text-gray-400 hover:text-white cursor-pointer"
                            title={bot.status === 'active' ? "Pause automated trading" : "Activate 24/7 scanning"}
                          >
                            {bot.status === 'active' ? (
                              <ToggleRight className="w-5.5 h-5.5 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="w-5.5 h-5.5 text-gray-500" />
                            )}
                          </button>
                          
                          <button 
                            id={`bot-[${bot.id}]-delete`}
                            onClick={() => onDeleteBot(bot.id)}
                            className="text-gray-400 hover:text-rose-500 cursor-pointer"
                            title="Decommission bot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bot balance statistics columns */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-gray-400">
                      <div>
                        <span>Asset Net Worth:</span>
                        <span className="block text-white font-semibold text-xs mt-0.5">
                          ${bot.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span>Execution Profits:</span>
                        <span className={`block font-bold text-xs mt-0.5 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfitable ? '+' : ''}{bot.profitPct.toFixed(3)}%
                        </span>
                      </div>
                      <div>
                        <span>Total trades processed:</span>
                        <span className="block text-slate-300 font-semibold mt-0.5">{bot.numTrades} executions</span>
                      </div>
                      <div className="bg-[#07090e]/80 p-1 px-2 rounded border border-gray-800/40 text-[9px]">
                        <span className="text-[8px] text-gray-500 block uppercase">Risk Guard limits:</span>
                        <div className="flex gap-1.5 text-gray-400 mt-0.5">
                          <span>LEV: <strong className="text-white">{bot.riskParams.leverage}x</strong></span>
                          <span>SL: <strong className="text-rose-500">-{bot.riskParams.stopLoss}%</strong></span>
                          <span>TP: <strong className="text-emerald-500">+{bot.riskParams.takeProfit}%</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div id="bots-empty-states" className="text-center py-10 text-gray-500 text-[10px] font-mono border border-dashed border-gray-800 rounded-lg">
                No quantum traders defined. Standard simulation running under resting reserve configurations. Click top right Create Bot to register strategy!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Real-time telemetry feed and system activities -- cols 5 */}
      <div className="xl:col-span-5 flex flex-col gap-5">
        
        {/* Real-time Orderflow Activities & Telemetry logs */}
        <div id="telemetry-logs-card" className="bg-[#07090e] border border-[#1e293b]/60 rounded-xl overflow-hidden p-5 shadow-xl flex flex-col h-full min-h-[460px]">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-xs font-mono tracking-wider text-indigo-400 uppercase font-semibold">24/7 Automated Risk & Log Telemetry</h4>
              <p className="text-[10px] text-gray-500 font-mono">Real-time Orderflow Parser Outputs</p>
            </div>
          </div>

          {/* Activity Logs chronological feed */}
          <div id="logs-chronology" className="flex-1 space-y-3.5 overflow-y-auto max-h-[380px] font-mono text-[10px] pr-1">
            {logs.length > 0 ? (
              [...logs].reverse().map((log) => {
                const flagColor = {
                  trade: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  anomaly: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse',
                  system: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                  risk: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                };
                
                return (
                  <div 
                    key={log.id} 
                    className={`p-2.5 rounded-lg border flex gap-2 items-start transition duration-150 ${flagColor[log.type]}`}
                  >
                    <div className="shrink-0 mt-0.5 font-bold uppercase text-[7px] tracking-wider px-1 py-0.5 rounded bg-black/50 border border-current">
                      {log.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[8px] text-gray-500 mb-0.5 font-bold">
                        <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className="uppercase">{log.exchange || 'ALL'} : {log.pair || 'BTC/USDT'}</span>
                      </div>
                      <p className="text-slate-300 text-[9px] leading-relaxed break-words">{log.message}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div id="logs-empty-states" className="text-center py-16 text-gray-500 text-[10px] font-mono rounded">
                Telemetry streams are pending... Activating microscopic trackers on local feed.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

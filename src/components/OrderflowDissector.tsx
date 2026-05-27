import React, { useState } from 'react';
import { MarketState, OrderBookLevel } from '../types';
import { ShieldAlert, BookOpen, Layers, BarChart3, AlertOctagon, HelpCircle, Activity, ChevronRight } from 'lucide-react';

interface OrderflowDissectorProps {
  marketState: MarketState;
}

export default function OrderflowDissector({ marketState }: OrderflowDissectorProps) {
  const [selectedScienceTab, setSelectedScienceTab] = useState<'microstructure' | 'vpin_math' | 'spoofing_science' | 'toxicity'>('microstructure');
  const [interactiveOrderDissect, setInteractiveOrderDissect] = useState<OrderBookLevel | null>(null);

  // Helper colors for spoofing score levels
  const getSpoofingAlertColor = (level: number) => {
    if (level > 0.8) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (level > 0.5) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-slate-400';
  };

  return (
    <div id="orderflow-dissect-panel" className="bg-[#07090e] border border-[#1e293b]/60 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Dissector Tab Navigator Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e2930]/40 bg-[#0c0f17] shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 className="text-xs font-mono tracking-wider text-indigo-400 uppercase font-semibold">Microscopic Orderflow Dissector</h4>
            <p className="text-[10px] text-gray-500 font-mono">Microstructure Science & "Nanoscope" Anomaly Parse Engine</p>
          </div>
        </div>

        {/* Live Metrics Overlay indicators */}
        <div className="flex gap-2 text-[10px] font-mono">
          <div className="bg-[#111827] border border-gray-800 rounded px-2 py-0.5 flex items-center gap-1.5 text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SPREAD: <span className="text-white font-semibold">${marketState.spread}</span>
          </div>
          <div className="bg-[#1e1b4b]/30 border border-indigo-500/20 rounded px-2 py-0.5 flex items-center gap-1.5 text-indigo-300">
            <span>VPIN:</span>
            <span className="font-semibold text-white">{(marketState.vpin * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Main split dashboard: Left (Book Grid and Dissection Details), Right (Microstructure Science Module) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 flex-1 overflow-y-auto">
        
        {/* Left Column (LOB Visual & Spoof Alert logs) - cols 7 */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* LOB Level Grid Card */}
          <div className="bg-[#0c0f17]/95 border border-[#1e293b]/30 rounded-xl p-4 flex flex-col flex-1 min-h-[350px]">
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                Live Limit Orderbook (2-Side Depth)
              </h5>
              <div className="text-[9px] font-mono text-gray-500">
                Click level to dissect microstructure
              </div>
            </div>

            {/* Depth visual comparison bars */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono flex-1">
              
              {/* ASK SIDE (Red - Sellers) - sorted desc by price to stack top */}
              <div className="flex flex-col gap-1 pr-1 border-r border-[#1e2930]/30 mr-1">
                <div className="grid grid-cols-3 text-slate-400 font-semibold border-b border-rose-950/20 pb-1 text-right mb-1">
                  <span>Price</span>
                  <span>Amount</span>
                  <span>Cum Size</span>
                </div>
                {[...marketState.asks].slice(0, 8).reverse().map((ask, idx) => {
                  const sizePct = Math.min((ask.amount / 12) * 100, 100);
                  const isSpoof = ask.spoofingValue > 0.65;
                  
                  return (
                    <div 
                      key={`ask_${idx}`}
                      onClick={() => setInteractiveOrderDissect(ask)}
                      className={`grid grid-cols-3 text-right py-0.5 px-1 rounded transition duration-150 cursor-pointer ${isSpoof ? 'bg-rose-500/10 hover:bg-rose-500/25' : 'hover:bg-slate-800/50'}`}
                    >
                      <span className={`font-semibold ${isSpoof ? 'text-rose-400 font-bold' : 'text-rose-500'}`}>
                        ${ask.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-gray-300">{ask.amount.toFixed(3)}</span>
                      <span className="text-gray-500 relative">
                        {ask.cumulativeAmount.toFixed(1)}
                        {/* depth meter indicator */}
                        <div 
                          className={`absolute right-0 bottom-0 top-0 opacity-10 ${isSpoof ? 'bg-amber-500' : 'bg-rose-500'}`} 
                          style={{ width: `${sizePct}%` }}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* BID SIDE (Green - Buyers) - sorted desc price to stack bottom */}
              <div className="flex flex-col gap-1 pl-1">
                <div className="grid grid-cols-3 text-slate-400 font-semibold border-b border-emerald-950/20 pb-1 text-left mb-1">
                  <span>Cum Size</span>
                  <span className="text-right">Amount</span>
                  <span className="text-right">Price</span>
                </div>
                {[...marketState.bids].slice(0, 8).map((bid, idx) => {
                  const sizePct = Math.min((bid.amount / 12) * 100, 100);
                  const isSpoof = bid.spoofingValue > 0.65;
                  
                  return (
                    <div 
                      key={`bid_${idx}`}
                      onClick={() => setInteractiveOrderDissect(bid)}
                      className={`grid grid-cols-3 py-0.5 px-1 rounded transition duration-150 cursor-pointer ${isSpoof ? 'bg-amber-500/10 hover:bg-amber-500/25' : 'hover:bg-slate-800/50'}`}
                    >
                      <span className="text-gray-500 relative text-left">
                        {/* depth background meter */}
                        <div 
                          className={`absolute left-0 bottom-0 top-0 opacity-10 ${isSpoof ? 'bg-red-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${sizePct}%` }}
                        />
                        {bid.cumulativeAmount.toFixed(1)}
                      </span>
                      <span className="text-gray-300 text-right">{bid.amount.toFixed(3)}</span>
                      <span className={`font-semibold text-right ${isSpoof ? 'text-amber-400 font-bold' : 'text-emerald-500'}`}>
                        ${bid.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Selected Level Micro-dissection pane */}
            {interactiveOrderDissect ? (
              <div id="interactive-lob-dissect" className="mt-4 p-3 rounded-lg bg-[#0e1628] border border-blue-500/20 text-[10px] font-mono leading-relaxed">
                <div className="flex justify-between items-center border-b border-slate-700/35 pb-1.5 mb-2">
                  <span className="text-blue-400 font-bold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Level Dissect Spec: ${interactiveOrderDissect.price}
                  </span>
                  <button 
                    onClick={() => setInteractiveOrderDissect(null)}
                    className="text-[9px] bg-slate-800 hover:bg-slate-700 text-gray-400 scroll-px-1 rounded px-1.5 py-0.5 cursor-pointer"
                  >
                    Clear HUD
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-300">
                  <div>
                    <span className="text-gray-500 block">Resting Weight:</span> 
                    <span className="font-semibold text-white">{interactiveOrderDissect.amount} units</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Direct Order Count:</span> 
                    <span className="font-semibold text-white">{interactiveOrderDissect.orderCount} independent lots</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Symmetry Delta Score:</span> 
                    <span className="font-semibold text-white">{(interactiveOrderDissect.cumulativeAmount / 1.5).toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Spoof Prob Index:</span> 
                    <span className={`font-bold ${interactiveOrderDissect.spoofingValue > 0.65 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {(interactiveOrderDissect.spoofingValue * 100).toFixed(0)}% Likelihood
                    </span>
                  </div>
                </div>
                {interactiveOrderDissect.spoofingValue > 0.65 ? (
                  <div className="mt-2 text-amber-500 bg-amber-500/10 border border-amber-500/20 p-1 px-2 rounded font-mono text-[9px] leading-relaxed">
                    <strong>MICRO-ALERT</strong>: This block possesses high Cancelation-to-Execution probability. Resting order size is structurally mismatched compared to historical normal trading velocity at this tick level. Action: Potential false pricing. Do not leverage scalp near this.
                  </div>
                ) : (
                  <div className="mt-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-1 px-2 rounded font-mono text-[9px] leading-relaxed">
                    <strong>CRITICAL DEPTH INTEGRITY</strong>: Solid resting matching block. Symmetric order size density supports genuine limit backing. This provides a clean cushion layer.
                  </div>
                )}
              </div>
            ) : (
              <div id="dissect-hud-prompt" className="mt-4 p-3 rounded-lg bg-[#0a0d14] border border-gray-800 text-[10px] font-mono text-center text-gray-500">
                Provide real-time telemetry: Click any bid/ask row above to inspect local depth parameters.
              </div>
            )}
          </div>

          {/* VPIN Gauge Chart Metrics */}
          <div className="bg-[#0c0f17]/95 border border-[#1e293b]/30 rounded-xl p-4">
            <h5 className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              VPIN & Liquidity Imbalance Matrix
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10px] text-gray-400">
              
              {/* Dial 1: VPIN */}
              <div className="bg-[#0f121a]/60 p-3 rounded-lg border border-[#1e2930]/40 flex flex-col items-center">
                <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-2">VPIN Toxicity</span>
                <div className="relative w-24 h-12 flex items-end justify-center overflow-hidden">
                  {/* Gauge arch */}
                  <div className="absolute inset-0 border-4 border-gray-800 rounded-t-full"></div>
                  <div 
                    className="absolute inset-0 border-4 rounded-t-full transition-all duration-300"
                    style={{ 
                      borderColor: marketState.vpin > 0.70 ? '#ef4444' : marketState.vpin > 0.45 ? '#f59e0b' : '#10b981',
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
                      transform: `rotate(${(marketState.vpin * 180) - 180}deg)`,
                      transformOrigin: 'bottom center'
                    }}
                  ></div>
                  <span className="text-xl font-bold text-white z-10">{(marketState.vpin * 100).toFixed(0)}%</span>
                </div>
                <span className={`mt-2 font-bold uppercase text-[9px] ${marketState.vpin > 0.70 ? 'text-rose-400' : marketState.vpin > 0.45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {marketState.vpin > 0.70 ? 'Informative Poison' : marketState.vpin > 0.45 ? 'Elevated Adverse' : 'Optimal Matching'}
                </span>
              </div>

              {/* Dial 2: Imbalance */}
              <div className="bg-[#0f121a]/60 p-3 rounded-lg border border-[#1e2930]/40 flex flex-col items-center">
                <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-2">Order Imbalance (OBI)</span>
                <div className="relative w-full h-12 flex flex-col justify-center items-center px-4">
                  {/* Linear slide bar */}
                  <div className="w-full h-1.5 bg-gray-800 rounded-full relative">
                    <div 
                      className="absolute h-3 w-3 rounded-full bg-indigo-500 top-1/2 -translate-y-1/2 transition-all duration-300"
                      style={{ left: `${((marketState.orderImbalance + 1) / 2) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between w-full text-[8px] text-gray-600 mt-2.5">
                    <span>SELL OBI</span>
                    <span>NEUTRAL</span>
                    <span>BUY OBI</span>
                  </div>
                </div>
                <span className="text-white font-bold text-xs mt-1">{(marketState.orderImbalance * 100).toFixed(0)}% Imbalance</span>
              </div>

              {/* Metric 3: Nanoscope Stats */}
              <div className="bg-[#0f121a]/60 p-3 rounded-lg border border-[#1e2930]/40 flex flex-col justify-between">
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-1">Spread Latency</span>
                  <div className="text-white font-bold text-sm">{(marketState.spread * 1.25).toFixed(4)} ms</div>
                </div>
                <div className="mt-2 border-t border-slate-800 pt-1.5">
                  <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-0.5">VolImb Factor</span>
                  <div className="text-indigo-400 font-semibold text-xs">{(Math.abs(marketState.orderImbalance) * 4.2).toFixed(3)} V/R</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (Microstructure Information and "Nanoscope" parser logs) - cols 5 */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Scientific "Nanoscope" Anomaly parsing ledger */}
          <div className="bg-[#0c0f17]/95 border border-[#1e293b]/30 rounded-xl p-4 flex flex-col flex-1 h-full min-h-[220px]">
            <h5 className="text-[11px] font-mono font-bold tracking-wider text-rose-400 uppercase mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Nanoscope Real-time Anomaly Parse Feed
            </h5>

            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[190px] pr-1">
              {marketState.detectedAnomalies.length > 0 ? (
                marketState.detectedAnomalies.map((anom, idx) => {
                  const severityColors = {
                    low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    high: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                    critical: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20 animate-pulse'
                  };
                  
                  return (
                    <div 
                      key={`anom_${idx}`}
                      className={`p-2.5 rounded-lg border text-[10px] font-mono leading-relaxed ${severityColors[anom.severity]}`}
                    >
                      <div className="flex justify-between items-center mb-1 font-bold">
                        <span className="flex items-center gap-1">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          {anom.type} SEQUENCE DETECTED
                        </span>
                        <span className="uppercase text-[8px] tracking-wide px-1 rounded bg-black/40">
                          {anom.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[9px] mt-0.5 leading-snug">
                        {anom.description}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div id="nanoscope-empty-states" className="text-center py-7 text-gray-500 text-[10px] font-mono border border-dashed border-gray-800 rounded-lg">
                  Scanning micro-blocks... No passive/active anomalies detected in this epoch frame.
                </div>
              )}
            </div>
          </div>

          {/* Microstructure Science Academy Navigation */}
          <div className="bg-[#0c0f17]/95 border border-[#1e293b]/30 rounded-xl p-4 flex flex-col h-full min-h-[250px]">
            <h5 className="text-[11px] font-mono font-bold tracking-wider text-indigo-400 uppercase mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Microstructure Academy & Theory
            </h5>

            {/* Sub Science tab navigations */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#07090e] border border-slate-800 rounded-lg text-[9px] font-mono mb-3 uppercase tracking-tight shrink-0">
              {(['microstructure', 'vpin_math', 'spoofing_science', 'toxicity'] as const).map(tab => {
                const names = {
                  microstructure: 'Book',
                  vpin_math: 'VPIN Math',
                  spoofing_science: 'Spoofing',
                  toxicity: 'Adverse'
                };
                return (
                  <button
                    key={tab}
                    id={`sci-tab-${tab}`}
                    onClick={() => setSelectedScienceTab(tab)}
                    className={`py-1 text-center font-bold px-1 rounded transition cursor-pointer ${selectedScienceTab === tab ? 'bg-indigo-500/20 text-indigo-300 shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {names[tab]}
                  </button>
                );
              })}
            </div>

            {/* Science Content Output Renderer */}
            <div id="science-contents-reader" className="text-[10px] font-mono text-gray-400 leading-relaxed overflow-y-auto max-h-[170px] pr-1">
              {selectedScienceTab === 'microstructure' && (
                <div className="space-y-2">
                  <p className="text-white font-bold">The Science of Limit Orderbooks (LOB)</p>
                  <p>
                    At nanosecond scales, markets represent dynamic queues. Each tick is governed by the <strong>matching engine</strong> prioritizing prices then arrival sequence (FIFO).
                  </p>
                  <p>
                    Market makers place passive <strong>limit orders</strong> to capture spreads, taking adverse selection risk. Aggressive <strong>market orders</strong> absorb this liquidity instantaneously.
                  </p>
                </div>
              )}

              {selectedScienceTab === 'vpin_math' && (
                <div className="space-y-2">
                  <p className="text-indigo-300 font-bold">Volume Imbalance & Toxicity Formula</p>
                  <p className="bg-black/40 p-2 border border-slate-800 rounded text-center font-semibold text-white my-1">
                    VPIN = Σ_τ |V_τ^Buy - V_τ^Sell| / (N × V)
                  </p>
                  <p>
                    <strong>VPIN</strong> measures toxicity by segmenting trade flows into equal-volume buckets. If trades are perfectly balanced, VPIN is zero. 
                  </p>
                  <p>
                    As directional volume clustering dominates, the index escalates. High readings warn that retail market makers are providing liquidity, bleeding capital to informed high-frequency algorithms.
                  </p>
                </div>
              )}

              {selectedScienceTab === 'spoofing_science' && (
                <div className="space-y-2">
                  <p className="text-amber-400 font-bold">Microsecond Spoofing Frameworks</p>
                  <p>
                    <strong>Spoofing</strong> involves placing massive limit orders without intent to execute, to lure market participants.
                  </p>
                  <p>
                    As price levels head toward the spoof, high-speed cancel commands trigger. The "nanoscope" monitors the <strong>decay cycle</strong> of bid/ask blocks to flag this synthetic depth before bots get trapped.
                  </p>
                </div>
              )}

              {selectedScienceTab === 'toxicity' && (
                <div className="space-y-2">
                  <p className="text-rose-400 font-bold">Flow Poisoning & Adverse Selection</p>
                  <p>
                    Flow toxicity occurs when market orders represent highly correlated asymmetric positions. This suggests institutional algorithms have localized pricing gaps before retail matching layers can adjust.
                  </p>
                  <p>
                    By tracking volume imbalance velocity, our system lets bots dynamically withdraw liquidity or adjust stop bounds prior to massive cascades.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

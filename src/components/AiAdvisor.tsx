import React, { useState } from 'react';
import { MarketState } from '../types';
import { Send, Bot, Terminal, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AiAdvisorProps {
  currentMarketState: MarketState;
}

export default function AiAdvisor({ currentMarketState }: AiAdvisorProps) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai', text: string, model?: string }>>([
    {
      sender: 'ai',
      text: `### Microscopic Quant AI Sentinel Active 🌐

Excellent. I am synchronized with your **HTX, Binance, Bybit, and Kraken** orderbook streams. 

You can ask me to evaluate current microscopic anomalies, explain **"VPIN Informed Toxicity"** math formulations, or optimize stop boundaries under heavy spoof cancelation sequences.

Pick a quick analysis or type your microscopic orderflow questions below!`,
      model: "Socrates-Quant-Simulator-v2"
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const triggerQuery = async (userText: string) => {
    if (!userText.trim() || isRunning) return;

    setIsRunning(true);
    // Append user message
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setQuery('');

    try {
      const response = await fetch('/api/orderflow/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          marketSnapshot: currentMarketState
        })
      });

      const data = await response.json();
      
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: data.analysis || "Microstructure query parsing error. Please verify server integrity.",
        model: data.modelUsed
      }]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: `### Connection Error ⚠️\n\nFailed to dispatch API stream packets: ${err.message}. Please restart dev server and confirm connectivity.`,
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerQuery(query);
  };

  const quickPills = [
    { label: "Analyze Spoofing Threats", q: "Evaluate current spoofing threat levels on this snapshot. How do we flag fake depth?" },
    { label: "VPIN Mathematical Explanation", q: "Write down the exact math logic behind Volume-Synchronized Probability of Toxicity (VPIN) and why it flags adverse selection." },
    { label: "Optimal Bot Margin Limits", q: "Recommend optimal Bot Risk Parameters (Leverage, Stop Loss, VPIN boundaries) given the live book snapshot metrics." }
  ];

  return (
    <div id="ai-advisor-panel" className="bg-[#07090e] border border-[#1e293b]/60 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[460px]">
      
      {/* Header and indicator bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e2930]/40 bg-[#0c0f17] shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="text-xs font-mono tracking-wider text-emerald-400 uppercase font-semibold">Microscope AI Quant Advisor</h4>
            <p className="text-[10px] text-gray-500 font-mono">Gemini-Powered Microstructure Analysis Engine</p>
          </div>
        </div>

        {/* Selected target metadata badge */}
        <div className="text-[9px] font-mono text-gray-400 bg-[#111827] border border-gray-800 rounded px-2 py-0.5 uppercase font-semibold">
          REF: {currentMarketState.exchange.toUpperCase()} : {currentMarketState.pair}
        </div>
      </div>

      {/* Main chat log viewport scroll pane */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-[10px] leading-relaxed max-h-[350px]">
        {chatHistory.map((chat, idx) => (
          <div 
            key={`chat_${idx}`} 
            className={`p-3 rounded-xl border max-w-[85%] ${chat.sender === 'user' ? 'bg-[#0f172a] border-[#1e2930] text-gray-300 ml-auto' : 'bg-[#0c0f17] border-[#1e293b]/30 text-slate-300'}`}
          >
            {/* Header info indicator sender */}
            <div className="flex justify-between items-center text-[8px] text-gray-500 mb-1.5 font-bold pb-1 border-b border-gray-800/20">
              <span className="uppercase text-indigo-400 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                {chat.sender === 'user' ? 'QUANT COMMANDER' : 'SOCRATES QUANT ENGINE'}
              </span>
              {chat.model && (
                <span className="text-gray-600">Model: {chat.model}</span>
              )}
            </div>

            {/* Markdown rendering simulation (simple lines with stylized points) */}
            <div className="space-y-1.5 break-words">
              {chat.text.split('\n').map((line, lIdx) => {
                if (line.startsWith('###')) {
                  return <h5 key={lIdx} className="text-xs font-bold text-white mt-2.5 mb-1 text-emerald-400 uppercase tracking-tight">{line.replace('###', '')}</h5>;
                }
                if (line.startsWith('####')) {
                  return <h6 key={lIdx} className="text-[11px] font-semibold text-indigo-300 mt-2 mb-1 uppercase">{line.replace('####', '')}</h6>;
                }
                if (line.startsWith('- ')) {
                  return <div key={lIdx} className="pl-3.5 text-gray-300 relative before:content-['•'] before:absolute before:left-1 before:text-emerald-400">{line.substring(2)}</div>;
                }
                if (line.startsWith('*') && line.endsWith('*')) {
                  return <p key={lIdx} className="italic text-gray-500 my-1">{line.replace(/\*/g, '')}</p>;
                }
                return <p key={lIdx} className="text-slate-300 leading-normal">{line}</p>;
              })}
            </div>
          </div>
        ))}

        {isRunning && (
          <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl max-w-[50%] animate-pulse">
            <span className="flex items-center gap-2 text-indigo-300 text-[9px] uppercase font-bold tracking-tight">
              <RefreshCw className="w-4.5 h-4.5 animate-spin" />
              Socrates Quants parsing order flow depth...
            </span>
          </div>
        )}
      </div>

      {/* Footer pre-written pills & input form */}
      <div className="p-5 border-t border-[#1e2930]/40 bg-[#090b11] shrink-0 space-y-3">
        {/* Quick pill triggers */}
        <div className="flex flex-wrap gap-2 text-[8px] font-mono">
          {quickPills.map((pill, pId) => (
            <button
              key={pId}
              id={`quick-pill-${pId}`}
              disabled={isRunning}
              onClick={() => triggerQuery(pill.q)}
              className="px-2.5 py-1 rounded-full bg-[#111827] border border-gray-800 text-gray-400 scroll-px-2 hover:border-emerald-500/50 hover:text-white transition cursor-pointer font-bold uppercase tracking-tight"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Input Text Form */}
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Query Socrates: Explain VPIN, detect spoof cancels, recommendation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isRunning}
            className="flex-1 bg-[#05060a] border border-gray-800 rounded-lg px-3 py-2 font-mono text-[10px] text-white focus:outline-none focus:border-emerald-500/60 transition"
          />
          <button
            type="submit"
            id="ai-advisor-submit"
            disabled={isRunning || !query.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-mono rounded-lg flex items-center gap-1.5 cursor-pointer font-bold uppercase text-[9px]"
          >
            <Send className="w-3.5 h-3.5" />
            Parse
          </button>
        </form>
      </div>

    </div>
  );
}

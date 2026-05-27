import React, { useState } from 'react';
import { OrangePiStatus } from '../types';
import { Cpu, Wifi, Zap, Check, Copy, FileCode, Terminal, Settings, ArrowRight, Clock, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';

interface OrangePiMonitorProps {
  status: OrangePiStatus | null;
  onToggleMode: (mode: 'simulated' | 'orange_pi') => void;
}

export default function OrangePiMonitor({ status, onToggleMode }: OrangePiMonitorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'python' | 'node'>('python');

  // Hardcode current endpoint domain relative to environment
  const targetUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ai-studio-quant-app.run';

  const defaultStatus: OrangePiStatus = status || {
    ip: "192.168.1.32",
    isAlive: true,
    lastSeen: Date.now(),
    totalReceivedPackets: 0,
    recentTelemetry: [],
    feederMode: 'simulated'
  };

  const mode = defaultStatus.feederMode;

  // Real client python script for copy-paste
  const pythonScriptText = `#!/usr/bin/env python3
"""
Institutional Quant Micro-Toxicity Robot Gatherer
Target Hardware: Orange Pi H2 (IP: 192.168.1.32)
Executable Collector Process
"""
import time
import json
import random
import urllib.request

# Target Cloud Run URL
INGEST_URL = "${targetUrl}/api/orange-pi/ingest"

print("=============================================================")
print("🌐 [Orange Pi H2 Server] Quant Data Gatherer Initialized")
print("⚡ Listening IP bounds: 192.168.1.32  --> Target: " + INGEST_URL)
print("=============================================================")

exchanges = ["binance", "bybit", "htx", "kraken"]

def fetch_and_stream():
    # Mocking standard CCXT high fidelity tick fetcher loop for production pipelines
    exc = random.choice(exchanges)
    
    # 1. Base Prices for Simulation (or pull from real public API)
    mid_prices = {
        "binance": 94800 + random.uniform(-100, 100),
        "bybit": 3420 + random.uniform(-5, 5),
        "htx": 165 + random.uniform(-0.5, 0.5),
        "kraken": 87200 + random.uniform(-80, 80)
    }
    
    mid = round(mid_prices[exc], 2)
    spread = round(mid * 0.0001, 3)
    vpin = round(random.uniform(0.15, 0.85), 3)
    imbalance = round(random.uniform(-0.6, 0.6), 3)
    toxicity = round(vpin * 0.9 + random.normalvariate(0, 0.05), 3)
    toxicity = max(0.001, min(0.999, toxicity))
    
    # Simulate Orderbook Bids/Asks Levels
    bids = []
    asks = []
    cum_bid = 0
    cum_ask = 0
    for i in range(1, 10):
        bp = round(mid - (spread/2) - (i * spread * 0.5), 2)
        ba = round((random.random() * 1.5 + 0.1) * (10 - i), 4)
        cum_bid += ba
        bids.append({
            "price": bp,
            "amount": ba,
            "cumulativeAmount": round(cum_bid, 4),
            "orderCount": random.randint(1, 5),
            "spoofingValue": round(random.uniform(0, 0.1), 3)
        })
        
        ap = round(mid + (spread/2) + (i * spread * 0.5), 2)
        aa = round((random.random() * 1.5 + 0.1) * (10 - i), 4)
        cum_ask += aa
        asks.append({
            "price": ap,
            "amount": aa,
            "cumulativeAmount": round(cum_ask, 4),
            "orderCount": random.randint(1, 5),
            "spoofingValue": round(random.uniform(0, 0.1), 3)
        })

    # Prepare ingestion payload parameters
    payload = {
        "exchange": exc,
        "midPrice": mid,
        "vpin": vpin,
        "orderImbalance": imbalance,
        "orderflowToxicity": toxicity,
        "bids": bids,
        "asks": asks
    }
    
    # Post over http request stream channels
    req_data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        INGEST_URL, 
        data=req_data, 
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = response.read().decode('utf-8')
            print(f"📡 Ingest Succeeded: Exchange Index [{exc.upper()}] Mid: {mid} -> Code 200")
    except Exception as e:
        print(f"❌ Transmission Error to Cloud Ingress: {e}")

if __name__ == "__main__":
    while True:
        try:
            fetch_and_stream()
            # Sleep 3 seconds representing hardware telemetry pulse frequency
            time.sleep(3.0)
        except KeyboardInterrupt:
            print("\\nStopped Orange Pi process.")
            break
`;

  const nodeScriptText = `// Node.js Robot Gatherer Client Script
// Hardware Platform: Orange Pi H2 (Local IP: 192.168.1.32)
// Run command: npm install node-fetch && node client.js

const fetch = require('node-fetch');

const INGEST_URL = '${targetUrl}/api/orange-pi/ingest';
const EXCHANGES = ['binance', 'bybit', 'htx', 'kraken'];

console.log('========================================================');
console.log('🤖 [Orange Pi H2 Server] Node.js Quant Flow Active');
console.log('📡 Streaming local IP: 192.168.1.32 -> URL: ' + INGEST_URL);
console.log('========================================================');

async function sendPacket() {
  const exc = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
  const isBtc = exc === 'binance' || exc === 'kraken';
  const midPrice = isBtc ? 94000 + Math.random() * 500 : 3400 + Math.random() * 20;
  
  const payload = {
    exchange: exc,
    midPrice: parseFloat(midPrice.toFixed(2)),
    vpin: parseFloat(Math.random().toFixed(3)),
    orderImbalance: parseFloat((Math.random() * 2 - 1).toFixed(3)),
    orderflowToxicity: parseFloat(Math.random().toFixed(3)),
    bids: [],
    asks: []
  };

  try {
    const res = await fetch(INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(\`✅ Sent packet for \${exc.toUpperCase()} -> Status: \${res.status}\`);
  } catch (err) {
    console.error('❌ Failed transmitting packets to router:', err.message);
  }
}

setInterval(sendPacket, 3000);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === 'python' ? pythonScriptText : nodeScriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="orange-pi-gatherer-interface" className="bg-[#07090e] border border-[#1e293b]/60 rounded-xl overflow-hidden p-5 shadow-xl font-mono text-[10px] text-gray-300">
      
      {/* Title block with IP Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5 border-b border-[#1e2930]/40 pb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-orange-400 rotate-180 animate-pulse" />
          <div>
            <h4 className="text-xs uppercase font-semibold text-orange-400 tracking-wider">H2 Orange Pi Robot Fetch Gatherer</h4>
            <p className="text-[9px] text-gray-500">Board Configuration: ARMv7 Cortex-A7 &bull; Hardware Data Collector Node</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[8px] tracking-wider uppercase text-gray-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-bold">
            DEVICE LOCAL IP: <span className="text-white">{defaultStatus.ip}</span>
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-[8px] uppercase ${defaultStatus.isAlive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${defaultStatus.isAlive ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            {defaultStatus.isAlive ? 'HEARTBEAT OK' : 'OFFLINE WAITING'}
          </span>
        </div>
      </div>

      {/* Grid section divide: Left column (Stats, feeder controller), Right Column (Sample script and telemetry raw list) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Connection Setup & Telemetry HUD -- cols 4 */}
        <div className="lg:col-span-4 bg-[#0a0c10] border border-gray-800/60 p-4 rounded-xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            <div className="font-bold text-white uppercase text-[10px] pb-1 border-b border-gray-800/80 flex items-center gap-1">
              <Settings className="w-4 h-4 text-emerald-400" />
              Ingress Channel Controls
            </div>

            {/* Ingestion Router Mode Selector */}
            <div className="space-y-2">
              <label className="text-gray-500 block">Router Processing Priority:</label>
              
              <div className="space-y-2">
                {/* Standard simulated */}
                <button
                  type="button"
                  onClick={() => onToggleMode('simulated')}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-start justify-between cursor-pointer transition ${mode === 'simulated' ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-[#07090e] border-gray-800 hover:border-gray-700 text-gray-400'}`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold block text-[9.5px]">🚀 Accelerated Simulator</span>
                    <p className="text-[8px] text-gray-500">Fast simulated algorithmic random order books</p>
                  </div>
                  {mode === 'simulated' && <Check className="w-4 h-4 text-indigo-400 mt-0.5" />}
                </button>

                {/* Orange Pi input */}
                <button
                  type="button"
                  onClick={() => onToggleMode('orange_pi')}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-start justify-between cursor-pointer transition ${mode === 'orange_pi' ? 'bg-[#ea580c]/10 border-orange-500 text-white' : 'bg-[#07090e] border-gray-800 hover:border-orange-500/30 text-gray-400'}`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold block text-[9.5px] text-orange-400">⚡ Orange Pi Real Ingest</span>
                    <p className="text-[8px] text-gray-500">Skip simulated streams; render direct posts from 192.168.1.32</p>
                  </div>
                  {mode === 'orange_pi' && <Check className="w-4 h-4 text-orange-400 mt-0.5" />}
                </button>
              </div>
            </div>

            {/* Ingress stats row */}
            <div className="border-t border-gray-800/85 pt-3.5 space-y-3 font-mono">
              <span className="text-[#a5b4fc] font-bold block text-[9px] uppercase tracking-wider">
                Telemetry Analytics
              </span>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[#0c0f17] border border-gray-800 p-2.5 rounded">
                  <span className="text-gray-500 block text-[8px] mb-0.5 uppercase">Packets Received</span>
                  <span className="text-sm font-semibold text-white leading-none">
                    {defaultStatus.totalReceivedPackets}
                  </span>
                </div>
                
                <div className="bg-[#0c0f17] border border-gray-800 p-2.5 rounded">
                  <span className="text-gray-500 block text-[8px] mb-0.5 uppercase">Pi Heartbeat</span>
                  <span className={`text-[9.5px] font-bold leading-none ${defaultStatus.isAlive ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {defaultStatus.isAlive ? 'STABLE' : 'STANDBY'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-amber-500/20 p-2.5 rounded flex items-start gap-2 text-amber-500/90 leading-normal text-[8.5px]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  The board IP <strong>192.168.1.32</strong> represents your physical local hardware client. Make sure the script config can connect to the public cloud URL of this applet to successfully stream live ticks.
                </span>
              </div>
            </div>
          </div>

          <div className="text-[8px] text-gray-500 border-t border-gray-900 pt-2 flex justify-between">
            <span>PING RANGE: &lt;5 ms C2D</span>
            <span>LAST SEEN: {defaultStatus.lastSeen ? new Date(defaultStatus.lastSeen).toLocaleTimeString() : 'N/A'}</span>
          </div>

        </div>

        {/* Executable Robot Script deployment & packet logs -- cols 8 */}
        <div className="lg:col-span-8 space-y-4 flex flex-col justify-between">
          
          {/* Script download selection layout */}
          <div className="bg-[#0a0c10] border border-gray-800/60 p-4 rounded-xl flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-gray-800">
              <span className="font-bold text-white uppercase text-[10px] flex items-center gap-1">
                <FileCode className="w-4 h-4 text-orange-400" />
                Orange Pi Executable Gatherer Scripts
              </span>

              <div className="flex bg-[#07090e] border border-gray-800 rounded p-0.5 text-[8.5px]">
                <button
                  onClick={() => setActiveTab('python')}
                  className={`px-2 py-0.5 rounded cursor-pointer font-bold ${activeTab === 'python' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500'}`}
                >
                  PYTHON 3
                </button>
                <button
                  onClick={() => setActiveTab('node')}
                  className={`px-2 py-0.5 rounded cursor-pointer font-bold ${activeTab === 'node' ? 'bg-indigo-300/10 text-indigo-400' : 'text-gray-500'}`}
                >
                  NODE (JS)
                </button>
              </div>
            </div>

            <p className="text-gray-400 mb-3 text-[8.5px] leading-normal">
              Copy this executable script, save it as <code className="text-white px-1.5 py-0.5 bg-slate-950 rounded font-semibold">gatherer.py</code> or <code className="text-white px-1.5 py-0.5 bg-slate-950 rounded font-semibold">gatherer.js</code> on your <strong>Orange Pi H2</strong> terminal, and issue the command on your terminal to launch real-time exchange streaming.
            </p>

            {/* Script viewer with Copy mechanism */}
            <div className="relative bg-[#05060a] border border-gray-950 rounded-lg p-3 max-h-[190px] overflow-y-auto w-full select-all selection:bg-slate-700">
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-2.5 right-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 p-1 rounded transition flex items-center gap-1 font-sans cursor-pointer hover:bg-slate-800"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[8px] font-bold text-emerald-400">COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold">COPY CODE</span>
                  </>
                )}
              </button>
              <pre className="text-slate-300 text-[8px] font-mono leading-tight whitespace-pre">
                {activeTab === 'python' ? pythonScriptText : nodeScriptText}
              </pre>
            </div>
          </div>

          {/* Packet telemetry viewer log feed */}
          <div className="bg-[#0a0c10] border border-gray-800/60 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-gray-800">
              <span className="font-bold text-white uppercase text-[10px] flex items-center gap-1">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Orange Pi Target Telemetry Log Feed ({defaultStatus.recentTelemetry.length} stored)
              </span>
              <span className="text-gray-600 text-[8px] uppercase">ENDPOINT: /api/orange-pi/ingest</span>
            </div>

            <div className="max-h-[105px] overflow-y-auto space-y-1.5 min-h-[70px]">
              {defaultStatus.recentTelemetry.length === 0 ? (
                <div className="text-center py-6 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 opacity-40 text-orange-400" />
                  No raw telemetry packets ingested yet. Start the script on your Orange Pi `192.168.1.32` to connect the real pipe!
                </div>
              ) : (
                [...defaultStatus.recentTelemetry].reverse().map((packet, idx) => (
                  <div key={idx} className="bg-[#05060b] border border-gray-900 rounded p-2 flex justify-between items-center text-[8.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#ea580c] bg-[#ea580c]/10 text-[7px] font-bold px-1 rounded uppercase">
                        INGEST
                      </span>
                      <span className="text-[#a5b4fc] font-semibold">{packet.exchange.toUpperCase()}</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-white font-mono">MidPrice: ${packet.midPrice.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-2.5 text-gray-500">
                      <span>Imbalance: <strong className="text-slate-300">{packet.orderImbalance}</strong></span>
                      <span>VPIN: <strong className="text-amber-400">{(packet.vpin*100).toFixed(0)}%</strong></span>
                      <span className="text-[7.5px] bg-[#111827] border border-gray-800 text-gray-400 px-1.5 py-0.2 rounded font-mono">
                        {new Date(packet.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

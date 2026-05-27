import React, { useRef, useState, useEffect } from 'react';
import { TradeFeedItem } from '../types';
import { Rotate3d, Play, Pause, ZoomIn, ZoomOut, Compass, Info } from 'lucide-react';

interface ThreeDGraphProps {
  trades: TradeFeedItem[];
  midPrice: number;
}

export default function ThreeDGraph({ trades, midPrice }: ThreeDGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 3D Projection state variables
  const [pitch, setPitch] = useState<number>(-0.45); // Pitch rotation around X axis (radians)
  const [yaw, setYaw] = useState<number>(0.65);    // Yaw rotation around Y axis (radians)
  const [zoom, setZoom] = useState<number>(1.1);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [selectedAxisPrompt, setSelectedAxisPrompt] = useState<string>('trades');

  const isDragging = useRef<boolean>(false);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-rotation simulation cycle
  useEffect(() => {
    if (!autoRotate) return;
    let animId: number;
    const tick = () => {
      setYaw(prev => (prev + 0.003) % (Math.PI * 2));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate]);

  // Redraw canvas whenever trades, pitch, yaw, zoom or sizing updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high density displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear with premium dark radial background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    // Coordinate mapping bounds
    // Space center: mid coordinates (0,0,0) mapped to center of canvas
    const cx = width / 2;
    const cy = height / 2 + 10;
    const size = Math.min(width, height) * 0.45 * zoom; // Grid visual size

    // Projection mathematics helper [3D to 2D screen coordinate]
    const project3D = (x: number, y: number, z: number) => {
      // Rotate around Y axis (yaw)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate around X axis (pitch)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      // Project into perspective viewport
      const depth = 2.5; 
      const factor = depth / (depth + z2 * 0.4);
      
      const screenX = cx + x1 * size * factor;
      const screenY = cy - y2 * size * factor; // negate Y so positive represents upwards

      return { x: screenX, y: screenY, zIndex: z2 };
    };

    // Calculate normalized variables for trades
    // x: normalized time (index / length) from -0.5 to 0.5
    // y: normalized price (deviation from mid-price) from -0.5 to 0.5
    // z: normalized toxicity / sentiment from -0.5 to 0.5
    const latestTrades = [...trades].slice(-40); // scan latest 40 trades
    
    // Grid Setup helper
    const drawGridPlane = (planeType: 'XY' | 'XZ' | 'YZ', gridOffset: number, color: string, alpha: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = alpha;
      
      const steps = 8;
      
      if (planeType === 'XY') {
        // Draw grid lines along X and Y at Z limit
        for (let i = 0; i <= steps; i++) {
          const ratio = i / steps - 0.5;
          // Constant Y
          const p1 = project3D(-0.5, ratio, gridOffset);
          const p2 = project3D(0.5, ratio, gridOffset);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Constant X
          const p3 = project3D(ratio, -0.5, gridOffset);
          const p4 = project3D(ratio, 0.5, gridOffset);
          ctx.beginPath();
          ctx.moveTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.stroke();
        }
      } else if (planeType === 'XZ') {
        // XY plane grid along Volume/Price space at Y bottom (-0.5)
        for (let i = 0; i <= steps; i++) {
          const ratio = i / steps - 0.5;
          // Constant Z
          const p1 = project3D(-0.5, gridOffset, ratio);
          const p2 = project3D(0.5, gridOffset, ratio);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Constant X
          const p3 = project3D(ratio, gridOffset, -0.5);
          const p4 = project3D(ratio, gridOffset, 0.5);
          ctx.beginPath();
          ctx.moveTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.stroke();
        }
      } else if (planeType === 'YZ') {
        // Toxicity / Sentiment back wall along Constant X (-0.5)
        for (let i = 0; i <= steps; i++) {
          const ratio = i / steps - 0.5;
          // Constant Z
          const p1 = project3D(gridOffset, -0.5, ratio);
          const p2 = project3D(gridOffset, 0.5, ratio);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Constant Y
          const p3 = project3D(gridOffset, ratio, -0.5);
          const p4 = project3D(gridOffset, ratio, 0.5);
          ctx.beginPath();
          ctx.moveTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0;
    };

    // 1. Draw Axis & Background Projection Grids
    // XY Plane (Price x Time) - Draw on back wall (Z = -0.5)
    drawGridPlane('XY', -0.5, '#1e293b', 0.85);

    // XZ Plane (Volume/Price structure) - Draw on bottom Floor (Y = -0.5)
    drawGridPlane('XZ', -0.5, '#0f172a', 0.9);

    // YZ Plane (Toxicity x Sentiment) - Draw on left Wall (X = -0.5)
    drawGridPlane('YZ', -0.5, '#1e1b4b', 0.7);

    // 2. Draw 3D Boundary Box Outline
    const bounds = [
      project3D(-0.5, -0.5, -0.5),
      project3D(0.5, -0.5, -0.5),
      project3D(0.5, 0.5, -0.5),
      project3D(-0.5, 0.5, -0.5),
      project3D(-0.5, -0.5, 0.5),
      project3D(0.5, -0.5, 0.5),
      project3D(0.5, 0.5, 0.5),
      project3D(-0.5, 0.5, 0.5),
    ];

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;

    // Draw bottom loop
    ctx.beginPath();
    ctx.moveTo(bounds[0].x, bounds[0].y);
    ctx.lineTo(bounds[1].x, bounds[1].y);
    ctx.lineTo(bounds[5].x, bounds[5].y);
    ctx.lineTo(bounds[4].x, bounds[4].y);
    ctx.closePath();
    ctx.stroke();

    // Draw top loop
    ctx.beginPath();
    ctx.moveTo(bounds[3].x, bounds[3].y);
    ctx.lineTo(bounds[2].x, bounds[2].y);
    ctx.lineTo(bounds[6].x, bounds[6].y);
    ctx.lineTo(bounds[7].x, bounds[7].y);
    ctx.closePath();
    ctx.stroke();

    // Draw vertical pillars
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(bounds[i].x, bounds[i].y);
      ctx.lineTo(bounds[i+4].x, bounds[i+4].y);
      ctx.stroke();
    }

    // 3. Render Coordinate Axis Prompts
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    
    // Label axis arrows
    const origin = project3D(-0.55, -0.55, -0.55);
    const xAxisLabel = project3D(0.6, -0.55, -0.55);
    const yAxisLabel = project3D(-0.55, 0.6, -0.55);
    const zAxisLabel = project3D(-0.55, -0.55, 0.6);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    
    // Draw X-Axis Arrow (Horizontal - normalized time axis)
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xAxisLabel.x, xAxisLabel.y);
    ctx.stroke();
    ctx.fillText('TIME (Index)', xAxisLabel.x + 4, xAxisLabel.y);

    // Draw Y-Axis Arrow (Price)
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yAxisLabel.x, yAxisLabel.y);
    ctx.stroke();
    ctx.fillText('PRICE (USD/ETH)', yAxisLabel.x, yAxisLabel.y - 6);

    // Draw Z-Axis Arrow (Toxicity metric alignment)
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zAxisLabel.x, zAxisLabel.y);
    ctx.stroke();
    ctx.fillText('TOXICITY (VPIN)', zAxisLabel.x - 20, zAxisLabel.y + 12);

    // 4. Render 3D Pipeline Curve & Trades (Z-Indexed for beautiful realistic overlapping)
    const pointsAndTrades: any[] = [];

    if (latestTrades.length > 0) {
      // Find price range for normalization
      const prices = latestTrades.map(t => t.price);
      const minPrice = Math.min(...prices) * 0.9995;
      const maxPrice = Math.max(...prices) * 1.0005;
      const priceRange = maxPrice - minPrice || 1.0;

      latestTrades.forEach((t, index) => {
        // Maps X: Time from -0.4 to 0.4
        const normX = (index / (latestTrades.length - 1)) * 0.8 - 0.4;
        
        // Maps Y: Price normalized space from -0.4 to 0.4
        const normY = ((t.price - minPrice) / priceRange) * 0.8 - 0.4;
        
        // Maps Z: Toxicity Normalized space from -0.4 to 0.4
        const normZ = t.vpin * 0.8 - 0.4;

        // Sentiment projection on plane
        const normSentiment = t.sentiment * 0.4; // between -0.4 and 0.4

        const projected = project3D(normX, normY, normZ);
        
        pointsAndTrades.push({
          trade: t,
          x: projected.x,
          y: projected.y,
          zIdx: projected.zIndex,
          normX,
          normY,
          normZ,
          normSentiment
        });
      });
    }

    // Sort by depth (zIndex desc) so back elements draw first, overlapping properly!
    const elementsToDraw = [...pointsAndTrades].sort((a, b) => b.zIdx - a.zIdx);

    // Draw continuous curves in 3D
    if (pointsAndTrades.length > 1) {
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.65;
      
      for (let i = 0; i < pointsAndTrades.length - 1; i++) {
        const p1 = pointsAndTrades[i];
        const p2 = pointsAndTrades[i + 1];
        
        // Create glowing grandient based on toxicity index
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        const toxicColor1 = p1.trade.vpin > 0.65 ? '#ef4444' : '#10b981';
        const toxicColor2 = p2.trade.vpin > 0.65 ? '#ef4444' : '#10b981';
        grad.addColorStop(0, toxicColor1);
        grad.addColorStop(1, toxicColor2);
        
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    }

    // Draw specific multi-axis points & projections
    elementsToDraw.forEach((item) => {
      const { trade, x, y, normX, normY, normZ, normSentiment } = item;
      
      // Determine colors based on anomalies & sides
      let baseColor = trade.side === 'buy' ? '#10b981' : '#f43f5e'; // Green for buys, crimson for sells
      let sizeFactor = Math.min(Math.max((trade.size / midPrice) * 1000, 3), 12);
      
      const isToxic = trade.vpin > 0.70;
      if (trade.anomalies.length > 0) {
        baseColor = '#f59e0b'; // Amber for anomalies like spoofing
        sizeFactor += 3;
      } else if (isToxic) {
        baseColor = '#ec4899'; // Hot pink for extreme structural toxicity
      }

      // 4A. Project vertical drops onto floor (implied XZ coordinate indicator)
      const floorProj = project3D(normX, -0.5, normZ);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(floorProj.x, floorProj.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floor marker dot
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(floorProj.x, floorProj.y, 2.0, 0, Math.PI * 2);
      ctx.fill();

      // 4B. Project sideways onto YZ back-left wall (sentiment vs toxicity tracker)
      const wallProj = project3D(-0.5, normY, normSentiment);
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(wallProj.x, wallProj.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Wall marker dot
      ctx.fillStyle = isToxic ? '#ec4899' : '#4f46e5';
      ctx.beginPath();
      ctx.arc(wallProj.x, wallProj.y, 2.0, 0, Math.PI * 2);
      ctx.fill();

      // 4C. Render the 3D Trade Bubble sphere with dual inner/outer radial gloss
      const radGrad = ctx.createRadialGradient(x, y, 1, x, y, sizeFactor);
      radGrad.addColorStop(0, '#ffffff'); // pure hot white center
      radGrad.addColorStop(0.3, baseColor);
      radGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y, sizeFactor * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw subtle boundary ring
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(x, y, sizeFactor, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Anomaly indicator label overlays
      if (trade.anomalies.length > 0) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '8px monospace';
        ctx.fillText(`ANM:${trade.anomalies[0]}`, x + sizeFactor + 2, y);
      }
    });

    // 5. Render HUD coordinates overlay in top quadrant
    ctx.fillStyle = '#8e9aaf';
    ctx.font = '11px monospace';
    ctx.fillText(`RENDER ENG: Isometric Canvas3D Matrix (Z-Sorted)`, 15, 20);
    ctx.fillStyle = '#475569';
    ctx.fillText(`Pitch: ${(pitch * 180 / Math.PI).toFixed(0)}° / Yaw: ${(yaw * 180 / Math.PI).toFixed(0)}° / Zoom: ${zoom.toFixed(1)}x`, 15, 34);

  }, [trades, pitch, yaw, zoom, autoRotate, midPrice]);

  // Drag interaction math algorithms for 3D rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
    setAutoRotate(false); // Pause auto rot on user manipulation
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - prevMousePos.current.x;
    const dy = e.clientY - prevMousePos.current.y;
    
    // Adjust Pitch and Yaw speed sensitivities
    setYaw(prev => prev + dx * 0.007);
    setPitch(prev => Math.max(Math.min(prev - dy * 0.007, Math.PI / 2.2), -Math.PI / 2.2));
    
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Quick reset presets
  const resetRotation = () => {
    setPitch(-0.45);
    setYaw(0.65);
    setZoom(1.1);
    setAutoRotate(true);
  };

  return (
    <div id="3d-projection-graph" className="relative bg-[#07090e] border border-[#1e293b]/60 rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
      {/* 3D Header HUD */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e2930]/40 bg-[#0c0f17]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Compass className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div className="absolute inset-0 bg-emerald-500/20 blur rounded-full animate-ping"></div>
          </div>
          <div>
            <h4 className="text-xs font-mono tracking-wider text-emerald-400 uppercase font-semibold">Toxicity 3D Space Projection</h4>
            <p className="text-[10px] text-gray-500 font-mono">Microsecond Trade Slices on Multi-axis Coordinates</p>
          </div>
        </div>

        {/* 3D Visual Coordinates Explainer Toggles */}
        <div className="flex gap-2 text-[10px] font-mono">
          <button 
            id="axis-explain-trades"
            onClick={() => setSelectedAxisPrompt('trades')}
            className={`px-2 py-0.5 rounded cursor-pointer ${selectedAxisPrompt === 'trades' ? 'bg-[#152e25] text-emerald-400 border border-emerald-500/30' : 'bg-[#0f121a] text-gray-500 hover:text-gray-300'}`}
          >
            Trades Center
          </button>
          <button 
            id="axis-explain-planes"
            onClick={() => setSelectedAxisPrompt('planes')}
            className={`px-2 py-0.5 rounded cursor-pointer ${selectedAxisPrompt === 'planes' ? 'bg-[#151c2e] text-indigo-400 border border-indigo-500/30' : 'bg-[#0f121a] text-gray-500 hover:text-gray-300'}`}
          >
            Axis Science
          </button>
        </div>
      </div>

      {/* Axis Information Banner */}
      {selectedAxisPrompt === 'planes' ? (
        <div id="axis-info-overlay" className="bg-[#0f121a] px-5 py-2.5 border-b border-[#1e293b]/40 flex gap-2 items-start text-[10px] font-mono text-gray-400 leading-relaxed">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-white font-medium">Coordinate Science:</span> 
            <span className="text-teal-400 ml-1">XY Plane</span> Price x Time.
            <span className="text-amber-400 ml-2">XZ Plane</span> Volumetric Imbalance (Price distribution).
            <span className="text-indigo-400 ml-2">YZ Plane</span> Toxicity (VPIN probability ratio) vs Market Sentiments.
          </div>
        </div>
      ) : (
        <div id="axis-info-trades" className="bg-[#0f121a] px-5 py-2.5 border-b border-[#1e293b]/40 flex gap-2 items-start text-[10px] font-mono text-gray-400 leading-relaxed">
          <Rotate3d className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-white font-medium">Trade Particles:</span> White cores indicate instant match liquidity.
            <span className="text-rose-500 font-semibold mx-1">Red</span> sell walls crossed.
            <span className="text-emerald-500 font-semibold mx-1">Green</span> bid crossings.
            <span className="text-amber-500 font-semibold mx-1">Orange halos</span> represent malicious spoofs, Wash Trades or immediate Liquidity Gaps.
          </div>
        </div>
      )}

      {/* The 3D Canvas Projection screen */}
      <div className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden h-full">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 w-full h-full block"
        />

        {/* 3D Action Controls Overlay HUD */}
        <div className="absolute bottom-4 right-4 flex items-center bg-[#07090e]/80 backdrop-blur-md rounded-lg border border-[#334155]/50 px-3 py-1.5 gap-3 shrink-0">
          <button
            id="three-d-btn-rot"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1 rounded cursor-pointer transition ${autoRotate ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}
            title={autoRotate ? "Pause orbit rotation" : "Auto-rotate hologram"}
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            id="three-d-btn-zoom-in"
            onClick={() => setZoom(z => Math.min(z + 0.1, 2.0))}
            className="p-1 rounded cursor-pointer text-gray-400 hover:text-white hover:bg-white/10"
            title="Zoom grid in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            id="three-d-btn-zoom-out"
            onClick={() => setZoom(z => Math.max(z - 0.1, 0.6))}
            className="p-1 rounded cursor-pointer text-gray-400 hover:text-white hover:bg-white/10"
            title="Zoom grid out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-[#334155]"></span>

          <button
            id="three-d-btn-reset"
            onClick={resetRotation}
            className="text-[9px] font-mono uppercase bg-[#1e293b] text-gray-300 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-700 hover:text-white"
            title="Reset to perspective default"
          >
            Reset view
          </button>
        </div>

        {/* Informative Drag Prompt Overlay */}
        <div className="absolute top-4 right-4 pointer-events-none text-[8px] font-mono text-gray-500 bg-[#0a0c10]/70 border border-[#1e2930]/30 px-2 py-1 rounded">
          DRAG TO ROTATE 3D SYSTEM
        </div>
      </div>
    </div>
  );
}

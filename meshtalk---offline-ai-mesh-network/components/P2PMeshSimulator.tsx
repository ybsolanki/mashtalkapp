import React, { useState, useEffect, useRef } from 'react';
import { processMessageAI } from '../services/geminiService';

interface NodeItem {
  id: string;
  name: string;
  role: 'sender' | 'relay' | 'target';
  x: number;
  y: number;
  battery: number;
  status: 'online' | 'offline';
  lang: string;
}

interface LogEntry {
  id: string;
  time: string;
  msg: string;
  type: 'info' | 'sos' | 'hop' | 'success' | 'warn';
}

const initialNodes: NodeItem[] = [
  { id: 'nodeA', name: 'Node A (Sender)', role: 'sender', x: 70, y: 170, battery: 98, status: 'online', lang: 'en' },
  { id: 'nodeB', name: 'Node B (Relay 1)', role: 'relay', x: 200, y: 80, battery: 85, status: 'online', lang: 'en' },
  { id: 'nodeC', name: 'Node C (Relay 2)', role: 'relay', x: 220, y: 260, battery: 92, status: 'online', lang: 'en' },
  { id: 'nodeD', name: 'Node D (Relay 3)', role: 'relay', x: 370, y: 130, battery: 74, status: 'online', lang: 'hi' },
  { id: 'nodeE', name: 'Node E (Recipient)', role: 'target', x: 490, y: 210, battery: 90, status: 'online', lang: 'hi' }
];

export const P2PMeshSimulator: React.FC = () => {
  const [nodes, setNodes] = useState<NodeItem[]>(initialNodes);
  const [messageText, setMessageText] = useState('🚨 Emergency! Flood reported in Sector 4. Send medical help!');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [aiEmergency, setAiEmergency] = useState<string>('Not Scanned');
  const [aiUrgency, setAiUrgency] = useState<string>('N/A');
  const [aiTranslation, setAiTranslation] = useState<string>('English ➔ Hindi');
  const [aiBadge, setAiBadge] = useState<{ text: string; color: string }>({ text: 'Idle', color: 'bg-slate-800 text-slate-400' });

  const svgPacketsRef = useRef<SVGGElement>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string, type: 'info' | 'sos' | 'hop' | 'success' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), time, msg, type }]);
  };

  const getDistance = (n1: NodeItem, n2: NodeItem) => {
    return Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
  };

  const toggleNodeStatus = (id: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        if (n.role === 'sender' || n.role === 'target') return n;
        const newStatus = n.status === 'online' ? 'offline' : 'online';
        addLog(`Node [${n.name}] toggled to ${newStatus.toUpperCase()}`, newStatus === 'offline' ? 'warn' : 'info');
        return { ...n, status: newStatus };
      }
      return n;
    }));
  };

  const findShortestPath = (startId: string, targetId: string): string[] | null => {
    const maxRange = 210;
    const queue: string[][] = [[startId]];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const currId = path[path.length - 1];

      if (currId === targetId) return path;

      const currNode = nodes.find(n => n.id === currId);
      if (!currNode || currNode.status === 'offline') continue;

      for (const neighbor of nodes) {
        if (neighbor.status === 'online' && !visited.has(neighbor.id)) {
          const dist = getDistance(currNode, neighbor);
          if (dist <= maxRange) {
            visited.add(neighbor.id);
            queue.push([...path, neighbor.id]);
          }
        }
      }
    }
    return null;
  };

  const animateHop = (from: NodeItem, to: NodeItem, isEmergency: boolean): Promise<void> => {
    return new Promise(resolve => {
      if (!svgPacketsRef.current) {
        resolve();
        return;
      }

      const packet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      packet.setAttribute('r', isEmergency ? '7' : '5');
      packet.setAttribute('fill', isEmergency ? '#ef4444' : '#f46d3b');
      packet.setAttribute('filter', 'url(#glow)');
      svgPacketsRef.current.appendChild(packet);

      const duration = 650;
      const startTime = performance.now();

      function step(now: number) {
        const progress = Math.min((now - startTime) / duration, 1);
        const currentX = from.x + (to.x - from.x) * progress;
        const currentY = from.y + (to.y - from.y) * progress;

        packet.setAttribute('cx', String(currentX));
        packet.setAttribute('cy', String(currentY));

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          if (svgPacketsRef.current && svgPacketsRef.current.contains(packet)) {
            svgPacketsRef.current.removeChild(packet);
          }
          resolve();
        }
      }

      requestAnimationFrame(step);
    });
  };

  const transmitPacket = async () => {
    if (isTransmitting || !messageText.trim()) return;

    const path = findShortestPath('nodeA', 'nodeE');

    if (!path) {
      addLog('❌ Mesh Route Failed: No active P2P path between Node A and Node E! Click offline nodes to turn them back online.', 'warn');
      return;
    }

    setIsTransmitting(true);

    // Call Gemini AI or offline triage fallback
    const aiResult = await processMessageAI(messageText, 'hi');
    const isEmergency = aiResult.isEmergency;

    setAiBadge({
      text: isEmergency ? 'CRITICAL SOS' : 'SCANNED',
      color: isEmergency 
        ? 'bg-rose-500 text-white animate-pulse'
        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
    });

    setAiEmergency(isEmergency ? 'TRUE (Priority Routing)' : 'FALSE (Standard Routing)');
    setAiUrgency(aiResult.urgencyLevel.toUpperCase());

    addLog(`🔍 AI Engine: Packet evaluated. Emergency=${isEmergency}, Urgency=${aiResult.urgencyLevel}. Dispatched from Node A.`, isEmergency ? 'sos' : 'info');

    for (let i = 0; i < path.length - 1; i++) {
      const fromNode = nodes.find(n => n.id === path[i])!;
      const toNode = nodes.find(n => n.id === path[i + 1])!;

      addLog(`📡 Hop ${i + 1}: Packet traversing P2P Wi-Fi link from [${fromNode.name}] ➔ [${toNode.name}] (${Math.round(getDistance(fromNode, toNode))}m)`, 'hop');

      await animateHop(fromNode, toNode, isEmergency);
    }

    const translatedMsg = aiResult.translatedText || (isEmergency 
      ? '🚨 आपात्कालीन! सेक्टर 4 में बाढ़ की सूचना। चिकित्सा सहायता भेजें!'
      : 'नमस्कार, जाल संदेश सफलतापूर्वक प्राप्त हुआ।');

    setAiTranslation(`Translated: "${translatedMsg}"`);
    addLog(`✅ DELIVERED! Message reached Node E via ${path.length - 1} hops. Translated for recipient.`, 'success');

    setIsTransmitting(false);
  };

  const activeNodesCount = nodes.filter(n => n.status === 'online').length;
  const maxRange = 210;

  return (
    <div className="bg-[#121212] text-slate-100 p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl max-w-5xl mx-auto my-4 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500 text-2xl font-black shadow-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">ZEDOX MeshTalk</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full">
                Interactive P2P Demo
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Real-Time Peer-to-Peer Multi-Hop Wireless Message Hop Visualizer</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-[#1a1a1a] px-3.5 py-2 rounded-xl border border-white/10 shadow-inner">
            <span className="text-slate-500 font-bold">Active Nodes:</span>
            <span className="font-bold text-emerald-400 ml-1 text-sm">{activeNodesCount}</span>
          </div>
          <div className="bg-[#1a1a1a] px-3.5 py-2 rounded-xl border border-white/10 shadow-inner">
            <span className="text-slate-500 font-bold">Protocol:</span>
            <span className="font-bold text-blue-400 ml-1 text-sm">Wi-Fi Direct P2P</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Canvas & Controls */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative w-full h-[360px] bg-slate-950/80 rounded-2xl border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
            
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <svg className="w-full h-full absolute inset-0 z-10">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Links */}
              <g>
                {nodes.map((n1, i) =>
                  nodes.map((n2, j) => {
                    if (i < j) {
                      const dist = getDistance(n1, n2);
                      if (dist <= maxRange) {
                        const isConnected = n1.status === 'online' && n2.status === 'online';
                        return (
                          <line
                            key={`link-${n1.id}-${n2.id}`}
                            x1={n1.x}
                            y1={n1.y}
                            x2={n2.x}
                            y2={n2.y}
                            stroke={isConnected ? 'rgba(51, 65, 85, 0.8)' : 'rgba(239, 68, 68, 0.25)'}
                            strokeWidth="2"
                            strokeDasharray={isConnected ? '4 4' : undefined}
                          />
                        );
                      }
                    }
                    return null;
                  })
                )}
              </g>

              {/* Dynamic Packets */}
              <g ref={svgPacketsRef}></g>

              {/* Nodes */}
              <g>
                {nodes.map(n => {
                  let color = '#10b981';
                  if (n.status === 'offline') color = '#ef4444';
                  else if (n.role === 'sender') color = '#3b82f6';
                  else if (n.role === 'target') color = '#a855f7';

                  return (
                    <g
                      key={n.id}
                      transform={`translate(${n.x}, ${n.y})`}
                      className="cursor-pointer select-none group"
                      onClick={() => toggleNodeStatus(n.id)}
                    >
                      {n.status === 'online' && (
                        <circle
                          r="24"
                          fill={n.role === 'sender' ? 'rgba(59, 130, 246, 0.15)' : n.role === 'target' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)'}
                          stroke={n.role === 'sender' ? 'rgba(59, 130, 246, 0.4)' : n.role === 'target' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(16, 185, 129, 0.4)'}
                          strokeWidth="1"
                        />
                      )}
                      <circle
                        r={n.role === 'sender' || n.role === 'target' ? '14' : '11'}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter="url(#glow)"
                      />
                      <text
                        y="28"
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="10"
                        fontWeight="700"
                      >
                        {n.name.split(' ')[0]} {n.name.split(' ')[1] || ''}
                      </text>
                      <text
                        y="-20"
                        textAnchor="middle"
                        fill={n.status === 'offline' ? '#f87171' : '#64748b'}
                        fontSize="9"
                        fontWeight="600"
                      >
                        {n.status === 'offline' ? 'OFFLINE' : `${n.battery}% 🔋`}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Helper tips */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10 text-[10px] text-slate-300 font-medium shadow-lg">
              💡 Click any relay node to toggle <strong>OFFLINE / ONLINE</strong> state
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 z-20 bg-slate-900/90 backdrop-blur px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-3 text-[10px] font-bold shadow-lg">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Sender (A)</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Relay</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div> Recipient (E)</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Offline</div>
            </div>
          </div>

          {/* Controls Input Bar */}
          <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xl">
            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="w-full bg-[#262626] border border-white/10 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 font-medium shadow-inner placeholder:text-slate-500"
              placeholder="Type message to broadcast across P2P mesh..."
              onKeyDown={e => e.key === 'Enter' && transmitPacket()}
            />

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  setMessageText('🚨 SOS! Medical assistance required urgently at Sector 4!');
                }}
                className="px-3 py-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold hover:bg-rose-500/20 active:scale-95 transition-all whitespace-nowrap"
              >
                SOS Preset
              </button>

              <button
                onClick={transmitPacket}
                disabled={isTransmitting || !messageText.trim()}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xl active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <span>Send P2P Packet</span>
                <span className="text-sm">⚡</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Triage & Telemetry Logs */}
        <div className="flex flex-col gap-4">
          
          {/* AI Inspection Card */}
          <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Packet Inspection</span>
              <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full ${aiBadge.color}`}>
                {aiBadge.text}
              </span>
            </div>

            <div className="bg-[#262626] p-3.5 rounded-xl border border-white/5 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Emergency Flag:</span>
                <span className="font-bold">{aiEmergency}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Urgency Level:</span>
                <span className="font-bold">{aiUrgency}</span>
              </div>
              <div className="flex justify-between text-[11px] truncate">
                <span className="text-slate-400">P2P Auto Translation:</span>
                <span className="font-bold text-emerald-400 truncate ml-1">{aiTranslation}</span>
              </div>
            </div>
          </div>

          {/* Telemetry Console */}
          <div className="flex-1 bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 flex flex-col min-h-[220px] shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">P2P Hop Telemetry Log</span>
              <button onClick={() => setLogs([])} className="text-[10px] text-slate-500 hover:text-slate-300 font-mono">
                Clear
              </button>
            </div>
            
            <div ref={logBoxRef} className="flex-1 overflow-y-auto font-mono text-[11px] space-y-2 pr-1 max-h-[220px]">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic text-[10px] p-2">
                  Click 'Send P2P Packet' to watch how messages hop wirelessly from node to node across the offline mesh...
                </div>
              ) : (
                logs.map(log => {
                  let badgeStyle = 'bg-slate-800/40 text-slate-300 border-white/5';
                  if (log.type === 'sos') badgeStyle = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
                  if (log.type === 'hop') badgeStyle = 'bg-orange-500/10 text-orange-300 border-orange-500/30';
                  if (log.type === 'success') badgeStyle = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
                  if (log.type === 'warn') badgeStyle = 'bg-amber-500/10 text-amber-300 border-amber-500/30';

                  return (
                    <div key={log.id} className={`p-2 rounded-xl border text-[10px] leading-relaxed ${badgeStyle}`}>
                      <span className="text-slate-500 font-bold">[{log.time}]</span> {log.msg}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium">
        <div>Team ZEDOX • Imagine Cup 2025 • MeshTalk Offline P2P Architecture</div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="text-emerald-400 font-bold">✓ Multi-Hop Wireless Routing</span>
          <span className="text-orange-400 font-bold">✓ AI Triage & Translation</span>
        </div>
      </div>

    </div>
  );
};

export default P2PMeshSimulator;

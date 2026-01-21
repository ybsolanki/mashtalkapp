import React, { useState, useEffect } from 'react';
import { DeviceNode, Message, NetworkStats } from './types';
import { INITIAL_NODES } from './constants';
import MeshVisualizer from './components/MeshVisualizer';
import ChatInterface from './components/ChatInterface';

type AppView = 'landing' | 'map' | 'chat' | 'profile' | 'scanner' | 'chatList';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [nodes, setNodes] = useState<DeviceNode[]>(INITIAL_NODES);
  const [activeNode, setActiveNode] = useState<DeviceNode | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [username, setUsername] = useState('Yug Solanki');
  const [hasWifiPermission, setHasWifiPermission] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const requestWifiPermission = () => {
    showToast("Initializing P2P Discovery Protocol...");
    setTimeout(() => {
      setHasWifiPermission(true);
      showToast("Mesh enabled: 2.4GHz/5GHz P2P active.");
    }, 1200);
  };

  const handleSimulateScan = () => {
    const peerId = `peer-${Math.floor(Math.random() * 10000)}`;
    const newNode: DeviceNode = {
      id: peerId,
      name: `Device Node ${peerId.split('-')[1]}`,
      status: 'online',
      battery: 88 + Math.floor(Math.random() * 10),
      distance: Math.floor(Math.random() * 35) + 5,
      language: ['es', 'fr', 'hi', 'zh'][Math.floor(Math.random() * 4)]
    };
    setNodes(prev => [...prev, newNode]);
    showToast(`Bridge established with ${newNode.name}`);
    setView('chatList');
  };

  const chattedNodes = nodes.filter(node => 
    messages.some(m => m.senderId === node.id || m.recipientId === node.id)
  );

  const activeNodesCount = nodes.filter(n => n.status === 'online').length;

  const renderView = () => {
    switch (view) {
      case 'landing':
        return (
          <div className="flex-1 flex flex-col bg-[#121212] p-6 animate-in fade-in duration-500 overflow-y-auto">
            <div className="mt-12 flex flex-col items-center gap-2 mb-10">
               <div className="flex items-center gap-3 bg-meshtalk-orange/10 px-4 py-2 rounded-full border border-meshtalk-orange/20">
                 <i className="fa-solid fa-bolt text-xl text-meshtalk-orange"></i>
                 <span className="text-[10px] font-black tracking-[0.2em] text-meshtalk-orange uppercase">ZEDOX Mesh Protocol</span>
               </div>
               <h1 className="text-5xl font-extrabold text-white tracking-tighter mt-4">MeshTalk</h1>
               <p className="text-slate-500 font-medium text-sm tracking-wide">Imagine Cup 2025 • Global Impact</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 shadow-lg">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Nodes Active</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{activeNodesCount}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              </div>
              <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 shadow-lg">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Mesh Range</p>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-white">450</span>
                  <span className="text-xs text-slate-500 font-bold">m</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <button 
                onClick={() => setView('chatList')}
                className="w-full bg-[#f46d3b] text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-transform"
              >
                <i className="fa-solid fa-paper-plane"></i>
                SECURE MESSAGING
              </button>
              <button 
                onClick={() => setView('map')}
                className="w-full bg-white text-[#121212] py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-transform"
              >
                <i className="fa-solid fa-map-location-dot"></i>
                EXPLORE MESH
              </button>
            </div>

            <div className="mt-auto pt-10">
               <div className="bg-slate-900/40 p-5 rounded-[2rem] border border-blue-500/20">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xs font-bold text-white uppercase tracking-widest">System Health</h3>
                     <span className="text-[10px] text-blue-400 font-bold">STABLE</span>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">WiFi P2P</span>
                        <span className="text-emerald-500 font-mono">READY</span>
                     </div>
                     <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">AI Translator</span>
                        <span className="text-emerald-500 font-mono">STANDBY</span>
                     </div>
                     <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Emergency AI</span>
                        <span className="text-emerald-500 font-mono">ACTIVE</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'chatList':
        return (
          <div className="flex-1 bg-[#121212] flex flex-col p-6 animate-in fade-in duration-300 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <button onClick={() => setView('landing')} className="text-white bg-white/5 w-10 h-10 rounded-full flex items-center justify-center">
                 <i className="fa-solid fa-arrow-left"></i>
               </button>
               <h2 className="text-xl font-bold text-white tracking-tight">Offline Inbox</h2>
               <button onClick={() => setView('profile')} className="w-10 h-10 rounded-full bg-meshtalk-orange text-white flex items-center justify-center">
                 <i className="fa-solid fa-user-pen text-sm"></i>
               </button>
            </div>
            
            {chattedNodes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-slate-800/10 rounded-[2rem] flex items-center justify-center text-slate-700">
                  <i className="fa-solid fa-comment-slash text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No active bridges</h3>
                  <p className="text-slate-500 mt-2 text-xs max-w-[200px] mx-auto">Discover nearby nodes or scan a QR to establish a mesh connection.</p>
                </div>
                <button 
                  onClick={() => setView('map')}
                  className="bg-meshtalk-teal text-[#121212] px-12 py-4 rounded-3xl font-black text-sm active:scale-95 transition-transform shadow-xl shadow-meshtalk-teal/10"
                >
                  DISCOVER NODES
                </button>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto">
                {chattedNodes.map(node => {
                  const lastMsg = [...messages].reverse().find(m => m.senderId === node.id || m.recipientId === node.id);
                  return (
                    <button 
                      key={node.id} 
                      onClick={() => { setActiveNode(node); setView('chat'); }}
                      className="w-full bg-[#1a1a1a] p-4 rounded-[2rem] flex items-center gap-4 border border-white/5 active:scale-[0.98] transition-all"
                    >
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 text-xl relative">
                        <i className="fa-solid fa-user"></i>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#1a1a1a]"></div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex justify-between items-center">
                          <p className="text-white font-bold">{node.name}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-1">
                          {lastMsg ? (lastMsg.senderId === 'me' ? 'You: ' : '') + lastMsg.originalText : 'Bridge active...'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="flex-1 bg-[#121212] flex flex-col p-6 overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-4 mb-10">
               <button onClick={() => setView('landing')} className="text-white bg-white/5 w-10 h-10 rounded-full flex items-center justify-center">
                 <i className="fa-solid fa-arrow-left"></i>
               </button>
               <h2 className="text-xl font-bold text-white uppercase tracking-widest">Settings</h2>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pb-10 pr-1">
               <div className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
                 <label className="text-slate-500 text-[9px] font-black uppercase mb-3 block tracking-[0.2em]">Mesh Identity</label>
                 <input 
                   value={username} 
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full bg-[#262626] border-none text-white p-4 rounded-2xl mb-6 focus:ring-2 focus:ring-meshtalk-orange/30 outline-none font-bold text-lg"
                 />
                 
                 <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Protocol Active</span>
                   </div>
                   <span className="text-[10px] text-slate-600 font-mono">v1.0.0-PROD</span>
                 </div>
               </div>

               <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-blue-500/10">
                  <div className="flex items-center gap-3 mb-6 px-2">
                    <i className="fa-solid fa-rocket text-blue-500"></i>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Production Build</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-2xl">
                      <span className="text-xs text-slate-500 font-bold">Platform</span>
                      <span className="text-xs text-white font-mono">Capacitor/Android</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-2xl">
                      <span className="text-xs text-slate-500 font-bold">Bundle Mode</span>
                      <span className="text-xs text-white font-mono">Offline-First</span>
                    </div>
                    <button 
                      onClick={() => showToast("Exporting project schema...")}
                      className="w-full py-4 bg-blue-600/10 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-600/20 active:scale-95 transition-all"
                    >
                      GENERATE RECOVERY SCHEMA
                    </button>
                  </div>
               </div>

               <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] flex flex-col items-center border border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Node QR Identity</h3>
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=meshtalk-${username}`} alt="QR Code" className="w-44 h-44" />
                  </div>
                  <p className="text-slate-600 text-[10px] mt-8 text-center font-medium max-w-[180px]">Scan to bridge peer-to-peer securely.</p>
               </div>

               <div className="pt-4 space-y-4">
                  <button onClick={() => setView('scanner')} className="w-full bg-meshtalk-teal text-[#121212] py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest active:scale-95 transition-transform shadow-xl">
                    <i className="fa-solid fa-camera mr-3"></i>
                    BRIDGE NEW NODE
                  </button>
               </div>
            </div>
          </div>
        );

      case 'map':
        return (
          <div className="flex-1 bg-[#121212] flex flex-col p-4 animate-in fade-in duration-300 overflow-hidden">
             <div className="flex items-center justify-between px-2 py-4">
               <button onClick={() => setView('landing')} className="text-white bg-white/5 w-10 h-10 rounded-full flex items-center justify-center">
                 <i className="fa-solid fa-arrow-left"></i>
               </button>
               <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Mesh Map</h2>
               <button onClick={() => showToast("Recalibrating local topology...")} className="text-white bg-white/5 w-10 h-10 rounded-full flex items-center justify-center">
                 <i className="fa-solid fa-satellite-dish"></i>
               </button>
             </div>

             {!hasWifiPermission ? (
               <div className="flex-1 flex flex-col items-center justify-center bg-[#1a1a1a] rounded-[3rem] p-8 text-center space-y-8 border border-white/5">
                 <div className="w-28 h-28 bg-meshtalk-orange/10 rounded-full flex items-center justify-center text-meshtalk-orange animate-pulse">
                    <i className="fa-solid fa-tower-broadcast text-5xl"></i>
                 </div>
                 <div className="space-y-4">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">Enable Airwaves</h3>
                   <p className="text-slate-500 text-xs leading-relaxed max-w-[240px] mx-auto font-medium">
                     MeshTalk creates a local network grid using WiFi P2P. No internet required. 
                   </p>
                 </div>
                 <button 
                   onClick={requestWifiPermission}
                   className="w-full bg-[#f46d3b] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.1em] shadow-2xl active:scale-95 transition-all"
                 >
                   ACTIVATE PROTOCOL
                 </button>
               </div>
             ) : (
               <div className="flex flex-col h-full overflow-hidden">
                 <div className="flex-1 rounded-[3rem] overflow-hidden mb-4 border border-white/5 bg-slate-900/20 min-h-[350px] shadow-inner">
                   <MeshVisualizer nodes={nodes} />
                 </div>
                 <div className="space-y-3 overflow-y-auto pb-6 px-1 flex-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 mb-2">Nearby Grid Nodes</div>
                    {nodes.filter(n => n.id !== 'me').length === 0 ? (
                      <div className="p-12 text-center bg-[#1a1a1a] rounded-[2rem] border border-dashed border-white/10">
                        <i className="fa-solid fa-wave-square text-slate-700 text-4xl mb-4"></i>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Listening for frequencies...</p>
                      </div>
                    ) : (
                      nodes.filter(n => n.id !== 'me').map(node => (
                        <button 
                          key={node.id} 
                          onClick={() => { setActiveNode(node); setView('chat'); }}
                          className="w-full bg-[#1a1a1a] p-5 rounded-[2rem] flex items-center justify-between border border-white/5 active:scale-[0.98] transition-all"
                        >
                          <div className="flex items-center gap-4 text-left">
                             <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                <i className="fa-solid fa-hard-drive"></i>
                             </div>
                             <div>
                                <p className="text-white font-bold">{node.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                   <span className="text-[9px] font-mono text-emerald-500">{node.battery}% PWR</span>
                                   <span className="text-[9px] font-mono text-slate-500">{node.distance}m</span>
                                </div>
                             </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <i className="fa-solid fa-chevron-right text-slate-700 text-xs"></i>
                          </div>
                        </button>
                      ))
                    )}
                 </div>
               </div>
             )}
          </div>
        );

      case 'chat':
        return (
          <ChatInterface 
            activeNode={activeNode} 
            onSendMessage={handleSendMessage} 
            messages={messages} 
            onBack={() => setView('chatList')} 
          />
        );

      case 'scanner':
        return (
            <div className="flex-1 bg-[#121212] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
                <div className="w-full max-w-xs aspect-square border-2 border-meshtalk-orange/20 rounded-[3rem] relative overflow-hidden flex items-center justify-center bg-black/40 shadow-2xl">
                    <div className="w-full h-[3px] bg-meshtalk-orange absolute top-0 animate-[scan_3s_ease-in-out_infinite] z-20 shadow-[0_0_25px_rgba(244,109,59,0.9)]"></div>
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
                       {[...Array(36)].map((_, i) => <div key={i} className="border-[0.5px] border-white/20"></div>)}
                    </div>
                    <div className="relative z-10 p-10 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                       <i className="fa-solid fa-expand text-6xl text-white/10"></i>
                    </div>
                    <div className="absolute top-8 left-8 w-10 h-10 border-t-4 border-l-4 border-meshtalk-orange rounded-tl-2xl opacity-80"></div>
                    <div className="absolute top-8 right-8 w-10 h-10 border-t-4 border-r-4 border-meshtalk-orange rounded-tr-2xl opacity-80"></div>
                    <div className="absolute bottom-8 left-8 w-10 h-10 border-b-4 border-l-4 border-meshtalk-orange rounded-bl-2xl opacity-80"></div>
                    <div className="absolute bottom-8 right-8 w-10 h-10 border-b-4 border-r-4 border-meshtalk-orange rounded-br-2xl opacity-80"></div>

                    <style>{`
                      @keyframes scan {
                        0%, 100% { top: 10%; }
                        50% { top: 90%; }
                      }
                    `}</style>
                </div>
                
                <h3 className="text-white font-black text-3xl mt-12 tracking-tight">BRIDGE GRID</h3>
                <p className="text-slate-500 text-xs mt-4 max-w-[220px] leading-relaxed font-medium">Position identity code within frame for peer-to-peer handshaking.</p>
                
                <div className="mt-14 w-full max-w-xs space-y-4">
                  <button 
                    onClick={handleSimulateScan}
                    className="w-full bg-meshtalk-orange text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-2xl"
                  >
                    IDENTIFY PEER
                  </button>
                  <button 
                      onClick={() => setView('profile')}
                      className="w-full bg-[#1a1a1a] text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] border border-white/5 active:scale-95 transition-all"
                  >
                      CANCEL
                  </button>
                </div>
            </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden select-none font-sans">
      <div className="w-full max-w-lg mx-auto bg-[#121212] h-full relative flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border-x border-white/5">
        {renderView()}
        {toast && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 w-auto min-w-[300px] max-w-[90%] z-[100] animate-in slide-in-from-top-6 duration-300">
            <div className="bg-[#1a1a1a] text-white p-5 rounded-[2rem] border border-white/10 shadow-2xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <i className="fa-solid fa-check text-xs"></i>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">{toast}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
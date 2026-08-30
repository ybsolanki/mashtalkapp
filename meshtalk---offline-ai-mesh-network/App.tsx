import React, { useState } from 'react';
import { DeviceNode, Message } from './types';
import { INITIAL_NODES } from './constants';
import ChatInterface from './components/ChatInterface';
import P2PMeshSimulator from './components/P2PMeshSimulator';

type AppView = 'simulator' | 'chatList' | 'chat' | 'profile' | 'scanner';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('simulator');
  const [nodes, setNodes] = useState<DeviceNode[]>(INITIAL_NODES);
  const [activeNode, setActiveNode] = useState<DeviceNode | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [username, setUsername] = useState('Yug Solanki');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
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

  const renderView = () => {
    switch (view) {
      case 'simulator':
        return <P2PMeshSimulator />;

      case 'chatList':
        return (
          <div className="flex-1 bg-[#121212] flex flex-col p-6 rounded-3xl border border-white/10 max-w-4xl mx-auto my-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
               <button onClick={() => setView('simulator')} className="text-white bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-white/10">
                 <i className="fa-solid fa-arrow-left"></i>
                 <span>Back to Simulator</span>
               </button>
               <h2 className="text-xl font-bold text-white tracking-tight">Offline Inbox</h2>
               <button onClick={() => setView('profile')} className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg">
                 <i className="fa-solid fa-user-pen text-sm"></i>
               </button>
            </div>
            
            {chattedNodes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-16">
                <div className="w-20 h-20 bg-slate-800/30 rounded-3xl flex items-center justify-center text-slate-500">
                  <i className="fa-solid fa-comment-slash text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No active message bridges</h3>
                  <p className="text-slate-400 mt-2 text-xs max-w-xs mx-auto">Use the P2P Mesh Simulator to broadcast multi-hop messages or establish peer bridges.</p>
                </div>
                <button 
                  onClick={() => setView('simulator')}
                  className="bg-orange-500 text-white px-8 py-3.5 rounded-2xl font-bold text-xs active:scale-95 transition-all shadow-xl hover:bg-orange-600"
                >
                  OPEN P2P SIMULATOR
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {chattedNodes.map(node => {
                  const lastMsg = [...messages].reverse().find(m => m.senderId === node.id || m.recipientId === node.id);
                  return (
                    <button 
                      key={node.id} 
                      onClick={() => { setActiveNode(node); setView('chat'); }}
                      className="w-full bg-[#1a1a1a] p-4 rounded-2xl flex items-center gap-4 border border-white/5 active:scale-[0.98] transition-all hover:border-white/20"
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
                        <p className="text-xs text-slate-400 truncate mt-1">
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

      case 'chat':
        return (
          <div className="max-w-4xl mx-auto my-4 h-[600px]">
            <ChatInterface 
              activeNode={activeNode} 
              onSendMessage={handleSendMessage} 
              messages={messages} 
              onBack={() => setView('chatList')} 
            />
          </div>
        );

      case 'profile':
        return (
          <div className="flex-1 bg-[#121212] flex flex-col p-6 rounded-3xl border border-white/10 max-w-2xl mx-auto my-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setView('simulator')} className="text-white bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold">
                 <i className="fa-solid fa-arrow-left"></i> Back
               </button>
               <h2 className="text-xl font-bold text-white uppercase tracking-wider">Node Identity & Settings</h2>
            </div>

            <div className="space-y-6">
               <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 shadow-xl">
                 <label className="text-slate-400 text-[10px] font-black uppercase mb-3 block tracking-widest">Mesh Identity Handle</label>
                 <input 
                   value={username} 
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full bg-[#262626] border border-white/10 text-white p-4 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500/50 outline-none font-bold text-lg"
                 />
                 
                 <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">P2P Protocol Active</span>
                   </div>
                   <span className="text-[10px] text-slate-400 font-mono">v1.0.0-PROD</span>
                 </div>
               </div>

               <div className="bg-[#1a1a1a] p-8 rounded-2xl flex flex-col items-center border border-white/5 shadow-xl">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Peer QR Handshake Identity</h3>
                  <div className="bg-white p-5 rounded-2xl shadow-2xl">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=meshtalk-${username}`} alt="QR Code" className="w-40 h-40" />
                  </div>
                  <p className="text-slate-400 text-xs mt-6 text-center font-medium max-w-xs">Scan to bridge peer-to-peer securely across Wi-Fi Direct.</p>
               </div>
            </div>
          </div>
        );

      case 'scanner':
        return (
          <div className="flex-1 bg-[#121212] flex flex-col items-center justify-center p-6 rounded-3xl border border-white/10 max-w-lg mx-auto my-4 text-center">
            <h3 className="text-white font-black text-2xl mb-4">P2P BRIDGE SCANNER</h3>
            <p className="text-slate-400 text-xs mb-8 max-w-xs">Scan nearby QR identity to add relay node to mesh.</p>
            
            <button 
              onClick={handleSimulateScan}
              className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              SIMULATE DISCOVERY HANDSHAKE
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="bg-[#121212]/90 backdrop-blur border-b border-white/10 sticky top-0 z-50 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('simulator')}>
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500 text-lg font-bold">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">ZEDOX MeshTalk</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-black uppercase bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
                Offline AI Mesh
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => setView('simulator')}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === 'simulator' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
            >
              <span>⚡ Simulator</span>
            </button>
            <button 
              onClick={() => setView('chatList')}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === 'chatList' || view === 'chat' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
            >
              <span>💬 Inbox</span>
            </button>
            <button 
              onClick={() => setView('profile')}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === 'profile' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
            >
              <span>⚙️ Identity</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-2 sm:p-6 max-w-6xl mx-auto">
        {renderView()}
      </main>

      {toast && (
        <div className="fixed top-20 right-6 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#1a1a1a] text-white px-5 py-3.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <i className="fa-solid fa-check text-xs"></i>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
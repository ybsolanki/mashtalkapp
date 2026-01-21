import React, { useState, useRef, useEffect } from 'react';
import { Message, DeviceNode } from '../types';
import { processMessageAI } from '../services/geminiService';

interface ChatInterfaceProps {
  activeNode: DeviceNode | null;
  onSendMessage: (msg: Message) => void;
  messages: Message[];
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  activeNode, 
  onSendMessage, 
  messages,
  onBack
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeNode) return;

    setIsProcessing(true);
    const text = inputText;
    setInputText('');

    const aiResult = await processMessageAI(text, activeNode.language);

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'me',
      senderName: 'You',
      recipientId: activeNode.id,
      originalText: text,
      translatedText: aiResult.translatedText,
      timestamp: Date.now(),
      hops: ['me', activeNode.id],
      isEmergency: aiResult.isEmergency,
      language: 'en'
    };

    onSendMessage(newMessage);
    setIsProcessing(false);
  };

  if (!activeNode) return null;

  return (
    <div className="flex flex-col h-full bg-[#121212] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-4 py-3 bg-[#1a1a1a] flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-white p-2">
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-white/10">
               <i className="fa-solid fa-user text-slate-400"></i>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight">{activeNode.name}</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">P2P Bridge Active</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/60">
          <button className="p-2"><i className="fa-solid fa-shield-halved text-sm"></i></button>
          <button className="p-2"><i className="fa-solid fa-ellipsis-vertical text-sm"></i></button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.filter(m => m.recipientId === activeNode.id || m.senderId === activeNode.id).map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
            {msg.senderId !== 'me' && <span className="text-[10px] text-meshtalk-teal font-bold mb-1.5 px-1 uppercase tracking-wider">{msg.senderName}</span>}
            <div className={`max-w-[85%] rounded-[24px] px-4 py-3 shadow-lg relative ${
              msg.senderId === 'me' 
                ? 'bg-meshtalk-orange text-white rounded-tr-none' 
                : 'bg-[#262626] text-slate-100 rounded-tl-none'
            } ${msg.isEmergency ? 'emergency-pulse bg-red-600' : ''}`}>
              
              {msg.isEmergency && (
                <div className="flex items-center gap-2 mb-1.5 bg-black/20 p-1.5 rounded-lg border border-white/10">
                  <i className="fa-solid fa-triangle-exclamation text-amber-300 text-[10px]"></i>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">AI Detected Emergency</span>
                </div>
              )}

              <div className="text-[14px] leading-relaxed font-medium">{msg.originalText}</div>
              
              {msg.translatedText && msg.translatedText !== msg.originalText && (
                <div className="mt-2 pt-2 border-t border-white/10 text-[12px] opacity-80 italic">
                   <div className="text-[8px] font-bold uppercase tracking-widest mb-0.5 opacity-60">AI Translation</div>
                   {msg.translatedText}
                </div>
              )}

              <div className={`text-[9px] mt-2 flex items-center gap-1.5 opacity-60 font-bold ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.senderId === 'me' && <i className="fa-solid fa-check-double text-[8px] text-white/80"></i>}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse ml-2">
            <i className="fa-solid fa-dna fa-spin"></i>
            AI Mesh Routing...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#121212] border-t border-white/5">
        <div className="flex items-center gap-3">
          <button className="text-slate-400 p-2 hover:bg-white/5 rounded-full transition-colors">
            <i className="fa-solid fa-plus text-lg"></i>
          </button>
          <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-2xl px-4 py-3 flex items-center shadow-inner">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message..."
              className="w-full bg-transparent text-slate-100 text-sm focus:outline-none font-medium placeholder:text-slate-600"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-meshtalk-orange text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            <i className="fa-solid fa-paper-plane text-lg"></i>
          </button>
        </div>
        <div className="flex justify-center mt-3">
           <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-lock text-[8px]"></i> End-to-end Offline Encryption
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
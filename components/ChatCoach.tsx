
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { createTravelChat } from '../services/geminiService';
import { GenerateContentResponse } from "@google/genai";

interface ChatCoachProps {
  destination?: string;
  heroImage?: string;
  fullPage?: boolean;
}

const ChatCoach: React.FC<ChatCoachProps> = ({ destination, fullPage }) => {
  const [isOpen, setIsOpen] = useState(fullPage || false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatInstance = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fullPage) setIsOpen(true);
  }, [fullPage]);

  // Listen for external open event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-nomad-coach', handleOpen);
    return () => window.removeEventListener('open-nomad-coach', handleOpen);
  }, []);

  // Load history from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('nomadai_chats');
    const parsed = savedSessions ? JSON.parse(savedSessions) : [];
    setSessions(parsed);
    
    // Always start a new chat on load as requested
    startNewChat();
  }, []);

  // Save current session to sessions and localStorage
  useEffect(() => {
    if (currentSessionId && messages.length > 1) { // Only save if more than initial message
      const updatedSessions = sessions.map(s => 
        s.id === currentSessionId ? { ...s, messages } : s
      );
      
      // If session doesn't exist in sessions list, add it
      if (!sessions.find(s => s.id === currentSessionId)) {
        const newSession: ChatSession = {
          id: currentSessionId,
          title: messages[1]?.text.substring(0, 30) || 'New Chat',
          messages: messages,
          createdAt: new Date()
        };
        updatedSessions.push(newSession);
      }

      setSessions(updatedSessions);
      localStorage.setItem('nomadai_chats', JSON.stringify(updatedSessions));
    }
  }, [messages, currentSessionId]);

  useEffect(() => {
    if (!chatInstance.current) {
      chatInstance.current = createTravelChat(
        "You are the NomadAI Ultra Coach ⚡, the world's fastest and most engaging travel advisor. Your goal is to answer in under 15 seconds. ALWAYS use emojis to make your answers pop and look fun 🌍✨. Be extremely enthusiastic, helpful, and provide high-speed, high-value advice. Use short, punchy formatting for readability."
      );
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startNewChat = () => {
    const newId = Date.now().toString();
    setCurrentSessionId(newId);
    setMessages([
      { 
        role: 'model', 
        text: "Hey fellow traveler! ✈️ I'm your NomadAI Ultra Coach! ⚡ Need some lightning-fast tips or help refining your dream adventure? Let's go! 🚀✨", 
        timestamp: new Date() 
      }
    ]);
    setShowHistory(false);
  };

  const selectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('nomadai_chats', JSON.stringify(updated));
    if (currentSessionId === id) {
      if (updated.length > 0) {
        selectSession(updated[0]);
      } else {
        startNewChat();
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    
    // Check for API key
    const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    const hasKey = (envKey && envKey !== 'undefined') || localStorage.getItem('GEMINI_API_KEY');
    
    if (!hasKey) {
      setMessages(prev => [...prev, userMsg, { 
        role: 'model', 
        text: "I'm sorry, but I need a Gemini API Key to function. Please click the Settings gear icon in the header to provide your API key.", 
        timestamp: new Date() 
      }]);
      setInput('');
      return;
    }

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatInstance.current.sendMessageStream({ message: input });
      let fullText = '';
      
      const modelMsg: ChatMessage = { role: 'model', text: '', timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        fullText += c.text;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = fullText;
          return newMsgs;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${fullPage ? 'h-full w-full items-stretch' : 'items-end'}`}>
      <div className={`flex items-end gap-4 ${fullPage ? 'h-full w-full' : ''}`}>
        {isOpen && (
        <div className={`bg-white ${fullPage ? 'rounded-none sm:rounded-[40px] border-none' : 'rounded-3xl shadow-2xl border border-slate-200'} flex overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ${fullPage ? 'w-full h-full' : 'w-80 sm:w-[450px] h-[600px]'}`}>
          
          {/* Sidebar */}
          <div className={`${showHistory ? (fullPage ? 'w-72' : 'w-64') : 'w-0'} transition-all duration-300 bg-slate-900 text-white flex flex-col overflow-hidden`}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">History</h4>
              <button onClick={startNewChat} className="text-blue-400 hover:text-blue-300 text-xs font-bold">
                <i className="fa-solid fa-plus mr-1"></i> New
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sessions.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => selectSession(s)}
                  className={`group p-3 rounded-xl text-sm cursor-pointer transition-all flex justify-between items-center ${s.id === currentSessionId ? 'bg-blue-600' : 'hover:bg-white/5'}`}
                >
                  <span className="truncate flex-1 pr-2">{s.title}</span>
                  <button 
                    onClick={(e) => deleteSession(s.id, e)}
                    className={`${s.id === currentSessionId ? 'text-blue-200 hover:text-white' : 'text-slate-400 hover:text-red-400'} transition-colors p-1.5 rounded-lg hover:bg-white/10`}
                    title="Delete Chat"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-center text-slate-500 text-xs mt-10">No history yet</p>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-bars-staggered"></i>
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate max-w-[150px]">Nomad Coach</h3>
                </div>
              </div>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 animate-pulse flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask your coach anything..."
                  className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-300"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!isOpen && !fullPage && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 group"
        >
          <i className="fa-solid fa-comments group-hover:rotate-12 transition-transform"></i>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
          </span>
        </button>
      )}
      </div>
    </div>
  );
};

export default ChatCoach;

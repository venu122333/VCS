
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { createTravelChat } from '../services/geminiService';
import { GenerateContentResponse } from "@google/genai";

interface ChatCoachProps {
  destination?: string;
  heroImage?: string;
}

const ChatCoach: React.FC<ChatCoachProps> = ({ destination, heroImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLocationPreview, setShowLocationPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatInstance = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('nomadai_chats');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
        setMessages(parsed[0].messages);
      } else {
        startNewChat();
      }
    } else {
      startNewChat();
    }
  }, []);

  // Save current session to sessions and localStorage
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      const updatedSessions = sessions.map(s => 
        s.id === currentSessionId ? { ...s, messages } : s
      );
      
      // If session doesn't exist in sessions list, add it
      if (!sessions.find(s => s.id === currentSessionId)) {
        const newSession: ChatSession = {
          id: currentSessionId,
          title: messages[0]?.text.substring(0, 30) || 'New Chat',
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
        "You are an expert travel coach with deep knowledge of global destinations, local customs, hidden gems, and travel logistics. You are friendly, encouraging, and provide concise, actionable advice."
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
        text: "Hi! I'm your NomadAI Travel Coach. Need some local tips or help refining your itinerary?", 
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

  const handleNavigate = () => {
    if (!destination) {
      alert("Please enter a destination first!");
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      {!isOpen && destination && (
        <div className="relative flex flex-col items-end gap-2">
          {showLocationPreview && (
            <div className="absolute bottom-full right-0 mb-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              {heroImage ? (
                <div className="h-32 w-full relative">
                  <img src={heroImage || null} alt={destination} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              ) : null}
              <div className="p-4">
                <h4 className="font-bold text-slate-900 truncate">{destination}</h4>
                <p className="text-xs text-slate-500 mt-1">Ready to explore this destination?</p>
                <button 
                  onClick={handleNavigate}
                  className="w-full mt-3 bg-blue-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-location-arrow"></i> Open in Maps
                </button>
              </div>
            </div>
          )}
          <button 
            onMouseEnter={() => setShowLocationPreview(true)}
            onMouseLeave={() => setShowLocationPreview(false)}
            onClick={() => setShowLocationPreview(!showLocationPreview)}
            className="w-12 h-12 bg-white text-blue-600 rounded-full shadow-xl flex items-center justify-center text-xl hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 border border-blue-100 relative group overflow-hidden"
            title="Locate on Maps"
          >
            {heroImage ? (
              <img src={heroImage || null} className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity absolute inset-0" alt={destination} />
            ) : null}
            <i className="fa-solid fa-location-dot relative z-10"></i>
          </button>
        </div>
      )}
      
      <div className="flex items-end gap-4">
        {isOpen && (
        <div className="bg-white w-80 sm:w-[450px] h-[600px] rounded-3xl shadow-2xl flex border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Sidebar */}
          <div className={`${showHistory ? 'w-64' : 'w-0'} transition-all duration-300 bg-slate-900 text-white flex flex-col overflow-hidden`}>
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
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
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
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-compass"></i>
                  </div>
                  <h3 className="font-semibold truncate max-w-[150px]">Nomad Coach</h3>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-blue-200">
                <i className="fa-solid fa-xmark"></i>
              </button>
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
      
      {!isOpen && (
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

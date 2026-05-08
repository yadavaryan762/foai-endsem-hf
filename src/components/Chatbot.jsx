import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Trash2, Bot, User } from "lucide-react";
import axios from "axios";

const CHAT_CACHE_KEY = "dashboard_chat_history";

export default function Chatbot({ dashboardContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_CACHE_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ role: "assistant", content: "Hello! I am your Dashboard AI. I can answer questions about the ISS location, speed, astronauts in space, and the latest news articles displayed on this dashboard. How can I help you today?" }]);
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      // Store last 30 messages max
      const toStore = messages.slice(-30);
      localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(toStore));
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const clearChat = () => {
    const initMsg = [{ role: "assistant", content: "Chat cleared. How can I assist you with the dashboard data?" }];
    setMessages(initMsg);
    localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(initMsg));
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_AI_TOKEN;
      if (!apiKey) {
        throw new Error("Missing VITE_AI_TOKEN in .env");
      }

      // Build context string
      const { iss, news } = dashboardContext;
      const contextStr = `
        CURRENT DASHBOARD DATA:
        - ISS Location: Latitude ${iss.position?.lat?.toFixed(4)}, Longitude ${iss.position?.lng?.toFixed(4)}
        - Nearest Place: ${iss.locationName}
        - ISS Speed: ${iss.trajectory.length > 0 ? iss.trajectory[iss.trajectory.length-1].speed.toFixed(0) : 0} km/h
        - People in Space: ${iss.astronauts.total}. Names: ${iss.astronauts.names.join(", ")}
        
        LATEST NEWS ARTICLES (Top 5):
        ${news.articles.slice(0, 5).map(a => `- [${a.category}] ${a.title}`).join("\n")}
        Total loaded articles: ${news.articles.length}
      `;

      const systemPrompt = `You are a helpful AI assistant built exclusively for this Space & News Dashboard.
      RULE 1: You can ONLY answer using the provided dashboard data context. Do NOT use outside internet knowledge or guess.
      RULE 2: Keep your answers concise, direct, and conversational.
      RULE 3: If a user asks something not in the context, say "I can only answer questions based on the current dashboard data."
      
      ${contextStr}
      `;

      // API request to Hugging Face
      const payload = {
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          { role: "system", content: systemPrompt },
          // filter out internal errors or keeping last few conversational context
          ...newMessages.slice(-5).map(m => ({ role: m.role, content: m.content })) 
        ],
        max_tokens: 250,
        temperature: 0.2
      };

      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const aiReply = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: "assistant", content: aiReply }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I am unable to connect to the AI service. Please check your VITE_AI_TOKEN or try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold">Dashboard AI</h3>
            </div>
            <button onClick={clearChat} className="p-1 hover:bg-primary-foreground/20 rounded-md transition-colors" title="Clear Chat">
              <Trash2 size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border text-card-foreground rounded-tl-sm shadow-sm'}`}>
                  {msg.role === 'assistant' && <Bot size={14} className="mb-1 text-primary" />}
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ISS or News..."
              className="flex-1 bg-muted px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-primary text-sm"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

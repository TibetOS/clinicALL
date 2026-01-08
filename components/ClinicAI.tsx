
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, X, Bot, User, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Input, Card } from './ui';
import { usePatients, useAppointments, useServices } from '../hooks';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ClinicAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'model', text: 'היי, אני ClinicAI. איך אני יכול לעזור לך בניהול הקליניקה היום?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use hooks for data
  const { patients } = usePatients();
  const { appointments } = useAppointments();
  const { services } = useServices();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Initialize Gemini
      // Assuming process.env.API_KEY is available as per standard env config
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Prepare Context
      const context = `
        Current Date: ${new Date().toLocaleDateString('he-IL')}
        Patients: ${JSON.stringify(patients.map(p => ({ name: p.name, phone: p.phone, nextAppt: p.upcomingAppointment })))}
        Appointments Today: ${JSON.stringify(appointments.map(a => ({ patient: a.patientName, service: a.serviceName, time: a.time, status: a.status })))}
        Services: ${JSON.stringify(services.map(s => s.name))}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: inputValue,
        config: {
          systemInstruction: `You are ClinicAI, a helpful assistant for an aesthetic clinic manager in Israel. 
          You answer in Hebrew (unless asked otherwise). 
          Be concise, professional, and helpful. 
          Use the provided context to answer questions about patients, appointments, and services.
          Context: ${context}`,
        },
      });

      const modelMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: response.text || 'מצטער, נתקלתי בבעיה בעיבוד הבקשה.' 
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: 'אופס, נראה שיש בעיה בחיבור לשרת ה-AI כרגע. אנא בדוק את מפתח ה-API.' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4" dir="rtl">
      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[500px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-teal-600 p-4 rounded-t-xl flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm">ClinicAI</h3>
                <p className="text-[10px] opacity-80">עוזר חכם למרפאה</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                  ${msg.role === 'model' ? 'bg-white text-primary border border-gray-100' : 'bg-primary text-white'}
                `}>
                  {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`
                  p-3 rounded-2xl max-w-[80%] text-sm shadow-sm
                  ${msg.role === 'model' ? 'bg-white border border-gray-100 text-gray-800 rounded-tr-none' : 'bg-primary text-white rounded-tl-none'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-white text-primary border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot size={16} />
                 </div>
                 <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tr-none shadow-sm flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 size={12} className="animate-spin" /> מקליד...
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white rounded-b-xl">
             <form 
               onSubmit={(e) => { e.preventDefault(); handleSend(); }}
               className="flex gap-2"
             >
                <Input
                   name="chat-message"
                   autoComplete="off"
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   placeholder="שאל אותי משהו על הקליניקה..."
                   className="flex-1 bg-gray-50 border-0 focus:ring-1 focus:ring-primary/50 text-sm"
                   disabled={isLoading}
                />
                <Button 
                   type="submit" 
                   size="icon" 
                   className="h-10 w-10 shrink-0 bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm"
                   disabled={!inputValue.trim() || isLoading}
                >
                   <Send size={16} className={isLoading ? 'opacity-0' : 'ml-0.5'} />
                   {isLoading && <Loader2 size={16} className="absolute animate-spin" />}
                </Button>
             </form>
          </div>
        </Card>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95
          ${isOpen ? 'bg-gray-700 rotate-180' : 'bg-gradient-to-r from-primary to-teal-500 animate-pulse-slow'}
        `}
      >
        {isOpen ? <X className="text-white" /> : <Sparkles className="text-white" size={24} />}
        {!isOpen && (
           <span className="absolute -top-1 -right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
           </span>
        )}
      </button>
    </div>
  );
};


import React, { useState } from 'react';
import { 
  Plus, Search, MoreHorizontal, Phone, MessageCircle, 
  Calendar, CheckCircle2, DollarSign, GripVertical 
} from 'lucide-react';
import { Card, Button, Input, Badge, Dialog, Label } from '../components/ui';
import { MOCK_LEADS } from '../data';
import { Lead, LeadStage } from '../types';

const STAGES: { id: LeadStage; label: string; color: string }[] = [
  { id: 'new', label: 'פנייה חדשה', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'contacted', label: 'נוצר קשר', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'consultation', label: 'נקבע ייעוץ', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'won', label: 'סגירת עסקה', color: 'bg-green-50 border-green-200 text-green-700' },
];

export const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Helper to move leads
  const moveLead = (id: string, newStage: LeadStage) => {
    setLeads(leads.map(l => l.id === id ? { ...l, stage: newStage } : l));
  };

  const calculateTotalValue = (stage: LeadStage) => {
    return leads
      .filter(l => l.stage === stage)
      .reduce((sum, l) => sum + (l.value || 0), 0);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-gray-900">ניהול לידים</h1>
           <p className="text-muted-foreground">מעקב אחר מתעניינים ומכירות</p>
        </div>
        <div className="flex gap-2">
            <div className="relative w-64 hidden md:block">
               <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                  placeholder="חיפוש ליד..." 
                  className="pr-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <Button className="shadow-sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="ml-2 h-4 w-4" /> ליד חדש
            </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
         <div className="flex h-full gap-4 min-w-[1000px]">
            {STAGES.map(stage => {
               const stageLeads = leads.filter(l => l.stage === stage.id && l.name.toLowerCase().includes(searchTerm.toLowerCase()));
               
               return (
                  <div key={stage.id} className="flex-1 flex flex-col h-full min-w-[280px] max-w-[350px]">
                     {/* Column Header */}
                     <div className={`p-3 rounded-t-xl border-t-4 bg-white border-x border-b shadow-sm mb-3 flex justify-between items-center ${stage.color.replace('bg-', 'border-t-')}`}>
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                           {stage.label}
                           <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{stageLeads.length}</span>
                        </div>
                        <div className="text-xs font-mono text-gray-500">
                           ₪{calculateTotalValue(stage.id).toLocaleString()}
                        </div>
                     </div>

                     {/* Cards Container */}
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-3">
                        {stageLeads.map(lead => (
                           <Card key={lead.id} className="p-4 cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-primary relative">
                              <div className="flex justify-between items-start mb-2">
                                 <Badge variant="secondary" className="text-[10px]">{lead.source}</Badge>
                                 <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal size={16} />
                                 </button>
                              </div>
                              <h4 className="font-bold text-gray-900">{lead.name}</h4>
                              <p className="text-sm text-gray-500 mb-3">{lead.phone}</p>
                              
                              <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 mb-3 line-clamp-2">
                                 {lead.notes}
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2 mt-2">
                                 <span>{new Date(lead.createdAt).toLocaleDateString('he-IL')}</span>
                                 {lead.value && lead.value > 0 && (
                                    <span className="font-bold text-green-600 flex items-center">
                                       <DollarSign size={12} /> {lead.value}
                                    </span>
                                 )}
                              </div>

                              {/* Quick Move Buttons (Simulating Drag & Drop) */}
                              <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                 {stage.id !== 'new' && (
                                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => moveLead(lead.id, STAGES[STAGES.findIndex(s => s.id === stage.id) - 1].id)}>
                                       <span className="rotate-180">➜</span>
                                    </Button>
                                 )}
                                 <Button size="icon" className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-600" title="Call">
                                    <Phone size={14} />
                                 </Button>
                                 {stage.id !== 'won' && (
                                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => moveLead(lead.id, STAGES[STAGES.findIndex(s => s.id === stage.id) + 1].id)}>
                                       ➜
                                    </Button>
                                 )}
                              </div>
                           </Card>
                        ))}
                        <Button variant="ghost" className="w-full border border-dashed border-gray-300 text-gray-400 hover:text-primary hover:border-primary">
                           <Plus size={16} className="ml-2" /> הוסף כרטיס
                        </Button>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} title="יצירת ליד חדש">
        <div className="space-y-4">
           <div>
              <Label>שם מלא</Label>
              <Input placeholder="ישראל ישראלי" />
           </div>
           <div>
              <Label>טלפון</Label>
              <Input placeholder="050-0000000" className="direction-ltr" />
           </div>
           <div>
              <Label>מקור הגעה</Label>
              <select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                 <option>Instagram</option>
                 <option>Facebook</option>
                 <option>Google</option>
                 <option>חברה מביאה חברה</option>
              </select>
           </div>
           <div>
              <Label>הערות</Label>
              <textarea className="w-full h-20 border border-gray-200 rounded-lg p-2 text-sm" placeholder="מתעניינת ב..." />
           </div>
           <div className="flex justify-end gap-3 pt-4 border-t mt-4">
               <Button variant="ghost" onClick={() => setIsAddOpen(false)}>ביטול</Button>
               <Button onClick={() => setIsAddOpen(false)}>צור ליד</Button>
            </div>
        </div>
      </Dialog>
    </div>
  );
};

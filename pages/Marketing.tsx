
import React, { useState } from 'react';
import {
  Megaphone, MessageCircle, Mail, Users, Send,
  BarChart, Calendar, Smartphone, Plus, RefreshCw
} from 'lucide-react';
import { Card, Button, Input, Badge, Dialog, Label, Tabs, TabsList, TabsTrigger } from '../components/ui';
import { useCampaigns } from '../hooks';

export const MarketingPage = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);

  // Use hook for data
  const { campaigns } = useCampaigns();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-gray-900">שיווק ושימור לקוחות</h1>
           <p className="text-muted-foreground">קמפיינים, אוטומציות ומועדון לקוחות</p>
        </div>
        <Button className="shadow-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none hover:opacity-90" onClick={() => setIsNewCampaignOpen(true)}>
           <Megaphone className="ml-2 h-4 w-4" /> קמפיין חדש
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-indigo-100 font-medium">הודעות שנשלחו החודש</p>
                  <h3 className="text-3xl font-bold mt-1">1,240</h3>
               </div>
               <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Send size={24}/></div>
            </div>
            <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
               <div className="bg-white/80 h-1.5 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="text-xs text-indigo-100 mt-2">70% מחבילת ה-SMS נוצלו</p>
         </Card>

         <Card className="p-6">
             <div className="flex justify-between items-start mb-2">
               <div>
                  <p className="text-gray-500 font-medium">אחוז המרה ממוצע</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">12.5%</h3>
               </div>
               <div className="p-2 bg-green-50 text-green-600 rounded-lg"><BarChart size={24}/></div>
            </div>
            <p className="text-sm text-green-600 font-medium">+2.1% החודש</p>
         </Card>

         <Card className="p-6">
             <div className="flex justify-between items-start mb-2">
               <div>
                  <p className="text-gray-500 font-medium">לקוחות פעילים במועדון</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">482</h3>
               </div>
               <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users size={24}/></div>
            </div>
            <p className="text-sm text-gray-500">מתוך 1,284 מטופלים</p>
         </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList className="bg-white border p-1 rounded-xl mb-6">
            <TabsTrigger value="campaigns" activeValue={activeTab} onClick={setActiveTab}>קמפיינים</TabsTrigger>
            <TabsTrigger value="automations" activeValue={activeTab} onClick={setActiveTab}>אוטומציות</TabsTrigger>
            <TabsTrigger value="templates" activeValue={activeTab} onClick={setActiveTab}>תבניות הודעה</TabsTrigger>
         </TabsList>

         {activeTab === 'campaigns' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
               {campaigns.map(camp => (
                  <Card key={camp.id} className="p-5 hover:shadow-md transition-shadow flex flex-col justify-between h-full border-t-4 border-t-transparent hover:border-t-primary">
                     <div>
                        <div className="flex justify-between items-start mb-3">
                           <Badge variant={
                              camp.status === 'active' ? 'success' : 
                              camp.status === 'completed' ? 'secondary' : 'warning'
                           }>
                              {camp.status === 'active' ? 'פעיל' : 
                               camp.status === 'completed' ? 'הסתיים' : 
                               camp.status === 'scheduled' ? 'מתוזמן' : 'טיוטה'}
                           </Badge>
                           <div className="p-1.5 bg-gray-100 rounded text-gray-600">
                              {camp.type === 'sms' ? <Smartphone size={16} /> : 
                               camp.type === 'whatsapp' ? <MessageCircle size={16} /> : <Mail size={16} />}
                           </div>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{camp.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{camp.audience}</p>
                     </div>

                     <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                           <div>
                              <span className="block text-xl font-bold text-gray-900">{camp.sentCount}</span>
                              <span className="text-xs text-gray-500">נמענים</span>
                           </div>
                           <div>
                              <span className="block text-xl font-bold text-gray-900">{camp.openRate ? `${camp.openRate}%` : '-'}</span>
                              <span className="text-xs text-gray-500">אחוזי פתיחה</span>
                           </div>
                        </div>
                        {camp.scheduledDate && (
                           <div className="mt-3 text-center text-xs text-gray-400 bg-gray-50 py-1 rounded">
                              <Calendar size={12} className="inline ml-1"/> 
                              {new Date(camp.scheduledDate).toLocaleDateString('he-IL')}
                           </div>
                        )}
                     </div>
                  </Card>
               ))}
               
               <button 
                  onClick={() => setIsNewCampaignOpen(true)}
                  className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all min-h-[200px]"
               >
                  <Plus size={32} className="mb-2" />
                  <span className="font-medium">צור קמפיין חדש</span>
               </button>
            </div>
         )}

         {activeTab === 'automations' && (
            <div className="space-y-4 animate-in fade-in">
               {[
                  { title: 'ברכת יום הולדת', desc: 'שליחת הודעת מזל טוב והטבה ביום ההולדת', active: true, icon: '🎂' },
                  { title: 'תזכורת לפני תור', desc: 'שליחת SMS תזכורת 24 שעות לפני התור', active: true, icon: '⏰' },
                  { title: 'שימור לקוחות רדומים', desc: 'פנייה אוטומטית ללקוחות שלא ביקרו 6 חודשים', active: false, icon: '💤' },
                  { title: 'מעקב לאחר הזרקה', desc: 'הודעת "מה שלומך" יום אחרי טיפול', active: true, icon: '👩‍⚕️' }
               ].map((auto, i) => (
                  <Card key={i} className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="text-2xl bg-gray-50 w-12 h-12 flex items-center justify-center rounded-lg">{auto.icon}</div>
                        <div>
                           <h3 className="font-bold text-gray-900">{auto.title}</h3>
                           <p className="text-sm text-gray-500">{auto.desc}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${auto.active ? 'text-green-600' : 'text-gray-400'}`}>
                           {auto.active ? 'פעיל' : 'כבוי'}
                        </span>
                        <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${auto.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${auto.active ? 'left-1' : 'right-1'}`}></div>
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         )}
      </Tabs>

      <Dialog open={isNewCampaignOpen} onClose={() => setIsNewCampaignOpen(false)} title="יצירת קמפיין חדש">
         <div className="space-y-4">
            <div>
               <Label>שם הקמפיין</Label>
               <Input placeholder="לדוג׳: מבצע קיץ" />
            </div>
            
            <div>
               <Label>ערוץ שליחה</Label>
               <div className="grid grid-cols-3 gap-3">
                  {['SMS', 'WhatsApp', 'Email'].map(type => (
                     <div key={type} className="border rounded-lg p-3 text-center hover:border-primary cursor-pointer hover:bg-primary/5 transition-all">
                        <span className="font-bold text-gray-700">{type}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div>
               <Label>קהל יעד</Label>
               <select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
                  <option>כל המטופלים</option>
                  <option>לקוחות VIP</option>
                  <option>נשים בגילאי 30-50</option>
                  <option>לא ביקרו מעל 3 חודשים</option>
               </select>
            </div>

            <div>
               <Label>תוכן ההודעה</Label>
               <textarea 
                  className="w-full h-32 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" 
                  placeholder="היי {שם_פרטי}, מתגעגעים אלייך בקליניקה!..."
               />
               <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>0/70 תווים</span>
                  <span>עלות משוערת: ₪0.00</span>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
               <Button variant="ghost" onClick={() => setIsNewCampaignOpen(false)}>שמור כטיוטה</Button>
               <Button onClick={() => setIsNewCampaignOpen(false)} className="shadow-md">
                  <Send size={16} className="ml-2"/> שלח לאישור
               </Button>
            </div>
         </div>
      </Dialog>
    </div>
  );
};

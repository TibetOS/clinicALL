import React from 'react';
import { MessageCircle, Video, CreditCard, Calendar, Share2, Mail, Smartphone, Globe } from 'lucide-react';
import { Card } from '../ui';

const integrations = [
  { name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500', desc: 'אישורי הגעה אוטומטיים' },
  { name: 'Google Calendar', icon: Calendar, color: 'text-blue-500', desc: 'סנכרון יומן דו-כיווני' },
  { name: 'Zoom', icon: Video, color: 'text-blue-400', desc: 'פגישות ייעוץ אונליין' },
  { name: 'CardCom / ICount', icon: CreditCard, color: 'text-purple-500', desc: 'סליקה וחשבוניות' },
  { name: 'Instagram', icon: Smartphone, color: 'text-pink-500', desc: 'לינקים לזימון מהיר' },
  { name: 'Gmail', icon: Mail, color: 'text-red-500', desc: 'עדכונים ודיוור' },
  { name: 'Facebook', icon: Globe, color: 'text-blue-600', desc: 'קמפיינים ולידים' },
  { name: 'API', icon: Share2, color: 'text-orange-500', desc: 'חיבור לכל מערכת' },
];

export const IntegrationsSection: React.FC = () => {
  return (
    <section id="solutions" className="py-24 bg-white border-t border-gray-100 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight font-['Heebo']">
              מתחברים לכל הכלים <br />
              <span className="text-teal-600">שאתם כבר אוהבים</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              אין צורך לשנות הרגלים. Clinicall מתממשקת בצורה חלקה לכל הפלטפורמות המובילות בשוק, כדי ליצור זרימת עבודה אחת רציפה ואוטומטית.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h4 className="font-bold">בוט וואטסאפ חכם</h4>
                  <p className="text-sm text-gray-500">שולח תזכורות ומעדכן סטטוס תור ביומן אוטומטית.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h4 className="font-bold">סליקה וחשבוניות</h4>
                  <p className="text-sm text-gray-500">חיוב אשראי והפקת מסמך בסיום טיפול בקליק אחד.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full relative">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {integrations.map((tool, idx) => (
                <Card
                  key={idx}
                  className="flex flex-col items-center justify-center p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-gray-100 bg-white/50 backdrop-blur-sm"
                >
                  <tool.icon className={`w-10 h-10 mb-3 ${tool.color}`} strokeWidth={1.5} />
                  <span className="font-medium text-sm text-center">{tool.name}</span>
                  <span className="text-[10px] text-gray-500 text-center mt-1">{tool.desc}</span>
                </Card>
              ))}
            </div>

            {/* Decorative background blob */}
            <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/10 blur-[80px] -z-10 rounded-full"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

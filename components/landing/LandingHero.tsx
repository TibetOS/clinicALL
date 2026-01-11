import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Search, Calendar } from 'lucide-react';
import { Button, Card } from '../ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'אוק', revenue: 4000 },
  { name: 'נוב', revenue: 5500 },
  { name: 'דצמ', revenue: 4800 },
  { name: 'ינו', revenue: 7000 },
  { name: 'פבר', revenue: 6500 },
  { name: 'מרץ', revenue: 9500 },
];

export const LandingHero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-stone-200/40 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/4"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-right space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              חדש! אינטגרציה מלאה לוואטסאפ
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.15] font-['Heebo']">
              ניהול הקליניקה שלך <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">
                מעולם לא היה פשוט יותר
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              מערכת CRM ו-ERP מתקדמת המותאמת במיוחד לקליניקות אסתטיקה ומרכזי יופי.
              נהלי תורים, מלאי ולקוחות במקום אחד - בקלות וביעילות.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto shadow-[0_0_20px_rgba(13,148,136,0.3)] group text-lg h-12">
                  התחילו ניסיון חינם
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-12 bg-white/50 backdrop-blur-sm">
                תיאום הדגמה
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 pt-4">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                <span>14 ימי ניסיון</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                <span>ללא כרטיס אשראי</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                <span>תמיכה בעברית</span>
              </div>
            </div>
          </div>

          {/* Visual / Dashboard Preview */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Decorative Elements behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-stone-300 rounded-2xl blur opacity-20"></div>

            <Card className="relative overflow-hidden border-gray-200 shadow-2xl bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col space-y-1.5 p-6 border-b bg-stone-50/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold leading-none tracking-tight text-lg font-['Heebo']">סקירה חודשית</h3>
                    <p className="text-sm text-gray-500">הכנסות וביצועים</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-6">
                {/* Search Bar / Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-stone-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="חיפוש..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 min-w-0"
                    />
                  </div>

                  <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-stone-50 transition-colors text-sm text-gray-600 font-medium whitespace-nowrap shadow-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>מרץ 2024</span>
                  </button>
                </div>

                <div className="h-[260px] w-full" style={{ direction: 'ltr' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                      <XAxis
                        dataKey="name"
                        stroke="#78716C"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        reversed={true}
                      />
                      <YAxis
                        stroke="#78716C"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₪${value}`}
                        orientation="right"
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`₪${value ?? 0}`, 'הכנסות']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0D9488"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 border-t border-gray-100 pt-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">תורים שבוצעו</p>
                    <p className="text-2xl font-bold text-gray-900 font-['Heebo']">142</p>
                  </div>
                  <div className="text-center border-x border-gray-100">
                    <p className="text-sm text-gray-500">לקוחות חדשים</p>
                    <p className="text-2xl font-bold text-teal-600 font-['Heebo']">+28</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">הכנסות</p>
                    <p className="text-2xl font-bold text-gray-900 font-['Heebo']">₪9.5k</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating Notification */}
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 animate-gentle-bounce">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">הזמנה חדשה התקבלה</p>
                <p className="text-xs text-gray-500">לפני 2 דקות • דנה כהן</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

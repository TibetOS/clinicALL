import React, { useState, useEffect } from 'react';
import { Calendar, Users, Package, Smartphone, ShieldCheck, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '../ui';

const features = [
  {
    icon: Calendar,
    title: 'ניהול יומן חכם',
    description: 'מערכת זימון תורים מתקדמת המונעת כפילויות, מנהלת חדרי טיפול ושולחת תזכורות אוטומטיות ללקוחות למניעת אי-הגעה.',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    icon: Users,
    title: 'תיק לקוח דיגיטלי',
    description: 'CRM מלא הכולל היסטוריית טיפולים, תמונות לפני/אחרי, הצהרות בריאות חתומות דיגיטלית ומעקב התקדמות אישי.',
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    icon: Package,
    title: 'ניהול מלאי ורכש',
    description: 'מעקב מדויק אחר צריכת חומרים בטיפולים, התראות אוטומטיות על מלאי נמוך והפקת דרישות רכש מספקים.',
    color: 'text-teal-600',
    bg: 'bg-teal-50'
  },
  {
    icon: Smartphone,
    title: 'אפליקציה ומותג',
    description: 'אפליקציה ממותגת ללקוחות שלך: קביעת תורים 24/7, צפייה בהיסטוריה, מילוי טפסים ושליחת הודעות.',
    color: 'text-pink-600',
    bg: 'bg-pink-50'
  },
  {
    icon: ShieldCheck,
    title: 'אבטחת מידע רפואית',
    description: 'תקני אבטחה מחמירים (HIPAA/GDPR), גיבויים יומיים בענן והצפנת נתונים לשמירה מלאה על פרטיות המטופלים.',
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  {
    icon: BarChart3,
    title: 'דוחות ובינה עסקית',
    description: 'דשבורד ניהולי חכם עם תובנות עסקיות, דוחות רווח והפסד, ניתוח יעילות עובדים ומדדי צמיחה.',
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  }
];

const SkeletonCard = () => (
  <div className="rounded-xl border border-gray-100 bg-white p-6 h-full space-y-4">
    <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse" />
    <div className="h-6 w-3/4 bg-gray-100 rounded animate-pulse" />
    <div className="space-y-2 pt-2">
      <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
      <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
    </div>
  </div>
);

export const FeaturesSection: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-sm font-medium">
            <Sparkles size={14} />
            <span>הכל כלול</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight font-['Heebo']">
            כל הכלים לניהול קליניקה מנצחת
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Clinicall מרכזת את כל הפעילות העסקית והטיפולית במקום אחד, כדי שאתם תוכלו להתרכז במה שחשוב באמת - הלקוחות שלכם.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
            : features.map((feature, index) => (
              <Card
                key={index}
                className="group relative h-full border-gray-100 hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right bg-teal-500"></div>

                <div className="p-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${feature.bg} ${feature.color}`}>
                    <feature.icon size={28} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 font-['Heebo']">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  <div className="flex items-center text-teal-600 font-medium text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    קרא עוד <ArrowRight size={16} className="mr-1" />
                  </div>
                </div>
              </Card>
            ))
          }
        </div>
      </div>
    </section>
  );
};

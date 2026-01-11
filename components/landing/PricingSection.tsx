import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Button, Card, cn } from '../ui';

const plans = [
  {
    name: 'בסיסי',
    monthlyPrice: 199,
    yearlyPrice: 159,
    description: 'מתאים לקליניקות בתחילת הדרך',
    features: [
      'ניהול יומן תורים (עד 2 עובדים)',
      'תיק לקוח דיגיטלי בסיסי',
      'תזכורות SMS אוטומטיות',
      'דוחות חודשיים בסיסיים',
      'תמיכה במייל'
    ],
    highlight: false
  },
  {
    name: 'מקצועי',
    monthlyPrice: 349,
    yearlyPrice: 279,
    description: 'הבחירה הפופולרית למרכזים פעילים',
    features: [
      'כל מה שבבסיסי, ועוד:',
      'ניהול יומן ללא הגבלה',
      'ניהול מלאי מתקדם',
      'בוט וואטסאפ לאישורי הגעה',
      'אפליקציה ממותגת ללקוחות',
      'סליקת אשראי והפקת חשבוניות',
      'תמיכה בוואטסאפ וטלפון'
    ],
    highlight: true,
    tag: 'הכי משתלם'
  },
  {
    name: 'אנטרפרייז',
    monthlyPrice: null,
    yearlyPrice: null,
    priceText: 'מותאם אישית',
    description: 'לרשתות ומרכזים רפואיים גדולים',
    features: [
      'כל מה שבמקצועי, ועוד:',
      'מערכת ניהול סניפים (HQ)',
      'חיבור ל-API והתאמות אישיות',
      'מנהל תיק לקוח אישי (CSM)',
      'הדרכות צוות פרונטליות',
      'SLA מורחב',
      'ייצוא נתונים ל-BI חיצוני'
    ],
    highlight: false
  }
];

export const PricingSection: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-stone-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 font-['Heebo']">
            מסלולים ומחירים
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            שקיפות מלאה, ללא הפתעות. בחרו את המסלול המתאים לקצב הצמיחה שלכם.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>תשלום חודשי</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                isYearly ? "bg-teal-600" : "bg-gray-200"
              )}
              role="switch"
              aria-checked={isYearly}
            >
              <span className={cn(
                "pointer-events-none block h-7 w-7 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
                isYearly ? 'translate-x-0' : '-translate-x-6'
              )} />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              תשלום שנתי
              <span className="mr-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                חסוך 20%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={cn(
                "flex flex-col relative transition-all duration-300",
                plan.highlight
                  ? 'border-teal-500 shadow-[0_0_20px_rgba(13,148,136,0.3)] scale-105 z-10 bg-white'
                  : 'border-gray-100 hover:border-teal-500/50 bg-white/50 hover:bg-white'
              )}
            >
              {plan.tag && (
                <div className="absolute -top-4 right-0 left-0 flex justify-center">
                  <div className="bg-teal-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star size={14} fill="currentColor" /> {plan.tag}
                  </div>
                </div>
              )}

              <div className={`${plan.tag ? 'pt-8' : 'pt-6'} px-6 text-center pb-8 border-b border-gray-100`}>
                <h3 className="text-xl mb-4 text-gray-500 font-['Heebo']">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  {plan.monthlyPrice ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900 font-['Heebo']">
                        ₪{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-gray-500 text-sm">/לחודש</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900 font-['Heebo']">{plan.priceText}</span>
                  )}
                </div>
                {isYearly && plan.monthlyPrice && (
                  <p className="text-xs text-green-600 font-medium mt-2">
                    חיסכון של ₪{((plan.monthlyPrice - (plan.yearlyPrice || 0)) * 12).toLocaleString()} בשנה
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-4">{plan.description}</p>
              </div>

              <div className="flex-1 flex flex-col p-6">
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className={cn(
                        "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                        plan.highlight ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-500'
                      )}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-gray-700 leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.monthlyPrice ? '/signup' : '#'}>
                  <Button
                    className="w-full h-12 text-base shadow-none"
                    variant={plan.highlight ? 'primary' : 'outline'}
                  >
                    {plan.monthlyPrice ? 'התחל ניסיון חינם' : 'צור קשר'}
                  </Button>
                </Link>
                {plan.monthlyPrice && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    ללא התחייבות • 14 ימי ניסיון
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

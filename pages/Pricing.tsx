
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, Minus, ChevronDown, ChevronUp, HelpCircle,
  ShieldCheck, CreditCard, ArrowRight, Star, X
} from 'lucide-react';
import { Button, Card, Badge, Switch } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export const PricingPage = () => {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  // Pricing configuration
  const pricing = {
    starter: { monthly: 129, yearly: 109 },
    pro: { monthly: 269, yearly: 219 },
    premium: { monthly: 499, yearly: 399 }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'לקליניקה הביתית',
      price: isYearly ? pricing.starter.yearly : pricing.starter.monthly,
      description: 'כל הכלים הבסיסיים להתחיל לעבוד בצורה מסודרת.',
      features: [
        'יומן תורים חכם',
        'קישור לזימון אונליין',
        'ניהול תיקי לקוחות (CRM)',
        'עד 500 מטופלים',
        'תזכורות SMS (בסיסי)'
      ],
      cta: 'התחל ניסיון חינם',
      highlight: false
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'לעסק בצמיחה',
      price: isYearly ? pricing.pro.yearly : pricing.pro.monthly,
      description: 'הפתרון המושלם למרפאות פעילות שרוצות למנוע ביטולים.',
      features: [
        'כל מה שיש ב-Starter',
        'תזכורות WhatsApp אוטומטיות',
        'הגנת No-Show (פיקדון אשראי)',
        'ניהול מלאי מתקדם',
        'הפקת חשבוניות אוטומטית (חשבונית ירוקה)',
        'עד 2,000 מטופלים'
      ],
      cta: 'התחל ניסיון חינם',
      highlight: true
    },
    {
      id: 'premium',
      name: 'Premium',
      subtitle: 'לרשתות וספא',
      price: isYearly ? pricing.premium.yearly : pricing.premium.monthly,
      description: 'חבילת הכל-כלול לניהול צוות וסניפים מרובים.',
      features: [
        'כל מה שיש ב-Pro',
        'צוות ללא הגבלה',
        'גישה ל-API',
        'תמיכה טלפונית מועדפת',
        'ניהול סניפים',
        'מטופלים ללא הגבלה'
      ],
      cta: 'צור קשר למכירות',
      highlight: false
    }
  ];

  const faqs = [
    {
      q: "מה קורה אחרי 30 יום?",
      a: "בתום תקופת הניסיון, תוכל לבחור את המסלול המתאים לך ולהזין אמצעי תשלום. כל המידע שהזנת יישמר. אם לא תרצה להמשיך, המנוי ייעצר ולא תחויב."
    },
    {
      q: "האם המחיר כולל מע״מ?",
      a: "המחירים המוצגים אינם כוללים מע״מ. חשבונית מס כחוק תופק עבור כל תשלום ותשלח אליך למייל."
    },
    {
      q: "האם אפשר לשדרג או לשנמך את החבילה?",
      a: "כן, ניתן לעבור בין מסלולים בכל רגע נתון דרך מסך ההגדרות. החיוב יתעדכן באופן יחסי (Prorated) לחלק היחסי של החודש."
    }
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
       {/* Navbar (Simplified) */}
       <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
           <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm">C</div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">ClinicALL</span>
           </Link>
           <div className="flex items-center gap-3">
              <Link to={user ? "/admin/dashboard" : "/login"}>
                <Button variant="ghost">{user ? "לוח בקרה" : "התחבר"}</Button>
              </Link>
              <Link to="/signup">
                <Button className="shadow-md">נסה חינם</Button>
              </Link>
           </div>
        </div>
      </nav>

      <main className="pb-24">
        {/* Header Section */}
        <section className="pt-16 pb-12 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">מחיר פשוט. ללא הפתעות.</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            התחל עם 30 ימי ניסיון חינם. ללא צורך בכרטיס אשראי בהרשמה.
            <br />
            מחיר של טיפול אחד מכסה את כל העלות החודשית.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>תשלום חודשי</span>
            <div className="flex items-center gap-2">
               <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-primary" />
            </div>
            <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${isYearly ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
              תשלום שנתי 
              <Badge variant="success" className="text-[10px] py-0 px-2 h-5">חיסכון של 20%</Badge>
            </span>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`
                  relative p-8 flex flex-col h-full transition-all duration-300
                  ${plan.highlight 
                    ? 'border-primary shadow-xl scale-105 z-10 bg-white ring-1 ring-primary/20' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg bg-gray-50/50'}
                `}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-teal-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                    הכי פופולרי
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{plan.subtitle}</p>
                </div>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">₪{plan.price}</span>
                  <span className="text-gray-500 text-sm">/חודש</span>
                </div>

                <p className="text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100 min-h-[60px]">
                  {plan.description}
                </p>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="mt-0.5 min-w-[16px]">
                         <Check size={16} className="text-green-500" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/signup" className="mt-auto">
                  <Button 
                    className={`w-full h-12 text-base ${plan.highlight ? 'bg-primary hover:bg-primary/90' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
                <p className="text-xs text-center text-gray-400 mt-3">ללא התחייבות • ביטול בכל עת</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
          <h2 className="text-2xl font-bold text-center mb-10">השוואת פיצ׳רים מלאה</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="p-4 w-1/4"></th>
                  <th className="p-4 text-center font-bold text-gray-900">Starter</th>
                  <th className="p-4 text-center font-bold text-primary text-lg">Pro</th>
                  <th className="p-4 text-center font-bold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: 'יומן תורים וזימון אונליין', starter: true, pro: true, premium: true },
                  { feature: 'תיק רפואי דיגיטלי', starter: true, pro: true, premium: true },
                  { feature: 'תזכורות אוטומטיות', starter: 'SMS בלבד', pro: 'WhatsApp + SMS', premium: 'WhatsApp + SMS' },
                  { feature: 'הגנת ביטולים (פיקדון)', starter: false, pro: true, premium: true },
                  { feature: 'ניהול מלאי', starter: false, pro: true, premium: true },
                  { feature: 'חשבונית ירוקה (אוטומציה)', starter: false, pro: true, premium: true },
                  { feature: 'מספר אנשי צוות', starter: '1', pro: 'עד 5', premium: 'ללא הגבלה' },
                  { feature: 'תמיכה טכנית', starter: 'אימייל', pro: 'צ׳אט + אימייל', premium: 'טלפוני VIP' },
                  { feature: 'API Access', starter: false, pro: false, premium: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-700">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? <Check size={18} className="mx-auto text-green-500"/> : <Minus size={18} className="mx-auto text-gray-300"/>
                      ) : <span className="text-gray-600">{row.starter}</span>}
                    </td>
                    <td className="p-4 text-center bg-primary/5 font-medium">
                       {typeof row.pro === 'boolean' ? (
                        row.pro ? <Check size={18} className="mx-auto text-primary"/> : <Minus size={18} className="mx-auto text-gray-300"/>
                      ) : <span className="text-gray-900">{row.pro}</span>}
                    </td>
                    <td className="p-4 text-center">
                       {typeof row.premium === 'boolean' ? (
                        row.premium ? <Check size={18} className="mx-auto text-green-500"/> : <Minus size={18} className="mx-auto text-gray-300"/>
                      ) : <span className="text-gray-600">{row.premium}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">שאלות נפוצות</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-4 text-right font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
                </button>
                {openFaqIndex === idx && (
                  <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-50 bg-gray-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Trust Footer */}
        <section className="text-center border-t pt-10 px-4">
           <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500 mb-2">מאובטח בסטנדרט הגבוה ביותר</p>
              <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                 <div className="flex items-center gap-1 font-bold text-blue-800"><CreditCard size={20}/> Visa</div>
                 <div className="flex items-center gap-1 font-bold text-orange-600"><CreditCard size={20}/> MasterCard</div>
                 <div className="flex items-center gap-1 font-bold text-green-600"><ShieldCheck size={20}/> SSL Secured</div>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
};

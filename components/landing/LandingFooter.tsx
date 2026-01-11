import React from 'react';
import { Sparkles } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={20} className="text-teal-400" />
              <span className="font-bold text-xl font-['Heebo']">Clinicall</span>
            </div>
            <p className="text-sm text-stone-400">
              הפלטפורמה המובילה בישראל לניהול קליניקות אסתטיקה ומרכזי יופי.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">מוצר</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-teal-400 transition-colors">פיצ'רים</a></li>
              <li><a href="#pricing" className="hover:text-teal-400 transition-colors">מחירון</a></li>
              <li><a href="#solutions" className="hover:text-teal-400 transition-colors">אינטגרציות</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">עדכונים</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">חברה</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">אודות</a></li>
              <li><a href="#trust" className="hover:text-teal-400 transition-colors">לקוחות</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">קריירה</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">צור קשר</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">משפטי</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">תנאי שימוש</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">מדיניות פרטיות</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">אבטחת מידע</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Clinicall. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
};

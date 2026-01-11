import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button, cn } from '../ui';

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  question,
  answer,
  isOpen,
  onClick
}) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onClick}
        className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-teal-600 w-full text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-sm group"
      >
        <span className={cn(
          "text-lg font-['Heebo'] transition-colors",
          isOpen ? 'text-teal-600' : 'text-gray-900'
        )}>
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 transition-transform duration-300 ease-out text-gray-500 group-hover:text-teal-600",
            isOpen ? 'rotate-180' : ''
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="text-gray-600 leading-relaxed pb-6 pt-1">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const faqs = [
  {
    id: 'item-1',
    question: 'האם המערכת מתאימה לקליניקות קטנות?',
    answer: 'בהחלט. Clinicall נבנתה בגמישות מקסימלית. יש לנו מסלול ייעודי לקליניקות בוטיק הכולל את כל הפיצ׳רים החיוניים במחיר מותאם, עם אפשרות לשדרג ככל שהעסק גדל.'
  },
  {
    id: 'item-2',
    question: 'כמה זמן לוקח להטמיע את המערכת?',
    answer: 'ההטמעה היא כמעט מיידית. מרגע ההרשמה, המערכת מוכנה לעבודה תוך דקות. צוות ההצלחה שלנו ילווה אתכם בהעברת נתונים ממערכות ישנות ובייבוא רשימות לקוחות, תהליך שלוקח בדרך כלל פחות מ-24 שעות.'
  },
  {
    id: 'item-3',
    question: 'האם המידע הרפואי מאובטח?',
    answer: 'אבטחת המידע היא בראש סדר העדיפויות שלנו. אנו משתמשים בהצפנה ברמה בנקאית (AES-256), גיבויים אוטומטיים יומיים בענן, ועומדים בתקני אבטחה בינלאומיים מחמירים לשמירה על פרטיות המטופלים.'
  },
  {
    id: 'item-4',
    question: 'האם יש התחייבות לתקופת שימוש?',
    answer: 'לא. אנו מאמינים במוצר שלנו ולכן אין התחייבות ארוכת טווח. ניתן לבטל את המנוי בכל עת ללא קנסות יציאה. התשלום מתבצע על בסיס חודשי.'
  }
];

export const FAQSection: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>('item-1');

  const handleToggle = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12">

          <div className="lg:w-1/3 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 font-['Heebo']">
              שאלות נפוצות
            </h2>
            <p className="text-gray-600 text-lg">
              לא מצאתם את התשובה שחיפשתם? הצוות שלנו זמין עבורכם בכל שאלה.
            </p>
            <Button variant="outline" className="mt-4">
              צרו קשר עם התמיכה
            </Button>
          </div>

          <div className="lg:w-2/3">
            <div className="space-y-2">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openItem === faq.id}
                  onClick={() => handleToggle(faq.id)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

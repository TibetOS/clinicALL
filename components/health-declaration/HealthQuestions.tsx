import { Input } from '../ui';
import type { HealthQuestion, HealthStepProps } from './types';

// Health questions constant
export const HEALTH_QUESTIONS: HealthQuestion[] = [
  { id: 'q1', text: { en: 'Are you pregnant or breastfeeding?', he: 'האם את בהריון או מניקה?' }, details: false },
  { id: 'q2', text: { en: 'Do you suffer from any allergies (medications, food, latex)?', he: 'האם ידועה רגישות לתרופות, מזון או לטקס?' }, details: true },
  { id: 'q3', text: { en: 'Have you taken Roaccutane in the past 6 months?', he: 'האם נטלת רואקוטן ב-6 החודשים האחרונים?' }, details: false },
  { id: 'q4', text: { en: 'Do you have any autoimmune diseases?', he: 'האם את/ה סובל/ת ממחלות אוטואימוניות?' }, details: true },
  { id: 'q5', text: { en: 'Do you take blood thinners or have coagulation problems?', he: 'האם את/ה נוטל/ת מדללי דם או סובל/ת מבעיות קרישה?' }, details: false },
  { id: 'q6', text: { en: 'Do you have diabetes?', he: 'האם את/ה סובל/ת מסוכרת?' }, details: false },
  { id: 'q7', text: { en: 'Do you suffer from Herpes Simplex (cold sores)?', he: 'האם את/ה סובל/ת מהרפס?' }, details: false },
  { id: 'q8', text: { en: 'Do you have permanent fillers or implants in the treated area?', he: 'האם ישנם חומרי מילוי קבועים או שתלים באזור הטיפול?' }, details: true },
  { id: 'q9', text: { en: 'Do you have any active skin infection or open wounds?', he: 'האם יש דלקת עור פעילה או פצעים פתוחים?' }, details: false },
];

type HealthQuestionsListProps = Pick<HealthStepProps, 'formData' | 'lang' | 't' | 'updateNested'>;

export const HealthQuestionsList = ({
  formData,
  lang,
  t,
  updateNested,
}: HealthQuestionsListProps) => {
  return (
    <div className="space-y-4">
      {HEALTH_QUESTIONS.map((q) => (
        <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-red-200 transition-colors">
          <div className="flex justify-between items-start gap-4">
            <span className="text-sm font-medium text-gray-800 pt-1">{lang === 'he' ? q.text.he : q.text.en}</span>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
              <button
                onClick={() => updateNested('healthQuestions', q.id, false)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.healthQuestions[q.id] === false ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('לא', 'No')}
              </button>
              <button
                onClick={() => updateNested('healthQuestions', q.id, true)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.healthQuestions[q.id] === true ? 'bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('כן', 'Yes')}
              </button>
            </div>
          </div>
          {q.details && formData.healthQuestions[q.id] && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
              <Input
                placeholder={t('אנא פרטי...', 'Please specify...')}
                value={formData.healthDetails[q.id] || ''}
                onChange={(e) => updateNested('healthDetails', q.id, e.target.value)}
                className="text-sm border-red-100 focus:border-red-300 focus:ring-red-200"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

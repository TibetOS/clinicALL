import { Heart, Sparkles } from 'lucide-react';
import { Label, Switch } from '../ui';
import type { HealthStepProps } from './types';

export const LifestyleStep = ({
  formData,
  t,
  updateNested,
}: HealthStepProps) => {
  return (
    <div className="animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="bg-purple-50/50 p-6 border-b border-purple-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm"><Heart size={20}/></div>
          <h2 className="text-xl font-bold text-gray-900">{t('אורח חיים', 'Lifestyle')}</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {[
          { id: 'smoke', label: t('האם את מעשנת?', 'Do you smoke?') },
          { id: 'alcohol', label: t('האם את שותה אלכוהול בקביעות?', 'Drink alcohol regularly?') },
          { id: 'sun', label: t('חשיפה קבועה לשמש / מיטת שיזוף?', 'Regular sun exposure?') },
        ].map(item => (
          <div key={item.id} className="flex justify-between items-center py-2 border-b border-dashed border-gray-100 last:border-0">
            <span className="text-sm font-medium">{item.label}</span>
            <Switch
              checked={(formData.lifestyle as Record<string, boolean | string>)[item.id] as boolean}
              onCheckedChange={(val) => updateNested('lifestyle', item.id, val)}
            />
          </div>
        ))}

        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
          <Label className="text-orange-800 mb-3 block">{t('כיצד עורך מגיב לשמש?', 'How does your skin react to sun?')}</Label>
          <div className="grid grid-cols-3 gap-2">
            {['burns', 'tans', 'rarely'].map(opt => (
              <button
                key={opt}
                onClick={() => updateNested('lifestyle', 'sunReaction', opt)}
                className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all ${
                  formData.lifestyle.sunReaction === opt
                    ? 'bg-white border-orange-300 text-orange-700 shadow-sm'
                    : 'bg-white/50 border-transparent text-gray-500 hover:bg-white'
                }`}
              >
                {opt === 'burns' ? t('נשרף בקלות', 'Burns') : opt === 'tans' ? t('משתזף', 'Tans') : t('כמעט ולא', 'Rarely')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-teal-50/50 p-6 border-t border-teal-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white rounded-lg text-teal-600 shadow-sm"><Sparkles size={20}/></div>
          <h2 className="text-lg font-bold text-gray-900">{t('טיפולים ותכשירים', 'Treatments & Products')}</h2>
        </div>

        <div className="space-y-4">
          {[
            { id: 'activeIngredients', label: t('שימוש בחומרים פעילים (חומצות/רטינול)?', 'Use active ingredients?') },
            { id: 'retinA', label: t('שימוש ברטין-A / רואקוטן לאחרונה?', 'Used prescription Retin-A?') },
            { id: 'pastTreatments', label: t('האם עברת טיפולים אסתטיים בעבר?', 'Past aesthetic treatments?') },
            { id: 'abnormalReaction', label: t('האם הייתה תגובה חריגה לטיפול?', 'Had abnormal reaction?') },
          ].map(item => (
            <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <Switch
                checked={(formData.treatments as Record<string, boolean>)[item.id]}
                onCheckedChange={(val) => updateNested('treatments', item.id, val)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

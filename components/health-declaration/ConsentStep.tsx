import { Shield, Sparkles, AlertCircle, FileText, Check } from 'lucide-react';
import { Input, Label } from '../ui';
import { SignaturePad } from './SignaturePad';
import type { HealthStepProps } from './types';

export const ConsentStep = ({
  formData,
  validationErrors,
  lang,
  t,
  updateForm,
}: HealthStepProps) => {
  return (
    <div className="animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="bg-primary/5 p-6 border-b border-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white rounded-lg text-primary shadow-sm"><Shield size={20}/></div>
          <h2 className="text-xl font-bold text-gray-900">{t('הסכמה וחתימה', 'Consent & Signature')}</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
          <h4 className="font-bold flex items-center gap-2 mb-2"><Sparkles size={14}/> {t('הנחיות חשובות', 'Instructions')}</h4>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>{t('אין לשטוף פנים במים חמים ב-24 שעות הקרובות', 'Avoid hot water on face for 24h')}</li>
            <li>{t('יש להימנע מחשיפה לשמש', 'Avoid sun exposure')}</li>
            <li>{t('במקרה של אדמומיות חריגה יש לפנות למרפאה', 'Contact clinic if unusual redness occurs')}</li>
          </ul>
        </div>

        {/* Policy */}
        <div className="border rounded-xl p-4 bg-gray-50/50">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{t('מדיניות ביטולים', 'Cancellation Policy')}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t(
                  'ביטול תור עד 48 שעות מראש - ללא עלות. ביטול בטווח של פחות מ-48 שעות יחויב במלוא עלות הטיפול. איחור של מעל 15 דקות עלול לגרור ביטול התור.',
                  'Cancellation up to 48 hours in advance - no charge. Less than 48 hours - full charge. Being late over 15 mins may result in cancellation.'
                )}
              </p>
            </div>
          </div>
          <div className="h-px bg-gray-200 my-4"></div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`mt-0.5 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${formData.consent ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'}`}>
              {formData.consent && <Check size={14} />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.consent} onChange={e => updateForm('consent', e.target.checked)} />
            <span className="text-sm text-gray-700 select-none group-hover:text-gray-900">{t('קראתי והבנתי את כל האמור לעיל ואני מאשר/ת את התנאים', 'I have read and agree to all terms above')}</span>
          </label>
          {validationErrors.consent && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> {validationErrors.consent}
            </p>
          )}
        </div>

        {/* Signature */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <Label className="mb-0 flex items-center gap-2"><FileText size={14}/> {t('חתימה דיגיטלית', 'Digital Signature')}</Label>
            <span className="text-xs text-gray-400 font-mono">{new Date().toLocaleDateString('he-IL')}</span>
          </div>
          <Input value={formData.fullName} readOnly className="mb-3 bg-gray-50 border-none text-gray-500" />
          <SignaturePad
            lang={lang}
            onEnd={(data) => updateForm('signature', data)}
            onClear={() => updateForm('signature', null)}
          />
          {validationErrors.signature && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> {validationErrors.signature}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

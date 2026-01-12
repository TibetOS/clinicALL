import { User, Heart, UserCheck, AlertCircle } from 'lucide-react';
import { Input, Label } from '../ui';
import { HealthQuestionsList } from './HealthQuestions';
import type { HealthStepProps } from './types';
import type { HealthDeclarationToken } from '../../types';

type PersonalInfoStepProps = HealthStepProps & {
  token?: HealthDeclarationToken;
};

export const PersonalInfoStep = ({
  formData,
  validationErrors,
  lang,
  t,
  updateForm,
  updateNested,
  token,
}: PersonalInfoStepProps) => {
  return (
    <div className="animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="bg-primary/5 p-6 border-b border-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white rounded-lg text-primary shadow-sm"><User size={20}/></div>
          <h2 className="text-xl font-bold text-gray-900">{t('פרטים אישיים', 'Personal Information')}</h2>
        </div>
        {token?.patientName && (
          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-primary/10 flex items-center gap-3 text-sm text-primary mt-2">
            <UserCheck size={16} />
            <span className="font-medium">{t(`שלום, ${token.patientName}`, `Hello, ${token.patientName}`)}</span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div>
          <Label>{t('שם מלא *', 'FULL NAME *')}</Label>
          <Input
            value={formData.fullName}
            onChange={e => updateForm('fullName', e.target.value)}
            className={`h-12 bg-gray-50 border-gray-200 focus:bg-white ${validationErrors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
            aria-invalid={!!validationErrors.fullName}
            aria-describedby={validationErrors.fullName ? 'fullName-error' : undefined}
          />
          {validationErrors.fullName && (
            <p id="fullName-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> {validationErrors.fullName}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('תאריך לידה *', 'DATE OF BIRTH *')}</Label>
            <Input type="date" value={formData.dob} onChange={e => updateForm('dob', e.target.value)} className="h-12 bg-gray-50 border-gray-200 focus:bg-white" />
          </div>
          <div>
            <Label>{t('טלפון *', 'PHONE *')}</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={e => updateForm('phone', e.target.value)}
              className={`h-12 bg-gray-50 border-gray-200 focus:bg-white text-left direction-ltr ${validationErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
              aria-invalid={!!validationErrors.phone}
              aria-describedby={validationErrors.phone ? 'phone-error' : undefined}
            />
            {validationErrors.phone && (
              <p id="phone-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {validationErrors.phone}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label>{t('אימייל', 'EMAIL')}</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={e => updateForm('email', e.target.value)}
            className={`h-12 bg-gray-50 border-gray-200 focus:bg-white text-left direction-ltr ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
            aria-invalid={!!validationErrors.email}
            aria-describedby={validationErrors.email ? 'email-error' : undefined}
          />
          {validationErrors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> {validationErrors.email}
            </p>
          )}
        </div>
      </div>

      <div className="bg-red-50/50 p-6 border-t border-red-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm"><Heart size={20}/></div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('שאלון רפואי', 'Health Questions')}</h2>
            <p className="text-xs text-gray-500">{t('אנא עני בכנות למען בטיחותך', 'Answer honestly for safety')}</p>
          </div>
        </div>

        <HealthQuestionsList
          formData={formData}
          lang={lang}
          t={t}
          updateNested={updateNested}
        />
      </div>
    </div>
  );
};

import { User, Building2, Phone, Award, Palette, Check } from 'lucide-react';
import { STEPS } from './types';

const ICONS = {
  User,
  Building2,
  Phone,
  Award,
  Palette,
  Check,
} as const;

type SignupStepIndicatorProps = {
  currentStep: number;
};

export const SignupStepIndicator = ({ currentStep }: SignupStepIndicatorProps) => {
  return (
    <div className="bg-gray-50 p-6 border-b">
      <div className="flex justify-between max-w-md mx-auto relative mb-2">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 -z-0" />
        {/* Progress line */}
        <div
          className="absolute top-1/2 right-0 h-0.5 bg-primary -translate-y-1/2 -z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const Icon = ICONS[step.icon];
          const isActive = currentStep >= idx + 1;
          return (
            <div key={idx} className="relative z-10 bg-gray-50 px-2">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2
                  ${isActive ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-300 text-gray-400'}
                `}
              >
                <Icon size={14} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900">{STEPS[currentStep - 1]?.title}</h2>
      </div>
    </div>
  );
};

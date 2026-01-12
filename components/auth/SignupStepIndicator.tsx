import {
  Phone,
  Mail,
  Building2,
  Grid3X3,
  Clock,
  Scissors,
  Globe,
} from 'lucide-react';
import { STEPS } from './types';

const ICONS = {
  Phone,
  Mail,
  Building2,
  Grid3X3,
  Clock,
  Scissors,
  Globe,
} as const;

type SignupStepIndicatorProps = {
  currentStep: number;
};

export const SignupStepIndicator = ({ currentStep }: SignupStepIndicatorProps) => {
  return (
    <div className="bg-gray-50 p-6 border-b">
      <div className="flex justify-between max-w-lg mx-auto relative mb-2">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 -z-0" />
        {/* Progress line */}
        <div
          className="absolute top-1/2 right-0 h-0.5 bg-primary -translate-y-1/2 -z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const Icon = ICONS[step.icon as keyof typeof ICONS];
          const isActive = currentStep >= idx + 1;
          const isCurrent = currentStep === idx + 1;
          return (
            <div key={idx} className="relative z-10 bg-gray-50 px-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2
                  ${isActive
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-400'}
                  ${isCurrent ? 'ring-4 ring-primary/20' : ''}
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
        <p className="text-xs text-gray-500 mt-1">
          שלב {currentStep} מתוך {STEPS.length}
        </p>
      </div>
    </div>
  );
};

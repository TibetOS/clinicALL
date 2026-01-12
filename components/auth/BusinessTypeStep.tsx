import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button, cn } from '../ui';
import type { SignupStepProps, BusinessTypeKey } from './types';
import { BUSINESS_TYPES } from './types';

// Icon lookup - maps icon name to component
const getIcon = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Hand: Icons.Hand,
    Scissors: Icons.Scissors,
    Eye: Icons.Eye,
    Sparkles: Icons.Sparkles,
    Wind: Icons.Wind,
    Droplet: Icons.Droplet,
    Palette: Icons.Palette,
    Zap: Icons.Zap,
    Heart: Icons.Heart,
    Pen: Icons.PenTool,
    Stethoscope: Icons.Stethoscope,
    Syringe: Icons.Syringe,
    Leaf: Icons.Leaf,
    Dog: Icons.Dog,
    Glasses: Icons.Glasses,
    Dumbbell: Icons.Dumbbell,
    MoreHorizontal: Icons.MoreHorizontal,
  };
  return iconMap[iconName] || Icons.CircleDot;
};

export const BusinessTypeStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
  onBack,
}: SignupStepProps) => {
  const selectedTypes = formData.businessTypes;
  const maxSelections = 3;

  const handleToggleType = (key: BusinessTypeKey) => {
    const current = [...selectedTypes];
    const index = current.indexOf(key);

    if (index === -1) {
      // Add if not at max
      if (current.length < maxSelections) {
        onChange('businessTypes', [...current, key]);
      }
    } else {
      // Remove
      current.splice(index, 1);
      onChange('businessTypes', current);
    }
  };

  const isSelected = (key: BusinessTypeKey) => selectedTypes.includes(key);
  const isDisabled = (key: BusinessTypeKey) =>
    selectedTypes.length >= maxSelections && !isSelected(key);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">מה סוג העסק שלך?</h2>
        <p className="text-gray-500 mt-2">
          בחר/י את סוג העסק שלך. ניתן לבחור עד {maxSelections} סוגי עסקים
        </p>
      </div>

      {fieldErrors.businessTypes && (
        <p className="text-red-500 text-sm text-center">{fieldErrors.businessTypes}</p>
      )}

      <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {BUSINESS_TYPES.map((type) => {
          const Icon = getIcon(type.icon);
          const selected = isSelected(type.key);
          const disabled = isDisabled(type.key);

          return (
            <button
              key={type.key}
              type="button"
              onClick={() => !disabled && handleToggleType(type.key)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all',
                selected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300',
                disabled && !selected && 'opacity-40 cursor-not-allowed'
              )}
            >
              <Icon
                size={28}
                className={cn(
                  'mb-2',
                  selected ? 'text-primary' : 'text-gray-500'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium text-center',
                  selected ? 'text-primary' : 'text-gray-700'
                )}
              >
                {type.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500">
        נבחרו {selectedTypes.length} מתוך {maxSelections}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
        >
          <span className="flex items-center justify-center gap-2">
            <ChevronRight size={20} /> חזרה
          </span>
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 h-12"
        >
          <span className="flex items-center justify-center gap-2">
            המשך <ChevronLeft size={20} />
          </span>
        </Button>
      </div>
    </div>
  );
};

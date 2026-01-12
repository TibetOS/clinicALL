import { Star } from 'lucide-react';
import { Button, Badge } from '../ui';
import type { SignupFormData } from './types';

type SignupPreviewProps = {
  formData: SignupFormData;
};

export const SignupPreview = ({ formData }: SignupPreviewProps) => {
  const coverImageUrl =
    formData.coverImage === 'spa'
      ? 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600'
      : 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="hidden lg:block sticky top-8 order-1 lg:order-2">
      <div className="text-center mb-4">
        <Badge variant="outline" className="bg-white">
          תצוגה מקדימה חיה
        </Badge>
      </div>

      {/* Phone Frame */}
      <div className="mx-auto w-[320px] h-[640px] bg-gray-900 rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 w-full h-full bg-white flex flex-col overflow-y-auto no-scrollbar">
          {/* Preview Content */}
          <div className="relative h-48 bg-gray-200 shrink-0">
            <img src={coverImageUrl} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 right-4 text-white">
              <h2 className="font-bold text-xl drop-shadow-md">
                {formData.clinicName || 'שם הקליניקה'}
              </h2>
              <p className="text-xs opacity-90">{formData.address || 'תל אביב'}</p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <Button
                className="flex-1 rounded-full text-xs h-8"
                style={{ backgroundColor: formData.brandColor }}
              >
                קבע תור
              </Button>
              <Button variant="outline" className="flex-1 rounded-full text-xs h-8">
                WhatsApp
              </Button>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-2">טיפולים פופולריים</h3>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border p-2 rounded-lg mb-2 shadow-sm"
                >
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-md" />
                    <div>
                      <div className="text-xs font-bold">טיפול {i}</div>
                      <div className="text-[10px] text-gray-500">30 דק׳</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold">₪450</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <p className="text-xs text-gray-500 italic">
                "השירות היה מדהים, ממליצה בחום!"
              </p>
              <div className="flex justify-center gap-1 mt-1 text-amber-400">
                <Star size={10} fill="currentColor" />
                <Star size={10} fill="currentColor" />
                <Star size={10} fill="currentColor" />
                <Star size={10} fill="currentColor" />
                <Star size={10} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>

        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20" />
      </div>
    </div>
  );
};

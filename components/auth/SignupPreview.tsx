import { Star, MapPin, Phone } from 'lucide-react';
import { Button, Badge } from '../ui';
import type { SignupFormData } from './types';
import { BUSINESS_TYPES } from './types';

type SignupPreviewProps = {
  formData: SignupFormData;
};

export const SignupPreview = ({ formData }: SignupPreviewProps) => {
  // Get business type labels
  const businessTypeLabels = formData.businessTypes
    .map((key) => BUSINESS_TYPES.find((t) => t.key === key)?.label)
    .filter(Boolean)
    .join(' • ');

  // Use uploaded cover image preview or default
  const coverImageUrl =
    formData.coverImagePreview ||
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600';

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
          {/* Cover Image */}
          <div className="relative h-48 bg-gray-200 shrink-0">
            <img src={coverImageUrl} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-black/20" />

            {/* Logo overlay */}
            {formData.logoPreview && (
              <div className="absolute bottom-4 left-4">
                <img
                  src={formData.logoPreview}
                  alt="לוגו"
                  className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-lg"
                />
              </div>
            )}

            <div className="absolute bottom-4 right-4 text-white">
              <h2 className="font-bold text-xl drop-shadow-md">
                {formData.businessName || 'שם העסק'}
              </h2>
              {formData.city && (
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <MapPin size={12} />
                  {formData.city}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Tagline */}
            {formData.tagline && (
              <p className="text-sm text-gray-600 text-center italic">
                "{formData.tagline}"
              </p>
            )}

            {/* Business Types Badges */}
            {businessTypeLabels && (
              <div className="text-xs text-gray-500 text-center">
                {businessTypeLabels}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button className="flex-1 rounded-full text-xs h-8 bg-primary">
                קבע תור
              </Button>
              <Button variant="outline" className="flex-1 rounded-full text-xs h-8">
                <Phone size={12} className="ml-1" />
                {formData.businessPhone || 'WhatsApp'}
              </Button>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold text-sm mb-2">שירותים</h3>
              {formData.services.length > 0 ? (
                formData.services.slice(0, 3).map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center border p-2 rounded-lg mb-2 shadow-sm"
                  >
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-xs">
                        {service.duration}׳
                      </div>
                      <div>
                        <div className="text-xs font-bold">{service.name}</div>
                        <div className="text-[10px] text-gray-500">{service.duration} דק׳</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold">₪{service.price}</span>
                  </div>
                ))
              ) : (
                <>
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
                </>
              )}
              {formData.services.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  +{formData.services.length - 3} שירותים נוספים
                </p>
              )}
            </div>

            {/* Gallery Preview */}
            {formData.galleryPreviews.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-2">גלריה</h3>
                <div className="grid grid-cols-3 gap-1">
                  {formData.galleryPreviews.slice(0, 3).map((preview, idx) => (
                    <img
                      key={idx}
                      src={preview}
                      alt={`גלריה ${idx + 1}`}
                      className="aspect-square object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Review */}
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

            {/* URL */}
            {formData.slug && (
              <div className="text-center text-xs text-gray-400 pt-2" dir="ltr">
                clinicall.co.il/c/{formData.slug}
              </div>
            )}
          </div>
        </div>

        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20" />
      </div>
    </div>
  );
};

import { useRef } from 'react';
import { ChevronRight, Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button, cn } from '../ui';
import { validateLogoImage, validateCoverImage, validateGalleryImage } from '../../lib/validation';
import { toast } from 'sonner';
import type { SignupStepProps } from './types';

const MAX_GALLERY_IMAGES = 6;
const MAX_TAGLINE_LENGTH = 150;

export const LandingSetupStep = ({
  formData,
  onChange,
  onNext,
  onBack,
  loading,
}: SignupStepProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateLogoImage(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    onChange('logo', file);
    onChange('logoPreview', URL.createObjectURL(file));
  };

  // Handle cover image upload
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateCoverImage(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    onChange('coverImage', file);
    onChange('coverImagePreview', URL.createObjectURL(file));
  };

  // Handle gallery image upload
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCount = formData.galleryImages.length;
    const allowedCount = MAX_GALLERY_IMAGES - currentCount;

    if (allowedCount <= 0) {
      toast.error(`ניתן להעלות עד ${MAX_GALLERY_IMAGES} תמונות`);
      return;
    }

    const filesToAdd = files.slice(0, allowedCount);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of filesToAdd) {
      const validation = validateGalleryImage(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.message}`);
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      onChange('galleryImages', [...formData.galleryImages, ...validFiles]);
      onChange('galleryPreviews', [...formData.galleryPreviews, ...validPreviews]);
    }
  };

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    const updatedImages = formData.galleryImages.filter((_, i) => i !== index);
    const updatedPreviews = formData.galleryPreviews.filter((_, i) => i !== index);
    onChange('galleryImages', updatedImages);
    onChange('galleryPreviews', updatedPreviews);
  };

  // Remove logo
  const removeLogo = () => {
    onChange('logo', null);
    onChange('logoPreview', '');
  };

  // Remove cover
  const removeCover = () => {
    onChange('coverImage', null);
    onChange('coverImagePreview', '');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">דף הנחיתה שלך</h2>
        <p className="text-gray-500 mt-2 text-sm">התאם אישית את העמוד שלך לפני הפרסום</p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">לוגו העסק</label>
        <div className="flex items-center gap-4">
          <div
            onClick={() => logoInputRef.current?.click()}
            className={cn(
              'w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors',
              formData.logoPreview
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            )}
          >
            {formData.logoPreview ? (
              <div className="relative w-full h-full">
                <img
                  src={formData.logoPreview}
                  alt="לוגו"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLogo();
                  }}
                  className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <Camera size={24} className="text-gray-400" />
            )}
          </div>
          <div className="text-xs text-gray-500">
            <p>מומלץ: 200×200</p>
            <p>עד 2MB</p>
          </div>
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="hidden"
        />
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">תמונת כיסוי</label>
        <div
          onClick={() => coverInputRef.current?.click()}
          className={cn(
            'h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors',
            formData.coverImagePreview
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          )}
        >
          {formData.coverImagePreview ? (
            <div className="relative w-full h-full">
              <img
                src={formData.coverImagePreview}
                alt="תמונת כיסוי"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCover();
                }}
                className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 shadow-md"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <Upload size={24} />
              <span className="text-xs mt-1">1200×400</span>
            </div>
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
      </div>

      {/* Gallery Upload */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          גלריית תמונות (עד {MAX_GALLERY_IMAGES} תמונות)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {formData.galleryPreviews.map((preview, idx) => (
            <div key={idx} className="relative aspect-square">
              <img
                src={preview}
                alt={`גלריה ${idx + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeGalleryImage(idx)}
                className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 shadow-md"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {formData.galleryImages.length < MAX_GALLERY_IMAGES && (
            <div
              onClick={() => galleryInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 flex items-center justify-center cursor-pointer transition-colors"
            >
              <Upload size={20} className="text-gray-400" />
            </div>
          )}
        </div>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
          className="hidden"
        />
      </div>

      {/* Tagline */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          תיאור קצר (אופציונלי)
        </label>
        <textarea
          value={formData.tagline}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('tagline', e.target.value.slice(0, MAX_TAGLINE_LENGTH))}
          placeholder="מומחים לטיפולי פנים ואסתטיקה..."
          rows={2}
          className={cn(
            'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            'resize-none'
          )}
        />
        <div className="text-xs text-gray-500 text-left mt-1" dir="ltr">
          {formData.tagline.length}/{MAX_TAGLINE_LENGTH}
        </div>
      </div>

      {/* URL Preview */}
      {formData.slug && (
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">כתובת העמוד שלך:</p>
          <p className="text-sm font-medium text-primary" dir="ltr">
            clinicall.co.il/c/{formData.slug}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 h-12"
        >
          <span className="flex items-center justify-center gap-2">
            <ChevronRight size={20} /> חזרה
          </span>
        </Button>
        <Button
          onClick={onNext}
          disabled={loading}
          className="flex-1 h-12"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              יוצר חשבון...
            </span>
          ) : (
            'סיום והפעלת העמוד'
          )}
        </Button>
      </div>
    </div>
  );
};

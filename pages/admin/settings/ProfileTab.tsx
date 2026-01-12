import { Globe, Image as ImageIcon, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Card, Button, Label, ComingSoon } from '../../../components/ui';
import { ClinicProfile } from '../../../types';

export type ProfileFormData = {
  description: string;
  slug: string;
  brandColor: string;
};

export type ProfileTabProps = {
  clinic: ClinicProfile | null;
  profileForm: ProfileFormData;
  setProfileForm: (form: ProfileFormData | ((prev: ProfileFormData) => ProfileFormData)) => void;
  slugError: string | null;
  setSlugError: (error: string | null) => void;
  profileSaving: boolean;
  onSave: () => void;
};

export function ProfileTab({
  clinic,
  profileForm,
  setProfileForm,
  slugError,
  setSlugError,
  profileSaving,
  onSave,
}: ProfileTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">עיצוב עמוד נחיתה</h3>
            <a href={`/c/${clinic?.slug || 'preview'}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                צפה באתר החי <Globe size={14} />
              </Button>
            </a>
          </div>

          <div className="space-y-6">
            <div>
              <Label>תמונת נושא (Hero Image)</Label>
              <div className="h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-not-allowed relative overflow-hidden group opacity-60">
                <img src={clinic?.coverUrl || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2068"} alt="תמונת נושא נוכחית" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors">
                  <span className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    החלף תמונה (בקרוב) <ImageIcon size={16} />
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>לוגו הקליניקה</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full border bg-gray-50 flex items-center justify-center overflow-hidden">
                    {clinic?.logoUrl ? (
                      <img src={clinic.logoUrl} alt="לוגו" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-gray-400">Logo</span>
                    )}
                  </div>
                  <ComingSoon>
                    <Button variant="ghost" size="sm">העלה</Button>
                  </ComingSoon>
                </div>
              </div>
              <div>
                <Label htmlFor="brand-color">צבע מותג</Label>
                <div className="flex items-center gap-2 border p-2 rounded-lg bg-white">
                  <input
                    id="brand-color"
                    name="brand-color"
                    type="color"
                    aria-label="צבע מותג"
                    value={profileForm.brandColor}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, brandColor: e.target.value }))}
                    className="w-8 h-8 rounded border-0 cursor-pointer"
                  />
                  <span className="text-sm font-mono" aria-hidden="true">{profileForm.brandColor}</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="clinic-description">תיאור אודות (יופיע בדף הבית)</Label>
              <textarea
                id="clinic-description"
                name="clinic-description"
                className="w-full min-h-[100px] border border-gray-200 rounded-lg p-3 text-sm"
                placeholder="ספרי על הקליניקה שלך..."
                value={profileForm.description}
                onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t flex justify-end">
            <Button onClick={onSave} disabled={profileSaving}>
              {profileSaving ? 'שומר...' : 'שמור שינויים'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
          <h3 className="text-lg font-bold mb-4">כתובת ה-URL שלך</h3>
          <div className={`flex gap-2 items-center bg-gray-50 p-3 rounded-xl border ${slugError ? 'border-red-300' : 'border-gray-200'}`}>
            <Globe size={18} className="text-gray-400" />
            <span className="text-gray-500 text-sm">clinicall.com/c/</span>
            <input
              id="clinic-slug"
              name="clinic-slug"
              type="text"
              className="bg-transparent font-bold text-gray-900 border-none outline-none flex-1"
              placeholder="your-clinic-name"
              aria-describedby={slugError ? "slug-error" : "slug-hint"}
              value={profileForm.slug}
              onChange={(e) => {
                setProfileForm(prev => ({ ...prev, slug: e.target.value }));
                setSlugError(null);
              }}
            />
            <Button size="sm" variant="ghost"><Check size={16} /></Button>
          </div>
          {slugError ? (
            <p id="slug-error" className="text-xs text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              {slugError}
            </p>
          ) : (
            <p id="slug-hint" className="text-xs text-gray-500 mt-2">שינוי הכתובת עלול לשבור קישורים קיימים ששלחת למטופלים.</p>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6 rounded-3xl bg-stone-900 text-white border-none">
          <h3 className="font-bold mb-2 flex items-center gap-2"><Sparkles size={16} /> טיפים לנראות</h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            תמונות אותנטיות של הקליניקה והצוות מגדילות את אחוזי ההמרה ב-40%. מומלץ להעלות לפחות 3 תמונות לגלריה.
          </p>
          <Button variant="secondary" className="w-full bg-white/10 text-white border-none hover:bg-white/20">מדריך צילום</Button>
        </Card>
      </div>
    </div>
  );
}

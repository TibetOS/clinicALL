import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button, Tabs, TabsList, TabsTrigger, Skeleton,
  Alert, AlertTitle, AlertDescription,
} from '../../components/ui';
import { useSearchParams } from 'react-router-dom';
import { useMyClinic, useStaff, usePatients, useAppointments, useInvoices } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { isValidSlug } from './settings/settings-helpers';
import { ProfileTab, ProfileFormData } from './settings/ProfileTab';
import { GeneralTab, BusinessFormData } from './settings/GeneralTab';
import { TeamTab } from './settings/TeamTab';
import { BillingTab, BillingFormData } from './settings/BillingTab';

export const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  // Separate saving states per form to avoid cross-tab interference
  const [profileSaving, setProfileSaving] = useState(false);
  const [businessSaving, setBusinessSaving] = useState(false);
  const [billingSaving, setBillingSaving] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Data hooks
  const { profile } = useAuth();
  const { clinic, loading: clinicLoading, error: clinicError, updateClinic } = useMyClinic();
  const { staff, loading: staffLoading } = useStaff(profile?.clinic_id);
  const { patients } = usePatients();
  const { appointments } = useAppointments();
  const { invoices, loading: invoicesLoading } = useInvoices();

  // Form states for different tabs - initialized from database
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    description: '',
    slug: '',
    brandColor: '#BCA48D',
  });

  const [businessForm, setBusinessForm] = useState<BusinessFormData>({
    businessName: '',
    taxId: '',
    address: '',
    phone: '',
    email: '',
  });

  const [billingForm, setBillingForm] = useState<BillingFormData>({
    billingName: '',
    billingTaxId: '',
    billingAddress: '',
    billingEmail: '',
  });

  // Populate forms when clinic data loads
  useEffect(() => {
    if (clinic) {
      setProfileForm({
        description: clinic.description || '',
        slug: clinic.slug || '',
        brandColor: clinic.brandColor || '#BCA48D',
      });
      setBusinessForm({
        businessName: clinic.name || '',
        taxId: clinic.businessId || '',
        address: clinic.address || '',
        phone: clinic.phone || '',
        email: profile?.email || '',
      });
      setBillingForm({
        billingName: clinic.name || '',
        billingTaxId: clinic.businessId || '',
        billingAddress: clinic.address || '',
        billingEmail: profile?.email || '',
      });
    }
  }, [clinic, profile]);

  // Sync activeTab with URL param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleSaveProfile = useCallback(async () => {
    // Validate slug before saving
    const slug = profileForm.slug.trim().toLowerCase();
    if (slug && !isValidSlug(slug)) {
      setSlugError('כתובת URL יכולה להכיל רק אותיות קטנות באנגלית, מספרים ומקפים');
      return;
    }
    setSlugError(null);

    setProfileSaving(true);
    const result = await updateClinic({
      description: profileForm.description,
      slug: slug,
      brandColor: profileForm.brandColor,
    });
    setProfileSaving(false);
    if (result.success) {
      toast.success('פרטי האתר נשמרו בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה בשמירת הנתונים');
    }
  }, [profileForm, updateClinic]);

  const handleSaveBusiness = useCallback(async () => {
    setBusinessSaving(true);
    const result = await updateClinic({
      name: businessForm.businessName,
      businessId: businessForm.taxId,
      address: businessForm.address,
      phone: businessForm.phone,
    });
    setBusinessSaving(false);
    if (result.success) {
      toast.success('פרטי העסק נשמרו בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה בשמירת הנתונים');
    }
  }, [businessForm, updateClinic]);

  const handleSaveBilling = useCallback(async () => {
    setBillingSaving(true);
    // Billing info would typically go to a separate billing_info table
    // For now, we update the clinic with the available fields
    const result = await updateClinic({
      name: billingForm.billingName,
      businessId: billingForm.billingTaxId,
      address: billingForm.billingAddress,
    });
    setBillingSaving(false);
    if (result.success) {
      toast.success('פרטי החיוב נשמרו בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה בשמירת הנתונים');
    }
  }, [billingForm, updateClinic]);

  // Calculate usage stats from real data
  const activePatients = patients.length;
  const monthlyAppointments = appointments.filter(a => {
    const apptDate = new Date(a.date);
    const now = new Date();
    return apptDate.getMonth() === now.getMonth() && apptDate.getFullYear() === now.getFullYear();
  }).length;

  // Show loading skeleton while clinic data loads
  if (clinicLoading) {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in pb-10">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  // Show error if clinic data failed to load
  if (clinicError) {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in pb-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white border border-stone-200 rounded-2xl shadow-sm"><SettingsIcon className="w-6 h-6 text-gray-700" /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">הגדרות מרפאה</h1>
            <p className="text-muted-foreground text-sm">התאמת המערכת לצרכי הקליניקה האסתטית</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה בטעינת נתוני המרפאה</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{clinicError}</span>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => window.location.reload()}
            >
              נסה שוב
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in pb-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-white border border-stone-200 rounded-2xl shadow-sm"><SettingsIcon className="w-6 h-6 text-gray-700" /></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">הגדרות מרפאה</h1>
          <p className="text-muted-foreground text-sm">התאמת המערכת לצרכי הקליניקה האסתטית</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start bg-transparent p-0 border-b rounded-none gap-6 h-auto overflow-x-auto no-scrollbar">
          {['profile', 'general', 'team', 'billing'].map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              activeValue={activeTab}
              onClick={setActiveTab}
            >
              <span className={`pb-3 border-b-2 text-base px-2 whitespace-nowrap ${activeTab === tab ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab === 'profile' && 'אתר ונראות'}
                {tab === 'general' && 'פרטי עסק'}
                {tab === 'team' && 'צוות מטפל'}
                {tab === 'billing' && 'חבילה ותשלומים'}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {activeTab === 'profile' && (
            <ProfileTab
              clinic={clinic}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              slugError={slugError}
              setSlugError={setSlugError}
              profileSaving={profileSaving}
              onSave={handleSaveProfile}
            />
          )}

          {activeTab === 'general' && (
            <GeneralTab
              businessForm={businessForm}
              setBusinessForm={setBusinessForm}
              businessSaving={businessSaving}
              onSave={handleSaveBusiness}
            />
          )}

          {activeTab === 'team' && (
            <TeamTab staff={staff} staffLoading={staffLoading} />
          )}

          {activeTab === 'billing' && (
            <BillingTab
              profileName={profile?.full_name || null}
              activePatients={activePatients}
              monthlyAppointments={monthlyAppointments}
              invoices={invoices}
              invoicesLoading={invoicesLoading}
              billingForm={billingForm}
              setBillingForm={setBillingForm}
              billingSaving={billingSaving}
              onSave={handleSaveBilling}
            />
          )}
        </div>
      </Tabs>
    </div>
  );
};

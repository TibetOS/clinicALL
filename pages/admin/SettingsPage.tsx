import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon, UserPlus, MoreVertical, Crown,
  CreditCard, ArrowUpRight, Download, Check, XCircle, Sparkles,
  Globe, Image as ImageIcon, Loader2, Trash2, Edit2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Button, Input, Badge, Tabs, TabsList, TabsTrigger, Label, Skeleton, ComingSoon } from '../../components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { useSearchParams } from 'react-router-dom';
import { useMyClinic, useStaff, usePatients, useAppointments, useInvoices } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';

// Validate slug contains only URL-safe characters
const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9-]+$/.test(slug);
};

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
  const [profileForm, setProfileForm] = useState({
    description: '',
    slug: '',
    brandColor: '#BCA48D',
  });

  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    taxId: '',
    address: '',
    phone: '',
    email: '',
  });

  const [billingForm, setBillingForm] = useState({
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
        <Card className="p-6 rounded-3xl border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">שגיאה בטעינת נתוני המרפאה</p>
          </div>
          <p className="mt-2 text-sm text-red-600">{clinicError}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            נסה שוב
          </Button>
        </Card>
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
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
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
                    <Button onClick={handleSaveProfile} disabled={profileSaving}>
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
                        setSlugError(null); // Clear error on change
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
          )}

          {activeTab === 'general' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
              <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                <h3 className="text-lg font-bold mb-6">פרטי העסק</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>שם העסק (חשבוניות)</Label>
                      <Input
                        name="organization"
                        autoComplete="organization"
                        value={businessForm.businessName}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, businessName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>מספר עוסק / ח.פ.</Label>
                      <Input
                        name="tax-id"
                        autoComplete="off"
                        value={businessForm.taxId}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, taxId: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>כתובת למשלוח דואר</Label>
                    <Input
                      name="street-address"
                      autoComplete="street-address"
                      value={businessForm.address}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>טלפון ראשי</Label>
                      <Input
                        type="tel"
                        name="tel"
                        autoComplete="tel"
                        value={businessForm.phone}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>אימייל לחיובים</Label>
                      <Input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={businessForm.email}
                        readOnly
                        disabled
                        className="bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">האימייל מוגדר בפרופיל המשתמש</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t flex justify-end">
                  <Button onClick={handleSaveBusiness} disabled={businessSaving}>
                    {businessSaving ? 'שומר...' : 'שמור שינויים'}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
              <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">צוות המטפלים</h3>
                  <ComingSoon>
                    <Button size="sm" className="gap-2">הזמן איש צוות <UserPlus size={14} /></Button>
                  </ComingSoon>
                </div>
                <div className="space-y-4">
                  {staffLoading ? (
                    <>
                      {[1, 2].map(i => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                      ))}
                    </>
                  ) : staff.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>אין עדיין אנשי צוות</p>
                      <p className="text-sm mt-1">הזמן את הצוות הראשון שלך</p>
                    </div>
                  ) : (
                    staff.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="success">פעיל</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreVertical size={16} /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem className="gap-2 opacity-50 cursor-not-allowed" disabled>
                                עריכת פרטים (בקרוב) <Edit2 className="h-4 w-4" />
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 opacity-50 cursor-not-allowed text-red-600" disabled>
                                הסרה מהצוות (בקרוב) <Trash2 className="h-4 w-4" />
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Current Plan */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="p-6 rounded-3xl border-stone-100 shadow-soft relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-teal-400 to-emerald-400"></div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                          <Crown size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-gray-900">Professional</h3>
                            <Badge variant="success">פעיל</Badge>
                          </div>
                          <p className="text-gray-500 text-sm">חבילה חודשית • מתחדשת ב-15 לחודש</p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-3xl font-bold text-gray-900">₪349<span className="text-base font-normal text-gray-500">/חודש</span></p>
                        <p className="text-xs text-gray-400">לפני מע״מ</p>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-2xl">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">מטופלים פעילים</p>
                        <p className="text-lg font-bold text-gray-900">{activePatients} <span className="text-sm font-normal text-gray-400">/ 500</span></p>
                        <Progress value={Math.min((activePatients / 500) * 100, 100)} className="h-1.5 mt-1" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">תורים החודש</p>
                        <p className="text-lg font-bold text-gray-900">{monthlyAppointments} <span className="text-sm font-normal text-gray-400">/ ללא הגבלה</span></p>
                        <Progress value={100} className="h-1.5 mt-1" indicatorClassName="bg-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">SMS שנשלחו</p>
                        <p className="text-lg font-bold text-gray-900">-- <span className="text-sm font-normal text-gray-400">/ 500</span></p>
                        <Progress value={0} className="h-1.5 mt-1" indicatorClassName="bg-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">שאילתות AI</p>
                        <p className="text-lg font-bold text-gray-900">-- <span className="text-sm font-normal text-gray-400">/ 200</span></p>
                        <Progress value={0} className="h-1.5 mt-1" indicatorClassName="bg-purple-500" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                      <ComingSoon>
                        <Button variant="outline" size="sm" className="gap-2">
                          שדרג חבילה <ArrowUpRight size={14} />
                        </Button>
                      </ComingSoon>
                      <ComingSoon>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          בטל מנוי
                        </Button>
                      </ComingSoon>
                    </div>
                  </Card>
                </div>

                {/* Payment Method */}
                <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                  <h3 className="text-lg font-bold mb-4">אמצעי תשלום</h3>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white relative overflow-hidden mb-4">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-10 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded"></div>
                      <span className="text-xs opacity-60">VISA</span>
                    </div>
                    <p className="font-mono text-lg tracking-wider mb-4">•••• •••• •••• ****</p>
                    <div className="flex justify-between text-xs">
                      <div>
                        <p className="opacity-60">בעל הכרטיס</p>
                        <p>{profile?.full_name || '---'}</p>
                      </div>
                      <div>
                        <p className="opacity-60">תוקף</p>
                        <p>--/--</p>
                      </div>
                    </div>
                  </div>
                  <ComingSoon>
                    <Button variant="outline" className="w-full gap-2">
                      עדכן כרטיס <CreditCard size={16} />
                    </Button>
                  </ComingSoon>
                </Card>
              </div>

              {/* Plan Comparison */}
              <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                <h3 className="text-lg font-bold mb-6">השוואת חבילות</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Starter */}
                  <div className="border border-gray-200 rounded-2xl p-5 hover:border-primary/30 transition-colors">
                    <h4 className="font-bold text-gray-900 mb-1">Starter</h4>
                    <p className="text-2xl font-bold mb-4">₪149<span className="text-sm font-normal text-gray-500">/חודש</span></p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> עד 100 מטופלים</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> יומן תורים בסיסי</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 100 SMS לחודש</li>
                      <li className="flex items-center gap-2 text-gray-400"><XCircle size={14} /> עוזר AI</li>
                      <li className="flex items-center gap-2 text-gray-400"><XCircle size={14} /> דוחות מתקדמים</li>
                    </ul>
                    <ComingSoon>
                      <Button variant="outline" className="w-full">בחר חבילה</Button>
                    </ComingSoon>
                  </div>

                  {/* Professional - Current */}
                  <div className="border-2 border-primary rounded-2xl p-5 relative bg-primary/5">
                    <Badge className="absolute -top-3 right-4 bg-primary text-white">החבילה שלך</Badge>
                    <h4 className="font-bold text-gray-900 mb-1">Professional</h4>
                    <p className="text-2xl font-bold mb-4">₪349<span className="text-sm font-normal text-gray-500">/חודש</span></p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> עד 500 מטופלים</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> יומן מתקדם + סנכרון</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 500 SMS לחודש</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> עוזר AI (200 שאילתות)</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> דוחות מתקדמים</li>
                    </ul>
                    <Button className="w-full" disabled>החבילה הנוכחית</Button>
                  </div>

                  {/* Enterprise */}
                  <div className="border border-gray-200 rounded-2xl p-5 hover:border-primary/30 transition-colors bg-gradient-to-br from-gray-50 to-white">
                    <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">Enterprise <Sparkles size={14} className="text-amber-500" /></h4>
                    <p className="text-2xl font-bold mb-4">₪699<span className="text-sm font-normal text-gray-500">/חודש</span></p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> מטופלים ללא הגבלה</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> מספר סניפים</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> SMS ללא הגבלה</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> AI ללא הגבלה + התאמה</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> מנהל לקוח ייעודי</li>
                    </ul>
                    <ComingSoon>
                      <Button variant="outline" className="w-full">שדרג עכשיו</Button>
                    </ComingSoon>
                  </div>
                </div>
              </Card>

              {/* Invoice History */}
              <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">היסטוריית חשבוניות</h3>
                  <ComingSoon>
                    <Button variant="ghost" size="sm" className="gap-2">
                      הורד הכל <Download size={14} />
                    </Button>
                  </ComingSoon>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-gray-500 border-b">
                      <tr>
                        <th className="text-right py-3 px-4 font-medium">מספר חשבונית</th>
                        <th className="text-right py-3 px-4 font-medium">תאריך</th>
                        <th className="text-right py-3 px-4 font-medium">סכום</th>
                        <th className="text-right py-3 px-4 font-medium">סטטוס</th>
                        <th className="text-right py-3 px-4 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoicesLoading ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            טוען חשבוניות...
                          </td>
                        </tr>
                      ) : invoices.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            אין חשבוניות עדיין
                          </td>
                        </tr>
                      ) : (
                        invoices.slice(0, 10).map((inv) => (
                          <tr key={inv.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{inv.invoiceNumber}</td>
                            <td className="py-3 px-4 text-gray-500">{new Date(inv.date).toLocaleDateString('he-IL')}</td>
                            <td className="py-3 px-4 text-gray-900">₪{inv.total.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'destructive'}>
                                {inv.status === 'paid' ? 'שולם' : inv.status === 'pending' ? 'ממתין' : inv.status === 'overdue' ? 'באיחור' : 'החזר'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <ComingSoon>
                                <Button variant="ghost" size="sm">
                                  <Download size={14} />
                                </Button>
                              </ComingSoon>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Billing Contact */}
              <Card className="p-6 rounded-3xl border-stone-100 shadow-soft">
                <h3 className="text-lg font-bold mb-4">פרטי חיוב</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>שם לחשבונית</Label>
                    <Input
                      name="billing-organization"
                      autoComplete="organization"
                      value={billingForm.billingName}
                      onChange={(e) => setBillingForm(prev => ({ ...prev, billingName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>ח.פ. / ע.מ.</Label>
                    <Input
                      name="billing-tax-id"
                      autoComplete="off"
                      value={billingForm.billingTaxId}
                      onChange={(e) => setBillingForm(prev => ({ ...prev, billingTaxId: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>כתובת לחשבונית</Label>
                    <Input
                      name="billing-street-address"
                      autoComplete="street-address"
                      value={billingForm.billingAddress}
                      onChange={(e) => setBillingForm(prev => ({ ...prev, billingAddress: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>אימייל לקבלת חשבוניות</Label>
                    <Input
                      type="email"
                      name="billing-email"
                      autoComplete="email"
                      value={billingForm.billingEmail}
                      onChange={(e) => setBillingForm(prev => ({ ...prev, billingEmail: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t flex justify-end">
                  <Button onClick={handleSaveBilling} disabled={billingSaving}>
                    {billingSaving ? 'שומר...' : 'שמור שינויים'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

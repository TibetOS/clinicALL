
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  MapPin, Phone, Instagram, Facebook, Clock, Star,
  ChevronDown, ArrowRight, X, Menu, Share2, Loader2
} from 'lucide-react';
import { Button, Card, Badge, Dialog } from '../components/ui';
import { BookingApp } from './Booking';
import { useClinic, useServices } from '../hooks';
import { Service } from '../types';
import { ImageSlider } from '../components/ImageSlider';
import { isSupabaseConfigured } from '../lib/supabase';
import { createLogger } from '../lib/logger';

const logger = createLogger('ClinicLanding');

export const ClinicLanding = () => {
  const { slug } = useParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch clinic and services from Supabase
  const { clinic: profile, loading: clinicLoading, error: clinicError } = useClinic(slug);
  const { services, loading: servicesLoading } = useServices();

  // All services are displayed (no featured/other split needed with real data)
  const allServices = services;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect to landing page if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return <Navigate to="/" replace />;
  }

  // Show loading state
  if (clinicLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-stone-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (clinicError || !profile) {
    // Log technical error for debugging
    if (clinicError) logger.error('Clinic load error:', clinicError);
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">הקליניקה לא נמצאה</h1>
          <p className="text-stone-600 mb-4">הקליניקה שחיפשת אינה קיימת במערכת</p>
          <Button onClick={() => window.location.href = '/'}>חזרה לדף הבית</Button>
        </div>
      </div>
    );
  }

  const openBooking = (service?: Service) => {
    if (service) setSelectedService(service);
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setSelectedService(null);
  };

  // Dynamic Theme Style
  const themeStyle = {
    '--brand-color': profile.brandColor,
    '--brand-rgb': '188, 164, 141', // Approximate RGB of brandColor for opacity
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800" style={themeStyle}>
      
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-full overflow-hidden border-2 transition-all ${isScrolled ? 'border-stone-200' : 'border-white'}`}>
                <img src={profile.logoUrl} alt="Logo" className="h-full w-full object-cover" />
             </div>
             <span className={`font-bold text-lg tracking-wide ${isScrolled ? 'text-stone-900' : 'text-white drop-shadow-md'}`}>
               {profile.name}
             </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
             <a href="#about" className={`${isScrolled ? 'text-stone-600' : 'text-white hover:text-white/80'} transition-colors`}>אודות</a>
             <a href="#services" className={`${isScrolled ? 'text-stone-600' : 'text-white hover:text-white/80'} transition-colors`}>טיפולים</a>
             <a href="#gallery" className={`${isScrolled ? 'text-stone-600' : 'text-white hover:text-white/80'} transition-colors`}>גלריה</a>
             <a href="#contact" className={`${isScrolled ? 'text-stone-600' : 'text-white hover:text-white/80'} transition-colors`}>צור קשר</a>
          </div>

          <div className="flex items-center gap-3">
             <Button 
               className="rounded-full px-6 shadow-lg hidden md:flex"
               style={{ backgroundColor: profile.brandColor, color: 'white' }}
               onClick={() => openBooking()}
             >
               קבע תור
             </Button>
             <button className="md:hidden text-stone-800 p-2" onClick={() => setMobileMenuOpen(true)}>
               <Menu className={isScrolled ? 'text-stone-800' : 'text-white'} />
             </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-6 animate-in slide-in-from-right">
           <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-xl text-stone-900">{profile.name}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-stone-100"><X size={24} className="text-stone-800"/></button>
           </div>
           <div className="flex flex-col gap-6 text-lg font-medium text-center">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--brand-color)]">אודות</a>
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--brand-color)]">טיפולים</a>
              <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--brand-color)]">גלריה</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--brand-color)]">צור קשר</a>
              <Button 
                className="w-full mt-4 h-12 text-lg" 
                style={{ backgroundColor: profile.brandColor, color: 'white' }}
                onClick={() => { setMobileMenuOpen(false); openBooking(); }}
              >
                קבע תור
              </Button>
           </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/30"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <Badge variant="outline" className="text-white border-white/40 bg-white/10 backdrop-blur-md mb-4 px-4 py-1 tracking-widest text-xs uppercase">
              {profile.tagline}
           </Badge>
           <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
             היופי שלך,<br/> <span className="text-[var(--brand-color)] italic">המומחיות שלנו</span>
           </h1>
           <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
             רפואה אסתטית מתקדמת בהתאמה אישית. כי מגיע לך להרגיש במיטבך.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button 
               size="lg" 
               className="h-14 px-8 text-lg rounded-full"
               style={{ backgroundColor: profile.brandColor }}
               onClick={() => openBooking()}
             >
                תיאום פגישת ייעוץ
             </Button>
             <Button 
               size="lg" 
               variant="outline" 
               className="h-14 px-8 text-lg rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
             >
                צפייה בטיפולים
             </Button>
           </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white animate-bounce">
           <ChevronDown size={32} />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-stone-50">
         <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
               <div className="absolute -top-4 -left-4 w-full h-full border-2 rounded-2xl" style={{ borderColor: profile.brandColor }}></div>
               <img 
                 src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000" 
                 alt="Doctor" 
                 className="relative rounded-2xl shadow-xl w-full aspect-[4/5] object-cover"
               />
               <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl max-w-xs border border-stone-100">
                  <div className="flex items-center gap-1 text-amber-400 mb-2">
                     {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-stone-600 text-sm italic">
                    "היחס האישי והמקצועיות של ד״ר שרה פשוט מדהימים. התוצאה טבעית בדיוק כמו שרציתי!"
                  </p>
                  <p className="text-stone-900 font-bold text-xs mt-2">- יעל מ. תל אביב</p>
               </div>
            </div>
            
            <div className="space-y-6">
               <h2 className="text-sm font-bold tracking-widest uppercase text-stone-500">קצת עלינו</h2>
               <h3 className="text-4xl font-bold text-stone-900 leading-tight">מקצועיות רפואית<br/>עם נגיעה אומנותית</h3>
               <p className="text-stone-600 leading-relaxed text-lg">
                  {profile.description}
               </p>
               <div className="grid grid-cols-2 gap-6 pt-4">
                  <div>
                     <span className="block text-3xl font-bold" style={{ color: profile.brandColor }}>10+</span>
                     <span className="text-stone-500 text-sm">שנות ניסיון</span>
                  </div>
                  <div>
                     <span className="block text-3xl font-bold" style={{ color: profile.brandColor }}>5k+</span>
                     <span className="text-stone-500 text-sm">מטופלות מרוצות</span>
                  </div>
               </div>
               <Button variant="outline" className="mt-4 border-stone-300">קרא עוד עלינו</Button>
            </div>
         </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
         <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16 max-w-2xl mx-auto">
               <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">תפריט טיפולים</h2>
               <p className="text-stone-600">מגוון פתרונות אסתטיים מתקדמים המותאמים אישית לצרכי העור שלך.</p>
            </div>

            {/* Featured Categories */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
               {[
                 { name: 'הזרקות ופיסול פנים', img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800' },
                 { name: 'איכות העור ומרקם', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800' },
                 { name: 'אנטי-אייג׳ינג', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800' }
               ].map((cat, i) => (
                 <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                       <h3 className="text-white text-xl font-bold mb-2">{cat.name}</h3>
                       <div className="h-0 group-hover:h-8 overflow-hidden transition-all duration-300">
                          <span className="text-white/80 text-sm flex items-center gap-2">גלה עוד <ArrowRight size={14}/></span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Detailed List */}
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
               {allServices.slice(0, 6).map(service => (
                  <div key={service.id} className="flex justify-between items-start border-b border-stone-100 pb-6 group">
                     <div>
                        <h4 className="font-bold text-lg text-stone-900 group-hover:text-[var(--brand-color)] transition-colors">{service.name}</h4>
                        <p className="text-stone-500 text-sm mt-1">{service.description}</p>
                        <span className="text-xs text-stone-400 mt-2 block">{service.duration} דקות</span>
                     </div>
                     <div className="text-left">
                        <span className="block font-bold text-lg text-stone-900">₪{service.price}</span>
                        <Button 
                           size="sm" 
                           variant="outline" 
                           className="mt-2 rounded-full border-stone-200 hover:border-[var(--brand-color)] hover:text-[var(--brand-color)]"
                           onClick={() => openBooking(service)}
                        >
                           הזמן
                        </Button>
                     </div>
                  </div>
               ))}
            </div>
            
            <div className="text-center mt-12">
               <Button size="lg" className="rounded-full px-8" style={{ backgroundColor: profile.brandColor, color: 'white' }}>
                  לכל הטיפולים והמחירים
               </Button>
            </div>
         </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-stone-900 text-white overflow-hidden">
         <div className="max-w-6xl mx-auto px-4">
             <div className="flex justify-between items-end mb-12">
                <div>
                   <h2 className="text-3xl font-bold mb-2">תוצאות מדברות</h2>
                   <p className="text-stone-400">גלריית לפני ואחרי של המטופלות שלנו</p>
                </div>
                <div className="flex gap-2">
                   {/* Custom nav arrows could go here */}
                </div>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-0 border-none bg-transparent">
                   <div className="mb-4">
                      <h3 className="font-bold text-lg">פיסול שפתיים עדין</h3>
                      <p className="text-sm text-stone-400">חומצה היאלורונית, 1 מ״ל</p>
                   </div>
                   <ImageSlider 
                      beforeImage="https://picsum.photos/600/600?random=10"
                      afterImage="https://picsum.photos/600/600?random=11"
                      className="rounded-2xl"
                   />
                </Card>
                <Card className="p-0 border-none bg-transparent">
                   <div className="mb-4">
                      <h3 className="font-bold text-lg">יישור אף ללא ניתוח</h3>
                      <p className="text-sm text-stone-400">טכניקה משולבת</p>
                   </div>
                   <ImageSlider 
                      beforeImage="https://picsum.photos/600/600?random=12"
                      afterImage="https://picsum.photos/600/600?random=13"
                      className="rounded-2xl"
                   />
                </Card>
                <Card className="p-0 border-none bg-transparent hidden lg:block">
                   <div className="mb-4">
                      <h3 className="font-bold text-lg">עיצוב קו לסת</h3>
                      <p className="text-sm text-stone-400">רדיאס 3 מזרקים</p>
                   </div>
                   <ImageSlider 
                      beforeImage="https://picsum.photos/600/600?random=14"
                      afterImage="https://picsum.photos/600/600?random=15"
                      className="rounded-2xl"
                   />
                </Card>
             </div>
             
             <div className="text-center mt-12">
                <a href="#" className="inline-flex items-center gap-2 text-white hover:text-[var(--brand-color)] transition-colors border-b border-white/20 pb-1">
                   לגלריה המלאה באינסטגרם <Instagram size={16} />
                </a>
             </div>
         </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="bg-stone-100 pt-24 pb-12">
         <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 mb-16">
            <div>
               <h2 className="text-3xl font-bold text-stone-900 mb-6">בואי נתחיל את השינוי</h2>
               <p className="text-stone-600 mb-8 max-w-md">
                  אנחנו כאן לכל שאלה או התייעצות. השאירי פרטים ונחזור אליך בהקדם, או פשוט קבעי תור אונליין.
               </p>
               
               <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--brand-color)]">
                        <MapPin size={20} />
                     </div>
                     <div>
                        <span className="block font-bold text-stone-900">כתובת</span>
                        <span className="text-stone-600">{profile.address}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--brand-color)]">
                        <Phone size={20} />
                     </div>
                     <div>
                        <span className="block font-bold text-stone-900">טלפון</span>
                        <span className="text-stone-600">{profile.phone}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--brand-color)]">
                        <Clock size={20} />
                     </div>
                     <div>
                        <span className="block font-bold text-stone-900">שעות פעילות</span>
                        <span className="text-stone-600">א׳-ה׳: 09:00-19:00, ו׳: 09:00-13:00</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0 border-stone-300 hover:border-[var(--brand-color)] hover:text-[var(--brand-color)]">
                     <Instagram size={18} />
                  </Button>
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0 border-stone-300 hover:border-[var(--brand-color)] hover:text-[var(--brand-color)]">
                     <Facebook size={18} />
                  </Button>
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0 border-stone-300 hover:border-[var(--brand-color)] hover:text-[var(--brand-color)]">
                     <Share2 size={18} />
                  </Button>
               </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50">
               {/* Embedded Map Mockup */}
               <div className="w-full h-full rounded-2xl bg-stone-200 overflow-hidden relative min-h-[300px]">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3381.1610996614747!2d34.77123432543452!3d32.06456722002166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4b7c6227c731%3A0x6b69b618776b208!2sRothschild%20Blvd%2045%2C%20Tel%20Aviv-Yafo!5e0!3m2!1sen!2sil!4v1698150000000!5m2!1sen!2sil" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, position: 'absolute', inset: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
               </div>
            </div>
         </div>

         <div className="text-center text-stone-400 text-sm border-t border-stone-200 pt-8">
            <p>© {new Date().getFullYear()} {profile.name}. נבנה באמצעות <a href="#" className="hover:text-[var(--brand-color)] font-bold">ClinicALL</a>.</p>
         </div>
      </footer>

      {/* Booking Modal */}
      <Dialog 
         open={isBookingOpen} 
         onClose={closeBooking}
      >
         {/* We override the Dialog default styling by rendering the BookingApp directly inside a clean container */}
         <div className="h-[80vh] md:h-[600px] w-full max-w-4xl bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
             <div className="hidden md:block w-1/3 relative">
                <img src={profile.coverUrl} alt={`תמונת רקע של ${profile.name}`} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-stone-900/40 p-8 text-white flex flex-col justify-end">
                   <h3 className="font-bold text-2xl mb-2">{profile.name}</h3>
                   <p className="opacity-90 text-sm mb-4">{profile.address}</p>
                   <div className="space-y-2 text-xs opacity-80">
                      <div className="flex items-center gap-2"><Phone size={12}/> {profile.phone}</div>
                      <div className="flex items-center gap-2"><Clock size={12}/> א׳-ה׳: 09:00-19:00</div>
                   </div>
                </div>
             </div>
             <div className="flex-1 relative">
                <BookingApp
                   mode="modal"
                   onClose={closeBooking}
                   preSelectedService={selectedService}
                   clinicName={profile.name}
                   clinicId={profile.id}
                />
             </div>
         </div>
      </Dialog>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  MapPin, Phone, Clock, ChevronDown, X, Menu, Loader2
} from 'lucide-react';
import { Button, Card, Dialog } from '../components/ui';
import { BookingApp } from './Booking';
import { useClinic, useServices } from '../hooks';
import { Service } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { createLogger } from '../lib/logger';

const logger = createLogger('ClinicLanding');

export const ClinicLanding = () => {
  const { slug } = useParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { clinic: profile, loading: clinicLoading, error: clinicError } = useClinic(slug);
  const { services, loading: servicesLoading } = useServices();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isSupabaseConfigured()) {
    return <Navigate to="/" replace />;
  }

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

  if (clinicError || !profile) {
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

  const themeStyle = {
    '--brand-color': profile.brandColor,
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
            <a href="#services" className={`${isScrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white hover:text-white/80'} transition-colors`}>טיפולים</a>
            <a href="#contact" className={`${isScrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white hover:text-white/80'} transition-colors`}>צור קשר</a>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="rounded-full px-6 shadow-lg hidden md:flex"
              style={{ backgroundColor: profile.brandColor, color: 'white' }}
              onClick={() => openBooking()}
            >
              קבע תור
            </Button>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className={isScrolled ? 'text-stone-800' : 'text-white'} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-xl text-stone-900">{profile.name}</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-stone-100">
              <X size={24} className="text-stone-800"/>
            </button>
          </div>
          <div className="flex flex-col gap-6 text-lg font-medium text-center">
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--brand-color)]">טיפולים</a>
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
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            {profile.name}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
            {profile.tagline || profile.description}
          </p>
          <Button
            size="lg"
            className="h-14 px-8 text-lg rounded-full"
            style={{ backgroundColor: profile.brandColor }}
            onClick={() => openBooking()}
          >
            קבע תור
          </Button>
        </div>

        <a href="#services" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition-colors">
          <ChevronDown size={32} />
        </a>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">טיפולים</h2>
            <p className="text-stone-600">{profile.description}</p>
          </div>

          <div className="space-y-4">
            {services.map(service => (
              <Card key={service.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-stone-900 mb-1">{service.name}</h3>
                    <p className="text-stone-500 text-sm mb-2">{service.description}</p>
                    <span className="text-xs text-stone-400">{service.duration} דקות</span>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <span className="block font-bold text-xl text-stone-900 mb-2">₪{service.price}</span>
                    <Button
                      size="sm"
                      style={{ backgroundColor: profile.brandColor, color: 'white' }}
                      onClick={() => openBooking(service)}
                    >
                      הזמן
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {services.length === 0 && (
            <p className="text-center text-stone-500">אין טיפולים זמינים כרגע</p>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-stone-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">צור קשר</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm" style={{ color: profile.brandColor }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <span className="block font-bold text-stone-900">כתובת</span>
                  <span className="text-stone-600">{profile.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm" style={{ color: profile.brandColor }}>
                  <Phone size={22} />
                </div>
                <div>
                  <span className="block font-bold text-stone-900">טלפון</span>
                  <a href={`tel:${profile.phone}`} className="text-stone-600 hover:text-[var(--brand-color)]">{profile.phone}</a>
                </div>
              </div>
              {profile.openingHours && Object.keys(profile.openingHours).length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm" style={{ color: profile.brandColor }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <span className="block font-bold text-stone-900">שעות פעילות</span>
                    <span className="text-stone-600">
                      {Object.entries(profile.openingHours).map(([day, hours]) => (
                        <span key={day} className="block">{day}: {hours}</span>
                      ))}
                    </span>
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="w-full mt-4"
                style={{ backgroundColor: profile.brandColor, color: 'white' }}
                onClick={() => openBooking()}
              >
                קבע תור עכשיו
              </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden min-h-[280px]">
              <iframe
                src={profile.googleMapsUrl || `https://maps.google.com/maps?q=${encodeURIComponent(profile.address)}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '280px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} {profile.name}</p>
        </div>
      </footer>

      {/* Booking Modal */}
      <Dialog open={isBookingOpen} onClose={closeBooking}>
        <div className="bg-white rounded-2xl overflow-hidden w-full max-w-lg max-h-[80vh] overflow-y-auto">
          <BookingApp
            mode="modal"
            onClose={closeBooking}
            preSelectedService={selectedService}
            clinicName={profile.name}
            clinicId={profile.id}
          />
        </div>
      </Dialog>
    </div>
  );
};

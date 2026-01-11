import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sparkles, MessageSquare } from 'lucide-react';
import { Button, Dialog, Input, Label, cn } from '../ui';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="נשמח לשמוע ממך!">
      {submitted ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">תודה על המשוב!</h3>
          <p className="text-gray-500">ההודעה שלך התקבלה ותעזור לנו להשתפר.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם מלא</Label>
            <Input id="name" required placeholder="ישראל ישראלי" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input id="email" type="email" required placeholder="israel@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">מה דעתך?</Label>
            <textarea
              id="feedback"
              required
              rows={4}
              className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(13,148,136,0.1)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out resize-none"
              placeholder="כתוב כאן את המשוב שלך..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" loading={isLoading}>
              שלח משוב
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
};

export const LandingHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'מאפיינים', href: '#features' },
    { label: 'פתרונות', href: '#solutions' },
    { label: 'מחירון', href: '#pricing' },
    { label: 'לקוחות', href: '#trust' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-2'
            : 'bg-transparent py-4'
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-teal-50 p-2 rounded-lg text-teal-600 transition-transform group-hover:scale-110">
              <Sparkles size={24} />
            </div>
            <span className="font-bold text-2xl text-gray-900 tracking-tight font-['Heebo']">
              Clinicall
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm px-2 py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA & Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-gray-500 hover:text-gray-700"
              title="שלח משוב"
            >
              <MessageSquare size={20} />
            </Button>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <Link to="/login">
              <Button variant="ghost">
                כניסה למערכת
              </Button>
            </Link>
            <Link to="/signup">
              <Button>
                נסה עכשיו בחינם
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg p-4 z-50">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">משוב</span>
                <Button variant="ghost" size="sm" onClick={() => { setIsFeedbackOpen(true); setIsMobileMenuOpen(false); }}>
                  <span className="flex items-center gap-2"><MessageSquare size={18} /> כתוב לנו</span>
                </Button>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    כניסה למערכת
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-center">
                    נסה עכשיו בחינם
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};

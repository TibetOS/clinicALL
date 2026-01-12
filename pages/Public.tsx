/**
 * Public Landing Page
 *
 * The main marketing landing page for ClinicALL.
 * Uses components from components/landing/ for modularity.
 *
 * Note: Other public pages have been extracted to separate files:
 * - pages/Login.tsx
 * - pages/Signup.tsx
 * - pages/ResetPassword.tsx
 * - pages/LockScreen.tsx
 * - pages/HealthDeclaration.tsx
 */

import {
  LandingHeader,
  LandingHero,
  TrustSection,
  FeaturesSection,
  IntegrationsSection,
  PricingSection,
  FAQSection,
  LandingFooter
} from '../components/landing';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-stone-50 font-['Heebo','Inter',sans-serif] text-gray-900 selection:bg-teal-100 selection:text-teal-900">
      <LandingHeader />
      <main>
        <LandingHero />
        <TrustSection />
        <FeaturesSection />
        <IntegrationsSection />
        <PricingSection />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  );
};

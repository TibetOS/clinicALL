import React from 'react';

const companies = [
  "Aesthetics Pro", "MedSpa IL", "DermaCare", "BeautyTech", "ClinicOne", "LaserFlow", "SkinDeep"
];

export const TrustSection: React.FC = () => {
  return (
    <section id="trust" className="py-12 border-y border-gray-100 bg-stone-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 mb-8 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          יותר מ-500 קליניקות מובילות כבר בחרו ב-Clinicall
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="trust-marquee flex gap-12 whitespace-nowrap py-4 px-4 min-w-full justify-around items-center">
          {/* Doubled list for infinite scroll effect */}
          {[...companies, ...companies, ...companies].map((company, index) => (
            <div key={index} className="flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <span className="text-2xl font-bold text-stone-400 hover:text-teal-600 cursor-default font-['Heebo']">
                {company}
              </span>
            </div>
          ))}
        </div>

        {/* Gradient Masks */}
        <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-stone-50 to-transparent z-10"></div>
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-stone-50 to-transparent z-10"></div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }
        .trust-marquee {
          display: flex;
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

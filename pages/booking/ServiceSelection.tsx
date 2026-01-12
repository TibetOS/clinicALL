import { ChevronLeft, MapPin, Star, Loader2 } from 'lucide-react';
import { Service } from '../../types';

export type ServiceSelectionProps = {
  mode: 'page' | 'modal';
  clinicName: string;
  services: Service[];
  loading: boolean;
  onSelect: (service: Service) => void;
};

export function ServiceSelection({
  mode,
  clinicName,
  services,
  loading,
  onSelect,
}: ServiceSelectionProps) {
  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-right-4">
      {mode === 'page' && (
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3">
            C
          </div>
          <h2 className="font-bold text-xl text-gray-900">{clinicName}</h2>
          <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin size={14} /> תל אביב, שדרות רוטשילד 45
          </div>
          <div className="flex items-center justify-center gap-1 text-amber-500 text-sm mt-1">
            <Star size={14} fill="currentColor" /> 4.9 (128 ביקורות)
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div>
          <h3 className="font-bold text-lg mb-4">בחר טיפול</h3>
          {categories.map((cat) => (
            <div key={cat} className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-3 sticky top-0 bg-white/95 p-2 backdrop-blur-sm rounded z-10 shadow-sm border">
                {cat}
              </h4>
              <div className="space-y-3">
                {services
                  .filter((s) => s.category === cat)
                  .map((service) => (
                    <div
                      key={service.id}
                      onClick={() => onSelect(service)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && onSelect(service)}
                      className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <div>
                        <div className="font-bold text-gray-900">{service.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {service.duration} דקות •{' '}
                          <span className="text-primary font-medium">₪{service.price}</span>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <ChevronLeft size={16} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

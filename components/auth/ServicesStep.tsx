import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock } from 'lucide-react';
import { Button, Input, cn } from '../ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import type { SignupStepProps, ServiceInput } from './types';
import { DURATION_OPTIONS } from './types';

export const ServicesStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
  onBack,
}: SignupStepProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceInput | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    duration: 30,
    price: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const services = formData.services;

  const openAddDialog = () => {
    setEditingService(null);
    setServiceForm({ name: '', duration: 30, price: 0 });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: ServiceInput) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      duration: service.duration,
      price: service.price,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const validateServiceForm = () => {
    const errors: Record<string, string> = {};
    if (!serviceForm.name.trim()) {
      errors.name = 'נא להזין שם שירות';
    }
    if (serviceForm.price < 0) {
      errors.price = 'מחיר לא יכול להיות שלילי';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveService = () => {
    if (!validateServiceForm()) return;

    if (editingService) {
      // Update existing service
      const updated = services.map((s) =>
        s.id === editingService.id
          ? { ...s, ...serviceForm }
          : s
      );
      onChange('services', updated);
    } else {
      // Add new service
      const newService: ServiceInput = {
        id: `service-${Date.now()}`,
        name: serviceForm.name,
        duration: serviceForm.duration,
        price: serviceForm.price,
      };
      onChange('services', [...services, newService]);
    }

    setIsDialogOpen(false);
  };

  const handleDeleteService = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    onChange('services', updated);
  };

  const getDurationLabel = (minutes: number) => {
    const option = DURATION_OPTIONS.find((o) => o.value === minutes);
    return option?.label || `${minutes} דקות`;
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">נתחיל להוסיף שירותים</h2>
        <p className="text-gray-500 mt-2 text-sm">
          הגדירו עכשיו שירות אחד לפחות, בהמשך יהיה ניתן להוסיף שירותים נוספים.
        </p>
      </div>

      {fieldErrors.services && (
        <p className="text-red-500 text-sm text-center">{fieldErrors.services}</p>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={openAddDialog}
          className="gap-2"
        >
          <Plus size={18} />
          הוספת שירות
        </Button>
      </div>

      {/* Services list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
            <p>אין שירותים עדיין</p>
            <p className="text-sm">לחץ על "הוספת שירות" כדי להתחיל</p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => openEditDialog(service)}
            >
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteService(service.id);
                  }}
                  className="text-red-400 hover:text-red-600 p-1"
                  title="מחק שירות"
                >
                  <Trash2 size={18} />
                </button>
                <div>
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{getDurationLabel(service.duration)}</span>
                  </div>
                </div>
              </div>
              <div className="font-bold text-gray-900">
                ₪{service.price.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
        >
          <span className="flex items-center justify-center gap-2">
            <ChevronRight size={20} /> חזרה
          </span>
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 h-12"
        >
          <span className="flex items-center justify-center gap-2">
            המשך <ChevronLeft size={20} />
          </span>
        </Button>
      </div>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'עריכת שירות' : 'הוספת שירות חדש'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">שם השירות</label>
              <Input
                value={serviceForm.name}
                onChange={(e) => setServiceForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="למשל: תספורת גברים"
                className={formErrors.name ? 'border-red-500' : ''}
                autoFocus
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">משך זמן</label>
              <Select
                value={String(serviceForm.duration)}
                onValueChange={(v) => setServiceForm((f) => ({ ...f, duration: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">מחיר (₪)</label>
              <Input
                type="number"
                value={serviceForm.price || ''}
                onChange={(e) => setServiceForm((f) => ({ ...f, price: Number(e.target.value) }))}
                placeholder="0"
                min={0}
                className={cn('text-left', formErrors.price ? 'border-red-500' : '')}
                dir="ltr"
              />
              {formErrors.price && (
                <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleSaveService}>
              {editingService ? 'שמירה' : 'הוספה'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

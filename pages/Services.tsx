import React, { useState } from 'react';
import {
  Plus, Search, Pencil, Trash2, Clock, Banknote,
  Syringe, Sparkles, Heart, Zap
} from 'lucide-react';
import { Card, Button, Input, Badge, Dialog, Label, Skeleton } from '../components/ui';
import { useServices } from '../hooks';
import { Service } from '../types';

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'הזרקות': { icon: Syringe, color: 'text-purple-600', bg: 'bg-purple-50' },
  'קוסמטיקה': { icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50' },
  'טיפולי פנים': { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
  'לייזר': { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
};

const getCategory = (category: string) => {
  return CATEGORY_CONFIG[category] || { icon: Sparkles, color: 'text-gray-600', bg: 'bg-gray-50' };
};

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

const INITIAL_FORM: ServiceFormData = {
  name: '',
  description: '',
  duration: 30,
  price: 0,
  category: 'הזרקות',
};

export const ServicesPage = () => {
  const { services, loading, addService, updateService, deleteService } = useServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter services
  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const categories = [...new Set(services.map(s => s.category))];
  const groupedServices = categories.reduce((acc, cat) => {
    acc[cat] = filteredServices.filter(s => s.category === cat);
    return acc;
  }, {} as Record<string, Service[]>);

  // Handlers
  const handleAdd = async () => {
    setSaving(true);
    const result = await addService(formData);
    setSaving(false);

    if (result) {
      setIsAddOpen(false);
      setFormData(INITIAL_FORM);
      showSuccess('הטיפול נוסף בהצלחה');
    }
  };

  const handleEdit = async () => {
    if (!selectedService) return;
    setSaving(true);
    const result = await updateService(selectedService.id, formData);
    setSaving(false);

    if (result) {
      setIsEditOpen(false);
      setSelectedService(null);
      setFormData(INITIAL_FORM);
      showSuccess('הטיפול עודכן בהצלחה');
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    setSaving(true);
    const success = await deleteService(selectedService.id);
    setSaving(false);

    if (success) {
      setIsDeleteOpen(false);
      setSelectedService(null);
      showSuccess('הטיפול נמחק בהצלחה');
    }
  };

  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setIsDeleteOpen(true);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">טיפולים ומחירון</h1>
          <p className="text-gray-600">ניהול הטיפולים והמחירים המוצעים במרפאה</p>
        </div>
        <Button className="shadow-sm" onClick={() => { setFormData(INITIAL_FORM); setIsAddOpen(true); }}>
          <Plus className="ml-2 h-4 w-4" /> הוסף טיפול
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש טיפול..."
            className="pr-9"
            name="search"
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant={selectedCategory === null ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            הכל
          </Button>
          {categories.map(cat => {
            const config = getCategory(cat);
            const Icon = config.icon;
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                <Icon size={14} className="ml-1" />
                {cat}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="p-5">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Services Grid */}
      {!loading && Object.entries(groupedServices).map(([category, categoryServices]) => {
        if (categoryServices.length === 0) return null;
        const config = getCategory(category);
        const Icon = config.icon;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <Icon size={18} className={config.color} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{category}</h2>
              <Badge variant="secondary">{categoryServices.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryServices.map(service => (
                <Card
                  key={service.id}
                  className="p-5 hover:shadow-md transition-all group cursor-pointer border-r-2 border-r-transparent hover:border-r-primary"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2.5 rounded-xl ${config.bg}`}>
                      <Icon size={20} className={config.color} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); openEditDialog(service); }}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => { e.stopPropagation(); openDeleteDialog(service); }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock size={14} />
                      <span>{service.duration} דק׳</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <Banknote size={14} />
                      <span>₪{service.price.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {!loading && filteredServices.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Syringe size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">לא נמצאו טיפולים</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'נסה לשנות את מילות החיפוש' : 'התחל להוסיף טיפולים למרפאה'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus size={16} className="ml-2" /> הוסף טיפול ראשון
            </Button>
          )}
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddOpen || isEditOpen}
        onClose={() => { setIsAddOpen(false); setIsEditOpen(false); setSelectedService(null); }}
        title={isEditOpen ? 'עריכת טיפול' : 'הוספת טיפול חדש'}
      >
        <div className="space-y-4">
          <div>
            <Label>שם הטיפול</Label>
            <Input
              name="service-name"
              autoComplete="off"
              placeholder="לדוגמה: בוטוקס - אזור מצח"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label>תיאור</Label>
            <textarea
              className="w-full min-h-[80px] border border-gray-200 rounded-lg p-3 text-sm"
              placeholder="תיאור קצר של הטיפול..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label>קטגוריה</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="הזרקות">הזרקות</option>
              <option value="קוסמטיקה">קוסמטיקה</option>
              <option value="טיפולי פנים">טיפולי פנים</option>
              <option value="לייזר">לייזר</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>משך (דקות)</Label>
              <Input
                type="number"
                name="service-duration"
                autoComplete="off"
                min="5"
                step="5"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label>מחיר (₪)</Label>
              <Input
                type="number"
                name="service-price"
                autoComplete="off"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              variant="ghost"
              onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
              disabled={saving}
            >
              ביטול
            </Button>
            <Button
              onClick={isEditOpen ? handleEdit : handleAdd}
              disabled={saving || !formData.name || !formData.price}
            >
              {saving ? 'שומר...' : isEditOpen ? 'שמור שינויים' : 'הוסף טיפול'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedService(null); }}
        title="מחיקת טיפול"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            האם אתה בטוח שברצונך למחוק את הטיפול <strong>"{selectedService?.name}"</strong>?
          </p>
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            פעולה זו לא ניתנת לביטול. תורים קיימים לטיפול זה לא יימחקו.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => { setIsDeleteOpen(false); setSelectedService(null); }}
              disabled={saving}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? 'מוחק...' : 'מחק טיפול'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

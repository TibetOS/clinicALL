import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Pencil, Trash2, Clock, Banknote,
  Syringe, Sparkles, Heart, Zap, MoreHorizontal, Eye, EyeOff, Power
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Button, Input, Badge, Dialog, Label, Skeleton, Switch } from '../../components/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Empty } from '../../components/ui/empty';
import { useServices } from '../../hooks';
import { Service } from '../../types';

// Single source of truth for categories
const CATEGORIES = [
  { value: 'הזרקות', icon: Syringe, color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'קוסמטיקה', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50' },
  { value: 'טיפולי פנים', icon: Heart, color: 'text-teal-600', bg: 'bg-teal-50' },
  { value: 'לייזר', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
] as const;

const DEFAULT_CATEGORY = { icon: Sparkles, color: 'text-gray-600', bg: 'bg-gray-50' };

const getCategory = (category: string) => {
  const found = CATEGORIES.find(c => c.value === category);
  return found || DEFAULT_CATEGORY;
};

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

const INITIAL_FORM: ServiceFormData = {
  name: '',
  description: '',
  duration: 30,
  price: 0,
  category: 'הזרקות',
  isActive: true,
};

export const ServicesPage = () => {
  const { services, loading, addService, updateService, deleteService, fetchServices } = useServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  // Refetch services when showInactive changes
  useEffect(() => {
    fetchServices(showInactive);
  }, [showInactive, fetchServices]);

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
      toast.success('הטיפול נוסף בהצלחה');
    } else {
      toast.error('שגיאה בהוספת הטיפול');
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
      toast.success('הטיפול עודכן בהצלחה');
    } else {
      toast.error('שגיאה בעדכון הטיפול');
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
      toast.success('הטיפול נמחק בהצלחה');
    } else {
      toast.error('שגיאה במחיקת הטיפול');
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
      isActive: service.isActive,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">טיפולים ומחירון</h1>
          <p className="text-gray-600">ניהול הטיפולים והמחירים המוצעים במרפאה</p>
        </div>
        <Button className="shadow-sm gap-2" onClick={() => { setFormData(INITIAL_FORM); setIsAddOpen(true); }}>
          הוסף טיפול <Plus className="h-4 w-4" />
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
                className="whitespace-nowrap gap-1"
              >
                {cat} <Icon size={14} />
              </Button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mr-auto">
          <Button
            variant={showInactive ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
            className="whitespace-nowrap gap-1"
          >
            {showInactive ? 'הסתר לא פעילים' : 'הצג לא פעילים'} <EyeOff size={14} />
          </Button>
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
                  className={`p-5 hover:shadow-md transition-all group cursor-pointer border-r-2 border-r-transparent hover:border-r-primary ${!service.isActive ? 'opacity-60 bg-gray-50' : ''}`}
                  onClick={() => openEditDialog(service)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2.5 rounded-xl ${config.bg}`}>
                        <Icon size={20} className={config.color} />
                      </div>
                      {!service.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          לא פעיל
                        </Badge>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(service)}>
                          עריכה <Pencil className="h-4 w-4" />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={async () => {
                            const result = await updateService(service.id, { isActive: !service.isActive });
                            if (result) {
                              toast.success(service.isActive ? 'הטיפול הושבת' : 'הטיפול הופעל');
                            }
                          }}
                        >
                          {service.isActive ? 'השבת טיפול' : 'הפעל טיפול'} <Power className="h-4 w-4" />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 opacity-50 cursor-not-allowed" disabled>
                          צפייה בנתונים (בקרוב) <Eye className="h-4 w-4" />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-red-600 focus:text-red-600"
                          onClick={() => openDeleteDialog(service)}
                        >
                          מחיקה <Trash2 className="h-4 w-4" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className={`font-bold mb-1 ${!service.isActive ? 'text-gray-500' : 'text-gray-900'}`}>{service.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock size={14} />
                      <span>{service.duration} דק׳</span>
                    </div>
                    <div className={`flex items-center gap-1 font-bold ${!service.isActive ? 'text-gray-500' : 'text-primary'}`}>
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
        <Card className="p-12">
          <Empty
            icon={searchTerm ? <Search className="h-6 w-6 text-muted-foreground" /> : <Syringe className="h-6 w-6 text-muted-foreground" />}
            title={searchTerm ? 'לא נמצאו תוצאות' : 'לא נמצאו טיפולים'}
            description={searchTerm ? 'נסה לשנות את מילות החיפוש' : 'התחל להוסיף טיפולים למרפאה'}
            action={
              !searchTerm ? (
                <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
                  הוסף טיפול ראשון <Plus size={16} />
                </Button>
              ) : undefined
            }
          />
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
            <Label htmlFor="service-name">שם הטיפול</Label>
            <Input
              id="service-name"
              name="service-name"
              autoComplete="off"
              placeholder="לדוגמה: בוטוקס - אזור מצח"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="service-description">תיאור</Label>
            <textarea
              id="service-description"
              className="flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(13,148,136,0.1)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out resize-none"
              placeholder="תיאור קצר של הטיפול..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="service-category">קטגוריה</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger id="service-category">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service-duration">משך (דקות)</Label>
              <Input
                id="service-duration"
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
              <Label htmlFor="service-price">מחיר (₪)</Label>
              <Input
                id="service-price"
                type="number"
                name="service-price"
                autoComplete="off"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Power size={16} className={formData.isActive ? 'text-green-600' : 'text-gray-400'} />
              <Label className="font-medium cursor-pointer" htmlFor="service-active">
                טיפול פעיל
              </Label>
            </div>
            <Switch
              id="service-active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
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

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={(open) => { if (!open && !saving) { setIsDeleteOpen(false); setSelectedService(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">מחיקת טיפול</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              האם אתה בטוח שברצונך למחוק את הטיפול "{selectedService?.name}"?
              <span className="block mt-2 text-amber-600">
                פעולה זו לא ניתנת לביטול. תורים קיימים לטיפול זה לא יימחקו.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:justify-center">
            <AlertDialogCancel disabled={saving}>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? 'מוחק...' : 'מחק טיפול'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

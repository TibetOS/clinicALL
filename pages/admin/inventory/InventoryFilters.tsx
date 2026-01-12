import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button, Input, Label } from '../../../components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  CATEGORIES,
  STATUS_OPTIONS,
  SORT_OPTIONS,
  SortField,
  SortDirection,
  SortOption,
} from './inventory-helpers';

export type InventoryFiltersProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
};

export function InventoryFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortOption,
  onSortChange,
  showFilters,
  onToggleFilters,
}: InventoryFiltersProps) {
  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortField, SortDirection];
    const found = SORT_OPTIONS.find(o => o.field === field && o.direction === direction);
    if (found) onSortChange(found);
  };

  const clearFilters = () => {
    onCategoryChange('all');
    onStatusChange('all');
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם, מק״ט או אצווה..."
            className="pr-9"
            name="search"
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="sm"
            className="flex-1 sm:flex-none gap-1"
            onClick={onToggleFilters}
          >
            סינון <Filter className="h-3 w-3" />
            {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Select value={`${sortOption.field}-${sortOption.direction}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="מיון" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={`${opt.field}-${opt.direction}`} value={`${opt.field}-${opt.direction}`}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <div className="w-48">
            <Label className="text-xs text-gray-500">קטגוריה</Label>
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Label className="text-xs text-gray-500">סטטוס</Label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(categoryFilter !== 'all' || statusFilter !== 'all') && (
            <Button variant="ghost" size="sm" className="self-end" onClick={clearFilters}>
              <X className="h-4 w-4 ml-1" /> נקה סינון
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

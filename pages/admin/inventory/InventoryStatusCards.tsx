import { AlertTriangle, Package, History } from 'lucide-react';
import { Card } from '../../../components/ui';
import { Progress } from '../../../components/ui/progress';

export type InventoryStatusCardsProps = {
  criticalCount: number;
  lowStockCount: number;
  totalQuantity: number;
  totalValue: number;
  totalItems: number;
};

export function InventoryStatusCards({
  criticalCount,
  lowStockCount,
  totalQuantity,
  totalValue,
  totalItems,
}: InventoryStatusCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className={`p-4 border-l-4 border-l-red-500 transition-all ${
        criticalCount > 0 ? 'bg-red-50 ring-2 ring-red-200 shadow-lg' : 'bg-red-50/20'
      }`}>
        <div className="flex items-center gap-4 mb-3">
          <div className={`p-3 bg-white rounded-full shadow-sm text-red-500 ${criticalCount > 0 ? 'animate-pulse' : ''}`}>
            <AlertTriangle size={24} className={criticalCount > 0 ? 'animate-bounce' : ''}/>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">פריטים במלאי קריטי</p>
            <h3 className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{criticalCount}</h3>
          </div>
        </div>
        <Progress value={totalItems > 0 ? (criticalCount / totalItems) * 100 : 0} className="h-2" indicatorClassName="bg-red-500" />
      </Card>
      <Card className={`p-4 border-l-4 border-l-yellow-500 transition-all ${
        lowStockCount > 0 ? 'bg-yellow-50 ring-2 ring-yellow-200 shadow-lg' : 'bg-yellow-50/20'
      }`}>
        <div className="flex items-center gap-4 mb-3">
          <div className={`p-3 bg-white rounded-full shadow-sm text-yellow-600 ${lowStockCount > 0 ? 'animate-pulse' : ''}`}>
            <Package size={24}/>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">פריטים במלאי נמוך</p>
            <h3 className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{lowStockCount}</h3>
          </div>
        </div>
        <Progress value={totalItems > 0 ? (lowStockCount / totalItems) * 100 : 0} className="h-2" indicatorClassName="bg-yellow-500" />
      </Card>
      <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50/20">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-white rounded-full shadow-sm text-blue-600"><History size={24}/></div>
          <div>
            <p className="text-sm font-medium text-gray-600">סה״כ יחידות במלאי</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalQuantity.toLocaleString()}</h3>
          </div>
        </div>
        <Progress value={100} className="h-2" indicatorClassName="bg-blue-500" />
      </Card>
      <Card className="p-4 border-l-4 border-l-green-500 bg-green-50/20">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-white rounded-full shadow-sm text-green-600">₪</div>
          <div>
            <p className="text-sm font-medium text-gray-600">שווי מלאי</p>
            <h3 className="text-2xl font-bold text-gray-900">₪{totalValue.toLocaleString()}</h3>
          </div>
        </div>
        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
      </Card>
    </div>
  );
}

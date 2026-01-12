/**
 * Loading spinner for lazy loaded routes with enhanced animation.
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64 animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-teal-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-gray-500 text-sm animate-pulse">טוען...</p>
      </div>
    </div>
  );
}

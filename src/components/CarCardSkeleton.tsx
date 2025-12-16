// Файл: src/components/CarCardSkeleton.tsx

export default function CarCardSkeleton() {
  return (
    <div className="bg-neutral-800/50 border border-neutral-700/60 rounded-xl shadow-lg animate-pulse">
      {/* Прямоугольник для фото */}
      <div className="aspect-video bg-neutral-700 rounded-t-xl"></div>
      
      <div className="p-5">
        {/* Полоска для названия */}
        <div className="h-6 w-3/4 bg-neutral-600 rounded-md mb-3"></div>
        
        {/* Полоска для класса */}
        <div className="h-4 w-1/4 bg-neutral-700 rounded-md mb-5"></div>
        
        {/* Полоска для цены */}
        <div className="h-8 w-1/2 bg-neutral-600 rounded-md"></div>
      </div>
    </div>
  );
}
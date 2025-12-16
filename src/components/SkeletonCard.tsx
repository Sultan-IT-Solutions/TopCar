// src/components/SkeletonCard.tsx
'use client'

const SkeletonCard = () => {
  return (
    <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-800 p-4">
      <div className="animate-pulse flex flex-col justify-end h-full">
        <div className="h-6 bg-neutral-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;

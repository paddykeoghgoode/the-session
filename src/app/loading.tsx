import { PubCardListSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero skeleton */}
      <div className="text-center mb-12 animate-pulse">
        <div className="w-24 h-24 mx-auto mb-6 bg-stout-800 rounded-full" />
        <div className="h-12 bg-stout-800 rounded-lg w-3/4 mx-auto mb-4" />
        <div className="h-6 bg-stout-800 rounded-lg w-1/2 mx-auto mb-8" />
        <div className="h-12 bg-stout-800 rounded-xl w-full max-w-2xl mx-auto" />
      </div>

      {/* Stats skeleton */}
      <div className="flex justify-center gap-6 mb-10 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-32 bg-stout-800 rounded-lg" />
        ))}
      </div>

      {/* Featured pubs skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-stout-800 rounded-lg w-48 mb-4 animate-pulse" />
        <PubCardListSkeleton count={3} />
      </div>
    </div>
  );
}

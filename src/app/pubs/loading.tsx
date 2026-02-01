import { PubCardListSkeleton } from '@/components/Skeleton';

export default function PubsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-stout-700 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-stout-700 rounded animate-pulse" />
      </div>
      <PubCardListSkeleton count={9} />
    </div>
  );
}

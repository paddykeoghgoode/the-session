import { TableSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-10 bg-stout-800 rounded-lg w-64 mb-4" />
        <div className="flex gap-4">
          <div className="h-10 bg-stout-800 rounded-lg w-32" />
          <div className="h-10 bg-stout-800 rounded-lg w-32" />
          <div className="h-10 bg-stout-800 rounded-lg w-32" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-stout-800 border border-stout-700 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-stout-700 rounded w-24 mb-2" />
            <div className="h-8 bg-stout-700 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-stout-800 border border-stout-700 rounded-lg p-6">
        <div className="h-6 bg-stout-700 rounded w-48 mb-4 animate-pulse" />
        <TableSkeleton rows={10} cols={5} />
      </div>
    </div>
  );
}

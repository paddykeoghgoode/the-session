export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header skeleton */}
      <div className="bg-stout-800 border border-stout-700 rounded-lg p-6 mb-6 animate-pulse">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-stout-700 rounded-full" />

          {/* Info */}
          <div className="flex-1">
            <div className="h-8 bg-stout-700 rounded w-48 mb-2" />
            <div className="h-4 bg-stout-700 rounded w-32 mb-4" />
            <div className="flex gap-4">
              <div className="h-4 bg-stout-700 rounded w-20" />
              <div className="h-4 bg-stout-700 rounded w-20" />
              <div className="h-4 bg-stout-700 rounded w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-stout-800 border border-stout-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-stout-700 rounded w-20 mb-2" />
            <div className="h-8 bg-stout-700 rounded w-12" />
          </div>
        ))}
      </div>

      {/* Activity skeleton */}
      <div className="bg-stout-800 border border-stout-700 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-stout-700 rounded w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 bg-stout-700 rounded" />
              <div className="flex-1">
                <div className="h-4 bg-stout-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-stout-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

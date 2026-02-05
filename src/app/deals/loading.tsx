export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-10 bg-stout-800 rounded-lg w-48 mb-2" />
        <div className="h-6 bg-stout-800 rounded-lg w-96" />
      </div>

      {/* Deal cards skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-stout-800 border-2 border-amber-500/30 rounded-lg overflow-hidden animate-pulse">
            {/* Image */}
            <div className="h-48 bg-stout-700" />

            {/* Content */}
            <div className="p-4">
              <div className="h-4 bg-stout-700 rounded w-20 mb-3" />
              <div className="h-6 bg-stout-700 rounded w-full mb-2" />
              <div className="h-4 bg-stout-700 rounded w-3/4 mb-4" />

              {/* Stats */}
              <div className="flex gap-4 pt-2 border-t border-stout-700">
                <div className="h-4 bg-stout-700 rounded w-16" />
                <div className="h-4 bg-stout-700 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

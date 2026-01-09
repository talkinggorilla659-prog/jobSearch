import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('bg-gray-200 rounded animate-pulse', className)} />;
}

export function SkeletonJobCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-2 w-full" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonJobDetail() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button */}
      <Skeleton className="h-5 w-32" />

      {/* Header card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Analysis cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Skeleton className="h-5 w-16 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>

      {/* Actions card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Skeleton className="h-5 w-36 mb-3" />
        <div className="flex flex-wrap gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Job cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonJobCard key={i} />
        ))}
      </div>
    </div>
  );
}

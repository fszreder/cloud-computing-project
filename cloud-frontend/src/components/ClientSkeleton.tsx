export default function ClientSkeleton() {
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 bg-slate-200 rounded-lg" />

        <div className="flex-1 space-y-3">
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-3 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-50 space-y-2">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
      </div>
    </div>
  );
}

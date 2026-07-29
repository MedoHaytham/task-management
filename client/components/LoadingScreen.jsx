export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-999998 flex flex-col items-center justify-center gap-4 bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        Loading
      </p>
    </div>
  );
}

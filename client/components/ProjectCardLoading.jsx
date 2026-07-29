export default function ProjectCardLoading({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div
      // eslint-disable-next-line react/no-array-index-key
      key={i}
      className="bg-white rounded-lg shadow-card p-5 animate-pulse"
    >
      <div className="h-4 w-2/3 bg-grey-200 rounded mb-3" />
      <div className="h-3 w-full bg-grey-200 rounded mb-2" />
      <div className="h-3 w-1/2 bg-grey-200 rounded mb-6" />
      <div className="h-3 w-20 bg-grey-200 rounded" />
    </div>
  ));
}

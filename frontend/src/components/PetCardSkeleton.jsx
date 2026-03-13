export default function PetCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded-full w-2/3" />
        <div className="h-3 bg-gray-200 rounded-full w-1/3" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded-full w-full" />
          <div className="h-3 bg-gray-200 rounded-full w-5/6" />
          <div className="h-3 bg-gray-200 rounded-full w-4/6" />
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-full mt-2" />
      </div>
    </div>
  )
}

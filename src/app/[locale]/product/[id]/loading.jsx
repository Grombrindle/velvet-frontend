export default function Loading() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      {/* Simple circular loader */}
      <div className="relative">
        <div className="w-10 h-10 border-4 border-gray-100 rounded-full"></div>
        <div className="w-10 h-10 border-4 border-black rounded-full border-t-transparent animate-spin absolute top-0"></div>
      </div>
      
      {/* Text */}
      <div className="mt-6 text-center">
        <span className="text-gray-700 text-base font-medium">
          Loading product details...
        </span>
      </div>
    </div>
  );
}
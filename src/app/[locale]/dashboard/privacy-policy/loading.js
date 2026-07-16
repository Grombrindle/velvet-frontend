export default function Loading() {
  return (
    <div className="container3 mx-auto">
      <div className="animate-pulse p-8 bg-white rounded-lg shadow-md">
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <p className="text-center mt-4 text-gray-500">Loading privacy policy...</p>
      </div>
    </div>
  );
}
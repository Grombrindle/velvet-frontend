// components/ui/Loader.jsx
const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center h-[40rem]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default Loader;
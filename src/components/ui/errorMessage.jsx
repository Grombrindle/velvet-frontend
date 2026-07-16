// components/ui/ErrorState.jsx
const ErrorState = ({ message = "Something went wrong" }) => {
  return (
    <div className="flex justify-center items-center h-[40rem]">
      <div className="text-center text-red-600">
        <p className="text-xl">Error</p>
        <p className="mt-2">{message}</p>
      </div>
    </div>
  );
};

export default ErrorState;
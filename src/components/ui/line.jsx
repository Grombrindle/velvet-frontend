const Line = ({ mt = "mt-4", className = "" }) => {
  return (
    <div
      className={`w-full h-[0.01rem] bg-[#D4D4D4] ${mt} ${className}`}
    ></div>
  );
};

export default Line;
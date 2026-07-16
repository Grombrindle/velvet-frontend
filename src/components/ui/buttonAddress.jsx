import React from "react";

const Button = ({ onClick, children, className = "", type = "button", disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`text-white font-bold text-lg w-full max-w-[24rem] h-16 bg-black cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};
export default Button;
// components/SubmitButton.jsx
const ProfileButton = ({ 
  isPending, 
  loadingText = "SAVING...", 
  defaultText = "SAVE",
  className = "",
  disabled = false,
  type = "submit",
  onClick
}) => {
  return (
    <button 
      type={type}
      disabled={disabled || isPending} 
      onClick={onClick}
      className={`w-full h-[3.8rem] mt-[1rem] text-md  font-bold bg-black text-white transition-all duration-200 ${
        (disabled || isPending) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {isPending ? loadingText : defaultText}
    </button>
  );
};

export default ProfileButton;
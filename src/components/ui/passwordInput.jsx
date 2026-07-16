// components/PasswordInput.jsx
import { FiEye, FiEyeOff } from "react-icons/fi";

const PasswordInput = ({ 
  locale,
  label,
  field,
  showPassword,
  onToggleShow,
  error,
  placeholder,
  register,
  isPending,
  inputStyles,
  labelStyles,
  errorStyles
}) => {
  return (
    <div>
      <p className={labelStyles}>{label} <span className="text-red-500">*</span></p>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={`${inputStyles} ${error ? "border-red-500" : ""}`}
          placeholder={placeholder}
          disabled={isPending}
          {...register(field)}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className={`absolute ${locale == "en"?'right-3':'left-3'} top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700`}
          disabled={isPending}
        >
          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      </div>
      {error && <p className={errorStyles}>{error.message}</p>}
    </div>
  );
};

export default PasswordInput;
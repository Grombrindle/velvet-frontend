// components/LoginPopup.jsx
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";

const LoginPopup = ({ isOpen, onClose, action }) => {
  const t = useTranslations("product");
  const locale = useLocale();
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    router.push(`/${locale}/login`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/60">
      {" "}
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-xl animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <IoClose className="text-2xl" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {action === "cart"
              ? t("login_to_add_cart_title") || "Login to Add to Cart"
              : t("login_to_favorite_title") || "Login to Save Favorites"}
          </h2>

          <p className="text-gray-600 mb-6">
            {action === "cart"
              ? t("login_to_add_cart_message") ||
                "Please login to add items to your cart and continue shopping."
              : t("login_to_favorite_message") ||
                "Please login to save items to your favorites list."}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {t("login_now") || "Login Now"}
            </button>

            <button
              onClick={onClose}
              className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {t("continue_browsing") || "Continue Browsing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;

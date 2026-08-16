"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { getGenderFromPathname, getLocalePrefix } from "@/lib/locale";

import ForgotPasswordForm from "./ForgotPasswordForm";
import VerifyOtpForm from "./VerifyOtpForm";
import ResetPasswordForm from "./ResetPasswordForm";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const labelStyles = "block text-sm font-semibold text-slate-700 mb-1";
const inputStyles =
  "w-full px-4 py-2.5 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white placeholder:text-slate-400 text-slate-900 shadow-sm";
const errorStyles = "text-red-500 text-xs mt-1 font-medium";

export default function LoginForm({ onSuccess: onSuccessProp }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const pathname = usePathname();
  const setAuth = useAuthStore((state) => state.setAuth);
  const locale = useLocale();

  const [step, setStep] = useState("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [verifyMode, setVerifyMode] = useState("reset");

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Fetch genders data (same as NavBar)
  const {
    data: gendersData,
    isLoading: gendersLoading,
  } = useQuery({
    queryKey: ["genders-web"],
    queryFn: () => apiGet("/web/genders"),
    staleTime: 10 * 60 * 3600 * 24,
  });

  const navItems = React.useMemo(
    () => gendersData?.result || [],
    [gendersData],
  );

  // Get the current gender from the path (same as NavBar)
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const currentGender = getGenderFromPathname(pathname, searchParams);
  const localePrefix = getLocalePrefix(pathname);

  // Get activeGender - exactly like NavBar
  // NavBar: const activeGender = currentGender || navItems[0]?.name.en;
  const activeGender = React.useMemo(() => {
    if (!gendersLoading && navItems.length > 0) {
      // If currentGender exists (could be Arabic), find the matching English version
      if (currentGender) {
        // Find the nav item that matches the current gender (either by en or ar name)
        const matchedItem = navItems.find(item => 
          item.name.en === currentGender || item.name.ar === currentGender
        );
        if (matchedItem) {
          return matchedItem.name.en; // Always return the English version
        }
      }
      // Fallback to the first gender's English name
      return navItems[0]?.name.en || "men";
    }
    return "men";
  }, [currentGender, navItems, gendersLoading]);

  const loginMutation = useMutation({
    mutationFn: (payload) => apiPost("/auth/login", payload),
    onSuccess(data) {
      if (data?.success) {
        setAuth(data.result);
        if (onSuccessProp) {
          onSuccessProp();
        } else {
          // Navigate using the English gender name (like NavBar logo)
          router.push(`${localePrefix}/${activeGender}`);
        }
      } else if (data?.error === "EMAIL_NOT_VERIFIED") {
        toast.error(t("verify_email_required"));
        setVerifyMode("activate");
        setResetEmail(loginForm.getValues("email") || "");
        setStep("verify");
      } else {
        toast.error(data?.message || "Login failed. Please try again.");
      }
    },
  });

  const handleBackToLogin = () => {
    setStep("login");
    setResetEmail("");
    setResetToken("");
  };

  const handleForgotPasswordSuccess = (email) => {
    setVerifyMode("reset");
    setResetEmail(email);
    setStep("verify");
  };

  const handleVerifyOtpSuccess = (result) => {
    if (verifyMode === "activate" && result?.token && result?.user) {
      setAuth({ token: result.token, user: result.user });
      toast.success(t("register_success"));
      
      // Navigate using the English gender name
      router.push(`${localePrefix}/${activeGender}`);
      return;
    }
    setResetToken(result?.token || "");
    setStep("reset");
  };

  const handleResetPasswordSuccess = () => {
    setStep("login");
    loginForm.setValue("email", resetEmail);
    setResetEmail("");
    setResetToken("");
  };

  const handleResendOtp = () => {
    if (verifyMode === "activate") {
      apiPost("/auth/forgot-password", { email: resetEmail })
        .then((d) => toast.success(d?.message || t("otp_sent_success")))
        .catch(() => toast.error(t("generic_error")));
      return;
    }
    setStep("forgot");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sm:mx-auto sm:w-full sm:max-w-xl"
    >
      <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
        {step === "login" && (
          <>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {t("login")}
              </h2>
              <p className="text-slate-500 mt-2">{t("enter_credentials")}</p>
            </div>

            <form
              onSubmit={loginForm.handleSubmit((val) => loginMutation.mutate(val))}
              className="space-y-6"
            >
              <div>
                <label className={labelStyles}>{t("email")}</label>
                <input
                  type="email"
                  className={inputStyles}
                  placeholder="name@company.com"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className={errorStyles}>
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={labelStyles}>{t("password")}</label>
                  <button
                    type="button"
                    onClick={() => setStep("forgot")}
                    className="text-sm text-indigo-600 hover:underline font-medium cursor-pointer"
                  >
                    {t("forgot_password")}
                  </button>
                </div>
                <input
                  type="password"
                  className={inputStyles}
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className={errorStyles}>
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 shadow-lg text-sm font-bold text-white bg-black hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("logging_in")}
                  </>
                ) : (
                  t("login")
                )}
              </button>

              {loginMutation.isError && (
                <div className="text-red-600 text-sm text-center p-3 bg-red-50 border border-red-100 font-medium">
                  {loginMutation.error?.message ||
                    "Login failed. Please check your credentials."}
                </div>
              )}
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-600">
                {t("no_account")}{" "}
                <Link
                  href={`/${locale}/register`}
                  className="text-indigo-600 hover:underline"
                >
                  {t("register_here")}
                </Link>
              </p>
            </div>
          </>
        )}

        {step === "forgot" && (
          <ForgotPasswordForm
            initialEmail={resetEmail}
            onSuccess={handleForgotPasswordSuccess}
            onBackToLogin={handleBackToLogin}
          />
        )}

        {step === "verify" && (
          <VerifyOtpForm
            email={resetEmail}
            onSuccess={handleVerifyOtpSuccess}
            onResendOtp={handleResendOtp}
            onBackToLogin={handleBackToLogin}
          />
        )}

        {step === "reset" && (
          <ResetPasswordForm
            token={resetToken}
            onSuccess={handleResetPasswordSuccess}
            onBackToLogin={handleBackToLogin}
          />
        )}
      </div>
    </motion.div>
  );
}
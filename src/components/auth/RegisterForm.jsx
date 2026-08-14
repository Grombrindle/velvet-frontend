"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiPost } from "@/lib/api";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import VerifyOtpForm from "./VerifyOtpForm";
import { useAuthStore } from "@/lib/store";

const getRegisterSchema = (t) =>
  z
    .object({
      name: z.string().min(1, t("required_name")),
      sur_name: z.string().min(1, t("required_surname")),
      email: z.string().email(t("invalid_email")),
      password: z.string().min(8, t("password_length")),
      password_confirmation: z.string().min(8, t("confirm_password")),
      phone_number: z.string().min(7, t("required_phone")),
      birth_day: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
        message: t("invalid_date"),
      }),
      gender: z.enum(["male", "female", "other"]),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.password_confirmation) {
        ctx.addIssue({
          code: "custom",
          message: t("passwords_must_match"),
          path: ["password_confirmation"],
        });
      }
    });

// Helper function to pull messages out of Laravel/Express 422 error structures
const getErrorMessage = (error, fallbackMessage = "An error occurred") => {
  const responseData = error?.response?.data || error;

  // Handles: { error: { email: ["The email has already been taken."] } }
  if (responseData?.error && typeof responseData.error === "object") {
    const firstKey = Object.keys(responseData.error)[0];
    if (firstKey && Array.isArray(responseData.error[firstKey])) {
      return responseData.error[firstKey][0];
    }
  }

  // Handles: { message: "Validation failed" }
  return (
    responseData?.message ||
    error?.message ||
    fallbackMessage
  );
};

const labelStyles = "block text-sm font-semibold text-slate-700 mb-1";
const inputStyles =
  "w-full px-4 py-2.5 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white placeholder:text-slate-400 text-slate-900 shadow-sm";
const errorStyles = "text-red-500 text-xs mt-1 font-medium";

export default function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const locale = useLocale();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [step, setStep] = useState("register"); // "register" | "otp"
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getRegisterSchema(t)),
  });

  // Resend / Trigger OTP Mutation
  const sendOtpMutation = useMutation({
    mutationFn: (email) => apiPost("/auth/forgot-password", { email }),
    onSuccess() {
      toast.success(t("otp_sent_success") || "OTP code sent to your email!");
      setStep("otp"); // Strictly move to OTP step here only after success
    },
    onError(error) {
      const errMsg = getErrorMessage(error, t("generic_error"));
      toast.error(errMsg);
    },
  });

  // Main Registration Mutation
  const registerMutation = useMutation({
    mutationFn: (payload) => apiPost("/auth/register", payload),
    onSuccess(data, variables) {
      // Defensive check: If your API returns HTTP 200/201 but success flag is false
      if (data && data.success === false) {
        const errMsg = getErrorMessage(data, "Registration failed.");
        toast.error(errMsg);
        return; // STOP execution — do not go to OTP step
      }

      const userEmail = variables.email;
      setRegisteredEmail(userEmail);

      // Trigger OTP request only after successful registration
      sendOtpMutation.mutate(userEmail);
    },
    onError(error) {
      // Triggers when API returns HTTP 422, 400, 500, etc.
      const errMsg = getErrorMessage(
        error,
        "Registration failed. Please check your details."
      );
      toast.error(errMsg);
    },
  });

  const onSubmit = (values) => registerMutation.mutate(values);

  // Account is created but NOT yet active: the email OTP activates it, and
  // verify-otp returns a real login token (token + user) so the user enters
  // the site immediately.
  const handleOtpSuccess = (result) => {
    if (!result?.token || !result?.user) {
      toast.error(t("generic_error"));
      return;
    }
    setAuth({ token: result.token, user: result.user });
    toast.success(t("register_success"));
    router.push(`/${locale}`);
  };

  const handleResendOtp = () => {
    if (registeredEmail) {
      sendOtpMutation.mutate(registeredEmail);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sm:mx-auto sm:w-full sm:max-w-xl"
    >
      <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
        {step === "register" ? (
          <>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {t("create_account")}
              </h2>
              <p className="text-slate-500 mt-2">{t("fill_in_details")}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles}>{t("first_name")}</label>
                  <input
                    className={inputStyles}
                    placeholder="John"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className={errorStyles}>{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelStyles}>{t("surname")}</label>
                  <input
                    className={inputStyles}
                    placeholder="doe"
                    {...register("sur_name")}
                  />
                  {errors.sur_name && (
                    <p className={errorStyles}>{errors.sur_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelStyles}>{t("email")}</label>
                <input
                  type="email"
                  className={inputStyles}
                  placeholder="name@company.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className={errorStyles}>{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles}>{t("password")}</label>
                  <input
                    type="password"
                    className={inputStyles}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className={errorStyles}>{errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelStyles}>{t("confirm_password")}</label>
                  <input
                    type="password"
                    className={inputStyles}
                    placeholder="••••••••"
                    {...register("password_confirmation")}
                  />
                  {errors.password_confirmation && (
                    <p className={errorStyles}>
                      {errors.password_confirmation.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelStyles}>{t("phone_number")}</label>
                <input
                  className={inputStyles}
                  placeholder="+123 456 7890"
                  {...register("phone_number")}
                />
                {errors.phone_number && (
                  <p className={errorStyles}>{errors.phone_number.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles}>{t("birth_date")}</label>
                  <input
                    type="date"
                    className={inputStyles}
                    {...register("birth_day")}
                  />
                  {errors.birth_day && (
                    <p className={errorStyles}>{errors.birth_day.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelStyles}>{t("gender")}</label>
                  <select
                    {...register("gender")}
                    defaultValue="female"
                    className={inputStyles}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                  {errors.gender && (
                    <p className={errorStyles}>{errors.gender.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  registerMutation.isPending || sendOtpMutation.isPending
                }
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 shadow-lg text-sm font-bold text-white bg-black hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {registerMutation.isPending || sendOtpMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("setting_things_up")}
                  </>
                ) : (
                  t("register_account")
                )}
              </button>

              {registerMutation.isError && (
                <div className="text-red-600 text-sm text-center p-3 bg-red-50 border border-red-100 font-medium">
                  {getErrorMessage(
                    registerMutation.error,
                    "Registration failed."
                  )}
                </div>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                {t("have_account")}{" "}
                <Link
                  href={`/${locale}/login`}
                  className="text-indigo-600 hover:underline"
                >
                  {t("login_here")}
                </Link>
              </p>
            </div>
          </>
        ) : (
          <VerifyOtpForm
            email={registeredEmail}
            onSuccess={handleOtpSuccess}
            onResendOtp={handleResendOtp}
          />
        )}
      </div>
    </motion.div>
  );
}
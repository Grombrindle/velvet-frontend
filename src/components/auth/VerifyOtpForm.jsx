"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { apiPost } from "@/lib/api";
import { motion } from "framer-motion";

const labelStyles = "block text-sm font-semibold text-slate-700 mb-1";
const inputStyles =
  "w-full px-4 py-2.5 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white placeholder:text-slate-400 text-slate-900 shadow-sm";
const errorStyles = "text-red-500 text-xs mt-1 font-medium";

export default function VerifyOtpForm({ email, onSuccess, onResendOtp, onBackToLogin }) {
  const t = useTranslations("auth");
  const [countdown, setCountdown] = useState(120);
  // Derived: the resend button unlocks when the countdown reaches 0
  const isResendDisabled = countdown > 0;

  const startCountdown = useCallback(() => {
    setCountdown(120);
  }, []);

  const verifyOtpSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("email_required"))
          .email(t("invalid_email")),
        otp: z
          .string()
          .min(1, t("otp_required"))
          .length(6, t("otp_length")),
      }),
    [t]
  );

  const form = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: email || "", otp: "" },
  });

  useEffect(() => {
    form.reset({
      email: email || "",
      otp: "",
    });
  }, [email, form]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const verifyOtpMutation = useMutation({
    mutationFn: (payload) => apiPost("/auth/verify-otp", payload),
    onSuccess(data) {
      if (data?.success) {
        toast.success(t("otp_verified_success"));
        // Pass the whole result so callers get token + user (register flow
        // logs the user straight in; reset flow only needs the token).
        onSuccess(data?.result || {});
      } else {
        toast.error(data?.message || t("invalid_otp_error"));
      }
    },
    onError: (error) => {
      toast.error(error?.message || t("generic_error"));
    },
  });

  const onSubmit = (values) => verifyOtpMutation.mutate(values);

  const handleResend = () => {
    if (isResendDisabled) return;
    form.reset({ email: email || "", otp: "" });
    startCountdown();
    onResendOtp();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className="mb-8 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-900 tracking-tight"
        >
          {t("verify_otp_title")}
        </motion.h2>
        <p className="text-slate-500 mt-2">
          {t("verify_otp_subtitle")}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className={labelStyles}>{t("email_label")}</label>
          <input
            type="email"
            className={inputStyles}
            placeholder={t("email_placeholder")}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className={errorStyles}>{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label className={labelStyles}>{t("otp_label")}</label>
          <input
            type="text"
            className={inputStyles}
            placeholder={t("otp_placeholder")}
            maxLength={6}
            {...form.register("otp")}
          />
          {form.formState.errors.otp && (
            <p className={errorStyles}>{form.formState.errors.otp.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={verifyOtpMutation.isPending}
          className="w-full flex justify-center cursor-pointer items-center gap-2 py-3.5 px-4 shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {verifyOtpMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t("verifying")}
            </>
          ) : (
            t("verify_otp")
          )}
        </button>

        <div className="flex flex-col items-center gap-3 pt-2">
          {/* Timer Display */}
          <div className="flex items-center justify-center gap-3">
            <motion.div 
              className="relative flex items-center justify-center"
              animate={{ scale: countdown > 0 && countdown <= 10 ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: countdown > 0 && countdown <= 10 ? Infinity : 0, duration: 0.5 }}
            >
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full 
                ${countdown > 0 
                  ? countdown <= 10 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  : 'bg-green-50 text-green-600 border border-green-200'
                }
                transition-all duration-300
              `}>
                <svg 
                  className={`w-5 h-5 ${countdown > 0 ? 'animate-pulse' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-mono font-bold text-lg tracking-wider">
                  {countdown > 0 ? formatTime(countdown) : "Ready"}
                </span>
              </div>
            </motion.div>

            <span className="text-slate-300 text-sm">|</span>
            
            <button
              type="button"
              onClick={handleResend}
              disabled={isResendDisabled}
              className={`
                text-sm font-medium transition-all duration-200
                ${isResendDisabled 
                  ? 'text-slate-400 cursor-not-allowed' 
                  : 'text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer'
                }
              `}
            >
              {t("resend_otp")}
            </button>
          </div>

          {/* Progress Bar */}
          {countdown > 0 && (
            <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${
                  countdown <= 10 ? 'bg-red-500' : 'bg-indigo-500'
                }`}
                initial={{ width: "100%" }}
                animate={{ width: `${(countdown / 120) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          {/* Only show "Back to Login" if the prop is provided */}
          {onBackToLogin && (
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-indigo-600 hover:underline text-sm font-medium mt-1"
            >
              {t("back_to_login")}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
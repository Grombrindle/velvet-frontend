"use client";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { apiPost } from "@/lib/api";

const labelStyles = "block text-sm font-semibold text-slate-700 mb-1";
const inputStyles =
  "w-full px-4 py-2.5 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white placeholder:text-slate-400 text-slate-900 shadow-sm";
const errorStyles = "text-red-500 text-xs mt-1 font-medium";

export default function ForgotPasswordForm({ onSuccess, onBackToLogin, initialEmail = "" }) {
  const t = useTranslations("auth");

  // Create localized validation schema dynamically
  const forgotPasswordSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("email_required"))
          .email(t("invalid_email")),
      }),
    [t]
  );

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: initialEmail },
  });

  const forgotMutation = useMutation({
    mutationFn: (payload) => apiPost("/auth/forgot-password", payload),
    onSuccess(data, variables) {
      if (data?.success) {
        toast.success(t("otp_sent_success"));
        onSuccess(variables.email);
      } else {
        toast.error(data?.message || t("failed_send_otp"));
      }
    },
    onError: (error) => {
      toast.error(error?.message || t("generic_error"));
    },
  });

  const onSubmit = (values) => forgotMutation.mutate(values);

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          {t("forgot_password_title")}
        </h2>
        <p className="text-slate-500 mt-2">
          {t("forgot_password_subtitle")}
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

        <button
          type="submit"
          disabled={forgotMutation.isPending}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {forgotMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t("sending_otp")}
            </>
          ) : (
            t("send_otp")
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            {t("back_to_login")}
          </button>
        </div>
      </form>
    </>
  );
}
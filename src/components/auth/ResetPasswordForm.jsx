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

export default function ResetPasswordForm({ token, onSuccess, onBackToLogin }) {
  const t = useTranslations("auth");

  const resetPasswordSchema = useMemo(
    () =>
      z
        .object({
          password: z
            .string()
            .min(1, t("password_required"))
            .min(6, t("password_min_length")),
          password_confirmation: z
            .string()
            .min(1, t("confirm_password_required")),
        })
        .refine(
          (data) => {
            if (!data.password || !data.password_confirmation) return true;
            return data.password === data.password_confirmation;
          },
          {
            message: t("passwords_dont_match"),
            path: ["password_confirmation"],
          }
        ),
    [t]
  );

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (payload) => {
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      return apiPost(
        "/auth/otp/reset-password",
        {
          password: payload.password,
          password_confirmation: payload.password_confirmation,
        },
        { headers }
      );
    },
    onSuccess(data) {
      if (data?.success) {
        toast.success(t("reset_password_success"));
        onSuccess();
      } else {
        toast.error(data?.message || t("failed_reset_password"));
      }
    },
    onError: (error) => {
      toast.error(error?.message || t("generic_error"));
    },
  });

  const onSubmit = (values) => resetPasswordMutation.mutate(values);

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          {t("reset_password_title")}
        </h2>
        <p className="text-slate-500 mt-2">{t("reset_password_subtitle")}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className={labelStyles}>{t("new_password_label")}</label>
          <input
            type="password"
            className={inputStyles}
            placeholder="••••••••"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className={errorStyles}>
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className={labelStyles}>{t("confirm_password_label")}</label>
          <input
            type="password"
            className={inputStyles}
            placeholder="••••••••"
            {...form.register("password_confirmation")}
          />
          {form.formState.errors.password_confirmation && (
            <p className={errorStyles}>
              {form.formState.errors.password_confirmation.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="w-full flex justify-center cursor-pointer items-center gap-2 py-3.5 px-4 shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {resetPasswordMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t("resetting_password")}
            </>
          ) : (
            t("reset_password_button")
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
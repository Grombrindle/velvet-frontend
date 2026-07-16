"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const labelStyles = "block text-sm font-semibold text-slate-700 mb-1";
const inputStyles =
  "w-full px-4 py-2.5 border border-slate-300  focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white placeholder:text-slate-400 text-slate-900 shadow-sm";
const errorStyles = "text-red-500 text-xs mt-1 font-medium";

export default function LoginForm({ onSuccess: onSuccessProp }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const locale = useLocale();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: (payload) => apiPost("/auth/login", payload),
    onSuccess(data) {
      if (data?.success) {
        setAuth(data.result);
        if (onSuccessProp) {
          onSuccessProp();
        } else {
          router.push(`/${locale}`);
        }
      } else toast.error(data?.message || "Login failed. Please try again.");
    },
  });

  const onSubmit = (values) => mutation.mutate(values);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sm:mx-auto sm:w-full sm:max-w-xl"
    >
      <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 border border-slate-100 ">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t("login")}
          </h2>
          <p className="text-slate-500 mt-2">{t("enter_credentials")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4  shadow-lg text-sm font-bold text-white bg-black hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("logging_in")}
              </>
            ) : (
              t("login")
            )}
          </button>

          {mutation.isError && (
            <div className="text-red-600 text-sm text-center p-3 bg-red-50 border border-red-100 font-medium">
              {mutation.error?.message ||
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
      </div>
    </motion.div>
  );
}

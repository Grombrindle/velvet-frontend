"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useResetPassword } from "./hooks/useChnagePassword";
import { usePasswordSchema } from "./passwordSchema";
import ProfileButton from "../ui/buttonProfile";
import PasswordInput from "../ui/passwordInput";
import { useLocale, useTranslations } from "next-intl";

const ChangePassword = () => {
  const t = useTranslations("profile");
const locale = useLocale();
const passwordSchema = usePasswordSchema();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const inputStyles =
    "w-full h-[3rem] p-2 text-sm placeholder-[#000000] mb-1 shadow-sm border border-gray-300";
  const labelStyles = "text-[#000000] mb-2 text-md mt-2";
  const errorStyles = "text-red-500 text-sm mb-2";

const onSubmit = async (data) => {
  try {
    const passwordData = {
      current_password: data.currentPassword,
      password: data.newPassword,
      password_confirmation: data.confirmPassword,
    };

    await resetPassword.mutateAsync(passwordData);
    toast.success("Password changed successfully!");
    reset();
  } catch (error) {
    // Now this will catch the error on 422 responses
    toast.error(
      error?.message ||
        error?.response?.message ||
        "Failed to change password. Please try again.",
    );
  }
};

  return (
    <>
      <div
        style={{ boxShadow: "0px 0px 4px 0px #00000040" }}
        className="w-full h-auto relative min-h-[25rem] bg-white mt-[2.5rem] p-6"
      >
        <p className="flex justify-center text-[#333333] lg:text-lg text-center">
          {t("change_password_description")}
        </p>
        <p className="lg:text-xl font-bold text-[#000000] mt-[1rem]">
          {t("change_password")}
        </p>
        <p className={`absolute ${locale === "en"?'right-6':'left-6'} lg:top-[6.5rem] top-[10rem] text-[#000000] text-md lg:block hidden`}>
          <span className="text-red-500">*</span>{t("required_fields")}
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Current Password */}
          <PasswordInput
          locale = {locale}
            label={t("your_current_password")}
            field="currentPassword"
            showPassword={showPasswords.current}
            onToggleShow={() => toggleShow("current")}
            error={errors.currentPassword}
            placeholder={t("Enter_your_current_password")}
            register={register}
            isPending={resetPassword.isPending}
            inputStyles={inputStyles}
            labelStyles={labelStyles}
            errorStyles={errorStyles}
          />

          {/* New Password */}
          <PasswordInput
          locale = {locale}
            label={t("new_password")}
            field="newPassword"
            showPassword={showPasswords.new}
            onToggleShow={() => toggleShow("new")}
            error={errors.newPassword}
            placeholder={t("Enter_your_new_password")}
            register={register}
            isPending={resetPassword.isPending}
            inputStyles={inputStyles}
            labelStyles={labelStyles}
            errorStyles={errorStyles}
          />

          {/* Confirm Password */}
          <PasswordInput
          locale = {locale}
            label={t("new_password_(Repeat)")}
            field="confirmPassword"
            showPassword={showPasswords.confirm}
            onToggleShow={() => toggleShow("confirm")}
            error={errors.confirmPassword}
            placeholder={t("confirm_your_new_password")}
            register={register}
            isPending={resetPassword.isPending}
            inputStyles={inputStyles}
            labelStyles={labelStyles}
            errorStyles={errorStyles}
          />

          {/* Submit Button */}
          <ProfileButton
            isPending={resetPassword.isPending}
            loadingText="CHANGING..."
            defaultText={t('CHANGE_MY_PASSWORD')}
          />
        </form>
      </div>
    </>
  );
};

export default ChangePassword;

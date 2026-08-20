"use client";
import { useProfile, useUpdateProfile } from "./hooks/useProfile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useProfileSchema } from "./profileSchema";
import ProfileButton from "../ui/buttonProfile";
import Loader from "../ui/loader";
import ErrorState from "../ui/errorMessage";
import { useLocale, useTranslations } from "next-intl";

const ProfileForm = () => {
  const profileSchema = useProfileSchema();
  const t = useTranslations("profile");
  const locale = useLocale();

  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const requiredAsterisk = (
    <span className="text-red-500 text-[1.2rem]">*</span>
  );

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // React Hook Form with imported Zod schema
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          name: profile?.name || "",
          surname: profile?.sur_name || "",
          email: profile?.email || "",
          phone: profile?.phone_number || "",
          birthdate: formatDateForInput(profile?.birth_day),
          gender: profile?.gender || "",
        }
      : undefined,
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      birthdate: "",
      gender: "",
    },
  });

  const inputStyles =
    "w-full h-[3rem] p-2 placeholder-[#000000] text-sm mb-1 shadow-sm border border-gray-300";
  const inputErrorStyles =
    "border-red-500 focus:ring-red-500 focus:border-red-500";
  const labelStyles = "text-[#000000] mb-2 text-md";
  const errorStyles = "text-red-500 text-sm mb-3";

  // Handle loading state
  if (isLoading) return <Loader text={t('Loading_profile')}/>;
  // Handle error state
  if (error) return <ErrorState message={error.message} />;

  const onSubmit = async (data) => {
  if (!isDirty) {
    toast.error(t("nothing_to_edit"));
    return;
  }

  try {
    const originalEmail = profile?.email || "";
    
    const formattedData = {
      name: data.name,
      sur_name: data.surname,
      phone_number: data.phone,
      birth_day: data.birthdate,
      gender: data.gender,
    };

    if (data.email !== originalEmail) {
      formattedData.email = data.email;
    }

    await updateProfile.mutateAsync(formattedData);
    toast.success(t("Profile updated successfully"));
    reset(data);
  } catch (err) {
    // Improved error handling
    let errorMessage = "Failed to update profile";
    
    // Try to get the error response
    const errorResponse = err?.response?.data || err?.data || err;
    
    if (errorResponse) {
      // Check for field-specific errors first
      if (errorResponse.error && typeof errorResponse.error === "object") {
        // Get the first field error
        const fieldErrors = errorResponse.error;
        const firstFieldKey = Object.keys(fieldErrors)[0];
        const firstFieldErrors = fieldErrors[firstFieldKey];
        
        if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
          errorMessage = firstFieldErrors[0]; // Get the first error message
        } else if (typeof firstFieldErrors === 'string') {
          errorMessage = firstFieldErrors;
        }
      } 
      // Check for message field
      else if (errorResponse.message && typeof errorResponse.message === 'string') {
        errorMessage = errorResponse.message;
      }
      // Check for direct error string
      else if (typeof errorResponse === 'string') {
        errorMessage = errorResponse;
      }
    }
    
    toast.error(errorMessage);
  }
};
  return (
    <div>
      <div
        style={{ boxShadow: "0px 0px 4px 0px #00000040" }}
        className="w-full relative h-auto p-6 bg-white lg:mt-0 mt-[7rem]"
      >
        <p
          className={`absolute ${locale === "en" ? "right-6" : "left-6"} top-6 text-[#000000] text-md`}
        >
          {requiredAsterisk} {t("required_fields")}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* Name Field */}
          <div>
            <p className={labelStyles}>Name {requiredAsterisk}</p>
            <input
              placeholder={t("Enter_your_name")}
              type="text"
              className={`${inputStyles} ${errors.name ? inputErrorStyles : ""}`}
              {...register("name")}
            />
            {errors.name && (
              <p className={errorStyles}>{errors.name.message}</p>
            )}
          </div>

          {/* Surname Field */}
          <div>
            <p className={labelStyles}>
              {t("surname")} {requiredAsterisk}
            </p>
            <input
              placeholder={t("Enter_your_surname")}
              type="text"
              className={`${inputStyles} ${errors.surname ? inputErrorStyles : ""}`}
              {...register("surname")}
            />
            {errors.surname && (
              <p className={errorStyles}>{errors.surname.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <p className={labelStyles}>
              {t("email_address")} {requiredAsterisk}
            </p>
            <input
              placeholder={t("Enter_your_email")}
              type="email"
              className={`${inputStyles} ${errors.email ? inputErrorStyles : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <p className={errorStyles}>{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <p className={labelStyles}>
              {t("phone_number")} {requiredAsterisk}
            </p>
            <input
              className={`${inputStyles} ${errors.phone ? inputErrorStyles : ""}`}
              placeholder={t("Enter_your_phone_number")}
              {...register("phone")}
            />
            {errors.phone && (
              <p className={errorStyles}>{errors.phone.message}</p>
            )}
          </div>

          {/* Birth Date Field */}
          <div>
            <p className={labelStyles}>
              {t("birth_date")} {requiredAsterisk}
            </p>
            <input
              type="date"
              className={`${inputStyles} ${errors.birthdate ? inputErrorStyles : ""} ${
                locale === "ar" ? "rtl-date-input" : ""
              }`}
              {...register("birthdate")}
            />
            {errors.birthdate && (
              <p className={errorStyles}>{errors.birthdate.message}</p>
            )}
          </div>

          {/* Gender Field */}
          <div>
            <p className="text-md font-bold text-[#000000] mb-2">
              {t("Gender")} {requiredAsterisk}
            </p>
            <div className="flex gap-6 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="male"
                  className="w-5 h-5 accent-black"
                  {...register("gender")}
                />
                <span className="text-[#000000]">{t("Male")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="female"
                  className="w-5 h-5 accent-black"
                  {...register("gender")}
                />
                <span className="text-[#000000]">{t("Female")}</span>
              </label>
            </div>
            {errors.gender && (
              <p className={errorStyles}>{errors.gender.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <ProfileButton
            isPending={isSubmitting}
            loadingText={t("SAVING")}
            defaultText={t("SAVE")}
          />
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
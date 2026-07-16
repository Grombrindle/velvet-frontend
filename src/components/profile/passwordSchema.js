// components/passwordSchema.js
import { z } from "zod";
import { useTranslations } from "next-intl";

// Create a custom hook that uses its own translation namespace
export const usePasswordSchema = () => {
    const t = useTranslations("schema"); // Separate t for schema only

    return z.object({
        currentPassword: z.string().min(1, t("Current_password_required")),
        newPassword: z.string()
            .min(6, t("Password_validation"))
            .regex(/[A-Z]/, t("Password_letter"))
            .regex(/[0-9]/, t("password_numbe"))
            .regex(/[^A-Za-z0-9]/, t("password_charachter")),
        confirmPassword: z.string()
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: t("passwords_do_not_match"),
        path: ["confirmPassword"],
    });
};
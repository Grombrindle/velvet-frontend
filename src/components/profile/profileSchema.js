// components/profileSchema.js
import { z } from "zod";
import { useTranslations } from "next-intl";

export const useProfileSchema = () => {
    const t = useTranslations("schema");

    return z.object({
        name: z.string().min(1, t("name_req")),
        surname: z.string().min(1, t("surname_req")),
        email: z.string().min(1, t("email_req")).email(t("email_invalid")),
        phone: z.string()
            .min(1, t("phone_req"))
            .min(10, t("phone_min"))
            .max(15, t("phone_max"))
            .regex(/^[0-9+\-\s]+$/, t("phone_invalid")),
        birthdate: z.string().min(1, t("birthdate_req")),
    });
};
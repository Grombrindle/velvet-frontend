// components/addressSchema.js
import { z } from "zod";
import { useTranslations } from "next-intl";

// Create a custom hook that uses its own translation namespace
export const useAddressSchema = () => {
    const t = useTranslations("schema"); // Separate t for schema only

    return z.object({
        type: z.enum(["Individual", "Company"]),
        address_title: z.string().min(1, t("address_req")),
        name: z.string().min(1, t("name_req")),
        sur_name: z.string().min(1, t("surname_req")),
        cell_phone: z
            .string()
            .min(1, t("phone_req"))
            .min(10, t("phone_min"))
            .max(15, t("phone_max")),
        postal_code: z
            .string()
            .min(1, t("postal_code_req"))
            .max(20, t("postal_code_validation")),
        address: z.string().min(1, t("address_req")),
        country_id: z.string().min(1, t("country_req")),
        city_id: z.string().min(1, t("city_req")),
    });
};
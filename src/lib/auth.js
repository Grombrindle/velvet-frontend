import Cookies from "js-cookie";
import { useAuthStore } from "./store";

export function saveAuth(result) {
    try {
        if (!result) return;
        if (result.token)
            Cookies.set("token", result.token, { expires: 7, secure: true });
        Cookies.set("user", JSON.stringify(result), { expires: 7, secure: true });
    } catch (e) {}
}



// ... your saveAuth and clearAuth functions ...

export function getToken() {
    // 1. Prefer in-memory Zustand state (always correct after hydration)
    try {
        const token = useAuthStore.getState().token;
        if (token) return token;
    } catch (e) {
        // ignore
    }

    // 2. Fallback to main auth storage cookie
    try {
        const authStorage = Cookies.get("auth-storage");
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed.state ? .token) return parsed.state.token;
        }
    } catch (e) {}

    // 3. Fallback to separate token cookie or guest token cookie
    const directToken = Cookies.get("token");
    if (directToken) return directToken;

    const guestToken = Cookies.get("guest_token");
    if (guestToken) return guestToken;

    return null;
}
export function clearAuth() {
    Cookies.remove("auth-storage");
}
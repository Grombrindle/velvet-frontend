import Cookies from "js-cookie";
import { useAuthStore } from "./store";

export function saveAuth(result) {
  try {
    if (!result) return;
    if (result.token)
      Cookies.set("token", result.token, { expires: 7, secure: true });
    Cookies.set("user", JSON.stringify(result), { expires: 7, secure: true });
  } catch (e) {
    console.error("saveAuth error", e);
  }
}

export function getToken() {
  // Prefer in-memory Zustand state (always correct after hydration)
  try {
    const token = useAuthStore.getState().token;
    if (token) return token;
  } catch (e) {
    // ignore — fall through to cookie
  }
  // Fallback to cookie for pre-hydration reads (first page load)
  try {
    const authStorage = Cookies.get("auth-storage");
    if (!authStorage) return null;
    const parsed = JSON.parse(authStorage);
    return parsed.state?.token || null;
  } catch (e) {
    console.error("Error parsing auth cookie", e);
    return null;
  }
}

export function clearAuth() {
  Cookies.remove("auth-storage");
}

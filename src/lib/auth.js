import Cookies from "js-cookie";

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

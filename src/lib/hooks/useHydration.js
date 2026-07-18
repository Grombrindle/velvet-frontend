import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";

/** Wait for Zustand persist rehydration before reading auth state */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(useAuthStore.getState()._hasHydrated);

  useEffect(() => {
    if (useAuthStore.getState()._hasHydrated) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  return hydrated;
}

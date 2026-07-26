import { useEffect, useEffectEvent, useRef } from "react";
import { IDLE_TIMEOUT_MS } from "../adminAuthConstants";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "pointerdown", "touchstart"];

export function useAdminInactivityTimeout({ active, onTimeout }) {
  const timerRef = useRef(null);
  const handleTimeout = useEffectEvent(() => {
    if (typeof onTimeout === "function") {
      onTimeout();
    }
  });

  useEffect(() => {
    if (!active || typeof window === "undefined") return undefined;

    const reset = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        handleTimeout();
      }, IDLE_TIMEOUT_MS);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") reset();
    };

    reset();
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, reset, { passive: true })
    );
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, reset)
      );
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [active]);
}

import { useCallback } from "react";
import { mapErrorToUserMessage } from "../utils/adminErrorMessages";

export function useAdminApiErrorHandler({
  error,
  resetShellState,
  setAdminKey,
  setPreviewMode,
  setRequiresAccessLogin,
}) {
  return useCallback(
    (err, context = "") => {
      if (err) {
        // Raw error to devtools; UI receives mapped message only.
        console.error("[admin]", context || "api error", err);
      }
      if (err?.status === 401 || err?.status === 403) {
        error("Sessionen har löpt ut eller saknar behörighet. Loggar ut...");
        resetShellState();
        return;
      }
      const rawMsg = String(err?.message || "").toLowerCase();
      if (!err?.status && rawMsg.includes("failed to fetch")) {
        setRequiresAccessLogin(true);
        setAdminKey("");
        setPreviewMode(false);
        error(
          "Inloggning via Cloudflare Access krävs. Öppna Access-login och försök igen."
        );
        return;
      }
      const userMessage = mapErrorToUserMessage(err);
      error(`${context ? context + ": " : ""}${userMessage}`);
    },
    [error, resetShellState, setAdminKey, setPreviewMode, setRequiresAccessLogin]
  );
}

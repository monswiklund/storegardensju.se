import { useCallback } from "react";

export function useAdminApiErrorHandler({
  error,
  resetShellState,
  setAdminKey,
  setPreviewMode,
  setRequiresAccessLogin,
}) {
  return useCallback(
    (err, context = "") => {
      const msg = err?.message || "Ett fel uppstod";
      if (err?.status === 401 || err?.status === 403) {
        error("Sessionen har löpt ut eller saknar behörighet. Loggar ut...");
        resetShellState();
        return;
      }
      if (!err?.status && msg.toLowerCase().includes("failed to fetch")) {
        setRequiresAccessLogin(true);
        setAdminKey("");
        setPreviewMode(false);
        error(
          "Inloggning via Cloudflare Access krävs. Öppna Access-login och försök igen."
        );
        return;
      }
      error(`${context ? context + ": " : ""}${msg}`);
    },
    [error, resetShellState, setAdminKey, setPreviewMode, setRequiresAccessLogin]
  );
}

import { useCallback, useEffect, useRef, useState } from "react";

export function useAdminClipboard({ success }) {
  const copyTimerRef = useRef(null);
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopyText = useCallback(
    async (text, field) => {
      if (!text) return;
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "absolute";
          textarea.style.left = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        setCopiedField(field);
        success("Kopierat!");
        if (copyTimerRef.current) {
          clearTimeout(copyTimerRef.current);
        }
        copyTimerRef.current = window.setTimeout(() => setCopiedField(""), 2000);
      } catch {
        setCopiedField("");
      }
    },
    [success]
  );

  return {
    copiedField,
    handleCopyText,
  };
}

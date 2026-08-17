export const PREVIEW_MESSAGE = Object.freeze({
  activeField: "storegardensju-preview-active-field",
  fieldSelected: "storegardensju-preview-field-selected",
  formData: "storegardensju-preview-form-data",
});

const CMS_ORIGIN = "https://cms.storegardensju.se";

export function isAllowedCmsOrigin(origin) {
  try {
    const url = new URL(origin);
    return (
      url.origin === CMS_ORIGIN ||
      ((url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
        (url.protocol === "http:" || url.protocol === "https:"))
    );
  } catch {
    return false;
  }
}

export function previewParentOrigin(referrer = document.referrer) {
  if (window.parent === window || !referrer) return null;
  try {
    const origin = new URL(referrer).origin;
    return isAllowedCmsOrigin(origin) ? origin : null;
  } catch {
    return null;
  }
}

export function isLivePreviewFrame() {
  return Boolean(previewParentOrigin());
}

export function isTrustedCmsMessage(event) {
  const origin = previewParentOrigin();
  return Boolean(origin && event.source === window.parent && event.origin === origin);
}

export function postToCms(message) {
  const origin = previewParentOrigin();
  if (origin) window.parent.postMessage(message, origin);
}

export function extractPreviewData(event) {
  if (!isTrustedCmsMessage(event)) return null;
  if (event.data?.type === PREVIEW_MESSAGE.formData) return event.data.data || null;
  const data = event.data?.data || event.data;
  return data && typeof data === "object" ? data : null;
}

export function previewFieldId(slug, key) {
  return `${slug}:${key}`;
}


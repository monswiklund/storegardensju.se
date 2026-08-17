import { useEffect, useRef, useState } from "react";
import { pageSlugForPath } from "../../hooks/usePageAppearance.js";
import { getPageContentSync } from "../../services/cmsService.js";
import { resolveMediaUrl } from "../../services/mediaService.js";
import {
  extractPreviewData,
  isLivePreviewFrame,
  isTrustedCmsMessage,
  postToCms,
  PREVIEW_MESSAGE,
  previewFieldId,
} from "../../services/livePreviewBridge.js";
import "./LivePreviewEditorBridge.css";

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();
const textContainer = (node) =>
  node.parentElement?.closest("h1,h2,h3,h4,h5,h6,p,li,dt,dd,a,button,label,figcaption,span");

function visibleElement(elements) {
  return elements.find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  });
}

function highlightField(field, scroll = false) {
  document.querySelectorAll(".sg-live-preview-highlight").forEach((element) =>
    element.classList.remove("sg-live-preview-highlight"),
  );
  const targets = Array.from(document.querySelectorAll("[data-cms-fields]"))
    .filter((element) => element.dataset.cmsFields?.split(" ").includes(field));
  const target = visibleElement(targets);
  if (!target) return;
  target.classList.add("sg-live-preview-highlight");
  if (scroll) target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

export function collectPreviewFields(slug, data) {
  const fields = [];
  const copy = Array.isArray(data?.copy)
    ? Object.fromEntries(data.copy.filter((row) => row?.key).map((row) => [row.key, row.value]))
    : data?.copy || {};

  for (const [key, value] of Object.entries(copy)) {
    if (normalizeText(value)) fields.push({ id: previewFieldId(slug, key), value: normalizeText(value) });
  }

  const lists = Array.isArray(data?.contentLists)
    ? data.contentLists
    : Object.entries(data?.lists || {}).map(([key, items]) => ({ key, items }));
  for (const list of lists) {
    (list?.items || []).forEach((item, index) => {
      const rowId = item?.id || index;
      for (const name of ["value", "title", "body"]) {
        const value = normalizeText(item?.[name]);
        if (value) fields.push({ id: previewFieldId(slug, `${list.key}.${rowId}.${name}`), value });
      }
    });
  }
  return fields;
}

function decorateTextFields(slug, data) {
  document.querySelectorAll("[data-cms-field-generated]").forEach((element) => {
    element.removeAttribute("data-cms-field-generated");
    element.removeAttribute("data-cms-fields");
  });

  const fields = collectPreviewFields(slug, data);
  const byValue = new Map();
  for (const field of fields) {
    const ids = byValue.get(field.value) || [];
    ids.push(field.id);
    byValue.set(field.value, ids);
  }

  for (const field of fields) {
    if (!/^(?:https?:|mailto:|tel:|\/|#)/i.test(field.value)) continue;
    const expected = new URL(field.value, window.location.href).href;
    document.querySelectorAll("a[href]").forEach((link) => {
      if (link.href !== expected) return;
      const previous = link.dataset.cmsFields?.split(" ").filter(Boolean) || [];
      link.dataset.cmsFields = [...new Set([...previous, field.id])].join(" ");
      link.dataset.cmsFieldGenerated = "true";
    });
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const value = normalizeText(walker.currentNode.nodeValue);
    if (!value) continue;
    const exact = byValue.get(value);
    const contained = exact || Array.from(byValue.entries()).find(([candidate]) =>
      candidate.length > 2 && value.includes(candidate),
    )?.[1];
    const target = contained && textContainer(walker.currentNode);
    if (!target) continue;
    const previous = target.dataset.cmsFields?.split(" ").filter(Boolean) || [];
    target.dataset.cmsFields = [...new Set([...previous, ...contained])].join(" ");
    target.dataset.cmsFieldGenerated = "true";
  }

  const slots = Array.isArray(data?.imageSlots)
    ? data.imageSlots
    : Object.entries(data?.images || {}).map(([key, image]) => ({ key, image }));
  for (const slot of slots) {
    const expected = resolveMediaUrl(slot?.image, "card") || resolveMediaUrl(slot?.image);
    if (!slot?.key || !expected) continue;
    const expectedFile = new URL(expected, window.location.href).pathname.split("/").pop();
    document.querySelectorAll("img").forEach((image) => {
      const currentFile = new URL(image.currentSrc || image.src, window.location.href).pathname.split("/").pop();
      if (currentFile === expectedFile) {
        image.dataset.cmsFields = previewFieldId(slug, slot.key);
        image.dataset.cmsFieldGenerated = "true";
      }
    });
  }

  const appearanceTargets = {
    pageTheme: document.querySelector("[data-cms-theme]"),
    heroLayout: document.querySelector("[data-cms-hero]"),
    heroOverlay: document.querySelector("[data-cms-hero-visual],[data-cms-hero]"),
    sectionSpacing: document.querySelector("main") || document.querySelector(".page-app"),
  };
  for (const [key, target] of Object.entries(appearanceTargets)) {
    if (!target) continue;
    const id = previewFieldId(slug, key);
    target.dataset.cmsFields = `${target.dataset.cmsFields || ""} ${id}`.trim();
  }
}

export default function LivePreviewEditorBridge({ pathname }) {
  const routeSlug = pageSlugForPath(pathname);
  const [data, setData] = useState(() => getPageContentSync(routeSlug));
  const slug = data?.slug || routeSlug;
  const activeFieldRef = useRef("");

  useEffect(() => {
    if (!isLivePreviewFrame()) return undefined;
    document.documentElement.dataset.cmsPreview = "true";
    setData(getPageContentSync(routeSlug));

    const handleMessage = (event) => {
      if (!isTrustedCmsMessage(event)) return;
      if (event.data?.type === PREVIEW_MESSAGE.activeField) {
        const field = String(event.data.field || "");
        if (!field || field === activeFieldRef.current) return;
        activeFieldRef.current = field;
        highlightField(field, true);
        return;
      }
      const next = extractPreviewData(event);
      if (next?.slug) setData(next);
    };

    const handleClick = (event) => {
      const target = event.target.closest?.("[data-cms-fields]");
      const field = target?.dataset.cmsFields?.split(" ").find(Boolean);
      if (!field) return;
      event.preventDefault();
      event.stopPropagation();
      postToCms({ type: PREVIEW_MESSAGE.fieldSelected, field });
    };

    window.addEventListener("message", handleMessage);
    document.addEventListener("click", handleClick, true);
    return () => {
      delete document.documentElement.dataset.cmsPreview;
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("click", handleClick, true);
    };
  }, [routeSlug]);

  useEffect(() => {
    if (!isLivePreviewFrame() || !data) return undefined;
    let frame = 0;
    const decorate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        decorateTextFields(slug, data);
        if (activeFieldRef.current) highlightField(activeFieldRef.current);
      });
    };
    decorate();
    const observer = new MutationObserver(decorate);
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [data, slug]);

  return null;
}

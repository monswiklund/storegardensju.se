import { useCallback, useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  AlertCircle,
  ChevronDown,
  Eye,
  Inbox,
  LoaderCircle,
  X,
} from "lucide-react";

/**
 * Must stay in sync with --admin-drawer-transition in AdminPage.design.css.
 * Used only as a safety net if transitionend never fires.
 */
const DRAWER_TRANSITION_MS = 320;
const DRAWER_UNMOUNT_FALLBACK_MS = DRAWER_TRANSITION_MS + 80;
const DRAWER_DIRTY_MESSAGE =
  "Du har osparade ändringar. Vill du stänga utan att spara?";
const DRAWER_PREVIEW_LABEL = "Förhandsvisning (live)";
const DRAWER_BODY_LOCK_CLASS = "admin-drawer-open";
const DRAWER_TAB_FORM = "form";
const DRAWER_TAB_PREVIEW = "preview";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function AdminToolbar({ children, className = "" }) {
  return <div className={`admin-ui-toolbar ${className}`.trim()}>{children}</div>;
}

AdminToolbar.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export function AdminActionRail({ selectionLabel, children }) {
  if (!selectionLabel) return null;
  return (
    <div className="admin-ui-action-rail" role="region" aria-label="Åtgärder för markering">
      <strong>{selectionLabel}</strong>
      <div>{children}</div>
    </div>
  );
}

AdminActionRail.propTypes = {
  selectionLabel: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function AdminState({ type = "empty", title, message, action }) {
  const Icon =
    type === "loading" ? LoaderCircle : type === "error" ? AlertCircle : Inbox;
  return (
    <div className={`admin-ui-state is-${type}`} role={type === "error" ? "alert" : "status"}>
      <Icon
        className={type === "loading" ? "spin" : ""}
        size={22}
        aria-hidden="true"
      />
      <div>
        <strong>{title}</strong>
        {message && <p>{message}</p>}
      </div>
      {action}
    </div>
  );
}

AdminState.propTypes = {
  type: PropTypes.oneOf(["empty", "loading", "error"]),
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  action: PropTypes.node,
};

export function AdminDrawer({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = "standard",
  preview,
  previewLabel = DRAWER_PREVIEW_LABEL,
  icon,
  headerActions,
  isDirty = false,
  dirtyMessage = DRAWER_DIRTY_MESSAGE,
}) {
  const closeButtonRef = useRef(null);
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const titleId = useId();
  // Kept mounted while animating out, so the exit transition can run.
  const [isMounted, setIsMounted] = useState(open);
  const [isEntered, setIsEntered] = useState(false);
  const [mobileTab, setMobileTab] = useState(DRAWER_TAB_FORM);

  const isWide = size === "wide";
  const hasPreview = isWide && Boolean(preview);

  const requestClose = useCallback(() => {
    if (isDirty && !window.confirm(dirtyMessage)) return;
    onClose();
  }, [dirtyMessage, isDirty, onClose]);

  // Read through a ref so the focus/Escape effect below does not depend on a
  // callback that changes on every keystroke (isDirty flips as the user types).
  const requestCloseRef = useRef(requestClose);
  useEffect(() => {
    requestCloseRef.current = requestClose;
  }, [requestClose]);

  // Mount/unmount around the CSS transition.
  useEffect(() => {
    if (open) {
      setIsMounted(true);
      return undefined;
    }
    if (!isMounted) return undefined;

    setIsEntered(false);
    const panel = panelRef.current;
    let timeoutId = 0;
    const finish = () => {
      window.clearTimeout(timeoutId);
      panel?.removeEventListener("transitionend", handleTransitionEnd);
      setIsMounted(false);
    };
    const handleTransitionEnd = (event) => {
      if (event.target === panel && event.propertyName === "transform") finish();
    };

    panel?.addEventListener("transitionend", handleTransitionEnd);
    timeoutId = window.setTimeout(finish, DRAWER_UNMOUNT_FALLBACK_MS);
    return () => {
      window.clearTimeout(timeoutId);
      panel?.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [isMounted, open]);

  // Trigger the enter transition one frame after mount.
  useEffect(() => {
    if (!isMounted || !open) return undefined;
    const frameId = window.requestAnimationFrame(() => setIsEntered(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [isMounted, open]);

  // Focus handling, Escape, focus trap and body scroll lock.
  useEffect(() => {
    if (!isMounted || !open) return undefined;

    restoreFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    document.body.classList.add(DRAWER_BODY_LOCK_CLASS);
    setMobileTab(DRAWER_TAB_FORM);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        requestCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter((node) => node.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove(DRAWER_BODY_LOCK_CLASS);
      restoreFocusRef.current?.focus?.();
    };
  }, [isMounted, open]);

  if (!isMounted) return null;

  const layerClasses = [
    "admin-ui-drawer-layer",
    isWide ? "is-wide" : "is-standard",
    isEntered ? "is-entered" : "is-leaving",
    hasPreview ? `is-tab-${mobileTab}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={layerClasses}>
      <button
        type="button"
        className="admin-ui-drawer-backdrop"
        onClick={requestClose}
        aria-label="Stäng panel"
      />
      <aside
        ref={panelRef}
        className="admin-ui-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header>
          <div className="admin-ui-drawer-heading">
            {icon && (
              <span className="admin-ui-drawer-icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <div>
              <h2 id={titleId}>{title}</h2>
              {description && <p>{description}</p>}
            </div>
          </div>
          <div className="admin-ui-drawer-header-actions">
            {headerActions}
            <button
              ref={closeButtonRef}
              type="button"
              className="admin-ui-icon-button"
              onClick={requestClose}
              aria-label="Stäng"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </header>

        {hasPreview && (
          <div className="admin-ui-drawer-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === DRAWER_TAB_FORM}
              className={mobileTab === DRAWER_TAB_FORM ? "is-active" : ""}
              onClick={() => setMobileTab(DRAWER_TAB_FORM)}
            >
              Formulär
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === DRAWER_TAB_PREVIEW}
              className={mobileTab === DRAWER_TAB_PREVIEW ? "is-active" : ""}
              onClick={() => setMobileTab(DRAWER_TAB_PREVIEW)}
            >
              Förhandsvisning
            </button>
          </div>
        )}

        <div className="admin-ui-drawer-body">
          <div className="admin-ui-drawer-content">{children}</div>
          {hasPreview && (
            <div className="admin-ui-drawer-preview">
              <p className="admin-ui-drawer-preview-label">
                <Eye size={15} aria-hidden="true" />
                {previewLabel}
              </p>
              <div className="admin-ui-drawer-preview-body">{preview}</div>
            </div>
          )}
        </div>

        {footer && <footer>{footer}</footer>}
      </aside>
    </div>
  );
}

AdminDrawer.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(["standard", "wide"]),
  preview: PropTypes.node,
  previewLabel: PropTypes.string,
  icon: PropTypes.node,
  headerActions: PropTypes.node,
  isDirty: PropTypes.bool,
  dirtyMessage: PropTypes.string,
};

/**
 * Collapsible form block for drawers. Children stay mounted while collapsed so
 * field state (including file inputs) survives, and `summary` keeps the value
 * readable without expanding.
 *
 * Uncontrolled by default; pass `open` + `onOpenChange` to steer it from the
 * outside, e.g. to reveal the section that failed validation.
 */
export function AdminDrawerSection({
  title,
  summary,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  tone = "default",
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const contentId = useId();
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const toggle = () => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const classes = [
    "admin-drawer-section",
    isOpen ? "is-open" : "is-collapsed",
    tone === "error" ? "has-error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      <button
        type="button"
        className="admin-drawer-section-toggle"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="admin-drawer-section-title">{title}</span>
        {summary && !isOpen && (
          <span className="admin-drawer-section-summary">{summary}</span>
        )}
        <ChevronDown
          className="admin-drawer-section-chevron"
          size={18}
          aria-hidden="true"
        />
      </button>
      <div id={contentId} className="admin-drawer-section-content">
        {children}
      </div>
    </section>
  );
}

AdminDrawerSection.propTypes = {
  title: PropTypes.string.isRequired,
  summary: PropTypes.node,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  tone: PropTypes.oneOf(["default", "error"]),
};

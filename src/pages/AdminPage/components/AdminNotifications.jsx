import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarClock,
  ExternalLink,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { AdminService } from "../../../services/adminService";
import { useToast } from "../../../contexts/ToastContext";
import { AdminDrawer, AdminDrawerSection } from "./ui/AdminUI";
import "./AdminNotifications.css";

const NOTIFICATION_FORM_ID = "admin-notification-form";

const toInputDateTime = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const createEmptyForm = () => {
  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setDate(endsAt.getDate() + 7);

  return {
    title: "",
    message: "",
    href: "",
    startsAt: toInputDateTime(now),
    endsAt: toInputDateTime(endsAt),
    status: "draft",
  };
};

const mapNotificationToForm = (notification) => ({
  title: notification.title || "",
  message: notification.message || "",
  href: notification.href || "",
  startsAt: toInputDateTime(notification.startsAt),
  endsAt: toInputDateTime(notification.endsAt),
  status: notification.status || "draft",
});

const toPayload = (form) => ({
  ...form,
  startsAt: new Date(form.startsAt).toISOString(),
  endsAt: new Date(form.endsAt).toISOString(),
});

const formatWindow = (notification) => {
  const start = new Date(notification.startsAt);
  const end = new Date(notification.endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Giltighetstid saknas";
  }
  const format = new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${format.format(start)} – ${format.format(end)}`;
};

const notificationState = (notification) => {
  const now = Date.now();
  const start = new Date(notification.startsAt).getTime();
  const end = new Date(notification.endsAt).getTime();
  if (notification.status !== "published") return "Utkast";
  if (now < start) return "Schemalagd";
  if (now >= end) return "Avslutad";
  return "Live";
};

export default function AdminNotifications({ adminKey }) {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(createEmptyForm);
  const [initialForm, setInitialForm] = useState(createEmptyForm);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selected = useMemo(
    () => notifications.find((item) => item.id === selectedId) || null,
    [notifications, selectedId],
  );
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm],
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminService.getNotifications(adminKey);
      const items = Array.isArray(data?.notifications) ? data.notifications : [];
      setNotifications(items);
      setSelectedId((current) => (
        items.some((item) => item.id === current) ? current : ""
      ));
    } catch (err) {
      error(err.message || "Kunde inte hämta notiser.");
    } finally {
      setLoading(false);
    }
  }, [adminKey, error]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const selectNotification = (notification) => {
    const nextForm = mapNotificationToForm(notification);
    setSelectedId(notification.id);
    setForm(nextForm);
    setInitialForm(nextForm);
    setIsEditorOpen(true);
  };

  const startCreating = () => {
    const nextForm = createEmptyForm();
    setSelectedId("");
    setForm(nextForm);
    setInitialForm(nextForm);
    setIsEditorOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      error("Skriv en rubrik för notisen.");
      return;
    }
    if (!form.startsAt || !form.endsAt || form.endsAt <= form.startsAt) {
      error("Sluttiden måste vara efter starttiden.");
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(form);
      if (selectedId) {
        await AdminService.updateNotification(adminKey, selectedId, payload);
        success("Notisen har uppdaterats.");
      } else {
        await AdminService.createNotification(adminKey, payload);
        success(form.status === "published" ? "Notisen är publicerad." : "Utkastet är sparat.");
      }
      await loadNotifications();
      setIsEditorOpen(false);
      setSelectedId("");
    } catch (err) {
      error(err.message || "Kunde inte spara notisen.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || !window.confirm(`Ta bort notisen “${selected.title}”?`)) return;
    setSaving(true);
    try {
      await AdminService.deleteNotification(adminKey, selected.id);
      success("Notisen har tagits bort.");
      setIsEditorOpen(false);
      setSelectedId("");
      await loadNotifications();
    } catch (err) {
      error(err.message || "Kunde inte ta bort notisen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-notifications admin-workspace">
      <div className="admin-workspace-header">
        <div>
          <p className="admin-workspace-kicker">Webbplatsens klocka</p>
          <h2>Notiser</h2>
          <p>Publicera korta, tidsstyrda nyheter för besökarna.</p>
        </div>
        <button type="button" className="admin-btn-primary" onClick={startCreating}>
          <Plus size={17} aria-hidden="true" />
          Ny notis
        </button>
      </div>

      <section className="admin-section-card admin-notifications-list">
          <div className="admin-notifications-section-heading">
            <div>
              <span>Sparade notiser</span>
              <strong>{notifications.length}</strong>
            </div>
          </div>

          {loading ? (
            <p className="admin-notifications-empty">Hämtar notiser…</p>
          ) : notifications.length === 0 ? (
            <div className="admin-notifications-empty">
              <Bell size={26} aria-hidden="true" />
              <strong>Inga notiser ännu</strong>
              <span>Klicka på “Ny notis” för att skapa den första.</span>
            </div>
          ) : (
            <div className="admin-notifications-items">
              {notifications.map((notification) => {
                const state = notificationState(notification);
                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={`admin-notification-row ${
                      selectedId === notification.id ? "is-selected" : ""
                    }`}
                    onClick={() => selectNotification(notification)}
                  >
                    <span className="admin-notification-row-icon">
                      <Bell size={17} aria-hidden="true" />
                    </span>
                    <span className="admin-notification-row-copy">
                      <strong>{notification.title}</strong>
                      <span>{formatWindow(notification)}</span>
                    </span>
                    <span className={`admin-notification-state is-${state.toLowerCase()}`}>
                      {state}
                    </span>
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
      </section>

      <AdminDrawer
        open={isEditorOpen}
        size="wide"
        title={selected ? "Redigera notis" : "Ny notis"}
        description={form.title || "Vad händer på gården?"}
        icon={<Bell size={20} />}
        isDirty={hasUnsavedChanges}
        onClose={() => setIsEditorOpen(false)}
        preview={
          <div className="admin-notification-preview">
            <span className="admin-notification-row-icon">
              <Bell size={17} aria-hidden="true" />
            </span>
            <span>
              <small>Så visas notisen</small>
              <strong>{form.title || "Notisens rubrik"}</strong>
              <span>{form.message || "Kort information visas här."}</span>
            </span>
          </div>
        }
        footer={
          <>
            <button
              type="submit"
              form={NOTIFICATION_FORM_ID}
              className="admin-btn-primary"
              disabled={saving || !hasUnsavedChanges}
            >
              <Save size={17} aria-hidden="true" />
              {saving
                ? "Sparar…"
                : form.status === "published"
                  ? "Spara och publicera"
                  : "Spara utkast"}
            </button>
            {selected && (
              <button
                type="button"
                className="admin-btn-danger"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 size={17} aria-hidden="true" />
                Ta bort
              </button>
            )}
          </>
        }
      >
        <form
          id={NOTIFICATION_FORM_ID}
          className="admin-drawer-form admin-notifications-form"
          onSubmit={handleSubmit}
        >
          <AdminDrawerSection
            title="Innehåll"
            summary={form.title || "Ingen rubrik"}
            defaultOpen
          >
            <label className="admin-field">
              <span className="admin-field-label">Rubrik</span>
              <input
                className="admin-input"
                value={form.title}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))}
                maxLength={120}
                placeholder="Lina håller yoga på loftet"
                required
              />
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Kort information</span>
              <textarea
                className="admin-input admin-textarea"
                value={form.message}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))}
                maxLength={240}
                rows={3}
                placeholder="Torsdag 30 juli kl. 18:00"
              />
              <span className="admin-notification-character-count">
                {form.message.length}/240
              </span>
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Länk</span>
              <span className="admin-notification-input-with-icon">
                <ExternalLink size={16} aria-hidden="true" />
                <input
                  className="admin-input"
                  value={form.href}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    href: event.target.value,
                  }))}
                  placeholder="/kurser/yoga/"
                />
              </span>
            </label>
          </AdminDrawerSection>

          <AdminDrawerSection
            title="Tid & publicering"
            summary={form.status === "published" ? "Publicerad" : "Utkast"}
            defaultOpen
          >
            <div className="admin-notification-time-grid">
              <label className="admin-field">
                <span className="admin-field-label">Visas från</span>
                <span className="admin-notification-input-with-icon">
                  <CalendarClock size={16} aria-hidden="true" />
                  <input
                    className="admin-input"
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      startsAt: event.target.value,
                    }))}
                    required
                  />
                </span>
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Visas till</span>
                <span className="admin-notification-input-with-icon">
                  <CalendarClock size={16} aria-hidden="true" />
                  <input
                    className="admin-input"
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      endsAt: event.target.value,
                    }))}
                    required
                  />
                </span>
              </label>
            </div>

            <label className="admin-field">
              <span className="admin-field-label">Status</span>
              <select
                className="admin-select"
                value={form.status}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))}
              >
                <option value="draft">Utkast</option>
                <option value="published">Publicerad</option>
              </select>
            </label>
          </AdminDrawerSection>
        </form>
      </AdminDrawer>
    </div>
  );
}

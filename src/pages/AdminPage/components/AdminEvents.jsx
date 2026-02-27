import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AdminService } from "../../../services/adminService";
import { useToast } from "../../../contexts/ToastContext";

const EVENT_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Publicerad" },
];

const BUCKET_OVERRIDE_OPTIONS = [
  { value: "none", label: "Automatisk" },
  { value: "upcoming", label: "Tvinga kommande" },
  { value: "past", label: "Tvinga tidigare" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "Alla" },
  { value: "upcoming", label: "Kommande" },
  { value: "past", label: "Tidigare" },
  { value: "published", label: "Publicerade" },
  { value: "draft", label: "Draft" },
];

const emptyEventForm = () => ({
  title: "",
  description: "",
  location: "",
  artists: "",
  spots: "",
  startAt: "",
  endAt: "",
  status: "draft",
  bucketOverride: "none",
  sortOrder: "",
  links: [],
  images: [],
});

const toLocalDateTimeInput = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = String(date.getFullYear()).padStart(4, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const mapEventToForm = (item) => ({
  title: item.title || "",
  description: item.description || "",
  location: item.location || "",
  artists: item.artists || "",
  spots: item.spots || "",
  startAt: toLocalDateTimeInput(item.startAt),
  endAt: toLocalDateTimeInput(item.endAt),
  status: item.status || "draft",
  bucketOverride: item.bucketOverride || "none",
  sortOrder: item.sortOrder != null ? String(item.sortOrder) : "",
  links: Array.isArray(item.links) ? item.links : [],
  images: Array.isArray(item.images) ? item.images : [],
});

function AdminEvents({ adminKey }) {
  const { success, error } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(emptyEventForm());

  const loadEvents = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const data = await AdminService.getEvents(adminKey);
      const fetched = Array.isArray(data?.events) ? data.events : [];
      setEvents(fetched);
      setSelectedId((prev) => {
        if (prev && fetched.some((item) => item.id === prev)) return prev;
        return fetched[0]?.id || "";
      });
    } catch (err) {
      error(err?.message || "Kunde inte hämta events.");
    } finally {
      setLoading(false);
    }
  }, [adminKey, error]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    const selected = events.find((item) => item.id === selectedId);
    if (!selected) return;
    setForm(mapEventToForm(selected));
  }, [events, selectedId]);

  const filteredEvents = useMemo(() => {
    return events.filter((item) => {
      if (filter === "all") return true;
      if (filter === "upcoming" || filter === "past") {
        return item.computedBucket === filter;
      }
      return item.status === filter;
    });
  }, [events, filter]);

  const handleCreateNew = () => {
    setSelectedId("");
    setForm(emptyEventForm());
  };

  const handleSelect = (item) => {
    setSelectedId(item.id);
    setForm(mapEventToForm(item));
  };

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (index, field, value) => {
    setForm((prev) => {
      const links = [...prev.links];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, links };
    });
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [...prev.links, { href: "", label: "" }],
    }));
  };

  const removeLink = (index) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter((_, idx) => idx !== index),
    }));
  };

  const handleImageChange = (index, field, value) => {
    setForm((prev) => {
      const images = [...prev.images];
      images[index] = { ...images[index], [field]: value };
      return { ...prev, images };
    });
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const buildPayload = () => {
    const links = form.links
      .map((link) => ({
        href: String(link?.href || "").trim(),
        label: String(link?.label || "").trim(),
      }))
      .filter((link) => link.href);

    const images = form.images
      .map((image, idx) => ({
        id: image?.id || `img-${Date.now()}-${idx}`,
        storageKey: String(image?.storageKey || "").trim(),
        url: String(image?.url || "").trim(),
        alt: String(image?.alt || "").trim(),
        order: Number(image?.order || (idx + 1) * 10),
        createdAt: Number(image?.createdAt || Math.floor(Date.now() / 1000)),
      }))
      .filter((image) => image.url);

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      artists: form.artists.trim(),
      spots: form.spots.trim(),
      startAt: form.startAt,
      endAt: form.endAt,
      status: form.status,
      bucketOverride: form.bucketOverride,
      sortOrder: Number(form.sortOrder || 0),
      links,
      images,
    };
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (selectedId) {
        await AdminService.updateEvent(adminKey, selectedId, payload);
        success("Event uppdaterat.");
      } else {
        const created = await AdminService.createEvent(adminKey, payload);
        success("Event skapat.");
        setSelectedId(created?.id || "");
      }
      await loadEvents();
    } catch (err) {
      error(err?.message || "Kunde inte spara event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm("Är du säker på att du vill ta bort eventet?")) return;

    setSaving(true);
    try {
      await AdminService.deleteEvent(adminKey, selectedId);
      success("Event borttaget.");
      setSelectedId("");
      setForm(emptyEventForm());
      await loadEvents();
    } catch (err) {
      error(err?.message || "Kunde inte ta bort event.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedImages = [];
      for (const [idx, file] of files.entries()) {
        const uploadInfo = await AdminService.createEventUpload(adminKey, file);

        uploadedImages.push({
          id: `img-${Date.now()}-${idx}`,
          storageKey: uploadInfo?.storageKey || "",
          url: uploadInfo?.publicUrl || "",
          alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
          order: (form.images.length + uploadedImages.length + 1) * 10,
          createdAt: Math.floor(Date.now() / 1000),
        });
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
      success("Bilder uppladdade och optimerade. Spara eventet för att publicera ändringarna.");
    } catch (err) {
      error(err?.message || "Kunde inte ladda upp bilder.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="admin-events-manager">
      <div className="admin-panel admin-events-list-panel">
        <div className="admin-panel-header">
          <div>
            <h3>Events</h3>
            <p>Hantera kommande och tidigare evenemang.</p>
          </div>
          <div className="admin-panel-actions">
            <button
              type="button"
              className="admin-btn-primary"
              onClick={handleCreateNew}
            >
              + Nytt event
            </button>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={loadEvents}
              disabled={loading}
            >
              Uppdatera
            </button>
          </div>
        </div>

        <label className="admin-field">
          <span className="admin-field-label">Filter</span>
          <select
            className="admin-select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-events-manager-list">
          {filteredEvents.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-events-manager-list-item ${
                item.id === selectedId ? "active" : ""
              }`}
              onClick={() => handleSelect(item)}
            >
              <div>
                <strong>{item.title}</strong>
                <p>
                  {item.status} • {item.computedBucket}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form className="admin-panel admin-events-form-panel" onSubmit={handleSave}>
        <div className="admin-panel-header">
          <div>
            <h3>{selectedId ? "Redigera event" : "Skapa event"}</h3>
            <p>
              {selectedId
                ? "Uppdatera metadata, publicering, länkar och bilder."
                : "Skapa ett nytt event i draft och publicera när det är klart."}
            </p>
          </div>
          <div className="admin-panel-actions">
            {selectedId && (
              <button
                type="button"
                className="admin-btn-danger"
                onClick={handleDelete}
                disabled={saving}
              >
                Ta bort
              </button>
            )}
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? "Sparar..." : "Spara"}
            </button>
          </div>
        </div>

        <div className="admin-events-manager-grid">
          <label className="admin-field">
            <span className="admin-field-label">Titel</span>
            <input
              className="admin-input"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              required
            />
          </label>

          <label className="admin-field">
            <span className="admin-field-label">Plats</span>
            <input
              className="admin-input"
              value={form.location}
              onChange={(event) => setField("location", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span className="admin-field-label">Start</span>
            <input
              type="datetime-local"
              className="admin-input"
              value={form.startAt}
              onChange={(event) => setField("startAt", event.target.value)}
              required
            />
          </label>

          <label className="admin-field">
            <span className="admin-field-label">Slut</span>
            <input
              type="datetime-local"
              className="admin-input"
              value={form.endAt}
              onChange={(event) => setField("endAt", event.target.value)}
              required
            />
          </label>

          <label className="admin-field">
            <span className="admin-field-label">Status</span>
            <select
              className="admin-select"
              value={form.status}
              onChange={(event) => setField("status", event.target.value)}
            >
              {EVENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field-label">Bucket override</span>
            <select
              className="admin-select"
              value={form.bucketOverride}
              onChange={(event) => setField("bucketOverride", event.target.value)}
            >
              {BUCKET_OVERRIDE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field-label">Sortering</span>
            <input
              type="number"
              className="admin-input"
              value={form.sortOrder}
              onChange={(event) => setField("sortOrder", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span className="admin-field-label">Gäster/Konstnärer</span>
            <input
              className="admin-input"
              value={form.artists}
              onChange={(event) => setField("artists", event.target.value)}
            />
          </label>

          <label className="admin-field admin-field--full">
            <span className="admin-field-label">Beskrivning</span>
            <textarea
              className="admin-input"
              rows={4}
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </label>

          <label className="admin-field admin-field--full">
            <span className="admin-field-label">Badge/platser</span>
            <input
              className="admin-input"
              value={form.spots}
              onChange={(event) => setField("spots", event.target.value)}
            />
          </label>
        </div>

        <div className="admin-events-manager-subsection">
          <div className="admin-events-manager-subsection-header">
            <h4>Länkar</h4>
            <button type="button" className="admin-btn-secondary" onClick={addLink}>
              + Lägg till länk
            </button>
          </div>
          {form.links.map((link, index) => (
            <div key={`link-${index}`} className="admin-events-manager-inline-row">
              <input
                className="admin-input"
                placeholder="https://..."
                value={link.href || ""}
                onChange={(event) =>
                  handleLinkChange(index, "href", event.target.value)
                }
              />
              <input
                className="admin-input"
                placeholder="Länktext"
                value={link.label || ""}
                onChange={(event) =>
                  handleLinkChange(index, "label", event.target.value)
                }
              />
              <button
                type="button"
                className="admin-btn-danger"
                onClick={() => removeLink(index)}
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>

        <div className="admin-events-manager-subsection">
          <div className="admin-events-manager-subsection-header">
            <h4>Bilder</h4>
            <label className="admin-btn-secondary admin-events-manager-upload-btn">
              {uploading ? "Laddar upp..." : "Ladda upp bild"}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleUploadImages}
                disabled={uploading}
                hidden
              />
            </label>
          </div>
          <p className="admin-muted">
            Bilder optimeras automatiskt till WebP (max 800x1063).
          </p>

          {form.images.map((image, index) => (
            <div key={image.id || `img-${index}`} className="admin-events-manager-image-row">
              <img src={image.url} alt={image.alt || ""} />
              <div className="admin-events-manager-image-fields">
                <input
                  className="admin-input"
                  value={image.url || ""}
                  onChange={(event) =>
                    handleImageChange(index, "url", event.target.value)
                  }
                />
                <input
                  className="admin-input"
                  placeholder="Alt-text"
                  value={image.alt || ""}
                  onChange={(event) =>
                    handleImageChange(index, "alt", event.target.value)
                  }
                />
                <input
                  type="number"
                  className="admin-input"
                  placeholder="Ordning"
                  value={image.order || ""}
                  onChange={(event) =>
                    handleImageChange(index, "order", event.target.value)
                  }
                />
              </div>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={() => removeImage(index)}
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}

AdminEvents.propTypes = {
  adminKey: PropTypes.string,
};

AdminEvents.defaultProps = {
  adminKey: "",
};

export default AdminEvents;

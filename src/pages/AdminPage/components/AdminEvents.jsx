import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  CalendarDays,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { AdminService } from "../../../services/adminService";
import { useToast } from "../../../contexts/ToastContext";
import { MAX_UPLOAD_BYTES } from "../adminConstants";
import PastEventDetail, {
  PAST_EVENT_VARIANT_PREVIEW,
} from "../../../features/home/UpcomingEvents/components/PastEventDetail";
import { AdminDrawer, AdminDrawerSection, AdminState } from "./ui/AdminUI";

const EVENT_FORM_ID = "admin-event-form";

const EVENT_STATUS_OPTIONS = [
  { value: "draft", label: "Utkast" },
  { value: "published", label: "Publicerad" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "Alla" },
  { value: "upcoming", label: "Kommande" },
  { value: "past", label: "Tidigare" },
  { value: "published", label: "Publicerade" },
  { value: "draft", label: "Utkast" },
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
  links: [],
  images: [],
});

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const formatted = date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [day, month, year] = formatted.split(" ");
  if (!day || !month || !year) return formatted;
  return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

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

const getStatusLabel = (status) =>
  EVENT_STATUS_OPTIONS.find((option) => option.value === status)?.label || "Utkast";

const getBucketLabel = (bucket) => (bucket === "upcoming" ? "Kommande" : "Tidigare");

const normalizeComparableForm = (value) => ({
  ...value,
  links: (value.links || []).map((link) => ({
    href: String(link?.href || ""),
    label: String(link?.label || ""),
  })),
  images: (value.images || []).map((image) => ({
    id: image?.id || "",
    uploadId: image?.uploadId || "",
    storageKey: image?.storageKey || "",
    url: image?.url || "",
    alt: image?.alt || "",
    order: image?.order ?? "",
    createdAt: image?.createdAt || "",
  })),
});

const mapEventToForm = (item) => ({
  title: item.title || "",
  description: item.description || "",
  location: item.location || "",
  artists: item.artists || "",
  spots: item.spots || "",
  startAt: toLocalDateTimeInput(item.startAt),
  endAt: toLocalDateTimeInput(item.endAt),
  status: item.status || "draft",
  links: Array.isArray(item.links) ? item.links : [],
  images: Array.isArray(item.images) ? item.images : [],
});

function AdminEvents({ adminKey = "" }) {
  const { success, error } = useToast();
  const [events, setEvents] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyEventForm());
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const selectedEvent = useMemo(
    () => events.find((item) => item.id === selectedId) || null,
    [events, selectedId]
  );

  const hasUnsavedChanges = useMemo(() => {
    const baseline = selectedEvent ? mapEventToForm(selectedEvent) : emptyEventForm();
    return (
      JSON.stringify(normalizeComparableForm(form)) !==
      JSON.stringify(normalizeComparableForm(baseline))
    );
  }, [form, selectedEvent]);

  const previewEvent = useMemo(() => {
    const startAt = form.startAt || "";
    const endAt = form.endAt || "";
    const date = formatDate(startAt);
    const startTime = formatTime(startAt);
    const endTime = formatTime(endAt);

    const mappedImages = (form.images || []).map(img => ({
      ...img,
      src: img.url || img.src || ""
    }));

    return {
      title: form.title || "Titel saknas",
      spots: form.spots || "",
      date,
      time: startTime && endTime ? `${startTime} - ${endTime}` : "",
      description: form.description || "Ingen beskrivning angiven.",
      artists: form.artists || "",
      location: form.location || "",
      links: form.links || [],
      image: mappedImages.length > 0 ? mappedImages[0] : null,
      images: mappedImages,
    };
  }, [form]);

  // Collapsed-section summaries: the value must be readable without opening the
  // section, otherwise collapsing just hides information.
  const timeSummary = useMemo(() => {
    const date = formatDate(form.startAt);
    const status = getStatusLabel(form.status);
    if (!date) return `Ingen tid · ${status}`;
    const startTime = formatTime(form.startAt);
    const endTime = formatTime(form.endAt);
    const span = startTime && endTime ? `${startTime}-${endTime}` : startTime;
    return `${date}${span ? ` ${span}` : ""} · ${status}`;
  }, [form.startAt, form.endAt, form.status]);

  const linkSummary = form.links.length
    ? `${form.links.length} ${form.links.length === 1 ? "länk" : "länkar"}`
    : "Inga länkar";

  const imageSummary = form.images.length
    ? `${form.images.length} ${form.images.length === 1 ? "bild" : "bilder"}`
    : "Ingen bild";

  const loadEvents = useCallback(async () => {
    if (!adminKey) return;
    setListLoading(true);
    setListError("");
    try {
      const data = await AdminService.getEvents(adminKey);
      const fetched = Array.isArray(data?.events) ? data.events : [];
      setEvents(fetched);
      setSelectedId((prev) => {
        if (prev && fetched.some((item) => item.id === prev)) return prev;
        return fetched[0]?.id || "";
      });
    } catch (err) {
      const message = err?.message || "Kunde inte hämta evenemang.";
      setListError(message);
      error(message);
    } finally {
      setListLoading(false);
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
    const query = searchQuery.trim().toLowerCase();
    return events
      .filter((item) => {
        if (filter === "all") return true;
        if (filter === "upcoming" || filter === "past") {
          return item.computedBucket === filter;
        }
        return item.status === filter;
      })
      .filter((item) => {
        if (!query) return true;
        return [item.title, item.location, item.artists]
          .some((value) => String(value || "").toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const dateA = new Date(a.startAt || 0).getTime();
        const dateB = new Date(b.startAt || 0).getTime();
        return dateB - dateA; // Senaste datumet först
      });
  }, [events, filter, searchQuery]);

  const canLeaveEditor = () => {
    if (!hasUnsavedChanges) return true;
    return window.confirm("Du har osparade ändringar. Vill du fortsätta utan att spara?");
  };

  const handleCreateNew = () => {
    if (!canLeaveEditor()) return;
    setSelectedId("");
    setForm(emptyEventForm());
    setIsEditorOpen(true);
  };

  const handleSelect = (item) => {
    if (item.id === selectedId) {
      setIsEditorOpen(true);
      return;
    }
    if (!canLeaveEditor()) return;
    setSelectedId(item.id);
    setForm(mapEventToForm(item));
    setIsEditorOpen(true);
  };

  // The drawer's isDirty guard handles the unsaved-changes confirmation.
  const handleCloseEditor = () => setIsEditorOpen(false);

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
      .map((image, idx) => {
        const fallbackOrder = (idx + 1) * 10;
        const rawOrder = image?.order;
        const order =
          rawOrder === "" || rawOrder === null || rawOrder === undefined
            ? fallbackOrder
            : Number(rawOrder);

        return {
          id: image?.id || `img-${Date.now()}-${idx}`,
          uploadId: String(image?.uploadId || "").trim(),
          storageKey: String(image?.storageKey || "").trim(),
          url: String(image?.url || "").trim(),
          alt: String(image?.alt || "").trim(),
          order,
          createdAt: Number(image?.createdAt || Math.floor(Date.now() / 1000)),
        };
      })
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
      links,
      images,
    };
  };

  const handleSave = async (event) => {
    if (event) event.preventDefault();
    if (saving || uploading || !hasUnsavedChanges) return;

    // Validated here rather than with `required`, since fields can sit inside a
    // collapsed drawer section where the browser cannot focus them.
    if (!form.title.trim()) {
      error("Ange en titel för evenemanget.");
      return;
    }
    if (!form.startAt || !form.endAt) {
      error("Ange både start- och sluttid.");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (selectedId) {
        await AdminService.updateEvent(adminKey, selectedId, payload);
        success("Evenemang uppdaterat.");
      } else {
        const created = await AdminService.createEvent(adminKey, payload);
        success("Evenemang skapat.");
        setSelectedId(created?.id || "");
      }
      await loadEvents();
    } catch (err) {
      error(err?.message || "Kunde inte spara evenemang.");
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
      success("Evenemang borttaget.");
      setSelectedId("");
      setForm(emptyEventForm());
      // Reset the form before closing so the isDirty guard does not prompt.
      setIsEditorOpen(false);
      await loadEvents();
    } catch (err) {
      error(err?.message || "Kunde inte ta bort evenemang.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      if (!file.size) {
        error(`${file.name}: filen är tom.`);
        return false;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        const maxMb = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
        error(`${file.name}: filen är för stor (max ${maxMb} MB).`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) {
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const uploadedImages = [];
      for (const [idx, file] of validFiles.entries()) {
        const uploadInfo = await AdminService.createEventUpload(adminKey, file);

        uploadedImages.push({
          id: `img-${Date.now()}-${idx}`,
          uploadId: uploadInfo?.uploadId || "",
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
      <aside className="admin-events-list-panel" aria-label="Evenemangslista">
        <div className="admin-events-list-header">
          <div>
            <p className="admin-events-eyebrow">Innehåll</p>
            <h3>Evenemangslista</h3>
            <span>{events.length} sparade</span>
          </div>
          <button
            type="button"
            className="admin-events-new-btn"
            onClick={handleCreateNew}
          >
            <Plus size={16} />
            + Nytt
          </button>
        </div>

        <div className="admin-events-list-tools">
          <label className="admin-events-search">
            <Search size={16} />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Sök evenemang"
            />
          </label>
          <select
            className="admin-select admin-select-sm"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filtrera evenemang"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-events-manager-list">
          {listLoading ? (
            <AdminState
              type="loading"
              title="Laddar evenemang"
              message="Hämtar publicerade evenemang och utkast."
            />
          ) : listError ? (
            <AdminState
              type="error"
              title="Evenemangen kunde inte hämtas"
              message={listError}
              action={
                <button type="button" className="admin-btn-secondary" onClick={loadEvents}>
                  Försök igen
                </button>
              }
            />
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((item) => {
              const date = formatDate(item.startAt);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-events-manager-list-item ${
                    item.id === selectedId ? "active" : ""
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  <span className="admin-events-card-date">{date || "Datum saknas"}</span>
                  <strong>{item.title}</strong>
                  {item.location && <span className="admin-events-card-location">{item.location}</span>}
                  <div className="admin-events-card-badges">
                    <span className={`admin-events-status admin-events-status--${item.status === "published" ? "published" : "draft"}`}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span className={`admin-events-status admin-events-status--${item.computedBucket === "upcoming" ? "upcoming" : "past"}`}>
                      {getBucketLabel(item.computedBucket)}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="admin-events-empty-list">
              <CalendarDays size={24} />
              <strong>Inga evenemang hittades</strong>
              <span>Justera filtret eller skapa ett nytt evenemang.</span>
            </div>
          )}
        </div>
      </aside>

      <AdminDrawer
        open={isEditorOpen}
        size="wide"
        title={selectedId ? "Redigera evenemang" : "Nytt evenemang"}
        description={form.title || "Namnlöst evenemang"}
        icon={<CalendarDays size={20} />}
        isDirty={hasUnsavedChanges}
        onClose={handleCloseEditor}
        preview={
          <PastEventDetail
            event={previewEvent}
            variant={PAST_EVENT_VARIANT_PREVIEW}
            titleId="admin-event-preview-title"
          />
        }
        footer={
          <>
            <button
              type="submit"
              form={EVENT_FORM_ID}
              className="admin-btn-primary"
              disabled={saving || uploading || !hasUnsavedChanges}
            >
              <Save size={16} />
              {saving ? "Sparar..." : uploading ? "Vänta på bilder..." : "Spara händelse"}
            </button>
            {selectedId && (
              <button
                type="button"
                className="admin-btn-danger"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 size={16} />
                Ta bort
              </button>
            )}
          </>
        }
      >
        <form id={EVENT_FORM_ID} className="admin-drawer-form" onSubmit={handleSave}>
          <AdminDrawerSection
            title="Grundinformation"
            summary={form.location || "Ingen plats"}
            defaultOpen
          >
            <label className="admin-field">
              <span className="admin-field-label">Titel</span>
              <input
                className="admin-input"
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
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
              <span className="admin-field-label">Beskrivning</span>
              <textarea
                className="admin-input admin-textarea"
                rows={4}
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
              />
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Badge</span>
              <input
                className="admin-input"
                value={form.spots}
                onChange={(event) => setField("spots", event.target.value)}
                placeholder="Ex. Fri entré"
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
          </AdminDrawerSection>

          <AdminDrawerSection title="Tid & status" summary={timeSummary} defaultOpen>
            <div className="admin-events-time-grid">
              <label className="admin-field">
                <span className="admin-field-label">Start</span>
                <input
                  type="datetime-local"
                  className="admin-input"
                  value={form.startAt}
                  onChange={(event) => setField("startAt", event.target.value)}
                />
              </label>

              <label className="admin-field">
                <span className="admin-field-label">Slut</span>
                <input
                  type="datetime-local"
                  className="admin-input"
                  value={form.endAt}
                  onChange={(event) => setField("endAt", event.target.value)}
                />
              </label>
            </div>

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
          </AdminDrawerSection>

          <AdminDrawerSection title="Länkar" summary={linkSummary}>
            <div className="admin-events-link-list">
              {form.links.length > 0 ? form.links.map((link, index) => (
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
                    className="admin-events-danger-icon"
                    onClick={() => removeLink(index)}
                    aria-label="Ta bort länk"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )) : (
                <div className="admin-events-soft-empty">Inga länkar tillagda.</div>
              )}
            </div>
            {/* Placed in the body, not the section heading: the heading is itself a
                button and buttons cannot nest. */}
            <button type="button" className="admin-btn-secondary admin-btn-sm" onClick={addLink}>
              <Plus size={15} />
              Lägg till länk
            </button>
          </AdminDrawerSection>

          <AdminDrawerSection title="Bilder" summary={imageSummary}>
            <div className="admin-events-image-list">
              {form.images.length > 0 ? form.images.map((image, index) => (
                <div key={image.id || `img-${index}`} className="admin-events-manager-image-row">
                  <img src={image.url} alt={image.alt || ""} />
                  <div className="admin-events-manager-image-fields">
                    <input
                      className="admin-input"
                      placeholder="Beskrivande text"
                      value={image.alt || ""}
                      onChange={(event) =>
                        handleImageChange(index, "alt", event.target.value)
                      }
                    />
                    <details className="admin-events-advanced-image">
                      <summary>Avancerat</summary>
                      <div className="admin-events-image-advanced-grid">
                        <input
                          type="number"
                          className="admin-input"
                          placeholder="Ordning"
                          value={image.order ?? ""}
                          onChange={(event) =>
                            handleImageChange(index, "order", event.target.value)
                          }
                        />
                        <span>{image.url.split('/').pop()}</span>
                      </div>
                    </details>
                  </div>
                  <button
                    type="button"
                    className="admin-events-danger-icon"
                    onClick={() => removeImage(index)}
                    aria-label="Ta bort bild"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )) : (
                <div className="admin-events-soft-empty">Ingen bild uppladdad.</div>
              )}
            </div>
            <label className="admin-btn-secondary admin-btn-sm admin-events-manager-upload-btn">
              <Upload size={15} />
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
            <p className="admin-events-section-hint">
              Optimeras automatiskt till WebP, max 800x1063.
            </p>
          </AdminDrawerSection>
        </form>
      </AdminDrawer>
    </div>
  );
}

AdminEvents.propTypes = {
  adminKey: PropTypes.string,
};

export default AdminEvents;

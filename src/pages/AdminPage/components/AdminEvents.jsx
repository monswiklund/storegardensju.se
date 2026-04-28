import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Image as ImageIcon,
  Link as LinkIcon,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { AdminService } from "../../../services/adminService";
import { useToast } from "../../../contexts/ToastContext";
import { MAX_UPLOAD_BYTES } from "../adminConstants";
import EventCard from "../../../features/home/UpcomingEvents/components/EventCard";

const EVENT_STATUS_OPTIONS = [
  { value: "draft", label: "Utkast" },
  { value: "published", label: "Publicerad" },
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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyEventForm());
  const [formView, setFormView] = useState("edit"); // "edit" or "preview"
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);

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

  const loadEvents = useCallback(async () => {
    if (!adminKey) return;
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
    setFormView("edit");
    setIsMobileEditorOpen(true);
  };

  const handleSelect = (item) => {
    if (item.id === selectedId) {
      setIsMobileEditorOpen(true);
      return;
    }
    if (!canLeaveEditor()) return;
    setSelectedId(item.id);
    setForm(mapEventToForm(item));
    setFormView("edit");
    setIsMobileEditorOpen(true);
  };

  const handleCloseEditor = () => {
    if (!canLeaveEditor()) return;
    setIsMobileEditorOpen(false);
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
    <div className={`admin-events-manager ${isMobileEditorOpen ? "admin-events-manager--editor-open" : ""}`}>
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
          {filteredEvents.length > 0 ? (
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

      <section className="admin-events-editor-panel" aria-label="Redigera evenemang">
        <div className="admin-events-editor-shell">
          <div className="admin-events-editor-bar">
            <button
              type="button"
              className="admin-events-back-btn"
              onClick={handleCloseEditor}
            >
              <ArrowLeft size={16} />
              Lista
            </button>
            <div className="admin-events-editor-title">
              <span>{selectedId ? "Redigerar" : "Nytt evenemang"}</span>
              <strong>{form.title || "Namnlöst evenemang"}</strong>
            </div>
            <div className="admin-events-editor-actions">
              <button
                type="button"
                className={`admin-events-view-toggle ${formView === 'edit' ? 'active' : ''}`}
                onClick={() => setFormView('edit')}
              >
                <Pencil size={15} />
                Redigera
              </button>
              <button
                type="button"
                className={`admin-events-view-toggle ${formView === 'preview' ? 'active' : ''}`}
                onClick={() => setFormView('preview')}
              >
                <Eye size={15} />
                Förhandsgranska
              </button>
              <button
                type="button"
                className="admin-events-save-btn"
                onClick={handleSave}
                disabled={saving || uploading || !hasUnsavedChanges}
              >
                <Save size={16} />
                {saving ? "Sparar..." : uploading ? "Vänta på bilder..." : "Spara händelse"}
              </button>
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="admin-events-dirty-state">Osparade ändringar</div>
          )}

          {formView === 'edit' ? (
            <form className="admin-events-editor-content" onSubmit={handleSave}>
              <section className="admin-events-section-card">
                <div className="admin-events-section-heading">
                  <Pencil size={18} />
                  <div>
                    <h4>Grundinformation</h4>
                    <p>Det som syns först på evenemangskortet.</p>
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

                  <label className="admin-field admin-field--full">
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
                </div>
              </section>

              <section className="admin-events-section-card">
                <div className="admin-events-section-heading">
                  <CalendarDays size={18} />
                  <div>
                    <h4>Tid & status</h4>
                    <p>Styr om evenemanget listas som kommande eller tidigare.</p>
                  </div>
                </div>
                <div className="admin-events-manager-grid admin-events-time-grid">
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

                  <label className="admin-field admin-field--full">
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
                </div>
              </section>

              <section className="admin-events-section-card">
                <div className="admin-events-section-heading admin-events-section-heading--with-action">
                  <div className="admin-events-section-title-row">
                    <LinkIcon size={18} />
                    <div>
                      <h4>Länkar</h4>
                      <p>Knappar som visas på evenemangskortet.</p>
                    </div>
                  </div>
                  <button type="button" className="admin-btn-secondary admin-btn-sm" onClick={addLink}>
                    <Plus size={15} />
                    Lägg till länk
                  </button>
                </div>
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
              </section>

              <section className="admin-events-section-card">
                <div className="admin-events-section-heading admin-events-section-heading--with-action">
                  <div className="admin-events-section-title-row">
                    <ImageIcon size={18} />
                    <div>
                      <h4>Bilder</h4>
                      <p>Optimeras automatiskt till WebP, max 800x1063.</p>
                    </div>
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
                </div>

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
              </section>

              {selectedId && (
                <section className="admin-events-delete-zone">
                  <div>
                    <strong>Ta bort evenemang</strong>
                    <span>Det här går inte att ångra.</span>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-danger"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    <Trash2 size={16} />
                    Ta bort
                  </button>
                </section>
              )}
            </form>
          ) : (
            <div className="admin-events-preview-container">
              <EventCard event={previewEvent} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

AdminEvents.propTypes = {
  adminKey: PropTypes.string,
};

export default AdminEvents;

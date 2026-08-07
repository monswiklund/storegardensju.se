import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  CalendarDays,
  Clock3,
  GripVertical,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { AdminService } from "../../../services/adminService";
import { useToast } from "../../../contexts/ToastContext";
import { MAX_UPLOAD_BYTES } from "../adminConstants";
import { AdminDrawer, AdminDrawerSection, AdminState } from "./ui/AdminUI";
import { optimizeImageForWeb } from "../../../utils/imageOptimizer";

const YOGA_FORM_ID = "admin-yoga-form";

const emptyYogaForm = () => ({
  title: "Yoga på loftet",
  instructor: "Lina Wiklund",
  description: "Välkommen på ett 90 minuters yogapass med guidning och skön vila i den fridfulla miljö på loftet på Storegården 7.",
  location: "Storegården 7, Rackeby (Lidköping)",
  eventDate: "2026-07-30",
  startTime: "18:00",
  arrivalTime: "17:30",
  matInfo: "Yogamattor finns på plats. Har du en egen matta får du självklart gärna ta med den!",
  contactEmail: "bylinawiklund@gmail.com",
  status: "published",
  image: "/images/evenemang/lina-yoga-header.jpg",
});

const DEFAULT_YOGA_EVENTS = [
  {
    id: "yoga-pa-loftet-2026-07-30",
    title: "Yoga på loftet",
    description: "Välkommen på ett 90 minuters yogapass med guidning och skön vila i den fridfulla miljö på loftet på Storegården 7. Du är välkommen från 17:30 för att landa och förbereda dig.",
    location: "Storegården 7, Rackeby (Lidköping)",
    artists: "Lina Wiklund",
    startAt: "2026-07-30T18:00:00+02:00",
    endAt: "2026-07-30T19:30:00+02:00",
    status: "published",
    category: "yoga",
    images: [
      {
        url: "/images/evenemang/lina-yoga-header.jpg",
        alt: "Yoga på loftet event med Lina Wiklund"
      }
    ]
  },
  {
    id: "yoga-maleri-tidigare-kursdag",
    title: "Yoga & måleri på Storegården 7",
    description: "En sommardag med lugn yoga, skapande och tid tillsammans på Storegården 7. Lugn yoga på loftet följt av skapande i ateljén.",
    location: "Storegården 7, Rackeby",
    artists: "Lina Wiklund & Ann Wiklund",
    startAt: "2024-07-13T10:00:00+02:00",
    endAt: "2024-07-13T17:30:00+02:00",
    status: "published",
    category: "yoga",
    images: [
      {
        url: "/images/evenemang/yoga-loft.webp",
        alt: "Yoga på loftet på Storegården 7"
      }
    ]
  }
];

export default function AdminYoga({ adminKey }) {
  const { success, error } = useToast();
  const [yogaEvents, setYogaEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [galleryImages, setGalleryImages] = useState([
    { id: "img-1", url: "/images/evenemang/lina-yoga-header.jpg", title: "Lina Yoga 1" },
    { id: "img-2", url: "/images/evenemang/lina-yoga.jpg", title: "Lina Yoga 2" },
    { id: "img-3", url: "/images/evenemang/lina-yoga-yta2.jpg", title: "Loftet miljö" },
    { id: "img-4", url: "/images/evenemang/mala1.jpg", title: "Målarkurs 1" },
    { id: "img-5", url: "/images/evenemang/mala2.jpg", title: "Målarkurs 2" },
    { id: "img-6", url: "/images/evenemang/yoga-loft.webp", title: "Yoga på loftet" },
  ]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [isDropActive, setIsDropActive] = useState(false);

  const processFileAndUpload = async (file) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      error("Bilden är för stor (max 10 MB)");
      return;
    }
    setUploadingGallery(true);
    try {
      // Automatic Client-side WebP Conversion & Resizing for Web Optimization
      const optimizedFile = await optimizeImageForWeb(file);
      const uploadRes = await AdminService.createEventUpload(adminKey, optimizedFile);
      const url = uploadRes?.url || uploadRes?.publicUrl || uploadRes?.location;
      if (url) {
        setGalleryImages((prev) => [
          ...prev,
          { id: `r2-${Date.now()}`, url, title: optimizedFile.name },
        ]);
        success("Ny bild har optimerats (WebP) och laddats upp!");
      }
    } catch (err) {
      error(err.message || "Kunde inte ladda upp bilden");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processFileAndUpload(file);
  };

  const handleDropzoneDrop = (e) => {
    e.preventDefault();
    setIsDropActive(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      files.forEach((f) => processFileAndUpload(f));
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null) return;
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx) {
      setGalleryImages((prev) => {
        const next = [...prev];
        const [moved] = next.splice(draggedIdx, 1);
        next.splice(dragOverIdx, 0, moved);
        return next;
      });
      success("Bildordningen har uppdaterats!");
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDeleteGalleryImage = (id) => {
    if (!window.confirm("Vill du ta bort denna bild från /kurser galleriet?")) return;
    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
    success("Bilden har tagits bort");
  };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyYogaForm());

  const loadYogaEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminService.getEvents(adminKey);
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data?.items)) {
        items = data.items;
      } else if (Array.isArray(data?.events)) {
        items = data.events;
      }
      
      const filtered = items.filter(
        item => item.title?.toLowerCase().includes("yoga") || item.category === "yoga"
      );
      setYogaEvents(filtered.length > 0 ? filtered : DEFAULT_YOGA_EVENTS);
    } catch {
      setYogaEvents(DEFAULT_YOGA_EVENTS);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    loadYogaEvents();
  }, [loadYogaEvents]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyYogaForm());
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "Yoga på loftet",
      instructor: item.artists || "Lina Wiklund",
      description: item.description || "",
      location: item.location || "Storegården 7, Rackeby",
      eventDate: item.startAt ? item.startAt.split("T")[0] : "",
      startTime: item.startAt && item.startAt.includes("T") ? item.startAt.split("T")[1].substring(0, 5) : "18:00",
      arrivalTime: "17:30",
      matInfo: "Yogamattor finns på plats.",
      contactEmail: "bylinawiklund@gmail.com",
      status: item.status || "published",
      image: item.images?.[0]?.url || "/images/evenemang/lina-yoga-header.jpg",
    });
    setIsDrawerOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      error("Bilden är för stor (max 10MB)");
      return;
    }

    setUploadingImage(true);
    try {
      const uploadRes = await AdminService.createEventUpload(adminKey, file);
      const url = uploadRes?.url || uploadRes?.publicUrl || uploadRes?.location;
      if (url) {
        setForm(prev => ({ ...prev, image: url }));
        success("Bilden har laddats upp till Cloudflare R2!");
      }
    } catch (err) {
      error(err.message || "Misslyckades att ladda upp bilden till R2");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const startAt = `${form.eventDate}T${form.startTime}:00+02:00`;
    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      artists: form.instructor,
      startAt,
      endAt: startAt,
      status: form.status,
      category: "yoga",
      images: form.image ? [{ url: form.image, alt: form.title }] : [],
    };

    try {
      if (editingId) {
        await AdminService.updateEvent(adminKey, editingId, payload);
        success("Yogapasset har uppdaterats!");
      } else {
        await AdminService.createEvent(adminKey, payload);
        success("Nytt yogapass har skapats!");
      }
      setIsDrawerOpen(false);
      loadYogaEvents();
    } catch (err) {
      error(err.message || "Misslyckades att spara yogapasset");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Är du säker på att du vill ta bort detta yogapass?")) return;
    try {
      await AdminService.deleteEvent(adminKey, id);
      success("Yogapasset har tagits bort");
      loadYogaEvents();
    } catch (err) {
      error(err.message || "Kunde inte ta bort yogapasset");
    }
  };

  return (
    <div className="admin-workspace admin-events-workspace">
      <div className="admin-workspace-header">
        <div>
          <p className="admin-workspace-kicker">Innehåll & Kurser</p>
          <h2>Yoga & Kurser på loftet</h2>
          <p>Hantera yogapass, datum, priser samt bildgalleriet för /kurser.</p>
        </div>
        <button
          type="button"
          className="admin-btn-primary"
          onClick={handleOpenCreate}
        >
          <Plus size={18} aria-hidden="true" />
          Skapa nytt yogapass
        </button>
      </div>

      {loading ? (
        <AdminState type="loading" message="Hämtar yogapass..." />
      ) : yogaEvents.length === 0 ? (
        <AdminState
          type="empty"
          title="Inga schemalagda yogapass hittades"
          description="Klicka på 'Skapa nytt yogapass' ovan för att lägga till ditt första yogapass på loftet."
          actionLabel="Skapa yogapass"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="admin-events-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {yogaEvents.map((item) => (
            <div key={item.id} className="admin-card" style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid var(--admin-border-subtle)" }}>
              {item.images?.[0]?.url && (
                <img
                  src={item.images[0].url}
                  alt={item.title}
                  style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "14px" }}
                />
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className={`admin-chip ${item.status === "published" ? "admin-chip-paid" : "admin-chip-unpaid"}`}>
                  {item.status === "published" ? "Publicerad" : "Utkast"}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {item.artists || "Lina Wiklund"}
                </span>
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: "1.3rem" }}>{item.title}</h3>
              <p style={{ margin: "0 0 12px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                {item.description}
              </p>
              <div style={{ display: "flex", gap: "16px", fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "16px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CalendarDays size={16} /> {item.startAt ? item.startAt.split("T")[0] : "Ej satt"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock3 size={16} /> {item.startAt && item.startAt.includes("T") ? item.startAt.split("T")[1].substring(0, 5) : "18:00"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", borderTop: "1px solid #eee", paddingTop: "14px" }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => handleOpenEdit(item)}
                >
                  Redigera
                </button>
                <button
                  type="button"
                  className="admin-btn-icon-danger"
                  onClick={() => handleDelete(item.id)}
                  title="Ta bort yogapass"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Dedicated Gallery Manager for /kurser with Drag and Drop */}
      <div
        className="admin-section"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDropActive(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDropActive(false);
          }
        }}
        onDrop={handleDropzoneDrop}
        style={{
          marginTop: "40px",
          background: isDropActive ? "rgba(95, 111, 82, 0.05)" : "#fff",
          padding: "24px",
          borderRadius: "12px",
          border: isDropActive
            ? "2px dashed var(--primary-color)"
            : "1px solid var(--admin-border-subtle)",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <ImageIcon size={20} style={{ color: "var(--primary-color)" }} />
              Bildgalleri & Återblick för /kurser
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Dra och släpp korten för att ordna om bilderna i återblicken. Släpp nya bildfiler var som helst i rutan för snabbuppladdning.
            </p>
          </div>
          <label className="admin-btn-secondary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Upload size={16} />
            {uploadingGallery ? "Laddar upp..." : "Välj bilder"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              style={{ display: "none" }}
              disabled={uploadingGallery}
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
          {galleryImages.map((img, idx) => {
            const isDragging = draggedIdx === idx;
            const isOver = dragOverIdx === idx;
            return (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                style={{
                  position: "relative",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: isOver
                    ? "2px solid var(--primary-color)"
                    : "1px solid var(--admin-border-subtle)",
                  background: "#ffffff",
                  opacity: isDragging ? 0.4 : 1,
                  transform: isOver ? "scale(1.02)" : "scale(1)",
                  transition: "all 0.15s ease",
                  cursor: "grab",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* Drag handle */}
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "4px",
                    padding: "3px 6px",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    zIndex: 2,
                  }}
                >
                  <GripVertical size={12} />
                  <span>#{idx + 1}</span>
                </div>

                <img
                  src={img.url}
                  alt={img.title}
                  style={{ width: "100%", height: "125px", objectFit: "cover", display: "block" }}
                />
                
                <div style={{ padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-main)", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100px" }}>
                    {img.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteGalleryImage(img.id)}
                    style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer", padding: "4px" }}
                    title="Ta bort bild"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drawer Form */}
      <AdminDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingId ? "Redigera Yogapass" : "Nytt Yogapass på loftet"}
        subtitle="Ställ in information och bild för kurssidan."
        footer={
          <>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setIsDrawerOpen(false)}
            >
              Avbryt
            </button>
            <button
              form={YOGA_FORM_ID}
              type="submit"
              className="admin-btn-primary"
              disabled={saving}
            >
              <Save size={16} aria-hidden="true" />
              {saving ? "Sparar..." : editingId ? "Spara ändringar" : "Skapa & Publicera"}
            </button>
          </>
        }
      >
        <form id={YOGA_FORM_ID} className="admin-drawer-form" onSubmit={handleSubmit}>
          <AdminDrawerSection title="Huvudinformation">
            <div className="admin-form-group">
              <label htmlFor="yoga-title">Eventrubrik</label>
              <input
                id="yoga-title"
                type="text"
                className="admin-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="yoga-instructor">Instruktör</label>
              <input
                id="yoga-instructor"
                type="text"
                className="admin-input"
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="yoga-description">Beskrivning</label>
              <textarea
                id="yoga-description"
                rows={3}
                className="admin-textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
          </AdminDrawerSection>

          <AdminDrawerSection title="Snabbmallar (Passtyper)">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
              <button
                type="button"
                className="admin-btn-secondary"
                style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    title: "Yoga på loftet (90 min)",
                    durationMinutes: 90,
                    price: 150,
                    dropIn: false,
                    startTime: "18:00",
                  }))
                }
              >
                Tisdag 90m (150 kr, Föranmälan)
              </button>
              <button
                type="button"
                className="admin-btn-secondary"
                style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    title: "Yoga på loftet (60 min)",
                    durationMinutes: 60,
                    price: 100,
                    dropIn: true,
                    startTime: "18:00",
                  }))
                }
              >
                Onsdag 60m (100 kr, Drop-in)
              </button>
              <button
                type="button"
                className="admin-btn-secondary"
                style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    title: "Yoga på loftet (60 min)",
                    durationMinutes: 60,
                    price: 100,
                    dropIn: true,
                    startTime: "18:00",
                  }))
                }
              >
                Torsdag 60m (100 kr, Drop-in)
              </button>
            </div>
          </AdminDrawerSection>

          <AdminDrawerSection title="Tid & Plats">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="admin-form-group">
                <label htmlFor="yoga-date">Datum</label>
                <input
                  id="yoga-date"
                  type="date"
                  className="admin-input"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="yoga-start-time">Starttid</label>
                <input
                  id="yoga-start-time"
                  type="time"
                  className="admin-input"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div className="admin-form-group">
                <label htmlFor="yoga-duration">Längd (min)</label>
                <select
                  id="yoga-duration"
                  className="admin-select"
                  value={form.durationMinutes || 90}
                  onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value, 10) })}
                >
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label htmlFor="yoga-price">Pris (SEK)</label>
                <input
                  id="yoga-price"
                  type="number"
                  className="admin-input"
                  value={form.price || 150}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value, 10) })}
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="yoga-dropin">Bokningstyp</label>
                <select
                  id="yoga-dropin"
                  className="admin-select"
                  value={form.dropIn ? "dropin" : "signup"}
                  onChange={(e) => setForm({ ...form, dropIn: e.target.value === "dropin" })}
                >
                  <option value="signup">Föranmälan</option>
                  <option value="dropin">Drop-in</option>
                </select>
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="yoga-arrival">Ankomst / Insläppstid</label>
              <input
                id="yoga-arrival"
                type="text"
                className="admin-input"
                value={form.arrivalTime}
                onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                placeholder="ex. 17:30 (30 min innan)"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="yoga-mat-info">Yogamatta / Info</label>
              <input
                id="yoga-mat-info"
                type="text"
                className="admin-input"
                value={form.matInfo}
                onChange={(e) => setForm({ ...form, matInfo: e.target.value })}
              />
            </div>
          </AdminDrawerSection>

          <AdminDrawerSection title="Bild (Cloudflare R2 CDN)">
            <div className="admin-form-group">
              <label>Huvudbild för eventet</label>
              {form.image && (
                <img
                  src={form.image}
                  alt="Förhandsvisning"
                  style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }}
                />
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <label className="admin-btn-secondary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Upload size={16} />
                  {uploadingImage ? "Laddar upp till R2..." : "Välj ny bild"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>
          </AdminDrawerSection>

          <AdminDrawerSection title="Publicering">
            <div className="admin-form-group">
              <label htmlFor="yoga-status">Status</label>
              <select
                id="yoga-status"
                className="admin-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="published">Publicerad</option>
                <option value="draft">Utkast (Dold)</option>
              </select>
            </div>
          </AdminDrawerSection>
        </form>
      </AdminDrawer>
    </div>
  );
}

AdminYoga.propTypes = {
  adminKey: PropTypes.string.isRequired,
};

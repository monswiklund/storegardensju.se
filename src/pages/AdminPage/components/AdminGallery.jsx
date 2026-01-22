import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AdminService } from "../../../services/adminService";
import { useToast } from "../../../contexts/ToastContext";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const getImageSrc = (image) =>
  image?.url ||
  image?.path ||
  image?.publicUrl ||
  image?.storageUrl ||
  image?.src ||
  "";

const getImageLabel = (image) =>
  image?.displayName ||
  image?.title ||
  image?.alt ||
  image?.filename ||
  image?.id ||
  "Bild";

const buildCategoryPayload = (category, overrides = {}) => ({
  name: category.name?.trim() || "",
  slug: category.slug?.trim() || slugify(category.name || ""),
  order: Number.isFinite(Number(category.order))
    ? Number(category.order)
    : null,
  ...overrides,
});

function AdminGallery({ adminKey }) {
  const { success, error, info } = useToast();
  const [galleryData, setGalleryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    order: "",
  });
  const [categoryEdits, setCategoryEdits] = useState({});
  const [imageEdits, setImageEdits] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImageIds, setSelectedImageIds] = useState(() => new Set());
  const [draggingId, setDraggingId] = useState("");

  const categories = useMemo(
    () => galleryData?.categories || [],
    [galleryData]
  );

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return (
      categories.find((category) => category.id === activeCategoryId) ||
      categories[0]
    );
  }, [categories, activeCategoryId]);

  const activeImages = useMemo(
    () => activeCategory?.images || [],
    [activeCategory]
  );

  const sortedActiveImages = useMemo(() => {
    return [...activeImages].sort((a, b) => {
      const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
      const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
      if (orderA === orderB) {
        return (a.createdAt || 0) - (b.createdAt || 0);
      }
      return orderA - orderB;
    });
  }, [activeImages]);

  const loadGallery = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const data = await AdminService.getGallery(adminKey);
      setGalleryData(data || { categories: [] });
      if (!activeCategoryId && data?.categories?.length) {
        setActiveCategoryId(data.categories[0].id);
      }
    } catch (err) {
      error(err?.message || "Kunde inte hämta galleri.");
    } finally {
      setLoading(false);
    }
  }, [adminKey, activeCategoryId, error]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    if (!activeCategoryId && categories.length) {
      setActiveCategoryId(categories[0].id);
    }
  }, [activeCategoryId, categories]);

  useEffect(() => {
    setSelectedImageIds(new Set());
  }, [activeCategoryId]);

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      error("Ange ett namn för kategorin.");
      return;
    }

    setSaving(true);
    try {
      const payload = buildCategoryPayload(categoryForm);
      await AdminService.createGalleryCategory(adminKey, payload);
      setCategoryForm({ name: "", slug: "", order: "" });
      success("Kategorin skapad.");
      await loadGallery();
    } catch (err) {
      error(err?.message || "Kunde inte skapa kategori.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategoryChange = (categoryId, field, value) => {
    setCategoryEdits((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value,
      },
    }));
  };

  const handleSaveCategory = async (category) => {
    const edits = categoryEdits[category.id];
    if (!edits) return;
    setSaving(true);
    try {
      const payload = buildCategoryPayload({ ...category, ...edits });
      await AdminService.updateGalleryCategory(adminKey, category.id, payload);
      success("Kategorin uppdaterad.");
      setCategoryEdits((prev) => {
        const next = { ...prev };
        delete next[category.id];
        return next;
      });
      await loadGallery();
    } catch (err) {
      error(err?.message || "Kunde inte spara kategori.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort kategorin?"
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      await AdminService.deleteGalleryCategory(adminKey, categoryId);
      success("Kategorin borttagen.");
      if (activeCategoryId === categoryId) {
        setActiveCategoryId("");
      }
      await loadGallery();
    } catch (err) {
      error(err?.message || "Kunde inte ta bort kategori.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageEditChange = (imageId, field, value) => {
    setImageEdits((prev) => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        [field]: value,
      },
    }));
  };

  const handleSaveImage = async (image) => {
    if (!image?.id) {
      info("Bilden saknar id och kan inte uppdateras än.");
      return;
    }
    const edits = imageEdits[image.id] || {};
    setSaving(true);
    try {
      const payload = {
        title: edits.title ?? image.title ?? image.displayName ?? "",
        alt: edits.alt ?? image.alt ?? image.displayName ?? "",
        caption: edits.caption ?? image.caption ?? "",
        order: Number.isFinite(Number(edits.order))
          ? Number(edits.order)
          : image.order ?? null,
        featured: edits.featured ?? image.featured ?? false,
        published: edits.published ?? image.published ?? true,
        categoryId: edits.categoryId ?? image.categoryId ?? activeCategoryId,
      };
      await AdminService.updateGalleryImage(adminKey, image.id, payload);
      success("Bild uppdaterad.");
      setImageEdits((prev) => {
        const next = { ...prev };
        delete next[image.id];
        return next;
      });
      await loadGallery();
    } catch (err) {
      error(err?.message || "Kunde inte spara bild.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort bilden?"
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      await AdminService.deleteGalleryImage(adminKey, imageId);
      success("Bilden borttagen.");
      await loadGallery();
    } catch (err) {
      error(err?.message || "Kunde inte ta bort bild.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleImageSelect = (imageId) => {
    setSelectedImageIds((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedImageIds.size === sortedActiveImages.length) {
      setSelectedImageIds(new Set());
      return;
    }
    const next = new Set(
      sortedActiveImages.map((image) => image.id).filter(Boolean)
    );
    setSelectedImageIds(next);
  };

  const handleBulkPublish = async (published) => {
    if (selectedImageIds.size === 0) return;
    setSaving(true);
    try {
      const promises = Array.from(selectedImageIds).map((id) =>
        AdminService.updateGalleryImage(adminKey, id, { published })
      );
      await Promise.all(promises);
      success(published ? "Bilder publicerade." : "Bilder avpublicerade.");
      setSelectedImageIds(new Set());
      await loadGallery();
    } catch (err) {
      error(err?.message || "Kunde inte uppdatera bilder.");
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (targetId) => {
    if (!draggingId || draggingId === targetId) return;
    const ordered = [...sortedActiveImages];
    const dragIndex = ordered.findIndex((img) => img.id === draggingId);
    const targetIndex = ordered.findIndex((img) => img.id === targetId);
    if (dragIndex === -1 || targetIndex === -1) return;

    const dragged = ordered[dragIndex];
    const remaining = ordered.filter((img) => img.id !== draggingId);
    let insertIndex = targetIndex;
    if (dragIndex < targetIndex) {
      insertIndex = Math.max(0, targetIndex - 1);
    }
    remaining.splice(insertIndex, 0, dragged);

    const prev = remaining[insertIndex - 1];
    const next = remaining[insertIndex + 1];
    const prevOrder = prev
      ? Number.isFinite(Number(prev.order))
        ? Number(prev.order)
        : insertIndex * 10
      : 0;
    const nextOrder = next
      ? Number.isFinite(Number(next.order))
        ? Number(next.order)
        : (insertIndex + 1) * 10
      : prevOrder + 10;

    let newOrder = 10;
    if (prev && next) {
      newOrder = (prevOrder + nextOrder) / 2;
    } else if (prev) {
      newOrder = prevOrder + 10;
    } else if (next) {
      newOrder = nextOrder - 10;
    }

    setSaving(true);
    try {
      await AdminService.updateGalleryImage(adminKey, draggingId, {
        order: newOrder,
      });
      success("Ordning uppdaterad.");
      await loadGallery();
    } catch (err) {
      error(err?.message || "Kunde inte ändra ordning.");
    } finally {
      setSaving(false);
      setDraggingId("");
    }
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!activeCategoryId) {
      error("Välj en kategori innan uppladdning.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      let completed = 0;
      for (const file of files) {
        const uploadInfo = await AdminService.createGalleryUpload(adminKey, {
          filename: file.name,
          contentType: file.type,
        });

        const uploadUrl = uploadInfo?.uploadUrl || uploadInfo?.url;
        if (!uploadUrl) {
          throw new Error("Upload URL saknas från servern.");
        }

        const headers = {
          ...(uploadInfo?.headers || {}),
        };
        if (!headers["Content-Type"] && file.type) {
          headers["Content-Type"] = file.type;
        }

        const uploadResponse = await fetch(uploadUrl, {
          method: uploadInfo?.method || "PUT",
          headers,
          body: file,
        });
        if (!uploadResponse.ok) {
          throw new Error("Uppladdning misslyckades.");
        }

        const title = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim();

        await AdminService.createGalleryImage(adminKey, {
          categoryId: activeCategoryId,
          title,
          alt: title,
          storageKey: uploadInfo?.storageKey || uploadInfo?.key,
          url: uploadInfo?.publicUrl || uploadInfo?.cdnUrl || uploadInfo?.assetUrl,
          published: true,
        });

        completed += 1;
        setUploadProgress(Math.round((completed / files.length) * 100));
      }

      success("Uppladdning klar.");
      await loadGallery();
    } catch (err) {
      error(err?.message || "Uppladdningen misslyckades.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = "";
    }
  };

  return (
    <div className="admin-gallery">
      <div className="admin-panel admin-gallery-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Galleri</h2>
            <p>Hantera kategorier och bilder som visas på /galleri.</p>
          </div>
          <div className="admin-panel-actions">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={loadGallery}
              disabled={loading}
            >
              {loading ? "Laddar..." : "Uppdatera"}
            </button>
          </div>
        </div>

        <div className="admin-gallery-layout">
          <div className="admin-gallery-sidebar">
            <h3>Kategorier</h3>
            {categories.length === 0 && !loading && (
              <p className="admin-muted">Inga kategorier ännu.</p>
            )}
            <div className="admin-gallery-categories">
              {categories.map((category) => {
                const edits = categoryEdits[category.id] || {};
                const nameValue = edits.name ?? category.name ?? "";
                const slugValue = edits.slug ?? category.slug ?? "";
                const orderValue =
                  edits.order ??
                  (Number.isFinite(Number(category.order))
                    ? category.order
                    : "");

                return (
                  <div
                    key={category.id}
                    className={`admin-gallery-category-card ${
                      category.id === activeCategoryId ? "active" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="admin-gallery-category-select"
                      onClick={() => setActiveCategoryId(category.id)}
                    >
                      <span>{category.name}</span>
                      <span className="admin-badge">
                        {category.images?.length || 0}
                      </span>
                    </button>
                    <div className="admin-gallery-category-form">
                      <label className="admin-label">
                        Namn
                        <input
                          className="admin-input"
                          value={nameValue}
                          onChange={(event) =>
                            handleEditCategoryChange(
                              category.id,
                              "name",
                              event.target.value
                            )
                          }
                        />
                      </label>
                      <label className="admin-label">
                        Slug
                        <input
                          className="admin-input"
                          value={slugValue}
                          onChange={(event) =>
                            handleEditCategoryChange(
                              category.id,
                              "slug",
                              event.target.value
                            )
                          }
                        />
                      </label>
                      <label className="admin-label">
                        Ordning
                        <input
                          className="admin-input"
                          type="number"
                          value={orderValue}
                          onChange={(event) =>
                            handleEditCategoryChange(
                              category.id,
                              "order",
                              event.target.value
                            )
                          }
                        />
                      </label>
                      <div className="admin-gallery-category-actions">
                        <button
                          type="button"
                          className="admin-btn-primary admin-btn-sm"
                          onClick={() => handleSaveCategory(category)}
                          disabled={saving}
                        >
                          Spara
                        </button>
                        <button
                          type="button"
                          className="admin-btn-tertiary admin-btn-sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={saving}
                        >
                          Ta bort
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              className="admin-gallery-create"
              onSubmit={handleCreateCategory}
            >
              <h4>Ny kategori</h4>
              <label className="admin-label">
                Namn
                <input
                  className="admin-input"
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="admin-label">
                Slug
                <input
                  className="admin-input"
                  value={categoryForm.slug}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      slug: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="admin-label">
                Ordning
                <input
                  className="admin-input"
                  type="number"
                  value={categoryForm.order}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      order: event.target.value,
                    }))
                  }
                />
              </label>
              <button
                type="submit"
                className="admin-btn-primary admin-btn-block"
                disabled={saving}
              >
                Skapa kategori
              </button>
            </form>
          </div>

          <div className="admin-gallery-content">
            <div className="admin-gallery-upload">
              <div>
                <h3>Uppladdning</h3>
                <p className="admin-muted">
                  Ladda upp bilder till vald kategori.
                </p>
              </div>
              <div className="admin-gallery-upload-actions">
                <label className="admin-upload-button">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading || !activeCategoryId}
                  />
                  {uploading
                    ? `Laddar upp ${uploadProgress}%`
                    : "Välj bilder"}
                </label>
                {activeCategory && (
                  <span className="admin-muted">
                    Till kategori: {activeCategory.name}
                  </span>
                )}
              </div>
            </div>

            <div className="admin-gallery-images">
              <h3>Bilder</h3>
              {sortedActiveImages.length === 0 && !loading && (
                <p className="admin-muted">Inga bilder i kategorin.</p>
              )}
              {sortedActiveImages.length > 0 && (
                <div className="admin-gallery-image-toolbar">
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={
                        selectedImageIds.size > 0 &&
                        selectedImageIds.size === sortedActiveImages.length
                      }
                      onChange={handleToggleSelectAll}
                    />
                    Markera alla
                  </label>
                  <div className="admin-gallery-bulk-actions">
                    <button
                      type="button"
                      className="admin-btn-secondary admin-btn-sm"
                      onClick={() => handleBulkPublish(true)}
                      disabled={saving || selectedImageIds.size === 0}
                    >
                      Publicera
                    </button>
                    <button
                      type="button"
                      className="admin-btn-tertiary admin-btn-sm"
                      onClick={() => handleBulkPublish(false)}
                      disabled={saving || selectedImageIds.size === 0}
                    >
                      Avpublicera
                    </button>
                    <span className="admin-muted">
                      {selectedImageIds.size} valda
                    </span>
                  </div>
                </div>
              )}
              <div className="admin-gallery-image-grid">
                {sortedActiveImages.map((image) => {
                  const imageId = image.id || image.filename || image.storageKey;
                  const edits = image.id ? imageEdits[image.id] || {} : {};
                  const titleValue =
                    edits.title ?? image.title ?? image.displayName ?? "";
                  const altValue =
                    edits.alt ?? image.alt ?? image.displayName ?? "";
                  const captionValue = edits.caption ?? image.caption ?? "";
                  const orderValue =
                    edits.order ??
                    (Number.isFinite(Number(image.order))
                      ? image.order
                      : "");
                  const featuredValue =
                    edits.featured ?? image.featured ?? false;
                  const publishedValue =
                    edits.published ?? image.published ?? true;
                  const categoryValue =
                    edits.categoryId ?? image.categoryId ?? activeCategoryId;
                  const isSelected = image.id
                    ? selectedImageIds.has(image.id)
                    : false;

                  return (
                    <div
                      key={imageId}
                      className={`admin-gallery-image-card ${
                        isSelected ? "is-selected" : ""
                      }`}
                      draggable={Boolean(image.id)}
                      onDragStart={() => setDraggingId(image.id)}
                      onDragEnd={() => setDraggingId("")}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleReorder(image.id)}
                    >
                      <div className="admin-gallery-image-preview">
                        {getImageSrc(image) ? (
                          <img
                            src={getImageSrc(image)}
                            alt={getImageLabel(image)}
                          />
                        ) : (
                          <div className="admin-gallery-image-placeholder">
                            Ingen bild
                          </div>
                        )}
                        {image.id && (
                          <button
                            type="button"
                            className="admin-gallery-image-select"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleToggleImageSelect(image.id);
                            }}
                            aria-pressed={isSelected}
                            aria-label={
                              isSelected
                                ? "Avmarkera bild"
                                : "Markera bild"
                            }
                          >
                            {isSelected ? "✓" : "+"}
                          </button>
                        )}
                      </div>
                      <div className="admin-gallery-image-form">
                        <label className="admin-label">
                          Titel
                          <input
                            className="admin-input"
                            value={titleValue}
                            onChange={(event) =>
                              handleImageEditChange(
                                image.id,
                                "title",
                                event.target.value
                              )
                            }
                            disabled={!image.id}
                          />
                        </label>
                        <label className="admin-label">
                          Alt
                          <input
                            className="admin-input"
                            value={altValue}
                            onChange={(event) =>
                              handleImageEditChange(
                                image.id,
                                "alt",
                                event.target.value
                              )
                            }
                            disabled={!image.id}
                          />
                        </label>
                        <label className="admin-label">
                          Bildtext
                          <input
                            className="admin-input"
                            value={captionValue}
                            onChange={(event) =>
                              handleImageEditChange(
                                image.id,
                                "caption",
                                event.target.value
                              )
                            }
                            disabled={!image.id}
                          />
                        </label>
                        <div className="admin-gallery-image-row">
                          <label className="admin-label">
                            Ordning
                            <input
                              className="admin-input"
                              type="number"
                              value={orderValue}
                              onChange={(event) =>
                                handleImageEditChange(
                                  image.id,
                                  "order",
                                  event.target.value
                                )
                              }
                              disabled={!image.id}
                            />
                          </label>
                          <label className="admin-label">
                            Kategori
                            <select
                              className="admin-select"
                              value={categoryValue}
                              onChange={(event) =>
                                handleImageEditChange(
                                  image.id,
                                  "categoryId",
                                  event.target.value
                                )
                              }
                              disabled={!image.id}
                            >
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="admin-gallery-image-toggles">
                          <label className="admin-checkbox">
                            <input
                              type="checkbox"
                              checked={featuredValue}
                              onChange={(event) =>
                                handleImageEditChange(
                                  image.id,
                                  "featured",
                                  event.target.checked
                                )
                              }
                              disabled={!image.id}
                            />
                            Featured
                          </label>
                          <label className="admin-checkbox">
                            <input
                              type="checkbox"
                              checked={publishedValue}
                              onChange={(event) =>
                                handleImageEditChange(
                                  image.id,
                                  "published",
                                  event.target.checked
                                )
                              }
                              disabled={!image.id}
                            />
                            Publicerad
                          </label>
                        </div>
                        <div className="admin-gallery-image-actions">
                          <button
                            type="button"
                            className="admin-btn-primary admin-btn-sm"
                            onClick={() => handleSaveImage(image)}
                            disabled={saving || !image.id}
                          >
                            Spara
                          </button>
                          <button
                            type="button"
                            className="admin-btn-tertiary admin-btn-sm"
                            onClick={() => handleDeleteImage(image.id)}
                            disabled={saving || !image.id}
                          >
                            Ta bort
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

AdminGallery.propTypes = {
  adminKey: PropTypes.string.isRequired,
};

export default AdminGallery;

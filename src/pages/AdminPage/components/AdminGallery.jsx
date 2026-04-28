import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AdminService } from "../../../services/adminService";
import { useToast } from "../../../contexts/ToastContext";
import { MAX_UPLOAD_BYTES } from "../adminConstants";

const formatMaxUploadSize = () => `${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const isAllImagesCategory = (category) => {
  const normalizedName = (category?.name || "").trim().toLowerCase();
  const normalizedSlug = (category?.slug || "").trim().toLowerCase();
  const normalizedId = (category?.id || "").trim().toLowerCase();
  return (
    normalizedName === "alla bilder" ||
    normalizedSlug === "alla-bilder" ||
    normalizedName === "all images" ||
    normalizedSlug === "all-images" ||
    normalizedId === "all"
  );
};

const getImageCategoryIds = (image, fallbackCategoryId = "") => {
  const fromImage = Array.isArray(image?.categoryIds)
    ? image.categoryIds
    : [];
  const fromPrimary = image?.categoryId ? [image.categoryId] : [];
  const fromFallback = fallbackCategoryId ? [fallbackCategoryId] : [];
  const unique = [];
  const seen = new Set();
  [...fromImage, ...fromPrimary, ...fromFallback].forEach((id) => {
    const normalized = String(id || "").trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    unique.push(normalized);
  });
  return unique;
};

const getImageCategoryOrders = (image) => {
  const source = image?.categoryOrders;
  if (!source || typeof source !== "object") {
    return {};
  }
  return Object.entries(source).reduce((acc, [categoryId, order]) => {
    const normalizedCategoryId = String(categoryId || "").trim();
    if (!normalizedCategoryId) return acc;
    const normalizedOrder = Number(order);
    acc[normalizedCategoryId] = Number.isFinite(normalizedOrder)
      ? normalizedOrder
      : 0;
    return acc;
  }, {});
};

const SUPPORTED_GALLERY_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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
  const [failedUploads, setFailedUploads] = useState([]);
  const [selectedImageIds, setSelectedImageIds] = useState(() => new Set());
  const [draggingId, setDraggingId] = useState("");
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState("");
  const [lastMoveAction, setLastMoveAction] = useState(null);
  const [expandedImages, setExpandedImages] = useState(() => new Set());
  const feedbackTimerRef = useRef(null);
  const categoryPickerRef = useRef(null);

  const toggleImageExpanded = (imageId) => {
    setExpandedImages((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  const categories = useMemo(() => {
    const raw = galleryData?.categories || [];
    const next = [...raw];
    
    next.sort((a, b) => {
      const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
      const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
      if (orderA === orderB) {
        return (a.name || "").localeCompare(b.name || "", "sv");
      }
      return orderA - orderB;
    });

    // Ensure "Alla bilder" (or similar) is always at the top
    const allaIndex = next.findIndex(isAllImagesCategory);
    if (allaIndex > 0) {
      const [alla] = next.splice(allaIndex, 1);
      next.unshift(alla);
    }
    
    return next;
  }, [galleryData]);

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return (
      categories.find((category) => category.id === activeCategoryId) ||
      categories[0]
    );
  }, [categories, activeCategoryId]);

  const assignableCategories = useMemo(
    () => categories.filter((category) => !isAllImagesCategory(category)),
    [categories]
  );

  const activeCategoryIsAssignable = useMemo(
    () => (activeCategory ? !isAllImagesCategory(activeCategory) : false),
    [activeCategory]
  );

  const activeImages = useMemo(
    () => activeCategory?.images || [],
    [activeCategory]
  );

  const sortedActiveImages = useMemo(() => {
    return [...activeImages].sort((a, b) => {
      const editedOrderA = a?.id ? imageEdits[a.id]?.order : undefined;
      const editedOrderB = b?.id ? imageEdits[b.id]?.order : undefined;
      const orderA = Number.isFinite(Number(editedOrderA))
        ? Number(editedOrderA)
        : Number.isFinite(Number(a.order))
          ? Number(a.order)
          : 0;
      const orderB = Number.isFinite(Number(editedOrderB))
        ? Number(editedOrderB)
        : Number.isFinite(Number(b.order))
          ? Number(b.order)
          : 0;
      if (orderA === orderB) {
        return (a.createdAt || 0) - (b.createdAt || 0);
      }
      return orderA - orderB;
    });
  }, [activeImages, imageEdits]);

  const selectableImageIds = useMemo(
    () => sortedActiveImages.map((image) => image.id).filter(Boolean),
    [sortedActiveImages]
  );

  const imagesById = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      (category.images || []).forEach((image) => {
        if (image?.id) {
          map.set(image.id, image);
        }
      });
    });
    return map;
  }, [categories]);

  const pendingImageChangesCount = useMemo(
    () =>
      Object.values(imageEdits).filter(
        (edits) => edits && Object.keys(edits).length > 0
      ).length,
    [imageEdits]
  );

  const showActionFeedback = useCallback((message) => {
    if (!message) return;
    setLastActionMessage(message);
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setLastActionMessage("");
      feedbackTimerRef.current = null;
    }, 2400);
  }, []);

  const galleryOverview = useMemo(() => {
    const totalCategories = categories.length;
    const totalImages = categories.reduce(
      (sum, category) => sum + (category.images?.length || 0),
      0
    );
    const publishedImages = categories.reduce(
      (sum, category) =>
        sum +
        (category.images?.filter((image) => image.published !== false).length ||
          0),
      0
    );
    return {
      totalCategories,
      totalImages,
      publishedImages,
      activeCategoryName: activeCategory?.name || "Ingen vald",
      activeImageCount: sortedActiveImages.length,
      selectedImageCount: selectedImageIds.size,
    };
  }, [activeCategory?.name, categories, selectedImageIds.size, sortedActiveImages.length]);

  const loadGallery = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const data = await AdminService.getGallery(adminKey);
      setGalleryData(data || { categories: [] });
      setActiveCategoryId((prev) => {
        if (!data?.categories?.length) return "";
        if (prev && data.categories.some((category) => category.id === prev)) {
          return prev;
        }
        return data.categories[0].id;
      });
    } catch (err) {
      error(err?.message || "Kunde inte hämta galleri.");
    } finally {
      setLoading(false);
    }
  }, [adminKey, error]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    setSelectedImageIds(new Set());
    setLastMoveAction(null);
  }, [activeCategoryId]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isCategoryMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (
        categoryPickerRef.current &&
        !categoryPickerRef.current.contains(event.target)
      ) {
        setIsCategoryMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCategoryMenuOpen]);

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
      setShowCreateCategoryModal(false);
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

  const handleImageCategoryToggle = (imageId, categoryId, checked, currentIds) => {
    const baseIds = Array.isArray(currentIds) ? currentIds : [];
    let nextIds = baseIds;
    if (checked) {
      nextIds = baseIds.includes(categoryId)
        ? baseIds
        : [...baseIds, categoryId];
    } else {
      if (baseIds.length <= 1) {
        info("Bilden måste vara i minst en kategori.");
        return;
      }
      nextIds = baseIds.filter((id) => id !== categoryId);
    }
    handleImageEditChange(imageId, "categoryIds", nextIds);
  };

  const stageOrderForImages = useCallback(
    (orderedImages) => {
      setImageEdits((prev) => {
        const next = { ...prev };
        orderedImages.forEach((image, index) => {
          const imageId = image?.id;
          if (!imageId) return;
          const nextOrder = (index + 1) * 10;
          const baseOrder = Number.isFinite(Number(image.order))
            ? Number(image.order)
            : 0;
          const prevEntry = next[imageId] || {};
          const updated = { ...prevEntry };
          if (nextOrder === baseOrder) {
            delete updated.order;
          } else {
            updated.order = nextOrder;
          }
          if (Object.keys(updated).length === 0) {
            delete next[imageId];
          } else {
            next[imageId] = updated;
          }
        });
        return next;
      });
    },
    []
  );

  const handleSaveAllImageChanges = async () => {
    if (pendingImageChangesCount === 0) {
      info("Inga bildändringar att spara.");
      return;
    }

    const updates = Object.entries(imageEdits)
      .map(([imageId, edits]) => {
        const image = imagesById.get(imageId);
        if (!image) return null;
        const fallbackCategoryId =
          assignableCategories.find((category) => category.id === activeCategoryId)
            ?.id || assignableCategories[0]?.id || "";
        const candidateCategoryIds = Array.isArray(edits.categoryIds)
          ? edits.categoryIds
          : getImageCategoryIds(image, fallbackCategoryId);
        const validCategoryIds = candidateCategoryIds.filter((id) =>
          assignableCategories.some((category) => category.id === id)
        );
        if (validCategoryIds.length === 0) return null;
        const baseCategoryOrders = getImageCategoryOrders(image);
        const persistedCategoryOrders = validCategoryIds.reduce((acc, id) => {
          if (Number.isFinite(Number(baseCategoryOrders[id]))) {
            acc[id] = Number(baseCategoryOrders[id]);
          }
          return acc;
        }, {});
        const effectiveOrder = Number.isFinite(Number(edits.order))
          ? Number(edits.order)
          : Number.isFinite(Number(image.order))
            ? Number(image.order)
            : 0;
        if (activeCategoryIsAssignable && validCategoryIds.includes(activeCategoryId)) {
          persistedCategoryOrders[activeCategoryId] = effectiveOrder;
        }
        const primaryCategoryId = validCategoryIds[0];
        const primaryOrder = Number.isFinite(Number(persistedCategoryOrders[primaryCategoryId]))
          ? Number(persistedCategoryOrders[primaryCategoryId])
          : effectiveOrder;

        const payload = {
          title: edits.title ?? image.title ?? image.displayName ?? "",
          alt: edits.alt ?? image.alt ?? image.displayName ?? "",
          caption: edits.caption ?? image.caption ?? "",
          order: primaryOrder,
          categoryOrders: persistedCategoryOrders,
          featured: edits.featured ?? image.featured ?? false,
          published: edits.published ?? image.published ?? true,
          categoryIds: validCategoryIds,
          categoryId: primaryCategoryId,
        };
        return { id: imageId, payload };
      })
      .filter(Boolean);

    if (updates.length === 0) {
      info("Inga giltiga bildändringar att spara.");
      return;
    }

    setSaving(true);
    try {
      await applyImageUpdates(updates);
      setImageEdits({});
      success(`Ändringar sparade (${updates.length} bilder).`);
      showActionFeedback(`Sparade ${updates.length} bildändringar`);
      await loadGallery();
    } catch (err) {
      error(err?.message || "Kunde inte spara bildändringar.");
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
    if (selectedImageIds.size === selectableImageIds.length) {
      setSelectedImageIds(new Set());
      return;
    }
    setSelectedImageIds(new Set(selectableImageIds));
  };

  const handleBulkPublish = async (published) => {
    if (selectedImageIds.size === 0) return;
    setSaving(true);
    try {
      const updates = Array.from(selectedImageIds).map((id) => ({
        id,
        payload: { published },
      }));
      await applyImageUpdates(updates);
      success(published ? "Bilder publicerade." : "Bilder avpublicerade.");
      showActionFeedback(
        published
          ? `${updates.length} bild(er) publicerade`
          : `${updates.length} bild(er) avpublicerade`
      );
      setSelectedImageIds(new Set());
      await loadGallery();
    } catch (err) {
      error(err?.message || "Kunde inte uppdatera bilder.");
    } finally {
      setSaving(false);
    }
  };

  const applyImageUpdates = useCallback(
    async (updates) => {
      for (const update of updates) {
        let attempts = 0;
        while (attempts < 3) {
          try {
            await AdminService.updateGalleryImage(
              adminKey,
              update.id,
              update.payload
            );
            break;
          } catch (err) {
            attempts += 1;
            if (err?.status === 429 && attempts < 3) {
              const waitSeconds =
                Number.isFinite(Number(err?.retryAfter)) &&
                Number(err.retryAfter) > 0
                  ? Number(err.retryAfter)
                  : 1;
              await sleep(waitSeconds * 1000);
              continue;
            }
            throw err;
          }
        }
        // Keep throughput low enough for admin rate limiting.
        await sleep(120);
      }
    },
    [adminKey]
  );

  const handleReorder = (targetId) => {
    if (!activeCategoryIsAssignable) return;
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
    stageOrderForImages(remaining);
    showActionFeedback("Ordning ändrad, spara för att publicera");
    setDraggingId("");
  };

  const handleNormalizeOrder = () => {
    if (!activeCategoryIsAssignable) return;
    if (sortedActiveImages.length === 0) return;
    const hasAnyChange = sortedActiveImages.some((image, index) => {
      const nextOrder = (index + 1) * 10;
      const currentOrder = Number.isFinite(Number(imageEdits[image.id]?.order))
        ? Number(imageEdits[image.id]?.order)
        : Number.isFinite(Number(image.order))
          ? Number(image.order)
          : null;
      return currentOrder !== nextOrder;
    });
    if (!hasAnyChange) {
      info("Ordningen är redan normaliserad.");
      return;
    }
    stageOrderForImages(sortedActiveImages);
    showActionFeedback("Ordning normaliserad, spara för att publicera");
  };

  const handleMoveImage = (imageId, direction) => {
    if (!activeCategoryIsAssignable) return;
    const currentIndex = sortedActiveImages.findIndex((image) => image.id === imageId);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= sortedActiveImages.length) return;
    const previousOrderIds = sortedActiveImages.map((image) => image.id).filter(Boolean);

    const reordered = [...sortedActiveImages];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, moved);
    stageOrderForImages(reordered);
    success(direction < 0 ? "Bild flyttad upp." : "Bild flyttad ner.");
    showActionFeedback(direction < 0 ? "Flyttade bild upp, spara ändringar" : "Flyttade bild ner, spara ändringar");
    setLastMoveAction({
      categoryId: activeCategoryId,
      previousOrderIds,
    });
  };

  const handleUndoLastMove = () => {
    if (!lastMoveAction) {
      info("Ingen flytt att ångra.");
      return;
    }
    if (lastMoveAction.categoryId !== activeCategoryId) {
      info("Byt tillbaka till kategorin där flytten gjordes för att ångra.");
      return;
    }
    if (!activeCategoryIsAssignable) {
      info("Ordning kan inte ändras i Alla bilder.");
      return;
    }
    const imageById = new Map(
      sortedActiveImages.map((image) => [image.id, image]).filter(([id]) => Boolean(id))
    );
    const restored = lastMoveAction.previousOrderIds
      .map((id) => imageById.get(id))
      .filter(Boolean);
    if (restored.length === 0) {
      info("Inget att ångra.");
      setLastMoveAction(null);
      return;
    }
    stageOrderForImages(restored);
    success("Senaste flytt ångrad.");
    showActionFeedback("Ångrade senaste flytt, spara ändringar");
    setLastMoveAction(null);
  };

  const validateUploadFiles = (files) =>
    files.filter((file) => {
      const contentType = String(file.type || "").toLowerCase();
      if (contentType && !SUPPORTED_GALLERY_MIME_TYPES.has(contentType)) {
        error(
          `${file.name}: filformat stöds inte i galleriet (använd JPG, PNG, WEBP eller GIF).`
        );
        return false;
      }
      if (!file.size) {
        error(`${file.name}: filen är tom.`);
        return false;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        error(`${file.name}: filen är för stor (max ${formatMaxUploadSize()}).`);
        return false;
      }
      return true;
    });

  const runUploadBatch = async (filesToUpload) => {
    if (!filesToUpload.length) return;
    setUploading(true);
    setUploadProgress(0);
    const failed = [];
    let completed = 0;
    for (const file of filesToUpload) {
      try {
        const uploadInfo = await AdminService.createGalleryUpload(adminKey, file);

        const title = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim();

        const publicUrl =
          uploadInfo?.publicUrl || uploadInfo?.cdnUrl || uploadInfo?.assetUrl;
        await AdminService.createGalleryImage(adminKey, {
          categoryId: activeCategoryId,
          categoryIds: [activeCategoryId],
          title,
          alt: title,
          uploadId: uploadInfo?.uploadId || "",
          storageKey: uploadInfo?.storageKey || uploadInfo?.key,
          url: publicUrl,
          filename: uploadInfo?.filename || "",
          originalFilename: file.name,
          published: false,
        });
      } catch (err) {
        failed.push({ file, reason: err?.message || "Okänt fel" });
      } finally {
        completed += 1;
        setUploadProgress(Math.round((completed / filesToUpload.length) * 100));
      }
    }

    setFailedUploads(failed);
    setUploading(false);
    setUploadProgress(0);

    if (failed.length === 0) {
      success("Uppladdning klar.");
    } else if (failed.length < filesToUpload.length) {
      error(`${failed.length} av ${filesToUpload.length} filer misslyckades.`);
    } else {
      error("Uppladdningen misslyckades. Försök igen.");
    }

    await loadGallery();
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!activeCategoryId) {
      error("Välj en kategori innan uppladdning.");
      return;
    }
    if (!activeCategoryIsAssignable) {
      error("Välj en specifik kategori (inte Alla bilder) innan uppladdning.");
      event.target.value = "";
      return;
    }

    const validFiles = validateUploadFiles(files);
    if (validFiles.length === 0) {
      event.target.value = "";
      return;
    }

    setFailedUploads([]);
    try {
      await runUploadBatch(validFiles);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="admin-workspace admin-gallery">
      <div className="admin-section-card admin-panel admin-gallery-panel">
        <div className="admin-section-card-header admin-panel-header">
          <div>
            <p className="admin-workspace-kicker">Media</p>
            <h3>Galleriöversikt</h3>
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

        <div className="admin-gallery-overview">
          <div className="admin-gallery-overview-card">
            <span className="admin-gallery-overview-label">Kategorier</span>
            <strong>{galleryOverview.totalCategories}</strong>
          </div>
          <div className="admin-gallery-overview-card">
            <span className="admin-gallery-overview-label">Bilder totalt</span>
            <strong>{galleryOverview.totalImages}</strong>
          </div>
          <div className="admin-gallery-overview-card">
            <span className="admin-gallery-overview-label">Publicerade</span>
            <strong>{galleryOverview.publishedImages}</strong>
          </div>
          <div className="admin-gallery-overview-card">
            <span className="admin-gallery-overview-label">Vald kategori</span>
            <strong>{galleryOverview.activeCategoryName}</strong>
            <small>{galleryOverview.activeImageCount} bilder</small>
          </div>
        </div>

        <div className="admin-gallery-layout">
          <div className="admin-gallery-sidebar">
            <div className="admin-gallery-sidebar-header">
              <h3>Kategorier</h3>
              <button
                type="button"
                className="admin-btn-secondary admin-btn-sm"
                onClick={() => setShowCreateCategoryModal(true)}
              >
                + Ny kategori
              </button>
            </div>
            <div className="admin-gallery-category-picker" ref={categoryPickerRef}>
              <label className="admin-label" htmlFor="gallery-category-select">
                Välj kategori
              </label>
              <div className="admin-gallery-category-picker-row">
                <button
                  type="button"
                  className="admin-gallery-category-dropdown-trigger"
                  onClick={() =>
                    setIsCategoryMenuOpen((prev) =>
                      categories.length === 0 ? false : !prev
                    )
                  }
                  aria-expanded={isCategoryMenuOpen}
                  aria-haspopup="listbox"
                  disabled={categories.length === 0}
                >
                  <span className="admin-gallery-category-dropdown-name">
                    {activeCategory?.name || "Välj kategori"}
                  </span>
                  <span className="admin-gallery-category-dropdown-meta">
                    {activeCategory ? `${activeCategory.images?.length || 0} bilder` : ""}
                  </span>
                  <span className="admin-gallery-category-dropdown-caret" aria-hidden="true" />
                </button>
                {isCategoryMenuOpen && categories.length > 0 && (
                  <div className="admin-gallery-category-dropdown-menu" role="listbox">
                    {categories.map((category) => {
                      const isActive = category.id === activeCategoryId;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          className={`admin-gallery-category-option ${
                            isActive ? "active" : ""
                          }`}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => {
                            setActiveCategoryId(category.id);
                            setIsCategoryMenuOpen(false);
                          }}
                        >
                          <span className="admin-gallery-category-option-name">
                            {category.name}
                          </span>
                          <span className="admin-gallery-category-option-count">
                            {category.images?.length || 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <small className="admin-field-help">
                Välj kategori för att redigera namn, slug och ordning.
              </small>
            </div>

            {categories.length === 0 && !loading ? (
              <p className="admin-muted">Inga kategorier ännu.</p>
            ) : activeCategory ? (
              <div className="admin-gallery-category-card">
                <div className="admin-gallery-category-form">
                  <label className="admin-label">
                    Namn
                    <input
                      className="admin-input"
                      value={
                        categoryEdits[activeCategory.id]?.name ??
                        activeCategory.name ??
                        ""
                      }
                      onChange={(event) =>
                        handleEditCategoryChange(
                          activeCategory.id,
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
                      value={
                        categoryEdits[activeCategory.id]?.slug ??
                        activeCategory.slug ??
                        ""
                      }
                      onChange={(event) =>
                        handleEditCategoryChange(
                          activeCategory.id,
                          "slug",
                          event.target.value
                        )
                      }
                    />
                    <small className="admin-field-help">
                      Del av länken till kategorin, t.ex. /galleri/keramik.
                      Använd små bokstäver och bindestreck.
                    </small>
                  </label>
                  <label className="admin-label">
                    Ordning
                    <input
                      className="admin-input"
                      type="number"
                      value={
                        categoryEdits[activeCategory.id]?.order ??
                        (Number.isFinite(Number(activeCategory.order))
                          ? activeCategory.order
                          : "")
                      }
                      onChange={(event) =>
                        handleEditCategoryChange(
                          activeCategory.id,
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
                      onClick={() => handleSaveCategory(activeCategory)}
                      disabled={saving}
                    >
                      Spara
                    </button>
                    <button
                      type="button"
                      className="admin-btn-tertiary admin-btn-sm"
                      onClick={() => handleDeleteCategory(activeCategory.id)}
                      disabled={saving}
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="admin-gallery-content">
            <div className="admin-gallery-content-header">
              <h3>
                {activeCategory ? activeCategory.name : "Ingen kategori vald"}
              </h3>
              <p className="admin-muted">
                {galleryOverview.activeImageCount} bilder i vald kategori
                {galleryOverview.selectedImageCount > 0
                  ? ` • ${galleryOverview.selectedImageCount} markerade`
                  : ""}
                {!activeCategoryIsAssignable ? " • Ordning låst i Alla bilder" : ""}
              </p>
            </div>
            <div className="admin-gallery-upload">
              <div>
                <h3>Uppladdning</h3>
                <p className="admin-muted">
                  Ladda upp bilder till vald kategori. Bilder optimeras automatiskt till WebP (max 800x1063).
                </p>
              </div>
              <div className="admin-gallery-upload-actions">
                <label className="admin-upload-button">
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleUpload}
                    disabled={
                      uploading || !activeCategoryId || !activeCategoryIsAssignable
                    }
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
              {failedUploads.length > 0 && !uploading && (
                <div className="admin-gallery-upload-retry">
                  <p className="admin-muted">
                    Misslyckade ({failedUploads.length}):{" "}
                    {failedUploads.map((f) => f.file.name).join(", ")}
                  </p>
                  <button
                    type="button"
                    className="admin-btn-tertiary"
                    onClick={async () => {
                      const filesToRetry = failedUploads.map((f) => f.file);
                      setFailedUploads([]);
                      await runUploadBatch(filesToRetry);
                    }}
                  >
                    Försök igen
                  </button>
                </div>
              )}
            </div>

            <div className="admin-gallery-images">
              <h3>Bilder</h3>
              {sortedActiveImages.length === 0 && !loading && (
                <div className="admin-empty" style={{ margin: "2rem 0", padding: "3rem 1rem", backgroundColor: "#f9fafb", borderRadius: "12px", border: "2px dashed #e5e7eb" }}>
                  <h4 style={{ marginBottom: "0.5rem" }}>Kategorin är tom</h4>
                  <p className="admin-muted">Dra in filer här eller klicka på &quot;Välj bilder&quot; ovan för att börja ladda upp.</p>
                </div>
              )}
              {sortedActiveImages.length > 0 && (
                <div className="admin-gallery-image-toolbar">
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      disabled={selectableImageIds.length === 0}
                      checked={
                        selectableImageIds.length > 0 &&
                        selectedImageIds.size === selectableImageIds.length
                      }
                      onChange={handleToggleSelectAll}
                    />
                    Markera alla bilder
                  </label>
                  <div className="admin-gallery-bulk-actions">
                    <button
                      type="button"
                      className="admin-btn-primary admin-btn-sm"
                      onClick={handleSaveAllImageChanges}
                      disabled={saving || pendingImageChangesCount === 0}
                    >
                      Spara ordning
                    </button>
                    <button
                      type="button"
                      className="admin-btn-secondary admin-btn-sm"
                      onClick={() => handleBulkPublish(true)}
                      disabled={saving || selectedImageIds.size === 0}
                    >
                      Publicera markerade
                    </button>
                    <span className="admin-muted">
                      {selectedImageIds.size} valda
                    </span>
                    {pendingImageChangesCount > 0 && (
                      <span className="admin-gallery-unsaved">
                        {pendingImageChangesCount} ändring(ar) gjorda, spara
                      </span>
                    )}
                    {lastActionMessage && (
                      <span className="admin-gallery-feedback">
                        {lastActionMessage}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="admin-gallery-image-grid">
                {sortedActiveImages.map((image, index) => {
                  const imageId = image.id || image.filename || image.storageKey;
                  const edits = image.id ? imageEdits[image.id] || {} : {};
                  const titleValue =
                    edits.title ?? image.title ?? image.displayName ?? "";
                  const altValue =
                    edits.alt ?? image.alt ?? image.displayName ?? "";
                  const captionValue = edits.caption ?? image.caption ?? "";
                  const featuredValue =
                    edits.featured ?? image.featured ?? false;
                  const publishedValue =
                    edits.published ?? image.published ?? true;
                  const fallbackCategoryId =
                    (activeCategoryIsAssignable ? activeCategoryId : "") ||
                    assignableCategories[0]?.id ||
                    "";
                  const categoryIdsValue = Array.isArray(edits.categoryIds)
                    ? edits.categoryIds
                    : getImageCategoryIds(image, fallbackCategoryId);
                  const isSelected = image.id
                    ? selectedImageIds.has(image.id)
                    : false;
                  const isExpanded = image.id ? expandedImages.has(image.id) : true;

                  return (
                    <div
                      key={imageId}
                      className={`admin-gallery-image-card ${
                        isSelected ? "is-selected" : ""
                      } ${isExpanded ? "is-expanded" : "is-collapsed"}`}
                      draggable={Boolean(image.id && activeCategoryIsAssignable)}
                      onDragStart={() => {
                        if (!activeCategoryIsAssignable) return;
                        setDraggingId(image.id);
                      }}
                      onDragEnd={() => setDraggingId("")}
                      onDragOver={(event) => {
                        if (!activeCategoryIsAssignable) return;
                        event.preventDefault();
                      }}
                      onDrop={() => handleReorder(image.id)}
                    >
                      <div 
                        className="admin-gallery-image-preview"
                        onClick={() => image.id && toggleImageExpanded(image.id)}
                        role="button"
                        aria-expanded={isExpanded}
                        title="Klicka för att redigera uppgifter"
                      >
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
                            className={`admin-gallery-image-select ${
                              isSelected ? "is-selected" : ""
                            }`}
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
                            <span aria-hidden="true">
                              {isSelected ? "✓" : ""}
                            </span>
                          </button>
                        )}
                        <span className="admin-gallery-image-position">
                          {index + 1}
                        </span>
                        
                        {!isExpanded && (
                          <div className="admin-gallery-image-mobile-info">
                            <span className="admin-gallery-image-mobile-title">
                              {titleValue || "Namnlös bild"}
                            </span>
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="admin-gallery-image-form">
                        <div className="admin-gallery-image-form-header">
                          <h4>Redigera bild</h4>
                          <button 
                            type="button" 
                            className="admin-btn-tertiary admin-btn-sm mobile-only"
                            onClick={() => toggleImageExpanded(image.id)}
                          >
                            Stäng
                          </button>
                        </div>
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
                          <div className="admin-label">
                            Kategorier
                            <div className="admin-gallery-category-checklist">
                              {assignableCategories.map((category) => (
                                <label
                                  key={category.id}
                                  className="admin-checkbox admin-gallery-category-checkbox"
                                >
                                  <input
                                    type="checkbox"
                                    checked={categoryIdsValue.includes(category.id)}
                                    onChange={(event) =>
                                      handleImageCategoryToggle(
                                        image.id,
                                        category.id,
                                        event.target.checked,
                                        categoryIdsValue
                                      )
                                    }
                                    disabled={!image.id}
                                  />
                                  {category.name}
                                </label>
                              ))}
                            </div>
                          </div>
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
                            className="admin-btn-secondary admin-btn-sm admin-btn-move"
                            onClick={() => handleMoveImage(image.id, -1)}
                            disabled={
                              saving ||
                              !image.id ||
                              index === 0 ||
                              !activeCategoryIsAssignable
                            }
                          >
                            Flytta upp
                          </button>
                          <button
                            type="button"
                            className="admin-btn-secondary admin-btn-sm admin-btn-move"
                            onClick={() => handleMoveImage(image.id, 1)}
                            disabled={
                              saving ||
                              !image.id ||
                              index === sortedActiveImages.length - 1 ||
                              !activeCategoryIsAssignable
                            }
                          >
                            Flytta ner
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
      {showCreateCategoryModal && (
        <div
          className="admin-gallery-modal-backdrop"
          role="presentation"
          onClick={() => {
            if (!saving) setShowCreateCategoryModal(false);
          }}
        >
          <div
            className="admin-gallery-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-gallery-create-category-title"
            onClick={(event) => event.stopPropagation()}
          >
            <form className="admin-gallery-create" onSubmit={handleCreateCategory}>
              <div className="admin-gallery-modal-header">
                <h4 id="admin-gallery-create-category-title">Ny kategori</h4>
                <button
                  type="button"
                  className="admin-btn-tertiary admin-btn-sm"
                  onClick={() => setShowCreateCategoryModal(false)}
                  disabled={saving}
                >
                  Stäng
                </button>
              </div>
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
                <small className="admin-field-help">
                  Del av länken till kategorin, t.ex. /galleri/keramik. Använd
                  små bokstäver och bindestreck.
                </small>
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
        </div>
      )}
    </div>
  );
}

AdminGallery.propTypes = {
  adminKey: PropTypes.string.isRequired,
};

export default AdminGallery;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AdminService } from "../../../services/adminService";
import { useToast } from "../../../contexts/ToastContext";
import { MAX_UPLOAD_BYTES } from "../adminConstants";
import { normalizeGalleryData } from "../../../features/gallery/normalizeGalleryData";
import {
  ArrowDown,
  ArrowUp,
  FolderPlus,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
} from "lucide-react";
import {
  AdminActionRail,
  AdminDrawer,
  AdminDrawerSection,
  AdminState,
} from "./ui/AdminUI";

const CREATE_CATEGORY_FORM_ID = "admin-gallery-create-category-form";
const IMAGE_FORM_ID = "admin-gallery-image-form";
const GALLERY_PUBLIC_PATH = "/galleri";

const IMAGE_FILTER_ALL = "all";
const IMAGE_FILTER_PUBLISHED = "published";
const IMAGE_FILTER_UNPUBLISHED = "unpublished";
const IMAGE_FILTER_MISSING_ALT = "missing-alt";

const UPLOAD_STATUS_PENDING = "pending";
const UPLOAD_STATUS_UPLOADING = "uploading";
const UPLOAD_STATUS_DONE = "done";
const UPLOAD_STATUS_FAILED = "failed";

const UPLOAD_STATUS_LABELS = {
  [UPLOAD_STATUS_PENDING]: "Väntar",
  [UPLOAD_STATUS_UPLOADING]: "Laddar upp",
  [UPLOAD_STATUS_DONE]: "Klar",
  [UPLOAD_STATUS_FAILED]: "Misslyckades",
};

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
    normalizedId === "all" ||
    normalizedId === "alla"
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
  const [loadError, setLoadError] = useState("");
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
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState("");
  const [editingImageId, setEditingImageId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(IMAGE_FILTER_ALL);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isDropActive, setIsDropActive] = useState(false);
  const feedbackTimerRef = useRef(null);
  const categoryPickerRef = useRef(null);
  // Anchor for shift-click range selection.
  const lastSelectedIdRef = useRef("");

  const previewCategorySlug =
    categoryForm.slug.trim() || slugify(categoryForm.name) || "kategori";
  const isCategoryFormDirty = Boolean(
    categoryForm.name.trim() || categoryForm.slug.trim() || categoryForm.order.trim()
  );


  const categories = useMemo(() => {
    const raw = galleryData?.categories
      ? normalizeGalleryData(galleryData).categories
      : [];
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

  /* "Alla bilder" is a real membership category so it can carry its own
     sort_order per image. Every image stays a member of it, which is why it is
     hidden from the category checklist rather than being editable there. */
  const allImagesCategoryId = useMemo(
    () => categories.find(isAllImagesCategory)?.id || "",
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

  const getImageValue = useCallback(
    (image, field) => {
      const edits = image?.id ? imageEdits[image.id] : undefined;
      if (edits && field in edits) return edits[field];
      return image?.[field];
    },
    [imageEdits]
  );

  const isFiltering = Boolean(
    searchQuery.trim() || statusFilter !== IMAGE_FILTER_ALL
  );

  const visibleImages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sortedActiveImages.filter((image) => {
      if (query) {
        const haystack = [
          getImageValue(image, "title"),
          getImageValue(image, "alt"),
          getImageValue(image, "caption"),
          image.displayName,
          image.filename,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      const published = getImageValue(image, "published") !== false;
      const alt = String(getImageValue(image, "alt") || "").trim();
      const title = String(getImageValue(image, "title") || "").trim();

      if (statusFilter === IMAGE_FILTER_PUBLISHED) return published;
      if (statusFilter === IMAGE_FILTER_UNPUBLISHED) return !published;
      if (statusFilter === IMAGE_FILTER_MISSING_ALT) {
        // An alt that merely repeats the title is not a real description.
        return !alt || alt.toLowerCase() === title.toLowerCase();
      }
      return true;
    });
  }, [getImageValue, searchQuery, sortedActiveImages, statusFilter]);

  const missingAltCount = useMemo(
    () =>
      sortedActiveImages.filter((image) => {
        const alt = String(getImageValue(image, "alt") || "").trim();
        const title = String(getImageValue(image, "title") || "").trim();
        return !alt || alt.toLowerCase() === title.toLowerCase();
      }).length,
    [getImageValue, sortedActiveImages]
  );

  const publishedActiveCount = useMemo(
    () =>
      sortedActiveImages.filter(
        (image) => getImageValue(image, "published") !== false
      ).length,
    [getImageValue, sortedActiveImages]
  );

  const selectableImageIds = useMemo(
    () => visibleImages.map((image) => image.id).filter(Boolean),
    [visibleImages]
  );

  /* The same image appears once per category it belongs to, each copy carrying
     that category's `order`. The active category wins so edits and saves read the
     order of the sequence the user is actually looking at. */
  const imagesById = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      if (category.id === activeCategoryId) return;
      (category.images || []).forEach((image) => {
        if (image?.id) {
          map.set(image.id, image);
        }
      });
    });
    (activeCategory?.images || []).forEach((image) => {
      if (image?.id) {
        map.set(image.id, image);
      }
    });
    return map;
  }, [activeCategory, activeCategoryId, categories]);

  const editingImage = editingImageId ? imagesById.get(editingImageId) : null;
  const editingImageIndex = editingImageId
    ? sortedActiveImages.findIndex((image) => image.id === editingImageId)
    : -1;
  const editingImageDirty = Boolean(
    editingImageId &&
      imageEdits[editingImageId] &&
      Object.keys(imageEdits[editingImageId]).length > 0
  );

  const editingEdits = editingImageId ? imageEdits[editingImageId] || {} : {};
  const editingValues = editingImage
    ? {
        title: editingEdits.title ?? editingImage.title ?? editingImage.displayName ?? "",
        alt: editingEdits.alt ?? editingImage.alt ?? editingImage.displayName ?? "",
        caption: editingEdits.caption ?? editingImage.caption ?? "",
        featured: editingEdits.featured ?? editingImage.featured ?? false,
        published: editingEdits.published ?? editingImage.published ?? true,
        categoryIds: Array.isArray(editingEdits.categoryIds)
          ? editingEdits.categoryIds
          : getImageCategoryIds(
              editingImage,
              (activeCategoryIsAssignable ? activeCategoryId : "") ||
                assignableCategories[0]?.id ||
                ""
            ),
      }
    : null;

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
    const aggregateCategory = categories.find(isAllImagesCategory);
    const overviewImages =
      aggregateCategory?.images ||
      categories.flatMap((category) => category.images || []);
    const totalImages = overviewImages.length;
    const publishedImages = overviewImages.filter(
      (image) => image.published !== false
    ).length;
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
    setLoadError("");
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
      const message = err?.message || "Kunde inte hämta galleri.";
      setLoadError(message);
      error(message);
    } finally {
      setLoading(false);
    }
  }, [adminKey, error]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    setSelectedImageIds(new Set());
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
      setIsCreateCategoryOpen(false);
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

  const buildImageUpdate = useCallback(
    (imageId, edits) => {
        const image = imagesById.get(imageId);
        if (!image) return null;
        const ownCategoryIds = Array.isArray(edits.categoryIds)
          ? edits.categoryIds
          : getImageCategoryIds(image);
        /* The fallback only rescues an image with no membership at all. Applying
           it unconditionally added a bogus membership in the first category
           whenever the user stood in Alla bilder (which is not assignable). */
        const candidateCategoryIds = ownCategoryIds.some((id) =>
          assignableCategories.some((category) => category.id === id)
        )
          ? ownCategoryIds
          : [
              ...ownCategoryIds,
              assignableCategories.find(
                (category) => category.id === activeCategoryId
              )?.id || assignableCategories[0]?.id || "",
            ].filter(Boolean);
        const assignedCategoryIds = candidateCategoryIds.filter((id) =>
          assignableCategories.some((category) => category.id === id)
        );
        if (assignedCategoryIds.length === 0) return null;
        /* Keep the "Alla bilder" membership: it is not in the checklist, so
           filtering on assignable categories alone would drop it on every save
           and the curated order in that view would be lost. */
        const validCategoryIds =
          allImagesCategoryId && !assignedCategoryIds.includes(allImagesCategoryId)
            ? [...assignedCategoryIds, allImagesCategoryId]
            : assignedCategoryIds;
        const baseCategoryOrders = getImageCategoryOrders(image);
        const persistedCategoryOrders = validCategoryIds.reduce((acc, id) => {
          if (Number.isFinite(Number(baseCategoryOrders[id]))) {
            acc[id] = Number(baseCategoryOrders[id]);
          }
          return acc;
        }, {});
        /* Falls back to the stored order of the category being viewed, never to
           `image.order` alone — that value belongs to whichever category the copy
           in hand came from, and writing it into another category's sequence
           would scramble it. */
        const activeStoredOrder = Number.isFinite(
          Number(baseCategoryOrders[activeCategoryId])
        )
          ? Number(baseCategoryOrders[activeCategoryId])
          : undefined;
        const effectiveOrder = Number.isFinite(Number(edits.order))
          ? Number(edits.order)
          : activeStoredOrder !== undefined
            ? activeStoredOrder
            : Number.isFinite(Number(image.order))
              ? Number(image.order)
              : 0;
        // Reordering writes to the category being viewed — including Alla bilder,
        // whose sequence is independent of the specific categories.
        if (activeCategoryId && validCategoryIds.includes(activeCategoryId)) {
          persistedCategoryOrders[activeCategoryId] = effectiveOrder;
        }
        // The primary category is never "Alla bilder": it drives `categoryId`
        // and primary_flag in the join table.
        const primaryCategoryId = assignedCategoryIds[0];
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
    },
    [activeCategoryId, allImagesCategoryId, assignableCategories, imagesById]
  );

  const handleSaveAllImageChanges = async () => {
    if (pendingImageChangesCount === 0) {
      info("Inga bildändringar att spara.");
      return;
    }

    const updates = Object.entries(imageEdits)
      .map(([imageId, edits]) => buildImageUpdate(imageId, edits))
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

  /** Saves a single image from the editor drawer, leaving other staged edits alone. */
  const handleSaveImage = async (imageId) => {
    const edits = imageEdits[imageId];
    if (!edits || Object.keys(edits).length === 0) {
      info("Inga ändringar att spara.");
      return;
    }
    const update = buildImageUpdate(imageId, edits);
    if (!update) {
      error("Bilden måste tillhöra minst en kategori.");
      return;
    }

    setSaving(true);
    try {
      await applyImageUpdates([update]);
      setImageEdits((prev) => {
        const next = { ...prev };
        delete next[imageId];
        return next;
      });
      success("Bilden sparad.");
      showActionFeedback("Sparade bilden");
      setEditingImageId("");
      await loadGallery();
    } catch (err) {
      error(err?.message || "Kunde inte spara bilden.");
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

  const handleToggleImageSelect = (imageId, extendRange = false) => {
    const anchorId = lastSelectedIdRef.current;
    lastSelectedIdRef.current = imageId;

    if (extendRange && anchorId && anchorId !== imageId) {
      const from = selectableImageIds.indexOf(anchorId);
      const to = selectableImageIds.indexOf(imageId);
      if (from !== -1 && to !== -1) {
        const [start, end] = from < to ? [from, to] : [to, from];
        setSelectedImageIds((prev) => {
          const next = new Set(prev);
          selectableImageIds.slice(start, end + 1).forEach((id) => next.add(id));
          return next;
        });
        return;
      }
    }

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

  const handleMoveImage = (imageId, direction) => {
    const currentIndex = sortedActiveImages.findIndex((image) => image.id === imageId);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= sortedActiveImages.length) return;
    const reordered = [...sortedActiveImages];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, moved);
    stageOrderForImages(reordered);
    success(direction < 0 ? "Bild flyttad upp." : "Bild flyttad ner.");
    showActionFeedback(direction < 0 ? "Flyttade bild upp, spara ändringar" : "Flyttade bild ner, spara ändringar");
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
    // The queue is keyed by position so identically named files stay distinct.
    setUploadQueue(
      filesToUpload.map((file, index) => ({
        key: `${index}-${file.name}`,
        name: file.name,
        size: file.size,
        status: UPLOAD_STATUS_PENDING,
        reason: "",
      }))
    );
    const setQueueStatus = (index, status, reason = "") => {
      setUploadQueue((prev) =>
        prev.map((item, itemIndex) =>
          itemIndex === index ? { ...item, status, reason } : item
        )
      );
    };
    const failed = [];
    let completed = 0;
    for (const [fileIndex, file] of filesToUpload.entries()) {
      setQueueStatus(fileIndex, UPLOAD_STATUS_UPLOADING);
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
          // Also a member of Alla bilder so that view carries its own order.
          categoryIds: allImagesCategoryId
            ? [activeCategoryId, allImagesCategoryId]
            : [activeCategoryId],
          title,
          alt: title,
          uploadId: uploadInfo?.uploadId || "",
          storageKey: uploadInfo?.storageKey || uploadInfo?.key,
          url: publicUrl,
          filename: uploadInfo?.filename || "",
          originalFilename: file.name,
          published: false,
        });
        setQueueStatus(fileIndex, UPLOAD_STATUS_DONE);
      } catch (err) {
        const reason = err?.message || "Okänt fel";
        failed.push({ file, reason });
        setQueueStatus(fileIndex, UPLOAD_STATUS_FAILED, reason);
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

  /** Shared entry point for the file input, drag-and-drop and paste. */
  const startUpload = async (files) => {
    if (!files.length) return;
    if (!activeCategoryId) {
      error("Välj en kategori innan uppladdning.");
      return;
    }
    if (!activeCategoryIsAssignable) {
      error("Välj en specifik kategori (inte Alla bilder) innan uppladdning.");
      return;
    }

    const validFiles = validateUploadFiles(files);
    if (validFiles.length === 0) return;

    setFailedUploads([]);
    await runUploadBatch(validFiles);
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    try {
      await startUpload(files);
    } finally {
      event.target.value = "";
    }
  };

  const handleDropZoneDragOver = (event) => {
    if (!activeCategoryIsAssignable || uploading) return;
    event.preventDefault();
    setIsDropActive(true);
  };

  const handleDropZoneDragLeave = (event) => {
    // Only clear when the pointer actually left the zone, not a child element.
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsDropActive(false);
  };

  const handleDropZoneDrop = async (event) => {
    if (!activeCategoryIsAssignable || uploading) return;
    event.preventDefault();
    setIsDropActive(false);
    await startUpload(Array.from(event.dataTransfer?.files || []));
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

        {loadError && (
          <AdminState
            type="error"
            title="Galleriet kunde inte hämtas"
            message={loadError}
            action={
              <button type="button" className="admin-btn-secondary" onClick={loadGallery}>
                Försök igen
              </button>
            }
          />
        )}

        {/* The stat cards double as filters: the numbers were the natural thing to
            click, so they now actually narrow the grid below instead of being inert. */}
        <div className="admin-gallery-overview">
          <div className="admin-gallery-overview-card">
            <span className="admin-gallery-overview-label">Kategorier</span>
            <strong>{galleryOverview.totalCategories}</strong>
          </div>
          <button
            type="button"
            className={`admin-gallery-overview-card is-filter ${
              statusFilter === IMAGE_FILTER_ALL ? "is-active" : ""
            }`}
            onClick={() => setStatusFilter(IMAGE_FILTER_ALL)}
            aria-pressed={statusFilter === IMAGE_FILTER_ALL}
          >
            <span className="admin-gallery-overview-label">I kategorin</span>
            <strong>{galleryOverview.activeImageCount}</strong>
            <small>Visa alla</small>
          </button>
          <button
            type="button"
            className={`admin-gallery-overview-card is-filter ${
              statusFilter === IMAGE_FILTER_PUBLISHED ? "is-active" : ""
            }`}
            onClick={() => setStatusFilter(IMAGE_FILTER_PUBLISHED)}
            aria-pressed={statusFilter === IMAGE_FILTER_PUBLISHED}
          >
            <span className="admin-gallery-overview-label">Publicerade</span>
            <strong>{publishedActiveCount}</strong>
            <small>Syns på {GALLERY_PUBLIC_PATH}</small>
          </button>
          <button
            type="button"
            className={`admin-gallery-overview-card is-filter ${
              statusFilter === IMAGE_FILTER_UNPUBLISHED ? "is-active" : ""
            }`}
            onClick={() => setStatusFilter(IMAGE_FILTER_UNPUBLISHED)}
            aria-pressed={statusFilter === IMAGE_FILTER_UNPUBLISHED}
          >
            <span className="admin-gallery-overview-label">Opublicerade</span>
            <strong>{galleryOverview.activeImageCount - publishedActiveCount}</strong>
            <small>Utkast</small>
          </button>
          <button
            type="button"
            className={`admin-gallery-overview-card is-filter ${
              statusFilter === IMAGE_FILTER_MISSING_ALT ? "is-active" : ""
            } ${missingAltCount > 0 ? "is-warning" : ""}`}
            onClick={() => setStatusFilter(IMAGE_FILTER_MISSING_ALT)}
            aria-pressed={statusFilter === IMAGE_FILTER_MISSING_ALT}
          >
            <span className="admin-gallery-overview-label">Saknar alt-text</span>
            <strong>{missingAltCount}</strong>
            <small>Behövs för tillgänglighet</small>
          </button>
        </div>

        <div className="admin-gallery-layout">
          <div className="admin-gallery-sidebar">
            <div className="admin-gallery-sidebar-header">
              <h3>Kategorier</h3>
              <button
                type="button"
                className="admin-btn-secondary admin-btn-sm"
                onClick={() => setIsCreateCategoryOpen(true)}
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
                Välj kategori för att visa och ordna dess bilder.
              </small>
            </div>

            {categories.length === 0 && !loading ? (
              <AdminState
                title="Inga kategorier ännu"
                message="Skapa den första kategorin för att börja ladda upp bilder."
              />
            ) : activeCategory ? (
              <>
                <button
                  type="button"
                  className="admin-btn-secondary admin-btn-block"
                  onClick={() => setShowCategorySettings(true)}
                  disabled={!activeCategoryIsAssignable}
                >
                  Kategoriinställningar
                </button>
              <AdminDrawer
                open={showCategorySettings}
                title={`Inställningar · ${activeCategory.name}`}
                description="Ändra namn, webbadress och sorteringsordning."
                onClose={() => setShowCategorySettings(false)}
              >
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
                      className="admin-btn-danger admin-btn-sm"
                      onClick={() => handleDeleteCategory(activeCategory.id)}
                      disabled={saving}
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              </div>
              </AdminDrawer>
              </>
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
                {isFiltering ? " • Ordning låst medan filter är aktivt" : ""}
              </p>
            </div>
            {activeCategoryIsAssignable ? (
            <div
              className={`admin-gallery-upload ${
                isDropActive ? "is-drop-active" : ""
              }`}
              onDragOver={handleDropZoneDragOver}
              onDragLeave={handleDropZoneDragLeave}
              onDrop={handleDropZoneDrop}
            >
              <div>
                <h3>Uppladdning</h3>
                <p className="admin-muted">
                  Dra och släpp bilder här, eller välj filer. Bilder optimeras
                  automatiskt till WebP (max 800x1063).
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
              {isDropActive && (
                <p className="admin-gallery-upload-drop-hint">
                  Släpp filerna för att ladda upp till {activeCategory?.name}
                </p>
              )}
              {uploadQueue.length > 0 && (
                <ul className="admin-gallery-upload-queue">
                  {uploadQueue.map((item) => (
                    <li
                      key={item.key}
                      className={`admin-gallery-upload-queue-item is-${item.status}`}
                    >
                      <span className="admin-gallery-upload-queue-name">
                        {item.name}
                      </span>
                      <span className="admin-gallery-upload-queue-status">
                        {UPLOAD_STATUS_LABELS[item.status]}
                        {item.reason ? `: ${item.reason}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
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
            ) : (
              <AdminState
                title="Uppladdning sker i en kategori"
                message="Välj en specifik kategori för att ladda upp. Ordningen här i Alla bilder kan du ändra direkt."
              />
            )}

            <div className="admin-gallery-images">
              <h3>Bilder</h3>
              {sortedActiveImages.length === 0 && !loading && (
                <AdminState
                  title="Kategorin är tom"
                  message="Välj bilder ovan för att ladda upp de första filerna."
                />
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
                    Markera alla
                    {isFiltering ? " (filtrerade)" : ""}
                  </label>
                  <div className="admin-gallery-image-search">
                    <Search size={16} aria-hidden="true" />
                    <input
                      type="search"
                      className="admin-input"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Sök titel, alt-text eller filnamn"
                      aria-label="Sök bilder"
                    />
                  </div>
                  <div className="admin-gallery-bulk-actions">
                    {isFiltering && (
                      <button
                        type="button"
                        className="admin-btn-tertiary admin-btn-sm"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter(IMAGE_FILTER_ALL);
                        }}
                      >
                        Rensa filter
                      </button>
                    )}
                    {pendingImageChangesCount > 0 && (
                      <span className="admin-gallery-unsaved">
                        {pendingImageChangesCount} osparade ändringar
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
              {sortedActiveImages.length > 0 && visibleImages.length === 0 && (
                <AdminState
                  title="Inga bilder matchar filtret"
                  message="Ändra sökningen eller välj ett annat filter ovan."
                  action={
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter(IMAGE_FILTER_ALL);
                      }}
                    >
                      Rensa filter
                    </button>
                  }
                />
              )}
              <AdminActionRail
                selectionLabel={
                  pendingImageChangesCount > 0
                    ? `${pendingImageChangesCount} osparade ändringar`
                    : selectedImageIds.size > 0
                      ? `${selectedImageIds.size} bilder valda`
                      : ""
                }
              >
                {pendingImageChangesCount > 0 && (
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={handleSaveAllImageChanges}
                    disabled={saving}
                  >
                    Spara ändringar
                  </button>
                )}
                {selectedImageIds.size > 0 && (
                  <>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => handleBulkPublish(true)}
                  disabled={saving}
                >
                  Publicera
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => handleBulkPublish(false)}
                  disabled={saving}
                >
                  Avpublicera
                </button>
                  </>
                )}
              </AdminActionRail>
              <div className="admin-gallery-image-grid">
                {visibleImages.map((image) => {
                  const imageId = image.id || image.filename || image.storageKey;
                  const edits = image.id ? imageEdits[image.id] || {} : {};
                  const titleValue =
                    edits.title ?? image.title ?? image.displayName ?? "";
                  const publishedValue =
                    edits.published ?? image.published ?? true;
                  const isSelected = image.id
                    ? selectedImageIds.has(image.id)
                    : false;
                  const hasPendingEdits = Object.keys(edits).length > 0;
                  // Position and move bounds always come from the unfiltered order —
                  // reordering a filtered subset would scramble the real sequence.
                  const orderIndex = sortedActiveImages.findIndex(
                    (candidate) => candidate === image
                  );
                  // Every category has its own sequence, Alla bilder included.
                  // Only an active filter blocks reordering: moving inside a
                  // subset would rewrite positions relative to hidden images.
                  const canReorder = !isFiltering && Boolean(image.id);

                  return (
                    <div
                      key={imageId}
                      className={`admin-gallery-image-card ${
                        isSelected ? "is-selected" : ""
                      }`}
                      draggable={canReorder}
                      onDragStart={() => {
                        if (!canReorder) return;
                        setDraggingId(image.id);
                      }}
                      onDragEnd={() => setDraggingId("")}
                      onDragOver={(event) => {
                        if (!canReorder) return;
                        event.preventDefault();
                      }}
                      onDrop={() => {
                        if (!canReorder) return;
                        handleReorder(image.id);
                      }}
                    >
                      <button
                        type="button"
                        className="admin-gallery-image-preview"
                        onClick={() => image.id && setEditingImageId(image.id)}
                        disabled={!image.id}
                        title="Redigera bild"
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
                        <span className="admin-gallery-image-position">
                          {orderIndex + 1}
                        </span>
                      </button>
                      {image.id && (
                        <button
                          type="button"
                          className={`admin-gallery-image-select ${
                            isSelected ? "is-selected" : ""
                          }`}
                          onClick={(event) =>
                            handleToggleImageSelect(image.id, event.shiftKey)
                          }
                          aria-pressed={isSelected}
                          aria-label={
                            isSelected ? "Avmarkera bild" : "Markera bild"
                          }
                          title="Shift-klicka för att markera ett intervall"
                        >
                          <span aria-hidden="true">{isSelected ? "✓" : ""}</span>
                        </button>
                      )}

                      <div className="admin-gallery-image-meta">
                        <span className="admin-gallery-image-meta-title">
                          {titleValue || "Namnlös bild"}
                        </span>
                        <span className="admin-gallery-image-meta-tags">
                          <span
                            className={`admin-gallery-image-status ${
                              publishedValue ? "is-published" : "is-draft"
                            }`}
                          >
                            {publishedValue ? "Publicerad" : "Utkast"}
                          </span>
                          {hasPendingEdits && (
                            <span className="admin-gallery-image-status is-pending">
                              Osparad
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Move buttons live on the card, not in the editor: reordering is
                          a list-level task and drag-and-drop does not work on touch. */}
                      <div className="admin-gallery-image-move">
                        <button
                          type="button"
                          className="admin-btn-secondary admin-btn-move"
                          onClick={() => handleMoveImage(image.id, -1)}
                          disabled={saving || !canReorder || orderIndex === 0}
                          aria-label="Flytta upp"
                        >
                          <ArrowUp size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="admin-btn-secondary admin-btn-move"
                          onClick={() => handleMoveImage(image.id, 1)}
                          disabled={
                            saving ||
                            !canReorder ||
                            orderIndex === sortedActiveImages.length - 1
                          }
                          aria-label="Flytta ner"
                        >
                          <ArrowDown size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="admin-btn-tertiary admin-btn-sm"
                          onClick={() => image.id && setEditingImageId(image.id)}
                          disabled={!image.id}
                        >
                          Redigera
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AdminDrawer
        open={Boolean(editingImage)}
        size="wide"
        title={editingValues?.title || "Namnlös bild"}
        description="Redigera bildens uppgifter, kategorier och publicering."
        icon={<ImageIcon size={20} aria-hidden="true" />}
        isDirty={editingImageDirty}
        onClose={() => {
          if (saving) return;
          setEditingImageId("");
        }}
        preview={
          editingImage ? (
            <div className="admin-gallery-image-preview-pane">
              {getImageSrc(editingImage) ? (
                <img
                  src={getImageSrc(editingImage)}
                  alt={editingValues.alt || getImageLabel(editingImage)}
                />
              ) : (
                <div className="admin-gallery-image-placeholder">Ingen bild</div>
              )}
              <p className="admin-gallery-image-preview-caption">
                {editingValues.caption || "Ingen bildtext"}
              </p>
              <dl className="admin-gallery-category-preview-meta">
                <div>
                  <dt>Status</dt>
                  <dd>
                    {editingValues.published
                      ? `Publicerad på ${GALLERY_PUBLIC_PATH}`
                      : "Utkast, syns inte publikt"}
                  </dd>
                </div>
                <div>
                  <dt>Position</dt>
                  <dd>
                    {editingImageIndex >= 0
                      ? `${editingImageIndex + 1} av ${sortedActiveImages.length}`
                      : "Okänd"}
                  </dd>
                </div>
                <div>
                  <dt>Alt-text</dt>
                  {/* Mirrors the "saknar alt-text" filter: an alt that only repeats
                      the title describes nothing, so it counts as missing. */}
                  <dd>
                    {!editingValues.alt.trim()
                      ? "Saknas"
                      : editingValues.alt.trim().toLowerCase() ===
                          editingValues.title.trim().toLowerCase()
                        ? "Samma som titeln — beskriv bilden i stället"
                        : editingValues.alt}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null
        }
        footer={
          <>
            <button
              type="submit"
              form={IMAGE_FORM_ID}
              className="admin-btn-primary"
              disabled={saving || !editingImageDirty}
            >
              {saving ? "Sparar..." : "Spara bild"}
            </button>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setEditingImageId("")}
              disabled={saving}
            >
              Avbryt
            </button>
            <button
              type="button"
              className="admin-btn-danger"
              onClick={async () => {
                const id = editingImageId;
                setEditingImageId("");
                await handleDeleteImage(id);
              }}
              disabled={saving}
            >
              Ta bort
            </button>
          </>
        }
      >
        {editingImage && (
          <form
            id={IMAGE_FORM_ID}
            className="admin-drawer-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSaveImage(editingImageId);
            }}
          >
            <AdminDrawerSection title="Bildinfo" defaultOpen>
              <label className="admin-label">
                Titel
                <input
                  className="admin-input"
                  value={editingValues.title}
                  onChange={(event) =>
                    handleImageEditChange(
                      editingImageId,
                      "title",
                      event.target.value
                    )
                  }
                />
              </label>
              <label className="admin-label">
                Alternativtext
                <input
                  className="admin-input"
                  value={editingValues.alt}
                  onChange={(event) =>
                    handleImageEditChange(editingImageId, "alt", event.target.value)
                  }
                />
                <small className="admin-field-help">
                  Beskriv vad bilden visar. Läses upp av skärmläsare och används
                  när bilden inte kan visas.
                </small>
              </label>
              <label className="admin-label">
                Bildtext
                <input
                  className="admin-input"
                  value={editingValues.caption}
                  onChange={(event) =>
                    handleImageEditChange(
                      editingImageId,
                      "caption",
                      event.target.value
                    )
                  }
                />
              </label>
            </AdminDrawerSection>

            <AdminDrawerSection
              title="Kategorier"
              summary={`${
                editingValues.categoryIds.filter((id) =>
                  assignableCategories.some((category) => category.id === id)
                ).length
              } valda`}
            >
              <div className="admin-gallery-category-checklist">
                {assignableCategories.map((category) => (
                  <label
                    key={category.id}
                    className="admin-checkbox admin-gallery-category-checkbox"
                  >
                    <input
                      type="checkbox"
                      checked={editingValues.categoryIds.includes(category.id)}
                      onChange={(event) =>
                        handleImageCategoryToggle(
                          editingImageId,
                          category.id,
                          event.target.checked,
                          editingValues.categoryIds
                        )
                      }
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </AdminDrawerSection>

            <AdminDrawerSection
              title="Publicering"
              summary={`${
                editingValues.published ? "Publicerad" : "Utkast"
              }${editingValues.featured ? " · Utvald" : ""}`}
            >
              <div className="admin-gallery-image-toggles">
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={editingValues.published}
                    onChange={(event) =>
                      handleImageEditChange(
                        editingImageId,
                        "published",
                        event.target.checked
                      )
                    }
                  />
                  Publicerad
                </label>
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={editingValues.featured}
                    onChange={(event) =>
                      handleImageEditChange(
                        editingImageId,
                        "featured",
                        event.target.checked
                      )
                    }
                  />
                  Utvald
                </label>
              </div>
            </AdminDrawerSection>

            <AdminDrawerSection
              title="Ordning"
              summary={
                editingImageIndex >= 0
                  ? `Position ${editingImageIndex + 1} av ${sortedActiveImages.length}`
                  : "Okänd"
              }
            >
              <p className="admin-muted">
                Positionen gäller i {activeCategory?.name || "vald kategori"}.
                Varje kategori har en egen ordning.
              </p>
              {isFiltering ? (
                <p className="admin-muted">
                  Rensa filtret för att kunna flytta bilden.
                </p>
              ) : (
                <div className="admin-gallery-image-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary admin-btn-sm"
                    onClick={() => handleMoveImage(editingImageId, -1)}
                    disabled={saving || editingImageIndex <= 0}
                  >
                    Flytta upp
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secondary admin-btn-sm"
                    onClick={() => handleMoveImage(editingImageId, 1)}
                    disabled={
                      saving ||
                      editingImageIndex < 0 ||
                      editingImageIndex === sortedActiveImages.length - 1
                    }
                  >
                    Flytta ner
                  </button>
                </div>
              )}
            </AdminDrawerSection>
          </form>
        )}
      </AdminDrawer>
      <AdminDrawer
        open={isCreateCategoryOpen}
        size="wide"
        title="Ny kategori"
        description="Kategorin blir en egen sida i galleriet."
        icon={<FolderPlus size={20} aria-hidden="true" />}
        isDirty={isCategoryFormDirty}
        onClose={() => {
          if (saving) return;
          setCategoryForm({ name: "", slug: "", order: "" });
          setIsCreateCategoryOpen(false);
        }}
        preview={
          <div className="admin-gallery-category-preview">
            <p className="admin-gallery-category-preview-name">
              {categoryForm.name.trim() || "Namnlös kategori"}
            </p>
            <p className="admin-gallery-category-preview-url">
              <LinkIcon size={14} aria-hidden="true" />
              {`${GALLERY_PUBLIC_PATH}/${previewCategorySlug}`}
            </p>
            <dl className="admin-gallery-category-preview-meta">
              <div>
                <dt>Ordning</dt>
                <dd>
                  {categoryForm.order.trim()
                    ? `Position ${categoryForm.order.trim()}`
                    : "Läggs sist"}
                </dd>
              </div>
              <div>
                <dt>Bilder</dt>
                <dd>Inga ännu — ladda upp efter att kategorin skapats</dd>
              </div>
            </dl>
          </div>
        }
        footer={
          <>
            <button
              type="submit"
              form={CREATE_CATEGORY_FORM_ID}
              className="admin-btn-primary"
              disabled={saving}
            >
              {saving ? "Skapar..." : "Skapa kategori"}
            </button>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => {
                setCategoryForm({ name: "", slug: "", order: "" });
                setIsCreateCategoryOpen(false);
              }}
              disabled={saving}
            >
              Avbryt
            </button>
          </>
        }
      >
        <form
          id={CREATE_CATEGORY_FORM_ID}
          className="admin-drawer-form"
          onSubmit={handleCreateCategory}
        >
          <AdminDrawerSection title="Kategori" defaultOpen>
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
                placeholder={slugify(categoryForm.name) || "keramik"}
              />
              <small className="admin-field-help">
                Del av länken till kategorin, t.ex. {GALLERY_PUBLIC_PATH}/keramik.
                Lämna tom för att skapa den från namnet.
              </small>
            </label>
          </AdminDrawerSection>

          <AdminDrawerSection
            title="Sortering"
            summary={
              categoryForm.order.trim()
                ? `Position ${categoryForm.order.trim()}`
                : "Läggs sist"
            }
          >
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
              <small className="admin-field-help">
                Lägre nummer visas först. Lämna tom för att lägga kategorin sist.
              </small>
            </label>
          </AdminDrawerSection>
        </form>
      </AdminDrawer>
    </div>
  );
}

AdminGallery.propTypes = {
  adminKey: PropTypes.string.isRequired,
};

export default AdminGallery;

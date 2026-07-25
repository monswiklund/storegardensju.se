import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AdminService } from "../../../services/adminService";
import { useToast } from "../../../contexts/ToastContext";
import { MAX_UPLOAD_BYTES } from "../adminConstants";
import { normalizeGalleryData } from "../../../features/gallery/normalizeGalleryData";
import {
  ArrowDown,
  ArrowUp,
  Columns2,
  Columns3,
  FolderPlus,
  Image as ImageIcon,
  Link as LinkIcon,
  ListOrdered,
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

/* Renumbering in steps leaves room between neighbours, so a later insert does not
   have to rewrite the whole sequence. */
const ORDER_STEP = 10;

/** The order an image has inside one specific category, staged edits first. */
const resolveOrderInCategory = (image, categoryId, imageEdits) => {
  const staged = imageEdits?.[image?.id]?.categoryOrders?.[categoryId];
  if (Number.isFinite(Number(staged))) return Number(staged);
  const stored = getImageCategoryOrders(image)[categoryId];
  if (Number.isFinite(Number(stored))) return Number(stored);
  /* `image.order` is category-scoped in the API response, so it is the right
     fallback for the category the copy came from — and the only one available
     for a membership that has no explicit order yet. */
  return Number.isFinite(Number(image?.order)) ? Number(image.order) : 0;
};

const sortCategoryImages = (images, categoryId, imageEdits) =>
  [...images].sort((a, b) => {
    const orderA = resolveOrderInCategory(a, categoryId, imageEdits);
    const orderB = resolveOrderInCategory(b, categoryId, imageEdits);
    if (orderA === orderB) {
      return (a.createdAt || 0) - (b.createdAt || 0);
    }
    return orderA - orderB;
  });

const captureOrderEdits = (imageEdits) =>
  Object.entries(imageEdits).reduce((snapshot, [imageId, edits]) => {
    if (
      edits?.categoryOrders &&
      Object.keys(edits.categoryOrders).length > 0
    ) {
      snapshot[imageId] = { ...edits.categoryOrders };
    }
    return snapshot;
  }, {});

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
  const [isOrderingOpen, setIsOrderingOpen] = useState(false);
  const [previewColumns, setPreviewColumns] = useState(3);
  const [orderingBaseline, setOrderingBaseline] = useState({});
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState("");
  const [editingImageId, setEditingImageId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(IMAGE_FILTER_ALL);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isDropActive, setIsDropActive] = useState(false);
  const [dragOverId, setDragOverId] = useState("");
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

  const sortedActiveImages = useMemo(
    () => sortCategoryImages(activeImages, activeCategoryId, imageEdits),
    [activeCategoryId, activeImages, imageEdits]
  );

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

  const publishedActiveImages = useMemo(
    () =>
      sortedActiveImages.filter(
        (image) => getImageValue(image, "published") !== false
      ),
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

  const editingCategoryIds = editingValues?.categoryIds;
  /* One row per membership, each with that category's full sequence, so the
     drawer can show and set the position independently per category. Alla bilder
     comes first because it is the default tab on the public page. */
  const editingOrderRows = useMemo(() => {
    if (!editingImageId || !Array.isArray(editingCategoryIds)) return [];
    const membershipIds = [
      ...(allImagesCategoryId ? [allImagesCategoryId] : []),
      ...editingCategoryIds.filter((id) => id !== allImagesCategoryId),
    ];
    return membershipIds
      .map((categoryId) => {
        const category = categories.find((item) => item.id === categoryId);
        if (!category) return null;
        const sequence = sortCategoryImages(
          category.images || [],
          categoryId,
          imageEdits
        );
        const index = sequence.findIndex((image) => image.id === editingImageId);
        if (index === -1) return null;
        return {
          categoryId,
          name: category.name || categoryId,
          sequence,
          index,
          total: sequence.length,
        };
      })
      .filter(Boolean);
  }, [
    allImagesCategoryId,
    categories,
    editingCategoryIds,
    editingImageId,
    imageEdits,
  ]);

  const pendingImageChangesCount = useMemo(
    () =>
      Object.values(imageEdits).filter(
        (edits) => edits && Object.keys(edits).length > 0
      ).length,
    [imageEdits]
  );
  const pendingOrderChangesCount = useMemo(
    () =>
      Object.values(imageEdits).filter(
        (edits) =>
          edits?.categoryOrders &&
          Object.keys(edits.categoryOrders).length > 0
      ).length,
    [imageEdits]
  );
  const isOrderingDirty = useMemo(
    () =>
      JSON.stringify(captureOrderEdits(imageEdits)) !==
      JSON.stringify(orderingBaseline),
    [imageEdits, orderingBaseline]
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

  /* Staged orders are keyed by category: the same image can sit in position 3 in
     Loftet and position 12 in Alla bilder, and saving must not let one overwrite
     the other. */
  const stageOrderForImages = useCallback((orderedImages, categoryId) => {
    if (!categoryId) return;
    setImageEdits((prev) => {
      const next = { ...prev };
      orderedImages.forEach((image, index) => {
        const imageId = image?.id;
        if (!imageId) return;
        const nextOrder = (index + 1) * ORDER_STEP;
        const storedOrder = getImageCategoryOrders(image)[categoryId];
        const prevEntry = next[imageId] || {};
        const nextOrders = { ...(prevEntry.categoryOrders || {}) };
        if (Number.isFinite(Number(storedOrder)) && Number(storedOrder) === nextOrder) {
          delete nextOrders[categoryId];
        } else {
          nextOrders[categoryId] = nextOrder;
        }
        const updated = { ...prevEntry };
        if (Object.keys(nextOrders).length === 0) {
          delete updated.categoryOrders;
        } else {
          updated.categoryOrders = nextOrders;
        }
        if (Object.keys(updated).length === 0) {
          delete next[imageId];
        } else {
          next[imageId] = updated;
        }
      });
      return next;
    });
  }, []);

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
        const stagedCategoryOrders =
          edits.categoryOrders && typeof edits.categoryOrders === "object"
            ? edits.categoryOrders
            : {};
        /* Only the categories the image belongs to are persisted, and each keeps
           its own sequence: a staged position wins, otherwise the stored one is
           carried over untouched. `image.order` is never written into a category
           it did not come from — that value belongs to one sequence only. */
        const persistedCategoryOrders = validCategoryIds.reduce((acc, id) => {
          const staged = Number(stagedCategoryOrders[id]);
          if (Number.isFinite(staged)) {
            acc[id] = staged;
            return acc;
          }
          const stored = Number(baseCategoryOrders[id]);
          if (Number.isFinite(stored)) {
            acc[id] = stored;
          }
          return acc;
        }, {});
        // The primary category is never "Alla bilder": it drives `categoryId`
        // and primary_flag in the join table.
        const primaryCategoryId = assignedCategoryIds[0];
        const primaryOrder = Number.isFinite(Number(persistedCategoryOrders[primaryCategoryId]))
          ? Number(persistedCategoryOrders[primaryCategoryId])
          : Number.isFinite(Number(image.order))
            ? Number(image.order)
            : 0;

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

  const handleSaveOrderChanges = async () => {
    const updates = Object.entries(imageEdits)
      .filter(
        ([, edits]) =>
          edits?.categoryOrders &&
          Object.keys(edits.categoryOrders).length > 0
      )
      .map(([imageId, edits]) =>
        buildImageUpdate(imageId, { categoryOrders: edits.categoryOrders })
      )
      .filter(Boolean);

    if (updates.length === 0) {
      info("Inga ändringar i bildordningen att spara.");
      return false;
    }

    setSaving(true);
    try {
      await applyImageUpdates(updates);
      setImageEdits((prev) => {
        const next = { ...prev };
        updates.forEach(({ id }) => {
          const entry = { ...(next[id] || {}) };
          delete entry.categoryOrders;
          if (Object.keys(entry).length === 0) {
            delete next[id];
          } else {
            next[id] = entry;
          }
        });
        return next;
      });
      success(`Bildordningen sparad (${updates.length} bilder).`);
      showActionFeedback(`Sparade ordningen för ${updates.length} bilder`);
      await loadGallery();
      return true;
    } catch (err) {
      error(err?.message || "Kunde inte spara bildordningen.");
      return false;
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

  /* Moves the edited image inside one named category, leaving every other
     category's sequence untouched. `row` comes from editingOrderRows. */
  const moveImageToPosition = (row, targetIndex) => {
    const clamped = Math.max(0, Math.min(row.total - 1, targetIndex));
    if (!Number.isFinite(clamped) || clamped === row.index) return;
    const reordered = [...row.sequence];
    const [moved] = reordered.splice(row.index, 1);
    reordered.splice(clamped, 0, moved);
    stageOrderForImages(reordered, row.categoryId);
    showActionFeedback(
      `Position ${clamped + 1} i ${row.name}, spara för att publicera`
    );
  };

  const movePreviewImageToPosition = (imageId, targetPosition) => {
    const currentIndex = publishedActiveImages.findIndex(
      (image) => image.id === imageId
    );
    if (currentIndex === -1) return;
    const numericPosition = Number(targetPosition);
    if (!Number.isFinite(numericPosition)) return;
    const targetIndex = Math.max(
      0,
      Math.min(publishedActiveImages.length - 1, Math.round(numericPosition) - 1)
    );
    if (targetIndex === currentIndex) return;
    const reorderedPublished = [...publishedActiveImages];
    const [moved] = reorderedPublished.splice(currentIndex, 1);
    reorderedPublished.splice(targetIndex, 0, moved);
    let publishedIndex = 0;
    const reordered = sortedActiveImages.map((image) =>
      getImageValue(image, "published") !== false
        ? reorderedPublished[publishedIndex++]
        : image
    );
    stageOrderForImages(reordered, activeCategoryId);
    showActionFeedback(
      `Flyttade bilden till plats ${targetIndex + 1} i ${activeCategory?.name}`
    );
  };

  const handlePreviewReorder = (targetId) => {
    if (!draggingId || draggingId === targetId) return;
    const currentIndex = publishedActiveImages.findIndex(
      (image) => image.id === draggingId
    );
    const targetIndex = publishedActiveImages.findIndex(
      (image) => image.id === targetId
    );
    if (currentIndex === -1 || targetIndex === -1) return;
    const reorderedPublished = [...publishedActiveImages];
    const [moved] = reorderedPublished.splice(currentIndex, 1);
    reorderedPublished.splice(targetIndex, 0, moved);
    let publishedIndex = 0;
    const reordered = sortedActiveImages.map((image) =>
      getImageValue(image, "published") !== false
        ? reorderedPublished[publishedIndex++]
        : image
    );
    stageOrderForImages(reordered, activeCategoryId);
    showActionFeedback("Ordning ändrad i förhandsvisningen");
    setDraggingId("");
    setDragOverId("");
  };

  const openOrderingWorkspace = () => {
    setOrderingBaseline(captureOrderEdits(imageEdits));
    setIsOrderingOpen(true);
  };

  const cancelOrderingWorkspace = () => {
    setImageEdits((prev) => {
      const next = {};
      Object.entries(prev).forEach(([imageId, edits]) => {
        const preserved = { ...edits };
        delete preserved.categoryOrders;
        if (Object.keys(preserved).length > 0) {
          next[imageId] = preserved;
        }
      });
      Object.entries(orderingBaseline).forEach(([imageId, categoryOrders]) => {
        next[imageId] = {
          ...(next[imageId] || {}),
          categoryOrders: { ...categoryOrders },
        };
      });
      return next;
    });
    setDraggingId("");
    setDragOverId("");
    setIsOrderingOpen(false);
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
              <div>
                <h3>
                  {activeCategory ? activeCategory.name : "Ingen kategori vald"}
                </h3>
                <p className="admin-muted">
                  {galleryOverview.activeImageCount} bilder i vald kategori
                  {galleryOverview.selectedImageCount > 0
                    ? ` • ${galleryOverview.selectedImageCount} markerade`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-primary admin-gallery-order-launch"
                onClick={openOrderingWorkspace}
                disabled={!activeCategory || sortedActiveImages.length < 2}
              >
                <ListOrdered size={17} aria-hidden="true" />
                Ordna bilder
              </button>
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
                message="Välj en specifik kategori för att ladda upp. Använd Ordna bilder för att ändra placeringen."
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

                  return (
                    <div
                      key={imageId}
                      className={`admin-gallery-image-card ${
                        isSelected ? "is-selected" : ""
                      }`}
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

                      <div className="admin-gallery-image-actions">
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
                editingOrderRows.length > 0
                  ? editingOrderRows
                      .map((row) => `${row.name} ${row.index + 1}`)
                      .join(" · ")
                  : "Okänd"
              }
            >
              <p className="admin-muted">
                Varje kategori har en egen ordning — sätt positionen per kategori.
                Ändringen sparas med bilden.
              </p>
              {editingOrderRows.length === 0 ? (
                <p className="admin-muted">
                  Spara bilden först, så går den att positionera i sina
                  kategorier.
                </p>
              ) : (
                <ul className="admin-gallery-order-rows">
                  {editingOrderRows.map((row) => (
                    <li key={row.categoryId} className="admin-gallery-order-row">
                      <span className="admin-gallery-order-row-name">
                        {row.name}
                      </span>
                      <div className="admin-gallery-order-row-controls">
                        <input
                          className="admin-gallery-order-row-field"
                          type="number"
                          min={1}
                          max={row.total}
                          aria-label={`Position i ${row.name}`}
                          /* Uncontrolled and re-keyed on the resolved position: a
                             controlled value would restage the whole sequence on
                             every keystroke. Commit happens on blur/Enter. */
                          key={`${row.categoryId}-${row.index}`}
                          defaultValue={row.index + 1}
                          disabled={saving}
                          onBlur={(event) =>
                            moveImageToPosition(row, Number(event.target.value) - 1)
                          }
                          onKeyDown={(event) => {
                            if (event.key !== "Enter") return;
                            event.preventDefault();
                            moveImageToPosition(
                              row,
                              Number(event.currentTarget.value) - 1
                            );
                          }}
                        />
                        <span className="admin-muted">av {row.total}</span>
                        <button
                          type="button"
                          className="admin-btn-secondary admin-btn-sm"
                          onClick={() => moveImageToPosition(row, row.index - 1)}
                          disabled={saving || row.index === 0}
                          aria-label={`Flytta upp i ${row.name}`}
                        >
                          <ArrowUp size={14} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="admin-btn-secondary admin-btn-sm"
                          onClick={() => moveImageToPosition(row, row.index + 1)}
                          disabled={saving || row.index === row.total - 1}
                          aria-label={`Flytta ner i ${row.name}`}
                        >
                          <ArrowDown size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </AdminDrawerSection>
          </form>
        )}
      </AdminDrawer>
      <AdminDrawer
        open={isOrderingOpen}
        size="wide"
        title={`Ordna bilder · ${activeCategory?.name || ""}`}
        description="Dra bilderna till rätt plats eller skriv in ett positionsnummer."
        icon={<ListOrdered size={20} />}
        isDirty={isOrderingDirty}
        dirtyMessage="Du har en osparad bildordning. Vill du stänga utan att spara?"
        onClose={cancelOrderingWorkspace}
        previewOnly
        previewLabel={`Publik förhandsvisning · ${activeCategory?.name || "Galleri"}`}
        preview={
          <div className="admin-gallery-public-preview">
            <div className="admin-gallery-public-preview-browser">
              <span aria-hidden="true" />
              <span>{`${GALLERY_PUBLIC_PATH}${
                isAllImagesCategory(activeCategory)
                  ? ""
                  : `/${activeCategory?.slug || activeCategory?.id || ""}`
              }`}</span>
            </div>
            <div className="admin-gallery-public-preview-heading">
              <span>GALLERI</span>
              <h3>Bildgalleri</h3>
              <p>
                Så här visas ordningen för besökare i kategorin{" "}
                <strong>{activeCategory?.name}</strong>.
              </p>
            </div>
            <div
              className="admin-gallery-public-preview-categories"
              aria-label="Förhandsvisa kategori"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={
                    category.id === activeCategoryId ? "is-active" : ""
                  }
                  aria-pressed={category.id === activeCategoryId}
                  onClick={() => {
                    setActiveCategoryId(category.id);
                    setDraggingId("");
                    setDragOverId("");
                  }}
                >
                  <span>{category.name}</span>
                  <small>{category.images?.length || 0}</small>
                </button>
              ))}
            </div>
            <div
              className="admin-gallery-public-preview-view"
              role="group"
              aria-label="Antal kolumner i förhandsvisningen"
            >
              <span>Kolumner</span>
              <button
                type="button"
                aria-label="Visa 2 kolumner"
                aria-pressed={previewColumns === 2}
                className={previewColumns === 2 ? "is-active" : ""}
                onClick={() => setPreviewColumns(2)}
              >
                <Columns2 size={15} aria-hidden="true" />
                2
              </button>
              <button
                type="button"
                aria-label="Visa 3 kolumner"
                aria-pressed={previewColumns === 3}
                className={previewColumns === 3 ? "is-active" : ""}
                onClick={() => setPreviewColumns(3)}
              >
                <Columns3 size={15} aria-hidden="true" />
                3
              </button>
            </div>
            <div
              className={`admin-gallery-public-preview-grid is-${previewColumns}-columns`}
            >
              {publishedActiveImages.map((image, index) => (
                  <figure
                    key={image.id || image.filename || index}
                    className={`${draggingId === image.id ? "is-dragging" : ""} ${
                      dragOverId === image.id ? "is-drag-target" : ""
                    }`}
                    draggable={Boolean(image.id)}
                    aria-label={`Flytta ${getImageLabel(image)}, plats ${
                      index + 1
                    }`}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      setDraggingId(image.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId("");
                      setDragOverId("");
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDragOverId(image.id);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      handlePreviewReorder(image.id);
                    }}
                  >
                    {getImageSrc(image) ? (
                      <img
                        src={getImageSrc(image)}
                        alt={getImageLabel(image)}
                        draggable={Boolean(image.id)}
                        onDragStart={(event) => {
                          event.stopPropagation();
                          event.dataTransfer.effectAllowed = "move";
                          setDraggingId(image.id);
                        }}
                      />
                    ) : (
                      <div className="admin-gallery-image-placeholder">
                        <ImageIcon size={24} aria-hidden="true" />
                      </div>
                    )}
                    <figcaption>
                      <input
                        key={`${activeCategoryId}-${image.id}-${index}`}
                        type="number"
                        min={1}
                        max={publishedActiveImages.length}
                        defaultValue={index + 1}
                        draggable="false"
                        aria-label={`Placering för ${getImageLabel(image)} i ${activeCategory?.name}`}
                        onDragStart={(event) => event.stopPropagation()}
                        onBlur={(event) =>
                          movePreviewImageToPosition(
                            image.id,
                            event.target.value
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          movePreviewImageToPosition(
                            image.id,
                            event.currentTarget.value
                          );
                        }}
                      />
                      <span>{getImageLabel(image)}</span>
                    </figcaption>
                  </figure>
                ))}
            </div>
            {publishedActiveCount === 0 && (
              <p className="admin-gallery-public-preview-empty">
                Inga publicerade bilder i den här kategorin.
              </p>
            )}
          </div>
        }
        footer={
          <div className="admin-gallery-order-footer">
            <span>
              {pendingOrderChangesCount > 0
                ? `${pendingOrderChangesCount} bilder har en ny placering`
                : `Ordningen i ${activeCategory?.name || "kategorin"} är sparad`}
            </span>
            <div>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={cancelOrderingWorkspace}
              >
                Avbryt
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                disabled={saving || pendingOrderChangesCount === 0}
                onClick={async () => {
                  const saved = await handleSaveOrderChanges();
                  if (saved) setIsOrderingOpen(false);
                }}
              >
                {saving ? "Sparar..." : "Spara ordning"}
              </button>
            </div>
          </div>
        }
      />
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

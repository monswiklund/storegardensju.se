import { useState, useContext, useEffect, useRef } from "react";
import { ProductContext } from "../../../components/layout/ProductContext/ProductContext";
import { useToast } from "../../../contexts/ToastContext";
import { AdminService } from "../../../services/adminService";
import "./AdminCreateProduct.css";

const HELP_TEXT = {
  name: "Produktens namn som visas i butiken och på kvittot.",
  description:
    "En säljande text om produkten. Inkludera gärna mått och material.",
  price: "Priset inkl. moms i svenska kronor (SEK).",
  category: "Välj den kategori som passar bäst för filtrering i butiken.",
  stock:
    "Antal som finns i lager. När lagret är slut visas produkten som 'Såld'.",
  artist: "Namnet på personen som skapat verket.",
  image:
    "Ladda upp en tydlig bild (max 10 MB). Bilden beskärs kvadratiskt och skalas till 1600px.",
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const isObjectUrl = (value) => typeof value === "string" && value.startsWith("blob:");
const TARGET_IMAGE_SIZE = 1600;

const compressImage = async (file) => {
  if (!file || file.type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const cropSize = Math.min(bitmap.width, bitmap.height);
    const cropX = Math.max(0, Math.floor((bitmap.width - cropSize) / 2));
    const cropY = Math.max(0, Math.floor((bitmap.height - cropSize) / 2));
    const targetSize = Math.min(TARGET_IMAGE_SIZE, cropSize);

    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      bitmap,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      targetSize,
      targetSize
    );
    bitmap.close();

    const blob = await new Promise((resolve) => {
      canvas.toBlob(
        (result) => resolve(result),
        "image/webp",
        0.85
      );
    });

    if (!blob) return file;
    if (blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
      type: "image/webp",
    });
  } catch (err) {
    return file;
  }
};

export default function AdminCreateProduct({
  adminKey,
  initialData = null,
  onCancel,
  onSuccess,
}) {
  const { refetch } = useContext(ProductContext);
  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;
  const [removeImage, setRemoveImage] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Image preview state
  const [previewUrl, setPreviewUrl] = useState(initialData?.image || null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price ? (initialData.price / 100).toString() : "",
    category: initialData?.category || "keramik",
    stock: initialData?.stock || "1",
    artist: initialData?.artist || "Storegården",
    image: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price ? (initialData.price / 100).toString() : "",
        category: initialData?.category || "keramik",
        stock: initialData?.stock || "1",
        artist: initialData?.artist || "Storegården",
        image: null,
      });
      setPreviewUrl(initialData?.image || null);
      setRemoveImage(false);
      return;
    }

    setFormData({
      name: "",
      description: "",
      price: "",
      category: "keramik",
      stock: "1",
      artist: "Storegården",
      image: null,
    });
    setPreviewUrl(null);
    setRemoveImage(false);
  }, [initialData]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && isObjectUrl(previewUrl)) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const processFile = async (file, inputEl) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      error("Ogiltig filtyp. Tillåtna format: JPG, PNG, GIF, WEBP.");
      if (inputEl) inputEl.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      error("Bilden är för stor. Max 10 MB.");
      if (inputEl) inputEl.value = "";
      return;
    }

    setImageProcessing(true);
    const processedFile = await compressImage(file);
    setImageProcessing(false);

    if (processedFile.size > MAX_IMAGE_BYTES) {
      error("Den komprimerade bilden är fortfarande för stor (max 10 MB).");
      if (inputEl) inputEl.value = "";
      return;
    }

    if (previewUrl && isObjectUrl(previewUrl)) {
      URL.revokeObjectURL(previewUrl);
    }
    setRemoveImage(false);
    setFormData((prev) => ({ ...prev, image: processedFile }));

    const url = URL.createObjectURL(processedFile);
    setPreviewUrl(url);
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0], e.target);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file, fileInputRef.current);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!isEdit && !formData.image) {
      error("Du måste välja en bild!");
      setLoading(false);
      return;
    }
    if (imageProcessing) {
      error("Vänta tills bilden är färdigbehandlad.");
      setLoading(false);
      return;
    }
    const priceValue = Number.parseFloat(formData.price);
    if (Number.isNaN(priceValue)) {
      error("Ange ett giltigt pris.");
      setLoading(false);
      return;
    }
    if (priceValue < 0) {
      error("Priset kan inte vara negativt.");
      setLoading(false);
      return;
    }
    if (!Number.isInteger(priceValue)) {
      error("Priset måste vara ett heltal i SEK.");
      setLoading(false);
      return;
    }

    const stockValue = Number.parseInt(formData.stock, 10);
    if (Number.isNaN(stockValue) || stockValue < 0) {
      error("Ange ett giltigt lagersaldo (heltal >= 0).");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", priceValue.toString());
      data.append("category", formData.category);
      data.append("stock", stockValue.toString());
      data.append("artist", formData.artist);
      if (removeImage) {
        data.append("removeImage", "1");
      }
      if (formData.image) {
        data.append("image", formData.image);
      }

      info(isEdit ? "Uppdaterar produkt..." : "Laddar upp produkt...");

      if (isEdit) {
        await AdminService.updateProduct(adminKey, initialData.id, data);
      } else {
        await AdminService.createProduct(adminKey, data);
      }

      success(
        isEdit
          ? `Produkten uppdaterad${formData.name ? `: ${formData.name}` : ""}!`
          : `Produkten "${formData.name}" är skapad!`
      );

      // Reset or Close
      if (onSuccess) onSuccess();

      if (!isEdit) {
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "keramik",
          stock: "1",
          artist: "Storegården",
          image: null,
        });
        if (previewUrl && isObjectUrl(previewUrl)) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        const fileInput = document.getElementById("product-image-input");
        if (fileInput) fileInput.value = "";
      }

      // Refresh products in frontend
      if (refetch) refetch();
    } catch (err) {
      error(err.message || "Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-product">
      <div className="admin-cp-header">
        <h2>{isEdit ? "Redigera produkt" : "Skapa ny produkt"}</h2>
        <p className="admin-cp-subtitle">
          {isEdit
            ? "Uppdatera information om produkten."
            : "Lägg till nya varor i butiken. De publiceras direkt."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h3>Grunduppgifter</h3>

          <div className="form-group">
            <label htmlFor="name">Produktnamn</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
              placeholder="T.ex. Rustik Keramikvas"
              aria-describedby="product-name-help"
            />
            <small id="product-name-help" className="help-text">
              {HELP_TEXT.name}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Beskrivning</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows="4"
              placeholder="Beskriv känslan, materialet och storleken..."
              aria-describedby="product-description-help"
            />
            <small id="product-description-help" className="help-text">
              {HELP_TEXT.description}
            </small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Pris (SEK)</label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              disabled={loading}
              required
              min="0"
              step="1"
              placeholder="150"
              aria-describedby="product-price-help"
            />
            <small id="product-price-help" className="help-text">
              {HELP_TEXT.price}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="stock">Lagersaldo</label>
            <input
              id="stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              disabled={loading}
              min="0"
              step="1"
              placeholder="1"
              aria-describedby="product-stock-help"
            />
            <small id="product-stock-help" className="help-text">
              {HELP_TEXT.stock}
            </small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Kategori</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              aria-describedby="product-category-help"
            >
              <option value="keramik">Keramik</option>
              <option value="konst">Konst</option>
              <option value="textil">Textil</option>
              <option value="ovrigt">Övrigt</option>
            </select>
            <small id="product-category-help" className="help-text">
              {HELP_TEXT.category}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="artist">Konstnär / Skapare</label>
            <input
              id="artist"
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              disabled={loading}
              placeholder="Namn på skapare"
              aria-describedby="product-artist-help"
            />
            <small id="product-artist-help" className="help-text">
              {HELP_TEXT.artist}
            </small>
          </div>
        </div>

        <div className="form-section image-section">
          <h3>
            Produktbild
            {imageProcessing ? " (bearbetar...)" : ""}
          </h3>
          <div className="form-group">
            <div
              className={`file-dropzone ${dragActive ? "is-drag" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <label htmlFor="product-image-input" className="file-upload-label">
                {previewUrl ? "Byt bild" : "Välj bild"}
              </label>
              <input
                ref={fileInputRef}
                id="product-image-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!isEdit && !formData.image}
                className="file-input-hidden"
                disabled={loading}
                aria-describedby="product-image-help"
              />
              <p className="file-dropzone-hint">
                Dra & släpp en bild här, eller klicka för att välja.
              </p>
            </div>
            <small id="product-image-help" className="help-text">
              {HELP_TEXT.image}
            </small>

            {isEdit && initialData?.image && (
              <label className="admin-checkbox-label" style={{ marginTop: "0.75rem" }}>
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(event) => {
                    const nextValue = event.target.checked;
                    setRemoveImage(nextValue);
                    if (nextValue) {
                      if (previewUrl && isObjectUrl(previewUrl)) {
                        URL.revokeObjectURL(previewUrl);
                      }
                      setPreviewUrl(null);
                      setFormData((prev) => ({ ...prev, image: null }));
                    } else if (!formData.image) {
                      setPreviewUrl(initialData.image || null);
                    }
                  }}
                  disabled={loading}
                />
                <span>Ta bort befintlig bild</span>
              </label>
            )}

            {previewUrl && (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Preview" className="image-preview" />
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="save-button"
            disabled={loading || imageProcessing}
          >
            {loading || imageProcessing
              ? isEdit
                ? "Sparar..."
                : "Publicerar..."
              : isEdit
              ? "Spara ändringar"
              : "Publicera Produkt"}
          </button>
          {onCancel && (
            <button type="button" className="cancel-button" onClick={onCancel}>
              Avbryt
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

import { useState, useContext, useEffect } from "react";
import { ProductContext } from "../../../components/layout/ProductContext/ProductContext";
import { useToast } from "../../../contexts/ToastContext";
import "./AdminCreateProduct.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242";

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
    "Ladda upp en tydlig bild. Kvadratiska eller stående bilder fungerar bäst.",
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

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== initialData?.image) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
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
    if (formData.price < 0) {
      error("Priset kan inte vara negativt.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("stock", formData.stock);
      data.append("artist", formData.artist);
      if (formData.image) {
        data.append("image", formData.image);
      }

      info(isEdit ? "Uppdaterar produkt..." : "Laddar upp produkt...");

      const url = isEdit
        ? `${API_URL}/admin/products/${initialData.id}`
        : `${API_URL}/admin/products`;

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || "Kunde inte spara produkt. Kontrollera servern."
        );
      }

      await response.json();
      success(
        isEdit
          ? "Produkten uppdaterad!"
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
        setPreviewUrl(null);
        const fileInput = document.getElementById("product-image-input");
        if (fileInput) fileInput.value = "";
      }

      // Refresh products in frontend
      if (refetch) refetch();
    } catch (err) {
      console.error(err);
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
              required
              placeholder="T.ex. Rustik Keramikvas"
            />
            <small className="help-text">{HELP_TEXT.name}</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Beskrivning</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Beskriv känslan, materialet och storleken..."
            />
            <small className="help-text">{HELP_TEXT.description}</small>
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
              required
              min="0"
              placeholder="150"
            />
            <small className="help-text">{HELP_TEXT.price}</small>
          </div>

          <div className="form-group">
            <label htmlFor="stock">Lagersaldo</label>
            <input
              id="stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              placeholder="1"
            />
            <small className="help-text">{HELP_TEXT.stock}</small>
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
            >
              <option value="keramik">Keramik</option>
              <option value="konst">Konst</option>
              <option value="textil">Textil</option>
              <option value="ovrigt">Övrigt</option>
            </select>
            <small className="help-text">{HELP_TEXT.category}</small>
          </div>

          <div className="form-group">
            <label htmlFor="artist">Konstnär / Skapare</label>
            <input
              id="artist"
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              placeholder="Namn på skapare"
            />
            <small className="help-text">{HELP_TEXT.artist}</small>
          </div>
        </div>

        <div className="form-section image-section">
          <h3>Produktbild</h3>
          <div className="form-group">
            <label htmlFor="product-image-input" className="file-upload-label">
              {previewUrl ? "Byt bild" : "Välj bild"}
            </label>
            <input
              id="product-image-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={!isEdit && !formData.image}
              className="file-input-hidden"
            />
            <small className="help-text">{HELP_TEXT.image}</small>

            {previewUrl && (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Preview" className="image-preview" />
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={loading}>
            {loading
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

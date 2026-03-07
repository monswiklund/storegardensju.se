import AdminCustomers from "./AdminCustomers";
import AdminCreateProduct from "./AdminCreateProduct";
import AdminProductList from "./AdminProductList";
import AdminGallery from "./AdminGallery";
import AdminEvents from "./AdminEvents";
import AdminCoupons from "./AdminCoupons";
import AdminPreviewPanel from "./AdminPreviewPanel";

export default function AdminFeatureSections({
  showCustomersSection,
  showProductsSection,
  showGallerySection,
  showEventsSection,
  showCouponsSection,
  orders,
  listLoading,
  isPreview,
  adminKey,
  onLogin,
  productViewMode,
  setProductViewMode,
  editingProduct,
  setEditingProduct,
}) {
  return (
    <>
      {showCustomersSection && (
        <AdminCustomers orders={orders} loading={listLoading} />
      )}

      {showProductsSection && (
        <>
          {isPreview && (
            <AdminPreviewPanel
              message="Demo-läge: logga in för att hantera produkter."
              onLogin={onLogin}
            />
          )}

          {!isPreview && productViewMode === "list" && (
            <div className="admin-section">
              <div className="admin-section-actions">
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductViewMode("create");
                  }}
                >
                  + Skapa ny produkt
                </button>
              </div>
              <AdminProductList
                adminKey={adminKey}
                onEdit={(product) => {
                  setEditingProduct(product);
                  setProductViewMode("edit");
                }}
              />
            </div>
          )}

          {!isPreview &&
            (productViewMode === "create" || productViewMode === "edit") && (
              <AdminCreateProduct
                adminKey={adminKey}
                initialData={productViewMode === "edit" ? editingProduct : null}
                onCancel={() => {
                  setEditingProduct(null);
                  setProductViewMode("list");
                }}
                onSuccess={() => {
                  setEditingProduct(null);
                  setProductViewMode("list");
                }}
              />
            )}
        </>
      )}

      {showGallerySection && (
        <>
          {isPreview ? (
            <AdminPreviewPanel
              message="Demo-läge: logga in för att hantera galleriet."
              onLogin={onLogin}
            />
          ) : (
            <AdminGallery adminKey={adminKey} />
          )}
        </>
      )}

      {showEventsSection && (
        <>
          {isPreview ? (
            <AdminPreviewPanel
              message="Demo-läge: logga in för att hantera evenemang."
              onLogin={onLogin}
            />
          ) : (
            <AdminEvents adminKey={adminKey} />
          )}
        </>
      )}

      {showCouponsSection && (
        <>
          {isPreview ? (
            <AdminPreviewPanel
              message="Demo-läge: logga in för att hantera rabatter."
              onLogin={onLogin}
            />
          ) : (
            <AdminCoupons adminKey={adminKey} />
          )}
        </>
      )}
    </>
  );
}

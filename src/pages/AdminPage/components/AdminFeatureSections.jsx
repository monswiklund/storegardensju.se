import AdminCustomers from "./AdminCustomers";
import AdminCreateProduct from "./AdminCreateProduct";
import AdminProductList from "./AdminProductList";
import AdminGallery from "./AdminGallery";
import AdminEvents from "./AdminEvents";
import AdminYoga from "./AdminYoga";
import AdminCoupons from "./AdminCoupons";
import AdminPreviewPanel from "./AdminPreviewPanel";

export default function AdminFeatureSections({
  showCustomersSection,
  showProductsSection,
  showYogaSection,
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

          {!isPreview && (
            <div className="admin-workspace admin-products-workspace">
              <div className="admin-workspace-header">
                <div>
                  <p className="admin-workspace-kicker">Butik</p>
                  <h2>Produkter</h2>
                  <p>Hantera sortiment, lager och publicering.</p>
                </div>
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

          {!isPreview && (
            <AdminCreateProduct
              adminKey={adminKey}
              open={productViewMode !== "list"}
              /* editingProduct is set (edit) or cleared (create) by the openers
                 above and deliberately kept while the drawer animates out, so
                 the form does not visibly reset mid-transition. */
              initialData={editingProduct}
              onCancel={() => setProductViewMode("list")}
              onSuccess={() => setProductViewMode("list")}
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

      {showYogaSection && (
        <>
          {isPreview ? (
            <AdminPreviewPanel
              message="Demo-läge: logga in för att hantera yogapass."
              onLogin={onLogin}
            />
          ) : (
            <AdminYoga adminKey={adminKey} />
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

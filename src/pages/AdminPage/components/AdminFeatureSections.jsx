import AdminCustomers from "./AdminCustomers";
import AdminCoupons from "./AdminCoupons";
import AdminPreviewPanel from "./AdminPreviewPanel";

export default function AdminFeatureSections({
  showCustomersSection,
  showCouponsSection,
  orders,
  listLoading,
  isPreview,
  adminKey,
  onLogin,
}) {
  return (
    <>
      {showCustomersSection && (
        <AdminCustomers orders={orders} loading={listLoading} />
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

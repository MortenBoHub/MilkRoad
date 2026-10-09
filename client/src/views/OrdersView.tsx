import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { BackToProducts } from "@/components/BackToProducts";
import { Header } from "@/components/Header";
import { OrdersList } from "@/components/OrdersList";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";

/**
 * VIEWS layer: the signed-in user's own listings ("Orders"), with delete.
 *
 * Route guard mirrors CreateListingView: an anonymous visitor is bounced to
 * /login. Deleting happens in the hook; the list updates locally on success.
 */
export function OrdersView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orders = useOrders();

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="page">
      <Header />
      {/* No category rail here, so the single-column layout variant. */}
      <div className="page__body page__body--single">
        <main className="page__main">
          <div className="page__head">
            <h1 className="page__title">Your listings</h1>
            <Link className="page__cta" to="/sell">
              + List an item
            </Link>
          </div>

          {orders.deleteError ? (
            <p className="form__error" role="alert">
              {orders.deleteError}
            </p>
          ) : null}

          {orders.status === "success" ? (
            <OrdersList
              listings={orders.listings}
              deletingId={orders.deletingId}
              onDelete={orders.deleteListing}
            />
          ) : (
            <StatusMessage status={orders.status} error={orders.error} />
          )}

          <BackToProducts />
        </main>
      </div>
    </div>
  );
}

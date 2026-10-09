import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminCategoryManager } from "@/components/AdminCategoryManager";
import { BackToProducts } from "@/components/BackToProducts";
import { Header } from "@/components/Header";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAuth } from "@/hooks/useAuth";

/**
 * VIEWS layer: the admin's category manager.
 *
 * Route guard: only a signed-in admin may see this, so anyone else is bounced to
 * the marketplace. Assembles the admin hook with the presentational manager.
 */
export function AdminView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const admin = useAdminCategories();

  useEffect(() => {
    if (!user?.isAdmin) navigate("/", { replace: true });
  }, [user, navigate]);

  if (!user?.isAdmin) return null;

  return (
    <div className="page">
      <Header />
      <div className="page__body page__body--single">
        <main className="page__main">
          <div className="page__head">
            <h1 className="page__title">Categories</h1>
          </div>

          <p className="page__note">
            Signed in as <strong>{user.userName}</strong>. Add, rename, hide or
            remove the categories buyers browse and sellers pick from.
          </p>

          <AdminCategoryManager
            categories={admin.categories}
            status={admin.status}
            error={admin.error}
            actionError={admin.actionError}
            busy={admin.busy}
            draft={admin.draft}
            editing={admin.editing}
            onChangeDraft={admin.changeDraft}
            onSubmitDraft={admin.submitDraft}
            onStartEdit={admin.startEdit}
            onChangeEdit={admin.changeEdit}
            onSubmitEdit={admin.submitEdit}
            onCancelEdit={admin.cancelEdit}
            onDelete={admin.remove}
          />

          <BackToProducts />
        </main>
      </div>
    </div>
  );
}
